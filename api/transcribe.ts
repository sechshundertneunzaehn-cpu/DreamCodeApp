import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: Audio transcription via Gemini
 * Keeps GEMINI_API_KEY server-side. Accepts base64-encoded audio + language.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const { audioBase64, mimeType, language } = req.body as {
    audioBase64?: string;
    mimeType?: string;
    language?: string;
  };

  if (!audioBase64) {
    return res.status(400).json({ error: 'Missing audioBase64' });
  }

  const LANG_NAMES: Record<string, string> = {
    en: 'English', de: 'German (Deutsch)', tr: 'Turkish (Turkce)',
    es: 'Spanish (Espanol)', fr: 'French (Francais)', ar: 'Arabic',
    pt: 'Portuguese (Portugues)', ru: 'Russian',
  };
  const langName = (language && LANG_NAMES[language]) ? LANG_NAMES[language] : 'English';

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'audio/webm',
                  data: audioBase64,
                },
              },
              {
                text: `Transcribe this audio recording accurately. The speaker is describing a dream in ${langName}. Return ONLY the transcribed text exactly as spoken, nothing else. Preserve all details and maintain the original language.`,
              },
            ],
          },
          generationConfig: { temperature: 0.1 },
        }),
      }
    );

    if (!r.ok) {
      const err = await r.text();
      console.error('[transcribe] Gemini error:', r.status, err);
      return res.status(r.status).json({ error: `Gemini transcription error: ${r.status}` });
    }

    const data = await r.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const transcription = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!transcription) {
      return res.status(502).json({ error: 'No transcription received' });
    }

    return res.status(200).json({ transcription });
  } catch (error: unknown) {
    console.error('[transcribe] Error:', error);
    return res.status(500).json({ error: 'Transcription request failed' });
  }
}
