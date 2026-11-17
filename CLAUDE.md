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
- 17/11 pomeriggio (Claude Code, vedi Cantiere per il dettaglio):
  - Contest costumi chiuso: pagina con classifica finale; voti, iscrizioni e foto chiusi anche su
    Supabase (migrazione `chiudi_contest_costumi_halloween_2026`).
  - Lido rifatto in stile "cartello": servizi, menù e listino da lavagna, contatti a righe, Prenota a
    pulsanti (anche da tastiera), avviso fuori stagione, scheda schema.org in home.
  - Serate passate coerenti: niente conto alla rovescia, "Mettiti in lista" o prezzi (CSS in
    `assets/racconto.css`, attivo dove c'è `.fine-stagione` o `.racconto`). Halloween 2026 era **sabato**.
  - Galleria con fascia verso il canale Telegram; moduli con `autocomplete`; og:image assolute;
    h1 nascosti (`.mv-sr` in `maga-base.css`) dove mancavano.
  - `motion.js`: sul telefono non misura più a ogni fotogramma le locandine `.mp-evento` (si
    inclinano solo col mouse); la cornice del Gala si inclina in CSS.
  - `golfo.js` non rilegge più le dimensioni della tela a ogni fotogramma; galleria senza entrata
    legata allo scroll sul telefono; scena 3D di Halloween ferma fuori schermo.

### Regole emerse con Matteo
- **Fluidità prima di tutto.** Niente lavoro JavaScript a ogni fotogramma di scroll, niente
  `backdrop-filter`, filtri o `mix-blend-mode` su elementi grandi che si muovono. Le animazioni
  legate allo scroll si fanno in CSS con `animation-timeline`. Misura con `strumenti/fluidita.py`.
- **Foto serie.** Le foto arrivano dal canale Telegram (800 px): mai ingrandirle oltre la loro
  risoluzione, niente rotazioni, niente ripetizioni; si usano le più nitide con un trattamento
  colore unico. Gli originali ad alta risoluzione non sono sul PC: chiederli se servono.
- Non inventare date, luoghi, prezzi o nomi di serate. Se un dato manca, lascialo generico.
- Lavora in autonomia quando Matteo dà una finestra di tempo; aggiorna il Cantiere con l'ora reale.
  Su questo PC l'ora reale si legge con PowerShell `Get-Date -Format HH:mm`: in Git Bash
  `TZ=Europe/Rome date` restituisce l'ora UTC.
- Le misure di `fluidita.py` oscillano molto (anche ±15 ms con lo stesso codice, e il PC passa da
  fasi lente a veloci): confronta alternando le versioni, oppure guarda la traccia di Chrome
  (ricalcoli forzati, tempo di script, `AnimationTimeline::serviceAnimations`), che è stabile.
  `fluidita.py` ora usa la GPU vera: senza, Chromium disegnava in software (SwiftShader) e Commit
  e WebGL sembravano molto più pesanti del reale.
- Prestazioni, cose imparate il 17/11: ogni `animation-timeline: view()` viene aggiornata dal
  thread principale a ogni fotogramma (96 in galleria costavano ~10 ms); mai leggere dimensioni
  (`clientWidth`, `getBoundingClientRect`) subito dopo aver scritto stili nello stesso fotogramma;
  i cicli `requestAnimationFrame` (WebGL, Three.js) vanno fermati fuori schermo.

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

Su questo PC Windows: `../magaverse-main` esiste già (worktree sul ramo `anteprima-redesign`).
Python si chiama `py`: lo script usa `python3`, quindi metti nel PATH un file `python3` che
esegue `py`. Git non ha un nome utente configurato: per i commit usa
`git -c user.name=Claude -c user.email=noreply@anthropic.com` (o le variabili `GIT_AUTHOR_*`).
Lo script stampa "pubblicato" anche se il push fallisce: controlla con `git ls-remote origin`.
Per gli screenshot senza finestra c'è Playwright (`py -m playwright`).

## Commit
Messaggi in italiano, che spiegano cosa cambia per chi usa il sito.

## Lavoro autonomo
Quando Matteo dà una finestra di tempo (o parte una task programmata) si lavora da soli e lui
passa solo a controllare il Cantiere (artifact "Cantiere Magaverse": stato in `cantiere/stato`,
una scrivania per agente in `agenti/<id>`, campi `stato` = lavoro / pausa / finito / bloccato,
`task`, `aggiornato`, `risultato {testo, url}`; voci del diario con `a` = id dell'agente).

**Si può fare da soli**
- Modificare il ramo `redesign-grafica`, fare commit (identità e riga `Co-Authored-By` come sopra).
- Pubblicare l'anteprima con `bash strumenti/pubblica.sh "messaggio"` e poi verificare il push con
  `git ls-remote origin refs/heads/redesign-grafica`.
- Aggiornare e riorganizzare il Cantiere, con l'ora reale (PowerShell `Get-Date -Format HH:mm`).

**Non si fa mai da soli** (va nel Cantiere sotto "Serve te")
- Pubblicare sul sito vero (`main` fuori dalla cartella `anteprima/`).
- Modificare Supabase (schema, dati, funzioni, chiavi).
- Cancellare file o cartelle fuori dalla propria cartella temporanea.
- Mandare messaggi, pubblicare sui social, inventare date, prezzi, nomi o luoghi.

**Il ciclo**: una task alla volta = un commit = una pubblicazione dell'anteprima, poi Cantiere
aggiornato e task successiva. Prima di chiudere una task: aprire le pagine toccate con Playwright
a 390x844, controllare che non ci sia scorrimento orizzontale
(`document.documentElement.scrollWidth <= 390`) e annotare nel Cantiere i ms per fotogramma di
`py strumenti/fluidita.py <pagina> 8765` (server: `py -m http.server 8765`). Se il budget finisce,
fermarsi dopo un commit completo.

**Agenti** (`.claude/agents/`): `architetto` (task tecniche), `mystery-guest` (prova l'anteprima da
telefono come un cliente arrivato da Instagram), `marketing` (bozze di testi). Il repository GitHub
è **pubblico**: bozze, report e note degli agenti vanno **solo** nel Cantiere privato, mai in file
del repository.
