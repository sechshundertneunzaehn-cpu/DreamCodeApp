import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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

/* ── Inline: tierAuth (requireTier) ────────────────────────────────── */

const TIER_RANK: Record<string, number> = {
  bronze: 0,
  silver:  1,
  gold:    2,
  deluxe:  3,
  vip:     4,
};

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function getSupabaseAnon() {
  const url  = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key  = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

interface TierAuthResult {
  userId: string;
  tier: string;
}

async function requireTier(
  req: VercelRequest,
  res: VercelResponse,
  minTier: string
): Promise<TierAuthResult | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: missing Bearer token' });
    return null;
  }
  const token = authHeader.slice(7);

  const anonClient = getSupabaseAnon();
  if (!anonClient) {
    res.status(503).json({ error: 'Auth service not configured' });
    return null;
  }

  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !user) {
    res.status(401).json({ error: 'Unauthorized: invalid token' });
    return null;
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    res.status(503).json({ error: 'Database service not configured' });
    return null;
  }

  const { data: profile, error: dbError } = await admin
    .from('profiles')
    .select('subscription, payment_failed')
    .eq('id', user.id)
    .single();

  if (dbError || !profile) {
    res.status(403).json({ error: 'Profile not found' });
    return null;
  }

  if (profile.payment_failed) {
    res.status(402).json({ error: 'Payment failed — bitte Zahlungsmethode aktualisieren' });
    return null;
  }

  const userRank = TIER_RANK[profile.subscription] ?? 0;
  const minRank  = TIER_RANK[minTier] ?? 999;

  if (userRank < minRank) {
    res.status(403).json({
      error:       `Diese Funktion erfordert ${minTier}-Abo oder höher`,
      currentTier: profile.subscription,
      requiredTier: minTier,
    });
    return null;
  }

  return { userId: user.id, tier: profile.subscription };
}

/* ── Handler ───────────────────────────────────────────────────────── */

/**
 * Vercel Serverless Function: AI image generation proxy
 * Supports Runware (primary) and Gemini (fallback) — keys stay server-side.
 * Requires: gold-Tier (PREMIUM) oder höher.
 */
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const RUNWARE_API_BASE = 'https://api.runware.ai/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res)) return;

  const auth = await requireTier(req, res, 'gold');
  if (!auth) return;

  const { provider, prompt, model, negativePrompt, width, height, steps, cfgScale } = req.body as {
    provider?: string;
    prompt?: string;
    model?: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfgScale?: number;
  };

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const cleaned = sanitizeInput(prompt);
  const safePrompt = cleaned.text;

  try {
    if (!provider || provider === 'runware') {
      const apiKey = (process.env.RUNWARE_API_KEY || '').trim();
      if (!apiKey) return res.status(500).json({ error: 'RUNWARE_API_KEY not configured' });

      const imageModel = model || 'runware:100@1';
      const r = await fetch(`${RUNWARE_API_BASE}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify([
          {
            taskType: 'imageInference',
            taskUUID: crypto.randomUUID(),
            model: imageModel,
            positivePrompt: safePrompt,
            negativePrompt: negativePrompt ?? '',
            width: width ?? 1024,
            height: height ?? 576,
            numberResults: 1,
            CFGScale: cfgScale ?? 7,
            steps: steps ?? 20,
          },
        ]),
      });

      if (!r.ok) {
        const err = await r.text();
        console.error('[generate-image] Runware error:', r.status, err);
        return res.status(r.status).json({ error: `Runware error: ${r.status}` });
      }

      const data = await r.json() as { data?: Array<{ imageURL?: string }> };
      const imageURL = data.data?.[0]?.imageURL;
      if (!imageURL) return res.status(502).json({ error: 'Runware returned no image URL' });

      return res.status(200).json({ imageURL, provider: 'runware' });
    }

    if (provider === 'gemini') {
      const apiKey = (process.env.GEMINI_API_KEY || '').trim();
      if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

      const geminiModel = model || 'gemini-2.5-flash-image';
      const r = await fetch(`${GEMINI_API_BASE}/${geminiModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: safePrompt }] }],
          generationConfig: { temperature: 0.9 },
        }),
      });

      if (!r.ok) {
        const err = await r.text();
        console.error('[generate-image] Gemini error:', r.status, err);
        return res.status(r.status).json({ error: `Gemini image error: ${r.status}` });
      }

      const data = await r.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }>;
      };
      const parts = data.candidates?.[0]?.content?.parts || [];
      const inlineImage = parts.find(p => p.inlineData?.data);
      if (!inlineImage?.inlineData?.data) {
        return res.status(502).json({ error: 'Gemini returned no image data' });
      }

      const dataUrl = `data:${inlineImage.inlineData.mimeType || 'image/png'};base64,${inlineImage.inlineData.data}`;
      return res.status(200).json({ imageURL: dataUrl, provider: 'gemini' });
    }

    return res.status(400).json({ error: `Unknown provider: ${provider}` });
  } catch (error: unknown) {
    console.error('[generate-image] Error:', error);
    return res.status(500).json({ error: 'Image generation request failed' });
  }
}
