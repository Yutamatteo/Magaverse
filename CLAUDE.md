# Magaverse · istruzioni per Claude Code

Sito statico di **magaverse.it** (GitHub Pages, repo `Yutamatteo/magaverse`): hub Magaverse,
Magaparty (feste), Nello Ocean Beach (lido), MagaCard (tessera fedeltà). Backend Supabase
(progetto `magacard`), email con Resend, pagamenti SumUp. Prima di modificare qualcosa leggi
la skill del progetto in `.claude/skills/magaverse-dev`.

Chi ci lavora: Matteo Finizio (IT e webmaster di Magaparty). Parla e scrivi in italiano.

## Dove siamo (17 novembre 2026)

Redesign grafico in corso sul ramo **`redesign-grafica`**. Il sito pubblico (ramo `main`) NON è
ancora stato toccato: il redesign va online solo quando Matteo lo dice.

- Punto di ripristino del vecchio sito: tag `backup-pre-redesign-2026-11-17`.
- Anteprima nascosta (noindex, form disattivati): https://www.magaverse.it/anteprima/redesign/
  È una copia del ramo `redesign-grafica` dentro la cartella `anteprima/redesign` di `main`.
  Su `main` si pubblica **solo** quella cartella.
- Diario dei lavori con screenshot: artifact "Cantiere Magaverse" su claude.ai (db `cantiere/stato`).

### Fatto finora
- Hub e home Magaparty: "la stagione come parete di foto" (`assets/saga.css`, `assets/saga.js`),
  generata da `strumenti/saga_build.py` con i dati di `strumenti/saga.json`
  (lido → prime notti → Marea e Battigia → Ultima Onda → Tardeo → Halloween → Maga Gala).
  Scorrimento nativo; animazioni solo con `animation-timeline: view()` (girano sul compositore).
- Tramonto WebGL (`assets/golfo.js`): 30 fps, risoluzione 1x, si ferma fuori schermo e sul telefono quando non scorri.
- Galleria (`magaparty/galleria.html` + `assets/galleria.css/js`): 96 foto, filtri per serata, visore.
- "Com'è andata" su Tardeo, Ultima Onda, Halloween; "La stagione in foto" in Chi siamo
  (`assets/racconto.css`); avviso fine stagione su Marea e Battigia.
- Maga Gala "coming soon" (`magaparty/magagala.html`): niente dettagli inventati, solo la data di Capodanno.
- Lido: foto vere nella giornata tipo; MagaCard: tessera olografica; pagina 404; sitemap e robots.

### Regole emerse con Matteo
- **Fluidità prima di tutto.** Niente lavoro JavaScript a ogni fotogramma di scroll, niente
  `backdrop-filter`, filtri o `mix-blend-mode` su elementi grandi che si muovono. Le animazioni
  legate allo scroll si fanno in CSS con `animation-timeline`. Misura con `strumenti/fluidita.py`.
- **Foto serie.** Le foto arrivano dal canale Telegram (800 px): mai ingrandirle oltre la loro
  risoluzione, niente rotazioni, niente ripetizioni; si usano le più nitide con un trattamento
  colore unico. Gli originali ad alta risoluzione non sono sul PC: chiederli se servono.
- Non inventare date, luoghi, prezzi o nomi di serate. Se un dato manca, lascialo generico.
- Lavora in autonomia quando Matteo dà una finestra di tempo; aggiorna il Cantiere con l'ora reale.

### In sospeso (serve l'ok di Matteo)
- Pubblicare il redesign sul sito vero.
- Sicurezza Supabase: `ruolo_utente()` legge `user_metadata` (deve usare `app_metadata`); la vista
  `magacard_pubblica` è SECURITY DEFINER e scrivibile da anon (la pagina `magacard/card` la legge
  ancora: va spostata sulla RPC `cerca_card`); chiave Resend scritta nella funzione
  `invia_email_magacard` da ruotare.

## Pubblicare l'anteprima
Serve una seconda cartella con `main` accanto a questa (default `../magaverse-main`, oppure
variabile `MV_MAIN`). Poi da questa cartella:

```
bash strumenti/pubblica.sh "messaggio"
```

Lo script ricostruisce `anteprima/redesign`, controlla che il commit tocchi solo quella cartella
e fa push di `main` e di `redesign-grafica`.

## Commit
Messaggi in italiano, che spiegano cosa cambia per chi usa il sito.
