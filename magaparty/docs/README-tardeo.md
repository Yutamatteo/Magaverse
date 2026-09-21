# TARDEO — documentazione

Nuovo format Magaparty: giovedì **24 settembre**, Nello Ocean Beach, dalle
19:00. Stessa infrastruttura di MagaCard/Marea/Battigia/Ultima Onda
(Supabase), stesso QR d'ingresso monouso, stesso accesso staff.

## Struttura delle pagine

- **`/magaparty/tardeo.html`** → `magaverse.it/magaparty/tardeo` —
  landing page dell'evento (programma, prezzi) + form di prenotazione
  pubblico. Al submit, la prenotazione viene salvata su Supabase, il QR
  viene mostrato subito a schermo (client-side) **e** inviato via email
  come backup.
- **`/magacard/staff/index.html`** → lo stesso pannello staff di
  MagaCard/Marea/Battigia/Ultima Onda. Chi accede con ruolo `ingresso`
  scansiona da qui anche i QR d'ingresso di Tardeo: il pannello
  riconosce da solo il tipo di QR.

## Setup da zero

**1. Esegui lo schema**
Apri *SQL Editor* su Supabase (stesso progetto di MagaCard/Marea/
Battigia/Ultima Onda) e incolla per intero `tardeo-schema.sql`. Crea la
tabella `tardeo_prenotazioni`, le policy di sicurezza, la funzione di
validazione QR e il conteggio posti. È idempotente.

**2. Account staff**
Nessuna azione se hai già account `ingresso`, `admin` o `superadmin`:
funzionano automaticamente anche per Tardeo.

**3. Configura l'invio email automatico**
Serve una Edge Function analoga a `invia-email-ultima-onda` (es.
`/supabase/functions/invia-email-tardeo`) che manda l'email con il QR
non appena una prenotazione viene creata.

```
supabase login
supabase link --project-ref <il-tuo-project-ref>
supabase functions deploy invia-email-tardeo --no-verify-jwt
```

`RESEND_API_KEY` e `WEBHOOK_SECRET` sono già impostati a livello di
progetto (stessi usati da Marea/Battigia/Ultima Onda) — non serve
rifarlo se sono già configurati.

Su Supabase Studio → *Database > Webhooks* → crea un webhook: tabella
`tardeo_prenotazioni`, evento **Insert**, tipo `HTTP Request`, URL
della funzione deployata
(`https://<project-ref>.supabase.co/functions/v1/invia-email-tardeo`),
header custom `x-webhook-secret` con lo stesso valore di `WEBHOOK_SECRET`.

## Nota

Questo format è pensato per una singola data. Se Magaparty vorrà
riproporlo in futuro, basta aggiornare `DATA_EVENTO` in `tardeo.html`
e le costanti `EVENT_START` / `EVENT_END` in `assets/tardeo-app.js`.

Manca ancora la locandina definitiva: `tardeo.html` e `tardeo-app.js`
puntano ad `assets/img/tardeo-locandina.jpg` (non ancora presente nel
repo — finché manca, il logo mostra un placeholder automatico). I tag
`og:image`/favicon usano nel frattempo `assets/img/logo-teal.png`.
Carica il file reale non appena disponibile.
