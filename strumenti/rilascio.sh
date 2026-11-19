#!/usr/bin/env bash
# Rilascio del redesign sul sito vero (ramo main, GitHub Pages).
#
# uso:  bash strumenti/rilascio.sh [--prova | --vero]
#   --prova (predefinito) costruisce il main "dopo il rilascio" senza toccare niente: nessun push,
#           nessun tag, nessuna modifica a main o a ../magaverse-main. Mostra le differenze rispetto
#           a origin/main, fa i controlli e stampa i comandi che --vero eseguirebbe.
#   --vero  esegue davvero (tag di ripristino, push su main): parte solo con MV_OK_MATTEO=si.
#
# Come si costruisce il nuovo main (senza cartelle di lavoro, solo oggetti git):
#   - si parte dall'albero di origin/main (resta tutto: CNAME, anteprima/, supabase/, test/, video);
#   - sopra si mettono i file del ramo sorgente (predefinito redesign-grafica), così come sono nel
#     commit, esclusi strumenti, note e cartelle interne (vedi ESCLUSI);
#   - niente trasformazioni dell'anteprima (noindex, blocco moduli, etichetta): i file sono gli originali.
# Controlli che bloccano: pagine della sitemap senza noindex, canonical/og:url senza "anteprima",
# nessun resto dell'anteprima nei file pubblici, 404 e CNAME in radice, correzioni fatte su main dopo
# il tag base ancora presenti, controlla.py a 4 formati sulle pagine principali.
set -u
MODO="${1:---prova}"
case "$MODO" in --prova|--vero) ;; *) echo "uso: bash strumenti/rilascio.sh [--prova|--vero]"; exit 2;; esac
QUI="$(cd "$(dirname "$0")/.." && pwd)"
SORGENTE="${MV_SORGENTE_REF:-redesign-grafica}"
BASE_TAG="${MV_BASE_TAG:-backup-pre-redesign-2026-11-17}"   # da qui si cercano le correzioni fatte su main
PORTA="${MV_PORTA:-8799}"
PAGINE="${MV_PAGINE:-index.html magaparty/index.html magaparty/galleria.html magaparty/magagala.html magaparty/halloween.html oceanbeach/index.html magacard/index.html 404.html}"
ESCLUSI='^(\.claude|anteprima|test|supabase|tools|strumenti|_prova)/|^(CNAME|skills-lock\.json|\.gitignore|\.gitattributes)$|\.md$|\.sql$|\.mp4$|ARCHIVO-OFL'
BIN="${TMPDIR:-${TMP:-/tmp}}/mvbin"; mkdir -p "$BIN"
[ -x "$BIN/python3" ] || { printf '#!/bin/sh\nexec py "$@"\n' > "$BIN/python3"; chmod +x "$BIN/python3"; }
PY=python3; command -v py >/dev/null 2>&1 && PY=py
export PATH="$BIN:$PATH" GIT_AUTHOR_NAME=Claude GIT_AUTHOR_EMAIL=noreply@anthropic.com GIT_COMMITTER_NAME=Claude GIT_COMMITTER_EMAIL=noreply@anthropic.com
T0=$(date +%s)
cd "$QUI"

if [ "$MODO" = "--vero" ] && [ "${MV_OK_MATTEO:-}" != "si" ]; then
  echo "FERMO: il rilascio vero parte solo con MV_OK_MATTEO=si (lo imposta Matteo, non un agente)."; exit 3
fi

LAV="$(mktemp -d "${TMPDIR:-${TMP:-/tmp}}/mv-rilascio-XXXXXX")"
pulisci() { rm -rf "$LAV"; }
trap pulisci EXIT

echo "== 1. Aggiorno i riferimenti da GitHub (solo lettura)"
timeout 120 git fetch -q origin main redesign-grafica || { echo "ERRORE: fetch fallito"; exit 1; }
git rev-parse -q --verify "refs/tags/$BASE_TAG^{commit}" >/dev/null || { echo "ERRORE: manca il tag base $BASE_TAG (MV_BASE_TAG)"; exit 1; }
MAIN=$(git rev-parse origin/main); SRC=$(git rev-parse "$SORGENTE")
echo "   origin/main = ${MAIN:0:7}   sorgente $SORGENTE = ${SRC:0:7}"
if [ "$SRC" != "$(git rev-parse origin/redesign-grafica)" ] && [ "$SORGENTE" = "redesign-grafica" ]; then
  if [ "$MODO" = "--vero" ]; then echo "FERMO: redesign-grafica locale diverso da GitHub: spingi prima il ramo"; exit 1; fi
  echo "   ATTENZIONE: redesign-grafica locale diverso da origin/redesign-grafica (in --vero sarebbe un blocco)"
