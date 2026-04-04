#!/bin/bash
# ============================================
# VERCEL ENV-VAR SETUP — DreamCode Final
# ============================================
# Liest /tmp/stripe_price_ids.env und setzt
# alle Keys als Vercel Environment Variables
# fuer production + preview.
#
# Voraussetzung: vercel CLI eingeloggt
# Ausfuehrung:   ./scripts/vercel-set-env.sh
# ============================================
set -euo pipefail

INPUT="/tmp/stripe_price_ids.env"
PROJECT_DIR="/home/dejavu/DreamCodeApp-current"

if [ ! -f "$INPUT" ]; then
  echo "FEHLER: $INPUT nicht gefunden."
  echo "Zuerst ausfuehren: ./scripts/stripe-create-prices.sh"
  exit 1
fi

cd "$PROJECT_DIR"

echo ""
echo "=== Vercel Env-Vars setzen ==="
echo "Quelle: $INPUT"
echo ""

TOTAL=0; OK=0; FAIL=0; SKIP=0

while IFS= read -r line; do
  # Kommentare, Leerzeilen, Zeilen ohne = ueberspringen
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line// /}" ]] && continue
  [[ "$line" != *"="* ]] && continue

  KEY="${line%%=*}"
  VALUE="${line#*=}"

  # Nur STRIPE_ Keys setzen
  [[ "$KEY" != STRIPE_* ]] && { SKIP=$((SKIP+1)); continue; }

  TOTAL=$((TOTAL+1))
  printf "  [%02d] %-42s " "$TOTAL" "$KEY"

  # Bestehende Variable loeschen (falls vorhanden)
  printf "y\n" | vercel env rm "$KEY" production 2>/dev/null || true
  printf "y\n" | vercel env rm "$KEY" preview    2>/dev/null || true

  # Neu setzen fuer production + preview
  if echo "$VALUE" | vercel env add "$KEY" production 2>/dev/null && \
     echo "$VALUE" | vercel env add "$KEY" preview    2>/dev/null; then
    echo "OK"
    OK=$((OK+1))
  else
    echo "FAIL"
    FAIL=$((FAIL+1))
  fi

done < "$INPUT"

echo ""
echo "============================================"
echo "  Gesetzt:  $OK / $TOTAL"
echo "  Fehler:   $FAIL"
echo "  Ignoriert: $SKIP (Kommentare/Header)"
echo ""
echo "  Verifikation:"
echo "    vercel env ls | grep STRIPE_PRICE | wc -l"
echo "    vercel env ls | grep STRIPE_COIN  | wc -l"
echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "  Alles gesetzt. Naechster Schritt:"
  echo "    ./scripts/deploy-checklist.sh"
else
  echo "  $FAIL Fehler — manuell pruefen:"
  echo "    vercel env ls | grep STRIPE"
fi
echo "============================================"
