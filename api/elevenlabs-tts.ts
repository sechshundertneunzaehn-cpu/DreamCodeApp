import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireTier } from './_lib/tierAuth';
import { sanitizeInput } from './_lib/sanitize';
import { handleCors } from './_lib/cors';

/**
 * Vercel Serverless Function: ElevenLabs Text-to-Speech proxy
 * Keeps ELEVENLABS_API_KEY server-side — never exposed to the client bundle.
 * Requires: silver-Tier (PRO) oder höher.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = await requireTier(req, res, 'silver');
  if (!auth) return;

  const apiKey = (process.env.ELEVENLABS_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured on server' });
  }

  const { voiceId, text, voiceSettings } = req.body as {
    voiceId?: string;
    text?: string;
    voiceSettings?: Record<string, unknown>;
  };

  if (!voiceId || !text) {
    return res.status(400).json({ error: 'Missing voiceId or text' });
  }

  const cleaned = sanitizeInput(text);
  const safeText = cleaned.text;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: safeText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings ?? {
            stability: 0.65,
            similarity_boost: 0.80,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('[elevenlabs-tts] API error:', response.status, errText);
      return res.status(response.status).json({ error: `ElevenLabs error: ${response.status}` });
    }

    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(Buffer.from(audioBuffer));
  } catch (error: unknown) {
    console.error('[elevenlabs-tts] Error:', error);
    return res.status(500).json({ error: 'ElevenLabs TTS request failed' });
  }
}
