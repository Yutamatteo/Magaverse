-- ============================================================
-- MagaCard — schema completo Supabase
-- Esegui questo script per intero nel SQL Editor del tuo progetto.
-- È scritto per essere idempotente: puoi rilanciarlo anche su un
-- progetto dove hai già eseguito una versione precedente.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 1. Tabella principale delle card
-- ============================================================
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
  livello int not null default 1,
  consenso_privacy boolean not null default false,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

alter table magacard_richieste enable row level security;

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

-- ============================================================
-- 2. Livelli e premi
-- ============================================================
create table if not exists magacard_livelli (
  livello int primary key,
  timbri_richiesti int not null
);

insert into magacard_livelli (livello, timbri_richiesti) values
  (1, 5),
  (2, 7),
  (3, 10)
on conflict (livello) do nothing;

create table if not exists magacard_premi (
  id uuid primary key default gen_random_uuid(),
  tessera_id uuid not null references magacard_richieste(id) on delete cascade,
  livello_raggiunto int not null,
  codice_premio text unique not null,
  stato text not null default 'da_riscattare' check (stato in ('da_riscattare', 'riscattato')),
  creato_il timestamptz not null default now(),
  riscattato_il timestamptz
);

alter table magacard_premi enable row level security;

create or replace function verifica_livello()
returns trigger as $$
declare
  soglia int;
  nuovo_codice text;
begin
  select timbri_richiesti into soglia from magacard_livelli where livello = new.livello;
  if soglia is null then
    soglia := 5;
  end if;

  if new.timbri >= soglia then
    nuovo_codice := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 10));

    insert into magacard_premi (tessera_id, livello_raggiunto, codice_premio)
    values (new.id, new.livello, nuovo_codice);

    new.timbri := new.timbri - soglia;
    new.livello := new.livello + 1;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_verifica_livello on magacard_richieste;
create trigger trg_verifica_livello
  before update of timbri on magacard_richieste
  for each row execute function verifica_livello();

-- ============================================================
-- 3. Registro timbri giornalieri (un timbro al giorno per card)
-- ============================================================
create table if not exists magacard_timbri_log (
  id uuid primary key default gen_random_uuid(),
  tessera_id uuid not null references magacard_richieste(id) on delete cascade,
  giorno date not null default current_date,
  creato_il timestamptz not null default now(),
  unique (tessera_id, giorno)
);

alter table magacard_timbri_log enable row level security;

-- ============================================================
-- 4. Viste pubbliche (nessun dato sensibile: niente telefono o email)
-- ============================================================
create or replace view magacard_pubblica as
  select nome, cognome, card_code, punti_totali, timbri, livello, stato
  from magacard_richieste
  where card_code is not null;

grant select on magacard_pubblica to anon;

create or replace view magacard_premi_pubblica as
  select p.codice_premio, p.livello_raggiunto, p.stato, p.creato_il, r.card_code
  from magacard_premi p
  join magacard_richieste r on r.id = p.tessera_id;

grant select on magacard_premi_pubblica to anon;

-- ============================================================
-- 5. Ruoli (bar, ingresso, admin, superadmin)
-- ============================================================
create or replace function ruolo_utente()
returns text as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'ruolo', '');
$$ language sql stable;

drop policy if exists "staff legge tutto" on magacard_richieste;
drop policy if exists "staff aggiorna tutto" on magacard_richieste;
drop policy if exists "admin legge tutto" on magacard_richieste;
drop policy if exists "admin aggiorna tutto" on magacard_richieste;

create policy "admin legge tutto"
  on magacard_richieste for select
  to authenticated
  using (ruolo_utente() in ('admin', 'superadmin'));

create policy "admin aggiorna tutto"
  on magacard_richieste for update
  to authenticated
  using (ruolo_utente() in ('admin', 'superadmin'));

drop policy if exists "staff legge premi" on magacard_premi;
drop policy if exists "staff crea premi" on magacard_premi;
drop policy if exists "staff aggiorna premi" on magacard_premi;
drop policy if exists "admin legge premi" on magacard_premi;
drop policy if exists "admin aggiorna premi" on magacard_premi;

create policy "admin legge premi"
  on magacard_premi for select
  to authenticated
  using (ruolo_utente() in ('admin', 'superadmin'));

create policy "admin aggiorna premi"
  on magacard_premi for update
  to authenticated
  using (ruolo_utente() in ('admin', 'superadmin'));

drop policy if exists "staff legge livelli" on magacard_livelli;
drop policy if exists "superadmin modifica livelli" on magacard_livelli;

create policy "staff legge livelli"
  on magacard_livelli for select
  to authenticated
  using (true);

