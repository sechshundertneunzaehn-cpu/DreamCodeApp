// ============================================
// DREAM CODE - ZENTRALE PREISKONFIGURATION
// ============================================
// Letzte Aktualisierung: 05.04.2026
// Neue Tier-Struktur: Free/Pro/Premium/Smart + VIP (Gulf)
// Regionale Preise: DACH, Gulf, Arabisch, TR, RU
// ============================================

// --- MUENZWERT ---
export const COIN_VALUE_EUR = 0.0199; // 1 Muenze = 0,0199 EUR

// --- MUENZPAKETE (DACH Standard / EUR) ---
export const COIN_PACKAGES = {
  STARTER:  { coins: 50,   price: 0.99,  id: 'starter_50',   perCoin: 0.0198, discount: 0,  label: 'Zum Testen' },
  POPULAR:  { coins: 150,  price: 1.99,  id: 'popular_150',  perCoin: 0.0133, discount: 33, label: 'BESTSELLER', badge: 'Beliebt', highlight: true },
  VALUE:    { coins: 400,  price: 4.99,  id: 'value_400',    perCoin: 0.0125, discount: 37, label: 'Beliebt' },
  PREMIUM:  { coins: 900,  price: 9.99,  id: 'premium_900',  perCoin: 0.0111, discount: 44, label: 'Mehr sparen' },
  MEGA:     { coins: 2500, price: 24.99, id: 'mega_2500',    perCoin: 0.0100, discount: 50, label: 'Power User', badge: 'Bester Wert' },
};

// --- ABO-STUFEN (DACH Standard) ---
export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price_monthly: 0,
    price_yearly: 0,
    names: { de: 'Free', en: 'Free', ar: '\u0645\u062C\u0627\u0646\u064A', tr: '\u00DCcretsiz', ru: '\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u044B\u0439' },
    features: {
      daily_interpretations: 3,
      ai_model: 'groq',
      traditions: 6,
      source_filter: false,
      ads: true,
      coins_monthly: 0,
      coin_discount: 0,
      hd_images: false,
      videos_monthly: 0,
      live_voice: false,
      ai_chat_premium: false,
      priority_support: false,
    }
  },

  PRO: {
    id: 'pro',
    name: 'Pro',
    price_monthly: 4.99,
    price_yearly: 49.99,
    names: { de: 'Pro', en: 'Pro', ar: '\u0628\u0631\u0648', tr: 'Pro', ru: '\u041F\u0440\u043E' },
    badge: { de: 'MEISTGEW\u00C4HLT', en: 'MOST POPULAR', ar: '\u0627\u0644\u0623\u0643\u062B\u0631 \u0634\u0639\u0628\u064A\u0629' },
    features: {
      daily_interpretations: -1,
      ai_model: 'gemini',
      traditions: 9,
      source_filter: true,
      ads: false,
      coins_monthly: 100,
      coin_discount: 0.10,
      hd_images: false,
      videos_monthly: 0,
      live_voice: false,
      ai_chat_premium: false,
      priority_support: false,
    }
  },

  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price_monthly: 14.99,
    price_yearly: 149.99,
    strikethrough_monthly: 24.99,
    names: { de: 'Premium', en: 'Premium', ar: '\u0628\u0631\u064A\u0645\u064A\u0648\u0645', tr: 'Premium', ru: '\u041F\u0440\u0435\u043C\u0438\u0443\u043C' },
    features: {
      daily_interpretations: -1,
      ai_model: 'claude',
      traditions: 9,
      source_filter: true,
      ads: false,
      coins_monthly: 500,
      coin_discount: 0.20,
      hd_images: true,
      videos_monthly: 5,
      live_voice: true,
      ai_chat_premium: true,
      priority_support: false,
    }
  },

  SMART: {
    id: 'smart',
    name: 'Smart',
    price_monthly: null as number | null,
    price_yearly: 49.99,
    names: { de: 'Smart', en: 'Smart', ar: '\u0630\u0643\u064A', tr: 'Ak\u0131ll\u0131', ru: '\u0421\u043C\u0430\u0440\u0442' },
    subtitle: { de: 'Eigene API-Keys nutzen', en: 'Bring Your Own Keys', ar: '\u0627\u0633\u062A\u062E\u062F\u0645 \u0645\u0641\u0627\u062A\u064A\u062D\u0643' },
    features: {
      daily_interpretations: -1,
      ai_model: 'byok',
      traditions: 9,
      source_filter: true,
      ads: false,
      coins_monthly: 50,
      coin_discount: 0.10,
      hd_images: true,
      videos_monthly: 3,
      live_voice: true,
      ai_chat_premium: true,
      priority_support: false,
    }
  },
};

