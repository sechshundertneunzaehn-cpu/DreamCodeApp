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
 * POST /api/chat — Live Chat
 * Primary: Gemini 2.0 Flash via OpenRouter
 * Fallback 1: GROQ Llama-3.3-70b
 * Fallback 2: Mistral
 */

type ChatMsg = { role: string; content: string };
type ChatResp = { choices?: Array<{ message?: { content?: string } }> };

async function tryProvider(
  url: string, apiKey: string, model: string, messages: ChatMsg[],
  extraHeaders?: Record<string, string>
): Promise<string | null> {
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`, ...extraHeaders },
      body: JSON.stringify({ model, messages, temperature: 0.8, max_tokens: 1024 }),
    });
    if (!r.ok) { console.error(`[chat] ${model} failed:`, r.status); return null; }
    const data = await r.json() as ChatResp;
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e: any) { console.error(`[chat] ${model} error:`, e.message); return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res)) return;

  try {
    const { messages: rawMessages, language, systemPrompt } = req.body;
    if (!rawMessages || !Array.isArray(rawMessages)) {
      return res.status(400).json({ error: 'Missing messages array' });
    }

    const { messages } = sanitizeMessages(rawMessages);

    const LANG_NAMES: Record<string, string> = {
      de: 'Deutsch', tr: 'Tuerkisch', en: 'English', es: 'Spanisch',
      fr: 'Franzoesisch', ar: 'Arabisch', pt: 'Portugiesisch', ru: 'Russisch',
      zh: 'Chinesisch', ja: 'Japanisch', ko: 'Koreanisch', fa: 'Persisch',
      ur: 'Urdu', it: 'Italienisch', pl: 'Polnisch', hi: 'Hindi',
    };
    const effectiveLang = (language && LANG_NAMES[language]) ? language : 'de';
    const langName = LANG_NAMES[effectiveLang] || 'Deutsch';

    const langEnforcement = `\n\nCRITICAL REMINDER: You MUST respond ONLY in ${langName}. Every single word of your response must be in ${langName}. This is non-negotiable.`;

    const fullMessages: ChatMsg[] = [
      { role: 'system', content: (systemPrompt || '') + langEnforcement },
      ...messages,
    ];

    // 1. Primary: Gemini 2.0 Flash via OpenRouter
    const orKey = (process.env.OPENROUTER_API_KEY || '').trim();
    if (orKey) {
      const reply = await tryProvider(
        'https://openrouter.ai/api/v1/chat/completions', orKey,
        'google/gemini-2.0-flash-001', fullMessages,
        { 'HTTP-Referer': 'https://dream-code.app', 'X-Title': 'DreamCode App' }
      );
      if (reply) return res.status(200).json({ reply, provider: 'gemini-flash' });
    }

    // 2. Fallback: GROQ
    const groqKey = (process.env.GROQ_API_KEY || '').trim();
    if (groqKey) {
      const reply = await tryProvider(
        'https://api.groq.com/openai/v1/chat/completions', groqKey,
        'llama-3.3-70b-versatile', fullMessages
      );
      if (reply) return res.status(200).json({ reply, provider: 'groq' });
    }

    // 3. Fallback: Mistral
    const mistralKey = (process.env.MISTRAL_API_KEY || '').trim();
    if (mistralKey) {
      const reply = await tryProvider(
        'https://api.mistral.ai/v1/chat/completions', mistralKey,
        'mistral-large-latest', fullMessages
      );
      if (reply) return res.status(200).json({ reply, provider: 'mistral' });
    }

    return res.status(502).json({ error: 'Alle Chat-Provider fehlgeschlagen' });
  } catch (error: any) {
    console.error('[chat] Error:', error.message);
    return res.status(500).json({ error: 'Chat request failed' });
  }
}
