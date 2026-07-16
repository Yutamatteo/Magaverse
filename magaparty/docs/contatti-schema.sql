-- ============================================================
-- Magaparty — tabella messaggi di contatto (sito "Chi Siamo")
-- Esegui questo script nel SQL Editor del progetto Supabase
-- già usato per MagaCard (stesso URL/anon key).
-- È idempotente: puoi rilanciarlo senza problemi.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists magaparty_contatti (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  telefono text,
  messaggio text not null,
  letto boolean not null default false,
  created_at timestamptz not null default now()
);

-- Se la tabella esiste già da prima (senza questa colonna), aggiungila:
alter table magaparty_contatti add column if not exists telefono text;

alter table magaparty_contatti enable row level security;

-- Chiunque (anon, dal sito) può SOLO inserire un messaggio.
-- Nessuna policy di select per anon: dal sito pubblico non si possono
-- leggere i messaggi altrui. Per leggerli, usa la Table Editor di
-- Supabase (con il tuo login, che bypassa RLS) oppure una futura
-- pagina staff con service role, come già fatto per MagaCard.
drop policy if exists "pubblico invia messaggio" on magaparty_contatti;
create policy "pubblico invia messaggio"
  on magaparty_contatti for insert
  to anon
  with check (
    char_length(nome) between 1 and 100
    and char_length(email) between 3 and 200
    and (telefono is null or char_length(telefono) <= 30)
    and char_length(messaggio) between 1 and 2000
    and letto = false
  );

-- Indice utile per ordinare/filtrare i messaggi non letti in futuro
create index if not exists idx_magaparty_contatti_letto
  on magaparty_contatti (letto, created_at desc);
