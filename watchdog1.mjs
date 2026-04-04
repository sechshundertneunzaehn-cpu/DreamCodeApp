import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env','utf8').split('\n')
  .filter(l => l.includes('=') && !l.startsWith('#'))
  .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);

const s = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

console.log('WATCHDOG 1 — DATENBANK\n' + '='.repeat(40));

// Row-Counts
const [a, b, c, d] = await Promise.all([
  s.from('research_studies').select('id', { count: 'exact', head: true }),
  s.from('research_participants').select('id', { count: 'exact', head: true }),
  s.from('research_dreams').select('id', { count: 'exact', head: true }),
  s.from('research_interpretations').select('id', { count: 'exact', head: true }),
]);

let fails = 0;
function check(ok, label) {
  console.log(ok ? '\u2705' : '\u274C', label);
  if (!ok) fails++;
}

check(a.count >= 99, `Studien: ${a.count} (erwartet >= 99)`);
check(b.count >= 15776, `Teilnehmer: ${b.count} (erwartet >= 15776)`);
check(c.count >= 39075, `Traeume: ${c.count} (erwartet >= 39075)`);
check(d.count > 0, `Deutungen: ${d.count} (erwartet > 0)`);

// Stichprobe: 3 Teilnehmer mit Traeumen und Deutungen
console.log('\nSTICHPROBE — Teilnehmer + Traeume + Deutungen');
const { data: sample } = await s
  .from('research_participants')
  .select('participant_id, dream_count, country, study_id, study:research_studies(id)')
  .gt('dream_count', 0)
  .limit(3);

for (const p of sample || []) {
  const { data: dreams } = await s
    .from('research_dreams')
    .select('id, dream_text, dream_id')
    .eq('participant_id', p.participant_id)
    .limit(3);

  const { data: interps } = await s
    .from('research_interpretations')
    .select('id')
    .eq('participant_id', p.participant_id);

  console.log(`\n${p.participant_id} (${p.country}):`);
  // FK: study_id zeigt auf existierende Studie?
  check(p.study !== null, `  FK study_id verweist auf Studie`);
  // dream_count vs. tatsaechliche Anzahl
  const { count: realCount } = await s
    .from('research_dreams')
    .select('id', { count: 'exact', head: true })
    .eq('participant_id', p.participant_id);
  check(realCount === p.dream_count, `  dream_count=${p.dream_count} vs. real=${realCount}`);
  // Traumtexte vorhanden?
  for (const dr of dreams || []) {
    const textOk = dr.dream_text && dr.dream_text.length > 10;
    check(textOk, `  Text: ${dr.dream_text?.slice(0, 60)}...`);
  }
  console.log(`  Deutungen: ${interps?.length || 0}`);
}

console.log('\n' + '='.repeat(40));
if (fails > 0) {
  console.log(`\u274C ${fails} FEHLER gefunden`);
  process.exit(1);
} else {
  console.log('\u2705 Alle Checks bestanden');
}
