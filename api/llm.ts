import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sanitizeMessages } from './_lib/sanitize';
import { rateLimit } from './_lib/rateLimit';
import { handleCors } from './_lib/cors';
import { requireAuth } from './_lib/tierAuth';

/**
 * Vercel Serverless Function: Generic LLM proxy
 * Supports OpenRouter + DeepSeek — keys stay server-side.
 */
type Message = { role: string; content: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res)) return;

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { provider, model, messages: rawMessages, temperature, maxTokens } = req.body as {
    provider?: string;
    model?: string;
    messages?: Message[];
    temperature?: number;
    maxTokens?: number;
  };

  if (!rawMessages || !Array.isArray(rawMessages)) {
    return res.status(400).json({ error: 'Missing messages array' });
  }

  const { messages } = sanitizeMessages(rawMessages);

  const body = JSON.stringify({
    model: model || 'qwen/qwen3-coder:free',
    messages,
    temperature: temperature ?? 0.7,
    max_tokens: maxTokens ?? 2000,
  });

  try {
    if (!provider || provider === 'openrouter') {
      const key = (process.env.OPENROUTER_API_KEY || '').trim();
      if (!key) return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });

      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          'HTTP-Referer': 'https://dreamcodeapp.vercel.app',
          'X-Title': 'DreamCode App',
        },
        body,
      });
      if (!r.ok) {
        const err = await r.text();
        console.error('[llm] OpenRouter error:', r.status, err);
        return res.status(r.status).json({ error: `OpenRouter error: ${r.status}` });
      }
      const data = await r.json() as { choices?: Array<{ message?: { content?: string } }> };
      const text = data.choices?.[0]?.message?.content?.trim() ?? '';
      return res.status(200).json({ text, provider: 'openrouter' });
    }

    if (provider === 'deepseek') {
      const key = (process.env.DEEPSEEK_API_KEY || '').trim();
      if (!key) return res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured' });

      const r = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body,
      });
      if (!r.ok) {
        const err = await r.text();
        console.error('[llm] DeepSeek error:', r.status, err);
        return res.status(r.status).json({ error: `DeepSeek error: ${r.status}` });
      }
      const data = await r.json() as { choices?: Array<{ message?: { content?: string } }> };
      const text = data.choices?.[0]?.message?.content?.trim() ?? '';
      return res.status(200).json({ text, provider: 'deepseek' });
    }

    return res.status(400).json({ error: `Unknown provider: ${provider}` });
  } catch (error: unknown) {
    console.error('[llm] Error:', error);
    return res.status(500).json({ error: 'LLM proxy request failed' });
  }
}
