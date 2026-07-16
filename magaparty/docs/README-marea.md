# MAREA — documentazione completa

Sistema di prenotazione "a numero chiuso" per l'evento domenicale **Marea**
(Nello Ocean Beach, dalle 17:00 a mezzanotte). Ogni prenotazione genera un
**QR d'ingresso monouso**: valido una sola volta, si "consuma" al primo
scan dello staff in cassa. Stessa infrastruttura di MagaCard (Supabase),
**stesso accesso staff**.

## Struttura delle pagine

- **`/magaparty/marea.html`** → `magaverse.it/magaparty/marea` — landing
  page dell'evento (vibe, lineup, prezzi) + form di prenotazione pubblico.
  Al submit, la prenotazione viene salvata su Supabase, il QR viene
  mostrato subito a schermo (client-side) **e** inviato via email come
  backup.
- **`/magacard/staff/index.html`** → `magaverse.it/magacard/staff` — lo
  **stesso** pannello staff di MagaCard. Non esiste una pagina di login
  separata per Marea: chi accede con ruolo `ingresso` scansiona da qui sia
  le MagaCard (timbri) sia i QR d'ingresso di Marea. Il pannello riconosce
  da solo di che tipo di QR si tratta.

## Come funziona il QR monouso

1. Al momento della prenotazione, il database genera automaticamente un
   `qr_token` unico (una stringa casuale) e salva la riga con
   `stato = 'confermata'`.
2. Il QR mostrato al cliente (a schermo e via email) codifica **solo**
   questo `qr_token` — nessun dato personale è leggibile dal QR in sé.
3. Allo scan, lo staff (dal pannello `/magacard/staff/`) chiama la
   funzione `valida_ingresso_marea(qr_token)`:
   - se il token non esiste → non è un QR Marea, il pannello prova
     automaticamente a leggerlo come MagaCard
   - se esiste ed è `confermata` → lo marca `usato` e fa entrare (**esito: ok**)
   - se è già `usato` → **QR già utilizzato**, non fa entrare una seconda volta
4. Tutta la logica di validazione/consumo gira **dentro il database**
   (funzione `security definer`), quindi non è aggirabile lato client.

## Chi può scansionare cosa (ruoli staff, invariati da MagaCard)

| Ruolo | MagaCard | Ingresso Marea |
|---|---|---|
| `bar` | Aggiunge punti | ❌ No |
| `ingresso` | Aggiunge timbro | ✅ Sì |
| `admin` / `superadmin` | Tutto | ✅ Sì |

Non serve creare un ruolo dedicato "marea": chi ha già `ingresso` (o
`admin`/`superadmin`) da MagaCard scansiona anche gli ingressi di Marea,
dalla stessa schermata, senza alcuna configurazione aggiuntiva.

## Setup da zero

**1. Riusa il progetto Supabase esistente (o creane uno nuovo)**
`marea.html` è già puntata sullo stesso progetto di MagaCard
(`SUPABASE_URL` / `SUPABASE_ANON_KEY` in cima al file). Se vuoi un
progetto separato, sostituisci quelle due costanti.

**2. Esegui lo schema**
Apri *SQL Editor* su Supabase e incolla per intero `marea-schema.sql`.
Crea la tabella `marea_prenotazioni`, le policy di sicurezza, la funzione
di validazione QR e (facoltativa) la funzione di conteggio posti.
È idempotente, puoi rilanciarlo se serve.

> Se il progetto è lo stesso di MagaCard, la funzione `ruolo_utente()`
> esiste già: lo script la ricrea con `create or replace`, nessun problema.

> **Se avevi già eseguito una versione precedente** dello schema (con un
> ruolo `marea` dedicato o con la colonna `composizione`), guarda la
> sezione "MIGRAZIONE" in cima al file `marea-schema.sql`.

**3. Account staff**
Se hai già account `ingresso`, `admin` o `superadmin` da MagaCard, non
devi fare nulla: funzionano automaticamente anche per Marea. Se non ne hai
ancora uno, crealo da *Authentication > Users* e assegna il ruolo:
```sql
update auth.users set raw_user_meta_data = raw_user_meta_data || '{"ruolo":"ingresso"}'::jsonb
  where email = 'ingresso@magaverse.it';
```

**4. Configura l'invio email automatico**
La cartella `/supabase/functions/invia-email-marea` contiene la Edge
Function che manda l'email con il QR non appena una prenotazione viene
creata.

- Installa la Supabase CLI, poi dal repo:
  ```
  supabase login
  supabase link --project-ref <il-tuo-project-ref>
  supabase secrets set RESEND_API_KEY=... WEBHOOK_SECRET=<una-stringa-a-caso-lunga>
  supabase functions deploy invia-email-marea --no-verify-jwt
  ```
- Su [resend.com](https://resend.com): stesso dominio verificato usato per
  MagaCard (`magaverse.it`) — se è già configurato, questo passaggio è
  già fatto, basta usare la stessa `RESEND_API_KEY`.
- Su Supabase Studio → *Database > Webhooks* → crea un webhook: tabella
  `marea_prenotazioni`, evento **Insert** (non Update, a differenza di
  MagaCard: qui la prenotazione è già confermata al volo), tipo
  `HTTP Request`, URL della funzione deployata
  (`https://<project-ref>.supabase.co/functions/v1/invia-email-marea`),
  header custom `x-webhook-secret` con lo stesso valore di `WEBHOOK_SECRET`.

**5. Carica tutto su GitHub**
Sostituisci/aggiungi la cartella `magaparty/` (che ora non include più
`marea/staff/`, rimossa), la cartella `supabase/`, e l'aggiornato
`magacard/staff/index.html` alla radice del repo.

## Il flusso completo, end to end

1. Il cliente apre `/magaparty/marea`, sceglie l'opzione (Promo/Lettino/Base)
   e compila il form → riga salvata con `stato = 'confermata'` e un
   `qr_token` unico generato dal database
2. La pagina mostra subito il QR a schermo; in parallelo l'Edge Function
   invia l'email di conferma con lo stesso QR (via Resend)
3. La domenica, il cliente mostra il QR (schermo o email) allo staff in
   cassa
4. Lo staff apre `/magacard/staff/`, fa login (stesso account di sempre)
   e scansiona: il pannello riconosce da solo se è un QR Marea o una
   MagaCard. Se il QR Marea è valido e mai usato, l'accesso è consentito
   e si marca "usato"; se viene ripresentato (screenshot condiviso, doppio
   accesso), lo scanner lo segnala come già utilizzato

## Aggiornare i prezzi o il lineup

I contenuti (prezzi, orari DJ, attività) sono scritti direttamente dentro
`marea.html`. Cerca le sezioni `<!-- ═══ PREZZI ═══ -->` e
`<!-- ═══ LINE UP ═══ -->` e modifica i blocchi HTML.

## Cosa manca ancora (prossimi passi)

- **Contatore posti reale**: la funzione `conteggio_marea(data)` è pronta
  nello schema ma non ancora collegata a un badge "posti rimasti" in
  pagina — è un miglioramento facile da aggiungere in un secondo momento.
- **Data evento dinamica**: la pagina calcola in automatico "la prossima
  domenica"; se un'edizione salta, va gestito manualmente (es. aggiungendo
  un controllo sulla data in `marea.html`).
- **WhatsApp**: come per MagaCard, rimandato — richiede account business API.

## Nota sulla privacy

Il form include il consenso obbligatorio. Il QR non contiene dati
personali (solo un token casuale): telefono, email e nominativo restano
nel database e sono visibili solo allo staff autenticato con ruolo
`ingresso`, `admin` o `superadmin`.
