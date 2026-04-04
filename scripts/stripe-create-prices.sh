#!/bin/bash
# ============================================
# STRIPE PRICE CREATION — DreamCode Final
# 5 Products, 53 Prices, 5 Regionen
# ============================================
# Quelle: config/pricing.ts STRIPE_AMOUNTS
#
# Voraussetzung: stripe CLI eingeloggt
# Ausfuehrung:   ./scripts/stripe-create-prices.sh
# Output:        /tmp/stripe_price_ids.env
# ============================================
set -euo pipefail

OUT="/tmp/stripe_price_ids.env"
cat > "$OUT" <<EOF
# DreamCode Stripe Price IDs
# Erstellt: $(date '+%Y-%m-%d %H:%M')
# 5 Regionen: DE(EUR) SA(SAR) EG(USD) TR(TRY) RU(RUB)
EOF

CREATED=0
FAILED=0

# --- Helpers ---
json_id() { grep '"id"' | head -1 | sed 's/.*"id": "//;s/".*//'; }

make_sub() {
  local prod=$1 cur=$2 amt=$3 int=$4 key=$5 nick=$6
  printf "  %-42s " "$key"
  local pid
  pid=$(stripe prices create --product="$prod" --currency="$cur" \
    --unit-amount="$amt" -d "recurring[interval]=$int" \
    --nickname="$nick" --format=json 2>/dev/null | json_id) || true
  if [ -n "$pid" ]; then
    echo "$key=$pid" >> "$OUT"; echo "$pid"; CREATED=$((CREATED+1))
  else
    echo "FEHLER"; FAILED=$((FAILED+1))
  fi
}

make_once() {
  local prod=$1 cur=$2 amt=$3 key=$4 nick=$5
  printf "  %-42s " "$key"
  local pid
  pid=$(stripe prices create --product="$prod" --currency="$cur" \
    --unit-amount="$amt" \
    --nickname="$nick" --format=json 2>/dev/null | json_id) || true
  if [ -n "$pid" ]; then
    echo "$key=$pid" >> "$OUT"; echo "$pid"; CREATED=$((CREATED+1))
  else
    echo "FEHLER"; FAILED=$((FAILED+1))
  fi
}

make_product() {
  local name=$1 desc=$2
  stripe products create --name="$name" --description="$desc" \
    --format=json 2>/dev/null | json_id
}

# ══════════════════════════════════════════════
# PRODUCTS (5)
# ══════════════════════════════════════════════
echo ""
echo "=== PRODUCTS ==="

P_PRO=$(make_product "DreamCode Pro" \
  "Unbegrenzte Deutungen, Gemini KI, 9 Traditionen, 100 Coins/Mo")
P_PREM=$(make_product "DreamCode Premium" \
  "Claude 6P, HD-Bilder, Videos, Live Voice, 500 Coins/Mo")
P_VIP=$(make_product "DreamCode VIP" \
  "Exklusiv Gulf, 2000 Coins/Mo, Traumtagebuch, WhatsApp-Support")
P_SMART=$(make_product "DreamCode Smart (BYOK)" \
  "Eigene API-Keys, Jahresabo, 50 Coins/Mo")
P_COINS=$(make_product "DreamCode Coins" \
  "Muenzen fuer Traumdeutung, Bilder, Videos und mehr")

echo "  Pro=$P_PRO  Premium=$P_PREM  VIP=$P_VIP  Smart=$P_SMART  Coins=$P_COINS"
{
  echo ""
  echo "# Products"
  echo "STRIPE_PRODUCT_PRO=$P_PRO"
  echo "STRIPE_PRODUCT_PREMIUM=$P_PREM"
  echo "STRIPE_PRODUCT_VIP=$P_VIP"
  echo "STRIPE_PRODUCT_SMART=$P_SMART"
  echo "STRIPE_PRODUCT_COINS=$P_COINS"
} >> "$OUT"

# ══════════════════════════════════════════════
# DACH / EUR — 13 Prices
# Basis: PRO 4,99/49,99 | PREMIUM 14,99/149,99 | SMART 49,99/J
# ══════════════════════════════════════════════
echo ""
echo "=== DACH / EUR ==="
echo -e "\n# DACH (EUR)" >> "$OUT"

# Abos (8)
make_sub "$P_PRO"   eur   499   month "STRIPE_PRICE_PRO"              "Pro Mo EUR Default"
make_sub "$P_PRO"   eur   499   month "STRIPE_PRICE_PRO_DE"           "Pro Mo EUR DACH"
make_sub "$P_PRO"   eur  4999   year  "STRIPE_PRICE_PRO_YEARLY"       "Pro Jr EUR Default"
make_sub "$P_PRO"   eur  4999   year  "STRIPE_PRICE_PRO_DE_YEARLY"    "Pro Jr EUR DACH"
make_sub "$P_PREM"  eur  1499   month "STRIPE_PRICE_PREMIUM"          "Premium Mo EUR Default"
make_sub "$P_PREM"  eur  1499   month "STRIPE_PRICE_PREMIUM_DE"       "Premium Mo EUR DACH"
make_sub "$P_PREM"  eur 14999   year  "STRIPE_PRICE_PREMIUM_YEARLY"   "Premium Jr EUR Default"
make_sub "$P_PREM"  eur 14999   year  "STRIPE_PRICE_PREMIUM_DE_YEARLY" "Premium Jr EUR DACH"
make_sub "$P_SMART" eur  4999   year  "STRIPE_PRICE_SMART"            "Smart Jr EUR Default"
make_sub "$P_SMART" eur  4999   year  "STRIPE_PRICE_SMART_DE"         "Smart Jr EUR DACH"

