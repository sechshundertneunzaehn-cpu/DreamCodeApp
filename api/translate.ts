import type { VercelRequest, VercelResponse } from '@vercel/node';

const RATE_LIMIT_MAP = new Map<string, { count: number; reset: number }>();
const MAX_REQUESTS_PER_MIN = 100;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(ip);
  if (!entry || now > entry.reset) {
    RATE_LIMIT_MAP.set(ip, { count: 1, reset: now + 60000 });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_MIN) return false;
  entry.count++;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown';
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Rate limit exceeded' });

  const { text, targetLang, engine = 'google', sourceLang } = req.body || {};
  if (!text || !targetLang) return res.status(400).json({ error: 'Missing text or targetLang' });

  try {
    let translated: string | null = null;

    if (engine === 'deepl') {
      translated = await translateDeepL(text, targetLang, sourceLang);
    } else if (engine === 'claude') {
      translated = await translateClaude(text, targetLang);
    }

    // Google / fallback
    if (!translated) {
      translated = await translateGoogle(text, targetLang, sourceLang);
    }

    return res.status(200).json({ translated: translated || text, engine: translated ? engine : 'fallback' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Translation failed' });
  }
}

async function translateDeepL(text: string, targetLang: string, sourceLang?: string): Promise<string | null> {
  const key = process.env.DEEPL_API_KEY;
  if (!key) return null;

  const langMap: Record<string, string> = {
    de: 'DE', en: 'EN', tr: 'TR', ar: 'AR', ru: 'RU', fr: 'FR', es: 'ES',
    pt: 'PT-BR', zh: 'ZH', ja: 'JA', ko: 'KO',
  };

  const target = langMap[targetLang] || targetLang.toUpperCase();
  const body: any = { text: [text], target_lang: target };
  if (sourceLang && langMap[sourceLang]) body.source_lang = langMap[sourceLang];

  try {
    const res = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `DeepL-Auth-Key ${key}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.translations?.[0]?.text || null;
  } catch { return null; }
}

async function translateClaude(text: string, targetLang: string): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `Translate the following text to ${targetLang}. Return ONLY the translated text:\n\n${text}`,
        }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.content?.[0]?.text || null;
  } catch { return null; }
}

async function translateGoogle(text: string, targetLang: string, sourceLang?: string): Promise<string | null> {
  // Use free Google Translate endpoint
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', sourceLang || 'auto');
  url.searchParams.set('tl', targetLang);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', text);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0].map((s: any) => s[0]).join('');
    }
    return null;
  } catch { return null; }
}
