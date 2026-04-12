import type { VercelRequest, VercelResponse } from '@vercel/node';

/* ── Inline: sanitize ──────────────────────────────────────────────── */

const MAX_INPUT_LENGTH = 5000;

const INJECTION_MARKERS = [
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /<\|system\|>/gi,
  /<\|user\|>/gi,
  /<\|assistant\|>/gi,
  /<\/s>/gi,
  /<<<\s*SYSTEM\s*>>>/gi,
  /<<<\s*END\s*>>>/gi,
  /```\s*system\b/gi,
];

const INJECTION_PHRASES = [
  /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|context)/gi,
  /forget\s+(all\s+)?(previous|prior|above|earlier|your)\s+(instructions?|prompts?|rules?|context|training)/gi,
  /disregard\s+(all\s+)?(previous|prior|above|earlier|your)\s+(instructions?|prompts?|rules?|guidelines?)/gi,
  /override\s+(all\s+)?(previous|prior|your|system)\s+(instructions?|prompts?|rules?)/gi,
  /you\s+are\s+now\s+(a|an|no\s+longer)\b/gi,
  /pretend\s+(to\s+be|you\s+are)\b/gi,
  /act\s+as\s+(if\s+you|a|an|the)\b/gi,
  /new\s+instructions?\s*:/gi,
  /^system\s*:/gim,
  /jailbreak/gi,
  /do\s+anything\s+now/gi,
  /DAN\s+mode/gi,
  /developer\s+mode\s+(enabled|on|activate)/gi,
];

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

function neutralizeMarkers(input: string): string {
  let result = input;
  for (const pattern of INJECTION_MARKERS) {
    result = result.replace(pattern, '');
  }
  return result;
}

function detectInjection(input: string): boolean {
  return INJECTION_PHRASES.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(input);
  });
}

interface SanitizeResult {
  text: string;
  flagged: boolean;
  truncated: boolean;
}

function sanitizeInput(raw: string): SanitizeResult {
  let text = stripHtml(raw);
  text = neutralizeMarkers(text);

  const flagged = detectInjection(text);

  const truncated = text.length > MAX_INPUT_LENGTH;
  if (truncated) {
    text = text.slice(0, MAX_INPUT_LENGTH);
  }

  text = text.replace(/\n{4,}/g, '\n\n\n').replace(/ {4,}/g, '   ').trim();

  return { text, flagged, truncated };
}

/* ── Inline: rateLimit ─────────────────────────────────────────────── */

const LIMITS = {
  perMinute: 10,
  perHour: 50,
  perDay: 200,
} as const;

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

const ipTimestamps = new Map<string, number[]>();

let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * MINUTE;

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - DAY;
  ipTimestamps.forEach((timestamps, ip) => {
    const fresh = timestamps.filter((t) => t > cutoff);
    if (fresh.length === 0) {
      ipTimestamps.delete(ip);
    } else {
      ipTimestamps.set(ip, fresh);
    }
  });
}

function getIp(req: VercelRequest): string {
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();
  return 'unknown';
}

function rateLimit(req: VercelRequest, res: VercelResponse): boolean {
  cleanup();

  const ip = getIp(req);
  const now = Date.now();

  const timestamps = ipTimestamps.get(ip) ?? [];
  const recent = timestamps.filter((t) => t > now - DAY);

  const inLastMinute = recent.filter((t) => t > now - MINUTE).length;
  const inLastHour = recent.filter((t) => t > now - HOUR).length;
  const inLastDay = recent.length;

  if (inLastMinute >= LIMITS.perMinute) {
    res.status(429).json({ error: 'Rate limit: max 10 Anfragen pro Minute' });
    return false;
  }
  if (inLastHour >= LIMITS.perHour) {
    res.status(429).json({ error: 'Rate limit: max 50 Anfragen pro Stunde' });
    return false;
  }
  if (inLastDay >= LIMITS.perDay) {
    res.status(429).json({ error: 'Rate limit: max 200 Anfragen pro Tag' });
    return false;
  }

  recent.push(now);
  ipTimestamps.set(ip, recent);
  return true;
}

/* ── Handler ───────────────────────────────────────────────────────── */

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
