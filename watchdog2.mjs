import { readFileSync } from 'fs';

console.log('WATCHDOG 2 — APP CODE\n' + '='.repeat(40));

const profile = readFileSync('components/ParticipantProfile.tsx', 'utf8');
const dreammap = readFileSync('components/DreamMap.tsx', 'utf8');

let fails = 0;
function check(ok, label) {
  console.log(ok ? '\u2705' : '\u274C', label);
  if (!ok) fails++;
}

// ParticipantProfile Checks
console.log('\nParticipantProfile.tsx:');
check(profile.includes("'research_participants'"), 'Laedt research_participants');
check(profile.includes("'research_dreams'"), 'Laedt research_dreams');
check(profile.includes("'research_interpretations'") || profile.includes('interpretation:research_interpretations'), 'Laedt research_interpretations');
check(profile.includes('dream_text'), 'Zeigt dream_text');
check(profile.includes('dream_date'), 'Zeigt dream_date');
check(profile.includes('participant_id'), 'Nutzt participant_id');
check(profile.includes('dream_id'), 'Nutzt dream_id');
check(!profile.includes("'Anonim'"), 'Kein Fake "Anonim"');
check(!profile.includes("'gizli'"), 'Kein Fake "gizli"');
check(!profile.includes('Lorem ipsum'), 'Kein Lorem ipsum');

// DreamMap Checks
console.log('\nDreamMap.tsx:');
check(dreammap.includes("'research_participants'"), 'Laedt research_participants');
check(!dreammap.includes("'Sage Z'"), 'Kein Fake "Sage Z"');
check(!dreammap.includes("'River E'"), 'Kein Fake "River E"');

// Join-Syntax Checks (nach Umbau)
console.log('\nJoin-Syntax:');
check(profile.includes('study:research_studies'), 'Participant-Study Join vorhanden');
check(profile.includes('interpretation:research_interpretations'), 'Dream-Interpretation Join vorhanden');

console.log('\n' + '='.repeat(40));
if (fails > 0) {
  console.log(`\u274C ${fails} FEHLER gefunden`);
  process.exit(1);
} else {
  console.log('\u2705 Alle Checks bestanden');
}
