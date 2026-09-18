#!/bin/sh
set -eu
cd "$(dirname "$0")"
pandoc piano_transposition_manual.md -s -t html5 \
  --metadata pagetitle="Piano Without Fear of Black Keys" \
  --css style.css -o book.html
weasyprint book.html Piano_Without_Fear_of_Black_Keys.pdf
