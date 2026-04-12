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
 * Unified TTS proxy — Deepgram Aura, Google Chirp3-HD, or ElevenLabs
 * provider='google'     → Google Chirp3-HD (audio/wav)
 * provider='elevenlabs' → ElevenLabs (audio/mpeg, requires silver tier)
 * Default: Deepgram Aura (base64 audio/mpeg JSON)
 */

const GOOGLE_LANG_CODES: Record<string, string> = {
  de: 'de-DE', tr: 'tr-TR', ar: 'ar-XA', es: 'es-ES',
  fr: 'fr-FR', pt: 'pt-BR', ru: 'ru-RU', en: 'en-US',
};
const GOOGLE_DEFAULT_SUFFIX: Record<string, string> = {
  de: 'Achernar', tr: 'Achernar', ar: 'Achernar', es: 'Achernar',
  fr: 'Achernar', pt: 'Achernar', ru: 'Aoede', en: 'Achernar',
};

async function googleSynthesize(apiKey: string, text: string, langCode: string, voiceName: string) {
  return fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: langCode, name: voiceName },
      audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: 24000, speakingRate: 1.0, pitch: 0 },
    }),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res)) return;

  const { text, voice, provider, language, voiceSuffix, voiceId, voiceSettings } = req.body as {
    text?: string; voice?: string; provider?: string; language?: string; voiceSuffix?: string;
    voiceId?: string; voiceSettings?: Record<string, unknown>;
  };
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text' });
  }

  const cleaned = sanitizeInput(text);
  const safeText = cleaned.text;

  // ElevenLabs TTS (requires silver tier)
  if (provider === 'elevenlabs') {
    const auth = await requireTier(req, res, 'silver');
    if (!auth) return;
    const elKey = (process.env.ELEVENLABS_API_KEY || '').trim();
    if (!elKey) return res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured' });
    const vid = voiceId || '21m00Tcm4TlvDq8ikWAM';
    try {
      const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`, {
        method: 'POST',
        headers: { 'xi-api-key': elKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify({
          text: safeText, model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings ?? { stability: 0.65, similarity_boost: 0.80, style: 0.35, use_speaker_boost: true },
        }),
      });
      if (!elRes.ok) return res.status(elRes.status).json({ error: `ElevenLabs error: ${elRes.status}` });
      const buf = await elRes.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', buf.byteLength);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(Buffer.from(buf));
    } catch (e: any) {
      console.error('[tts/elevenlabs] Error:', e.message);
      return res.status(500).json({ error: 'ElevenLabs TTS failed' });
    }
  }

  // Google Cloud TTS (Chirp3-HD)
  if (provider === 'google') {
    const apiKey = (process.env.GOOGLE_CLOUD_TTS_KEY || '').trim();
    if (!apiKey) return res.status(500).json({ error: 'Google Cloud TTS API key not configured' });
    try {
      const lang = language || 'de';
      const langCode = GOOGLE_LANG_CODES[lang] || 'de-DE';
      const suffix = voiceSuffix || GOOGLE_DEFAULT_SUFFIX[lang] || 'Achernar';
      const voiceName = `${langCode}-Chirp3-HD-${suffix}`;

      let response = await googleSynthesize(apiKey, safeText, langCode, voiceName);
      if (!response.ok && voiceSuffix && voiceSuffix !== (GOOGLE_DEFAULT_SUFFIX[lang] || 'Achernar')) {
        const fallbackName = `${langCode}-Chirp3-HD-${GOOGLE_DEFAULT_SUFFIX[lang] || 'Achernar'}`;
        response = await googleSynthesize(apiKey, safeText, langCode, fallbackName);
      }
      if (!response.ok) {
        const errText = await response.text();
        console.error('[tts/google] error:', response.status, errText);
        return res.status(response.status).json({ error: `Google Cloud TTS error: ${response.status}` });
      }
      const data = await response.json() as { audioContent?: string };
      if (!data.audioContent) return res.status(500).json({ error: 'No audio content returned' });
      const buffer = Buffer.from(data.audioContent, 'base64');
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(buffer);
    } catch (error: any) {
      console.error('[tts/google] Error:', error.message);
      return res.status(500).json({ error: 'TTS request failed' });
    }
  }

  // Deepgram Aura TTS (default)
  const apiKey = (process.env.DEEPGRAM_API_KEY || '').trim();
  if (!apiKey) return res.status(500).json({ error: 'DEEPGRAM_API_KEY not configured' });

  const voiceModel = voice || 'aura-luna-en';
  try {
    const response = await fetch(
      `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(voiceModel)}`,
      {
        method: 'POST',
        headers: { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: safeText }),
      }
    );
    if (!response.ok) {
      const errText = await response.text();
      console.error('[deepgram-tts] API error:', response.status, errText);
      return res.status(response.status).json({ error: `Deepgram error: ${response.status}` });
    }
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    return res.status(200).json({ audioBase64, provider: 'deepgram' });
  } catch (error: unknown) {
    console.error('[deepgram-tts] Error:', error);
    return res.status(500).json({ error: 'Deepgram TTS request failed' });
  }
}
