#!/usr/bin/env node
/**
 * Fuehrt Migration via Supabase Management API aus
 * Nutzt den /v1/projects/{ref}/database/query Endpoint
 */
import { readFileSync } from 'fs';
import 'dotenv/config';

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!url) { console.error('Missing VITE_SUPABASE_URL'); process.exit(1); }

const ref = url.replace('https://', '').split('.')[0];
console.log(`Project Ref: ${ref}`);

const sql = readFileSync('supabase/migrations/007_research_schema.sql', 'utf-8');

// Split into individual statements
const statements = sql
  .split(/;\s*$/m)
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

// Method 1: Try Management API (needs access token)
if (accessToken) {
  console.log('\nMethod 1: Management API...');
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    if (res.ok) {
      console.log('✅ Migration komplett via Management API');
      process.exit(0);
    }
    console.log(`Management API: ${res.status}`);
  } catch (e) {
    console.log(`Management API Fehler: ${e.message}`);
  }
}

// Method 2: Try postgrest-js with service role key
// The only way to execute DDL via REST is through an RPC function
// We need to first create the exec_sql function, but that itself requires DDL access...
// Chicken-and-egg problem.

// Method 3: Use direct Postgres connection via pooler
const dbUrl = `postgresql://postgres.${ref}:${serviceKey}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;
console.log('\nMethod 2: Direkte PostgreSQL Verbindung...');

// Try using fetch to the pg endpoint (Supabase v2)
try {
  const res = await fetch(`${url}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'X-Connection-Encrypted': '1',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (res.ok) {
    console.log('✅ Migration via pg/query erfolgreich');
    process.exit(0);
  }
  console.log(`pg/query: ${res.status} — ${text.substring(0, 200)}`);
} catch (e) {
  console.log(`pg/query nicht verfuegbar: ${e.message}`);
}

// Method 4: Try pg npm package
console.log('\nMethod 3: Versuche pg npm Paket...');
try {
  const { default: pg } = await import('pg');
  const pool = new pg.Pool({
    host: `aws-0-eu-central-1.pooler.supabase.com`,
    port: 6543,
    database: 'postgres',
    user: `postgres.${ref}`,
    password: process.env.SUPABASE_DB_PASSWORD || serviceKey,
    ssl: { rejectUnauthorized: false },
  });

  let ok = 0;
  let fail = 0;
  for (const stmt of statements) {
    try {
      await pool.query(stmt);
      ok++;
      const short = stmt.substring(0, 60).replace(/\n/g, ' ');
      console.log(`  ✅ ${short}...`);
    } catch (e) {
      fail++;
      const short = stmt.substring(0, 60).replace(/\n/g, ' ');
      console.log(`  ⚠️  ${short}... → ${e.message}`);
    }
  }
  await pool.end();
  console.log(`\n${ok} OK, ${fail} Fehler`);
  if (ok > 0) {
    console.log('✅ Migration (teilweise) erfolgreich via pg');
    process.exit(0);
  }
} catch (e) {
  console.log(`pg Paket: ${e.message}`);
}

console.log('\n❌ Keine automatische Methode verfuegbar.');
console.log('Bitte fuehre die Migration manuell aus:');
console.log('1. Oeffne https://supabase.com/dashboard/project/' + ref + '/sql/new');
console.log('2. Kopiere den Inhalt von supabase/migrations/007_research_schema.sql');
console.log('3. Klicke "Run"');
console.log('\nOder: supabase login && supabase db push');
