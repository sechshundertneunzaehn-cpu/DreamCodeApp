import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: Deepgram temporary API key
 * Issues a short-lived key via Deepgram Management API — keeps master key server-side.
 * The client uses the temp key for WebSocket streaming then discards it.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const masterKey = (process.env.DEEPGRAM_API_KEY || '').trim();
  if (!masterKey) {
    return res.status(500).json({ error: 'DEEPGRAM_API_KEY not configured' });
  }

  try {
    // Get project ID first
    const projectsRes = await fetch('https://api.deepgram.com/v1/projects', {
      headers: { Authorization: `Token ${masterKey}` },
    });

    if (!projectsRes.ok) {
      console.error('[deepgram-token] Failed to get projects:', projectsRes.status);
      return res.status(projectsRes.status).json({ error: 'Failed to get Deepgram project' });
    }

    const projectsData = await projectsRes.json() as { projects?: Array<{ project_id: string }> };
    const projectId = projectsData.projects?.[0]?.project_id;
    if (!projectId) {
      return res.status(500).json({ error: 'No Deepgram project found' });
    }

    // Create a short-lived API key (expires in 10 seconds)
    const tokenRes = await fetch(
      `https://api.deepgram.com/v1/projects/${projectId}/keys`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${masterKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: 'Temp key for live session',
          scopes: ['usage:write'],
          time_to_live_in_seconds: 30,
        }),
      }
    );

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('[deepgram-token] Failed to create temp key:', tokenRes.status, err);
      // Fall back: return a masked signal to use Web Speech API
      return res.status(200).json({ key: null, fallback: true });
    }

    const tokenData = await tokenRes.json() as { key?: string };
    return res.status(200).json({ key: tokenData.key ?? null });
  } catch (error: unknown) {
    console.error('[deepgram-token] Error:', error);
    return res.status(200).json({ key: null, fallback: true });
  }
}
