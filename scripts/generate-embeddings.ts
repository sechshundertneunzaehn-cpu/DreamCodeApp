/**
 * Generate embeddings — SEQUENTIAL with KEY ROUND-ROBIN
 * Proven approach: 1 request at a time, rotate keys, ~150-200 rpm
 */

const SUPABASE_BATCH = 500;
const DELAY_MS = 300;           // 300ms between requests = ~200 rpm with 4 keys
const MAX_RETRIES = 5;
const STATUS_EVERY = 500;

const MODEL = "gemini-embedding-001";
const DIMS = 768;
const API = "https://generativelanguage.googleapis.com/v1beta/models";

const enc = new TextEncoder();
const log = (m: string) => Deno.stdout.writeSync(enc.encode(m + "\n"));
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function fmt(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

// --- Env ---
async function loadEnv() {
  try {
    for (const line of (await Deno.readTextFile(".env")).split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 1) continue;
      const k = t.slice(0, eq).trim(), v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!Deno.env.get(k)) Deno.env.set(k, v);
    }
  } catch { /* */ }
}

// --- Supabase ---
async function fetchPending(url: string, key: string, limit: number) {
  const r = await fetch(`${url}/rest/v1/dream_reports?select=id,text&embedding=is.null&limit=${limit}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
  });
  if (!r.ok) throw new Error(`Fetch: ${r.status}`);
  return r.json() as Promise<{ id: string; text: string }[]>;
}

async function countPending(url: string, key: string): Promise<number> {
  const r = await fetch(`${url}/rest/v1/dream_reports?select=id&embedding=is.null`, {
    method: "HEAD", headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" },
  });
  const cr = r.headers.get("content-range");
  return cr ? parseInt(cr.split("/")[1] ?? "0", 10) || 0 : -1;
}

async function save(url: string, key: string, id: string, emb: number[], att = 1): Promise<void> {
  const r = await fetch(`${url}/rest/v1/dream_reports?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=minimal" },
    body: JSON.stringify({ embedding: emb }),
  });
  if (!r.ok && att < 3) { await sleep(1000 * att); return save(url, key, id, emb, att + 1); }
}

// --- Key Round-Robin ---
class Keys {
  private keys: string[];
  private idx = 0;
  private counts: number[];

  constructor(keys: string[]) {
    this.keys = keys;
    this.counts = new Array(keys.length).fill(0);
  }

  next(): string {
    const k = this.keys[this.idx];
    this.counts[this.idx]++;
    this.idx = (this.idx + 1) % this.keys.length;
    return k;
  }

  stats(): string {
    return this.keys.map((_, i) => `K${i + 1}:${this.counts[i]}`).join(" ");
  }
}

// --- Embed with key rotation on 429 ---
async function embed(keys: Keys, text: string, keysUsed = 0): Promise<number[]> {
  const truncated = text.length > 8000 ? text.slice(0, 8000) : text;
  const apiKey = keys.next();

  for (let att = 1; att <= MAX_RETRIES; att++) {
    const r = await fetch(`${API}/${MODEL}:embedContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${MODEL}`,
        content: { parts: [{ text: truncated }] },
        outputDimensionality: DIMS,
      }),
    });

    if (r.ok) {
      const d = await r.json() as { embedding?: { values: number[] } };
      const v = d?.embedding?.values;
      if (v && v.length === DIMS) return v;
      throw new Error(`Bad dims: ${v?.length}`);
    }

    await r.text().catch(() => "");

    if (r.status === 429) {
      // Try next key instead of waiting
      if (keysUsed < 3) {
        return embed(keys, text, keysUsed + 1);
      }
      // All keys exhausted for this request — wait and retry current key
      await sleep(5000 * att);
      continue;
    }

    if (att < MAX_RETRIES) await sleep(2000 * att);
  }
  throw new Error("429 after all retries");
}

// --- Main ---
async function main() {
  await loadEnv();

  const keyList: string[] = [];
  for (let i = 1; i <= 4; i++) { const k = Deno.env.get(`GEMINI_API_KEY_${i}`); if (k) keyList.push(k); }
  if (!keyList.length) { const k = Deno.env.get("GEMINI_API_KEY"); if (k) keyList.push(k); }
  if (!keyList.length) throw new Error("No keys");

  const keys = new Keys(keyList);
  const SB = Deno.env.get("SUPABASE_URL")!;
  const SK = Deno.env.get("SUPABASE_SERVICE_KEY")!;

  log("=== Embedding Generator (Sequential Round-Robin) ===");
  log(`Keys: ${keyList.length} | Delay: ${DELAY_MS}ms | Model: ${MODEL}`);

  const total = await countPending(SB, SK);
  if (total === 0) { log("Done — nothing pending."); return; }
  log(`Pending: ${total.toLocaleString()}`);
  log("");

  let ok = 0, err = 0, cycle = 0;
  const t0 = Date.now();

  while (true) {
    cycle++;
    const rows = await fetchPending(SB, SK, SUPABASE_BATCH);
    if (!rows.length) { log("\nAll done!"); break; }
    log(`[Cycle ${cycle}] ${rows.length} rows`);

    for (let i = 0; i < rows.length; i++) {
      try {
        const emb = await embed(keys, rows[i].text);
        await save(SB, SK, rows[i].id, emb);
        ok++;
      } catch (e) {
        err++;
        if (err % 50 === 1) log(`  ERR [${rows[i].id.slice(0, 8)}]: ${(e as Error).message.slice(0, 60)}`);
      }

      if (ok > 0 && ok % STATUS_EVERY === 0) {
        const el = Date.now() - t0;
        const rpm = Math.round((ok / el) * 60000);
        const eta = rpm > 0 ? fmt(((total - ok) / rpm) * 60000) : "?";
        log(`>>> ${ok.toLocaleString()}/${total.toLocaleString()} (${((ok / total) * 100).toFixed(1)}%) | ${rpm} rpm | ETA ~${eta} | err:${err} | ${keys.stats()}`);
      }

      await sleep(DELAY_MS);
    }

    const rpm = Math.round((ok / (Date.now() - t0)) * 60000);
    log(`  Cycle ${cycle}: +${rows.length} rows | total: ${ok} ok, ${err} err | ${rpm} rpm`);
  }

  log(`\n=== DONE: ${ok.toLocaleString()} in ${fmt(Date.now() - t0)} | ${err} errors ===`);
}

main().catch((e) => { log(`FATAL: ${e.message}`); Deno.exit(1); });
