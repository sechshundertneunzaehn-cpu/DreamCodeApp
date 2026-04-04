#!/usr/bin/env node
/**
 * Diagnostik: Welche Studien haben total_dreams > 0 aber 0 importierte Daten?
 */
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Missing env vars'); process.exit(1); }
const supabase = createClient(url, key);

async function main() {
  // Alle Studien laden
  const { data: studies, error } = await supabase
    .from('research_studies')
    .select('id, study_code, study_name, total_dreams, participant_count')
    .order('study_code');

  if (error) { console.error('Error:', error.message); process.exit(1); }

  console.log(`\nGesamt Studien: ${studies.length}\n`);

  const missing = [];
  const withData = [];
  const noExpected = [];

  for (const s of studies) {
    const { count: pCount } = await supabase
      .from('research_participants')
      .select('*', { count: 'exact', head: true })
      .eq('study_code', s.study_code);

    const { count: dCount } = await supabase
      .from('research_dreams')
      .select('*', { count: 'exact', head: true })
      .eq('study_code', s.study_code);

    const entry = {
      code: s.study_code,
      name: s.study_name,
      expected: s.total_dreams || 0,
      participants: pCount || 0,
      dreams: dCount || 0,
    };

    if (entry.participants === 0 && entry.dreams === 0) {
      if (entry.expected > 0) {
        missing.push(entry);
      } else {
        noExpected.push(entry);
      }
    } else {
      withData.push(entry);
    }
  }

  console.log(`=== ${missing.length} STUDIEN MIT ERWARTETEN DATEN ABER 0 IMPORTIERT ===`);
  for (const m of missing) {
    console.log(`  ${m.code} | erwartet: ${m.expected} | ${m.name}`);
  }

  console.log(`\n=== ${noExpected.length} STUDIEN MIT 0 ERWARTETEN DATEN UND 0 IMPORTIERT ===`);
  for (const m of noExpected) {
    console.log(`  ${m.code} | ${m.name}`);
  }

  console.log(`\n=== ${withData.length} STUDIEN MIT IMPORTIERTEN DATEN ===`);
  let totalParticipants = 0, totalDreams = 0;
  for (const w of withData) {
    totalParticipants += w.participants;
    totalDreams += w.dreams;
  }
  console.log(`  Gesamt Teilnehmer: ${totalParticipants}`);
  console.log(`  Gesamt Traeume: ${totalDreams}`);

  console.log(`\n=== ZUSAMMENFASSUNG ===`);
  console.log(`  Studien gesamt:           ${studies.length}`);
  console.log(`  Mit Daten:                ${withData.length}`);
  console.log(`  Fehlend (erwartet > 0):   ${missing.length}`);
  console.log(`  Leer (erwartet = 0):      ${noExpected.length}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
