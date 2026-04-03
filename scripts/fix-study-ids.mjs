#!/usr/bin/env node
/**
 * Fix: study_id UUIDs in research_participants + research_dreams populieren
 * + dream_count korrigieren
 */
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Missing env vars'); process.exit(1); }
const supabase = createClient(url, key);

async function main() {
  console.log('=== Fix study_id UUIDs + dream_count ===\n');

  // 1. Lade alle Studien → Map study_code → UUID
  const { data: studies } = await supabase.from('research_studies').select('id, study_code');
  const codeToUuid = new Map();
  for (const s of studies) {
    codeToUuid.set(s.study_code, s.id);
  }
  console.log(`Studien geladen: ${codeToUuid.size}`);

  // 2. Update research_participants.study_id
  let pUpdated = 0;
  for (const [code, uuid] of codeToUuid) {
    const { count } = await supabase
      .from('research_participants')
      .update({ study_id: uuid })
      .eq('study_code', code)
      .is('study_id', null)
      .select('id', { count: 'exact', head: true });
    if (count > 0) pUpdated += count;
  }
  console.log(`research_participants study_id gesetzt: ${pUpdated}`);

  // 3. Update research_dreams.study_id
  let dUpdated = 0;
  for (const [code, uuid] of codeToUuid) {
    const { count } = await supabase
      .from('research_dreams')
      .update({ study_id: uuid })
      .eq('study_code', code)
      .is('study_id', null)
      .select('id', { count: 'exact', head: true });
    if (count > 0) dUpdated += count;
  }
  console.log(`research_dreams study_id gesetzt: ${dUpdated}`);

  // 4. dream_count korrigieren
  // Lade alle participant_ids und zaehle echte Traeume
  let dcFixed = 0;
  let offset = 0;
  const batch = 1000;

  while (true) {
    const { data: participants } = await supabase
      .from('research_participants')
      .select('id, participant_id, dream_count')
      .range(offset, offset + batch - 1);

    if (!participants || participants.length === 0) break;

    for (const p of participants) {
      const { count: realCount } = await supabase
        .from('research_dreams')
        .select('id', { count: 'exact', head: true })
        .eq('participant_id', p.participant_id);

      if (realCount !== p.dream_count) {
        await supabase
          .from('research_participants')
          .update({ dream_count: realCount })
          .eq('id', p.id);
        dcFixed++;
      }
    }

    offset += batch;
    if (offset % 5000 === 0) console.log(`  dream_count geprueft: ${offset}...`);
    if (participants.length < batch) break;
  }
  console.log(`dream_count korrigiert: ${dcFixed}`);

  // 5. Verifikation
  console.log('\n=== VERIFIKATION ===');
  const [vP, vD, vPnoStudy, vDnoStudy] = await Promise.all([
    supabase.from('research_participants').select('id', { count: 'exact', head: true }),
    supabase.from('research_dreams').select('id', { count: 'exact', head: true }),
    supabase.from('research_participants').select('id', { count: 'exact', head: true }).is('study_id', null),
    supabase.from('research_dreams').select('id', { count: 'exact', head: true }).is('study_id', null),
  ]);

  console.log(`Teilnehmer gesamt:          ${vP.count}`);
  console.log(`Teilnehmer ohne study_id:   ${vPnoStudy.count} ${vPnoStudy.count === 0 ? '✅' : '❌'}`);
  console.log(`Traeume gesamt:             ${vD.count}`);
  console.log(`Traeume ohne study_id:      ${vDnoStudy.count} ${vDnoStudy.count === 0 ? '✅' : '❌'}`);
  console.log(`dream_count Korrekturen:    ${dcFixed}`);
  console.log('\nFertig.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
