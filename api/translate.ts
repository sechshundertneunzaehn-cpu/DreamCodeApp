import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sanitizeInput } from './_lib/sanitize';
import { rateLimit } from './_lib/rateLimit';
import { handleCors } from './_lib/cors';
import { requireAuth } from './_lib/tierAuth';

/**
 * POST /api/translate — Uebersetzung via Gemini Flash Lite
 * Intern, keine Coins. Fuer UI-Uebersetzungen und Content-Lokalisierung.
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res)) return;

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { text, targetLang, sourceLang } = req.body as {
    text?: string;
    targetLang?: string;
    sourceLang?: string;
  };

  if (!text || typeof text !== 'string' || !targetLang) {
    return res.status(400).json({ error: 'Missing text or targetLang' });
  }

  const cleaned = sanitizeInput(text);

  // Gemini Flash Lite Key-Rotation
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter((k): k is string => typeof k === 'string' && k.trim().length > 0);

  if (keys.length === 0) {
    return res.status(500).json({ error: 'No Gemini API keys configured' });
  }

  const sourceHint = sourceLang ? ` from ${sourceLang}` : '';
  const prompt = `Translate the following text${sourceHint} to ${targetLang}. Return ONLY the translated text, nothing else:\n\n${cleaned.text}`;

  for (const apiKey of keys) {
    try {
      const r = await fetch(
        `${GEMINI_API_BASE}/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 2000 },
          }),
        }
      );

      if (r.status === 429 || r.status === 403) continue;
      if (!r.ok) {
        console.error('[translate] Gemini error:', r.status);
        continue;
      }

      const data = await r.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const translation = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (translation) {
        return res.status(200).json({ translation, provider: 'gemini' });
      }
    } catch (e: any) {
      console.error('[translate] Gemini exception:', e.message);
    }
  }

  return res.status(502).json({ error: 'Uebersetzung fehlgeschlagen' });
}
