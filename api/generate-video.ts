import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireTier } from './_lib/tierAuth';
import { sanitizeInput } from './_lib/sanitize';
import { rateLimit } from './_lib/rateLimit';
import { handleCors } from './_lib/cors';

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
  if (handleCors(req, res)) return;
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
        cinematic: 'Cinematic film quality, dramatic lighting, slow motion, movie-like atmosphere,',
        dreamlike: 'Dreamlike ethereal atmosphere, soft glow, floating particles, mystical fog, otherworldly,',
        surreal: 'Surrealist art style, impossible geometry, melting objects, Salvador Dali inspired,',
        fantasy: 'Epic fantasy, magical particles, enchanted forest, glowing elements, mystical creatures,',
        cartoon: 'Vibrant cartoon style, colorful, animated look, playful,',
        anime: 'Japanese anime style, cinematic, detailed, Studio Ghibli inspired,',
        real: 'Photorealistic, cinematic 4K, natural lighting, ultra detailed,',
      };
      const prefix = stylePrefix[style || 'dreamlike'] || stylePrefix.dreamlike;
      const optimizedPrompt = `${prefix} ${safePrompt}. Smooth camera movement, ambient lighting, atmospheric. High quality.`;


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