create policy "superadmin modifica livelli"
  on magacard_livelli for all
  to authenticated
  using (ruolo_utente() = 'superadmin')
  with check (ruolo_utente() = 'superadmin');

drop policy if exists "staff legge log timbri" on magacard_timbri_log;
drop policy if exists "staff crea log timbri" on magacard_timbri_log;
drop policy if exists "admin legge log timbri" on magacard_timbri_log;

create policy "admin legge log timbri"
  on magacard_timbri_log for select
  to authenticated
  using (ruolo_utente() in ('admin', 'superadmin'));

-- ============================================================
-- 6. Funzioni per lo scanner (bar / ingresso)
-- ============================================================
create or replace function cerca_card(p_card_code text)
returns table(nome text, cognome text, punti_totali int, timbri int, livello int, stato text) as $$
  select nome, cognome, punti_totali, timbri, livello, stato
  from magacard_richieste
  where card_code = p_card_code;
$$ language sql security definer;

revoke all on function cerca_card(text) from public;
grant execute on function cerca_card(text) to authenticated;

create or replace function aggiungi_timbro(p_card_code text)
returns table(esito text, timbri int, livello int) as $$
declare
  v_id uuid;
  v_timbri int;
  v_livello int;
begin
  if ruolo_utente() not in ('ingresso', 'admin', 'superadmin') then
    return query select 'non_autorizzato'::text, null::int, null::int;
    return;
  end if;

  select id into v_id from magacard_richieste
    where card_code = p_card_code and stato = 'attiva';

  if v_id is null then
    return query select 'card_non_trovata'::text, null::int, null::int;
    return;
  end if;

  begin
    insert into magacard_timbri_log (tessera_id) values (v_id);
  exception when unique_violation then
    return query select 'gia_timbrato_oggi'::text, null::int, null::int;
    return;
  end;

  update magacard_richieste
    set timbri = timbri + 1
    where id = v_id
    returning timbri, livello into v_timbri, v_livello;

  return query select 'ok'::text, v_timbri, v_livello;
end;
$$ language plpgsql security definer;

revoke all on function aggiungi_timbro(text) from public;
grant execute on function aggiungi_timbro(text) to authenticated;

create or replace function aggiungi_punti(p_card_code text, p_punti int)
returns table(esito text, punti_totali int) as $$
declare
  v_id uuid;
  v_punti int;
begin
  if ruolo_utente() not in ('bar', 'admin', 'superadmin') then
    return query select 'non_autorizzato'::text, null::int;
    return;
  end if;

  if p_punti is null or p_punti <= 0 or p_punti > 500 then
    return query select 'valore_non_valido'::text, null::int;
    return;
  end if;

  select id into v_id from magacard_richieste
    where card_code = p_card_code and stato = 'attiva';

  if v_id is null then
    return query select 'card_non_trovata'::text, null::int;
    return;
  end if;

  update magacard_richieste
    set punti_totali = punti_totali + p_punti
    where id = v_id
    returning punti_totali into v_punti;

  return query select 'ok'::text, v_punti;
end;
$$ language plpgsql security definer;

revoke all on function aggiungi_punti(text, int) from public;
grant execute on function aggiungi_punti(text, int) to authenticated;

-- ============================================================
-- 7. Manutenzione opzionale
-- ============================================================
-- Fai scadere automaticamente le richieste non confermate dopo 30 giorni.
-- Richiede l'estensione pg_cron (Database > Extensions in Supabase).
-- select cron.schedule(
--   'scadi-richieste-magacard',
--   '0 3 * * *',
--   $$ update magacard_richieste
--      set stato = 'scaduta'
--      where stato = 'richiesta' and created_at < now() - interval '30 days' $$
-- );

-- ============================================================
-- 8. Assegnazione ruoli
-- Crea prima gli account da Authentication > Users, poi esegui
-- una di queste righe per ciascuno (sostituendo l'email):
-- ============================================================
-- update auth.users set raw_user_meta_data = raw_user_meta_data || '{"ruolo":"bar"}'::jsonb
--   where email = 'bar@magaverse.it';
-- update auth.users set raw_user_meta_data = raw_user_meta_data || '{"ruolo":"ingresso"}'::jsonb
--   where email = 'ingresso@magaverse.it';
-- update auth.users set raw_user_meta_data = raw_user_meta_data || '{"ruolo":"admin"}'::jsonb
--   where email = 'admin@magaverse.it';
-- update auth.users set raw_user_meta_data = raw_user_meta_data || '{"ruolo":"superadmin"}'::jsonb
--   where email = 'tuo-account@magaverse.it';
