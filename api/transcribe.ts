import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rateLimit } from './_lib/rateLimit';
import { handleCors } from './_lib/cors';
import { requireAuth } from './_lib/tierAuth';

/**
 * Vercel Serverless Function: Audio transcription via Gemini
 * Also handles action='get-token' for Deepgram temporary key issuance.
 * Keeps GEMINI_API_KEY and DEEPGRAM_API_KEY server-side.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res)) return;

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { action, audioBase64, mimeType, language } = req.body as {
    action?: string;
    audioBase64?: string;
    mimeType?: string;
    language?: string;
  };

  // Route: Deepgram temporary key issuance
  if (action === 'get-token') {
    const masterKey = (process.env.DEEPGRAM_API_KEY || '').trim();
    if (!masterKey) {
      return res.status(500).json({ error: 'DEEPGRAM_API_KEY not configured' });
    }
    try {
      const projectsRes = await fetch('https://api.deepgram.com/v1/projects', {
        headers: { Authorization: `Token ${masterKey}` },
      });
      if (!projectsRes.ok) {
        return res.status(projectsRes.status).json({ error: 'Failed to get Deepgram project' });
      }
      const projectsData = await projectsRes.json() as { projects?: Array<{ project_id: string }> };
      const projectId = projectsData.projects?.[0]?.project_id;
      if (!projectId) return res.status(500).json({ error: 'No Deepgram project found' });

      const tokenRes = await fetch(
        `https://api.deepgram.com/v1/projects/${projectId}/keys`,
        {
          method: 'POST',
          headers: { Authorization: `Token ${masterKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment: 'Temp key for live session', scopes: ['usage:write'], time_to_live_in_seconds: 30 }),
        }
      );
      if (!tokenRes.ok) return res.status(200).json({ key: null, fallback: true });
      const tokenData = await tokenRes.json() as { key?: string };
      return res.status(200).json({ key: tokenData.key ?? null });
    } catch {
      return res.status(200).json({ key: null, fallback: true });
    }
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

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
