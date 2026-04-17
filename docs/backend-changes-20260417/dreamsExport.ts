import type { FastifyInstance, FastifyReply } from 'fastify';
import { rateLimit } from '../lib/rateLimit.js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface ExportQuery {
  format?: string;          // csv | json (default csv)
  symbol_id?: string;       // entweder symbol_id ...
  user_id?: string;         // ... oder user_id (genau eines)
  gender?: string;
  age_min?: string;
  age_max?: string;
  country?: string;
}

interface ExportRow {
  id: string;
  user_id: string;
  study: string;
  date: string;
  language: string;
  gender: string;
  age: string;
  country: string;
  dream_text: string;
  symbols: string;
}

const COLUMNS: Array<keyof ExportRow> = [
  'id', 'user_id', 'study', 'date', 'language', 'gender', 'age', 'country', 'dream_text', 'symbols',
];

function csvEscape(v: unknown): string {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

async function supaFetch(path: string): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Supabase ${path}: ${res.status}`);
  return res.json();
}

// Zerlege grosse IN-Listen in Chunks (Supabase URL-Limits)
async function fetchInChunks<T = any>(
  table: string,
  ids: string[],
  selectCols: string,
  idCol = 'id',
  chunkSize = 200,
): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const inList = chunk.map(id => `"${id}"`).join(',');
    const path = `${table}?${idCol}=in.(${inList})&select=${selectCols}&limit=${chunk.length}`;
    const rows = await supaFetch(path) as T[];
    if (Array.isArray(rows)) out.push(...rows);
  }
  return out;
}

async function buildSymbolMap(dreamIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (dreamIds.length === 0) return map;
  // Links → symbol_id pro dream_id
  const links: Array<{ dream_id: string; symbol_id: string }> = await fetchInChunks(
    'dream_symbol_links', dreamIds, 'dream_id,symbol_id', 'dream_id', 300,
  );
  const linksByDream = new Map<string, Set<string>>();
  const allSymIds = new Set<string>();
  for (const l of links) {
    if (!l.dream_id || !l.symbol_id) continue;
    allSymIds.add(l.symbol_id);
    if (!linksByDream.has(l.dream_id)) linksByDream.set(l.dream_id, new Set());
    linksByDream.get(l.dream_id)!.add(l.symbol_id);
  }
  // Symbol-Namen
  const symRows: Array<{ id: string; name: string }> = await fetchInChunks(
    'dream_symbols', [...allSymIds], 'id,name', 'id', 300,
  );
  const symName = new Map<string, string>(symRows.map(s => [s.id, s.name]));
  for (const [did, set] of linksByDream) {
    map.set(did, [...set].map(id => symName.get(id) || id).sort());
  }
  return map;
}

async function streamCsv(reply: FastifyReply, rows: AsyncIterable<ExportRow>, filename: string): Promise<void> {
  reply.hijack();
  const raw = reply.raw;
  raw.setHeader('Content-Type', 'text/csv; charset=utf-8');
  raw.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  raw.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  // BOM fuer Excel UTF-8 Erkennung
  raw.write('\uFEFF' + COLUMNS.join(',') + '\n');
  try {
    for await (const r of rows) {
      const line = COLUMNS.map(c => csvEscape(r[c])).join(',') + '\n';
      if (!raw.write(line)) {
        await new Promise<void>(res => raw.once('drain', () => res()));
      }
    }
  } catch (err) {
    reply.log.error(err, 'CSV-Stream Fehler');
  } finally {
    try { raw.end(); } catch { /* */ }
  }
}

async function streamJson(reply: FastifyReply, rows: AsyncIterable<ExportRow>, filename: string): Promise<void> {
  reply.hijack();
  const raw = reply.raw;
  raw.setHeader('Content-Type', 'application/json; charset=utf-8');
  raw.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  raw.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  raw.write('[');
  try {
    let first = true;
    for await (const r of rows) {
      const chunk = (first ? '' : ',') + JSON.stringify(r);
      first = false;
      if (!raw.write(chunk)) {
        await new Promise<void>(res => raw.once('drain', () => res()));
      }
    }
    raw.write(']');
  } catch (err) {
    reply.log.error(err, 'JSON-Stream Fehler');
  } finally {
    try { raw.end(); } catch { /* */ }
  }
}

async function* iterRows(
  dreams: Array<any>,
  participants: Map<string, any>,
  symbolMap: Map<string, string[]>,
): AsyncGenerator<ExportRow> {
  for (const d of dreams) {
    const p = participants.get(d.participant_id) || {};
    yield {
      id: d.id || '',
      user_id: d.participant_id || '',
      study: d.study_code || '',
      date: d.dream_date || '',
      language: d.original_language || '',
      gender: p.gender || '',
      age: p.age != null ? String(p.age) : '',
      country: p.country || '',
      dream_text: d.dream_text || '',
      symbols: (symbolMap.get(d.id) || []).join('|'),
    };
  }
}

export async function dreamsExportRoute(app: FastifyInstance) {
  // ─── GET /api/dreams/export?symbol_id=...|user_id=...&format=csv|json ───
  // Streaming-Export der gefilterten Traeume fuer Forscher.
  app.get<{ Querystring: ExportQuery }>('/api/dreams/export', async (req, reply) => {
    if (!rateLimit(req, reply)) return;

    const format = (req.query.format || 'csv').toLowerCase() === 'json' ? 'json' : 'csv';
    const symbolId = (req.query.symbol_id || '').trim();
    const userId = (req.query.user_id || '').trim();

    if (!symbolId && !userId) {
      return reply.status(400).send({ error: 'symbol_id or user_id required' });
    }
    if (symbolId && !/^[0-9a-f-]{20,}$/i.test(symbolId)) {
      return reply.status(400).send({ error: 'Invalid symbol_id' });
    }

    const { gender, age_min, age_max, country } = req.query;
    const hasDemo = (gender && gender !== 'all') ||
      (age_min && Number(age_min) > 0) ||
      (age_max && Number(age_max) < 99) ||
      (country && country.length > 0);

    try {
      // 1) dream_ids ermitteln
      let dreamIds: string[] = [];
      if (symbolId) {
        const links = await supaFetch(
          `dream_symbol_links?symbol_id=eq.${symbolId}&select=dream_id&limit=10000`,
        ) as Array<{ dream_id: string }>;
        dreamIds = [...new Set(links.map(l => l.dream_id).filter(Boolean))];
      } else if (userId) {
        const pid = encodeURIComponent(userId);
        const rows = await supaFetch(
          `research_dreams?participant_id=eq.${pid}&select=id&limit=10000`,
        ) as Array<{ id: string }>;
        dreamIds = rows.map(r => r.id).filter(Boolean);
      }
      if (dreamIds.length === 0) {
        // Leeres Resultat sauber zurueckgeben
        const filename = `dreamcode-export-${symbolId || userId}-${Date.now()}.${format}`;
        if (format === 'csv') {
          reply.header('Content-Type', 'text/csv; charset=utf-8');
          reply.header('Content-Disposition', `attachment; filename="${filename}"`);
          return reply.send('\uFEFF' + COLUMNS.join(',') + '\n');
        }
        reply.header('Content-Type', 'application/json; charset=utf-8');
        reply.header('Content-Disposition', `attachment; filename="${filename}"`);
        return reply.send('[]');
      }

      // 2) Dreams in Chunks laden
      const dreams: Array<any> = await fetchInChunks(
        'research_dreams', dreamIds,
        'id,participant_id,study_code,dream_date,dream_text,original_language',
        'id', 200,
      );

      // 3) Participants laden + Demo-Filter anwenden
      const partIds = [...new Set(dreams.map(d => d.participant_id).filter(Boolean))] as string[];
      const partRows: Array<any> = partIds.length === 0 ? []
        : await fetchInChunks(
          'research_participants', partIds,
          'participant_id,gender,age,country',
          'participant_id', 300,
        );
      const partMap = new Map<string, any>(partRows.map(p => [p.participant_id, p]));

      let filteredDreams = dreams;
      if (hasDemo) {
        const allowed = new Set<string>();
        for (const p of partRows) {
          if (gender && gender !== 'all' && p.gender !== gender) continue;
          if (age_min && Number(age_min) > 0 && (p.age == null || p.age < Number(age_min))) continue;
          if (age_max && Number(age_max) < 99 && (p.age == null || p.age > Number(age_max))) continue;
          if (country && p.country && !String(p.country).toLowerCase().includes(country.toLowerCase())) continue;
          if (country && !p.country) continue;
          allowed.add(p.participant_id);
        }
        filteredDreams = dreams.filter(d => allowed.has(d.participant_id));
      }

      // 4) Symbole pro Dream
      const symbolMap = await buildSymbolMap(filteredDreams.map(d => d.id));

      // 5) Filename
      const today = new Date().toISOString().slice(0, 10);
      const slug = symbolId ? `symbol-${symbolId.slice(0, 8)}` : `user-${userId.slice(0, 12)}`;
      const filename = `dreamcode-export-${slug}-${today}.${format}`;

      // 6) Streaming-Antwort (Headers vor Stream)
      const iter = iterRows(filteredDreams, partMap, symbolMap);
      if (format === 'csv') {
        await streamCsv(reply, iter, filename);
      } else {
        await streamJson(reply, iter, filename);
      }
      return reply;
    } catch (err) {
      req.log.error(err, 'dreams/export Fehler');
      return reply.status(500).send({ error: 'Export failed' });
    }
  });
}
