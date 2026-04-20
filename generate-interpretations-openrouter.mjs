import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env','utf8').split('\n')
  .filter(l => l.includes('=') && !l.startsWith('#'))
  .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const OR_KEY = env.VITE_OPENROUTER_API_KEY;
if (!OR_KEY) { console.error('Kein OpenRouter Key in .env'); process.exit(1); }
console.log('OpenRouter Key vorhanden');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const LANG_MAP = {
  en:'English', de:'German', tr:'Turkish', ar:'Arabic',
  fr:'French', es:'Spanish', pt:'Portuguese', ru:'Russian',
};

async function interpretDream(dreamText, lang = 'en', retries = 2) {
  const langName = LANG_MAP[lang] || 'English';
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OR_KEY}`,
          'HTTP-Referer': 'https://dreamcodeapp.vercel.app',
          'X-Title': 'DreamCode Scientific Analysis'
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.6-plus:free',
          messages: [
            { role: 'system', content: `You are a scientific dream researcher. Analyze dreams objectively. Always respond in ${langName}. Maximum 3 sentences.` },
            { role: 'user', content: `Analyze this dream scientifically in 2-3 sentences. Focus on psychological themes, emotional significance, and common symbolism.\n\nDream: "${dreamText.slice(0,500)}"\n\nRespond ONLY with the analysis.` }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (res.status === 429) {
        console.warn(`[429] Rate limit, warte 3s (Versuch ${attempt+1})`);
        await sleep(3000);
        continue;
      }
      if (!res.ok) {
        const err = await res.text();
        console.error(`OpenRouter ${res.status}: ${err.slice(0,100)}`);
        if (attempt < retries) { await sleep(1000); continue; }
        return null;
      }
      const data = await res.json();
      return data?.choices?.[0]?.message?.content?.trim() || null;
    } catch(e) {
      console.error(`Fetch Fehler: ${e.message}`);
      if (attempt < retries) await sleep(1000);
    }
  }
  return null;
}

// --- Main ---
console.log('\nLade existierende Interpretationen...');
const existingIds = new Set();
let from = 0;
while (true) {
  const { data } = await supabase.from('research_interpretations').select('dream_id').range(from, from + 999);
  if (!data || data.length === 0) break;
  data.forEach(r => existingIds.add(r.dream_id));
  from += 1000;
  if (data.length < 1000) break;
}
console.log(`${existingIds.size} existierende Deutungen.\n`);

console.log('Lade Traeume...');
let allDreams = [];
from = 0;
while (true) {
  const { data, error } = await supabase
    .from('research_dreams')
    .select('id, dream_text, participant_id, study_id, original_language')
    .range(from, from + 999);
  if (error || !data || data.length === 0) break;
  const valid = data.filter(d => d.dream_text && d.dream_text.length >= 10 && !existingIds.has(d.id));
  allDreams.push(...valid);
  if ((from / 1000 + 1) % 10 === 0) console.log(`  Seite ${from/1000+1}, gesamt: ${allDreams.length}`);
  from += 1000;
  if (data.length < 1000) break;
}
console.log(`\n${allDreams.length} Traeume zu deuten\n`);

if (allDreams.length === 0) { console.log('Nichts zu tun.'); process.exit(0); }

let success = 0, failed = 0;
const BATCH = 20; // 20 parallel
const startTime = Date.now();

function log(msg) { process.stdout.write(msg + '\n'); }

for (let i = 0; i < allDreams.length; i += BATCH) {
  const batch = allDreams.slice(i, i + BATCH);

  await Promise.allSettled(batch.map(async dream => {
    const interpretation = await interpretDream(dream.dream_text, dream.original_language || 'en');
    if (!interpretation) { failed++; return; }

    const { error } = await supabase
      .from('research_interpretations')
      .upsert({
        dream_id: dream.id,
        participant_id: dream.participant_id,
        study_id: dream.study_id,
        content: interpretation,
        tradition: 'scientific',
      }, { onConflict: 'dream_id' });

    if (error) { log(`Insert: ${error.message}`); failed++; }
    else success++;
  }));

  const done = success + failed;
  if (done % 100 < BATCH || i + BATCH >= allDreams.length) {
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = Math.round(success / (elapsed || 1) * 60);
    const eta = done > 0 ? Math.round((allDreams.length - done) / (done / elapsed) / 60) : '?';
    log(`[${done}/${allDreams.length}] OK:${success} ERR:${failed} | ${rate}/min | ETA:${eta}min`);
  }

  await sleep(100);
}

const totalMin = Math.round((Date.now() - startTime) / 60000);
log(`\nFERTIG in ${totalMin}min: ${success} OK, ${failed} Fehler`);
