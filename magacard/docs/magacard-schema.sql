-- MagaCard — schema Supabase
-- Esegui questo script nel SQL Editor del tuo progetto Supabase

create extension if not exists pgcrypto;

create table if not exists magacard_richieste (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cognome text not null,
  telefono text not null,
  email text not null,
  stato text not null default 'richiesta'
    check (stato in ('richiesta', 'attiva', 'scaduta', 'rifiutata')),
  card_code text unique,
  punti_totali int not null default 0,
  timbri int not null default 0,
  consenso_privacy boolean not null default false,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

alter table magacard_richieste enable row level security;

-- Il pubblico può SOLO creare una richiesta, con valori di default sicuri.
-- Non può leggere né modificare nulla tramite questa policy.
drop policy if exists "pubblico crea richiesta" on magacard_richieste;
create policy "pubblico crea richiesta"
  on magacard_richieste for insert
  to anon
  with check (
    stato = 'richiesta'
    and card_code is null
    and punti_totali = 0
    and timbri = 0
    and consenso_privacy = true
  );

-- Lo staff (utenti autenticati, creati a mano da te in Supabase Auth)
-- può leggere e aggiornare tutte le richieste.
drop policy if exists "staff legge tutto" on magacard_richieste;
create policy "staff legge tutto"
  on magacard_richieste for select
  to authenticated
  using (true);

drop policy if exists "staff aggiorna tutto" on magacard_richieste;
create policy "staff aggiorna tutto"
  on magacard_richieste for update
  to authenticated
  using (true);

-- Quando lo staff porta lo stato a 'attiva', generiamo in automatico
-- un card_code univoco e registriamo il momento della conferma.
create or replace function genera_card_code()
returns trigger as $$
begin
  if new.stato = 'attiva' and new.card_code is null then
    new.card_code := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 10));
    new.confirmed_at := now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_genera_card_code on magacard_richieste;
create trigger trg_genera_card_code
  before update on magacard_richieste
  for each row execute function genera_card_code();

-- Vista pubblica: espone solo i dati necessari a mostrare la card
-- (niente telefono o email), leggibile da chiunque conosca il card_code.
create or replace view magacard_pubblica as
  select nome, cognome, card_code, punti_totali, timbri, stato
  from magacard_richieste
  where card_code is not null;

grant select on magacard_pubblica to anon;

-- Opzionale: fai scadere automaticamente le richieste non confermate
-- dopo 30 giorni. Richiede l'estensione pg_cron (attivabile dal
-- pannello Database > Extensions di Supabase).
-- select cron.schedule(
--   'scadi-richieste-magacard',
--   '0 3 * * *',
--   $$ update magacard_richieste
--      set stato = 'scaduta'
--      where stato = 'richiesta' and created_at < now() - interval '30 days' $$
-- );
