import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sanitizeInput } from './_lib/sanitize';
import { rateLimit } from './_lib/rateLimit';
import { handleCors } from './_lib/cors';
import { requireAuth } from './_lib/tierAuth';

/**
 * Vercel Serverless Function: Unified TTS proxy
 * provider='google'     → Google Chirp3-HD (audio/wav)
 * provider='elevenlabs' → ElevenLabs eleven_multilingual_v2 (audio/mpeg)
 * Default: Deepgram Aura (base64 audio/mpeg JSON)
 */

// Chirp3-HD Sprachmappings — alle Sprachen aus dem Prompt
const GOOGLE_LANG_CODES: Record<string, string> = {
  ar: 'ar-XA',   // MSA (Modern Standard Arabic)
  de: 'de-DE',
  en: 'en-US',
  tr: 'tr-TR',
  fr: 'fr-FR',
  es: 'es-ES',
  ru: 'ru-RU',
  ja: 'ja-JP',
  pt: 'pt-BR',
  ko: 'ko-KR',
  zh: 'cmn-CN',
  hi: 'hi-IN',
  it: 'it-IT',
  pl: 'pl-PL',
};
const GOOGLE_DEFAULT_SUFFIX: Record<string, string> = {
  ar: 'Achernar', de: 'Achernar', en: 'Achernar', tr: 'Achernar',
  fr: 'Achernar', es: 'Achernar', ja: 'Achernar', pt: 'Achernar',
  ko: 'Achernar', zh: 'Achernar', hi: 'Achernar', it: 'Achernar',
  pl: 'Achernar', ru: 'Aoede',
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
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res)) return;

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { text, voice, provider, language, voiceSuffix, voiceId, voiceSettings } = req.body as {
    text?: string; voice?: string; provider?: string; language?: string; voiceSuffix?: string;
    voiceId?: string; voiceSettings?: Record<string, unknown>;
  };
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text' });
  }

  const cleaned = sanitizeInput(text);
  const safeText = cleaned.text;

  // ElevenLabs TTS (Premium)
  if (provider === 'elevenlabs') {
    const apiKey = (process.env.ELEVENLABS_API_KEY || '').trim();
    if (!apiKey) return res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured' });
    const vid = voiceId || '21m00Tcm4TlvDq8ikWAM';
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify({
          text: safeText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings ?? { stability: 0.65, similarity_boost: 0.80, style: 0.35, use_speaker_boost: true },
        }),
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error('[tts/elevenlabs] error:', response.status, errText);
        return res.status(response.status).json({ error: `ElevenLabs error: ${response.status}` });
      }
      const audioBuffer = await response.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.byteLength);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(Buffer.from(audioBuffer));
    } catch (error: any) {
      console.error('[tts/elevenlabs] Error:', error.message);
      return res.status(500).json({ error: 'ElevenLabs TTS request failed' });
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
        console.error('[tts/google] error:', response.status);
        // ElevenLabs Fallback (eleven_multilingual_v2)
        const elevenKey = (process.env.ELEVENLABS_API_KEY || '').trim();
        if (elevenKey) {
          try {
            const elRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
              method: 'POST',
              headers: { 'xi-api-key': elevenKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
              body: JSON.stringify({ text: safeText, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.65, similarity_boost: 0.8 } }),
            });
            if (elRes.ok) {
              const buf = await elRes.arrayBuffer();
              res.setHeader('Content-Type', 'audio/mpeg');
              res.setHeader('Content-Length', buf.byteLength);
              res.setHeader('Cache-Control', 'no-store');
              return res.status(200).send(Buffer.from(buf));
            }
          } catch (e: any) {
            console.error('[tts/elevenlabs-fallback] error:', e.message);
          }
        }
        return res.status(502).json({ error: 'TTS Premium fehlgeschlagen (Google + ElevenLabs)' });
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
