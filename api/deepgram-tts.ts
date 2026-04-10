import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: TTS proxy — Deepgram Aura or Google Cloud Chirp3-HD
 * Set provider='google' in body for Google Cloud TTS (returns audio/wav binary).
 * Default: Deepgram Aura (returns base64 audio/mpeg JSON).
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

  const { text, voice, provider, language, voiceSuffix } = req.body as {
    text?: string; voice?: string; provider?: string; language?: string; voiceSuffix?: string;
  };
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text' });
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

      let response = await googleSynthesize(apiKey, text, langCode, voiceName);
      if (!response.ok && voiceSuffix && voiceSuffix !== (GOOGLE_DEFAULT_SUFFIX[lang] || 'Achernar')) {
        const fallbackName = `${langCode}-Chirp3-HD-${GOOGLE_DEFAULT_SUFFIX[lang] || 'Achernar'}`;
        response = await googleSynthesize(apiKey, text, langCode, fallbackName);
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
