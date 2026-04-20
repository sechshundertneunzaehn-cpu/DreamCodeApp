import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env','utf8').split('\n')
  .filter(l => l.includes('=') && !l.startsWith('#'))
  .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);

const s = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

console.log('SCHEMA-VERIFIKATION\n' + '='.repeat(50));

// Query A: Participant + Study Join
const { data: pTest, error: pErr } = await s
  .from('research_participants')
  .select('*, study:research_studies(*)')
  .limit(1)
  .single();

if (pErr) console.log('QUERY A FEHLER:', pErr.message);
else {
  console.log('\nQUERY A — research_participants + study join');
  console.log('Top-Level Keys:', Object.keys(pTest));
  console.log('study ist:', pTest.study === null ? 'null' : typeof pTest.study);
  console.log('study Keys:', pTest.study ? Object.keys(pTest.study) : 'N/A');
  console.log('Beispiel participant_id:', pTest.participant_id);
}

// Query B: Dreams + Interpretation Join
const pid = pTest?.participant_id;
const { data: dTest, error: dErr } = await s
  .from('research_dreams')
  .select('*, interpretation:research_interpretations(*)')
  .eq('participant_id', pid)
  .order('dream_date', { ascending: true })
  .limit(5);

if (dErr) console.log('QUERY B FEHLER:', dErr.message);
else {
  console.log('\nQUERY B — research_dreams + interpretation join');
  console.log('Anzahl Traeume:', dTest.length);
  if (dTest.length > 0) {
    console.log('Dream Keys:', Object.keys(dTest[0]));
    const interp = dTest[0].interpretation;
    console.log('interpretation Typ:', interp === null ? 'null' : Array.isArray(interp) ? 'Array' : typeof interp);
    if (interp && !Array.isArray(interp)) console.log('interpretation Keys:', Object.keys(interp));
    if (Array.isArray(interp) && interp.length > 0) console.log('interpretation[0] Keys:', Object.keys(interp[0]));

    // Check alle Dreams ob interpretation Array oder Objekt
    for (const d of dTest) {
      const i = d.interpretation;
      const typ = i === null ? 'null' : Array.isArray(i) ? `Array[${i.length}]` : 'Object';
      console.log(`  ${d.dream_id}: interpretation=${typ}`);
    }
  }
}

// Query C: Dream OHNE Interpretation (Null-Fall pruefen)
const { data: noInterp } = await s
  .from('research_dreams')
  .select('dream_id, interpretation:research_interpretations(*)')
  .is('scientific_interpretation', null)
  .limit(3);

if (noInterp) {
  console.log('\nQUERY C — Dreams ohne Interpretation');
  for (const d of noInterp) {
    const i = d.interpretation;
    const typ = i === null ? 'null' : Array.isArray(i) ? `Array[${i.length}]` : 'Object';
    console.log(`  ${d.dream_id}: interpretation=${typ}`);
  }
}

console.log('\n' + '='.repeat(50) + '\nFERTIG');