// --- FEATURE-PREISE IN MUENZEN ---
export const FEATURE_PRICES = {
  // Traumdeutung
  TEXT_BASIC: 2,          // GROQ/Llama     -> API ~0,001EUR -> Marge 97%
  TEXT_GEMINI: 3,         // Gemini          -> API ~0,005EUR -> Marge 92%
  TEXT_PREMIUM_6P: 12,    // Claude 6P       -> API ~0,03EUR  -> Marge 88%

  // Bildgenerierung
  IMAGE_STANDARD: 5,      // Runware 512px   -> API 0,002EUR  -> Marge 98%
  IMAGE_HD: 12,           // Runware 1024px  -> API 0,004EUR  -> Marge 98%

  // Video
  VIDEO_6S: 15,           // Replicate 6s    -> API ~0,08EUR  -> Marge 73%
  VIDEO_10S: 25,          // Replicate 10s   -> API ~0,15EUR  -> Marge 70%
  VIDEO_15S: 40,          // Replicate 15s   -> API ~0,25EUR  -> Marge 69%
  VIDEO_30S: 80,          // Replicate 30s   -> API ~0,48EUR  -> Marge 70%

  // Slideshow (guenstige Alternative)
  SLIDESHOW_5S: 5,        // Bilder + Musik  -> API ~0,02EUR  -> Marge 90%
  SLIDESHOW_10S: 8,
  SLIDESHOW_30S: 15,

  // PDF & Export
  PDF_TEXT: 2,            // Server-seitig   -> API ~0,001EUR -> Marge 97%
  PDF_WITH_IMAGES: 5,     //                 -> API ~0,005EUR -> Marge 95%
  PDF_PREMIUM_6P: 12,     // 6P + Bilder     -> API ~0,035EUR -> Marge 85%
  PDF_EMAIL: 1,           // Weiterleitung   -> API ~0,001EUR -> Marge 95%

  // Audio
  STT_PER_MINUTE: 4,      // Deepgram        -> API 0,004EUR/m -> Marge 95%
  TTS_PER_1K_CHARS: 6,    // ElevenLabs      -> API 0,018EUR   -> Marge 85%

  // Chat
  AI_CHAT_10MSG: 5,        // Gemini/GROQ    -> API ~0,01EUR  -> Marge 90%
  AI_CHAT_PREMIUM: 12,     // Claude         -> API ~0,05EUR  -> Marge 79%

  // Live Voice
  LIVE_VOICE_30MIN: 100,   // Gemini Live    -> API ~0,05EUR  -> Marge 97%
};

// --- GRATIS-MUENZEN / REWARDS ---
export const REWARDS = {
  // Login & Streaks
  DAILY_LOGIN: 1,
  STREAK_7_DAYS: 5,
  STREAK_30_DAYS: 20,

  // Werbung (nur Free-User)
  AD_15S: 1,
  AD_30S: 2,
  AD_60S: 4,
  AD_SPONSOR_2MIN: 2,

  // Social / Viral
  DREAM_SHARE: 3,
  REFERRAL_INVITER: 25,
  REFERRAL_NEW: 10,

  // Offerwall
  OFFERWALL_EASY: 10,
  OFFERWALL_MEDIUM: 25,
  OFFERWALL_HARD: 50,

  // Meilensteine
  DREAMS_SAVED_20: 1,
  FIRST_SHARE: 10,

  // Tageslimits
  MAX_FREE_COINS_DAILY: 15,
  MAX_ADS_DAILY: 8,
};

