# MagaCard — integrata nel sito Magaverse

Versione rifatta graficamente sul linguaggio visivo di Magaparty (stessi font,
stesse componenti — glass-card, pillole, badge —, palette diversa: "Neon
Riviera", magenta/violetto/ciano invece del verde giungla). Tutto gira su web,
nessun Apple/Google Wallet: QR mostrato in una pagina, salvabile in home
screen come una PWA leggera. Stack gratuito: Supabase free tier + GitHub
Pages + librerie CDN gratuite.

## Dove sono i file nel repo

- `magacard/index.html` — form pubblico di richiesta → **magaverse.it/magacard**
- `magacard/card/index.html` — card digitale con QR → **magaverse.it/magacard/card?code=...**
- `magacard/staff-mc2026/index.html` — pannello staff per confermare i pagamenti (non linkato dal sito pubblico, url "segreta")
- `magacard/assets/styles.css` — tema condiviso dalle tre pagine
- `magacard/docs/magacard-schema.sql` — schema Supabase (identico a quello che mi avevi mandato, nessuna modifica necessaria)
- Aggiunta una tile "MagaCard" nella home hub (`index.html`) e un link in footer

## Cosa ho corretto rispetto ai file originali

Il tuo `magacard.html` originale non corrispondeva più allo schema SQL:
usava una tabella `tessere_richieste` e una funzione `get_card` che non
esistono nello schema (che invece definisce `magacard_richieste` e la vista
`magacard_pubblica`). L'ho riscritto in modo che il form scriva sulla tabella
giusta e rispetti la RLS policy — che tra l'altro richiede
`consenso_privacy = true`: ho aggiunto la checkbox di consenso che nel form
originale mancava (senza, ogni invio sarebbe stato respinto dal database).

Il flusso resta quello che avevi descritto: dopo l'invio il form mostra solo
un messaggio di conferma ("vai in cassa, paga, lo staff attiva la card") —
non tenta di leggere lo stato della richiesta, perché la policy attuale non
permette al pubblico di rileggere i propri dati. Va bene così finché il link
alla card lo mandi tu a mano dopo la conferma in cassa.

## Setup (Supabase)

Se hai già eseguito `magacard-schema.sql` in precedenza, non devi rifare
nulla — lo schema non è cambiato. Se parti da zero, segui i 5 passi del
README originale (crea progetto Supabase → esegui lo schema → incolla
`SUPABASE_URL`/`SUPABASE_ANON_KEY` nei tre file HTML → crea gli account
staff a mano in Authentication → carica su GitHub).

Le chiavi vanno inserite in cima allo script di ciascuno dei tre file HTML:
```js
const SUPABASE_URL = "INSERISCI_SUPABASE_URL";
const SUPABASE_ANON_KEY = "INSERISCI_SUPABASE_ANON_KEY";
```

## Prossimi passi (non in questa versione)

Uguali a quelli del README originale: invio automatico del link via email
(Edge Function + Resend), scanner QR in cassa per assegnare punti/timbri,
scadenza automatica delle richieste non confermate (script `pg_cron` già
pronto e commentato nello schema).
