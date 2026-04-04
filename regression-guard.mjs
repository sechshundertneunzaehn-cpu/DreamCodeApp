import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);
const s = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

let pass = 0;
let fail = 0;
let warn = 0;

const ok = (msg) => { console.log('\u2705', msg); pass++; };
const ko = (msg) => { console.log('\u274C', msg); fail++; };
const wn = (msg) => { console.log('\u26A0\uFE0F', msg); warn++; };

console.log('\n\uD83D\uDEE1\uFE0F  REGRESSION GUARD v1.0');
console.log('='.repeat(60));

// ═══════════════════════════════════════════════════
// PHASE A — Static Code Analysis (no network)
// ═══════════════════════════════════════════════════
console.log('\n--- PHASE A: Code-Analyse ---\n');

const profile = readFileSync('components/ParticipantProfile.tsx', 'utf8');
const dreammap = readFileSync('components/DreamMap.tsx', 'utf8');

// Required strings in ParticipantProfile
const profileRequired = [
  ["'research_participants'", 'Laedt research_participants'],
  ["'research_dreams'", 'Laedt research_dreams'],
  ['research_interpretations', 'Laedt research_interpretations'],
  ['dream_text', 'Nutzt dream_text'],
  ['dream_date', 'Nutzt dream_date'],
  ['participant_id', 'Nutzt participant_id'],
  ['dream_id', 'Nutzt dream_id'],
  ['Array.isArray', 'E005: Array.isArray Check'],
  ['study:research_studies', 'Participant-Study Join'],
  ['interpretation:research_interpretations', 'Dream-Interpretation Join'],
];

for (const [str, label] of profileRequired) {
  profile.includes(str) ? ok(`Profile: ${label}`) : ko(`Profile: ${label} FEHLT`);
}

// Forbidden strings in ParticipantProfile
const profileForbidden = [
  ["'Anonim'", 'E007: Fake Anonim'],
  ["'gizli'", 'E007: Fake gizli'],
  ['Lorem ipsum', 'Fake Lorem ipsum'],
  ['participant_code', 'E002: participant_code statt participant_id'],
  ['slice(0, 100)', 'E010: Text-Abschneiden'],
  ['slice(0,100)', 'E010: Text-Abschneiden'],
];

for (const [str, label] of profileForbidden) {
  !profile.includes(str) ? ok(`Profile: kein ${label}`) : ko(`Profile: ${label} GEFUNDEN!`);
}

// DreamMap checks
!dreammap.includes("'Sage Z'") && !dreammap.includes("'River E'")
  ? ok('DreamMap: keine Fake-Namen (E001)')
  : ko('DreamMap: FAKE-NAMEN GEFUNDEN (E001)');

dreammap.includes("'research_participants'")
  ? ok('DreamMap: laedt echte Daten')
  : ko('DreamMap: kein research_participants');

!dreammap.includes('isDemoMode') && !dreammap.includes('DEMO_MODE')
  ? ok('DreamMap: kein Demo-Modus (E009)')
  : ko('DreamMap: DEMO-MODUS AKTIV (E009)');

// ScientificDreamMap globe check
try {
  const sciMap = readFileSync('components/ScientificDreamMap.tsx', 'utf8');
  sciMap.includes("projection") && sciMap.includes("globe")
    ? ok('ScientificDreamMap: globe projection (E006)')
    : ko('ScientificDreamMap: KEINE GLOBE PROJECTION (E006)');
} catch {
  wn('ScientificDreamMap.tsx nicht gefunden');
}

// ═══════════════════════════════════════════════════
// PHASE B — Database Runtime Checks
// ═══════════════════════════════════════════════════
console.log('\n--- PHASE B: Datenbank ---\n');

const [stRes, ptRes, drRes, itRes] = await Promise.all([
  s.from('research_studies').select('id', { count: 'exact', head: true }),
  s.from('research_participants').select('id', { count: 'exact', head: true }),
  s.from('research_dreams').select('id', { count: 'exact', head: true }),
  s.from('research_interpretations').select('id', { count: 'exact', head: true }),
]);

