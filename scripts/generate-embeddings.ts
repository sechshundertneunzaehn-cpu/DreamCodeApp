/**
 * Generate embeddings for dream_reports via Gemini gemini-embedding-001
 * WITH KEY ROTATION: 4 API keys, automatic failover on 403/429
 *
 * Usage:
 *   deno run --allow-all scripts/generate-embeddings.ts [--resume]
 *
 * Requires env vars:
 *   SUPABASE_URL         - Supabase project URL
 *   SUPABASE_SERVICE_KEY - Supabase service role key
 *   GEMINI_API_KEY_1..4  - 4 Gemini API keys (rotation pool)
 *   (fallback: GEMINI_API_KEY as single key)
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BATCH_SIZE = 500;
const DELAY_BETWEEN_REQUESTS_MS = 100;
const STATUS_EVERY_N = 1000;
const MAX_RETRIES_PER_KEY = 2;
const RETRY_DELAY_MS = 2000;
const COOLDOWN_MS = 60_000; // 1 min cooldown for exhausted keys

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

function getEnvOptional(key: string): string | undefined {
  return Deno.env.get(key);
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
    // .env not found
  }
}

// ---------------------------------------------------------------------------
// Key Rotation Manager
// ---------------------------------------------------------------------------

class KeyRotator {
  private keys: string[];
  private currentIndex = 0;
  private cooldowns: Map<number, number> = new Map(); // index -> timestamp when available again
  private requestCounts: Map<number, number> = new Map();

  constructor(keys: string[]) {
    this.keys = keys;
    for (let i = 0; i < keys.length; i++) {
      this.requestCounts.set(i, 0);
    }
  }

  get currentKey(): string {
    return this.keys[this.currentIndex];
  }

  get currentKeyLabel(): string {
    return `Key${this.currentIndex + 1}`;
  }

  get totalKeys(): number {
    return this.keys.length;
  }

  recordSuccess() {
    this.requestCounts.set(
      this.currentIndex,
      (this.requestCounts.get(this.currentIndex) || 0) + 1,
    );
  }

  rotate(reason: string): boolean {
    const now = Date.now();
    // Put current key on cooldown
    this.cooldowns.set(this.currentIndex, now + COOLDOWN_MS);
    Deno.stdout.writeSync(new TextEncoder().encode(`  [KeyRotator] ${this.currentKeyLabel} → ${reason}. Rotating...\n`));

    // Find next available key
    for (let i = 1; i <= this.keys.length; i++) {
      const candidate = (this.currentIndex + i) % this.keys.length;
      const cooldownUntil = this.cooldowns.get(candidate) || 0;
      if (now >= cooldownUntil) {
        this.currentIndex = candidate;
        Deno.stdout.writeSync(new TextEncoder().encode(`  [KeyRotator] Switched to ${this.currentKeyLabel}\n`));
        return true;
      }
    }

    // All keys on cooldown — find the one that recovers soonest
    let soonest = Infinity;
    let soonestIdx = 0;
    for (let i = 0; i < this.keys.length; i++) {
      const cd = this.cooldowns.get(i) || 0;
      if (cd < soonest) {
        soonest = cd;
        soonestIdx = i;
      }
    }
    const waitMs = Math.max(0, soonest - now);
    Deno.stdout.writeSync(new TextEncoder().encode(`  [KeyRotator] All keys on cooldown. Waiting ${Math.ceil(waitMs / 1000)}s for Key${soonestIdx + 1}...\n`));
    this.currentIndex = soonestIdx;
    return false; // caller should sleep
  }

  getStats(): string {
    return this.keys.map((_, i) =>
      `Key${i + 1}: ${this.requestCounts.get(i) || 0} reqs`
    ).join(", ");
  }

  getNextCooldownMs(): number {
    const now = Date.now();
    let soonest = Infinity;
    for (const [, until] of this.cooldowns) {
      if (until > now && until < soonest) soonest = until;
    }
    return soonest === Infinity ? 0 : Math.max(0, soonest - now);
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
    if (attempt < 3) {
      await sleep(RETRY_DELAY_MS * attempt);
      return updateEmbedding(supabaseUrl, serviceKey, id, embedding, attempt + 1);
    }
    throw new Error(`updateEmbedding failed for ${id}: ${res.status} ${body.slice(0, 300)}`);
  }
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
  const total = parseInt(countHeader.split("/")[1] ?? "", 10);
  return isNaN(total) ? -1 : total;
}

// ---------------------------------------------------------------------------
// Gemini embedding with key rotation
// ---------------------------------------------------------------------------

async function generateEmbedding(
  rotator: KeyRotator,
  text: string,
): Promise<number[]> {
  const truncated = text.length > 8000 ? text.slice(0, 8000) : text;
  let lastError = "";

  // Try each key up to MAX_RETRIES_PER_KEY times before rotating
  for (let keyAttempt = 0; keyAttempt < rotator.totalKeys; keyAttempt++) {
    for (let retry = 0; retry < MAX_RETRIES_PER_KEY; retry++) {
      const url = `${GEMINI_API_BASE}/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${rotator.currentKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${GEMINI_EMBEDDING_MODEL}`,
          content: { parts: [{ text: truncated }] },
          outputDimensionality: EMBEDDING_DIMENSIONS,
        }),
      });

      if (res.ok) {
        const data = await res.json() as { embedding?: { values: number[] } };
        const values = data?.embedding?.values;
        if (!values || values.length !== EMBEDDING_DIMENSIONS) {
          throw new Error(`Bad dimensions: got ${values?.length ?? 0}, expected ${EMBEDDING_DIMENSIONS}`);
        }
        rotator.recordSuccess();
        return values;
      }

      const status = res.status;
      const body = await res.text().catch(() => "");

      if (status === 429 || status === 403) {
        // Rate limit or forbidden — rotate to next key
        const available = rotator.rotate(`${status} error`);
        if (!available) {
          const waitMs = rotator.getNextCooldownMs();
          if (waitMs > 0) await sleep(waitMs + 1000);
        }
        break; // break retry loop, try next key
      }

      // Other error — retry same key
      lastError = `${status} ${body.slice(0, 200)}`;
      if (retry < MAX_RETRIES_PER_KEY - 1) {
        await sleep(RETRY_DELAY_MS * (retry + 1));
      }
    }
  }

  throw new Error(`All keys exhausted. Last error: ${lastError}`);
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const encoder = new TextEncoder();
async function log(msg: string) {
  await Deno.stdout.write(encoder.encode(msg + "\n"));
}
async function logInline(msg: string) {
  await Deno.stdout.write(encoder.encode(msg));
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return `${m}m ${rem}s`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return `${h}h ${remM}m`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await loadEnvFile();

  // Collect API keys
  const keys: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const k = getEnvOptional(`GEMINI_API_KEY_${i}`);
    if (k) keys.push(k);
  }
  // Fallback to single GEMINI_API_KEY
  if (keys.length === 0) {
    const single = getEnvOptional("GEMINI_API_KEY");
    if (single) keys.push(single);
  }
  if (keys.length === 0) {
    throw new Error("No GEMINI_API_KEY_1..4 or GEMINI_API_KEY found");
  }

  const rotator = new KeyRotator(keys);

  const SUPABASE_URL = getEnv("SUPABASE_URL");
  const SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SERVICE_KEY");

  await log("=== Embedding Generator (Key Rotation) ===");
  await log(`Model      : ${GEMINI_EMBEDDING_MODEL} (${EMBEDDING_DIMENSIONS} dims)`);
  await log(`API Keys   : ${keys.length} loaded`);
  await log(`Delay      : ${DELAY_BETWEEN_REQUESTS_MS}ms between requests`);
  await log(`Batch size : ${BATCH_SIZE} rows per cycle`);
  await log(`Resume     : auto (skips rows with existing embedding)`);
  await log("");

  const pending = await countPendingRows(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  if (pending === 0) {
    await log("All rows already have embeddings. Done.");
    Deno.exit(0);
  }
  if (pending > 0) {
    const effectiveRpm = Math.min(keys.length * 50, Math.floor(60_000 / DELAY_BETWEEN_REQUESTS_MS));
    const estMinutes = Math.ceil(pending / effectiveRpm);
    await log(`Pending    : ${pending.toLocaleString()} rows`);
    await log(`Est. time  : ~${formatDuration(estMinutes * 60_000)} (at ~${effectiveRpm} req/min with ${keys.length} keys)`);
    await log("");
  }

  let totalProcessed = 0;
  let totalErrors = 0;
  let cycle = 0;
  const globalStart = Date.now();

  while (true) {
    cycle++;
    const rows = await fetchRowsWithoutEmbedding(SUPABASE_URL, SUPABASE_SERVICE_KEY, BATCH_SIZE);

    if (rows.length === 0) {
      await log("\nNo more rows without embeddings. Done!");
      break;
    }

    await log(`[Cycle ${cycle}] ${rows.length} rows fetched`);
    const cycleStart = Date.now();
    let cycleOk = 0;
    let cycleErr = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        const embedding = await generateEmbedding(rotator, row.text);
        await updateEmbedding(SUPABASE_URL, SUPABASE_SERVICE_KEY, row.id, embedding);
        totalProcessed++;
        cycleOk++;
      } catch (err) {
        totalErrors++;
        cycleErr++;
        await log(`  ERROR [${row.id.slice(0, 8)}]: ${(err as Error).message.slice(0, 120)}`);
      }

      // Status log every N embeddings
      if (totalProcessed > 0 && totalProcessed % STATUS_EVERY_N === 0) {
        const elapsed = Date.now() - globalStart;
        const rpm = Math.round((totalProcessed / elapsed) * 60_000);
        const remainingRows = pending - totalProcessed;
        const eta = remainingRows > 0 ? formatDuration((remainingRows / rpm) * 60_000) : "done";
        await log(
          `\n>>> STATUS: ${totalProcessed.toLocaleString()}/${pending.toLocaleString()} done ` +
          `(${((totalProcessed / pending) * 100).toFixed(1)}%) | ` +
          `${rpm} req/min | ETA: ~${eta} | Errors: ${totalErrors} | ${rotator.getStats()}\n`
        );
      }

      // Log every 100 for progress visibility
      if (totalProcessed > 0 && totalProcessed % 100 === 0) {
        await log(`  ... ${totalProcessed} done`);
      }

      // Short delay between requests
      if (i < rows.length - 1) {
        await sleep(DELAY_BETWEEN_REQUESTS_MS);
      }
    }

    const cycleMs = Date.now() - cycleStart;
    await log(`  Cycle ${cycle}: ${cycleOk} OK, ${cycleErr} errors in ${formatDuration(cycleMs)}`);
  }

  const totalMs = Date.now() - globalStart;
  await log("\n===================================================");
  await log(`Finished in ${formatDuration(totalMs)}`);
  await log(`Total: ${totalProcessed.toLocaleString()} processed, ${totalErrors} errors`);
  await log(`Keys: ${rotator.getStats()}`);
  if (totalErrors > 0) {
    await log("Re-run to retry failed rows (resume is automatic).");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  Deno.exit(1);
});
