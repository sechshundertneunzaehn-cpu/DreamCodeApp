import type { VercelRequest } from '@vercel/node';

/**
 * Sprachgruppen-basiertes Modell-Routing.
 * Liest x-user-lang Header → waehlt Provider + Modell.
 *
 * Gruppe A (multilingual): AR/TR/ZH/JA/KO/FA/UR → Gemini 2.0 Flash via OpenRouter
 * Gruppe B (westlich):     DE/EN/FR/ES/PT/IT/PL/RU → GROQ Llama-3.3-70b
 * Premium (alle Sprachen): Claude Sonnet (kein Fallback)
 */

export type Provider = 'groq' | 'openrouter' | 'deepseek' | 'mistral';

export interface ModelRoute {
  provider: Provider;
  model: string;
  apiKeyEnv: string;
}

// Sprachen die Gemini via OpenRouter bekommen (bestes multilingual)
const GEMINI_LANGS = new Set(['ar', 'tr', 'zh', 'ja', 'ko', 'fa', 'ur']);

// Sprachen die GROQ Llama bekommen (schnellstes, guenstigstes)
const GROQ_LANGS = new Set(['de', 'en', 'fr', 'es', 'pt', 'it', 'pl', 'ru']);

/**
 * Fallback-Chain: Gemini (OpenRouter) → DeepSeek → GROQ → Mistral
 */
export const FALLBACK_CHAIN: ModelRoute[] = [
  { provider: 'openrouter', model: 'google/gemini-2.0-flash-001', apiKeyEnv: 'OPENROUTER_API_KEY' },
  { provider: 'deepseek',   model: 'deepseek-chat',               apiKeyEnv: 'DEEPSEEK_API_KEY' },
  { provider: 'groq',       model: 'llama-3.3-70b-versatile',     apiKeyEnv: 'GROQ_API_KEY' },
  { provider: 'mistral',    model: 'mistral-large-latest',        apiKeyEnv: 'MISTRAL_API_KEY' },
];

/**
 * Liest die Sprache aus dem x-user-lang Header.
 * Fallback: 'de'
 */
export function getLanguage(req: VercelRequest): string {
  const header = req.headers['x-user-lang'];
  const lang = (typeof header === 'string' ? header : '').trim().toLowerCase().slice(0, 2);
  return lang || 'de';
}

/**
 * Waehlt den primaeren Provider + Modell basierend auf der Sprache.
 */
export function getRouteForLanguage(lang: string): ModelRoute {
  if (GEMINI_LANGS.has(lang)) {
    return {
      provider: 'openrouter',
      model: 'google/gemini-2.0-flash-001',
      apiKeyEnv: 'OPENROUTER_API_KEY',
    };
  }
  // Default: GROQ (fuer westliche Sprachen und Fallback)
  return {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    apiKeyEnv: 'GROQ_API_KEY',
  };
}

/**
 * Gibt die Fallback-Chain zurueck, OHNE den primaeren Provider.
 */
export function getFallbacks(primary: ModelRoute): ModelRoute[] {
  return FALLBACK_CHAIN.filter(
    (r) => !(r.provider === primary.provider && r.model === primary.model)
  );
}

/**
 * Sprachname fuer System-Prompt Enforcement.
 */
const LANG_NAMES: Record<string, string> = {
  de: 'Deutsch', en: 'English', tr: 'Tuerkisch', ar: 'Arabisch',
  es: 'Spanisch', fr: 'Franzoesisch', pt: 'Portugiesisch', ru: 'Russisch',
  zh: 'Chinesisch', ja: 'Japanisch', ko: 'Koreanisch', fa: 'Persisch',
  ur: 'Urdu', it: 'Italienisch', pl: 'Polnisch', hi: 'Hindi',
  bn: 'Bengalisch', vi: 'Vietnamesisch', th: 'Thailaendisch', id: 'Indonesisch',
  sw: 'Suaheli', hu: 'Ungarisch',
};

export function getLanguageName(lang: string): string {
  return LANG_NAMES[lang] || 'Deutsch';
}

export function buildLanguageEnforcement(lang: string): string {
  const name = getLanguageName(lang);
  return `\n\nCRITICAL REMINDER: You MUST respond ONLY in ${name}. Every single word of your response must be in ${name}. This is non-negotiable.`;
}
