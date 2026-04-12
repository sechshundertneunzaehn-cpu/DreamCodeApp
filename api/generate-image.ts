import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireTier } from './_lib/tierAuth';
import { sanitizeInput } from './_lib/sanitize';
import { rateLimit } from './_lib/rateLimit';
import { handleCors } from './_lib/cors';

/**
 * POST /api/generate-image — Bildgenerierung (4 Coins, eine Stufe)
 * Primary: Runware CivitAI (civitai:618692@691639) — beste Qualitaet
 * Fallback 1: Runware Standard (runware:100@1)
 * Fallback 2: Pollinations (gratis)
 * Requires: gold-Tier (PREMIUM) oder hoeher.
 */

const RUNWARE_API_BASE = 'https://api.runware.ai/v1';
const CIVITAI_MODEL = 'civitai:618692@691639';
const RUNWARE_FALLBACK_MODEL = 'runware:100@1';

async function tryRunware(
  apiKey: string,
  model: string,
  prompt: string,
  negativePrompt: string,
  width: number,
  height: number,
): Promise<string | null> {
  try {
    const r = await fetch(`${RUNWARE_API_BASE}/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify([{
        taskType: 'imageInference',
        taskUUID: crypto.randomUUID(),
        model,
        positivePrompt: prompt,
        negativePrompt,
        width,
        height,
        numberResults: 1,
        CFGScale: 7,
        steps: 25,
      }]),
    });

    if (!r.ok) {
      console.error(`[generate-image] Runware ${model} error:`, r.status);
      return null;
    }

    const data = await r.json() as { data?: Array<{ imageURL?: string }> };
    return data.data?.[0]?.imageURL || null;
  } catch (e: any) {
    console.error(`[generate-image] Runware ${model} exception:`, e.message);
    return null;
  }
}

async function tryPollinations(prompt: string, width: number, height: number): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&nologo=true`;
    const r = await fetch(url, { method: 'HEAD' });
    if (r.ok || r.status === 301 || r.status === 302) {
      return url;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res)) return;

  const auth = await requireTier(req, res, 'gold');
  if (!auth) return;

  const { prompt, negativePrompt, width, height } = req.body as {
    prompt?: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
  };

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const cleaned = sanitizeInput(prompt);
  const safePrompt = cleaned.text;
  const neg = negativePrompt ?? 'blurry, low quality, distorted, ugly, text, watermark';
  const w = width ?? 1024;
  const h = height ?? 576;

  const runwareKey = (process.env.RUNWARE_API_KEY || '').trim();

  // 1. CivitAI (beste Qualitaet)
  if (runwareKey) {
    const url = await tryRunware(runwareKey, CIVITAI_MODEL, safePrompt, neg, w, h);
    if (url) return res.status(200).json({ imageURL: url, provider: 'civitai' });
  }

  // 2. Runware Standard (Fallback)
  if (runwareKey) {
    const url = await tryRunware(runwareKey, RUNWARE_FALLBACK_MODEL, safePrompt, neg, w, h);
    if (url) return res.status(200).json({ imageURL: url, provider: 'runware' });
  }

  // 3. Pollinations (gratis Fallback)
  const polUrl = await tryPollinations(safePrompt, w, h);
  if (polUrl) return res.status(200).json({ imageURL: polUrl, provider: 'pollinations' });

  return res.status(502).json({ error: 'Alle Bildgenerierungs-Provider fehlgeschlagen' });
}
