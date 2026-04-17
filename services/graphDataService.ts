/**
 * Graph Data Service — loads knowledge graph data from Supabase
 * and transforms it into D3-compatible nodes + links.
 */
import { supabase } from './supabaseClient';

// ── Types ──────────────────────────────────────────────────
export type NodeType = 'symbol' | 'culture' | 'user' | 'emotion' | 'element';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  size: number;
  color: string;
  metadata?: {
    kategorie?: string;
    emoji?: string;
    frequency?: number;
    userId?: string;
    cultureKey?: string;
    intensity?: number;
    interpretationSummary?: string;
  };
  // D3 simulation fields (mutated by d3-force)
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  strength: number;
  type: 'interpretation' | 'dreamed_by' | 'contains' | 'related' | 'emotional';
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// ── Color Palette ──────────────────────────────────────────
const NODE_COLORS: Record<NodeType, string> = {
  symbol:  '#a78bfa',
  culture: '#f59e0b',
  user:    '#34d399',
  emotion: '#f472b6',
  element: '#60a5fa',
};

export function getNodeColor(type: NodeType): string {
  return NODE_COLORS[type] || '#818cf8';
}

// ── Cache ──────────────────────────────────────────────────
let cachedData: GraphData | null = null;
let cacheTimestamp = 0;
let cachedYears: number | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── Main fetch ─────────────────────────────────────────────
export async function fetchGraphData(limit = 200, years: number | null = null): Promise<GraphData> {
  const now = Date.now();
  if (cachedData && now - cacheTimestamp < CACHE_TTL && cachedYears === years) {
    return cachedData;
  }

  // Try the filtered RPC function first (dynamic aggregation from filtered dream set)
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_graph_data_filtered', {
    p_limit: limit,
    p_years: years,
  });

  if (!rpcError && rpcData && !Array.isArray(rpcData) && rpcData.symbols?.length > 0) {
    const graphData = transformRpcData(rpcData);
    if (graphData.nodes.length > 0) {
      cachedData = graphData;
      cacheTimestamp = now;
      cachedYears = years;
      return graphData;
    }
  }

  // Fallback: individual queries (unfiltered)
  const fallback = await fetchGraphDataFallback(limit);
  cachedData = fallback;
  cacheTimestamp = now;
  cachedYears = years;
  return fallback;
}

