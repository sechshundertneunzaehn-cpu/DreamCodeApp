import { SubscriptionTier } from '../types';

export type ProviderName =
  | 'gemini'
  | 'deepseek'
  | 'runware'
  | 'pollinations'
  | 'deepgram'
  | 'elevenlabs'
  | 'slideshow'
  | 'ollama'
  | 'openrouter';

export type ProviderSecretKey =
  | 'gemini'
  | 'deepseek'
  | 'runware'
  | 'deepgram'
  | 'elevenlabs'
  | 'runway'
  | 'pika'
  | 'kling'
  | 'openrouter';

export const PROVIDER_ENV_KEYS: Record<ProviderSecretKey, string> = {
  gemini: 'VITE_GEMINI_API_KEY',
  deepseek: 'VITE_DEEPSEEK_API_KEY',
  runware: 'VITE_RUNWARE_API_KEY',
  deepgram: 'VITE_DEEPGRAM_API_KEY',
  elevenlabs: 'VITE_ELEVENLABS_API_KEY',
  runway: 'VITE_RUNWAY_API_KEY',
  pika: 'VITE_PIKA_API_KEY',
  kling: 'VITE_KLING_API_KEY',
  openrouter: 'VITE_OPENROUTER_API_KEY',
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
  tier: 'cheap' | 'default' | 'fallback' | 'premium' | 'local';
  provider: Extract<ProviderName, 'gemini' | 'deepseek' | 'ollama' | 'openrouter'>;
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
  {
    tier: 'local',
    provider: 'ollama',
    model: readEnv('VITE_OLLAMA_GEMMA_MODEL') || 'gemma3:12b',
    envKey: '',
    description: 'Gemma 4 lokal via Ollama (kostenlos)',
  },
  {
    tier: 'local',
    provider: 'ollama',
    model: readEnv('VITE_OLLAMA_QWEN_MODEL') || 'qwen2.5:7b',
    envKey: '',
    description: 'Qwen lokal via Ollama (kostenlos)',
  },
  {
    tier: 'local',
    provider: 'ollama',
    model: readEnv('VITE_OLLAMA_MISTRAL_MODEL') || 'mistral:7b',
    envKey: '',
    description: 'Mistral lokal via Ollama (kostenlos)',
  },
];

// OpenRouter Fallback fuer Gemma/Qwen (Production)
export const getOpenRouterLocalRoutes = (): TextRoute[] => [
  {
    tier: 'default',
    provider: 'openrouter',
    model: readEnv('VITE_OPENROUTER_GEMMA_MODEL') || 'google/gemma-3-27b-it',
    envKey: PROVIDER_ENV_KEYS.openrouter,
    description: 'Gemma via OpenRouter (Production)',
  },
  {
    tier: 'default',
    provider: 'openrouter',
    model: readEnv('VITE_OPENROUTER_QWEN_MODEL') || 'qwen/qwen-2.5-72b-instruct',
    envKey: PROVIDER_ENV_KEYS.openrouter,
    description: 'Qwen via OpenRouter (Production)',
  },
];

export const getOllamaBaseUrl = (): string =>
  readEnv('VITE_OLLAMA_BASE_URL') || 'http://localhost:11434';

export const isOllamaAvailable = async (): Promise<boolean> => {
  try {
    const url = getOllamaBaseUrl() + '/api/tags';
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
};



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
  tier === SubscriptionTier.PREMIUM ||
  tier === SubscriptionTier.VIP;

export const isPaidTier = (tier?: SubscriptionTier | null): boolean =>
  Boolean(tier && tier !== SubscriptionTier.FREE);
