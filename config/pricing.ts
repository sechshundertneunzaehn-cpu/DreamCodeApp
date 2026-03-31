// ============================================
// DREAM CODE - ZENTRALE PREISKONFIGURATION
// ============================================
// 🔒 FROZEN / EINGEFROREN - NICHT ÄNDERN! 🔒
// Letzte Aktualisierung: 21.03.2026
// Diese Preise sind final und dürfen nicht
// ohne explizite Genehmigung geändert werden.
// ============================================

// --- MÜNZWERT ---
export const COIN_VALUE_EUR = 0.0199; // 1 Münze = 0,0199 €

// --- MÜNZPAKETE ---
export const COIN_PACKAGES = {
  MICRO: { coins: 50, price: 0.99, id: 'micro_50' },
  STARTER: { coins: 100, price: 1.99, id: 'starter_100' },
  BESTSELLER: { coins: 550, price: 5.99, id: 'bestseller_550', badge: 'Beliebt' },
  VORRAT: { coins: 1500, price: 12.99, id: 'vorrat_1500' },
  MEGA: { coins: 3500, price: 24.99, id: 'mega_3500' },
  MEGA_PLUS: { coins: 7000, price: 59.99, id: 'mega_plus_7000', badge: 'Bester Wert' },
};

// --- ABO-STUFEN ---
export const SUBSCRIPTION_TIERS = {
  BRONZE: {
    id: 'bronze_free',
    name: 'Bronze',
    price: 0,
    interval: 'month',
    features: {
      maxImagesPerDay: 2,
      adsEnabled: true,
      coinDiscount: 0,
      monthlyCoins: 0,
      videosPerMonth: 0,
      liveChatPerWeek: 0,
    }
  },
  SILVER: {
    id: 'silver_premium',
    name: 'Silber',
    price: 4.99,
    interval: 'month',
    features: {
      maxImagesPerDay: 10,
      adsEnabled: false,
      coinDiscount: 10,
      monthlyCoins: 50,
      videosPerMonth: 0,
      liveChatPerWeek: 1,
      unlimitedTextInterpretations: true,
    }
  },
  GOLD: {
    id: 'gold_vip',
    name: 'Gold',
    price: 12.99,
    interval: 'month',
    features: {
      maxImagesPerDay: -1, // unlimited
      adsEnabled: false,
      coinDiscount: 15,
      monthlyCoins: 300,
      videosPerMonth: 10,
      liveChatPerWeek: -1, // unlimited
      unlimitedTextInterpretations: true,
      prioritySupport: true,
    }
  },
  DELUXE: {
    id: 'deluxe_premium',
    name: 'Deluxe',
    price: 19.99,
    interval: 'month',
    features: {
      maxImagesPerDay: -1,
      adsEnabled: false,
      coinDiscount: 15,
      monthlyCoins: 1200,
      videosPerMonth: 20,
      liveChatPerWeek: -1,
      unlimitedTextInterpretations: true,
      prioritySupport: true,
    }
  },
  VIP: {
    id: 'vip_ultimate',
    name: 'VIP',
    price: 49.99,
    interval: 'month',
    features: {
      maxImagesPerDay: -1,
      adsEnabled: false,
      coinDiscount: 15, // FROZEN: 15% Rabatt
      monthlyCoins: 5000, // FROZEN: 5000 Münzen/Monat
      videosPerMonth: -1, // unlimited
      liveChatPerWeek: -1,
      unlimitedTextInterpretations: true,
      prioritySupport: true,
      dedicatedSupport: true,
    }
  },
  SMART: {
    id: 'smart_developer',
    name: 'Smart',
    price: 29.99,
    interval: 'year',
    features: {
      byok: true,
      allPremiumFeatures: true,
      autoProviderRotation: true,
    }
  },
};

// --- FEATURE-PREISE IN MÜNZEN ---
export const FEATURE_PRICES = {
  // Traumdeutung
  DREAM_TEXT: 2,
  DREAM_TEXT_1_IMAGE: 4,
  DREAM_TEXT_2_IMAGES: 8,

  // KI-Chat
  AI_CHAT_10_MESSAGES: 5,
  AI_CHAT_30_MIN: 20,

  // Voice Livechat
  VOICE_CHAT_PER_MINUTE: 3,
  VOICE_CHAT_PACK_30_MIN: 75,
  VOICE_CHAT_PACK_60_MIN: 140,

  // Export & Analyse
  PDF_EXPORT: 2,
  AUDIO_UPLOAD_ANALYSIS: 10,
  AUDIO_TO_VIDEO: 15,

  // Video Generierung
  VIDEO_PER_SECOND: 5,
  VIDEO_PACK_10S: 60,
  VIDEO_PACK_30S: 180,
  VIDEO_PACK_60S: 360,
  VIDEO_PACK_120S: 720,

  // Export-Pakete
  EXPORT_10_REPORTS: 25,
  MANUAL_REVIEW_MIN: 50,
  MANUAL_REVIEW_MAX: 200,
};

// --- GRATIS-MÜNZEN / REWARDS ---
export const REWARDS = {
  // Referral
  REFERRAL_INVITER: 50,
  REFERRAL_NEW_USER: 10,

  // Sharing (20 valide Shares = 1 Münze, max 3x täglich)
  SHARES_REQUIRED: 20,
  SHARE_REWARD: 1,
  SHARE_MAX_DAILY: 3,

  // Werbung
  AD_SHORT_10S: 1,
  AD_SPONSOR_2MIN: 5,
  OFFERWALL_MIN: 5,
  OFFERWALL_MAX: 10,

  // Täglicher Login
  DAILY_LOGIN: 1,

  // Max Gratis-Münzen pro Tag
  MAX_FREE_COINS_DAILY: 100,
};

// --- API-KOSTEN (intern, für Marge-Berechnung) ---
export const API_COSTS = {
  // Bildgenerierung
  IMAGE_RUNWARE: 0.002, // € pro Bild
  IMAGE_REPLICATE: 0.005,

  // Text-to-Speech
  TTS_DEEPGRAM_PER_1K_CHARS: 0.012,

  // Speech-to-Text
  STT_DEEPGRAM_PER_MIN: 0.004,

  // Chat/Analyse
  CHAT_GROQ_LLAMA: 0.0001, // pro Anfrage

  // Video
  VIDEO_REPLICATE_5S: 0.08,
  VIDEO_SLIDESHOW_5S: 0.02, // Bilder + TTS (empfohlen!)
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

// --- MARGIN BERECHNUNG ---
export const calculateMargin = (revenueCoins: number, apiCostEur: number): number => {
  const revenueEur = coinToEur(revenueCoins);
  if (revenueEur === 0) return 0;
  return Math.round(((revenueEur - apiCostEur) / revenueEur) * 100);
};

// --- VIDEO STRATEGIE ---
// EMPFEHLUNG: Nutze primär SLIDESHOW statt REPLICATE
// Slideshow = Runware-Bilder + Deepgram TTS → 97% Marge
// Replicate = WAN 2.2 Video → 87% Marge
export const VIDEO_STRATEGY = {
  DEFAULT: 'slideshow', // Empfohlen für alle User
  PREMIUM_OPTION: 'replicate', // Nur als Premium-Upgrade anbieten
};
