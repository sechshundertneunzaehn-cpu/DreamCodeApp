import { SubscriptionTier } from '../types';

export type ProviderName =
  | 'gemini'
  | 'deepseek'
  | 'runware'
  | 'pollinations'
  | 'deepgram'
  | 'elevenlabs'
  | 'slideshow';

export type ProviderSecretKey =
  | 'gemini'
  | 'deepseek'
  | 'runware'
  | 'deepgram'
  | 'elevenlabs'
  | 'runway'
  | 'pika'
  | 'kling';

export const PROVIDER_ENV_KEYS: Record<ProviderSecretKey, string> = {
  gemini: 'VITE_GEMINI_API_KEY',
  deepseek: 'VITE_DEEPSEEK_API_KEY',
  runware: 'VITE_RUNWARE_API_KEY',
  deepgram: 'VITE_DEEPGRAM_API_KEY',
  elevenlabs: 'VITE_ELEVENLABS_API_KEY',
  runway: 'VITE_RUNWAY_API_KEY',
  pika: 'VITE_PIKA_API_KEY',
  kling: 'VITE_KLING_API_KEY',
};

export const readEnv = (name: string): string | undefined => {
  const env = import.meta.env as Record<string, string | boolean | undefined>;
  const value = env[name];
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

// Rotiert durch mehrere Gemini Keys – gibt ersten verfügbaren zurück
export const getGeminiKey = (): string | undefined => {
  const keys = [
    readEnv('VITE_GEMINI_API_KEY'),
    readEnv('VITE_GEMINI_API_KEY_2'),
    readEnv('VITE_GEMINI_API_KEY_3'),
    readEnv('VITE_GEMINI_API_KEY_4'),
  ].filter(Boolean) as string[];
  return keys[0];
};

export const getGeminiKeys = (): string[] => {
  return [
    readEnv('VITE_GEMINI_API_KEY'),
    readEnv('VITE_GEMINI_API_KEY_2'),
    readEnv('VITE_GEMINI_API_KEY_3'),
    readEnv('VITE_GEMINI_API_KEY_4'),
  ].filter(Boolean) as string[];
};

export const getProviderSecret = (provider: ProviderSecretKey): string | undefined => {
  if (provider === 'gemini') return getGeminiKey();
  return readEnv(PROVIDER_ENV_KEYS[provider]);
};

export const hasProviderSecret = (provider: ProviderSecretKey): boolean =>
  Boolean(getProviderSecret(provider));

export const maskSecret = (value?: string): string =>
  value ? `${value.slice(0, 4)}...${value.slice(-2)}` : 'missing';

export interface TextRoute {
  tier: 'cheap' | 'default' | 'fallback' | 'premium';
  provider: Extract<ProviderName, 'gemini' | 'deepseek'>;
  model: string;
  envKey: string;
  description: string;
}

export interface ImageRoute {
  tier: 'standard' | 'premium' | 'fallback';
  provider: Extract<ProviderName, 'runware' | 'gemini' | 'pollinations'>;
  model: string;
  envKey?: string;
  description: string;
}

export interface AudioRoute {
  tier: 'default' | 'premium';
  provider: Extract<ProviderName, 'deepgram' | 'elevenlabs'>;
  model: string;
  envKey: string;
}

export interface VideoRoute {
  tier: 'standard' | 'premium';
  provider: Extract<ProviderName, 'slideshow'>;
  model: string;
  description: string;
}

// FIX: Stabile Gemini-Modelle verwenden, DeepSeek entfernt (CORS in Browser)
export const getTextRoutes = (): TextRoute[] => [
  {
    tier: 'cheap',
    provider: 'gemini',
    model: readEnv('VITE_GEMINI_TEXT_MODEL_CHEAP') || 'gemini-2.0-flash-lite',
    envKey: PROVIDER_ENV_KEYS.gemini,
    description: 'Low-cost text transforms and helper prompts',
  },
  {
    tier: 'default',
    provider: 'gemini',
    model: readEnv('VITE_GEMINI_TEXT_MODEL_DEFAULT') || 'gemini-2.0-flash',
    envKey: PROVIDER_ENV_KEYS.gemini,
    description: 'Primary balanced dream interpretation model',
  },
  {
    tier: 'fallback',
    provider: 'gemini',
    model: readEnv('VITE_GEMINI_TEXT_MODEL_FALLBACK') || 'gemini-2.0-flash-lite',
    envKey: PROVIDER_ENV_KEYS.gemini,
    description: 'Stable older Gemini model as browser-safe fallback',
  },
  {
    tier: 'premium',
    provider: 'gemini',
    model: readEnv('VITE_GEMINI_TEXT_MODEL_PREMIUM') || 'gemini-2.0-flash',
    envKey: PROVIDER_ENV_KEYS.gemini,
    description: 'Premium path using Gemini',
  },
];

// FIX: Gemini Image Route entfernt (falscher Modellname) – nur Runware + Pollinations
export const getImageRoutes = (): ImageRoute[] => [
  {
    tier: 'standard',
    provider: 'runware',
    model: readEnv('VITE_RUNWARE_IMAGE_MODEL_STANDARD') || 'runware:100@1',
    envKey: PROVIDER_ENV_KEYS.runware,
    description: 'Default low-cost image provider',
  },
  {
    tier: 'premium',
    provider: 'runware',
    model: readEnv('VITE_RUNWARE_IMAGE_MODEL_PREMIUM') || 'civitai:618692@691639',
    envKey: PROVIDER_ENV_KEYS.runware,
    description: 'Premium quality via Runware',
  },
  {
    tier: 'fallback',
    provider: 'pollinations',
    model: 'pollinations-public',
    description: 'No-key fallback image provider',
  },
];

export const getAudioRoutes = (): AudioRoute[] => [
  {
    tier: 'default',
    provider: 'deepgram',
    model: readEnv('VITE_DEEPGRAM_TTS_MODEL_DEFAULT') || 'aura-asteria-en',
    envKey: PROVIDER_ENV_KEYS.deepgram,
  },
  {
    tier: 'premium',
    provider: 'elevenlabs',
    model: readEnv('VITE_ELEVENLABS_TTS_MODEL_PREMIUM') || 'eleven_multilingual_v2',
    envKey: PROVIDER_ENV_KEYS.elevenlabs,
  },
];

export const getVideoRoutes = (): VideoRoute[] => [
  {
    tier: 'standard',
    provider: 'slideshow',
    model: 'slideshow-deepgram-runware',
    description: 'Default cost-controlled video path',
  },
  {
    tier: 'premium',
    provider: 'slideshow',
    model: 'slideshow-premium',
    description: 'Premium slideshow path',
  },
];

export const isPremiumTextTier = (tier?: SubscriptionTier | null): boolean =>
  tier === SubscriptionTier.PRO ||
  tier === SubscriptionTier.DELUXE ||
  tier === SubscriptionTier.VIP;

export const isPaidTier = (tier?: SubscriptionTier | null): boolean =>
  Boolean(tier && tier !== SubscriptionTier.FREE);
