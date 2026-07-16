-- ============================================================
-- MAREA — schema Supabase (prenotazioni + QR d'ingresso monouso)
-- Esegui questo script per intero nel SQL Editor del tuo progetto
-- Supabase (lo stesso progetto già usato per MagaCard, se vuoi
-- riusare gli account staff esistenti). È idempotente.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- MIGRAZIONE (solo se hai già eseguito una versione precedente
-- di questo schema, con la colonna "composizione" invece di
-- "chi_ti_ha_invitato"/"sesso"). Esegui queste righe UNA VOLTA
-- prima del resto dello script, poi ignora: il resto è idempotente.
-- ============================================================
-- alter table marea_prenotazioni rename column composizione to chi_ti_ha_invitato;
-- alter table marea_prenotazioni add column if not exists sesso text;
-- alter table marea_prenotazioni add column if not exists sesso_altro text;
-- update marea_prenotazioni set sesso = 'altro' where sesso is null;
-- alter table marea_prenotazioni alter column sesso set not null;

-- ============================================================
-- 1. Tabella prenotazioni
-- ============================================================
create table if not exists marea_prenotazioni (
  id uuid primary key default gen_random_uuid(),
  data_evento date not null,                    -- la domenica a cui si riferisce la prenotazione
  nome_capogruppo text not null,
  telefono text not null,
  instagram text,
  chi_ti_ha_invitato text not null,              -- es. "Nome", "Nessuno", "Social [Quale]", "Sito Web"
  sesso text not null
    check (sesso in ('uomo', 'donna', 'altro')),
  sesso_altro text,                              -- specifica libera, solo se sesso = 'altro'
  email text not null,
  opzione text not null
    check (opzione in ('promo', 'lettino', 'base')),
  -- promo  = 10€ Lettino + Drink (salta fila)
  -- lettino = 6€ Solo Lettino
  -- base   = Ingresso gratuito, lista obbligatoria
  qr_token text unique not null default replace(gen_random_uuid()::text, '-', ''),
  stato text not null default 'confermata'
    check (stato in ('confermata', 'usato', 'annullata')),
  used_at timestamptz,
  consenso_privacy boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_marea_qr_token on marea_prenotazioni (qr_token);
create index if not exists idx_marea_data_evento on marea_prenotazioni (data_evento);

alter table marea_prenotazioni enable row level security;

-- Il pubblico può SOLO creare una prenotazione (nessuna lettura/scrittura diretta di stato/qr)
drop policy if exists "pubblico crea prenotazione marea" on marea_prenotazioni;
create policy "pubblico crea prenotazione marea"
  on marea_prenotazioni for insert
  to anon
  with check (
    stato = 'confermata'
    and used_at is null
    and consenso_privacy = true
  );

-- ============================================================
-- 2. Ruolo utente (riusa la stessa funzione di MagaCard se già
-- presente nel progetto: create or replace è idempotente)
-- ============================================================
create or replace function ruolo_utente()
returns text as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'ruolo', '');
$$ language sql stable;

-- Staff ingresso Marea (ruolo 'marea', più admin/superadmin) può leggere
drop policy if exists "staff legge prenotazioni marea" on marea_prenotazioni;
create policy "staff legge prenotazioni marea"
  on marea_prenotazioni for select
  to authenticated
  using (ruolo_utente() in ('marea', 'admin', 'superadmin'));

-- ============================================================
-- 3. Funzione scanner ingresso — valida e consuma il QR (1 sola volta)
-- ============================================================
create or replace function valida_ingresso_marea(p_qr_token text)
returns table(
  esito text,
  nome_capogruppo text,
  chi_ti_ha_invitato text,
  opzione text,
  data_evento date
) as $$
declare
  v_id uuid;
  v_stato text;
begin
  if ruolo_utente() not in ('marea', 'admin', 'superadmin') then
    return query select 'non_autorizzato'::text, null::text, null::text, null::text, null::date;
    return;
  end if;

  select id, stato into v_id, v_stato
    from marea_prenotazioni
    where qr_token = p_qr_token;

  if v_id is null then
    return query select 'non_trovato'::text, null::text, null::text, null::text, null::date;
    return;
  end if;

  if v_stato = 'usato' then
    return query
      select 'gia_usato'::text, r.nome_capogruppo, r.chi_ti_ha_invitato, r.opzione, r.data_evento
      from marea_prenotazioni r where r.id = v_id;
    return;
  end if;

  if v_stato = 'annullata' then
    return query select 'annullata'::text, null::text, null::text, null::text, null::date;
    return;
  end if;

  update marea_prenotazioni
    set stato = 'usato', used_at = now()
    where id = v_id;

  return query
    select 'ok'::text, r.nome_capogruppo, r.chi_ti_ha_invitato, r.opzione, r.data_evento
    from marea_prenotazioni r where r.id = v_id;
end;
$$ language plpgsql security definer;

revoke all on function valida_ingresso_marea(text) from public;
grant execute on function valida_ingresso_marea(text) to authenticated;

-- ============================================================
-- 4. Contatore posti (facoltativo ma consigliato: mostra "numero
-- chiuso" reale invece che finto). Legge solo un conteggio, niente
-- dati personali: sicuro da esporre come RPC pubblica.
-- ============================================================
create or replace function conteggio_marea(p_data date)
returns table(totale_prenotazioni bigint) as $$
  select count(*) from marea_prenotazioni
  where data_evento = p_data and stato != 'annullata';
$$ language sql security definer stable;

revoke all on function conteggio_marea(date) from public;
grant execute on function conteggio_marea(date) to anon, authenticated;

-- ============================================================
-- 5. Assegnazione ruolo staff ingresso Marea
-- Crea prima l'account da Authentication > Users, poi:
-- ============================================================
-- update auth.users set raw_user_meta_data = raw_user_meta_data || '{"ruolo":"marea"}'::jsonb
--   where email = 'ingresso.marea@magaverse.it';

-- ============================================================
-- 6. Manutenzione opzionale — richiede estensione pg_cron
-- ============================================================
-- Segna come "annullata" (scaduta) qualunque prenotazione non usata
-- il lunedì mattina dopo l'evento, per tenere la tabella pulita.
-- select cron.schedule(
--   'scadi-prenotazioni-marea',
--   '0 6 * * 1',
--   $$ update marea_prenotazioni
--      set stato = 'annullata'
--      where stato = 'confermata' and data_evento < current_date $$
-- );
