#!/usr/bin/env bash
# Pubblica il branch redesign-grafica in /anteprima/redesign su main (solo quella cartella)
set -e
MSG="${1:-Anteprima aggiornata}"
QUI="$(cd "$(dirname "$0")/.." && pwd)"
MAIN="${MV_MAIN:-$QUI/../magaverse-main}"
cd "$MAIN"
git fetch -q origin main && git merge -q --ff-only origin/main
python3 "$QUI/strumenti/build_preview.py"
git add -A anteprima/redesign
if git diff --cached --quiet; then echo "niente da pubblicare"; exit 0; fi
git commit -qm "$MSG

Solo /anteprima/redesign: nessuna pagina pubblica modificata.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
"
ALTRI=$(git diff --name-only HEAD~1 | grep -v "^anteprima/redesign/" | wc -l)
[ "$ALTRI" = "0" ] || { echo "ATTENZIONE: tocca altri file, annullo"; git reset -q --hard HEAD~1; exit 1; }
timeout 280 git -c push.negotiate=true push -q origin anteprima-redesign:main 2>&1 | grep -v "^remote:" | tail -2
cd "$QUI" && timeout 180 git -c push.negotiate=true push -q origin redesign-grafica 2>&1 | grep -v "^remote:" | tail -1
echo "pubblicato"