function transformRpcData(raw: any): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeIds = new Set<string>();

  // Symbol nodes
  const symbols = raw.symbols || [];
  for (const s of symbols) {
    const id = `sym_${s.id}`;
    if (nodeIds.has(id)) continue;
    nodeIds.add(id);
    nodes.push({
      id,
      label: s.name,
      type: 'symbol',
      size: Math.min(8 + Math.sqrt(s.frequency || 1) * 2, 24),
      color: NODE_COLORS.symbol,
      metadata: {
        kategorie: s.kategorie,
        emoji: s.emoji,
        frequency: s.frequency,
      },
    });
  }

  // Culture nodes from interpretations
  const cultures = raw.cultures || [];
  const cultureMap = new Map<string, string>();
  for (const c of cultures) {
    const cultureId = `cul_${c.culture_key}`;
    if (!nodeIds.has(cultureId)) {
      nodeIds.add(cultureId);
      cultureMap.set(c.culture_key, cultureId);
      nodes.push({
        id: cultureId,
        label: c.culture_label,
        type: 'culture',
        size: 14,
        color: NODE_COLORS.culture,
        metadata: { cultureKey: c.culture_key },
      });
    }
    // Link: symbol → culture
    const symId = `sym_${c.symbol_id}`;
    if (nodeIds.has(symId)) {
      links.push({
        source: symId,
        target: cultureId,
        strength: 1,
        type: 'interpretation',
      });
    }
  }

  // User/Participant nodes from dreamers
  const dreamers = raw.dreamers || [];
  for (const d of dreamers) {
    // Support both user_id (real users) and participant_id (research)
    const pid = d.user_id || d.participant_id || d.dream_id;
    if (!pid) continue;
    const userId = `usr_${pid}`;
    if (!nodeIds.has(userId)) {
      nodeIds.add(userId);
      const label = d.display_name || d.participant_id || 'Teilnehmer';
      const studyCode = d.study_code || '';
      nodes.push({
        id: userId,
        label: studyCode ? `${label} (${studyCode})` : label,
        type: 'user',
        size: 7,
        color: NODE_COLORS.user,
        metadata: { userId: pid },
      });
    }
    // Link: user → symbol
    const symId = `sym_${d.symbol_id}`;
    if (nodeIds.has(symId)) {
      links.push({
        source: userId,
        target: symId,
        strength: 2,
        type: 'dreamed_by',
      });
    }
  }

  // Emotion nodes
  const emotions = raw.emotions || [];
  const emotionSet = new Set<string>();
  for (const e of emotions) {
    const emotionId = `emo_${e.emotion}`;
    if (!emotionSet.has(e.emotion)) {
      emotionSet.add(e.emotion);
      if (!nodeIds.has(emotionId)) {
        nodeIds.add(emotionId);
        nodes.push({
          id: emotionId,
          label: e.emotion,
          type: 'emotion',
          size: 10,
          color: NODE_COLORS.emotion,
        });
      }
    }
    // Link: symbol → emotion
    const symId = `sym_${e.symbol_id}`;
    if (nodeIds.has(symId) && nodeIds.has(emotionId)) {
      links.push({
        source: symId,
        target: emotionId,
        strength: 1,
        type: 'emotional',
      });
    }
  }

  // Element nodes (derive from symbols)
  const elementSet = new Set<string>();
  for (const s of symbols) {
    if (!s.element) continue;
    const elemId = `elem_${s.element}`;
    if (!elementSet.has(s.element)) {
      elementSet.add(s.element);
      if (!nodeIds.has(elemId)) {
        nodeIds.add(elemId);
        nodes.push({
          id: elemId,
          label: s.element.charAt(0).toUpperCase() + s.element.slice(1),
          type: 'element',
          size: 16,
          color: NODE_COLORS.element,
        });
      }
    }
    // Link: symbol → element
    links.push({
      source: `sym_${s.id}`,
      target: elemId,
      strength: 1,
      type: 'related',
    });
  }

  return { nodes, links };
}

// ── Fallback: individual queries ───────────────────────────
async function fetchGraphDataFallback(limit: number): Promise<GraphData> {
  const { data: symbols } = await supabase
    .from('dream_symbols')
    .select('id, name, name_normalized, kategorie, element, emoji, frequency')
    .order('frequency', { ascending: false })
    .limit(limit);

  if (!symbols || symbols.length === 0) {
    // Return demo data if no symbols yet
    return generateDemoGraph();
  }

  const symbolIds = symbols.map(s => s.id);

  const [culturesRes, dreamersRes, emotionsRes] = await Promise.all([
    supabase.from('symbol_interpretations')
      .select('symbol_id, culture_key, culture_label, interpretation_summary')
      .in('symbol_id', symbolIds),
    supabase.from('dream_symbol_links')
      .select('symbol_id, user_id')
      .in('symbol_id', symbolIds),
    supabase.from('dream_emotions')
      .select('emotion, dream_id')
      .limit(200),
  ]);

  const raw = {
    symbols,
    cultures: culturesRes.data || [],
    dreamers: dreamersRes.data || [],
    emotions: emotionsRes.data || [],
  };

  const graphData = transformRpcData(raw);
  cachedData = graphData;
  cacheTimestamp = Date.now();
  return graphData;
}

