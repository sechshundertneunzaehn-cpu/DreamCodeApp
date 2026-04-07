import type { VercelRequest, VercelResponse } from '@vercel/node';

// Server-side Gemini proxy - keeps API keys out of the frontend bundle
// Frontend calls /api/interpret instead of Gemini directly

const GEMINI_KEYS: string[] = [];

function loadKeys() {
  if (GEMINI_KEYS.length > 0) return;
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2 || process.env.VITE_GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3 || process.env.VITE_GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4 || process.env.VITE_GEMINI_API_KEY_4,
  ].filter(Boolean) as string[];
  GEMINI_KEYS.push(...keys);
}

let keyIndex = 0;
function getNextKey(): string | null {
  loadKeys();
  if (GEMINI_KEYS.length === 0) return null;
  const key = GEMINI_KEYS[keyIndex % GEMINI_KEYS.length];
  keyIndex++;
  return key;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, model = 'gemini-2.0-flash-lite' } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  // Try each key until one works
  loadKeys();
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const apiKey = getNextKey();
    if (!apiKey) break;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (response.status === 429 || response.status === 403) continue;
      if (!response.ok) continue;

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        return res.status(200).json({ text, model });
      }
    } catch {
      continue;
    }
  }

  return res.status(503).json({ error: 'All API keys exhausted or failed' });
}
