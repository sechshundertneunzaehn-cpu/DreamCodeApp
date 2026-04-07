/**
 * Import SDDb CSV into Supabase dream_reports table
 *
 * Usage:
 *   node scripts/import-sddb.mjs
 *
 * Requires in .env:
 *   VITE_SUPABASE_URL         - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (bypasses RLS)
 */

import { createReadStream } from 'fs';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CSV_PATH = resolve(__dirname, '../data/raw/sddb_dreams.csv');
const BATCH_SIZE = 500;
const MIN_WORD_COUNT = 5;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Hall-Van de Castle: Emotionen → Tags + Themes
const EMOTION_COLS = ['Anger', 'Fear', 'Happiness', 'Sadness', 'Wonder'];

// Weitere Kategorie-Spalten → nur Tags
const CATEGORY_COLS = ['Animals', 'Children', 'Good Fortunes', 'Misfortune'];

// Dream Location → Tag aus dem Wert selbst
const LOCATION_COL = 'Dream Location';

// ---------------------------------------------------------------------------
// .env Parser
// ---------------------------------------------------------------------------

function loadEnv() {
  const envPath = resolve(__dirname, '../.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function getEnv(key) {
  const val = process.env[key];
  if (!val) throw new Error(`Missing environment variable: ${key}`);
  return val;
}

// ---------------------------------------------------------------------------
// CSV Parser (robust multiline quoted-field)
// ---------------------------------------------------------------------------

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        // Escaped double-quote inside quoted field
        field += '"';
        i += 2;
        continue;
      } else if (ch === '"') {
        inQuotes = false;
        i++;
        continue;
      } else {
        field += ch;
        i++;
        continue;
      }
    }

    // Outside quotes
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }

    if (ch === '\r' && next === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 2;
      continue;
    }

    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }

    field += ch;
    i++;
  }

  // Last row (no trailing newline)
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) throw new Error('CSV is empty');

  const headers = rows[0].map(h => h.trim());
  return { headers, rows: rows.slice(1) };
}

// ---------------------------------------------------------------------------
// Tag / Theme extraction
// ---------------------------------------------------------------------------

function extractTags(colMap, row) {
  const tags = [];

  // Emotion + category columns: tag wenn Wert vorhanden und != "0"
  for (const col of [...EMOTION_COLS, ...CATEGORY_COLS]) {
    const idx = colMap.get(col);
    if (idx === undefined) continue;
    const raw = (row[idx] ?? '').trim();
    if (raw && raw !== '0') {
      tags.push(col.toLowerCase().replace(/\s+/g, '_'));
    }
  }

  // Dream Location: tag = bereinigter Wert
  const locIdx = colMap.get(LOCATION_COL);
  if (locIdx !== undefined) {
    const loc = (row[locIdx] ?? '').trim();
    if (loc && loc !== '0') {
      const locTag = loc.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      if (locTag) tags.push(locTag);
    }
  }

  return tags;
}

function extractThemes(colMap, row) {
  const themes = [];
  for (const col of EMOTION_COLS) {
    const idx = colMap.get(col);
    if (idx === undefined) continue;
    const raw = (row[idx] ?? '').trim();
    if (raw && raw !== '0') {
      themes.push(col.toLowerCase());
    }
  }
  return themes;
}

// ---------------------------------------------------------------------------
// Supabase REST insert
// ---------------------------------------------------------------------------

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function insertBatch(supabaseUrl, serviceKey, batch, attempt = 1) {
  const url = `${supabaseUrl}/rest/v1/dream_reports`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(batch),
  });

  if (!res.ok) {
    const body = await res.text();
    if (attempt < MAX_RETRIES) {
      console.warn(`  Retry ${attempt}/${MAX_RETRIES}: HTTP ${res.status} - ${body.slice(0, 200)}`);
      await sleep(RETRY_DELAY_MS * attempt);
      return insertBatch(supabaseUrl, serviceKey, batch, attempt + 1);
    }
    throw new Error(`Batch insert failed after ${MAX_RETRIES} attempts: HTTP ${res.status}\n${body.slice(0, 500)}`);
  }
}

// ---------------------------------------------------------------------------
// Head check (zeigt erste 3 Datensaetze zur Verifikation)
// ---------------------------------------------------------------------------

