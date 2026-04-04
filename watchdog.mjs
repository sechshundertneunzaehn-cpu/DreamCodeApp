import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env','utf8').split('\n')
  .filter(l => l.includes('=') && !l.startsWith('#'))
  .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);

const s = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

console.log('\n🔍 WATCHDOG PRÜFUNG\n' + '═'.repeat(50));

const [studies, participants, dreams, interpretations] = await Promise.all([
  s.from('research_studies').select('id', {count:'exact', head:true}),
  s.from('research_participants').select('id', {count:'exact', head:true}),
  s.from('research_dreams').select('id', {count:'exact', head:true}),
  s.from('research_interpretations').select('id', {count:'exact', head:true}),
]);

const checks = [
  { name: 'Studien', actual: studies.count, expected: 99, critical: true },
  { name: 'Teilnehmer', actual: participants.count, expected: 15776, critical: true },
  { name: 'Träume', actual: dreams.count, expected: 39075, critical: true },
  { name: 'Deutungen', actual: interpretations.count, expected: null, critical: false },
];

let allOk = true;
for (const c of checks) {
  const ok = c.expected ? c.actual >= c.expected * 0.95 : c.actual > 0;
  const icon = ok ? '✅' : (c.critical ? '❌' : '⚠️');
  console.log(`${icon} ${c.name}: ${c.actual?.toLocaleString()}${c.expected ? ` / ${c.expected.toLocaleString()} erwartet` : ''}`);
  if (!ok && c.critical) allOk = false;
}

const { data: sample } = await s
  .from('research_participants')
  .select('participant_id, country, dream_count, study:research_studies(study_name, principal_investigator)')
  .limit(5);

console.log('\n📋 Stichprobe Teilnehmer:');
for (const p of sample || []) {
  const ok = p.participant_id && p.study?.study_name;
  console.log(`  ${ok?'✅':'❌'} ${p.participant_id} | ${p.study?.study_name?.slice(0,30)} | ${p.dream_count} Träume`);
}

const { data: dreamSample } = await s
  .from('research_dreams')
  .select('dream_id, dream_text, participant_id')
  .not('dream_text', 'is', null)
  .limit(3);

console.log('\n🌙 Stichprobe Träume:');
for (const d of dreamSample || []) {
  const ok = d.dream_text && d.dream_text.length > 10 && d.participant_id;
  console.log(`  ${ok?'✅':'❌'} ${d.dream_id} | ${d.dream_text?.slice(0,50)}...`);
}

console.log('\n🤖 Fake-Namen Check in DreamMap.tsx:');
try {
  const dreamMap = readFileSync('components/DreamMap.tsx', 'utf8');
  const fakeNames = ['Sage', 'River', 'Miro', 'Sky', 'Dream', 'Elif', 'Marie', 'Lena'];
  const found = fakeNames.filter(n => dreamMap.includes(`name:'${n}`) || dreamMap.includes(`name: '${n}`));
  if (found.length > 0) {
    console.log(`  ❌ Fake-Namen gefunden: ${found.join(', ')}`);
    allOk = false;
  } else {
    console.log('  ✅ Keine Fake-Namen in DreamMap');
  }
} catch(e) {
  console.log('  ⚠️ DreamMap nicht prüfbar');
}

// --- Deutungs-Stichprobe: UUID vs String-ID Check ---
console.log('\n💡 Deutungs-Stichprobe (Key-Mismatch-Diagnose):');
const { data: interpSample } = await s
  .from('research_interpretations')
  .select('id, dream_id, participant_id, content')
  .limit(3);

for (const i of interpSample || []) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(i.dream_id || '');
  const isStringId = /^SDDB-/.test(i.dream_id || '');
  console.log(`  dream_id: ${i.dream_id?.slice(0,40)} | UUID: ${isUuid} | String-ID: ${isStringId} | content: ${i.content?.slice(0,40)}...`);
}

// --- Verknuepfungs-Check: Deutungen <-> Traeume Konsistenz ---
console.log('\n🔗 Verknuepfungs-Check (Deutungen <-> Traeume):');
const { data: interpSampleForCheck } = await s
  .from('research_interpretations')
  .select('dream_id')
  .limit(10);

if (interpSampleForCheck && interpSampleForCheck.length > 0) {
  const checkIds = interpSampleForCheck.map(i => i.dream_id);
  const { data: matchingDreams } = await s
    .from('research_dreams')
    .select('id')
    .in('id', checkIds);

  const matched = matchingDreams?.length || 0;
  console.log(`  ${matched}/${checkIds.length} Deutungen haben gueltige dream_id (UUID-Match)`);
  if (matched === checkIds.length) {
    console.log('  ✅ Alle Deutungen verweisen auf existierende Traeume');
  } else {
    console.log('  ⚠️ Einige Deutungen verweisen auf nicht-existierende Traeume');
  }
}

// --- Profil-Query Test ---
console.log('\n👤 Profil-Query Test (SDDB-069-P0001):');
const { data: testP, error: testPErr } = await s
  .from('research_participants')
  .select('id, participant_id, country, age, gender, dream_count, study:research_studies(study_name, principal_investigator)')
  .eq('participant_id', 'SDDB-069-P0001')
  .single();

if (testPErr) {
  console.log(`  ❌ Fehler: ${testPErr.message}`);
  allOk = false;
} else {
  console.log(`  ✅ ${testP.participant_id} | Studie: ${testP.study?.study_name?.slice(0,40)} | ${testP.dream_count} Traeume`);
}

// Traeume + Deutungen dieses Teilnehmers
const { data: testDreams } = await s
  .from('research_dreams')
  .select('id, dream_id, dream_text')
  .eq('participant_id', 'SDDB-069-P0001')
  .order('dream_date', { ascending: true })
  .limit(5);

const { data: testInterps } = await s
  .from('research_interpretations')
  .select('id, dream_id, content, tradition')
  .eq('participant_id', 'SDDB-069-P0001');

console.log(`  Traeume: ${testDreams?.length || 0} | Deutungen: ${testInterps?.length || 0}`);
if (testDreams && testInterps) {
  const interpDreamIds = new Set((testInterps).map(i => i.dream_id));
  for (const d of testDreams) {
    const matchUuid = interpDreamIds.has(d.id);
    const matchString = interpDreamIds.has(d.dream_id);
    console.log(`    ${d.dream_id?.slice(0,25)} | UUID-Match: ${matchUuid} | String-Match: ${matchString}`);
  }
}

console.log('\n' + '═'.repeat(50));
console.log(allOk ? '✅ ALLES OK' : '❌ PROBLEME GEFUNDEN');
console.log('═'.repeat(50) + '\n');
