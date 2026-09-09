# ULTIMA ONDA — documentazione

Evento speciale **unico** (non ricorrente): domenica **13 settembre**, Nello
Ocean Beach, dalle 18:00. Stessa infrastruttura di MagaCard/Marea/Battigia
(Supabase), stesso QR d'ingresso monouso, stesso accesso staff.

## Struttura delle pagine

- **`/magaparty/ultima-onda.html`** → `magaverse.it/magaparty/ultima-onda` —
  landing page dell'evento (programma, prezzi) + form di prenotazione
  pubblico. Al submit, la prenotazione viene salvata su Supabase, il QR
  viene mostrato subito a schermo (client-side) **e** inviato via email
  come backup.
- **`/magacard/staff/index.html`** → lo stesso pannello staff di
  MagaCard/Marea. Chi accede con ruolo `ingresso` scansiona da qui anche i
  QR d'ingresso di Ultima Onda: il pannello riconosce da solo il tipo di
  QR (prova prima Marea, poi Ultima Onda, poi MagaCard).

## Setup da zero

**1. Esegui lo schema**
Apri *SQL Editor* su Supabase (stesso progetto di MagaCard/Marea/Battigia)
e incolla per intero `ultima-onda-schema.sql`. Crea la tabella
`ultima_onda_prenotazioni`, le policy di sicurezza, la funzione di
validazione QR e il conteggio posti. È idempotente.

**2. Account staff**
Nessuna azione se hai già account `ingresso`, `admin` o `superadmin`:
funzionano automaticamente anche per Ultima Onda.

**3. Configura l'invio email automatico**
La cartella `/supabase/functions/invia-email-ultima-onda` contiene la Edge
Function che manda l'email con il QR non appena una prenotazione viene
creata.

```
supabase login
supabase link --project-ref <il-tuo-project-ref>
supabase functions deploy invia-email-ultima-onda --no-verify-jwt
```

`RESEND_API_KEY` e `WEBHOOK_SECRET` sono già impostati a livello di
progetto (stessi usati da Marea/Battigia) — non serve rifarlo se sono
già configurati.

Su Supabase Studio → *Database > Webhooks* → crea un webhook: tabella
`ultima_onda_prenotazioni`, evento **Insert**, tipo `HTTP Request`, URL
della funzione deployata
(`https://<project-ref>.supabase.co/functions/v1/invia-email-ultima-onda`),
header custom `x-webhook-secret` con lo stesso valore di `WEBHOOK_SECRET`.

## Nota

Questo format è pensato per una singola data. Se Magaparty vorrà
riproporlo in futuro, basta aggiornare `DATA_EVENTO` in
`ultima-onda.html` e le costanti `EVENT_START` / `EVENT_END` in
`assets/ultima-onda-app.js`.
