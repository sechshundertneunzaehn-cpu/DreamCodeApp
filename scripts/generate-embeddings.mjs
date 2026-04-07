/**
 * Generate embeddings for dream_reports
 * Fallback chain: Gemini → OpenAI → Zero-Placeholder
 *
 * Usage:
 *   node scripts/generate-embeddings.mjs
 *
 * Requires:
 *   SUPABASE_URL  or VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY
 *   GEMINI_API_KEY   (primary)
 *   OPENAI_API_KEY   (fallback, optional)
 */

import { readFileSync } from 'fs';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BATCH_SIZE = 100;
const GEMINI_RPM_LIMIT = 50;
const MIN_DELAY_MS = Math.ceil(60_000 / GEMINI_RPM_LIMIT); // 1200ms
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;
const EMBEDDING_DIMENSIONS = 768;

const GEMINI_EMBEDDING_MODEL = 'gemini-embedding-001';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';
const OPENAI_API_BASE = 'https://api.openai.com/v1/embeddings';
const OPENAI_DIMENSIONS = 768; // text-embedding-3-small supports custom dims

// ---------------------------------------------------------------------------
// Env loader
// ---------------------------------------------------------------------------

function loadEnvFile() {
  try {
    const text = readFileSync('.env', 'utf-8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env nicht gefunden
  }
}

function getEnv(key, ...fallbackKeys) {
  const val = process.env[key];
  if (val) return val;
  for (const k of fallbackKeys) {
    const v = process.env[k];
    if (v) return v;
  }
  return null;
}

function requireEnv(key, ...fallbackKeys) {
  const val = getEnv(key, ...fallbackKeys);
  if (!val) throw new Error(`Missing env: ${key} (or ${fallbackKeys.join(', ')})`);
  return val;
}

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------

async function fetchRowsWithoutEmbedding(supabaseUrl, serviceKey, limit) {
  const url = `${supabaseUrl}/rest/v1/dream_reports?select=id,text&embedding=is.null&limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase fetch failed: ${res.status} ${body.slice(0, 300)}`);
  }
  return res.json();
}

async function updateEmbedding(supabaseUrl, serviceKey, id, embedding, attempt = 1) {
  const url = `${supabaseUrl}/rest/v1/dream_reports?id=eq.${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
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

async function generateEmbeddingGemini(apiKey, text, attempt = 1) {
  const url = `${GEMINI_API_BASE}/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${apiKey}`;
  const truncated = text.length > 8000 ? text.slice(0, 8000) : text;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${GEMINI_EMBEDDING_MODEL}`,
      content: { parts: [{ text: truncated }] },
    }),
  });

  if (res.status === 429 || res.status === 403) {
    if (attempt < MAX_RETRIES) {
      const waitMs = RETRY_DELAY_MS * attempt;
      console.warn(`  Gemini ${res.status}. Retry in ${waitMs}ms...`);
      await sleep(waitMs);
      return generateEmbeddingGemini(apiKey, text, attempt + 1);
    }
    throw new Error(`Gemini ${res.status} after ${MAX_RETRIES} retries`);
  }

  if (!res.ok) {
    const body = await res.text();
    if (attempt < MAX_RETRIES) {
      console.warn(`  Gemini error (attempt ${attempt}): ${res.status}`);
      await sleep(RETRY_DELAY_MS * attempt);
      return generateEmbeddingGemini(apiKey, text, attempt + 1);
    }
    throw new Error(`Gemini embedding failed: ${res.status} ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const values = data?.embedding?.values;
  if (!values || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Unexpected Gemini dims: ${values?.length ?? 0}, expected ${EMBEDDING_DIMENSIONS}`);
  }
  return values;
}

// ---------------------------------------------------------------------------
// OpenAI embedding (fallback)
// ---------------------------------------------------------------------------