// ================================================================
// REGIONALE PREISE — 5 Zonen, alle Abos + Coins
// DACH = Basis | Saudi +150% | Arab. arm -30% | TR -60% | RU -55%
// Wechselkurse: 1EUR = 4,05 SAR | 38 TL | 107 RUB | $1,09
// ================================================================
export const REGIONAL_PRICES = {

  // DACH — Deutschland, Oesterreich, Schweiz (Basis 100%)
  DE: {
    currency: 'EUR',
    symbol: '\u20AC',
    countries: ['DE', 'AT', 'CH'],
    tiers: {
      FREE:    { monthly: 0,     yearly: 0 },
      PRO:     { monthly: 4.99,  yearly: 49.99 },
      PREMIUM: { monthly: 14.99, yearly: 149.99, strikethrough: 24.99 },
      SMART:   { monthly: null,  yearly: 49.99 },
    },
    coins: [
      { id: 'starter',  coins: 50,   price: 0.99,  label: 'Zum Testen' },
      { id: 'popular',  coins: 150,  price: 1.99,  label: 'BESTSELLER', highlight: true },
      { id: 'value',    coins: 400,  price: 4.99,  label: 'Beliebt' },
      { id: 'premium',  coins: 900,  price: 9.99,  label: 'Mehr sparen' },
      { id: 'mega',     coins: 2500, price: 24.99, label: 'Power User' },
    ],
  },

  // SAUDI-ARABIEN + GOLF-STAATEN (+150% ueber DACH)
  SA: {
    currency: 'SAR',
    symbol: '\u0631.\u0633',
    countries: ['SA', 'AE', 'KW', 'BH', 'QA', 'OM'],
    tiers: {
      FREE:    { monthly: 0,       yearly: 0 },
      PRO:     { monthly: 49.99,   yearly: 499.99,  badge: '\u0627\u0644\u0623\u0643\u062B\u0631 \u0634\u0639\u0628\u064A\u0629' },
      PREMIUM: { monthly: 149.99,  yearly: 1499.99, strikethrough: 249.99 },
      VIP:     { monthly: 299.99,  yearly: 2999.99, badge: '\u062D\u0635\u0631\u064A \uD83D\uDC51' },
      SMART:   { monthly: null,    yearly: 199.99 },
    },
    vipFeatures: {
      daily_interpretations: -1,
      ai_model: 'claude',
      traditions: 9,
      source_filter: true,
      ads: false,
      coins_monthly: 2000,
      coin_discount: 0.30,
      hd_images: true,
      videos_monthly: 20,
      live_voice: true,
      ai_chat_premium: true,
      priority_support: true,
      dream_journal: true,
      exclusive_sources: true,
    },
    coins: [
      { id: 'starter',  coins: 50,   price: 9.99,   label: '\u0644\u0644\u062A\u062C\u0631\u0628\u0629' },
      { id: 'popular',  coins: 150,  price: 19.99,  label: '\u0627\u0644\u0623\u0643\u062B\u0631 \u0645\u0628\u064A\u0639\u0627\u064B', highlight: true },
      { id: 'value',    coins: 400,  price: 49.99,  label: '\u0642\u064A\u0645\u0629 \u0645\u0645\u062A\u0627\u0632\u0629' },
      { id: 'premium',  coins: 900,  price: 99.99,  label: '\u0648\u0641\u0631 \u0623\u0643\u062B\u0631' },
      { id: 'mega',     coins: 2500, price: 249.99, label: '\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u062D\u062A\u0631\u0641' },
      { id: 'royal',    coins: 7000, price: 499.99, label: '\u0645\u0644\u0643\u064A \uD83D\uDC51', exclusive: true },
    ],
  },

  // ARABISCH NIEDRIGE KAUFKRAFT (-30% unter DACH)
  EG: {
    currency: 'USD',
    symbol: '$',
    countries: ['EG', 'JO', 'MA', 'DZ', 'TN', 'IQ', 'LB', 'PS', 'LY', 'SY', 'SD'],
    tiers: {
      FREE:    { monthly: 0,    yearly: 0 },
      PRO:     { monthly: 3.49, yearly: 34.99 },
      PREMIUM: { monthly: 9.99, yearly: 99.99 },
      SMART:   { monthly: null, yearly: 29.99 },
    },
    coins: [
      { id: 'starter',  coins: 50,   price: 0.69,  label: 'Try it' },
      { id: 'popular',  coins: 150,  price: 1.29,  label: 'BESTSELLER', highlight: true },
      { id: 'value',    coins: 400,  price: 2.99,  label: 'Popular' },
      { id: 'premium',  coins: 900,  price: 5.99,  label: 'Save more' },
      { id: 'mega',     coins: 2500, price: 14.99, label: 'Power User' },
    ],
  },

  // TUERKEI (-60% unter DACH)
  TR: {
    currency: 'TRY',
    symbol: '\u20BA',
    countries: ['TR'],
    tiers: {
      FREE:    { monthly: 0,       yearly: 0 },
      PRO:     { monthly: 79.99,   yearly: 799 },
      PREMIUM: { monthly: 229.99,  yearly: 2299 },
      SMART:   { monthly: null,    yearly: 499 },
    },
    coins: [
      { id: 'starter',  coins: 50,   price: 14.99,  label: 'Denemek i\u00E7in' },
      { id: 'popular',  coins: 150,  price: 29.99,  label: 'EN \u00C7OK SATAN', highlight: true },
      { id: 'value',    coins: 400,  price: 74.99,  label: 'Pop\u00FCler' },
      { id: 'premium',  coins: 900,  price: 149.99, label: 'Daha fazla tasarruf' },
      { id: 'mega',     coins: 2500, price: 379.99, label: 'G\u00FC\u00E7l\u00FC Kullan\u0131c\u0131' },
    ],
  },

  // RUSSLAND (-55% unter DACH)
  RU: {
    currency: 'RUB',
    symbol: '\u20BD',
    countries: ['RU'],
    tiers: {
      FREE:    { monthly: 0,   yearly: 0 },
      PRO:     { monthly: 249, yearly: 2499 },
      PREMIUM: { monthly: 749, yearly: 7499 },
      SMART:   { monthly: null, yearly: 1999 },
    },
    coins: [
      { id: 'starter',  coins: 50,   price: 49,   label: '\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C' },
      { id: 'popular',  coins: 150,  price: 99,   label: '\u0411\u0415\u0421\u0422\u0421\u0415\u041B\u041B\u0415\u0420', highlight: true },
      { id: 'value',    coins: 400,  price: 249,  label: '\u041F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u044B\u0439' },
      { id: 'premium',  coins: 900,  price: 499,  label: '\u0411\u043E\u043B\u044C\u0448\u0435 \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0438' },
      { id: 'mega',     coins: 2500, price: 1199, label: '\u041F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u044B\u0439' },
    ],
  },

  // GLOBAL FALLBACK (USD, ~gleich wie DACH)
  DEFAULT: {
    currency: 'USD',
    symbol: '$',
    countries: [] as string[],
    tiers: {
      FREE:    { monthly: 0,     yearly: 0 },
      PRO:     { monthly: 4.99,  yearly: 49.99 },
      PREMIUM: { monthly: 14.99, yearly: 149.99 },
      SMART:   { monthly: null,  yearly: 49.99 },
    },
    coins: [
      { id: 'starter',  coins: 50,   price: 0.99 },
      { id: 'popular',  coins: 150,  price: 1.99, highlight: true },
      { id: 'value',    coins: 400,  price: 4.99 },
      { id: 'premium',  coins: 900,  price: 9.99 },
      { id: 'mega',     coins: 2500, price: 24.99 },
    ],
  },
};

