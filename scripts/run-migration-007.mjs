#!/usr/bin/env node
/**
 * Fuehrt Migration 007 direkt via Supabase REST API aus
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import 'dotenv/config';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Missing env vars'); process.exit(1); }

const supabase = createClient(url, key);

const sql = readFileSync('supabase/migrations/007_research_schema.sql', 'utf-8');

// Split by semicolons and run each statement
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`Fuehre ${statements.length} SQL-Statements aus...\n`);

let success = 0;
let errors = 0;

for (const stmt of statements) {
  const shortDesc = stmt.substring(0, 80).replace(/\n/g, ' ');
  try {
    const { error } = await supabase.rpc('exec_sql', { query: stmt });
    if (error) {
      // Try direct REST API approach
      const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({ query: stmt }),
      });
      if (!res.ok) {
        // Fallback: use pg directly through supabase's sql endpoint
        throw new Error(error.message);
      }
    }
    console.log(`  ✅ ${shortDesc}...`);
    success++;
  } catch (err) {
    console.log(`  ⚠️  ${shortDesc}... → ${err.message}`);
    errors++;
  }
}

console.log(`\n${success} OK, ${errors} Fehler/Uebersprungen`);
console.log('Versuche Alternative via SQL HTTP...');

// Alternative: Use Supabase SQL HTTP API
const fullSql = readFileSync('supabase/migrations/007_research_schema.sql', 'utf-8');
try {
  const res = await fetch(`${url}/pg`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({ query: fullSql }),
  });
  if (res.ok) {
    console.log('✅ Migration komplett via SQL HTTP API');
  } else {
    const text = await res.text();
    console.log(`SQL HTTP API: ${res.status} — ${text.substring(0, 200)}`);
  }
} catch (e) {
  console.log(`SQL HTTP nicht verfuegbar: ${e.message}`);
}
