import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env','utf8').split('\n')
  .filter(l => l.includes('=') && !l.startsWith('#'))
  .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);
const s = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

console.log('\n🔗 INTERPRETATION SYNC CHECK\n' + '═'.repeat(50));

// 1. Alle Deutungen laden
const { data: allInterps, count: interpCount } = await s
  .from('research_interpretations')
  .select('dream_id, participant_id', { count: 'exact' });

console.log(`Deutungen gesamt: ${interpCount}`);

// 2. Unique dream_ids und participant_ids
const interpDreamIds = new Set((allInterps || []).map(i => i.dream_id));
const interpParticipantIds = new Set((allInterps || []).map(i => i.participant_id));
console.log(`Unique dream_ids in Deutungen: ${interpDreamIds.size}`);
console.log(`Unique participant_ids in Deutungen: ${interpParticipantIds.size}`);

// 3. Prüfe: Haben alle dream_ids in research_interpretations ein Match in research_dreams?
let orphanCount = 0;
const batchSize = 100;
const dreamIdArray = [...interpDreamIds];

for (let i = 0; i < dreamIdArray.length; i += batchSize) {
  const batch = dreamIdArray.slice(i, i + batchSize);
  const { data: found } = await s
    .from('research_dreams')
    .select('id')
    .in('id', batch);
  const foundIds = new Set((found || []).map(f => f.id));
  for (const did of batch) {
    if (!foundIds.has(did)) orphanCount++;
  }
}

console.log(`\nVerwaiste Deutungen (dream_id ohne Dream): ${orphanCount}`);
if (orphanCount > 0) {
  console.log('  ⚠️ Diese Deutungen verweisen auf nicht-existierende Träume');
}

// 4. Prüfe: Haben alle participant_ids in research_interpretations ein Match?
let orphanPids = 0;
const pidArray = [...interpParticipantIds];

for (let i = 0; i < pidArray.length; i += batchSize) {
  const batch = pidArray.slice(i, i + batchSize);
  const { data: found } = await s
    .from('research_participants')
    .select('participant_id')
    .in('participant_id', batch);
  const foundPids = new Set((found || []).map(f => f.participant_id));
  for (const pid of batch) {
    if (!foundPids.has(pid)) orphanPids++;
  }
}

console.log(`Verwaiste Deutungen (participant_id ohne Teilnehmer): ${orphanPids}`);

// 5. Stichprobe: Teilnehmer mit meisten Deutungen
const pidCounts = {};
for (const i of allInterps || []) {
  pidCounts[i.participant_id] = (pidCounts[i.participant_id] || 0) + 1;
}
const topPids = Object.entries(pidCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

console.log('\nTop 5 Teilnehmer nach Deutungsanzahl:');
for (const [pid, count] of topPids) {
  const { count: dreamCount } = await s
    .from('research_dreams')
    .select('id', { count: 'exact', head: true })
    .eq('participant_id', pid);
  console.log(`  ${pid}: ${count} Deutungen / ${dreamCount} Träume (${Math.round(count/dreamCount*100)}%)`);
}

console.log('\n' + '═'.repeat(50));
console.log(orphanCount === 0 && orphanPids === 0 ? '✅ SYNC OK' : '⚠️ INKONSISTENZEN GEFUNDEN');
console.log('═'.repeat(50) + '\n');