# Coins (5)
make_once "$P_COINS" eur   99  "STRIPE_COIN_PRICE_STARTER"   "50 Coins 0,99EUR"
make_once "$P_COINS" eur  199  "STRIPE_COIN_PRICE_POPULAR"   "150 Coins 1,99EUR"
make_once "$P_COINS" eur  499  "STRIPE_COIN_PRICE_VALUE"     "400 Coins 4,99EUR"
make_once "$P_COINS" eur  999  "STRIPE_COIN_PRICE_PREMIUM"   "900 Coins 9,99EUR"
make_once "$P_COINS" eur 2499  "STRIPE_COIN_PRICE_MEGA"      "2500 Coins 24,99EUR"

# ══════════════════════════════════════════════
# SAUDI + GULF / SAR — 13 Prices
# +150%: PRO 49,99/499,99 | PREMIUM 149,99/1499,99
# VIP 299,99/2999,99 | SMART 199,99/J | Royal 499,99
# ══════════════════════════════════════════════
echo ""
echo "=== SAUDI + GULF / SAR ==="
echo -e "\n# SAUDI (SAR)" >> "$OUT"

# Abos (7)
make_sub "$P_PRO"   sar   4999  month "STRIPE_PRICE_PRO_SA"              "Pro Mo SAR Gulf"
make_sub "$P_PRO"   sar  49999  year  "STRIPE_PRICE_PRO_SA_YEARLY"       "Pro Jr SAR Gulf"
make_sub "$P_PREM"  sar  14999  month "STRIPE_PRICE_PREMIUM_SA"          "Premium Mo SAR Gulf"
make_sub "$P_PREM"  sar 149999  year  "STRIPE_PRICE_PREMIUM_SA_YEARLY"   "Premium Jr SAR Gulf"
make_sub "$P_VIP"   sar  29999  month "STRIPE_PRICE_VIP_SA"              "VIP Mo SAR Gulf"
make_sub "$P_VIP"   sar 299999  year  "STRIPE_PRICE_VIP_SA_YEARLY"       "VIP Jr SAR Gulf"
make_sub "$P_SMART" sar  19999  year  "STRIPE_PRICE_SMART_SA"            "Smart Jr SAR Gulf"

# Coins (6, inkl. Royal)
make_once "$P_COINS" sar   999  "STRIPE_COIN_PRICE_STARTER_SA"  "50 Coins 9,99SAR"
make_once "$P_COINS" sar  1999  "STRIPE_COIN_PRICE_POPULAR_SA"  "150 Coins 19,99SAR"
make_once "$P_COINS" sar  4999  "STRIPE_COIN_PRICE_VALUE_SA"    "400 Coins 49,99SAR"
make_once "$P_COINS" sar  9999  "STRIPE_COIN_PRICE_PREMIUM_SA"  "900 Coins 99,99SAR"
make_once "$P_COINS" sar 24999  "STRIPE_COIN_PRICE_MEGA_SA"     "2500 Coins 249,99SAR"
make_once "$P_COINS" sar 49999  "STRIPE_COIN_PRICE_ROYAL_SA"    "7000 Coins 499,99SAR Royal"

# ══════════════════════════════════════════════
# ARABISCH ARM / USD — 10 Prices
# -30%: PRO $3,49/$34,99 | PREMIUM $9,99/$99,99 | SMART $29,99/J
# ══════════════════════════════════════════════
echo ""
echo "=== ARABISCH ARM / USD ==="
echo -e "\n# ARAB (USD)" >> "$OUT"

# Abos (5)
make_sub "$P_PRO"   usd  349  month "STRIPE_PRICE_PRO_EG"              "Pro Mo USD Arab"
make_sub "$P_PRO"   usd 3499  year  "STRIPE_PRICE_PRO_EG_YEARLY"       "Pro Jr USD Arab"
make_sub "$P_PREM"  usd  999  month "STRIPE_PRICE_PREMIUM_EG"          "Premium Mo USD Arab"
make_sub "$P_PREM"  usd 9999  year  "STRIPE_PRICE_PREMIUM_EG_YEARLY"   "Premium Jr USD Arab"
make_sub "$P_SMART" usd 2999  year  "STRIPE_PRICE_SMART_EG"            "Smart Jr USD Arab"

