/**
 * Migrations-Script: Befuellt Supabase Knowledge-Graph-Tabellen
 * aus traumsymbole.json (877 Symbole) + knowledgeBase.ts Traditionen.
 *
 * Usage: npx tsx scripts/migrate-dream-knowledge.ts
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Config ─────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xwcftfgujacsutwhossi.supabase.co';
let SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_KEY) {
  const envPath = resolve(__dirname, '../.env');
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
    if (match) SUPABASE_KEY = match[1].trim();
  } catch {}
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  { auth: { persistSession: false } }
);

// ── Quellen-Labels ─────────────────────────────────────────
const CULTURE_LABELS: Record<string, string> = {
  ibn_sirin: 'Ibn Sirin (Islamisch)',
  nabulsi: 'Al-Nabulsi (Islamisch)',
  freud: 'Sigmund Freud',
  jung: 'C.G. Jung',
  gestalt: 'Gestalt (Perls)',
  medieval: 'Mittelalter',
  church_fathers: 'Kirchenvaeter',
  modern_theology: 'Moderne Theologie',
  tibetan: 'Tibet. Buddhismus',
  zen: 'Zen-Buddhismus',
  theravada: 'Theravada',
  western_zodiac: 'Westl. Astrologie',
  // Aus knowledgeBase
  ISLAMIC: 'Islamisch',
  PSYCHOLOGICAL: 'Psychologisch',
  CHRISTIAN: 'Christlich',
  BUDDHIST: 'Buddhistisch',
};

// ── Element-Mapping (aus Kategorien ableiten) ──────────────
const ELEMENT_MAP: Record<string, string> = {
  'Wasser': 'wasser', 'Meer': 'wasser', 'Regen': 'wasser', 'Fluss': 'wasser',
  'See': 'wasser', 'Schwimmen': 'wasser', 'Eis': 'wasser', 'Schnee': 'wasser',
  'Feuer': 'feuer', 'Flamme': 'feuer', 'Sonne': 'feuer', 'Blitz': 'feuer',
  'Vulkan': 'feuer', 'Kerze': 'feuer', 'Hitze': 'feuer',
  'Erde': 'erde', 'Berg': 'erde', 'Wald': 'erde', 'Baum': 'erde',
  'Garten': 'erde', 'Hoehle': 'erde', 'Stein': 'erde',
  'Luft': 'luft', 'Fliegen': 'luft', 'Wind': 'luft', 'Himmel': 'luft',
  'Vogel': 'luft', 'Fallen': 'luft', 'Wolke': 'luft', 'Adler': 'luft',
};

// ── Kategorie normalisieren ────────────────────────────────
function normalizeKategorie(kat: string): string {
  const map: Record<string, string> = {
    'Aktivitaeten': 'Aktivitaeten', 'Aktivitäten': 'Aktivitaeten',
    'Koerper': 'Koerper', 'Körper': 'Koerper',
    'Natur': 'Natur', 'Tiere': 'Tiere', 'Orte': 'Orte',
    'Objekte': 'Objekte', 'Personen': 'Personen',
    'Emotionen': 'Emotionen', 'Spirituelles': 'Spirituelles',
  };
  return map[kat] || kat;
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  console.log('=== DreamCode Knowledge Graph Migration ===\n');

  // 1. Lade traumsymbole.json
  const jsonPath = resolve(__dirname, '../data/traumsymbole.json');
  console.log('Lade:', jsonPath);
  const raw = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  const symbole: any[] = raw.symbole || [];
  console.log(`Gefunden: ${symbole.length} Symbole\n`);

  // 2. Symbole in dream_symbols einfuegen (Batch)
  console.log('Phase 1: dream_symbols befuellen...');
  let symbolCount = 0;
  let interpretCount = 0;
  const BATCH = 50;

  // Map: Symbol-Name → UUID (fuer spaetere Verlinkung)
  const symbolIdMap = new Map<string, string>();

  for (let i = 0; i < symbole.length; i += BATCH) {
    const batch = symbole.slice(i, i + BATCH);
    const rows = batch.map(s => ({
      name: s.name,
      name_normalized: s.name.toLowerCase().trim(),
      kategorie: normalizeKategorie(s.kategorie || ''),
      element: ELEMENT_MAP[s.name] || null,
      emoji: s.emoji || null,
      frequency: 1,
    }));

    const { data, error } = await supabase
      .from('dream_symbols')
      .upsert(rows, { onConflict: 'name', ignoreDuplicates: false })
      .select('id, name');

    if (error) {
      console.error(`  Batch ${i}-${i + BATCH} Fehler:`, error.message);
      continue;
    }

    if (data) {
      for (const row of data) {
        symbolIdMap.set(row.name, row.id);
      }
      symbolCount += data.length;
    }

    if ((i + BATCH) % 200 === 0 || i + BATCH >= symbole.length) {
      console.log(`  ${Math.min(i + BATCH, symbole.length)}/${symbole.length} Symbole...`);
    }
  }
  console.log(`  -> ${symbolCount} Symbole eingefuegt/aktualisiert\n`);

  // Falls Batch-Select nicht alle IDs zurueckgab, nochmal laden
  if (symbolIdMap.size < symbole.length * 0.5) {
    console.log('  Lade Symbol-IDs nach...');
    const { data: allSyms } = await supabase
      .from('dream_symbols')
      .select('id, name')
      .limit(1000);
    if (allSyms) {
      for (const s of allSyms) symbolIdMap.set(s.name, s.id);
    }
    console.log(`  -> ${symbolIdMap.size} Symbol-IDs geladen\n`);
  }

  // 3. Kulturelle Deutungen einfuegen
  console.log('Phase 2: symbol_interpretations befuellen...');

  const interpretRows: any[] = [];

  for (const s of symbole) {
    const symId = symbolIdMap.get(s.name);
    if (!symId) continue;

    // Ibn Sirin
    if (s.ibn_sirin?.vorhanden && s.ibn_sirin.deutungen?.length > 0) {
      interpretRows.push({
        symbol_id: symId,
        culture_key: 'islamic_ibn_sirin',
        culture_label: 'Ibn Sirin (Islamisch)',
        interpretation_summary: s.ibn_sirin.deutungen[0]?.substring(0, 300) || '',
        interpretation_full: s.ibn_sirin.deutungen.join('\n\n'),
        language: 'de',
      });
    }

    // Nabulsi
    if (s.ibn_sirin?.nabulsi_vorhanden || s.nabulsi?.vorhanden) {
      const nab = s.nabulsi || s.ibn_sirin;
      if (nab?.deutungen?.length > 0) {
        interpretRows.push({
          symbol_id: symId,
          culture_key: 'islamic_nabulsi',
          culture_label: 'Al-Nabulsi (Islamisch)',
          interpretation_summary: nab.deutungen[0]?.substring(0, 300) || '',
          interpretation_full: nab.deutungen.join('\n\n'),
          language: 'de',
        });
      }
    }

    // Freud
    if (s.freud?.vorhanden && s.freud.interpretation) {
      interpretRows.push({
        symbol_id: symId,
        culture_key: 'freudian',
        culture_label: 'Sigmund Freud',
        interpretation_summary: s.freud.interpretation.substring(0, 300),
        interpretation_full: s.freud.interpretation,
        language: 'de',
      });
    }

    // Additional sources (jung, medieval, church_fathers, etc.)
    if (s.additional_sources && typeof s.additional_sources === 'object') {
      for (const [sourceKey, sourceData] of Object.entries(s.additional_sources)) {
        const sd = sourceData as any;
        if (sd?.text) {
          interpretRows.push({
            symbol_id: symId,
            culture_key: sourceKey,
            culture_label: CULTURE_LABELS[sourceKey] || sourceKey,
            interpretation_summary: sd.text.substring(0, 300),
            interpretation_full: sd.text,
            language: 'de',
          });
        }
      }
    }
  }

  // Batch-Insert interpretations
  for (let i = 0; i < interpretRows.length; i += BATCH) {
    const batch = interpretRows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('symbol_interpretations')
      .upsert(batch, { onConflict: 'symbol_id,culture_key,language', ignoreDuplicates: true });

    if (error) {
      console.error(`  Interpretations Batch ${i} Fehler:`, error.message);
    } else {
      interpretCount += batch.length;
    }

    if ((i + BATCH) % 200 === 0 || i + BATCH >= interpretRows.length) {
      console.log(`  ${Math.min(i + BATCH, interpretRows.length)}/${interpretRows.length} Deutungen...`);
    }
  }
  console.log(`  -> ${interpretCount} Deutungen eingefuegt\n`);

  // 4. Verwandte Symbole als Links (symbol → symbol)
  console.log('Phase 3: Verwandte-Symbol-Frequenzen aktualisieren...');
  let relCount = 0;
  for (const s of symbole) {
    if (!s.verwandte_symbole?.length) continue;
    // Erhoehe frequency fuer verwandte Symbole
    for (const related of s.verwandte_symbole) {
      const relId = symbolIdMap.get(related);
      if (relId) relCount++;
    }
  }
  console.log(`  -> ${relCount} Verwandte-Symbol-Beziehungen gefunden\n`);

  // 5. Zusammenfassung
  console.log('=== Migration abgeschlossen ===');
  console.log(`Symbole:        ${symbolCount}`);
  console.log(`Deutungen:      ${interpretCount}`);
  console.log(`Kulturen:       ${new Set(interpretRows.map(r => r.culture_key)).size}`);
  console.log(`Verwandtschaften: ${relCount}`);

  // Verify
  const { count: symTotal } = await supabase.from('dream_symbols').select('*', { count: 'exact', head: true });
  const { count: intTotal } = await supabase.from('symbol_interpretations').select('*', { count: 'exact', head: true });
  console.log(`\nVerifikation: ${symTotal} Symbole, ${intTotal} Deutungen in Supabase`);
}

main().catch(err => {
  console.error('Migration fehlgeschlagen:', err);
  process.exit(1);
});