stRes.count >= 99 ? ok(`Studien: ${stRes.count}`) : ko(`Studien: ${stRes.count} < 99`);
ptRes.count >= 15776 ? ok(`Teilnehmer: ${ptRes.count}`) : ko(`Teilnehmer: ${ptRes.count} < 15776`);
drRes.count >= 39075 ? ok(`Traeume: ${drRes.count}`) : ko(`Traeume: ${drRes.count} < 39075`);
itRes.count > 0 ? ok(`Deutungen: ${itRes.count}`) : ko(`Deutungen: ${itRes.count} = 0`);

// 5 Specific Profile Checks
console.log('\n--- PHASE C: Profil-Checks ---\n');

const testIds = [
  'SDDB-017-P0293',
  'SDDB-025-P0002',
  'SDDB-030-P0001',
  'SDDB-069-P0001',
  'SDDB-043-P0218',
];

for (const pid of testIds) {
  const { data: p, error: pErr } = await s
    .from('research_participants')
    .select('participant_id, dream_count, study:research_studies(study_name, principal_investigator)')
    .eq('participant_id', pid)
    .single();

  if (pErr || !p) {
    ko(`${pid}: nicht gefunden`);
    continue;
  }
  ok(`${pid}: gefunden | Studie: ${p.study?.study_name?.slice(0, 40)} | ${p.dream_count} Traeume`);

  // Check dreams have text
  const { data: dr } = await s
    .from('research_dreams')
    .select('id, dream_text')
    .eq('participant_id', pid)
    .limit(3);

  const textOk = dr?.every(d => d.dream_text && d.dream_text.length > 10);
  textOk ? ok(`${pid}: Traumtexte vorhanden`) : ko(`${pid}: Traeume ohne Text!`);

  // Check interpretations
  const { data: interps } = await s
    .from('research_interpretations')
    .select('id, content')
    .eq('participant_id', pid)
    .limit(3);

  if (interps && interps.length > 0) {
    ok(`${pid}: ${interps.length}+ Deutungen`);
  } else {
    wn(`${pid}: keine Deutungen`);
  }
}

// FK Integrity: interpretations -> dreams
console.log('\n--- PHASE D: FK-Integritaet ---\n');

const { data: interpSample } = await s
  .from('research_interpretations')
  .select('dream_id')
  .limit(20);

if (interpSample && interpSample.length > 0) {
  const checkIds = interpSample.map(i => i.dream_id);
  const { data: matchingDreams } = await s
    .from('research_dreams')
    .select('id')
    .in('id', checkIds);

  const matched = matchingDreams?.length || 0;
  matched === checkIds.length
    ? ok(`FK: ${matched}/${checkIds.length} Deutungen -> Traeume OK`)
    : wn(`FK: ${matched}/${checkIds.length} Deutungen -> Traeume`);
}

// dream_count accuracy
const { data: countCheck } = await s
  .from('research_participants')
  .select('participant_id, dream_count')
  .gt('dream_count', 0)
  .limit(3);

for (const p of countCheck || []) {
  const { count: realCount } = await s
    .from('research_dreams')
    .select('id', { count: 'exact', head: true })
    .eq('participant_id', p.participant_id);
  realCount === p.dream_count
    ? ok(`dream_count ${p.participant_id}: ${p.dream_count} = ${realCount}`)
    : wn(`dream_count ${p.participant_id}: ${p.dream_count} != ${realCount}`);
}

// ═══════════════════════════════════════════════════
// RESULT
// ═══════════════════════════════════════════════════
console.log('\n' + '='.repeat(60));
console.log(`ERGEBNIS: ${pass} \u2705 | ${fail} \u274C | ${warn} \u26A0\uFE0F`);
if (fail > 0) {
  console.log('\u274C NICHT FERTIG — Fehler beheben!');
  process.exit(1);
} else if (warn > 0) {
  console.log('\u26A0\uFE0F  OK mit Warnungen');
  process.exit(0);
} else {
  console.log('\u2705 ALLES OK — FERTIG!');
  process.exit(0);
}
