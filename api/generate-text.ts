import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sanitizeInput } from './_lib/sanitize';
import { rateLimit } from './_lib/rateLimit';

/**
 * Vercel Serverless Function: Gemini + Groq text generation proxy
 * Keeps API keys server-side — supports multi-key rotation for both providers.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res)) return;

  const { provider, model, prompt, options } = req.body as {
    provider?: string;
    model?: string;
    prompt?: string;
    options?: { temperature?: number; maxOutputTokens?: number; maxTokens?: number };
  };

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const cleaned = sanitizeInput(prompt);
  const safePrompt = cleaned.text;

  try {
    if (!provider || provider === 'gemini') {
      const keys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
      ].filter((k): k is string => typeof k === 'string' && k.trim().length > 0);

      if (keys.length === 0) {
        return res.status(500).json({ error: 'No Gemini API keys configured' });
      }

      const geminiModel = model || 'gemini-2.0-flash';
      const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
      let lastError = '';

      for (const apiKey of keys) {
        const r = await fetch(`${GEMINI_API_BASE}/${geminiModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: safePrompt }] }],
            generationConfig: {
              temperature: options?.temperature ?? 0.7,
              maxOutputTokens: options?.maxOutputTokens ?? options?.maxTokens ?? 1800,
            },
          }),
        });

        if (r.status === 429 || r.status === 403) {
          lastError = `Gemini key ${r.status}`;
          continue;
        }
        if (!r.ok) {
          const err = await r.text();
          console.error('[generate-text] Gemini error:', r.status, err);
          return res.status(r.status).json({ error: `Gemini error: ${r.status}` });
        }

        const data = await r.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) return res.status(502).json({ error: 'Gemini returned no text' });

        return res.status(200).json({ text, provider: 'gemini' });
      }

      return res.status(429).json({ error: `All Gemini keys exhausted: ${lastError}` });
    }

    if (provider === 'groq') {
      const keys = [
        process.env.GROQ_API_KEY,
        process.env.GROQ_API_KEY_2,
        process.env.GROQ_API_KEY_3,
      ].filter((k): k is string => typeof k === 'string' && k.trim().length > 0);

      if (keys.length === 0) {
        return res.status(500).json({ error: 'No Groq API keys configured' });
      }

      const groqModel = model || 'llama-3.3-70b-versatile';
      let lastError = '';

      for (const apiKey of keys) {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [{ role: 'user', content: safePrompt }],
            temperature: options?.temperature ?? 0.75,
            max_tokens: options?.maxTokens ?? options?.maxOutputTokens ?? 2200,
          }),
        });

        if (r.status === 429 || r.status === 403) {
          lastError = `Groq key ${r.status}`;
          continue;
        }
        if (!r.ok) {
          const err = await r.text();
          console.error('[generate-text] Groq error:', r.status, err);
          return res.status(r.status).json({ error: `Groq error: ${r.status}` });
        }

        const data = await r.json() as { choices?: Array<{ message?: { content?: string } }> };
        const text = data.choices?.[0]?.message?.content?.trim();
        if (!text) return res.status(502).json({ error: 'Groq returned no text' });

        return res.status(200).json({ text, provider: 'groq' });
      }

      return res.status(429).json({ error: `All Groq keys exhausted: ${lastError}` });
    }

    return res.status(400).json({ error: `Unknown provider: ${provider}` });
  } catch (error: unknown) {
    console.error('[generate-text] Error:', error);
    return res.status(500).json({ error: 'Text generation request failed' });
  }
}