async function generateEmbeddingOpenAI(apiKey, text, attempt = 1) {
  const truncated = text.length > 8000 ? text.slice(0, 8000) : text;

  const res = await fetch(OPENAI_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: truncated,
      dimensions: OPENAI_DIMENSIONS,
    }),
  });

  if (res.status === 429) {
    if (attempt < MAX_RETRIES) {
      const waitMs = RETRY_DELAY_MS * attempt;
      console.warn(`  OpenAI rate limited. Retry in ${waitMs}ms...`);
      await sleep(waitMs);
      return generateEmbeddingOpenAI(apiKey, text, attempt + 1);
    }
    throw new Error(`OpenAI rate limit after ${MAX_RETRIES} retries`);
  }

  if (!res.ok) {
    const body = await res.text();
    if (attempt < MAX_RETRIES) {
      console.warn(`  OpenAI error (attempt ${attempt}): ${res.status}`);
      await sleep(RETRY_DELAY_MS * attempt);
      return generateEmbeddingOpenAI(apiKey, text, attempt + 1);
    }
    throw new Error(`OpenAI embedding failed: ${res.status} ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const values = data?.data?.[0]?.embedding;
  if (!values || values.length !== OPENAI_DIMENSIONS) {
    throw new Error(`Unexpected OpenAI dims: ${values?.length ?? 0}, expected ${OPENAI_DIMENSIONS}`);
  }
  return values;
}

// ---------------------------------------------------------------------------
// Zero placeholder
// ---------------------------------------------------------------------------

function generateZeroEmbedding() {
  return new Array(EMBEDDING_DIMENSIONS).fill(0);
}

// ---------------------------------------------------------------------------
// Fallback chain: Gemini → OpenAI → Zeros
// ---------------------------------------------------------------------------

async function generateEmbedding(geminiKeys, openaiKey, text) {
  // Try all Gemini keys
  for (const gk of geminiKeys) {
    try {
      return { values: await generateEmbeddingGemini(gk, text), provider: 'gemini' };
    } catch (err) {
      console.warn(`  Gemini key ...${gk.slice(-6)} failed: ${err.message.slice(0, 80)}`);
    }
  }

  // Try OpenAI
  if (openaiKey) {
    try {
      return { values: await generateEmbeddingOpenAI(openaiKey, text), provider: 'openai' };
    } catch (err) {
      console.warn(`  OpenAI failed: ${err.message.slice(0, 80)}`);
    }
  }

  // Last resort: zeros
  console.warn('  All providers failed → using zero placeholder');
  return { values: generateZeroEmbedding(), provider: 'zeros' };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function formatDuration(ms) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

async function countPendingRows(supabaseUrl, serviceKey) {
  const url = `${supabaseUrl}/rest/v1/dream_reports?select=id&embedding=is.null`;
  const res = await fetch(url, {
    method: 'HEAD',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'count=exact',
    },
  });
  if (!res.ok) return -1;
  const countHeader = res.headers.get('content-range');
  if (!countHeader) return -1;
  const total = parseInt(countHeader.split('/')[1] ?? '', 10);
  return isNaN(total) ? -1 : total;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  loadEnvFile();

  const SUPABASE_URL = requireEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
  const SUPABASE_SERVICE_KEY = requireEnv('SUPABASE_SERVICE_KEY', 'SUPABASE_SERVICE_ROLE_KEY');

  // Collect all Gemini keys
  const geminiKeys = [];
  const gk1 = getEnv('GEMINI_API_KEY');
  if (gk1) geminiKeys.push(gk1);
  for (let i = 2; i <= 4; i++) {
    const k = getEnv(`VITE_GEMINI_API_KEY_${i}`);
    if (k) geminiKeys.push(k);
  }
  const viteGk = getEnv('VITE_GEMINI_API_KEY');
  if (viteGk && !geminiKeys.includes(viteGk)) geminiKeys.push(viteGk);

  const openaiKey = getEnv('OPENAI_API_KEY', 'VITE_OPENAI_API_KEY');

  console.log('Generate Embeddings — Fallback Chain');
  console.log('====================================');
  console.log(`Gemini keys : ${geminiKeys.length}`);
  console.log(`OpenAI key  : ${openaiKey ? 'vorhanden' : 'NICHT vorhanden'}`);
  console.log(`Fallback    : Gemini → ${openaiKey ? 'OpenAI → ' : ''}Zeros`);
  console.log(`Dimensions  : ${EMBEDDING_DIMENSIONS}`);
  console.log(`Batch size  : ${BATCH_SIZE}`);
  console.log();

  if (geminiKeys.length === 0 && !openaiKey) {
    console.warn('WARNUNG: Kein API-Key vorhanden. Alle Embeddings werden Zeros!');
    console.log();
  }

  // Count pending
  const pending = await countPendingRows(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  if (pending === 0) {
    console.log('Alle Rows haben bereits Embeddings. Nichts zu tun.');
    process.exit(0);
  }
  if (pending > 0) {
    const est = Math.ceil(pending / GEMINI_RPM_LIMIT);
    console.log(`Pending rows: ${pending}`);
    console.log(`Geschaetzte Zeit bei ${GEMINI_RPM_LIMIT} req/min: ~${formatDuration(est * 60_000)}`);
    console.log();
  }

  // Process in cycles
  let totalProcessed = 0;
  let totalErrors = 0;
  let providerStats = { gemini: 0, openai: 0, zeros: 0 };
  let cycle = 0;

  while (true) {
    cycle++;
    console.log(`Cycle ${cycle}: lade bis zu ${BATCH_SIZE} Rows...`);

    const rows = await fetchRowsWithoutEmbedding(SUPABASE_URL, SUPABASE_SERVICE_KEY, BATCH_SIZE);
    if (rows.length === 0) {
      console.log('Keine weiteren Rows ohne Embedding.');
      break;
    }

    console.log(`  ${rows.length} Rows gefunden. Verarbeite...`);
    const cycleStart = Date.now();
    let cycleErrors = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      process.stdout.write(`  [${i + 1}/${rows.length}] id=${row.id.slice(0, 8)}... `);

      try {
        const { values, provider } = await generateEmbedding(geminiKeys, openaiKey, row.text);
        await updateEmbedding(SUPABASE_URL, SUPABASE_SERVICE_KEY, row.id, values);
        providerStats[provider]++;
        totalProcessed++;
        console.log(`OK (${provider})`);
      } catch (err) {
        totalErrors++;
        cycleErrors++;
        console.log(`ERROR: ${err.message.slice(0, 100)}`);
      }

      // Rate limiting
      if (i < rows.length - 1) {
        await sleep(MIN_DELAY_MS);
      }
    }

    const cycleMs = Date.now() - cycleStart;
    console.log(`  Cycle ${cycle} done in ${formatDuration(cycleMs)}. OK: ${rows.length - cycleErrors}, Errors: ${cycleErrors}`);
    console.log(`  Total: ${totalProcessed} | Gemini: ${providerStats.gemini} | OpenAI: ${providerStats.openai} | Zeros: ${providerStats.zeros} | Errors: ${totalErrors}`);
    console.log();
  }

  console.log('====================================');
  console.log(`Fertig. Total: ${totalProcessed}`);
  console.log(`Provider: Gemini=${providerStats.gemini}, OpenAI=${providerStats.openai}, Zeros=${providerStats.zeros}`);
  if (totalErrors > 0) {
    console.log(`Errors: ${totalErrors} (Rows haben weiterhin embedding=null)`);
    console.log('Erneut starten um fehlgeschlagene Rows zu verarbeiten.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