// ── Demo Graph (when DB is empty) ──────────────────────────
function generateDemoGraph(): GraphData {
  const demoSymbols = [
    { name: 'Wasser', kategorie: 'Natur', element: 'wasser', emoji: '🌊', freq: 42 },
    { name: 'Fliegen', kategorie: 'Aktivitaeten', element: 'luft', emoji: '🦅', freq: 38 },
    { name: 'Haus', kategorie: 'Orte', element: 'erde', emoji: '🏠', freq: 35 },
    { name: 'Schlange', kategorie: 'Tiere', element: 'erde', emoji: '🐍', freq: 30 },
    { name: 'Feuer', kategorie: 'Natur', element: 'feuer', emoji: '🔥', freq: 28 },
    { name: 'Fallen', kategorie: 'Aktivitaeten', element: 'luft', emoji: '⬇️', freq: 25 },
    { name: 'Meer', kategorie: 'Natur', element: 'wasser', emoji: '🌅', freq: 22 },
    { name: 'Laufen', kategorie: 'Aktivitaeten', element: null, emoji: '🏃', freq: 20 },
    { name: 'Zahn', kategorie: 'Koerper', element: null, emoji: '🦷', freq: 18 },
    { name: 'Berg', kategorie: 'Natur', element: 'erde', emoji: '⛰️', freq: 16 },
    { name: 'Mond', kategorie: 'Natur', element: 'wasser', emoji: '🌙', freq: 15 },
    { name: 'Sonne', kategorie: 'Natur', element: 'feuer', emoji: '☀️', freq: 14 },
    { name: 'Hund', kategorie: 'Tiere', element: 'erde', emoji: '🐕', freq: 13 },
    { name: 'Katze', kategorie: 'Tiere', element: null, emoji: '🐈', freq: 12 },
    { name: 'Tod', kategorie: 'Spirituelles', element: null, emoji: '💀', freq: 11 },
    { name: 'Baby', kategorie: 'Personen', element: null, emoji: '👶', freq: 10 },
    { name: 'Tuer', kategorie: 'Objekte', element: null, emoji: '🚪', freq: 9 },
    { name: 'Spiegel', kategorie: 'Objekte', element: 'wasser', emoji: '🪞', freq: 8 },
    { name: 'Blut', kategorie: 'Koerper', element: 'feuer', emoji: '🩸', freq: 7 },
    { name: 'Baum', kategorie: 'Natur', element: 'erde', emoji: '🌳', freq: 15 },
  ];

  const demoCultures = [
    { key: 'islamic', label: 'Islamisch (Ibn Sirin)' },
    { key: 'freudian', label: 'Freud' },
    { key: 'jungian', label: 'Jung' },
    { key: 'buddhist', label: 'Buddhistisch' },
    { key: 'christian', label: 'Christlich' },
  ];

  const demoEmotions = ['Angst', 'Freude', 'Sehnsucht', 'Trauer', 'Wut', 'Staunen'];

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeIds = new Set<string>();

  // Symbol nodes
  demoSymbols.forEach((s, i) => {
    const id = `sym_demo_${i}`;
    nodeIds.add(id);
    nodes.push({
      id,
      label: s.name,
      type: 'symbol',
      size: Math.min(8 + Math.sqrt(s.freq) * 2, 24),
      color: NODE_COLORS.symbol,
      metadata: { kategorie: s.kategorie, emoji: s.emoji, frequency: s.freq },
    });
  });

  // Culture nodes
  demoCultures.forEach(c => {
    const id = `cul_${c.key}`;
    nodeIds.add(id);
    nodes.push({
      id, label: c.label, type: 'culture', size: 14,
      color: NODE_COLORS.culture,
      metadata: { cultureKey: c.key },
    });
    // Link top symbols to cultures
    demoSymbols.slice(0, 8).forEach((_, i) => {
      if (Math.random() > 0.4) {
        links.push({ source: `sym_demo_${i}`, target: id, strength: 1, type: 'interpretation' });
      }
    });
  });

  // Emotion nodes
  demoEmotions.forEach(e => {
    const id = `emo_${e.toLowerCase()}`;
    nodeIds.add(id);
    nodes.push({
      id, label: e, type: 'emotion', size: 10, color: NODE_COLORS.emotion,
    });
    // Link random symbols to emotions
    demoSymbols.forEach((_, i) => {
      if (Math.random() > 0.7) {
        links.push({ source: `sym_demo_${i}`, target: id, strength: 1, type: 'emotional' });
      }
    });
  });

  // Element nodes
  const elements = [
    { key: 'wasser', label: 'Wasser' },
    { key: 'feuer', label: 'Feuer' },
    { key: 'erde', label: 'Erde' },
    { key: 'luft', label: 'Luft' },
  ];
  elements.forEach(el => {
    const id = `elem_${el.key}`;
    nodeIds.add(id);
    nodes.push({
      id, label: el.label, type: 'element', size: 16, color: NODE_COLORS.element,
    });
    demoSymbols.forEach((s, i) => {
      if (s.element === el.key) {
        links.push({ source: `sym_demo_${i}`, target: id, strength: 1, type: 'related' });
      }
    });
  });

  // Related symbol links (symbols sharing category)
  for (let i = 0; i < demoSymbols.length; i++) {
    for (let j = i + 1; j < demoSymbols.length; j++) {
      if (demoSymbols[i].kategorie === demoSymbols[j].kategorie && Math.random() > 0.5) {
        links.push({
          source: `sym_demo_${i}`, target: `sym_demo_${j}`,
          strength: 1, type: 'related',
        });
      }
    }
  }

  return { nodes, links };
}

