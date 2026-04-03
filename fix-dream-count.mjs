import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// .env manuell lesen
const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Alle Teilnehmer laden (paginiert)
let allParticipants = [];
let from = 0;
const PAGE = 1000;
while (true) {
  const { data, error } = await supabase
    .from('research_participants')
    .select('id, participant_id')
    .range(from, from + PAGE - 1);
  if (error) { console.error('Fehler beim Laden:', error.message); break; }
  if (!data || data.length === 0) break;
  allParticipants.push(...data);
  if (data.length < PAGE) break;
  from += PAGE;
}
console.log('Teilnehmer geladen:', allParticipants.length);

// Alle Traeume laden und zaehlen
let dreamCounts = {};
from = 0;
while (true) {
  const { data, error } = await supabase
    .from('research_dreams')
    .select('participant_id')
    .range(from, from + PAGE - 1);
  if (error) { console.error('Fehler beim Laden der Traeume:', error.message); break; }
  if (!data || data.length === 0) break;
  for (const d of data) {
    dreamCounts[d.participant_id] = (dreamCounts[d.participant_id] || 0) + 1;
  }
  if (data.length < PAGE) break;
  from += PAGE;
}
console.log('Traeume gezaehlt, unique participant_ids:', Object.keys(dreamCounts).length);

let updated = 0;
let errors = 0;

// Batch-Update: 50 gleichzeitig
const BATCH = 50;
for (let i = 0; i < allParticipants.length; i += BATCH) {
  const batch = allParticipants.slice(i, i + BATCH);
  const promises = batch.map(p => {
    const count = dreamCounts[p.participant_id] || 0;
    return supabase
      .from('research_participants')
      .update({ dream_count: count })
      .eq('id', p.id)
      .then(({ error }) => {
        if (error) { errors++; } else { updated++; }
      });
  });
  await Promise.all(promises);
  if ((i + BATCH) % 500 < BATCH) console.log('Progress:', Math.min(i + BATCH, allParticipants.length));
}

console.log('FERTIG:', updated, 'aktualisiert,', errors, 'Fehler');