# Coins (5)
make_once "$P_COINS" usd   69  "STRIPE_COIN_PRICE_STARTER_EG"  "50 Coins $0,69"
make_once "$P_COINS" usd  129  "STRIPE_COIN_PRICE_POPULAR_EG"  "150 Coins $1,29"
make_once "$P_COINS" usd  299  "STRIPE_COIN_PRICE_VALUE_EG"    "400 Coins $2,99"
make_once "$P_COINS" usd  599  "STRIPE_COIN_PRICE_PREMIUM_EG"  "900 Coins $5,99"
make_once "$P_COINS" usd 1499  "STRIPE_COIN_PRICE_MEGA_EG"     "2500 Coins $14,99"

# ══════════════════════════════════════════════
# TUERKEI / TRY — 10 Prices
# -60%: PRO 79,99/799 | PREMIUM 229,99/2299 | SMART 499/J
# ══════════════════════════════════════════════
echo ""
echo "=== TUERKEI / TRY ==="
echo -e "\n# TUERKEI (TRY)" >> "$OUT"

# Abos (5)
make_sub "$P_PRO"   try   7999  month "STRIPE_PRICE_PRO_TR"              "Pro Mo TRY"
make_sub "$P_PRO"   try  79900  year  "STRIPE_PRICE_PRO_TR_YEARLY"       "Pro Jr TRY"
make_sub "$P_PREM"  try  22999  month "STRIPE_PRICE_PREMIUM_TR"          "Premium Mo TRY"
make_sub "$P_PREM"  try 229900  year  "STRIPE_PRICE_PREMIUM_TR_YEARLY"   "Premium Jr TRY"
make_sub "$P_SMART" try  49900  year  "STRIPE_PRICE_SMART_TR"            "Smart Jr TRY"

# Coins (5)
make_once "$P_COINS" try  1499  "STRIPE_COIN_PRICE_STARTER_TR"  "50 Coins 14,99TL"
make_once "$P_COINS" try  2999  "STRIPE_COIN_PRICE_POPULAR_TR"  "150 Coins 29,99TL"
make_once "$P_COINS" try  7499  "STRIPE_COIN_PRICE_VALUE_TR"    "400 Coins 74,99TL"
make_once "$P_COINS" try 14999  "STRIPE_COIN_PRICE_PREMIUM_TR"  "900 Coins 149,99TL"
make_once "$P_COINS" try 37999  "STRIPE_COIN_PRICE_MEGA_TR"     "2500 Coins 379,99TL"

# ══════════════════════════════════════════════
# RUSSLAND / RUB — 10 Prices
# -55%: PRO 249/2499 | PREMIUM 749/7499 | SMART 1999/J
# ══════════════════════════════════════════════
echo ""
echo "=== RUSSLAND / RUB ==="
echo -e "\n# RUSSLAND (RUB)" >> "$OUT"

# Abos (5)
make_sub "$P_PRO"   rub  24900  month "STRIPE_PRICE_PRO_RU"              "Pro Mo RUB"
make_sub "$P_PRO"   rub 249900  year  "STRIPE_PRICE_PRO_RU_YEARLY"       "Pro Jr RUB"
make_sub "$P_PREM"  rub  74900  month "STRIPE_PRICE_PREMIUM_RU"          "Premium Mo RUB"
make_sub "$P_PREM"  rub 749900  year  "STRIPE_PRICE_PREMIUM_RU_YEARLY"   "Premium Jr RUB"
make_sub "$P_SMART" rub 199900  year  "STRIPE_PRICE_SMART_RU"            "Smart Jr RUB"

# Coins (5)
make_once "$P_COINS" rub   4900  "STRIPE_COIN_PRICE_STARTER_RU"  "50 Coins 49RUB"
make_once "$P_COINS" rub   9900  "STRIPE_COIN_PRICE_POPULAR_RU"  "150 Coins 99RUB"
make_once "$P_COINS" rub  24900  "STRIPE_COIN_PRICE_VALUE_RU"    "400 Coins 249RUB"
make_once "$P_COINS" rub  49900  "STRIPE_COIN_PRICE_PREMIUM_RU"  "900 Coins 499RUB"
make_once "$P_COINS" rub 119900  "STRIPE_COIN_PRICE_MEGA_RU"     "2500 Coins 1199RUB"

# ══════════════════════════════════════════════
# ZUSAMMENFASSUNG
# ══════════════════════════════════════════════
echo ""
echo "============================================"
echo "  Erstellt: $CREATED  |  Fehlgeschlagen: $FAILED"
echo "  Output:   $OUT"
echo ""
echo "  DACH:   10 Abo + 5 Coins  = 15"
echo "  Saudi:   7 Abo + 6 Coins  = 13"
echo "  Arab:    5 Abo + 5 Coins  = 10"
echo "  Tuerkei: 5 Abo + 5 Coins  = 10"
echo "  Russia:  5 Abo + 5 Coins  = 10"
echo "  ─────────────────────────────"
echo "  GESAMT:                    = $((CREATED + FAILED))/58"
echo ""
echo "  Naechster Schritt:"
echo "    cat $OUT"
echo "    ./scripts/vercel-set-env.sh"
echo "============================================"