// ── Client-side search (with neighbor expansion) ────────────
// Supports single words, multi-word queries, and partial matches.
// "Fli" matches "Fliegen", "rotes Auto" matches "Auto".
export function searchGraph(
  query: string,
  nodes: GraphNode[],
  links?: GraphLink[],
): Set<string> {
  const q = query.trim().toLowerCase();
  if (!q) return new Set();

  // Split multi-word query into individual terms
  const terms = q.split(/\s+/).filter(t => t.length >= 2);
  if (terms.length === 0) return new Set();

  // Expand terms with translations (2-hop: kedi → cat → katze)
  const allTerms = new Set(terms);
  for (const term of terms) {
    const hop1 = TRANSLATE_MAP[term];
    if (hop1) {
      for (const t of hop1) {
        allTerms.add(t);
        // 2nd hop: cat → katze, kedi
        const hop2 = TRANSLATE_MAP[t];
        if (hop2) hop2.forEach(t2 => allTerms.add(t2));
      }
    }
  }
  const uniqueTerms = [...allTerms];

  const directMatches = new Set<string>();

  for (const node of nodes) {
    const label = node.label.toLowerCase();
    const kat = node.metadata?.kategorie?.toLowerCase() || '';
    const emoji = node.metadata?.emoji || '';

    // Match if ANY search term (including translations) is found
    const matches = uniqueTerms.some(term =>
      label.includes(term) || kat.includes(term) || emoji.includes(term)
    );

    if (matches) {
      directMatches.add(node.id);
    }
  }

  // Expand to 1-hop neighbors so the full context is visible
  if (directMatches.size === 0 || !links) return directMatches;

  const expanded = new Set(directMatches);
  for (const link of links) {
    const src = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
    const tgt = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
    if (directMatches.has(src)) expanded.add(tgt);
    if (directMatches.has(tgt)) expanded.add(src);
  }
  return expanded;
}

