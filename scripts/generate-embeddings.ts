/**
 * Generate embeddings for dream_reports via Gemini gemini-embedding-001
 *
 * Usage:
 *   deno run --allow-read --allow-net --allow-env scripts/generate-embeddings.ts
 *
 * Requires:
 *   SUPABASE_URL        - Supabase project URL
 *   SUPABASE_SERVICE_KEY - Supabase service role key (bypasses RLS)
 *   GEMINI_API_KEY      - Google AI Studio API key
 *
 * Model: gemini-embedding-001 (768 dimensions)
 * Rate limit: max 50 requests/minute
 * Batch size: 100 rows per run cycle
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BATCH_SIZE = 100;           // Rows fetched from Supabase per cycle
const GEMINI_RPM_LIMIT = 50;      // Requests per minute
const MS_PER_MINUTE = 60_000;
const MIN_DELAY_MS = Math.ceil(MS_PER_MINUTE / GEMINI_RPM_LIMIT); // 1200ms
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

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
    // .env nicht gefunden
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DreamRow {
  id: string;
  text: string;
}

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------

async function fetchRowsWithoutEmbedding(
  supabaseUrl: string,
  serviceKey: string,
  limit: number,
): Promise<DreamRow[]> {
  const url =
    `${supabaseUrl}/rest/v1/dream_reports?select=id,text&embedding=is.null&limit=${limit}`;

  const res = await fetch(url, {
    headers: {
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase fetch failed: ${res.status} ${body.slice(0, 300)}`);
  }

  return res.json() as Promise<DreamRow[]>;
}

async function updateEmbedding(
  supabaseUrl: string,
  serviceKey: string,
  id: string,
  embedding: number[],
  attempt = 1,
): Promise<void> {
  const url = `${supabaseUrl}/rest/v1/dream_reports?id=eq.${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({ embedding }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (attempt < MAX_RETRIES) {
      console.warn(`  PATCH failed (attempt ${attempt}): ${res.status}`);
      await sleep(RETRY_DELAY_MS * attempt);
      return updateEmbedding(supabaseUrl, serviceKey, id, embedding, attempt + 1);
    }
    throw new Error(`updateEmbedding failed for ${id}: ${res.status} ${body.slice(0, 300)}`);
  }
}

// ---------------------------------------------------------------------------
// Gemini embedding
// ---------------------------------------------------------------------------

async function generateEmbedding(
  apiKey: string,
  text: string,
  attempt = 1,
): Promise<number[]> {
  const url =
    `${GEMINI_API_BASE}/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${apiKey}`;

  // Truncate to ~8000 chars to stay within token limits
  const truncated = text.length > 8000 ? text.slice(0, 8000) : text;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${GEMINI_EMBEDDING_MODEL}`,
      content: {
        parts: [{ text: truncated }],
      },
    }),
  });

  if (res.status === 429) {
    // Rate limit hit – wait and retry
    const waitMs = RETRY_DELAY_MS * attempt;
    console.warn(`  Rate limited (429). Waiting ${waitMs}ms...`);
    await sleep(waitMs);
    if (attempt < MAX_RETRIES) return generateEmbedding(apiKey, text, attempt + 1);
    throw new Error("Gemini rate limit persists after retries");
  }

  if (!res.ok) {
    const body = await res.text();
    if (attempt < MAX_RETRIES) {
      console.warn(`  Gemini error (attempt ${attempt}): ${res.status}`);
      await sleep(RETRY_DELAY_MS * attempt);
      return generateEmbedding(apiKey, text, attempt + 1);
    }
    throw new Error(`Gemini embedding failed: ${res.status} ${body.slice(0, 300)}`);
  }

  const data = await res.json() as {
    embedding?: { values: number[] };
  };

  const values = data?.embedding?.values;
  if (!values || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Unexpected embedding dimensions: got ${values?.length ?? 0}, expected ${EMBEDDING_DIMENSIONS}`,
    );
  }

  return values;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

async function countPendingRows(
  supabaseUrl: string,
  serviceKey: string,
): Promise<number> {
  const url =
    `${supabaseUrl}/rest/v1/dream_reports?select=id&embedding=is.null`;

  const res = await fetch(url, {
    method: "HEAD",
    headers: {
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Prefer": "count=exact",
    },
  });

  if (!res.ok) return -1;

  const countHeader = res.headers.get("content-range");
  if (!countHeader) return -1;
  // Format: "0-99/39089"
  const total = parseInt(countHeader.split("/")[1] ?? "", 10);
  return isNaN(total) ? -1 : total;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Generate embeddings via Gemini gemini-embedding-001");
  console.log("====================================================");
  console.log(`Model      : ${GEMINI_EMBEDDING_MODEL} (${EMBEDDING_DIMENSIONS} dims)`);
  console.log(`Rate limit : ${GEMINI_RPM_LIMIT} req/min (~${MIN_DELAY_MS}ms between requests)`);
  console.log(`Batch size : ${BATCH_SIZE} rows per cycle`);
  console.log();

  await loadEnvFile();

  const SUPABASE_URL = getEnv("SUPABASE_URL");
  const SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SERVICE_KEY");
  const GEMINI_API_KEY = getEnv("GEMINI_API_KEY");

  // Count pending rows
  const pending = await countPendingRows(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  if (pending === 0) {
    console.log("All rows already have embeddings. Nothing to do.");
    Deno.exit(0);
  }
  if (pending > 0) {
    const estimatedMinutes = Math.ceil(pending / GEMINI_RPM_LIMIT);
    console.log(`Pending rows (no embedding): ${pending}`);
    console.log(
      `Estimated time at ${GEMINI_RPM_LIMIT} req/min: ~${formatDuration(estimatedMinutes * MS_PER_MINUTE)}`,
    );
    console.log();
  }

  // Process in cycles of BATCH_SIZE
  let totalProcessed = 0;
  let totalErrors = 0;
  let cycle = 0;

  while (true) {
    cycle++;
    console.log(`Cycle ${cycle}: fetching up to ${BATCH_SIZE} rows without embedding...`);

    const rows = await fetchRowsWithoutEmbedding(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      BATCH_SIZE,
    );

    if (rows.length === 0) {
      console.log("No more rows without embeddings.");
      break;
    }

    console.log(`  Found ${rows.length} rows. Processing...`);

    const cycleStart = Date.now();
    let cycleErrors = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const num = i + 1;

      await Deno.stdout.write(
        new TextEncoder().encode(
          `  [${num}/${rows.length}] id=${row.id.slice(0, 8)}... `,
        ),
      );

      try {
        const embedding = await generateEmbedding(GEMINI_API_KEY, row.text);
        await updateEmbedding(SUPABASE_URL, SUPABASE_SERVICE_KEY, row.id, embedding);
        totalProcessed++;
        console.log("OK");
      } catch (err) {
        totalErrors++;
        cycleErrors++;
        console.log(`ERROR: ${(err as Error).message.slice(0, 100)}`);
      }

      // Rate limiting: wait between requests
      if (i < rows.length - 1) {
        await sleep(MIN_DELAY_MS);
      }
    }

    const cycleMs = Date.now() - cycleStart;
    console.log(
      `  Cycle ${cycle} done in ${formatDuration(cycleMs)}. ` +
        `Success: ${rows.length - cycleErrors}, Errors: ${cycleErrors}`,
    );
    console.log(
      `  Running total: ${totalProcessed} processed, ${totalErrors} errors`,
    );
    console.log();
  }

  console.log("===================================================");
  console.log(`Done. Total processed: ${totalProcessed}`);
  if (totalErrors > 0) {
    console.log(`Errors: ${totalErrors} (rows still have embedding=null)`);
    console.log("Re-run this script to retry failed rows.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  Deno.exit(1);
});
