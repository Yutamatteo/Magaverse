---
name: magaverse-dev
description: Regole e contesto per lavorare sul Magaverse (magaverse.it): Magaparty, MagaCard, Ocean Beach, prenotazioni eventi, pannello staff, Supabase, Edge Functions, Resend, SumUp. Usala per qualsiasi modifica a questo repo.
---

# Magaverse — regole di sviluppo

## Stack
- Sito statico HTML/CSS/JS su GitHub Pages (CNAME magaverse.it). Nessun build step.
- Supabase progetto `magacard` (id `dkzzmxsreaegjagqbdnh`, eu-west-1): Postgres + RLS, Auth staff, Edge Functions (Deno) in `supabase/functions/`.
- Email: Resend via Edge Functions. Pagamenti online: SumUp (`crea-pagamento-sumup`, `sumup-webhook`). Tracking: Meta Pixel.
- Biglietti ufficiali Magaparty: Posto Riservato (piattaforma esterna, obbligo di legge). Il Magaverse gestisce prenotazioni/RSVP, liste, navette, contest, MagaCard — non vende biglietti nominativi.

## Struttura
- `/` hub Magaverse · `/magaparty/` eventi · `/magacard/` fedeltà + `magacard/staff/` pannello staff · `/oceanbeach/` lido.
- `/anteprima/` copia nascosta per provare il redesign prima di andare live. `/test/` pagine di prova.
- Design system condiviso: `assets/magaverse.css` (token) — ogni sezione lo importa e sovrascrive solo l'accento.

## Formati evento
Marea (dom), Battigia (mer), Drink Another Night (ven), Ultima Onda, Tardeo, Halloween in Villa. Ogni formato ha `<formato>_prenotazioni` con `qr_token`, `stato` (attiva/usato/annullata), funzioni `valida_ingresso_<formato>`, `checkin_manuale_<formato>`, `conteggio_<formato>` ed Edge Function `invia-email-<formato>`.

## Ruoli staff
`bar`, `ingresso`, `admin`, `superadmin`. Pannello unico in `magacard/staff/index.html`.

## Sicurezza (obbligatorio)
1. Ruolo staff solo da `app_metadata`, mai da `user_metadata` (modificabile dall'utente).
2. Funzioni `SECURITY DEFINER`: `SET search_path = public`, controllo ruolo in testa, `REVOKE EXECUTE ... FROM anon` se non pubbliche.
3. Viste esposte: `security_invoker = on`, solo `GRANT SELECT`.
4. Nessun segreto in SQL o nel client: secrets delle Edge Functions o Vault.
5. Escape di ogni dato utente inserito in HTML.
6. Webhook di pagamento: rileggere sempre lo stato dall'API del provider.
7. Dopo ogni modifica di schema: advisor Supabase security + performance.

## Grafica
- Mobile first (traffico da Instagram): testare a 375px e 1280px.
- Rispettare `prefers-reduced-motion`. Contrasto testo AA minimo.
- Non cambiare id, name dei campi o classi usate dai file JS (`magaparty/assets/*-app.js`): i form scrivono su Supabase.

## Flusso di lavoro
- Branch + PR, mai commit diretti su main. Tag `backup-pre-redesign-2026-11-17` = versione di emergenza.
- Verificare il flusso completo: form → Supabase → email → QR → validazione dal pannello staff.
