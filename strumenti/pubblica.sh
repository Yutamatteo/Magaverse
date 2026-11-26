#!/usr/bin/env bash
# Pubblica il branch redesign-grafica in /anteprima/redesign su main (solo quella cartella)
set -e
MSG="${1:-Anteprima aggiornata}"
QUI="$(cd "$(dirname "$0")/.." && pwd)"
MAIN="${MV_MAIN:-$QUI/../magaverse-main}"
cd "$MAIN"
git fetch -q origin main && git merge -q --ff-only origin/main
python3 "$QUI/strumenti/build_preview.py"
# Spinge un ramo senza forzare. Non usa pipe sul comando git: così il suo codice di uscita non si perde.
spingi() { # $1 = secondi massimi, resto = argomenti di git push
  local t="$1"; shift
  local out rc
  out=$(timeout "$t" git -c push.negotiate=true push -q "$@" 2>&1); rc=$?
  [ -z "$out" ] || { printf '%s
' "$out" | grep -v "^remote:" | tail -2 || true; }
  [ "$rc" = "0" ] || echo "ERRORE: push fallito (codice $rc): git push $*"
  return "$rc"
}
# Spinge su main i commit dell'anteprima (solo anteprima/redesign/) e poi il ramo di lavoro.
pubblica_main() {
  local ALTRI
  ALTRI=$(git diff --name-only origin/main..HEAD | grep -v "^anteprima/redesign/" | wc -l)
  [ "$ALTRI" = "0" ] || { echo "ATTENZIONE: i commit da spingere toccano altri file, non spingo"; return 1; }
  spingi 280 origin anteprima-redesign:main || { echo "NON pubblicato: il commit resta in locale in $MAIN; rilancia lo script per riprovare"; return 1; }
  cd "$QUI" && spingi 180 origin redesign-grafica || { echo "NON pubblicato: main è aggiornato ma il push di redesign-grafica è fallito"; return 1; }
  echo "pubblicato"
}
git add -A anteprima/redesign
if git diff --cached --quiet; then
  # Un push di main andato male in precedenza lascia il commit solo in locale: lo recuperiamo qui.
  INDIETRO=$(git rev-list --count origin/main..HEAD)
  if [ "$INDIETRO" -gt 0 ]; then
    echo "trovati $INDIETRO commit dell'anteprima non ancora su origin/main (push precedente fallito?): li spingo"
    pubblica_main; exit $?
  fi
  echo "niente da pubblicare"; exit 0
fi
git commit -qm "$MSG

Solo /anteprima/redesign: nessuna pagina pubblica modificata.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
"
ALTRI=$(git diff --name-only HEAD~1 | grep -v "^anteprima/redesign/" | wc -l)
[ "$ALTRI" = "0" ] || { echo "ATTENZIONE: tocca altri file, annullo"; git reset -q --hard HEAD~1; exit 1; }
pubblica_main; exit $?
