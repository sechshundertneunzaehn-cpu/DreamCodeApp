// Keyword-Backfill: insert dream_symbol_links for every research_dream whose text
// contains a symbol's keyword (name/translation/alias). Complements the Gemini-based
// extractor by adding deterministic matches for concrete words (Wasser, Katze, Auto, ...).
//
// Run: tsx scripts/keyword-backfill.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const ENV = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8')
  .split('\n').reduce<Record<string, string>>((acc, l) => {
    const m = l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) acc[m[1]] = m[2].replace(/^["']|["']$/g, '');
    return acc;
  }, {});

const URL = process.env.SUPABASE_URL || ENV.VITE_SUPABASE_URL || ENV.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error('missing SUPABASE env'); process.exit(1); }
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

const MIN_KW_LEN = 4;   // avoid super-short keywords ("see","ei") causing false matches
const CONFIDENCE = 0.7;

// Stop-words — very common tokens that cause false-positive matches
const STOPWORDS = new Set([
  'dream','traum','like','feel','felt','went','went','come','look','saw','see',
  'know','tell','thing','time','place','room','make','made','take','took',
  'home','house','work','door','day','year','hour','minute','head','hand',
]);

interface SymRow { id: string; name: string }
interface TransRow { symbol_id: string; language_code: string; translated_name: string; aliases: string[] | null }

async function fetchAll<T>(tbl: string, select: string, pageSize = 1000): Promise<T[]> {
  const out: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await sb.from(tbl).select(select).range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || !data.length) break;
    out.push(...(data as unknown as T[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

function buildKeywordIndex(syms: SymRow[], trans: TransRow[]): Map<string, Set<string>> {
  // keyword (lowercase) → Set of symbol_id
  const idx = new Map<string, Set<string>>();
  const add = (kw: string, sid: string) => {
    const k = kw.toLowerCase().trim();
    if (!k || k.length < MIN_KW_LEN) return;
    if (STOPWORDS.has(k)) return;
    if (!idx.has(k)) idx.set(k, new Set());
    idx.get(k)!.add(sid);
  };
  for (const s of syms) add(s.name, s.id);
  for (const t of trans) {
    if (t.language_code !== 'de' && t.language_code !== 'en') continue;
    if (t.translated_name) add(t.translated_name, t.symbol_id);
    for (const a of t.aliases ?? []) if (typeof a === 'string') add(a, t.symbol_id);
  }
  return idx;
}

function escapeRe(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function tokenScan(text: string, keywords: string[], re: RegExp): Set<string> {
  const low = text.toLowerCase();
  const hit = new Set<string>();
  for (const m of low.matchAll(re)) {
    const k = m[0];
    hit.add(k);
  }
  return hit;
}

async function main() {
  console.log('loading catalog…');
  const syms = await fetchAll<SymRow>('dream_symbols', 'id, name');
  const trans = await fetchAll<TransRow>('symbol_translations', 'symbol_id, language_code, translated_name, aliases');
  const kwIdx = buildKeywordIndex(syms, trans);
  const allKw = Array.from(kwIdx.keys()).sort((a, b) => b.length - a.length);
  const kwRe = new RegExp('\\b(' + allKw.map(escapeRe).join('|') + ')\\b', 'gi');
  console.log(`keywords: ${allKw.length}, symbols: ${syms.length}`);

  console.log('loading dreams…');
  const dreams = await fetchAll<{ id: string; dream_text: string | null }>('research_dreams', 'id, dream_text');
  console.log(`dreams: ${dreams.length}`);

  const rows: Array<{ dream_id: string; symbol_id: string; confidence: number }> = [];
  let kwHitCount = 0;
  for (const d of dreams) {
    if (!d.dream_text || d.dream_text.length < 20) continue;
    const hits = tokenScan(d.dream_text, allKw, kwRe);
    if (!hits.size) continue;
    kwHitCount++;
    const sids = new Set<string>();
    for (const kw of hits) for (const sid of kwIdx.get(kw)!) sids.add(sid);
    for (const sid of sids) rows.push({ dream_id: d.id, symbol_id: sid, confidence: CONFIDENCE });
  }
  console.log(`dreams with keyword-hit: ${kwHitCount}`);
  console.log(`candidate rows: ${rows.length}`);

  // upsert in chunks
  const CHUNK = 1000;
  let ok = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error } = await sb.from('dream_symbol_links')
      .upsert(slice, { onConflict: 'dream_id,symbol_id', ignoreDuplicates: true });
    if (error) { console.error(`upsert ${i}: ${error.message}`); continue; }
    ok += slice.length;
    if (i % 10000 === 0) console.log(`  upserted ${ok}/${rows.length}…`);
  }
  console.log(`inserted/updated: ${ok}/${rows.length}`);
}

main().catch(e => { console.error(e); process.exit(2); });