// ── Category mapping: English button IDs → German DB kategorien + keywords ──
const CATEGORY_MAP: Record<string, { kategorien: string[]; keywords: string[] }> = {
  horror:     { kategorien: ['emotionen'],                keywords: ['angst', 'albtraum', 'monster', 'dunkel', 'schatten', 'horror', 'furcht', 'panik'] },
  funny:      { kategorien: ['emotionen'],                keywords: ['freude', 'humor', 'lachen', 'lustig', 'spass'] },
  ufo:        { kategorien: [],                           keywords: ['ufo', 'alien', 'ausserirdisch', 'raumschiff', 'weltraum'] },
  love:       { kategorien: ['emotionen'],                keywords: ['liebe', 'herz', 'kuss', 'umarmung', 'romantik', 'sehnsucht'] },
  erotic:     { kategorien: [],                           keywords: ['erotik', 'sex', 'nackt', 'lust', 'intim'] },
  flying:     { kategorien: ['aktivitaeten'],             keywords: ['fliegen', 'schweben', 'fluegel', 'himmel', 'wolke', 'flug'] },
  falling:    { kategorien: ['aktivitaeten'],             keywords: ['fallen', 'sturz', 'absturz', 'sinken', 'abgrund'] },
  water:      { kategorien: ['natur'],                    keywords: ['wasser', 'meer', 'see', 'fluss', 'regen', 'ozean', 'schwimmen', 'eis', 'schnee'] },
  animals:    { kategorien: ['tiere'],                    keywords: ['tier', 'hund', 'katze', 'schlange', 'vogel', 'pferd', 'fisch', 'baer', 'wolf', 'spinne'] },
  death:      { kategorien: ['spirituelles'],             keywords: ['tod', 'sterben', 'grab', 'leiche', 'ende', 'friedhof'] },
  chase:      { kategorien: ['aktivitaeten'],             keywords: ['verfolg', 'jagen', 'fliehen', 'rennen', 'flucht', 'hetzen'] },
  family:     { kategorien: ['personen'],                 keywords: ['familie', 'mutter', 'vater', 'kind', 'schwester', 'bruder', 'baby', 'eltern'] },
  money:      { kategorien: ['objekte'],                  keywords: ['geld', 'gold', 'reichtum', 'arm', 'bank', 'muenze', 'schatz'] },
  school:     { kategorien: ['orte'],                     keywords: ['schule', 'lehrer', 'pruefung', 'klasse', 'uni', 'student'] },
  spiritual:  { kategorien: ['spirituelles'],             keywords: ['gott', 'engel', 'geist', 'seele', 'gebet', 'licht', 'heilig', 'tempel'] },
  nature:     { kategorien: ['natur'],                    keywords: ['wald', 'berg', 'baum', 'blume', 'sonne', 'mond', 'stern', 'feuer'] },
  timetravel: { kategorien: [],                           keywords: ['zeit', 'vergangenheit', 'zukunft', 'uhr', 'reise'] },
  celebrity:  { kategorien: ['personen'],                 keywords: ['star', 'beruehmte', 'promi', 'koenig', 'idol'] },
};

// ── Client-side category filter ────────────────────────────
export function filterByCategory(
  category: string,
  nodes: GraphNode[],
  links: GraphLink[],
): GraphData {
  if (category === 'all') return { nodes, links };

  const mapping = CATEGORY_MAP[category.toLowerCase()];
  if (!mapping) return { nodes, links };

  const categoryNodeIds = new Set<string>();

  for (const node of nodes) {
    const kat = node.metadata?.kategorie?.toLowerCase() || '';
    const label = node.label.toLowerCase();

    // Match symbols by DB kategorie OR by keyword in label
    if (node.type === 'symbol') {
      if (mapping.kategorien.includes(kat) || mapping.keywords.some(kw => label.includes(kw))) {
        categoryNodeIds.add(node.id);
      }
    }
    // Match emotion nodes by keyword
    if (node.type === 'emotion' && mapping.keywords.some(kw => label.includes(kw))) {
      categoryNodeIds.add(node.id);
    }
  }

  if (categoryNodeIds.size === 0) return { nodes, links };

  // Include connected nodes (1-hop)
  const connectedIds = new Set(categoryNodeIds);
  for (const link of links) {
    const src = typeof link.source === 'string' ? link.source : link.source.id;
    const tgt = typeof link.target === 'string' ? link.target : link.target.id;
    if (categoryNodeIds.has(src)) connectedIds.add(tgt);
    if (categoryNodeIds.has(tgt)) connectedIds.add(src);
  }

  const filteredNodes = nodes.filter(n => connectedIds.has(n.id));
  const filteredLinks = links.filter(l => {
    const src = typeof l.source === 'string' ? l.source : l.source.id;
    const tgt = typeof l.target === 'string' ? l.target : l.target.id;
    return connectedIds.has(src) && connectedIds.has(tgt);
  });

  return { nodes: filteredNodes, links: filteredLinks };
}

// ── Filter links by threshold ──────────────────────────────
export function filterByThreshold(
  threshold: number,
  links: GraphLink[],
): GraphLink[] {
  // Default threshold (50) should show ALL links.
  // Only higher thresholds (70+) start filtering.
  // threshold 0-100: 0-70 = show all, 70-100 maps to strength 1-3
  if (threshold <= 70) return links;
  const minStrength = ((threshold - 70) / 30) * 3;
  return links.filter(l => l.strength >= minStrength);
}

// ── Invalidate cache ───────────────────────────────────────
export function invalidateGraphCache(): void {
  cachedData = null;
  cacheTimestamp = 0;
  cachedYears = null;
}

