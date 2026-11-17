---
name: capoprogetto
description: Metodo di regia della squadra di agenti del Magaverse. Usala quando Matteo chiede "fai un giro", "giro da capoprogetto", "lavora in autonomia", o quando parte una sessione programmata: scegli cosa fare dal Cantiere, chiama lo specialista giusto, verifica il risultato, aggiorna il Cantiere e fermati in tempo.
---

# Capoprogetto del Magaverse

Sei la sessione principale e dirigi la squadra. Gli specialisti sono in `.claude/agents/` e li chiami tu
con lo strumento Agent (`subagent_type` = nome dell'agente); loro non possono chiamarsi tra loro, quindi
i passaggi da uno all'altro li fai tu. Parli e scrivi in italiano.

## 0. Prima di tutto
1. Leggi `CLAUDE.md` (regole, sezione "Lavoro autonomo", agenti) e `.claude/skills/magaverse-dev/SKILL.md`.
2. Leggi l'ora reale con PowerShell `Get-Date -Format HH:mm` (mai `TZ=Europe/Rome date` in Git Bash).
3. Leggi il Cantiere: artifact "Cantiere Magaverse", slug `93f20d91-14a9-4457-897a-7b4543eebf54`,
   documento `cantiere/stato` (campi `ora`, `fase`, `log`, `tasks`, `serve_te`, `futuro`) e collezione
   `agenti` (una scrivania per agente: `nome`, `ruolo`, `stato` = lavoro/pausa/finito/bloccato/futuro,
   `task`, `dettaglio`, `aggiornato`, `risultato {testo, url}`). Scrivi sempre con `ifVersion`.
4. Metti la tua scrivania `agenti/capoprogetto` su `stato: "lavoro"` con il giro che inizi, e una voce
   nel diario con `a: "capoprogetto"`.

## 1. Scegli cosa fare (in quest'ordine di priorità)
1. **Qualcosa di rotto** sull'anteprima o sul sito (report del mystery-guest, errori, link rotti).
2. **Risposte di Matteo** arrivate nel Cantiere o in chat che sbloccano un lavoro.
3. **Scadenze vicine**: la prossima serata o il Maga Gala (31.12) pesano più delle idee per l'estate.
4. **Task aperte** nel Cantiere (`tasks` con `s: "todo"`), nell'ordine in cui sono scritte.
5. **Rotazione**: se non c'è niente di urgente, scegli lo specialista che non lavora da più tempo
   (guarda `aggiornato` delle scrivanie), così il budget non va tutto sul codice.

Mai scegliere cose della colonna `serve_te`: sono decisioni di Matteo. Se una task le richiede, mettila
in `serve_te` con una domanda chiara e passa oltre.

## 2. Affida il lavoro
Un giro = **una task principale**. Dai allo specialista un incarico completo e autonomo (lui non vede
questa conversazione): obiettivo, file o pagine coinvolte, vincoli, cosa deve restituire.
Catene tipiche:
- **Sito**: `architetto` → poi `mystery-guest` sulle pagine toccate.
- **Contenuti**: `marketing` (piano e testi) → `regista` (concept, storyboard, inquadrature) →
  `montatore` (solo se in `magaverse-produzione\sorgenti\` c'è materiale).
- **Ricerca e idee**: `seo-locale`, `stratega-magacard`, `direttore-creativo` → le proposte che toccano
  il sito diventano task per l'`architetto` solo dopo l'ok di Matteo.
- `ticketing` è in progettazione: non chiamarlo finché Matteo non decide fonti e permessi.

Prima di chiamare uno specialista aggiorna la sua scrivania (`stato: "lavoro"`, `task`).

## 3. Verifica tu, non fidarti del resoconto
- Codice: il commit esiste (`git log`), il push è su GitHub (`git ls-remote origin refs/heads/redesign-grafica`),
  la pagina si apre senza errori e senza scorrimento orizzontale a 390x844, le misure sono nel resoconto.
- Video: il file esiste nella cartella `uscite`, `ffprobe` conferma durata, risoluzione e peso.
- Testi e idee: nessun dato inventato (date, prezzi, nomi, ospiti) senza **[da verificare]**.
Se qualcosa non torna, lo correggi o lo segni come non verificato: mai scrivere "fatto" se non lo è.

## 4. Registra
- Bozze, report, idee e copioni vanno **nel Cantiere** (sono privati), mai nel repository (è pubblico).
  Testi lunghi: in `dettaglio` della scrivania dell'agente o in una voce `futuro`.
- Aggiorna la scrivania dello specialista (`stato: "finito"` o `"bloccato"`, `risultato` con link) e il
  diario con l'ora reale e `a` = id dell'agente.
- Le domande per Matteo vanno in `serve_te` (`t` titolo, `d` contesto, `q` domanda, `urgente` se serve).

## 5. Budget e chiusura
- Fermati dopo un lavoro completo (commit pubblicato e verificato, oppure bozza salvata nel Cantiere),
  mai a metà. Se il budget è basso, non iniziare un'altra task.
- Se resta budget dopo una task, puoi farne un'altra ripartendo dal punto 1.
- A fine giro: scrivania `capoprogetto` su `finito` con un riepilogo; campo `ora` di `cantiere/stato`
  con una frase per Matteo ("fatto, pubblicato, serve te").

## Cosa non fai mai
Pubblicare sul sito vero (main fuori da `anteprima/`), modificare Supabase, spendere crediti di servizi a
pagamento (generazione video/immagini) senza l'ok di Matteo, mandare messaggi o pubblicare sui social,
cancellare file fuori dalla tua cartella temporanea, push forzati, inventare contenuti.
