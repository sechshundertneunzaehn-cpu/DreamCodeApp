#!/bin/bash
# ============================================
# DEPLOY PRE-FLIGHT CHECK — DreamCode Final
# ============================================
# Prueft: TS, Build, Bundle, Preise, Migration,
#         Env-Vars, Git-Status
#
# Ausfuehrung: ./scripts/deploy-checklist.sh
# ============================================
set -euo pipefail
cd /home/dejavu/DreamCodeApp-current

PASS=0; FAIL=0; SKIP=0

check() {
  local desc=$1 ok=$2
  if [ "$ok" -eq 0 ]; then
    printf "  [OK]   %s\n" "$desc"; PASS=$((PASS+1))
  else
    printf "  [FAIL] %s\n" "$desc"; FAIL=$((FAIL+1))
  fi
}
skip() { printf "  [SKIP] %s\n" "$1"; SKIP=$((SKIP+1)); }

echo ""
echo "=== DREAMCODE DEPLOY PRE-FLIGHT ==="
echo ""

# ── 1. TypeScript ────────────────────────────
echo "--- TypeScript ---"
TS_NEW=$(npx tsc --noEmit 2>&1 \
  | grep "error TS" \
  | grep -v "scripts/" | grep -v "supabase/" | grep -v "backup" \
  | grep -v "ErrorBoundary" | grep -v "Onboarding" | grep -v "claudeService" \
  | wc -l)
check "Keine neuen TS-Fehler (gefunden: $TS_NEW)" "$([ "$TS_NEW" -eq 0 ] && echo 0 || echo 1)"

# ── 2. Build ─────────────────────────────────
echo "--- Build ---"
if npm run build > /tmp/dc_build.log 2>&1; then
  check "Build erfolgreich" 0
else
  check "Build erfolgreich" 1
  echo "       → Log: /tmp/dc_build.log"
fi

