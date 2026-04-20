import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env','utf8').split('\n')
  .filter(l => l.includes('=') && !l.startsWith('#'))
  .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const sleep = ms => new Promise(r => setTimeout(r, ms));
function log(msg) { process.stdout.write(msg + '\n'); }

const GROQ_KEY = env.VITE_GROQ_API_KEY;
if (!GROQ_KEY) { log('Kein GROQ Key'); process.exit(1); }

const LANG_MAP = {
  en:'English', de:'German', tr:'Turkish', ar:'Arabic',
  fr:'French', es:'Spanish', pt:'Portuguese', ru:'Russian',
};

async function callGroq(text, lang, retries = 2) {
  const langName = LANG_MAP[lang] || 'English';
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: `You are a scientific dream researcher. Analyze dreams objectively in ${langName}. Maximum 3 sentences.` },
            { role: 'user', content: `Analyze this dream scientifically in 2-3 sentences:\n\n"${text.slice(0,500)}"\n\nRespond ONLY with the analysis.` }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (res.status === 429) {
        const wait = attempt === 0 ? 2000 : 5000;
        await sleep(wait);
        continue;
      }
      if (!res.ok) {
        const err = await res.text();
        if (attempt < retries) { await sleep(1000); continue; }
        return null;
      }
      const d = await res.json();
      return d?.choices?.[0]?.message?.content?.trim() || null;
    } catch(e) {
      if (attempt < retries) await sleep(1000);
    }
  }
  return null;
}

// --- Existierende IDs ---
log('GROQ Hybrid-Script gestartet');
log('Lade existierende Deutungen...');
const existingIds = new Set();
let from = 0;
while (true) {
  const { data } = await supabase.from('research_interpretations').select('dream_id').range(from, from + 999);
  if (!data || data.length === 0) break;
  data.forEach(r => existingIds.add(r.dream_id));
  from += 1000;
  if (data.length < 1000) break;
}
log(`${existingIds.size} bereits gedeutet`);

// --- Traeume laden ---
log('Lade Traeume...');
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
  from += 1000;
  if (data.length < 1000) break;
}
log(`${allDreams.length} Traeume zu deuten\n`);

if (allDreams.length === 0) { log('Nichts zu tun.'); process.exit(0); }

// --- Processing: GROQ ist schnell aber hat 30 RPM Limit ---
// 1 Call alle 2 Sekunden = 30/min
let success = 0, failed = 0;
const startTime = Date.now();

for (let i = 0; i < allDreams.length; i++) {
  const dream = allDreams[i];
  if (existingIds.has(dream.id)) continue;

  const interpretation = await callGroq(dream.dream_text, dream.original_language || 'en');
  if (!interpretation) { failed++; }
  else {
    const { error } = await supabase
      .from('research_interpretations')
      .upsert({
        dream_id: dream.id,
        participant_id: dream.participant_id,
        study_id: dream.study_id,
        content: interpretation,
        tradition: 'scientific',
      }, { onConflict: 'dream_id' });

    if (error) failed++;
    else { success++; existingIds.add(dream.id); }
  }

  const done = success + failed;
  if (done % 100 === 0 && done > 0) {
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = Math.round(success / (elapsed || 1) * 60);
    const remaining = allDreams.length - i;
    const eta = success > 0 ? Math.round(remaining / (success / elapsed) / 60) : '?';
    log(`[${done}/${allDreams.length}] OK:${success} ERR:${failed} | ${rate}/min | ETA:${eta}min`);
  }

  // 2 Sekunden Pause = 30 RPM
  await sleep(2000);
}

const totalMin = Math.round((Date.now() - startTime) / 60000);
log(`\nFERTIG in ${totalMin}min: ${success} OK, ${failed} Fehler`);
