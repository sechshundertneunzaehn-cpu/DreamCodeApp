import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sanitizeMessages } from './_lib/sanitize';
import { rateLimit } from './_lib/rateLimit';
import { handleCors } from './_lib/cors';
import { requireAuth } from './_lib/tierAuth';
import { getLanguage, buildLanguageEnforcement } from './_lib/languageRouter';

/**
 * POST /api/chat — GROQ Llama Chat (5 Coins/10msg)
 * Primary: GROQ, Fallback: Mistral
 * Sprache via x-user-lang Header oder body.language
 */

type ChatMessage = { role: string; content: string };
type ChatResponse = { choices?: Array<{ message?: { content?: string } }> };

async function callProvider(url: string, apiKey: string, model: string, messages: ChatMessage[]): Promise<string | null> {
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature: 0.8, max_tokens: 1024 }),
    });
    if (!r.ok) return null;
    const data = await r.json() as ChatResponse;
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res)) return;

  const auth = await requireAuth(req, res);
  if (!auth) return;

  try {
    const { messages: rawMessages, language, systemPrompt } = req.body;
    if (!rawMessages || !Array.isArray(rawMessages)) {
      return res.status(400).json({ error: 'Missing messages array' });
    }

    const { messages } = sanitizeMessages(rawMessages);

    // Sprache aus Header bevorzugen, Body als Fallback
    const lang = getLanguage(req) !== 'de' ? getLanguage(req) : (language || 'de');
    const langEnforcement = buildLanguageEnforcement(lang);

    const fullMessages: ChatMessage[] = [
      { role: 'system', content: (systemPrompt || '') + langEnforcement },
      ...messages,
    ];

    // GROQ (primary)
    const groqKey = (process.env.GROQ_API_KEY || '').trim();
    if (groqKey) {
      const reply = await callProvider('https://api.groq.com/openai/v1/chat/completions', groqKey, 'llama-3.3-70b-versatile', fullMessages);
      if (reply) return res.status(200).json({ reply, provider: 'groq' });
    }

    // Mistral (fallback)
    const mistralKey = (process.env.MISTRAL_API_KEY || '').trim();
    if (mistralKey) {
      const reply = await callProvider('https://api.mistral.ai/v1/chat/completions', mistralKey, 'mistral-large-latest', fullMessages);
      if (reply) return res.status(200).json({ reply, provider: 'mistral' });
    }

    return res.status(502).json({ error: 'Alle Chat-Provider fehlgeschlagen' });
  } catch (error: any) {
    console.error('[chat] Error:', error.message);
    return res.status(500).json({ error: 'Chat request failed' });
  }
}
