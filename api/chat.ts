import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sanitizeMessages } from './_lib/sanitize';
import { rateLimit } from './_lib/rateLimit';

/**
 * Vercel Serverless Function: Groq Chat (primary) → Mistral (fallback)
 * Enforces response language via system prompt
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res)) return;

  const groqKey = (process.env.GROQ_API_KEY || '').trim();
  const mistralKey = (process.env.MISTRAL_API_KEY || '').trim();

  if (!groqKey && !mistralKey) {
    return res.status(500).json({ error: 'No LLM API key configured' });
  }

  try {
    const { messages: rawMessages, language, systemPrompt } = req.body;
    if (!rawMessages || !Array.isArray(rawMessages)) {
      return res.status(400).json({ error: 'Missing messages array' });
    }

    const { messages } = sanitizeMessages(rawMessages);

    const LANG_NAMES: Record<string, string> = {
      de: 'Deutsch', tr: 'Tuerkisch', en: 'English', es: 'Spanisch',
      fr: 'Franzoesisch', ar: 'Arabisch', pt: 'Portugiesisch', ru: 'Russisch',
    };
    const effectiveLang = (language && LANG_NAMES[language]) ? language : 'de';
    const langName = LANG_NAMES[effectiveLang] || 'Deutsch';

    const langEnforcement = `\n\nCRITICAL REMINDER: You MUST respond ONLY in ${langName}. Every single word of your response must be in ${langName}. This is non-negotiable.`;

    const fullMessages = [
      { role: 'system', content: (systemPrompt || '') + langEnforcement },
      ...messages,
    ];

    // Try Groq first
    if (groqKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: fullMessages,
            temperature: 0.8,
            max_tokens: 1024,
          }),
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const reply = data.choices?.[0]?.message?.content || '';
          return res.status(200).json({ reply, provider: 'groq' });
        }
        console.error('[chat] Groq failed:', groqRes.status);
      } catch (e: any) {
        console.error('[chat] Groq error:', e.message);
      }
    }

    // Fallback: Mistral
    if (mistralKey) {
      const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mistralKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: fullMessages,
          temperature: 0.8,
          max_tokens: 1024,
        }),
      });

      if (mistralRes.ok) {
        const data = await mistralRes.json();
        const reply = data.choices?.[0]?.message?.content || '';
        return res.status(200).json({ reply, provider: 'mistral' });
      }
      console.error('[chat] Mistral failed:', mistralRes.status);
    }

    return res.status(502).json({ error: 'All LLM providers failed' });
  } catch (error: any) {
    console.error('[chat] Error:', error.message);
    return res.status(500).json({ error: 'Chat request failed' });
  }
}
