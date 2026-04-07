#!/usr/bin/env node
/**
 * Migrations-Runner: Fuehrt alle SQL-Dateien gegen Supabase aus
 * Nutzt die Supabase SQL API (Management API Workaround via pg HTTP)
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// .env laden
const envPath = join(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([A-Z_]+)=(.+)$/);
  if (match) env[match[1]] = match[2].trim();
}

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('FEHLER: VITE_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt in .env');
  process.exit(1);
}

// Alle SQL-Dateien sortiert laden
const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
const files = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`\n╔═══════════════════════════════════════╗`);
console.log(`║  MIGRATIONS-RUNNER                    ║`);
console.log(`║  ${files.length} Dateien gefunden                 ║`);
console.log(`╚═══════════════════════════════════════╝\n`);

// SQL via Supabase ausfuehren - nutze den pg-meta Endpunkt
async function runSQL(sql, filename) {
  // Methode 1: Supabase pg-meta query endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({})
  });

  // Methode 2: Nutze eine temporaere RPC-Funktion
  // Erst versuchen wir die direkte Query via pg REST
  // Supabase unterstuetzt raw SQL ueber den /pg/ Endpunkt (intern)

  // Fallback: Einzelne Statements ausfuehren via separate Anfragen
  return null;
}

// Hauptmethode: SQL ueber den pg-meta Admin-Endpunkt
async function executeMigration(sql, filename) {
  // Supabase hat einen internen SQL-Endpunkt fuer Admin-Operationen
  // Versuche verschiedene Endpunkte

  const endpoints = [
    // pg-meta endpoint (Supabase Studio nutzt diesen intern)
    { url: `${SUPABASE_URL}/pg/query`, method: 'POST' },
    // Alternative
    { url: `${SUPABASE_URL}/rest/v1/rpc/exec_sql`, method: 'POST' },
  ];

  // Versuch 1: Direkte pg-meta Query
  try {
    const res = await fetch(`${SUPABASE_URL.replace('.supabase.co', '.supabase.co')}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'x-connection-encrypted': 'true',
      },
      body: JSON.stringify({ query: sql })
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }

    const errorText = await res.text();

    // Wenn 404, versuche naechsten Endpunkt
    if (res.status === 404) {
      throw new Error('pg endpoint not available');
    }

    return { success: false, error: errorText };
  } catch (e) {
    // Fallback: Nutze postgres npm Package
    return null;
  }
}

// Fallback: Nutze das postgres Package
async function executeMigrationViaPg(sql, filename) {
  try {
    const pg = await import('postgres');
    const postgres = pg.default;

    // Supabase Direct Connection (Transaction Pooler)
    // Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
    const ref = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

    // Versuche Verbindung ueber Supabase Pooler mit Service Key als Auth
    // Der Transaction Pooler auf Port 6543 akzeptiert JWT-basierte Auth
    const connectionString = `postgresql://postgres.${ref}:${SERVICE_KEY}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;

    const client = postgres(connectionString, {
      ssl: 'require',
      connection: { application_name: 'dreamcode-migrations' },
      max: 1,
      idle_timeout: 10,
      connect_timeout: 15,
    });

    // SQL ausfuehren
    await client.unsafe(sql);
    await client.end();

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Haupt-Ablauf
async function main() {
  let successCount = 0;
  let failCount = 0;
  let usedMethod = '';

  for (const file of files) {
    const filepath = join(migrationsDir, file);
    const sql = readFileSync(filepath, 'utf-8');

    process.stdout.write(`  [${files.indexOf(file) + 1}/${files.length}] ${file} ... `);

    // Versuche pg-meta Endpunkt
    let result = await executeMigration(sql, file);

    if (result === null || !result.success) {
      // Fallback: postgres Package
      result = await executeMigrationViaPg(sql, file);
      usedMethod = 'postgres';
    } else {
      usedMethod = 'pg-meta';
    }

    if (result && result.success) {
      console.log(`✓ OK (${usedMethod})`);
      successCount++;
    } else {
      console.log(`✗ FEHLER`);
      console.log(`    ${result?.error || 'Unbekannter Fehler'}`);
      failCount++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Ergebnis: ${successCount} erfolgreich, ${failCount} fehlgeschlagen`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch(e => {
  console.error('FATALER FEHLER:', e.message);
  process.exit(1);
});
