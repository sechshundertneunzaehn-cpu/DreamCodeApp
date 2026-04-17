import type { FastifyInstance } from 'fastify';
import { rateLimit } from '../lib/rateLimit.js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface ByUserQuery {
  user_id?: string;
  limit?: string;
  offset?: string;
}

export async function dreamsByUserRoute(app: FastifyInstance) {
  // ─── GET /api/dreams/by-user?user_id=<participant_id>&limit=<n>&offset=<k> ───
  // Liefert Traeume eines einzelnen Participants. Frontend verwendet das
  // fuer den User-Node-Klick im KnowledgeGraph (DreamListPanel "User-View").
  // BUG 4: offset fuer Paginierung + X-Total-Count fuer "Weitere laden"-Button.
  app.get<{ Querystring: ByUserQuery }>('/api/dreams/by-user', async (req, reply) => {
    if (!rateLimit(req, reply)) return;

    const userId = (req.query.user_id || '').trim();
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Math.max(0, Number(req.query.offset) || 0);

    if (!userId) {
      return reply.status(400).send({ error: 'user_id required' });
    }

    try {
      const pid = encodeURIComponent(userId);

      // Total-Count ueber Prefer: count=exact
      const countPath = `research_dreams?participant_id=eq.${pid}&select=id`;
      const countRes = await fetch(`${SUPABASE_URL}/rest/v1/${countPath}`, {
        method: 'HEAD',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Prefer': 'count=exact',
          'Range-Unit': 'items',
          'Range': '0-0',
        },
        signal: AbortSignal.timeout(10000),
      });
      let total = 0;
      const contentRange = countRes.headers.get('content-range') || '';
      const m = contentRange.match(/\/(\d+|\*)$/);
      if (m && m[1] !== '*') total = Number(m[1]);

      const path = `research_dreams?participant_id=eq.${pid}`
        + `&select=dream_id,participant_id,study_code,dream_text,original_language`
        + `&order=dream_date.desc.nullslast`
        + `&offset=${offset}`
        + `&limit=${limit}`;

      const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        return reply.status(502).send({ error: 'Upstream error' });
      }
      const rows = await res.json() as any[];

      const results = rows.map(d => ({
        dream_id: d.dream_id,
        participant_id: d.participant_id || '',
        study_code: d.study_code || '',
        dream_snippet: d.dream_text ? String(d.dream_text).slice(0, 240) : '',
        original_language: d.original_language || '',
      }));

      reply.header('X-Total-Count', String(total));
      reply.header('Access-Control-Expose-Headers', 'X-Total-Count');
      return reply.send(results);
    } catch (err) {
      req.log.error(err, 'dreams/by-user Fehler');
      return reply.status(500).send({ error: 'Internal error' });
    }
  });
}
