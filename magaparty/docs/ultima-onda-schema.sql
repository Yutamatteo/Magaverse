-- ============================================================
-- ULTIMA ONDA — schema Supabase (prenotazioni + QR d'ingresso monouso)
-- Evento speciale di chiusura stagione, domenica 13 settembre.
-- Esegui questo script per intero nel SQL Editor del progetto
-- Supabase già usato per MagaCard/Marea/Battigia (stessi account
-- staff, stessa infrastruttura). È idempotente.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 1. Tabella prenotazioni
-- ============================================================
create table if not exists ultima_onda_prenotazioni (
  id uuid primary key default gen_random_uuid(),
  data_evento date not null default '2026-09-13',
  nome_capogruppo text not null,
  telefono text not null,
  instagram text,
  chi_ti_ha_invitato text not null,              -- es. "Nome", "Nessuno", "Social [Quale]", "Sito Web"
  sesso text not null
    check (sesso in ('uomo', 'donna', 'altro')),
  sesso_altro text,                              -- specifica libera, solo se sesso = 'altro'
  email text not null,
  interesse_sup boolean not null default false,  -- vuole info per lezione/noleggio SUP (Adventure Lab & Next)
  qr_token text unique not null default replace(gen_random_uuid()::text, '-', ''),
  stato text not null default 'confermata'
    check (stato in ('confermata', 'usato', 'annullata')),
  used_at timestamptz,
  consenso_privacy boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_uo_qr_token on ultima_onda_prenotazioni (qr_token);
create index if not exists idx_uo_data_evento on ultima_onda_prenotazioni (data_evento);

alter table ultima_onda_prenotazioni enable row level security;

-- Il pubblico può SOLO creare una prenotazione (nessuna lettura/scrittura diretta di stato/qr)
drop policy if exists "pubblico crea prenotazione ultima onda" on ultima_onda_prenotazioni;
create policy "pubblico crea prenotazione ultima onda"
  on ultima_onda_prenotazioni for insert
  to anon
  with check (
    stato = 'confermata'
    and used_at is null
    and consenso_privacy = true
  );

-- ============================================================
-- 2. Ruolo utente (riusa la stessa funzione già presente nel
-- progetto per MagaCard/Marea/Battigia: create or replace è
-- idempotente, nessun problema se esiste già)
-- ============================================================
create or replace function ruolo_utente()
returns text as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'ruolo', '');
$$ language sql stable;

-- Staff ingresso (ruolo 'ingresso', più admin/superadmin) può leggere
drop policy if exists "staff legge prenotazioni ultima onda" on ultima_onda_prenotazioni;
create policy "staff legge prenotazioni ultima onda"
  on ultima_onda_prenotazioni for select
  to authenticated
  using (ruolo_utente() in ('ingresso', 'admin', 'superadmin'));

-- ============================================================
-- 3. Funzione scanner ingresso — valida e consuma il QR (1 sola volta)
-- Stesso ruolo 'ingresso' usato per MagaCard e Marea: un solo
-- account/accesso staff per tutti i format.
-- ============================================================
create or replace function valida_ingresso_ultima_onda(p_qr_token text)
returns table(
  esito text,
  nome_capogruppo text,
  chi_ti_ha_invitato text,
  interesse_sup boolean,
  data_evento date
) as $$
declare
  v_id uuid;
  v_stato text;
begin
  if ruolo_utente() not in ('ingresso', 'admin', 'superadmin') then
    return query select 'non_autorizzato'::text, null::text, null::text, null::boolean, null::date;
    return;
  end if;

  select id, stato into v_id, v_stato
    from ultima_onda_prenotazioni
    where qr_token = p_qr_token;

  if v_id is null then
    return query select 'non_trovato'::text, null::text, null::text, null::boolean, null::date;
    return;
  end if;

  if v_stato = 'usato' then
    return query
      select 'gia_usato'::text, r.nome_capogruppo, r.chi_ti_ha_invitato, r.interesse_sup, r.data_evento
      from ultima_onda_prenotazioni r where r.id = v_id;
    return;
  end if;

  if v_stato = 'annullata' then
    return query select 'annullata'::text, null::text, null::text, null::boolean, null::date;
    return;
  end if;

  update ultima_onda_prenotazioni
    set stato = 'usato', used_at = now()
    where id = v_id;

  return query
    select 'ok'::text, r.nome_capogruppo, r.chi_ti_ha_invitato, r.interesse_sup, r.data_evento
    from ultima_onda_prenotazioni r where r.id = v_id;
end;
$$ language plpgsql security definer;

revoke all on function valida_ingresso_ultima_onda(text) from public;
grant execute on function valida_ingresso_ultima_onda(text) to authenticated;

-- ============================================================
-- 4. Contatore posti (facoltativo). Legge solo un conteggio,
-- niente dati personali: sicuro da esporre come RPC pubblica.
-- ============================================================
create or replace function conteggio_ultima_onda(p_data date)
returns table(totale_prenotazioni bigint) as $$
  select count(*) from ultima_onda_prenotazioni
  where data_evento = p_data and stato != 'annullata';
$$ language sql security definer stable;

revoke all on function conteggio_ultima_onda(date) from public;
grant execute on function conteggio_ultima_onda(date) to anon, authenticated;

-- ============================================================
-- 5. Accesso staff — UNICO per tutti i format (MagaCard + Marea +
-- Battigia + Ultima Onda). Non serve creare un ruolo dedicato:
-- chi ha già 'ingresso' (o 'admin'/'superadmin') scansiona in automatico
-- anche i QR d'ingresso di Ultima Onda, dalla stessa pagina staff
-- (/magacard/staff/).
--
-- Se non hai ancora nessun account con ruolo 'ingresso', crealo da
-- Authentication > Users e poi:
-- ============================================================
-- update auth.users set raw_user_meta_data = raw_user_meta_data || '{"ruolo":"ingresso"}'::jsonb
--   where email = 'ingresso@magaverse.it';