// ── Keyword translation map (DE/TR/AR/common → EN) ─────────
export const TRANSLATE_MAP: Record<string, string[]> = {};
const _entries: [string, string][] = [
  ['wasser','water'],['fliegen','flying,flight'],['feuer','fire'],['haus','house'],
  ['schlange','snake'],['fallen','fall,falling'],['meer','ocean,sea'],['berg','mountain'],
  ['mond','moon'],['sonne','sun'],['hund','dog'],['katze','cat'],
  ['tod','death,dead,dying'],['kind','child,children'],['baum','tree'],
  ['nacht','night'],['schule','school'],['licht','light'],['strasse','street,road'],
  ['regen','rain'],['treppe','stairs,staircase'],['schiff','ship'],['boot','boat'],
  ['flugzeug','airplane,plane'],['zug','train'],['stadt','city,town'],
  ['vogel','bird'],['fisch','fish'],['schnee','snow'],['blume','flower'],
  ['pferd','horse'],['auto','car'],['schwarz','black'],['weiss','white'],['rot','red'],
  ['angst','fear,afraid,scared'],['freude','joy,happy'],['laufen','run,running'],
  ['schwimmen','swim,swimming'],['wald','forest,woods'],
  // Adjektive & Qualifizierer
  ['blau','blue'],['gruen','green'],['gelb','yellow'],['gross','big,large'],
  ['klein','small,little'],['alt','old'],['neu','new'],['jung','young'],
  ['dunkel','dark'],['hell','bright'],['tief','deep'],['hoch','high,tall'],
  ['schoen','beautiful'],['kalt','cold'],['heiss','hot'],
  ['see','lake'],['fluss','river'],['ozean','ocean'],
  ['maedchen','girl'],['junge','boy'],['frau','woman'],['mann','man'],
  // Turkish
  ['ucmak','flying'],['su','water'],['ates','fire'],['ev','house'],['kedi','cat'],
  ['kopek','dog'],['gece','night'],['okul','school'],['at','horse'],['deniz','sea,ocean'],
];
// Build full translation map: every word maps to ALL equivalents (DE + EN + TR)
// So "kedi" (TR) → ["cat", "katze"], "flight" (EN) → ["flying", "fliegen"], etc.
for (const [deKey, enVal] of _entries) {
  const enWords = enVal.split(',');
  const allWords = [deKey, ...enWords]; // group: [de, en1, en2, ...]
  // Every word in the group maps to ALL other words in the group
  for (const word of allWords) {
    if (!TRANSLATE_MAP[word]) TRANSLATE_MAP[word] = [];
    for (const other of allWords) {
      if (other !== word && !TRANSLATE_MAP[word].includes(other)) {
        TRANSLATE_MAP[word].push(other);
      }
    }
  }
}

/** Translate search terms to English for research_dreams search (2-hop) */
export function translateSearchTerms(terms: string[]): string[] {
  const result = new Set<string>();
  for (const term of terms) {
    const lower = term.toLowerCase().trim();
    if (!lower) continue;
    result.add(lower);
    const hop1 = TRANSLATE_MAP[lower];
    if (hop1) {
      for (const t of hop1) {
        result.add(t);
        const hop2 = TRANSLATE_MAP[t];
        if (hop2) hop2.forEach(t2 => result.add(t2));
      }
    }
  }
  return [...result];
}

// ── Fulltext dream search via Supabase RPC ─────────────────
export interface DreamSearchResult {
  dream_id: string;
  participant_id: string;
  study_code: string;
  dream_snippet: string;
  original_language: string;
}

