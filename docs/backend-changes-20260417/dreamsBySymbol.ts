import type { FastifyInstance } from 'fastify';
import { rateLimit } from '../lib/rateLimit.js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface BySymbolParams { symbolId: string }
interface BySymbolQuery {
  limit?: string;
  offset?: string;
  gender?: string;
  age_min?: string;
  age_max?: string;
  country?: string;
}

interface DreamResult {
  dream_id: string;
  participant_id: string;
  study_code: string;
  dream_snippet: string;
  original_language: string;
}

// ─── Erweiterte DE→EN Uebersetzungen (fuer Fulltext-Fallback) ──────────────
const SYMBOL_TRANSLATIONS: Record<string, string> = {
  wasser:'water', feuer:'fire', haus:'house', schlange:'snake', meer:'ocean',
  berg:'mountain', mond:'moon', sonne:'sun', hund:'dog', katze:'cat',
  tod:'death', kind:'child', baum:'tree', nacht:'night', schule:'school',
  licht:'light', strasse:'road', 'straße':'road', regen:'rain', treppe:'stairs',
  schiff:'ship', boot:'boat', flugzeug:'airplane', zug:'train', stadt:'city',
  vogel:'bird', fisch:'fish', schnee:'snow', blume:'flower', pferd:'horse',
  auto:'car', wald:'forest', see:'lake', fluss:'river', ozean:'ocean',
  fliegen:'flying', fallen:'falling', laufen:'running', schwimmen:'swimming',
  maedchen:'girl', 'mädchen':'girl', junge:'boy', frau:'woman', mann:'man',
  dunkelheit:'darkness', 'brücke':'bridge', bruecke:'bridge', blut:'blood',
  wind:'wind', aura:'aura', engel:'angel', teufel:'devil', mutter:'mother',
  vater:'father', bruder:'brother', schwester:'sister', freund:'friend',
  liebe:'love', angst:'fear', traum:'dream', herz:'heart', auge:'eye',
  hand:'hand', fuss:'foot', 'fuß':'foot', kopf:'head', tuer:'door', 'tür':'door',
  fenster:'window', bett:'bed', essen:'food', wein:'wine', geld:'money',
  buch:'book', spiegel:'mirror', musik:'music', tanzen:'dancing', singen:'singing',
  weinen:'crying', lachen:'laughing', fluchten:'escape', 'flüchten':'escape',
  verlieren:'losing', finden:'finding', sterben:'dying', leben:'life',
  kampf:'fight', krieg:'war', frieden:'peace', gott:'god', kirche:'church',
  krankenhaus:'hospital', arzt:'doctor',
  su:'water', ates:'fire', ev:'house', kedi:'cat', kopek:'dog', gece:'night',
  okul:'school', deniz:'ocean',
};

function translateSymbolName(name: string): string {
  const lower = name.toLowerCase().trim();
  if (SYMBOL_TRANSLATIONS[lower]) return SYMBOL_TRANSLATIONS[lower];
  for (const [de, en] of Object.entries(SYMBOL_TRANSLATIONS)) {
    if (de.length >= 4 && lower.startsWith(de) && lower.length <= de.length + 3) {
      return en;
    }
  }
  return lower;
}

async function supaFetch(path: string, extraHeaders?: Record<string, string>): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      ...(extraHeaders || {}),
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Supabase ${path}: ${res.status}`);
  return res.json();
}

async function supaFetchWithCount(path: string): Promise<{ rows: any[]; total: number }> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'count=exact',
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Supabase ${path}: ${res.status}`);
  const rows = await res.json();
  const contentRange = res.headers.get('content-range') || '';
  const m = contentRange.match(/\/(\d+|\*)$/);
  const total = m && m[1] !== '*' ? Number(m[1]) : (Array.isArray(rows) ? rows.length : 0);
  return { rows, total };
}

async function supaRpc(fn: string, body: any): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function applyDemoFilter(
  dreams: Array<{ participant_id?: string }>,
  gender?: string, age_min?: string, age_max?: string, country?: string,
): Promise<Set<string> | null> {
  const pIds = [...new Set(dreams.map(r => r.participant_id).filter(Boolean))] as string[];
  if (pIds.length === 0) return null;
  let pPath = 'research_participants?select=participant_id';
  if (gender && gender !== 'all') pPath += `&gender=eq.${gender}`;
  if (age_min && Number(age_min) > 0) pPath += `&age=gte.${age_min}`;
  if (age_max && Number(age_max) < 99) pPath += `&age=lte.${age_max}`;
  if (country) pPath += `&country=ilike.*${encodeURIComponent(country)}*`;
  const idList = pIds.slice(0, 500).map(id => `"${id}"`).join(',');
  pPath += `&participant_id=in.(${idList})&limit=2000`;
  try {
    const ps = await supaFetch(pPath) as Array<{ participant_id: string }>;
    return new Set(ps.map(p => p.participant_id));
  } catch {
    return null;
  }
}

