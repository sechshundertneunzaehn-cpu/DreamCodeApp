import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: Deepgram Text-to-Speech proxy
 * Keeps DEEPGRAM_API_KEY server-side — returns audio/mpeg as base64.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = (process.env.DEEPGRAM_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'DEEPGRAM_API_KEY not configured' });
  }

  const { text, voice } = req.body as { text?: string; voice?: string };
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text' });
  }

  const voiceModel = voice || 'aura-luna-en';

  try {
    const response = await fetch(
      `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(voiceModel)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
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