# ── 3. Bundle: alte Tier-Namen weg ───────────
echo "--- Bundle ---"
OLD=$(grep -rl 'SubscriptionTier\.PLUS\|SubscriptionTier\.DELUXE' dist/assets/*.js 2>/dev/null | wc -l)
check "Kein PLUS/DELUXE im Bundle" "$([ "$OLD" -eq 0 ] && echo 0 || echo 1)"

NEW=$(grep -rl 'PREMIUM\|MEISTGEW' dist/assets/*.js 2>/dev/null | wc -l)
check "PREMIUM im Bundle vorhanden" "$([ "$NEW" -gt 0 ] && echo 0 || echo 1)"

# ── 4. pricing.ts Werte ─────────────────────
echo "--- Pricing-Werte ---"
check_val() {
  local pat=$1 desc=$2
  local n=$(grep -c "$pat" config/pricing.ts 2>/dev/null || echo 0)
  check "$desc" "$([ "$n" -gt 0 ] && echo 0 || echo 1)"
}

check_val "LIVE_VOICE_30MIN: 100"   "Live Voice = 100 Coins"
check_val "MAX_FREE_COINS_DAILY: 15" "Max Free Coins = 15/Tag"
check_val "IMAGE_STANDARD: 5"       "Bild Standard = 5 Coins"
check_val "IMAGE_HD: 12"            "Bild HD = 12 Coins"
check_val "TEXT_PREMIUM_6P: 12"     "Claude 6P = 12 Coins"

# ── 5. Regionale Preise ─────────────────────
echo "--- Regionale Preise ---"
check_val "monthly: 49.99"   "Saudi PRO = 49,99 SAR/Mo"
check_val "monthly: 149.99"  "Saudi PREMIUM = 149,99 SAR/Mo"
check_val "monthly: 299.99"  "Saudi VIP = 299,99 SAR/Mo"
check_val "monthly: 3.49"    "Arab arm PRO = \$3,49/Mo"
check_val "monthly: 79.99"   "Tuerkei PRO = 79,99 TL/Mo"
check_val "monthly: 249,"    "Russland PRO = 249 RUB/Mo"

# ── 6. STRIPE_AMOUNTS ───────────────────────
echo "--- STRIPE_AMOUNTS ---"
check_val "PRO_MONTHLY: 499,"     "DACH PRO = 499 Cents"
check_val "PRO_MONTHLY: 4999,"    "Saudi PRO = 4999 Halalas"
check_val "VIP_MONTHLY: 29999"    "Saudi VIP = 29999 Halalas"
check_val "COINS_7000: 49999"     "Royal Coins = 49999 Halalas"

# ── 7. Neue Dateien ─────────────────────────
echo "--- Neue Dateien ---"
check "services/regionService.ts" "$([ -f services/regionService.ts ] && echo 0 || echo 1)"
check "api/detect-region.ts"      "$([ -f api/detect-region.ts ] && echo 0 || echo 1)"

# ── 8. Storage Migration ────────────────────
echo "--- Migration ---"
MIG=$(grep -c "migrateTier" services/storage.ts 2>/dev/null || echo 0)
check "Tier-Migration in storage.ts ($MIG Refs)" "$([ "$MIG" -gt 0 ] && echo 0 || echo 1)"

# ── 9. Enum ─────────────────────────────────
echo "--- Enum ---"
HAS_PREMIUM=$(grep -c "PREMIUM = 'PREMIUM'" types.ts 2>/dev/null || echo 0)
NO_PLUS=$(grep -c "PLUS = 'PLUS'" types.ts 2>/dev/null || echo 0)
NO_DELUXE=$(grep -c "DELUXE = 'DELUXE'" types.ts 2>/dev/null || echo 0)
check "Enum hat PREMIUM"    "$([ "$HAS_PREMIUM" -gt 0 ] && echo 0 || echo 1)"
check "Enum ohne PLUS"      "$([ "$NO_PLUS" -eq 0 ] && echo 0 || echo 1)"
check "Enum ohne DELUXE"    "$([ "$NO_DELUXE" -eq 0 ] && echo 0 || echo 1)"

# ── 10. Vercel Env-Vars ─────────────────────
echo "--- Vercel Env-Vars ---"
if command -v vercel &> /dev/null; then
  SUB_VARS=$(vercel env ls 2>/dev/null | grep -c "STRIPE_PRICE" || echo 0)
  COIN_VARS=$(vercel env ls 2>/dev/null | grep -c "STRIPE_COIN" || echo 0)
  TOTAL_VARS=$((SUB_VARS + COIN_VARS))
  check "Stripe Env-Vars auf Vercel ($TOTAL_VARS Stueck, erwartet ~58)" \
    "$([ "$TOTAL_VARS" -ge 30 ] && echo 0 || echo 1)"
else
  skip "vercel CLI nicht installiert — manuell pruefen"
fi

# ── 11. Git ──────────────────────────────────
echo "--- Git ---"
DIRTY=$(git status --porcelain 2>/dev/null | wc -l)
check "Alle Aenderungen committed ($DIRTY offen)" "$([ "$DIRTY" -eq 0 ] && echo 0 || echo 1)"

BRANCH=$(git branch --show-current 2>/dev/null)
check "Branch: $BRANCH" "$([ -n "$BRANCH" ] && echo 0 || echo 1)"

# ── Ergebnis ─────────────────────────────────
echo ""
echo "============================================"
echo "  Bestanden: $PASS  |  Fehlgeschlagen: $FAIL  |  Uebersprungen: $SKIP"
echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "  BEREIT ZUM DEPLOY"
  echo ""
  echo "  Deploy-Schritte:"
  echo "    1. git add -A && git commit -m 'feat: pricing overhaul'"
  echo "    2. git push origin $BRANCH"
  echo "    3. vercel --prod"
  echo "    4. curl -s https://dream-code.app | grep -i premium"
else
  echo "  NICHT BEREIT — $FAIL Checks fehlgeschlagen"
fi
echo "============================================"