// Region-Detection: Country-Code -> Pricing-Region
const REGION_MAP: Record<string, keyof typeof REGIONAL_PRICES> = {
  SA: 'SA', AE: 'SA', KW: 'SA', BH: 'SA', QA: 'SA', OM: 'SA',
  EG: 'EG', JO: 'EG', MA: 'EG', DZ: 'EG', TN: 'EG',
  IQ: 'EG', LB: 'EG', PS: 'EG', LY: 'EG', SY: 'EG', SD: 'EG',
  TR: 'TR',
  RU: 'RU',
  DE: 'DE', AT: 'DE', CH: 'DE',
};

export function getRegionalPricing(countryCode: string) {
  const region = REGION_MAP[countryCode] || 'DEFAULT';
  return REGIONAL_PRICES[region];
}

// Stripe Price Amounts (Kleineinheiten: Cents/Halalas/Kurus/Kopeken)
export const STRIPE_AMOUNTS = {
  DE: {
    PRO_MONTHLY: 499, PRO_YEARLY: 4999,
    PREMIUM_MONTHLY: 1499, PREMIUM_YEARLY: 14999,
    SMART_YEARLY: 4999,
    COINS_50: 99, COINS_150: 199, COINS_400: 499, COINS_900: 999, COINS_2500: 2499,
  },
  SA: {
    PRO_MONTHLY: 4999, PRO_YEARLY: 49999,
    PREMIUM_MONTHLY: 14999, PREMIUM_YEARLY: 149999,
    VIP_MONTHLY: 29999, VIP_YEARLY: 299999,
    SMART_YEARLY: 19999,
    COINS_50: 999, COINS_150: 1999, COINS_400: 4999, COINS_900: 9999, COINS_2500: 24999, COINS_7000: 49999,
  },
  EG: {
    PRO_MONTHLY: 349, PRO_YEARLY: 3499,
    PREMIUM_MONTHLY: 999, PREMIUM_YEARLY: 9999,
    SMART_YEARLY: 2999,
    COINS_50: 69, COINS_150: 129, COINS_400: 299, COINS_900: 599, COINS_2500: 1499,
  },
  TR: {
    PRO_MONTHLY: 7999, PRO_YEARLY: 79900,
    PREMIUM_MONTHLY: 22999, PREMIUM_YEARLY: 229900,
    SMART_YEARLY: 49900,
    COINS_50: 1499, COINS_150: 2999, COINS_400: 7499, COINS_900: 14999, COINS_2500: 37999,
  },
  RU: {
    PRO_MONTHLY: 24900, PRO_YEARLY: 249900,
    PREMIUM_MONTHLY: 74900, PREMIUM_YEARLY: 749900,
    SMART_YEARLY: 199900,
    COINS_50: 4900, COINS_150: 9900, COINS_400: 24900, COINS_900: 49900, COINS_2500: 119900,
  },
};