export async function searchDreamsFulltext(
  query: string,
  limit = 30,
  filters?: DemographicFilter,
): Promise<DreamSearchResult[]> {
  if (!query.trim()) return [];

  try {
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
    const params = new URLSearchParams({
      q: query.trim(),
      limit: String(limit),
    });
    if (filters?.gender && filters.gender !== 'all') params.set('gender', filters.gender);
    if (filters?.ageMin && filters.ageMin > 0) params.set('age_min', String(filters.ageMin));
    if (filters?.ageMax && filters.ageMax < 99) params.set('age_max', String(filters.ageMax));
    if (filters?.country) params.set('country', filters.country);

    const res = await fetch(`${apiBase}/api/dreams/search?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Traeume zu einem Symbol per symbol_id laden (BUG-Y): nutzt dream_symbol_links
// statt Fulltext-Suche — matcht exakt den Counter (dream_symbols.frequency).
// Backend faellt intern auf Fulltext-RPC zurueck wenn dream_symbol_links leer ist.
export async function searchDreamsBySymbolId(
  symbolId: string,
  limit = 50,
  filters?: DemographicFilter,
): Promise<DreamSearchResult[]> {
  if (!symbolId) return [];
  try {
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
    const params = new URLSearchParams({ limit: String(limit) });
    if (filters?.gender && filters.gender !== 'all') params.set('gender', filters.gender);
    if (filters?.ageMin && filters.ageMin > 0) params.set('age_min', String(filters.ageMin));
    if (filters?.ageMax && filters.ageMax < 99) params.set('age_max', String(filters.ageMax));
    if (filters?.country) params.set('country', filters.country);

    const res = await fetch(
      `${apiBase}/api/dreams/by-symbol/${encodeURIComponent(symbolId)}?${params}`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Traeume eines bestimmten Users laden (fuer User-Node-Klick im Graph)
export async function searchDreamsByUserId(
  userId: string,
  limit = 50,
): Promise<DreamSearchResult[]> {
  if (!userId) return [];

  try {
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
    const res = await fetch(
      `${apiBase}/api/dreams/by-user?user_id=${encodeURIComponent(userId)}&limit=${limit}`,
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch { /* Backend-Endpoint evtl. nicht verfuegbar → Supabase-Fallback */ }

  try {
    const { data: links } = await supabase
      .from('dream_symbol_links')
      .select('dream_id')
      .eq('user_id', userId)
      .limit(limit);

    const dreamIds = Array.from(new Set((links || []).map(l => l.dream_id).filter(Boolean)));
    if (dreamIds.length === 0) return [];

    const { data: dreams } = await supabase
      .from('research_dreams')
      .select('dream_id, participant_id, study_code, dream_snippet, original_language, transcript')
      .in('dream_id', dreamIds)
      .limit(limit);

    return (dreams || []).map(d => ({
      dream_id: d.dream_id,
      participant_id: d.participant_id || '',
      study_code: d.study_code || '',
      dream_snippet: d.dream_snippet || (d.transcript ? String(d.transcript).slice(0, 240) : ''),
      original_language: d.original_language || '',
    }));
  } catch {
    return [];
  }
}

// ── Demographische Filter: Symbole nach User-Demographie gewichten ──
export interface DemographicFilter {
  gender?: 'all' | 'male' | 'female';
  ageMin?: number;
  ageMax?: number;
  country?: string;
}

/**
 * Filtert Symbol-Nodes basierend auf der Demographie der Traumer.
 * Ruft Backend-Endpoint auf der den korrekten Join-Pfad nutzt:
 * dream_symbol_links → research_dreams → research_participants
 */
export async function filterSymbolsByDemographics(
  filters: DemographicFilter,
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (
    (!filters.gender || filters.gender === 'all') &&
    (!filters.ageMin || filters.ageMin <= 0) &&
    (!filters.ageMax || filters.ageMax >= 99) &&
    !filters.country
  ) {
    return counts;
  }

  try {
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
    const params = new URLSearchParams();
    if (filters.gender && filters.gender !== 'all') params.set('gender', filters.gender);
    if (filters.ageMin && filters.ageMin > 0) params.set('age_min', String(filters.ageMin));
    if (filters.ageMax && filters.ageMax < 99) params.set('age_max', String(filters.ageMax));
    if (filters.country) params.set('country', filters.country);

    const res = await fetch(`${apiBase}/api/demographics/filtered-symbols?${params}`);
    if (!res.ok) return counts;

    const data = await res.json();
    const symbols = data.symbols || {};
    for (const [symId, count] of Object.entries(symbols)) {
      counts.set(`sym_${symId}`, count as number);
    }
    return counts;
  } catch {
    return counts;
  }
}
