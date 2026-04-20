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

function sanitizeMessages(
  messages: Array<{ role: string; content: string }>
): { messages: Array<{ role: string; content: string }>; flagged: boolean } {
  let anyFlagged = false;

  const sanitized = messages.map((msg) => {
    if (msg.role !== 'user') return msg;
    const result = sanitizeInput(msg.content || '');
    if (result.flagged) anyFlagged = true;
    return { ...msg, content: result.text };
  });

  return { messages: sanitized, flagged: anyFlagged };
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
 * Vercel Serverless Function: Generic LLM proxy
 * Supports OpenRouter + DeepSeek — keys stay server-side.
 */
type Message = { role: string; content: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res)) return;

  const { provider, model, messages: rawMessages, temperature, maxTokens } = req.body as {
    provider?: string;
    model?: string;
    messages?: Message[];
    temperature?: number;
    maxTokens?: number;
  };

  if (!rawMessages || !Array.isArray(rawMessages)) {
    return res.status(400).json({ error: 'Missing messages array' });
  }

  const { messages } = sanitizeMessages(rawMessages);

  const body = JSON.stringify({
    model: model || 'qwen/qwen3-coder:free',
    messages,
    temperature: temperature ?? 0.7,
    max_tokens: maxTokens ?? 2000,
  });

  try {
    if (!provider || provider === 'openrouter') {
      const key = (process.env.OPENROUTER_API_KEY || '').trim();
      if (!key) return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });

      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          'HTTP-Referer': 'https://dreamcodeapp.vercel.app',
          'X-Title': 'DreamCode App',
        },
        body,
      });
      if (!r.ok) {
        const err = await r.text();
        console.error('[llm] OpenRouter error:', r.status, err);
        return res.status(r.status).json({ error: `OpenRouter error: ${r.status}` });
      }
      const data = await r.json() as { choices?: Array<{ message?: { content?: string } }> };
      const text = data.choices?.[0]?.message?.content?.trim() ?? '';
      return res.status(200).json({ text, provider: 'openrouter' });
    }

    if (provider === 'deepseek') {
      const key = (process.env.DEEPSEEK_API_KEY || '').trim();
      if (!key) return res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured' });

      const r = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body,
      });
      if (!r.ok) {
        const err = await r.text();
        console.error('[llm] DeepSeek error:', r.status, err);
        return res.status(r.status).json({ error: `DeepSeek error: ${r.status}` });
      }
      const data = await r.json() as { choices?: Array<{ message?: { content?: string } }> };
      const text = data.choices?.[0]?.message?.content?.trim() ?? '';
      return res.status(200).json({ text, provider: 'deepseek' });
    }

    return res.status(400).json({ error: `Unknown provider: ${provider}` });
  } catch (error: unknown) {
    console.error('[llm] Error:', error);
    return res.status(500).json({ error: 'LLM proxy request failed' });
  }
}
