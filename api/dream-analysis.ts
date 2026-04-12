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
 * Vercel Serverless Function: Claude Dream Analysis
 * Keeps ANTHROPIC_API_KEY server-side — never exposed to the client bundle.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res)) return;

  const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server' });
  }

  const { dreamText, systemPrompt } = req.body as {
    dreamText?: string;
    systemPrompt?: string;
  };

  if (!dreamText || typeof dreamText !== 'string') {
    return res.status(400).json({ error: 'Missing dreamText' });
  }

  const cleaned = sanitizeInput(dreamText);
  const safeDreamText = cleaned.text;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2024-01-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2500,
        system: systemPrompt || '',
        messages: [
          {
            role: 'user',
            content: `Bitte analysiere diesen Traum tiefgehend und einfuehlsam:\n\n"${safeDreamText}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[dream-analysis] Anthropic error:', response.status, err);
      return res.status(response.status).json({
        error: (err as { error?: { message?: string } }).error?.message || 'Anthropic API error',
      });
    }

    const data = await response.json() as {
      content?: Array<{ text: string }>;
      usage?: { input_tokens: number; output_tokens: number };
    };
    const interpretation = data.content?.[0]?.text;

    if (!interpretation) {
      return res.status(502).json({ error: 'No interpretation received from Claude' });
    }

    return res.status(200).json({
      interpretation,
      provider: 'claude',
      model: 'claude-3-5-sonnet-20241022',
      tokensUsed: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
    });
  } catch (error: unknown) {
    console.error('[dream-analysis] Error:', error);
    return res.status(500).json({ error: 'Dream analysis request failed' });
  }
}