function headCheck(headers, rows, colMap) {
  console.log('\n--- Head check (erste 3 Zeilen) ---');
  const idxText = colMap.get('answer_text');
  const idxWords = colMap.get('word_count');
  const idxSurvey = colMap.get('survey');
  for (let i = 0; i < Math.min(3, rows.length); i++) {
    const r = rows[i];
    const text = (r[idxText] ?? '').trim().slice(0, 80);
    const wc = r[idxWords] ?? '?';
    const survey = r[idxSurvey] ?? '?';
    const tags = extractTags(colMap, r);
    const themes = extractThemes(colMap, r);
    console.log(`  [${i}] wc=${wc} survey="${survey}" tags=[${tags.join(',')}] themes=[${themes.join(',')}]`);
    console.log(`       text: "${text}..."`);
  }
  console.log('-----------------------------------\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('SDDb CSV -> Supabase import (Node.js / REST API)');
  console.log('=================================================');

  loadEnv();

  const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
  const SERVICE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  // Read CSV
  console.log(`Reading ${CSV_PATH} ...`);
  const raw = readFileSync(CSV_PATH, 'utf8');
  console.log(`  File size : ${(raw.length / 1024 / 1024).toFixed(1)} MB`);

  // Parse
  console.log('Parsing CSV (multiline quoted-field support)...');
  const { headers, rows } = parseCSV(raw);
  console.log(`  Columns   : ${headers.length}`);
  console.log(`  Raw rows  : ${rows.length}`);

  const colMap = new Map(headers.map((h, i) => [h, i]));

  // Pflicht-Spalten pruefen
  if (!colMap.has('answer_text')) throw new Error("Column 'answer_text' not found in CSV");

  // Head check
  headCheck(headers, rows, colMap);

  const idxText = colMap.get('answer_text');
  const idxWords = colMap.get('word_count');
  const idxDate = colMap.get('date');
  const idxSurvey = colMap.get('survey');
  const idxRespondent = colMap.get('respondent');
  const idxTitle = colMap.get('dream_entry_title');

  // Build records
  let skipped = 0;
  const records = [];

  for (const row of rows) {
    const text = (row[idxText] ?? '').trim();
    const wordCountRaw = (row[idxWords] ?? '').trim();
    const wordCount = parseInt(wordCountRaw, 10);

    // Skip: leerer Text oder zu kurz
    if (!text) { skipped++; continue; }
    if (!isNaN(wordCount) && wordCount < MIN_WORD_COUNT) { skipped++; continue; }

    const survey = idxSurvey !== undefined ? (row[idxSurvey] ?? '').trim() : '';
    const respondent = idxRespondent !== undefined ? (row[idxRespondent] ?? '').trim() : null;
    const title = idxTitle !== undefined ? (row[idxTitle] ?? '').trim() : null;
    const dateRaw = idxDate !== undefined ? (row[idxDate] ?? '').trim() : '';

    const tags = extractTags(colMap, row);
    const themes = extractThemes(colMap, row);

    let dream_date = null;
    if (dateRaw) {
      const parsed = new Date(dateRaw);
      if (!isNaN(parsed.getTime())) dream_date = parsed.toISOString();
    }

    records.push({
      text,
      source_name: survey ? `SDDb - ${survey}` : 'SDDb',
      source_url: 'https://sleepanddreamdatabase.org',
      language: 'en',
      tags,
      themes,
      word_count: isNaN(wordCount) ? null : wordCount,
      survey_name: survey || null,
      respondent_id: respondent || null,
      dream_date,
    });
  }

  console.log(`  Valid records : ${records.length}`);
  console.log(`  Skipped       : ${skipped}`);

  // Batch insert
  const totalBatches = Math.ceil(records.length / BATCH_SIZE);
  let inserted = 0;

  console.log(`\nInserting ${records.length} records in ${totalBatches} batches of ${BATCH_SIZE}...`);

  for (let b = 0; b < totalBatches; b++) {
    const start = b * BATCH_SIZE;
    const batch = records.slice(start, start + BATCH_SIZE);
    process.stdout.write(`  Batch ${b + 1}/${totalBatches} (${batch.length} rows)... `);
    await insertBatch(SUPABASE_URL, SERVICE_KEY, batch);
    inserted += batch.length;
    console.log(`OK  [total: ${inserted}/${records.length}]`);
  }

  console.log(`\nDone. Inserted ${inserted} dream reports.`);
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