fi
[ -z "$(git status --porcelain --untracked-files=no -- . ':!.claude' ':!strumenti')" ] || echo "   nota: ci sono modifiche non committate: NON entrano nel rilascio (si usa il commit)"

echo "== 2. Costruisco il main dopo il rilascio (indice temporaneo, nessun file toccato)"
export GIT_INDEX_FILE="$LAV/indice"
git read-tree "$MAIN"
git ls-tree -r -z --full-tree "$SRC" | tr '\0' '\n' | while IFS=$'\t' read -r META PERCORSO; do
  echo "$PERCORSO" | grep -qE "$ESCLUSI" && continue
  set -- $META   # modo tipo hash
  [ "$2" = "blob" ] && printf '%s %s\t%s\n' "$1" "$3" "$PERCORSO"
done > "$LAV/elenco"
git update-index --index-info < "$LAV/elenco"
ALBERO=$(git write-tree)
unset GIT_INDEX_FILE
MSG="Rilascio del redesign sul sito vero (da $SORGENTE ${SRC:0:7})

Hub, Magaparty, Nello Ocean Beach e MagaCard con la nuova grafica. Restano com'erano CNAME,
la cartella anteprima/ e i file interni. Ripristino: tag creato subito prima di questo commit.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
NUOVO=$(git commit-tree "$ALBERO" -p "$MAIN" -m "$MSG")
echo "   commit preparato (solo locale, su nessun ramo): ${NUOVO:0:7}"

echo "== 3. Differenze rispetto a origin/main"
git diff --name-status --no-renames "$MAIN" "$NUOVO" > "$LAV/diff"
printf '   aggiunti %s  cambiati %s  tolti %s\n' "$(grep -c '^A' "$LAV/diff")" "$(grep -c '^M' "$LAV/diff")" "$(grep -c '^D' "$LAV/diff")"
echo "   per cartella (A/M/D):"
awk -F'\t' '{n=split($2,p,"/"); d=(n>1)?p[1]"/":"(radice)"; c[d" "$1]++} END{for(k in c) print c[k], k}' "$LAV/diff" | sort -k2,2 -k3,3 | awk '{printf "     %-14s %s %s\n",$2,$3,$1}'
echo "   pagine HTML cambiate o nuove:"; grep -E '\.html$' "$LAV/diff" | sed 's/^/     /'
echo "   file su main senza equivalente nel redesign (restano):"
comm -23 <(git ls-tree -r --name-only "$MAIN" | grep -vE '^(anteprima|supabase|test)/|^CNAME$' | sort) \
         <(git ls-tree -r --name-only "$SRC" | sort) | sed 's/^/     /' | head -20
ERR=0

echo "== 4. Controlli sui file del nuovo main"
mkdir -p "$LAV/sito"
git archive "$NUOVO" | tar -x -C "$LAV/sito" || { echo "ERRORE: estrazione"; exit 1; }
git diff "$BASE_TAG" "$MAIN" -- . ':!anteprima' > "$LAV/correzioni.diff"
"$PY" - "$LAV/sito" "$LAV/correzioni.diff" <<'EOF' || ERR=1
import os, re, sys
sito, corr = sys.argv[1], sys.argv[2]
male = []
def leggi(p):
    try: return open(os.path.join(sito, p), encoding='utf-8', errors='replace').read()
    except FileNotFoundError: return None
cn = (leggi('CNAME') or '').strip()
if cn != 'www.magaverse.it': male.append(f'CNAME: "{cn}"')
if leggi('404.html') is None: male.append('manca 404.html in radice')
sm = leggi('sitemap.xml') or ''
urls = re.findall(r'<loc>https://www\.magaverse\.it/([^<]*)</loc>', sm)
if not urls: male.append('sitemap.xml vuota o assente')
if 'anteprima' in sm: male.append('sitemap.xml cita anteprima')
if re.search(r'Disallow:\s*/\s*$', leggi('robots.txt') or '', re.M): male.append('robots.txt blocca tutto il sito')
for u in urls:
    p = u + 'index.html' if (u == '' or u.endswith('/')) else u
    t = leggi(p)
    if t is None: male.append(f'sitemap -> {p} non esiste'); continue
    if re.search(r'<meta[^>]*name=["\']robots["\'][^>]*noindex', t, re.I): male.append(f'{p}: noindex su pagina della sitemap')
    for m in re.findall(r'<link rel="canonical" href="([^"]*)"', t):
        if 'anteprima' in m or not m.startswith('https://www.magaverse.it/'): male.append(f'{p}: canonical {m}')
    for m in re.findall(r'<meta property="og:url" content="([^"]*)"', t):
        if 'anteprima' in m: male.append(f'{p}: og:url {m}')
