#!/usr/bin/env bash
# Ritorno del sito vero a un tag di ripristino, con un commit nuovo sopra main (niente push forzati).
#
# uso:  bash strumenti/ritorno.sh [--prova | --vero] <tag>
#   --prova (predefinito) prepara il commit di ritorno solo in locale, mostra cosa cambierebbe e
#           prova il push con --dry-run (GitHub non viene modificato). Nessun tag, nessun ramo toccato.
#   --vero  spinge il commit su main: parte solo con MV_OK_MATTEO=si.
# Il commit di ritorno ha i file del tag, tranne la cartella anteprima/, che resta com'è su main.
# Se tra il tag e main ci sono altre correzioni al sito (fuori da anteprima/), lo script le elenca:
# verrebbero annullate anche quelle. Per questo il tag giusto è quello creato subito prima del rilascio.
set -u
MODO=--prova
case "${1:-}" in --prova|--vero) MODO="$1"; shift;; esac
TAG="${1:-}"
[ -n "$TAG" ] || { echo "uso: bash strumenti/ritorno.sh [--prova|--vero] <tag>"; exit 2; }
QUI="$(cd "$(dirname "$0")/.." && pwd)"
export GIT_AUTHOR_NAME=Claude GIT_AUTHOR_EMAIL=noreply@anthropic.com GIT_COMMITTER_NAME=Claude GIT_COMMITTER_EMAIL=noreply@anthropic.com
T0=$(date +%s)
cd "$QUI"
if [ "$MODO" = "--vero" ] && [ "${MV_OK_MATTEO:-}" != "si" ]; then
  echo "FERMO: il ritorno vero parte solo con MV_OK_MATTEO=si (lo imposta Matteo, non un agente)."; exit 3
fi
LAV="$(mktemp -d "${TMPDIR:-${TMP:-/tmp}}/mv-ritorno-XXXXXX")"
trap 'rm -rf "$LAV"' EXIT

timeout 60 git fetch -q origin main "refs/tags/$TAG:refs/tags/$TAG" 2>/dev/null || timeout 60 git fetch -q origin main || { echo "ERRORE: fetch fallito"; exit 1; }
git rev-parse -q --verify "refs/tags/$TAG^{commit}" >/dev/null || { echo "ERRORE: il tag $TAG non esiste"; exit 1; }
MAIN=$(git rev-parse origin/main); OBI=$(git rev-parse "$TAG^{commit}")
echo "origin/main = ${MAIN:0:7}   tag $TAG = ${OBI:0:7}"
git merge-base --is-ancestor "$OBI" "$MAIN" || echo "ATTENZIONE: il tag non è un antenato di main"

# Albero = tag, con anteprima/ presa da main (indice temporaneo: nessun file di lavoro toccato)
export GIT_INDEX_FILE="$LAV/indice"
git read-tree "$OBI"
git rm -r -q --cached --ignore-unmatch anteprima
git ls-tree -r -z --full-tree "$MAIN" -- anteprima | tr '\0' '\n' | while IFS=$'\t' read -r META PERCORSO; do
  set -- $META; printf '%s %s\t%s\n' "$1" "$3" "$PERCORSO"
done | git update-index --index-info
ALBERO=$(git write-tree); unset GIT_INDEX_FILE
if [ "$ALBERO" = "$(git rev-parse "$MAIN^{tree}")" ]; then echo "Niente da fare: main ha già i file del tag."; exit 0; fi
RIT=$(git commit-tree "$ALBERO" -p "$MAIN" -m "Ritorno del sito alla versione del tag $TAG

Il sito pubblico torna com'era al tag (la cartella anteprima/ resta invariata).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>")
echo "commit di ritorno preparato (solo locale): ${RIT:0:7}"
git diff --name-status --no-renames "$MAIN" "$RIT" > "$LAV/diff"
printf 'rispetto a main: aggiunti %s  cambiati %s  tolti %s\n' "$(grep -c '^A' "$LAV/diff")" "$(grep -c '^M' "$LAV/diff")" "$(grep -c '^D' "$LAV/diff")"
echo "commit tra il tag e main che toccano il sito (verrebbero annullati):"
git log --format='  %h %s' "$OBI..$MAIN" -- . ':!anteprima' | head -15
# Il ritorno deve annullare solo il rilascio del redesign: se annulla altro (es. correzioni di sicurezza) si ferma.
ALTRI=$(git log --format='%h %s' "$OBI..$MAIN" -- . ':!anteprima' | grep -vc "Rilascio del redesign")
if [ "$ALTRI" != 0 ]; then
  echo "BLOCCO: il ritorno annullerebbe $ALTRI commit che non sono il rilascio del redesign (vedi elenco sopra)."
  echo "        Usa il tag creato da rilascio.sh subito prima del rilascio. Solo se Matteo lo vuole davvero: MV_FORZA_RITORNO=si."
  if [ "$MODO" = "--vero" ] && [ "${MV_FORZA_RITORNO:-}" != "si" ]; then exit 4; fi
fi

if [ "$MODO" = "--prova" ]; then
  echo "prova del push (--dry-run, GitHub non cambia):"
  timeout 120 git push --dry-run origin "$RIT:refs/heads/main" 2>&1 | grep -v "^remote:" | sed 's/^/  /'
  echo "comando vero: git push origin ${RIT:0:12}:refs/heads/main   (oppure MV_OK_MATTEO=si bash strumenti/ritorno.sh --vero $TAG)"
  echo "durata: $(( $(date +%s) - T0 )) s. Niente è stato pubblicato."; exit 0
fi

timeout 280 git -c push.negotiate=true push -q origin "$RIT:refs/heads/main" || { echo "FERMO: push rifiutato (main cambiato?): rilancia"; exit 1; }
[ "$(timeout 30 git ls-remote origin refs/heads/main | cut -f1)" = "$RIT" ] || { echo "ERRORE: GitHub non ha il commit di ritorno"; exit 1; }
echo "main = ${RIT:0:7} spinto in $(( $(date +%s) - T0 )) s; aspetto GitHub Pages"
for i in $(seq 1 12); do
  if ! curl -s "https://www.magaverse.it/?x=$RANDOM" | grep -q "saga.css"; then echo "sito tornato dopo circa $((i*10)) s (totale $(( $(date +%s) - T0 )) s)"; exit 0; fi
  sleep 10
done
echo "ATTENZIONE: dopo 2 minuti la home ha ancora la nuova grafica (Pages lento?): controlla a mano"; exit 1
