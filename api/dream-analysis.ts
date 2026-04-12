import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sanitizeInput } from './_lib/sanitize';
import { rateLimit } from './_lib/rateLimit';

/**
 * Vercel Serverless Function: Claude Dream Analysis
 * Keeps ANTHROPIC_API_KEY server-side — never exposed to the client bundle.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res)) return;

  const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server' });
  }

  const { dreamText, systemPrompt } = req.body as {
    dreamText?: string;
    systemPrompt?: string;
  };

  if (!dreamText || typeof dreamText !== 'string') {
    return res.status(400).json({ error: 'Missing dreamText' });
  }

  const cleaned = sanitizeInput(dreamText);
  const safeDreamText = cleaned.text;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2024-01-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2500,
        system: systemPrompt || '',
        messages: [
          {
            role: 'user',
            content: `Bitte analysiere diesen Traum tiefgehend und einfuehlsam:\n\n"${safeDreamText}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[dream-analysis] Anthropic error:', response.status, err);
      return res.status(response.status).json({
        error: (err as { error?: { message?: string } }).error?.message || 'Anthropic API error',
      });
    }

    const data = await response.json() as {
      content?: Array<{ text: string }>;
      usage?: { input_tokens: number; output_tokens: number };
    };
    const interpretation = data.content?.[0]?.text;

    if (!interpretation) {
      return res.status(502).json({ error: 'No interpretation received from Claude' });
    }

    return res.status(200).json({
      interpretation,
      provider: 'claude',
      model: 'claude-3-5-sonnet-20241022',
      tokensUsed: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
    });
  } catch (error: unknown) {
    console.error('[dream-analysis] Error:', error);
    return res.status(500).json({ error: 'Dream analysis request failed' });
  }
}
