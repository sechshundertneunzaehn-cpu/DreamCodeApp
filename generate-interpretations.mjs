import { createRequire } from 'module';
const require = createRequire(import.meta.url);

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// --- Config ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const API_KEYS = [
  process.env.VITE_GEMINI_API_KEY,
  process.env.VITE_GEMINI_API_KEY_2,
  process.env.VITE_GEMINI_API_KEY_3,
  process.env.VITE_GEMINI_API_KEY_4,
].filter(Boolean);

const CONCURRENCY = 1;
const BATCH_PAUSE_MS = 4000;
const RATE_LIMIT_WAIT_MS = 5000;
const PAGE_SIZE = 1000;
const MIN_TEXT_LENGTH = 10;

const LANG_MAP = {
  en: 'English',
  de: 'Deutsch',
  tr: 'Türkçe',
  ar: 'Arabic',
  fr: 'Français',
  es: 'Español',
  pt: 'Portuguese',
  ru: 'Russian',
};

// --- Supabase ---
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Key rotation ---
let keyIndex = 0;
function getNextKey() {
  const key = API_KEYS[keyIndex % API_KEYS.length];
  keyIndex++;
  return key;
}

// --- Gemini call ---
async function callGemini(dreamText, lang, retries = 2) {
  const langName = LANG_MAP[lang] || 'English';
  const prompt = `You are a scientific dream researcher. Analyze this dream report briefly and objectively.
Dream: "${dreamText.slice(0, 500)}"
Provide a short scientific interpretation (2-3 sentences) covering:
1. Main psychological themes
2. Possible emotional significance
3. Common symbolism
Language: ${langName}
Response: Only the interpretation text, no headers or labels.`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const apiKey = getNextKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
        }),
      });

      if (res.status === 429) {
        console.warn(`[429] Rate limit hit (attempt ${attempt + 1}), waiting ${RATE_LIMIT_WAIT_MS}ms...`);
        await sleep(RATE_LIMIT_WAIT_MS);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini ${res.status}: ${errText.slice(0, 200)}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini');
      return text.trim();
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`Retry ${attempt + 1}: ${err.message}`);
      await sleep(1000);
    }
  }
}

// --- Helpers ---
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function loadExistingIds() {
  const ids = new Set();
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('research_interpretations')
      .select('dream_id')
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`Failed to load existing IDs: ${error.message}`);
    if (!data || data.length === 0) break;

    for (const row of data) ids.add(row.dream_id);
    from += PAGE_SIZE;
    if (data.length < PAGE_SIZE) break;
  }
  return ids;
}

async function loadDreams(existingIds) {
  const dreams = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('research_dreams')
      .select('id, dream_text, participant_id, study_id, original_language')
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`Failed to load dreams: ${error.message}`);
    if (!data || data.length === 0) break;

    for (const d of data) {
      if (existingIds.has(d.id)) continue;
      if (!d.dream_text || d.dream_text.length < MIN_TEXT_LENGTH) continue;
      dreams.push(d);
    }

    from += PAGE_SIZE;
    console.log(`  Loaded page ${Math.ceil(from / PAGE_SIZE)}, total filtered: ${dreams.length}`);
    if (data.length < PAGE_SIZE) break;
  }
  return dreams;
}

async function processDream(dream) {
  const interpretation = await callGemini(dream.dream_text, dream.original_language);
  if (!interpretation) return false; // Skip null content

  const { error } = await supabase
    .from('research_interpretations')
    .upsert(
      {
        dream_id: dream.id,
        participant_id: dream.participant_id,
        study_id: dream.study_id,
        content: interpretation,
        tradition: 'scientific',
      },
      { onConflict: 'dream_id' }
    );

  if (error) throw new Error(`Upsert failed for dream ${dream.id}: ${error.message}`);
  return true;
}

// --- Main ---
async function main() {
  console.log('=== Generate Research Dream Interpretations ===');
  console.log(`API keys available: ${API_KEYS.length}`);
  console.log(`Concurrency: ${CONCURRENCY}, Batch pause: ${BATCH_PAUSE_MS}ms\n`);

  // Step 1: Load existing interpretation IDs
  console.log('Loading existing interpretations...');
  const existingIds = await loadExistingIds();
  console.log(`Found ${existingIds.size} existing interpretations.\n`);

  // Step 2: Load dreams, filter out already interpreted + short texts
  console.log('Loading research dreams...');
  const dreams = await loadDreams(existingIds);
  console.log(`\n${dreams.length} dreams to process.\n`);

  if (dreams.length === 0) {
    console.log('Nothing to do. Exiting.');
    return;
  }

  // Step 3: Process in batches
  let success = 0;
  let errors = 0;

  for (let i = 0; i < dreams.length; i += CONCURRENCY) {
    const batch = dreams.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(batch.map((d) => processDream(d)));

    for (const r of results) {
      if (r.status === 'fulfilled') {
        success++;
      } else {
        errors++;
        console.error(`  Error: ${r.reason?.message || r.reason}`);
      }
    }

    if ((success + errors) % 50 === 0 || i + CONCURRENCY >= dreams.length) {
      const pct = (((success + errors) / dreams.length) * 100).toFixed(1);
      console.log(`[Progress] ${success + errors}/${dreams.length} (${pct}%) | OK: ${success} | Errors: ${errors}`);
    }

    if (i + CONCURRENCY < dreams.length) {
      await sleep(BATCH_PAUSE_MS);
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Total: ${success + errors} | Success: ${success} | Errors: ${errors}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
