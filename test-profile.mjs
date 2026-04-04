import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = Object.fromEntries(
  readFileSync('.env','utf8').split('\n')
  .filter(l=>l.includes('=') && !l.startsWith('#'))
  .map(l=>{ const i=l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);
const s = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

// Ersten Teilnehmer holen
const { data: p, error: pErr } = await s
  .from('research_participants')
  .select('*')
  .limit(1)
  .single();

console.log('=== TEILNEHMER ===');
console.log('Fehler:', pErr?.message || 'keiner');
console.log(JSON.stringify(p, null, 2));

// Seine Traeume holen
const { data: dreams, error } = await s
  .from('research_dreams')
  .select('*')
  .eq('participant_id', p.participant_id)
  .limit(3);

console.log('\n=== TRAEUME ===');
console.log('Fehler:', error?.message || 'keiner');
console.log('Anzahl:', dreams?.length);
console.log(JSON.stringify(dreams?.[0], null, 2));
