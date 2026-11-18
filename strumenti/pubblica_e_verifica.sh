#!/usr/bin/env bash
# Pubblica l'anteprima e verifica davvero che sia arrivata (GitHub e sito), in un solo comando.
# uso: bash strumenti/pubblica_e_verifica.sh "messaggio" [percorso/pagina.html "testo da trovare online"]
# - prepara da solo python3 (su questo PC si chiama py) e l'identità git
# - lancia strumenti/pubblica.sh
# - controlla che GitHub abbia lo stesso commit del ramo redesign-grafica
# - se passi pagina e testo, aspetta (max ~3 minuti) che il testo compaia nell'anteprima online
set -u
MSG="${1:?serve il messaggio}"
PAG="${2:-}"; TESTO="${3:-}"
QUI="$(cd "$(dirname "$0")/.." && pwd)"
BIN="${TMPDIR:-${TMP:-/tmp}}/mvbin"; mkdir -p "$BIN"
[ -x "$BIN/python3" ] || { printf '#!/bin/sh\nexec py "$@"\n' > "$BIN/python3"; chmod +x "$BIN/python3"; }
export PATH="$BIN:$PATH" GIT_AUTHOR_NAME=Claude GIT_AUTHOR_EMAIL=noreply@anthropic.com GIT_COMMITTER_NAME=Claude GIT_COMMITTER_EMAIL=noreply@anthropic.com
cd "$QUI"
bash strumenti/pubblica.sh "$MSG" 2>&1 | grep -v "LF will be" | tail -3
LOCALE=$(git rev-parse HEAD)
REMOTO=$(timeout 30 git ls-remote origin refs/heads/redesign-grafica | cut -f1)
# Se l'anteprima non è cambiata (commit solo su strumenti/ ecc.) pubblica.sh esce prima del push
# del ramo: lo spingiamo qui, senza forzare, così il commit non resta solo in locale.
if [ "$LOCALE" != "$REMOTO" ]; then
  timeout 180 git -c push.negotiate=true push -q origin redesign-grafica 2>&1 | grep -v "^remote:" | tail -2
  REMOTO=$(timeout 30 git ls-remote origin refs/heads/redesign-grafica | cut -f1)
fi
if [ "$LOCALE" != "$REMOTO" ]; then echo "ERRORE: GitHub ha $REMOTO, in locale c'è $LOCALE (push non arrivato)"; exit 1; fi
echo "OK GitHub: redesign-grafica = ${LOCALE:0:7}"
if [ -n "$PAG" ] && [ -n "$TESTO" ]; then
  for i in $(seq 1 12); do
    if curl -s "https://www.magaverse.it/anteprima/redesign/$PAG?x=$RANDOM" | grep -qF "$TESTO"; then echo "OK online: $PAG"; exit 0; fi
    sleep 15
  done
  echo "ATTENZIONE: dopo 3 minuti il testo non è ancora online su $PAG (GitHub Pages lento?)"; exit 2
fi
