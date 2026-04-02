/**
 * Import Dryad TSV into Supabase dream_reports table
 *
 * NOTE: Die Dryad-Datei muss manuell heruntergeladen werden,
 *       da der Dryad-Server Cloudflare-Schutz hat.
 *       Download URL: https://doi.org/10.5061/dryad.qbzkh18fr
 *       Datei nach data/raw/dryad_dreams.tsv ablegen.
 *
 * Usage:
 *   deno run --allow-read --allow-net --allow-env scripts/import-dryad.ts
 *
 * Requires:
 *   SUPABASE_URL        - Supabase project URL
 *   SUPABASE_SERVICE_KEY - Supabase service role key (bypasses RLS)
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TSV_PATH = new URL("../data/raw/dryad_dreams.tsv", import.meta.url).pathname;
const BATCH_SIZE = 1000;
const MIN_WORD_COUNT = 5;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const SOURCE_NAME = "Dryad - Our Dreams Our Selves";
const SOURCE_URL = "https://doi.org/10.5061/dryad.qbzkh18fr";

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
    // .env nicht gefunden – nutzt Prozess-Environment
  }
}

// ---------------------------------------------------------------------------
// TSV Parser
// Dryad: Tab-getrennt, erste Spalte ist der dream report text.
// Quoted fields mit eingebetteten Tabs/Newlines werden beachtet.
// ---------------------------------------------------------------------------

interface ParseResult {
  headers: string[];
  rows: string[][];
}

function parseTSV(text: string): ParseResult {
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

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === "\t") {
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

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) throw new Error("TSV is empty");

  const headers = rows[0];
  return { headers, rows: rows.slice(1) };
}

// ---------------------------------------------------------------------------
// Tag extraction
// Dryad hat keine Hall-Van de Castle Spalten – minimale Tag-Extraktion
// anhand von Stichworten im Text (Fallback).
// ---------------------------------------------------------------------------

const KEYWORD_TAGS: Array<[RegExp, string]> = [
  [/\b(anger|angry|rage|furious)\b/i, "anger"],
  [/\b(fear|afraid|scared|terrified|horror)\b/i, "fear"],
  [/\b(happy|happiness|joy|joyful|delight)\b/i, "happiness"],
  [/\b(sad|sadness|grief|cry|crying|weep)\b/i, "sadness"],
  [/\b(wonder|awe|amazing|magical)\b/i, "wonder"],
  [/\b(animal|dog|cat|bird|snake|horse|wolf)\b/i, "animals"],
  [/\b(fly|flying|float|levitate)\b/i, "flying"],
  [/\b(chase|chased|run|running|escape)\b/i, "being_chased"],
  [/\b(fall|falling|drop|plunge)\b/i, "falling"],
  [/\b(water|ocean|sea|river|flood|drown)\b/i, "water"],
  [/\b(death|dead|die|died|dying|corpse)\b/i, "death"],
  [/\b(family|mother|father|sister|brother|parent)\b/i, "family"],
];

function extractTagsFromText(text: string): string[] {
  const tags: string[] = [];
  for (const [pattern, tag] of KEYWORD_TAGS) {
    if (pattern.test(text)) tags.push(tag);
  }
  return tags;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
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

    throw new Error(
      `Batch insert failed after ${MAX_RETRIES} attempts: ${res.status} ${body.slice(0, 500)}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Dryad TSV -> Supabase import");
  console.log("============================");
  console.log(`Source : ${SOURCE_NAME}`);
  console.log(`URL    : ${SOURCE_URL}`);
  console.log();

  // Cloudflare-Hinweis
  console.log(
    "HINWEIS: Dryad sperrt automatische Downloads via Cloudflare.",
  );
  console.log(
    "  Datei manuell herunterladen: https://doi.org/10.5061/dryad.qbzkh18fr",
  );
  console.log(`  Ablegen unter: data/raw/dryad_dreams.tsv`);
  console.log();

  // Check ob Datei existiert
  let fileExists = false;
  try {
    await Deno.stat(TSV_PATH);
    fileExists = true;
  } catch {
    fileExists = false;
  }

  if (!fileExists) {
    console.error(`Datei nicht gefunden: ${TSV_PATH}`);
    console.error("Bitte die Dryad-Datei manuell herunterladen (siehe HINWEIS oben).");
    Deno.exit(1);
  }

  // Dateiinhalt pruefen – Cloudflare-Seite abfangen
  const firstBytes = await Deno.readTextFile(TSV_PATH).then((t) => t.slice(0, 200));
  if (firstBytes.toLowerCase().includes("<!doctype html") || firstBytes.toLowerCase().includes("<html")) {
    console.error("Die Datei enthaelt HTML (vermutlich Cloudflare-Seite), kein TSV.");
    console.error("Bitte die Datei manuell im Browser herunterladen.");
    Deno.exit(1);
  }

  await loadEnvFile();

  const SUPABASE_URL = getEnv("SUPABASE_URL");
  const SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SERVICE_KEY");

  // Lesen & Parsen
  console.log(`Reading ${TSV_PATH} ...`);
  const raw = await Deno.readTextFile(TSV_PATH);
  console.log(`  File size: ${(raw.length / 1024 / 1024).toFixed(1)} MB`);

  console.log("Parsing TSV...");
  const { headers, rows } = parseTSV(raw);
  console.log(`  Columns : ${headers.length}`);
  console.log(`  Raw rows: ${rows.length}`);
  console.log(`  Headers : ${headers.slice(0, 8).join(" | ")}${headers.length > 8 ? " ..." : ""}`);

  // Erste Spalte = dream text (Standard-Dryad-Layout)
  // Falls eine Spalte "dream" oder "report" oder "text" existiert – die bevorzugen
  const colMap = new Map(headers.map((h, i) => [h.toLowerCase().trim(), i]));
  const textColIdx =
    colMap.get("dream") ??
    colMap.get("dream_text") ??
    colMap.get("report") ??
    colMap.get("text") ??
    colMap.get("answer_text") ??
    0; // Fallback: erste Spalte

  console.log(`  Text column: "${headers[textColIdx]}" (index ${textColIdx})`);

  // Datumspalte suchen
  const dateColIdx = colMap.get("date") ?? colMap.get("dream_date") ?? undefined;

  let skipped = 0;
  const records: DreamReport[] = [];

  for (const row of rows) {
    const text = (row[textColIdx] ?? "").trim();
    if (!text) {
      skipped++;
      continue;
    }

    const words = countWords(text);
    if (words < MIN_WORD_COUNT) {
      skipped++;
      continue;
    }

    const tags = extractTagsFromText(text);
    const themes = tags.filter((t) =>
      ["anger", "fear", "happiness", "sadness", "wonder"].includes(t)
    );

    let created_at: string | null = null;
    if (dateColIdx !== undefined) {
      const dateRaw = (row[dateColIdx] ?? "").trim();
      if (dateRaw) {
        try {
          created_at = new Date(dateRaw).toISOString();
        } catch {
          created_at = null;
        }
      }
    }

    records.push({
      text,
      source_name: SOURCE_NAME,
      source_url: SOURCE_URL,
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

  console.log(
    `\nInserting ${records.length} records in ${totalBatches} batches of ${BATCH_SIZE}...`,
  );

  for (let b = 0; b < totalBatches; b++) {
    const start = b * BATCH_SIZE;
    const batch = records.slice(start, start + BATCH_SIZE);

    await Deno.stdout.write(
      new TextEncoder().encode(
        `  Batch ${b + 1}/${totalBatches} (${batch.length} rows)... `,
      ),
    );

    await insertBatch(SUPABASE_URL, SUPABASE_SERVICE_KEY, batch);
    inserted += batch.length;

    console.log(`OK  [total: ${inserted}]`);
  }

  console.log(`\nDone. Inserted ${inserted} dream reports from Dryad.`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  Deno.exit(1);
});
