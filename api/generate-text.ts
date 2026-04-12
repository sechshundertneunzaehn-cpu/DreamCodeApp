import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sanitizeInput } from './_lib/sanitize';
import { rateLimit } from './_lib/rateLimit';
import { handleCors } from './_lib/cors';
import { requireAuth } from './_lib/tierAuth';
import {
  getLanguage, getRouteForLanguage, getFallbacks, buildLanguageEnforcement,
  type ModelRoute,
} from './_lib/languageRouter';

/**
 * POST /api/generate-text — Standard-Traumdeutung (2 Coins)
 * Sprachgruppen-Routing via x-user-lang Header:
 *   AR/TR/ZH/JA/KO/FA/UR → Gemini 2.0 Flash (OpenRouter)
 *   DE/EN/FR/ES/PT/IT/PL/RU → GROQ Llama-3.3-70b
 * Fallback-Chain: Gemini → DeepSeek → GROQ → Mistral
 */

// --- Provider-spezifische Fetch-Helfer ---

async function callGroq(apiKey: string, model: string, prompt: string, temp: number, maxTokens: number) {
  return fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: temp, max_tokens: maxTokens }),
  });
}

async function callOpenRouter(apiKey: string, model: string, prompt: string, temp: number, maxTokens: number) {
  return fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://dream-code.app',
      'X-Title': 'DreamCode App',
    },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: temp, max_tokens: maxTokens }),
  });
}

async function callDeepSeek(apiKey: string, model: string, prompt: string, temp: number, maxTokens: number) {
  return fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: temp, max_tokens: maxTokens }),
  });
}

async function callMistral(apiKey: string, model: string, prompt: string, temp: number, maxTokens: number) {
  return fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: temp, max_tokens: maxTokens }),
  });
}

type ChatResponse = { choices?: Array<{ message?: { content?: string } }> };

function extractText(data: ChatResponse): string | undefined {
  return data.choices?.[0]?.message?.content?.trim();
}

async function tryRoute(route: ModelRoute, prompt: string, temp: number, maxTokens: number): Promise<{ text: string; provider: string } | null> {
  const apiKey = (process.env[route.apiKeyEnv] || '').trim();
  if (!apiKey) return null;

  try {
    let r: Response;
    switch (route.provider) {
      case 'groq':       r = await callGroq(apiKey, route.model, prompt, temp, maxTokens); break;
      case 'openrouter':  r = await callOpenRouter(apiKey, route.model, prompt, temp, maxTokens); break;
      case 'deepseek':    r = await callDeepSeek(apiKey, route.model, prompt, temp, maxTokens); break;
      case 'mistral':     r = await callMistral(apiKey, route.model, prompt, temp, maxTokens); break;
      default: return null;
    }

    if (!r.ok) {
      console.error(`[generate-text] ${route.provider} error: ${r.status}`);
      return null;
    }

    const data = await r.json() as ChatResponse;
    const text = extractText(data);
    if (!text) return null;
    return { text, provider: route.provider };
  } catch (e: any) {
    console.error(`[generate-text] ${route.provider} exception:`, e.message);
    return null;
  }
}

// Groq multi-key rotation (3 keys)
async function tryGroqWithRotation(prompt: string, temp: number, maxTokens: number): Promise<{ text: string; provider: string } | null> {
  const keys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
  ].filter((k): k is string => typeof k === 'string' && k.trim().length > 0);

  for (const key of keys) {
    try {
      const r = await callGroq(key, 'llama-3.3-70b-versatile', prompt, temp, maxTokens);
      if (r.status === 429 || r.status === 403) continue;
      if (!r.ok) continue;
      const data = await r.json() as ChatResponse;
      const text = extractText(data);
      if (text) return { text, provider: 'groq' };
    } catch { /* try next key */ }
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res)) return;

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { prompt, options } = req.body as {
    prompt?: string;
    options?: { temperature?: number; maxOutputTokens?: number; maxTokens?: number };
  };

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const cleaned = sanitizeInput(prompt);
  const lang = getLanguage(req);
  const langEnforcement = buildLanguageEnforcement(lang);
  const safePrompt = cleaned.text + langEnforcement;

  const temp = options?.temperature ?? 0.7;
  const maxTokens = options?.maxOutputTokens ?? options?.maxTokens ?? 2200;

  try {
    // 1. Primaerer Provider basierend auf Sprache
    const primary = getRouteForLanguage(lang);

    // Groq mit Multi-Key Rotation
    if (primary.provider === 'groq') {
      const result = await tryGroqWithRotation(safePrompt, temp, maxTokens);
      if (result) return res.status(200).json(result);
    } else {
      const result = await tryRoute(primary, safePrompt, temp, maxTokens);
      if (result) return res.status(200).json(result);
    }

    // 2. Fallback-Chain durchlaufen
    const fallbacks = getFallbacks(primary);
    for (const fb of fallbacks) {
      if (fb.provider === 'groq') {
        const result = await tryGroqWithRotation(safePrompt, temp, maxTokens);
        if (result) return res.status(200).json(result);
      } else {
        const result = await tryRoute(fb, safePrompt, temp, maxTokens);
        if (result) return res.status(200).json(result);
      }
    }

    return res.status(502).json({ error: 'Alle LLM-Provider fehlgeschlagen' });
  } catch (error: unknown) {
    console.error('[generate-text] Error:', error);
    return res.status(500).json({ error: 'Text generation request failed' });
  }
}