resti = 0
for d, _, fs in os.walk(sito):
    rel = os.path.relpath(d, sito).replace('\\', '/')
    if rel.split('/')[0] in ('anteprima', 'test'): continue
    for f in fs:
        if not f.endswith(('.html', '.css', '.js', '.xml', '.webmanifest')): continue
        t = open(os.path.join(d, f), encoding='utf-8', errors='replace').read()
        if '/anteprima/redesign' in t or 'ANTEPRIMA: blocca' in t or 'i form non inviano dati' in t:
            resti += 1; male.append(f'resto dell\'anteprima in {rel}/{f}')
# Correzioni fatte su main dopo il tag base (es. pannelli staff): ogni riga aggiunta deve esserci ancora.
f, persi = None, {}
for r in open(corr, encoding='utf-8', errors='replace'):
    if r.startswith('+++ '): f = r[6:].strip() if r.startswith('+++ b/') else None
    elif f and r.startswith('+') and len(r.strip()) > 12:
        t = leggi(f)
        if t is None or r[1:].strip() not in t: persi[f] = persi.get(f, 0) + 1
for f, n in persi.items(): male.append(f'{f}: {n} righe corrette su main non ci sono nel rilascio')
print(f'   sitemap: {len(urls)} pagine controllate; resti anteprima: {resti}; correzioni di main perse: {sum(persi.values())}')
for m in male: print('   BLOCCO', m)
sys.exit(1 if male else 0)
EOF
[ $ERR = 0 ] && echo "   OK controlli statici"

echo "== 5. controlla.py a 4 formati sulla cartella del nuovo main (porta $PORTA)"
# shellcheck disable=SC2086
MV_RADICE="$LAV/sito" MV_PORTA="$PORTA" "$PY" strumenti/controlla.py $PAGINE 2>&1 | sed 's/^/   /'
[ "${PIPESTATUS[0]}" = 0 ] || { ERR=1; echo "   BLOCCO controlla.py ha trovato errori"; }

TAG="rilascio-pre-redesign-$(date -u +%Y%m%d-%H%M)utc"
echo "== 6. Comandi del rilascio"
echo "   git tag -a $TAG ${MAIN:0:12} -m \"Sito prima del rilascio del redesign\""
echo "   git push origin refs/tags/$TAG"
echo "   git push origin ${NUOVO:0:12}:refs/heads/main     # senza forzare: se main è cambiato, GitHub rifiuta"
echo "   poi: MV_BASE=https://www.magaverse.it py strumenti/controlla.py $PAGINE"
echo "   se qualcosa si rompe: MV_OK_MATTEO=si bash strumenti/ritorno.sh --vero $TAG"
echo "== durata: $(( $(date +%s) - T0 )) s"

if [ $ERR != 0 ]; then echo "ESITO: BLOCCATO (correggi prima di rilasciare)"; exit 1; fi
if [ "$MODO" = "--prova" ]; then echo "ESITO: prova a secco OK. Niente è stato pubblicato."; exit 0; fi

echo "== 7. RILASCIO VERO"
[ "$(timeout 30 git ls-remote origin refs/heads/main | cut -f1)" = "$MAIN" ] || { echo "FERMO: main è cambiato su GitHub durante la prova, rilancia"; exit 1; }
git tag -a "$TAG" "$MAIN" -m "Sito prima del rilascio del redesign" || exit 1
timeout 120 git push -q origin "refs/tags/$TAG" || { echo "FERMO: tag non spinto, main non toccato"; exit 1; }
timeout 280 git -c push.negotiate=true push -q origin "$NUOVO:refs/heads/main" || { echo "FERMO: push di main rifiutato; il sito non è cambiato"; exit 1; }
[ "$(timeout 30 git ls-remote origin refs/heads/main | cut -f1)" = "$NUOVO" ] || { echo "ERRORE: GitHub non ha il commit nuovo"; exit 1; }
echo "   main = ${NUOVO:0:7}; aspetto GitHub Pages"
for i in $(seq 1 16); do
  if curl -s "https://www.magaverse.it/?x=$RANDOM" | grep -q "saga.css"; then echo "   online dopo circa $((i*15)) s"; break; fi
  sleep 15
done
MV_BASE=https://www.magaverse.it "$PY" strumenti/controlla.py $PAGINE 2>&1 | sed 's/^/   /'
[ "${PIPESTATUS[0]}" = 0 ] || { echo "ERRORE sul sito vero: valuta subito MV_OK_MATTEO=si bash strumenti/ritorno.sh --vero $TAG"; exit 1; }
echo "ESITO: rilascio fatto e controllato. Tag di ripristino: $TAG"
