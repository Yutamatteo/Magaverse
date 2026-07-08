# MagaCard — documentazione completa

Sistema di tesseramento con punti, timbri, livelli e premio a sorpresa
per gli eventi Magaparty. Tutta la parte dati gira su Supabase.

## Struttura delle pagine (dentro `/magacard`)

- **`index.html`** → `magaverse.it/magacard` — form pubblico di richiesta card
- **`card/index.html`** → `magaverse.it/magacard/card?code=...` — la card digitale con QR, punti, timbri, livello ed eventuale premio da riscattare
- **`staff-mc2026/index.html`** — pannello riservato ad **admin/superadmin**: conferma pagamenti, timbro/punti manuali (fallback), riscatto premi, gestione soglie livelli (solo superadmin)
- **`scanner/index.html`** — pagina per **bar/ingresso**: scansiona il QR della card e assegna punti (bar, quantità a scelta) o un timbro (ingresso, massimo uno al giorno)

## Setup da zero

**1. Crea il progetto Supabase**
[supabase.com](https://supabase.com) → nuovo progetto → annota `Project URL` e `anon public key` da *Project Settings > API*.

**2. Esegui lo schema**
Apri *SQL Editor* e incolla per intero `magacard-schema.sql`. Crea tabelle, viste, funzioni e policy di sicurezza — è idempotente, puoi rilanciarlo se serve.

**3. Inserisci le chiavi**
In ognuna delle 4 pagine HTML, sostituisci in cima allo script:
```js
const SUPABASE_URL = "...";
const SUPABASE_ANON_KEY = "...";
```

**4. Crea gli account staff con il loro ruolo**
Da *Authentication > Users* crea un account per ogni persona (email + password). Poi, nel SQL Editor, assegna il ruolo con gli `update` in fondo allo schema (sezione 8) — uno per ciascuno:

| Ruolo | Cosa può fare |
|---|---|
| `bar` | Scanner → aggiunge punti (quantità a scelta) |
| `ingresso` | Scanner → aggiunge un timbro (max 1 al giorno) |
| `admin` | Pannello staff: conferma richieste, timbro/punti manuali, riscatta premi |
| `superadmin` | Tutto quello di admin + modifica soglie dei livelli |

Un account admin/superadmin può anche usare lo scanner al posto di bar/ingresso (utile se manca qualcuno del turno): dopo il login gli viene chiesto quale postazione vuole coprire.

**5. Configura l'invio automatico dell'email**
La cartella `/supabase/functions/invia-email-magacard` contiene la Edge Function che manda l'email con il link della card non appena una richiesta diventa "attiva".

- Installa la Supabase CLI, poi da dentro il repo:
  ```
  supabase login
  supabase link --project-ref <il-tuo-project-ref>
  supabase secrets set RESEND_API_KEY=... WEBHOOK_SECRET=<una-stringa-a-caso-lunga>
  supabase functions deploy invia-email-magacard --no-verify-jwt
  ```
- Su [resend.com](https://resend.com): crea un account, verifica il dominio `magaverse.it` (record DNS da aggiungere su Aruba), prendi l'API key.
- Su Supabase Studio → *Database > Webhooks* → crea un webhook: tabella `magacard_richieste`, evento `Update`, solo per la colonna `stato`, tipo `HTTP Request`, URL della funzione deployata (`https://<project-ref>.supabase.co/functions/v1/invia-email-magacard`), header custom `x-webhook-secret` con lo stesso valore di `WEBHOOK_SECRET`.

**6. Carica tutto su GitHub**
Sostituisci la cartella `magacard/` e aggiungi la cartella `supabase/` alla radice del repo.

## Il flusso completo, end to end

1. Il cliente compila `/magacard` → richiesta salvata, stato `richiesta`
2. Va in cassa, paga, dice nome e cognome
3. Admin apre il pannello staff, cerca il nominativo, clicca "Conferma pagamento" → si genera il `card_code`, l'email parte da sola
4. Il cliente apre il link ricevuto → vede la sua card
5. Alle serate: ingresso scansiona il QR → +1 timbro (una volta al giorno); bar scansiona il QR → sceglie quanti punti aggiungere
6. Quando i timbri raggiungono la soglia del livello, il sistema genera in automatico un premio da riscattare — il cliente lo vede sulla propria card, lo staff lo segna come riscattato dal pannello quando lo consegna

## Cosa manca ancora (prossimi passi)

- **WhatsApp**: rimandato, richiede un account business API (Twilio o Meta) con verifica azienda e template approvati — non è immediato come l'email
- **Contenuto del premio**: il sistema genera solo il codice, decidi tu di volta in volta cosa regalare
- **Scadenza automatica delle richieste non confermate**: script pronto ma commentato nello schema (richiede l'estensione `pg_cron`)

## Nota sulla privacy

Il form include il consenso obbligatorio. Telefono ed email non sono mai esposti pubblicamente né a bar/ingresso: la card pubblica e il lookup dello scanner passano da viste e funzioni che mostrano solo i campi necessari.
