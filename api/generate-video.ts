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

const RL_MINUTE = 60_000;
const RL_HOUR = 3_600_000;
const RL_DAY = 86_400_000;

const ipTimestamps = new Map<string, number[]>();

let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * RL_MINUTE;

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - RL_DAY;
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
  const recent = timestamps.filter((t) => t > now - RL_DAY);

  const inLastMinute = recent.filter((t) => t > now - RL_MINUTE).length;
  const inLastHour = recent.filter((t) => t > now - RL_HOUR).length;
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
 * Vercel Serverless Function: Replicate Video Generation
 * POST /api/generate-video  → startet Prediction, gibt {id, status, urls} zurueck
 * GET  /api/generate-video?id=xxx → pollt Status, gibt {status, output} zurueck
 * Requires: gold-Tier (PREMIUM) oder höher.
 */

const REPLICATE_API = 'https://api.replicate.com/v1';

// WAN 2.1 text-to-video 480p (wavespeedai/wan-2.1-t2v-480p)
const WAN_MODEL = 'wavespeedai/wan-2.1-t2v-480p';
const WAN_VERSION = '7677a619127ea34d1ed873fb5b77448e4b9889fbd83809b44a2c459ace99192a';

function getApiKey(): string {
  return (process.env.REPLICATE_API_KEY || '').trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!rateLimit(req, res)) return;

  const auth = await requireTier(req, res, 'gold');
  if (!auth) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(500).json({ error: 'REPLICATE_API_KEY nicht konfiguriert' });
  }

  // GET: Poll Prediction Status
  if (req.method === 'GET') {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Prediction ID fehlt' });
    }

    try {
      const statusRes = await fetch(`${REPLICATE_API}/predictions/${id}`, {
        headers: { Authorization: `Token ${apiKey}` },
      });

      if (!statusRes.ok) {
        const err = await statusRes.text();
        return res.status(statusRes.status).json({ error: err });
      }

      const data = await statusRes.json();
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('[generate-video] Poll-Fehler:', error.message);
      return res.status(500).json({ error: 'Poll fehlgeschlagen' });
    }
  }

  // POST: Neue Prediction starten
  if (req.method === 'POST') {
    try {
      const { prompt, style, aspectRatio } = req.body as {
        prompt?: string;
        style?: string;
        aspectRatio?: string;
      };

      if (!prompt) {
        return res.status(400).json({ error: 'prompt fehlt' });
      }

      const cleaned = sanitizeInput(prompt);
      const safePrompt = cleaned.text;

      const stylePrefix: Record<string, string> = {
        cinematic: 'Cinematic film style.',
        dreamlike: 'Dreamlike ethereal atmosphere, soft lighting.',
        surreal: 'Surrealist art style.',
        fantasy: 'Fantasy style with magical atmosphere.',
        cartoon: 'Vibrant cartoon style, colorful.',
        anime: 'Japanese anime style, detailed.',
        real: 'Photorealistic, natural lighting, ultra detailed.',
        watercolor: 'Watercolor painting style, soft strokes.',
        comic: 'Comic book style, bold lines.',
      };
      const prefix = stylePrefix[style || 'dreamlike'] || stylePrefix.dreamlike;
      const optimizedPrompt = `SHOW EXACTLY: ${safePrompt}. Visual style: ${prefix} Smooth camera movement, high quality.`;


      const createRes = await fetch(`${REPLICATE_API}/predictions`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: WAN_VERSION,
          input: {
            prompt: optimizedPrompt,
            negative_prompt: 'blurry, low quality, distorted, ugly, text, watermark, static image',
            aspect_ratio: aspectRatio || '16:9',
            fast_mode: 'Balanced',
            sample_steps: 30,
            sample_guide_scale: 5,
          },
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.text();
        console.error('[generate-video] Replicate Fehler:', createRes.status, err);
        return res.status(createRes.status).json({ error: `Replicate: ${err}` });
      }

      const data = await createRes.json();
      return res.status(201).json(data);
    } catch (error: any) {
      console.error('[generate-video] Fehler:', error.message);
      return res.status(500).json({ error: 'Video-Generierung fehlgeschlagen' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
