import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: AI image generation proxy
 * Supports Runware (primary) and Gemini (fallback) — keys stay server-side.
 */
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const RUNWARE_API_BASE = 'https://api.runware.ai/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { provider, prompt, model, negativePrompt, width, height, steps, cfgScale } = req.body as {
    provider?: string;
    prompt?: string;
    model?: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfgScale?: number;
  };

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    if (!provider || provider === 'runware') {
      const apiKey = (process.env.RUNWARE_API_KEY || '').trim();
      if (!apiKey) return res.status(500).json({ error: 'RUNWARE_API_KEY not configured' });

      const imageModel = model || 'runware:100@1';
      const r = await fetch(`${RUNWARE_API_BASE}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify([
          {
            taskType: 'imageInference',
            taskUUID: crypto.randomUUID(),
            model: imageModel,
            positivePrompt: prompt,
            negativePrompt: negativePrompt ?? '',
            width: width ?? 1024,
            height: height ?? 576,
            numberResults: 1,
            CFGScale: cfgScale ?? 7,
            steps: steps ?? 20,
          },
        ]),
      });

      if (!r.ok) {
        const err = await r.text();
        console.error('[generate-image] Runware error:', r.status, err);
        return res.status(r.status).json({ error: `Runware error: ${r.status}` });
      }

      const data = await r.json() as { data?: Array<{ imageURL?: string }> };
      const imageURL = data.data?.[0]?.imageURL;
      if (!imageURL) return res.status(502).json({ error: 'Runware returned no image URL' });

      return res.status(200).json({ imageURL, provider: 'runware' });
    }

    if (provider === 'gemini') {
      const apiKey = (process.env.GEMINI_API_KEY || '').trim();
      if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

      const geminiModel = model || 'gemini-2.5-flash-image';
      const r = await fetch(`${GEMINI_API_BASE}/${geminiModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9 },
        }),
      });

      if (!r.ok) {
        const err = await r.text();
        console.error('[generate-image] Gemini error:', r.status, err);
        return res.status(r.status).json({ error: `Gemini image error: ${r.status}` });
      }

      const data = await r.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }>;
      };
      const parts = data.candidates?.[0]?.content?.parts || [];
      const inlineImage = parts.find(p => p.inlineData?.data);
      if (!inlineImage?.inlineData?.data) {
        return res.status(502).json({ error: 'Gemini returned no image data' });
      }

      const dataUrl = `data:${inlineImage.inlineData.mimeType || 'image/png'};base64,${inlineImage.inlineData.data}`;
      return res.status(200).json({ imageURL: dataUrl, provider: 'gemini' });
    }

    return res.status(400).json({ error: `Unknown provider: ${provider}` });
  } catch (error: unknown) {
    console.error('[generate-image] Error:', error);
    return res.status(500).json({ error: 'Image generation request failed' });
  }
}