export async function dreamsBySymbolRoute(app: FastifyInstance) {
  // ─── GET /api/dreams/by-symbol/:symbolId ───────────────────────────────
  // Hybrid: primaer dream_symbol_links, Fallback Fulltext-RPC mit Symbol-Name.
  // BUG 4: offset + X-Total-Count fuer "Weitere laden"-Button.
  app.get<{ Params: BySymbolParams; Querystring: BySymbolQuery }>(
    '/api/dreams/by-symbol/:symbolId',
    async (req, reply) => {
      if (!rateLimit(req, reply)) return;

      const { symbolId } = req.params;
      if (!symbolId || !/^[0-9a-f-]{20,}$/i.test(symbolId)) {
        return reply.status(400).send({ error: 'Invalid symbolId' });
      }

      const limit = Math.min(Number(req.query.limit) || 50, 200);
      const offset = Math.max(0, Number(req.query.offset) || 0);
      const { gender, age_min, age_max, country } = req.query;
      const hasDemo = (gender && gender !== 'all') ||
        (age_min && Number(age_min) > 0) ||
        (age_max && Number(age_max) < 99) ||
        (country && country.length > 0);

      try {
        // ─── Pfad A: dream_symbol_links mit count=exact ────────────
        const linksPath = `dream_symbol_links?symbol_id=eq.${symbolId}` +
          `&select=dream_id&limit=5000`;
        const { rows: linkRows, total: linkTotal } = await supaFetchWithCount(linksPath);
        const dreamIds = [...new Set((linkRows as Array<{ dream_id: string }>)
          .map(l => l.dream_id).filter(Boolean))];

        let results: DreamResult[] = [];
        let total = linkTotal;

        if (dreamIds.length > 0) {
          // Wenn kein Demo-Filter: Fenster direkt auf dream_ids anwenden
          if (!hasDemo) {
            const windowIds = dreamIds.slice(offset, offset + limit);
            if (windowIds.length > 0) {
              const dreamList = windowIds.map(id => `"${id}"`).join(',');
              const rows = await supaFetch(
                `research_dreams?id=in.(${dreamList})` +
                `&select=id,participant_id,study_code,dream_text,original_language`,
              ) as Array<any>;
              results = rows.map(d => ({
                dream_id: d.id,
                participant_id: d.participant_id || '',
                study_code: d.study_code || '',
                dream_snippet: d.dream_text ? String(d.dream_text).slice(0, 240) : '',
                original_language: d.original_language || '',
              }));
            }
            total = dreamIds.length;
          } else {
            // Mit Demo-Filter: alle dreams holen, filtern, dann fenstern
            const allDreamList = dreamIds.map(id => `"${id}"`).join(',');
            const rows = await supaFetch(
              `research_dreams?id=in.(${allDreamList})` +
              `&select=id,participant_id,study_code,dream_text,original_language&limit=5000`,
            ) as Array<any>;
            let all = rows.map(d => ({
              dream_id: d.id,
              participant_id: d.participant_id || '',
              study_code: d.study_code || '',
              dream_snippet: d.dream_text ? String(d.dream_text).slice(0, 240) : '',
              original_language: d.original_language || '',
            }));
            const allowed = await applyDemoFilter(all, gender, age_min, age_max, country);
            if (allowed) all = all.filter(r => allowed.has(r.participant_id));
            total = all.length;
            results = all.slice(offset, offset + limit);
          }
        }

        // ─── Pfad B: Fulltext-Fallback wenn Links leer ─────────────
        if (total === 0) {
          const symRows = await supaFetch(
            `dream_symbols?id=eq.${symbolId}&select=name&limit=1`,
          ) as Array<{ name: string }>;
          const symName = symRows[0]?.name;
          if (symName) {
            const en = translateSymbolName(symName);
            const fulltext = await supaRpc('search_dreams_fulltext',
              { p_keywords: [en], p_limit: 1000 }) as DreamResult[];
            let all = fulltext;
            if (hasDemo) {
              const allowed = await applyDemoFilter(all, gender, age_min, age_max, country);
              if (allowed) all = all.filter(r => allowed.has(r.participant_id));
            }
            total = all.length;
            results = all.slice(offset, offset + limit);
          }
        }

        reply.header('X-Total-Count', String(total));
        reply.header('Access-Control-Expose-Headers', 'X-Total-Count');
        return reply.send(results);
      } catch (err) {
        req.log.error(err, 'dreams/by-symbol Fehler');
        return reply.status(500).send({ error: 'Internal error' });
      }
    },
  );
}
