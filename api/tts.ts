import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: Google Cloud Text-to-Speech
 * Returns high-quality audio (LINEAR16 WAV) for DE, TR, AR, ES, FR, PT, RU, EN
 * Accepts optional voiceSuffix for character-specific voices (Chirp3-HD)
 */

const LANG_CODES: Record<string, string> = {
  de: 'de-DE', tr: 'tr-TR', ar: 'ar-XA', es: 'es-ES',
  fr: 'fr-FR', pt: 'pt-BR', ru: 'ru-RU', en: 'en-US',
};

// Default voice suffix per language (fallback when voiceSuffix not provided or fails)
const DEFAULT_SUFFIX: Record<string, string> = {
  de: 'Achernar', tr: 'Achernar', ar: 'Achernar', es: 'Achernar',
  fr: 'Achernar', pt: 'Achernar', ru: 'Aoede', en: 'Achernar',
};

async function synthesize(apiKey: string, ttsUrl: string, text: string, langCode: string, voiceName: string) {
  const response = await fetch(ttsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: langCode, name: voiceName },
      audioConfig: {
        audioEncoding: 'LINEAR16',
        sampleRateHertz: 24000,
        speakingRate: 1.0,
        pitch: 0,
      },
    }),
  });
  return response;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = (process.env.GOOGLE_CLOUD_TTS_KEY || process.env.VITE_GOOGLE_CLOUD_TTS_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'Google Cloud TTS API key not configured' });
  }

  try {
    const { text, language, voiceSuffix } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });

    const lang = language || 'de';
    const langCode = LANG_CODES[lang] || 'de-DE';
    const suffix = voiceSuffix || DEFAULT_SUFFIX[lang] || 'Achernar';
    const voiceName = `${langCode}-Chirp3-HD-${suffix}`;
    const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    console.log(`[tts] Google Cloud: lang=${lang}, voice=${voiceName}, text="${text.substring(0, 60)}..."`);

    let response = await synthesize(apiKey, ttsUrl, text, langCode, voiceName);

    // If custom suffix fails, retry with default suffix
    if (!response.ok && voiceSuffix && voiceSuffix !== (DEFAULT_SUFFIX[lang] || 'Achernar')) {
      const errText = await response.text();
      console.warn(`[tts] Voice ${voiceName} failed (${response.status}), retrying with default...`, errText.substring(0, 200));
      const fallbackName = `${langCode}-Chirp3-HD-${DEFAULT_SUFFIX[lang] || 'Achernar'}`;
      response = await synthesize(apiKey, ttsUrl, text, langCode, fallbackName);
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('[tts] Google Cloud error:', response.status, errText);
      return res.status(response.status).json({ error: `Google Cloud TTS error: ${response.status}` });
    }

    const data = await response.json();
    const audioContent = data.audioContent;

    if (!audioContent) {
      return res.status(500).json({ error: 'No audio content returned' });
    }

    const buffer = Buffer.from(audioContent, 'base64');
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buffer);
  } catch (error: any) {
    console.error('[tts] Error:', error.message);
    return res.status(500).json({ error: 'TTS request failed' });
  }
}