// --- API-KOSTEN (intern, fuer Marge-Berechnung) ---
export const API_COSTS = {
  IMAGE_RUNWARE: 0.002,
  IMAGE_REPLICATE: 0.005,
  TTS_DEEPGRAM_PER_1K_CHARS: 0.012,
  STT_DEEPGRAM_PER_MIN: 0.004,
  CHAT_GROQ_LLAMA: 0.0001,
  VIDEO_REPLICATE_5S: 0.08,
  VIDEO_SLIDESHOW_5S: 0.02,
};

// --- HELPER FUNKTIONEN ---
export const coinToEur = (coins: number): number => {
  return Math.round(coins * COIN_VALUE_EUR * 100) / 100;
};

export const eurToCoins = (eur: number): number => {
  return Math.round(eur / COIN_VALUE_EUR);
};

export const getFeaturePrice = (feature: keyof typeof FEATURE_PRICES, discountPercent: number = 0): number => {
  const basePrice = FEATURE_PRICES[feature];
  const discount = basePrice * (discountPercent / 100);
  return Math.round(basePrice - discount);
};

export const calculateMargin = (revenueCoins: number, apiCostEur: number): number => {
  const revenueEur = coinToEur(revenueCoins);
  if (revenueEur === 0) return 0;
  return Math.round(((revenueEur - apiCostEur) / revenueEur) * 100);
};

// --- VIDEO STRATEGIE ---
export const VIDEO_STRATEGY = {
  DEFAULT: 'slideshow',
  PREMIUM_OPTION: 'replicate',
};
