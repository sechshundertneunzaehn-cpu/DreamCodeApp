#!/usr/bin/env node
/**
 * Übersetzt 6 neue trad.* Keys in alle 21 nicht-deutschen Sprachen.
 * Schreibt sofort in jede Datei, überspringt falls Key bereits vorhanden.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = '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';
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const LOCALES_DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');

const NEW_KEYS = {
  'trad.scholar.who': 'Wer war das?',
  'trad.scholar.contribution': 'Beitrag zur Traumdeutung',
  'trad.how.badge': 'So funktioniert es',
  'trad.how.title': 'Dein KI-Traum-Therapeut',
  'trad.how.desc': 'Kein statisches Traumlexikon -- ein lebendiges Gespräch. Unsere KI wurde mit Millionen von Traumdaten und den vollständigen Werken der Meister trainiert. Sie erkennt Muster, die kein Mensch allein erfassen könnte.',
  'trad.how.tag': 'Ein Gespräch, so echt wie mit einem Mentor',
};

const LANGS = [
  { code: 'en', name: 'English' },
  { code: 'tr', name: 'Turkish' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'id', name: 'Indonesian' },
  { code: 'fa', name: 'Persian' },
  { code: 'it', name: 'Italian' },
  { code: 'pl', name: 'Polish' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ur', name: 'Urdu' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'sw', name: 'Swahili' },
  { code: 'hu', name: 'Hungarian' },
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function translate(langName, retries = 3) {
  const prompt = `Translate these 6 UI strings from German to ${langName}.
Return ONLY a JSON object with the exact same keys, no extra text.
Context: DreamCode is a dream interpretation app. "KI" means AI.

${JSON.stringify(NEW_KEYS, null, 2)}`;

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`HTTP ${res.status}: ${err}`);
      }

      const data = await res.json();
      const text = data.choices[0].message.content.trim();

      // JSON aus Antwort extrahieren
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Kein JSON in Antwort');
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error(`  Versuch ${i + 1} fehlgeschlagen: ${err.message}`);
      if (i < retries - 1) await sleep([2000, 5000, 10000][i]);
    }
  }
  throw new Error(`${langName}: alle Versuche fehlgeschlagen`);
}

function appendKeysToFile(filePath, langCode, translations) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Prüfen ob Keys schon drin sind
  if (content.includes('"trad.scholar.who"')) {
    console.log(`  [SKIP] Keys bereits vorhanden`);
    return;
  }

  // Vor dem schließenden }; einfügen
  const newEntries = Object.entries(translations)
    .map(([k, v]) => `  "${k}": ${JSON.stringify(v)}`)
    .join(',\n');

  content = content.replace(/\n\};(\s*)$/, `,\n${newEntries}\n};$1`);
  fs.writeFileSync(filePath, content, 'utf8');
}

async function main() {
  console.log(`Übersetze ${Object.keys(NEW_KEYS).length} neue Keys in ${LANGS.length} Sprachen...\n`);

  for (const lang of LANGS) {
    const filePath = path.join(LOCALES_DIR, `${lang.code}.ts`);
    if (!fs.existsSync(filePath)) {
      console.log(`[SKIP] ${lang.code}.ts nicht gefunden`);
      continue;
    }

    // Prüfen ob schon vorhanden
    const existing = fs.readFileSync(filePath, 'utf8');
    if (existing.includes('"trad.scholar.who"')) {
      console.log(`[OK]   ${lang.code} — bereits vorhanden`);
      continue;
    }

    process.stdout.write(`[...] ${lang.code} (${lang.name})... `);
    try {
      const translated = await translate(lang.name);
      appendKeysToFile(filePath, lang.code, translated);
      console.log(`DONE`);
    } catch (err) {
      console.log(`FEHLER: ${err.message}`);
    }

    await sleep(300);
  }

  console.log('\nFertig!');
}

main().catch(console.error);
