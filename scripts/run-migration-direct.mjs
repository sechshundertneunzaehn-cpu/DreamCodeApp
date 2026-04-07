#!/usr/bin/env node
import pg from 'pg';
import { readFileSync } from 'fs';
import 'dotenv/config';

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ref = url.replace('https://', '').split('.')[0];
const sql = readFileSync('supabase/migrations/007_research_schema.sql', 'utf-8');

// Try multiple connection strategies
const configs = [
  {
    name: 'Direct (5432)',
    host: `db.${ref}.supabase.co`,
    port: 5432,
    user: 'postgres',
    password: serviceKey,
  },
  {
    name: 'Pooler Session (5432)',
    host: `aws-0-eu-central-1.pooler.supabase.com`,
    port: 5432,
    user: `postgres.${ref}`,
    password: serviceKey,
  },
  {
    name: 'Pooler Transaction (6543)',
    host: `aws-0-eu-central-1.pooler.supabase.com`,
    port: 6543,
    user: `postgres.${ref}`,
    password: serviceKey,
  },
];

for (const cfg of configs) {
  console.log(`\nVersuche ${cfg.name}...`);
  const pool = new pg.Pool({
    host: cfg.host,
    port: cfg.port,
    database: 'postgres',
    user: cfg.user,
    password: cfg.password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    console.log(`✅ Verbunden via ${cfg.name}`);

    // Run full migration as one query
    await client.query(sql);
    console.log('✅ Migration komplett ausgefuehrt!');

    // Verify tables exist
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('research_studies','research_participants','research_dreams','study_map_markers')
      ORDER BY table_name
    `);
    console.log(`Tabellen erstellt: ${rows.map(r => r.table_name).join(', ')}`);

    client.release();
    await pool.end();
    process.exit(0);
  } catch (e) {
    console.log(`❌ ${cfg.name}: ${e.message}`);
    try { await pool.end(); } catch {}
  }
}

console.log('\n❌ Alle Verbindungsmethoden fehlgeschlagen.');
console.log(`Bitte fuehre manuell aus:`);
console.log(`  1. Oeffne: https://supabase.com/dashboard/project/${ref}/sql/new`);
console.log(`  2. Paste: supabase/migrations/007_research_schema.sql`);
console.log(`  3. Run`);
