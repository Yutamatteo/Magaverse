-- ============================================================
-- BATTIGIA — schema Supabase (prenotazioni + QR d'ingresso monouso)
-- Esegui questo script per intero nel SQL Editor del tuo progetto
-- Supabase (lo stesso progetto già usato per MagaCard e Marea).
-- È idempotente.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 1. Tabella prenotazioni
-- ============================================================
create table if not exists battigia_prenotazioni (
  id uuid primary key default gen_random_uuid(),
  data_evento date not null,                    -- il mercoledì a cui si riferisce la prenotazione
  nome_capogruppo text not null,
  telefono text not null,
  instagram text,
  chi_ti_ha_invitato text not null,              -- es. "Nome", "Nessuno", "Social [Quale]", "Sito Web"
  sesso text not null
    check (sesso in ('uomo', 'donna', 'altro')),
  sesso_altro text,                              -- specifica libera, solo se sesso = 'altro'
  email text not null,
  opzione text not null
    check (opzione in ('base', 'tavolo')),
  -- base   = Ingresso gratuito, lista obbligatoria
  -- tavolo = Tavolo gratuito, su richiesta (richiede numero_persone)
  numero_persone integer,
  qr_token text unique not null default replace(gen_random_uuid()::text, '-', ''),
  stato text not null default 'confermata'
    check (stato in ('confermata', 'usato', 'annullata')),
  used_at timestamptz,
  consenso_privacy boolean not null default false,
  created_at timestamptz not null default now(),

  constraint numero_persone_richiesto_per_tavolo
    check (
      (opzione = 'tavolo' and numero_persone is not null and numero_persone > 0)
      or (opzione = 'base')
    )
);

create index if not exists idx_battigia_qr_token on battigia_prenotazioni (qr_token);
create index if not exists idx_battigia_data_evento on battigia_prenotazioni (data_evento);

alter table battigia_prenotazioni enable row level security;

-- Il pubblico può SOLO creare una prenotazione (nessuna lettura/scrittura diretta di stato/qr)
drop policy if exists "pubblico crea prenotazione battigia" on battigia_prenotazioni;
create policy "pubblico crea prenotazione battigia"
  on battigia_prenotazioni for insert
  to anon
  with check (
    stato = 'confermata'
    and used_at is null
    and consenso_privacy = true
  );

-- ============================================================
-- 2. Ruolo utente (riusa la stessa funzione di MagaCard/Marea se già
-- presente nel progetto: create or replace è idempotente)
-- ============================================================
create or replace function ruolo_utente()
returns text as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'ruolo', '');
$$ language sql stable;

-- Staff ingresso (ruolo 'ingresso', più admin/superadmin) può leggere
drop policy if exists "staff legge prenotazioni battigia" on battigia_prenotazioni;
create policy "staff legge prenotazioni battigia"
  on battigia_prenotazioni for select
  to public
  using (ruolo_utente() in ('ingresso', 'admin', 'superadmin'));

-- ============================================================
-- 3. Funzione scanner ingresso — valida e consuma il QR (1 sola volta)
-- Stesso ruolo 'ingresso' usato per MagaCard e Marea: un solo
-- account/accesso staff per tutti i format.
-- ============================================================
create or replace function valida_ingresso_battigia(p_qr_token text)
returns table(
  esito text,
  nome_capogruppo text,
  chi_ti_ha_invitato text,
  opzione text,
  numero_persone integer,
  data_evento date
) as $$
declare
  v_id uuid;
  v_stato text;
begin
  if ruolo_utente() not in ('ingresso', 'admin', 'superadmin') then
    return query select 'non_autorizzato'::text, null::text, null::text, null::text, null::integer, null::date;
    return;
  end if;

  select id, stato into v_id, v_stato
    from battigia_prenotazioni
    where qr_token = p_qr_token;

  if v_id is null then
    return query select 'non_trovato'::text, null::text, null::text, null::text, null::integer, null::date;
    return;
  end if;

  if v_stato = 'usato' then
    return query
      select 'gia_usato'::text, r.nome_capogruppo, r.chi_ti_ha_invitato, r.opzione, r.numero_persone, r.data_evento
      from battigia_prenotazioni r where r.id = v_id;
    return;
  end if;

  if v_stato = 'annullata' then
    return query select 'annullata'::text, null::text, null::text, null::text, null::integer, null::date;
    return;
  end if;

  update battigia_prenotazioni
    set stato = 'usato', used_at = now()
    where id = v_id;

  return query
    select 'ok'::text, r.nome_capogruppo, r.chi_ti_ha_invitato, r.opzione, r.numero_persone, r.data_evento
    from battigia_prenotazioni r where r.id = v_id;
end;
$$ language plpgsql security definer;

revoke all on function valida_ingresso_battigia(text) from public;
grant execute on function valida_ingresso_battigia(text) to authenticated;

-- ============================================================
-- 4. Contatore prenotazioni (facoltativo). Legge solo un conteggio,
-- niente dati personali: sicuro da esporre come RPC pubblica.
-- ============================================================
create or replace function conteggio_battigia(p_data date)
returns table(totale_prenotazioni bigint) as $$
  select count(*) from battigia_prenotazioni
  where data_evento = p_data and stato != 'annullata';
$$ language sql security definer stable;

revoke all on function conteggio_battigia(date) from public;
grant execute on function conteggio_battigia(date) to anon, authenticated;

-- ============================================================
-- 5. Accesso staff — UNICO per tutti i format (MagaCard + Marea +
-- Battigia). Chi ha già il ruolo 'ingresso' (o 'admin'/'superadmin')
-- può scansionare automaticamente anche i QR di Battigia, dalla
-- stessa pagina staff (/magacard/staff/).
-- ============================================================

-- ============================================================
-- 6. Manutenzione opzionale — richiede estensione pg_cron
-- ============================================================
-- Segna come "annullata" (scaduta) qualunque prenotazione non usata
-- il giovedì mattina dopo l'evento, per tenere la tabella pulita.
-- select cron.schedule(
--   'scadi-prenotazioni-battigia',
--   '0 6 * * 4',
--   $$ update battigia_prenotazioni
--      set stato = 'annullata'
--      where stato = 'confermata' and data_evento < current_date $$
-- );
