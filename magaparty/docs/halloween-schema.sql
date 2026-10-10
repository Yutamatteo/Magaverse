-- ============================================================
-- HALLOWEEN IN VILLA — schema Supabase (richieste biglietti,
-- saltafila, navetta, alloggi)
-- Esegui questo script per intero nel SQL Editor del tuo progetto
-- Supabase (lo stesso già usato per MagaCard/Marea/Tardeo, così
-- riusi staff e funzioni esistenti). È idempotente.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 1. Tabella richieste
-- Un'unica tabella per tutti i "prodotti" della pagina: la
-- colonna "tipo" distingue biglietti, saltafila, navetta e le
-- tre soluzioni per dormire. Non è una prenotazione con QR come
-- Marea: è un lead che lo staff ricontatta a mano (per i
-- biglietti a release, poi si manda il link Posto Riservato).
-- ============================================================
create table if not exists halloween_richieste (
  id uuid primary key default gen_random_uuid(),
  tipo text not null
    check (tipo in (
      'community', 'prima', 'seconda', 'terza',
      'saltafila', 'navetta',
      'appartamenti-vip', 'villa-belvedere', 'lido-azzurro'
    )),
  nome text not null,
  cognome text not null,
  email text not null,
  telefono text not null,
  data_nascita date not null,
  instagram text,
  invitato_da text,
  termini_accettati boolean not null default false,
  stato text not null default 'nuova'
    check (stato in ('nuova', 'contattata', 'confermata', 'annullata')),
  created_at timestamptz not null default now(),
  -- Pagamento online SumUp (navetta + le 3 soluzioni "dove dormire").
  sumup_checkout_id text,
  pagato_il timestamptz,
  -- Solo per i tier "a persona" con minimo di gruppo (appartamenti-vip,
  -- villa-belvedere, lido-azzurro): numero di persone pagate, usato per
  -- calcolare l'importo del checkout SumUp.
  numero_persone integer
);

-- Se la tabella esisteva già da un'esecuzione precedente di questo
-- script, queste righe aggiungono le colonne mancanti senza toccare i
-- dati già salvati (idempotente: non fanno nulla se la colonna c'è già).
alter table halloween_richieste add column if not exists termini_accettati boolean not null default false;
alter table halloween_richieste add column if not exists sumup_checkout_id text;
alter table halloween_richieste add column if not exists pagato_il timestamptz;
alter table halloween_richieste add column if not exists numero_persone integer;

create index if not exists idx_halloween_tipo on halloween_richieste (tipo);
create index if not exists idx_halloween_stato on halloween_richieste (stato);
create unique index if not exists idx_halloween_sumup_checkout_id
  on halloween_richieste (sumup_checkout_id)
  where sumup_checkout_id is not null;

alter table halloween_richieste enable row level security;

-- Il pubblico può SOLO creare una richiesta (niente lettura/scrittura
-- diretta di stato), esattamente come per le prenotazioni Marea.
drop policy if exists "pubblico crea richiesta halloween" on halloween_richieste;
create policy "pubblico crea richiesta halloween"
  on halloween_richieste for insert
  to anon
  with check (stato = 'nuova' and termini_accettati = true);

-- ============================================================
-- 2. Ruolo utente — riusa la stessa funzione già creata per
-- MagaCard/Marea (create or replace è idempotente, nessun problema
-- a rieseguirla).
-- ============================================================
create or replace function ruolo_utente()
returns text as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'ruolo', '');
$$ language sql stable;

-- Staff (ruolo 'ingresso', 'admin' o 'superadmin') può leggere e
-- aggiornare lo stato (es. segnare "contattata"/"confermata").
drop policy if exists "staff legge richieste halloween" on halloween_richieste;
create policy "staff legge richieste halloween"
  on halloween_richieste for select
  to authenticated
  using (ruolo_utente() in ('ingresso', 'admin', 'superadmin'));

drop policy if exists "staff aggiorna richieste halloween" on halloween_richieste;
create policy "staff aggiorna richieste halloween"
  on halloween_richieste for update
  to authenticated
  using (ruolo_utente() in ('ingresso', 'admin', 'superadmin'))
  with check (ruolo_utente() in ('ingresso', 'admin', 'superadmin'));

-- ============================================================
-- 3. Dopo aver eseguito questo script:
--
-- a) Deploya la funzione che manda l'email di notifica:
--      supabase functions deploy invia-email-halloween --no-verify-jwt
--    (RESEND_API_KEY e WEBHOOK_SECRET sono già impostati a livello
--    di progetto se li hai configurati per Marea/Tardeo — non serve
--    rifarlo, sono condivisi tra tutte le funzioni del progetto)
--
-- b) Crea un Database Webhook (Database > Webhooks) su:
--      tabella: halloween_richieste
--      evento: Insert
--      tipo: HTTP Request -> URL della funzione deployata
--      header custom: x-webhook-secret = <lo stesso valore di WEBHOOK_SECRET>
--
-- c) Pagamento online SumUp (navetta + alloggi): deploya anche
--      supabase functions deploy crea-pagamento-sumup --no-verify-jwt
--      supabase functions deploy sumup-webhook --no-verify-jwt
--    e imposta il secret SUMUP_API_KEY (Project Settings > Edge
--    Functions > Secrets) con la chiave segreta SumUp (sup_sk_...).
--    crea-pagamento-sumup crea la richiesta (service role, bypassa
--    RLS) e un checkout SumUp hosted; sumup-webhook è la return_url
--    del checkout e verifica sempre lo stato reale via API SumUp
--    prima di segnare la richiesta "confermata".
-- ============================================================
