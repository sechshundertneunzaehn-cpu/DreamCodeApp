/**
 * Import SDDb CSV into Supabase dream_reports table
 *
 * Usage:
 *   deno run --allow-read --allow-net --allow-env scripts/import-sddb.ts
 *
 * Requires:
 *   SUPABASE_URL        - Supabase project URL
 *   SUPABASE_SERVICE_KEY - Supabase service role key (bypasses RLS)
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CSV_PATH = new URL("../data/raw/sddb_dreams.csv", import.meta.url).pathname;
const BATCH_SIZE = 1000;
const MIN_WORD_COUNT = 5;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Hall-Van de Castle coding columns that become tags / themes
const EMOTION_COLS = ["Anger", "Fear", "Happiness", "Sadness", "Wonder"] as const;
const CATEGORY_COLS = [
  "Animals",
  "Children",
  "Creatures",
  "Dead Characters",
  "Family Characters",
  "Female Characters",
  "Friends",
  "Imaginary Characters",
  "Male Characters",
  "Strangers",
  "Misfortune",
  "Good Fortunes",
] as const;
const SETTING_COLS = [
  "Familiar Settings",
  "Outside Settings",
  "Inside Settings",
] as const;

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

function getEnv(key: string): string {
  const val = Deno.env.get(key);
  if (!val) throw new Error(`Missing environment variable: ${key}`);
  return val;
}

async function loadEnvFile() {
  try {
    const text = await Deno.readTextFile(".env");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!Deno.env.get(key)) Deno.env.set(key, value);
    }
  } catch {
    // .env not found – relying on process environment
  }
}

// ---------------------------------------------------------------------------
// CSV Parser (handles multiline quoted fields)
// ---------------------------------------------------------------------------

interface ParseResult {
  headers: string[];
  rows: string[][];
}

function parseCSV(text: string): ParseResult {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        // Escaped quote inside quoted field
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

    // Not in quotes
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }

    if (ch === "\r" && next === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 2;
      continue;
    }

    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }

    field += ch;
    i++;
  }

  // Last row (no trailing newline)
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) throw new Error("CSV is empty");

  const headers = rows[0];
  return { headers, rows: rows.slice(1) };
}

// ---------------------------------------------------------------------------
// Tag / Theme extraction
// ---------------------------------------------------------------------------

function extractTags(headers: string[], row: string[]): string[] {
  const tags: string[] = [];
  const colMap = new Map(headers.map((h, i) => [h, i]));

  for (const col of [...EMOTION_COLS, ...CATEGORY_COLS, ...SETTING_COLS]) {
    const idx = colMap.get(col);
    if (idx === undefined) continue;
    const val = parseFloat(row[idx] ?? "");
    if (!isNaN(val) && val > 0) {
      tags.push(col.toLowerCase().replace(/\s+/g, "_"));
    }
  }

  return tags;
}

function extractThemes(headers: string[], row: string[]): string[] {
  const themes: string[] = [];
  const colMap = new Map(headers.map((h, i) => [h, i]));

  // Top emotions only as themes
  for (const col of EMOTION_COLS) {
    const idx = colMap.get(col);
    if (idx === undefined) continue;
    const val = parseFloat(row[idx] ?? "");
    if (!isNaN(val) && val > 0) {
      themes.push(col.toLowerCase());
    }
  }

  return themes;
}

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------

interface DreamReport {
  text: string;
  source_name: string;
  source_url: string;
  language: string;
  tags: string[];
  themes: string[];
  embedding: null;
  created_at: string | null;
}

async function insertBatch(
  supabaseUrl: string,
  serviceKey: string,
  batch: DreamReport[],
  attempt = 1,
): Promise<void> {
  const url = `${supabaseUrl}/rest/v1/dream_reports`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(batch),
  });

  if (!res.ok) {
    const body = await res.text();

    if (attempt < MAX_RETRIES) {
      console.warn(
        `  Batch insert failed (attempt ${attempt}/${MAX_RETRIES}): ${res.status} ${body.slice(0, 200)}`,
      );
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
      return insertBatch(supabaseUrl, serviceKey, batch, attempt + 1);
    }

    throw new Error(`Batch insert failed after ${MAX_RETRIES} attempts: ${res.status} ${body.slice(0, 500)}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("SDDb CSV -> Supabase import");
  console.log("===========================");

  await loadEnvFile();

  const SUPABASE_URL = getEnv("SUPABASE_URL");
  const SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SERVICE_KEY");

  // Read CSV
  console.log(`Reading ${CSV_PATH} ...`);
  const raw = await Deno.readTextFile(CSV_PATH);
  console.log(`  File size: ${(raw.length / 1024 / 1024).toFixed(1)} MB`);

  // Parse
  console.log("Parsing CSV (handles multiline quoted fields)...");
  const { headers, rows } = parseCSV(raw);
  console.log(`  Columns : ${headers.length}`);
  console.log(`  Raw rows: ${rows.length}`);

  // Column indices for the main fields
  const colMap = new Map(headers.map((h, i) => [h, i]));
  const idxText = colMap.get("answer_text");
  const idxWords = colMap.get("word_count");
  const idxDate = colMap.get("date");
  const idxSurvey = colMap.get("survey");

  if (idxText === undefined) throw new Error("Column 'answer_text' not found in CSV");

  // Build records
  let skipped = 0;
  const records: DreamReport[] = [];

  for (const row of rows) {
    const text = (row[idxText!] ?? "").trim();
    const wordCountRaw = row[idxWords!] ?? "";
    const wordCount = parseInt(wordCountRaw, 10);
    const survey = idxSurvey !== undefined ? (row[idxSurvey] ?? "").trim() : "";
    const dateRaw = idxDate !== undefined ? (row[idxDate] ?? "").trim() : "";

    // Skip empty / too-short texts
    if (!text || (idxWords !== undefined && (!isNaN(wordCount) && wordCount < MIN_WORD_COUNT))) {
      skipped++;
      continue;
    }

    const tags = extractTags(headers, row);
    const themes = extractThemes(headers, row);

    let created_at: string | null = null;
    if (dateRaw) {
      try {
        created_at = new Date(dateRaw).toISOString();
      } catch {
        created_at = null;
      }
    }

    records.push({
      text,
      source_name: survey ? `SDDb - ${survey}` : "SDDb",
      source_url: "https://sleepanddreamdatabase.org",
      language: "en",
      tags,
      themes,
      embedding: null,
      created_at,
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

    process.stdout.write !== undefined
      ? process.stdout.write(`  Batch ${b + 1}/${totalBatches} (${batch.length} rows)... `)
      : Deno.stdout.write(new TextEncoder().encode(`  Batch ${b + 1}/${totalBatches} (${batch.length} rows)... `));

    await insertBatch(SUPABASE_URL, SUPABASE_SERVICE_KEY, batch);
    inserted += batch.length;

    console.log(`OK  [total: ${inserted}]`);
  }

  console.log(`\nDone. Inserted ${inserted} dream reports.`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  Deno.exit(1);
});
