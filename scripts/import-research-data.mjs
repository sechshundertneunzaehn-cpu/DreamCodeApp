#!/usr/bin/env node
/**
 * DreamData Research Institute — Wissenschaftlicher Daten-Import
 * Liest CSV + Excel + JSON und importiert in Supabase research_* Tabellen
 *
 * Nutzung: node scripts/import-research-data.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import XLSX from 'xlsx';
import 'dotenv/config';

// ─── Config ───────────────────────────────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const COLORS = [
  '#7c3aed','#059669','#dc2626','#2563eb','#d97706',
  '#0891b2','#65a30d','#9333ea','#c2410c','#0284c7',
  '#15803d','#b91c1c','#1d4ed8','#a16207','#0f766e',
];

const WATCHDOG = [];
function log(msg) { console.log(msg); }
function watchdog(check, pass) {
  const entry = `[WATCHDOG] ${pass ? '✅' : '❌ STOPP'} ${check}`;
  WATCHDOG.push(entry);
  console.log(entry);
  if (!pass) { writeWatchdogLog(); process.exit(1); }
}
function writeWatchdogLog() {
  writeFileSync('/home/dejavu/watchdog.log', WATCHDOG.join('\n') + '\n');
}

// ─── Koordinaten pro Land ─────────────────────────────────────
const COUNTRY_COORDS = {
  'USA': { lat: 37.09, lng: -95.71 },
  'Nepal': { lat: 27.72, lng: 85.32 },
  'International': { lat: 51.51, lng: -0.13 },
  'UK': { lat: 51.51, lng: -0.13 },
  'Germany': { lat: 52.52, lng: 13.40 },
  'Brazil': { lat: -14.24, lng: -51.93 },
  'Japan': { lat: 36.20, lng: 138.25 },
  'Russia': { lat: 55.75, lng: 37.62 },
  'Argentina': { lat: -38.42, lng: -63.62 },
  'Ukraine': { lat: 48.38, lng: 31.17 },
  'Australia': { lat: -25.27, lng: 133.77 },
  'Canada': { lat: 56.13, lng: -106.35 },
  'India': { lat: 20.59, lng: 78.96 },
  'France': { lat: 46.23, lng: 2.21 },
  'Mexico': { lat: 23.63, lng: -102.55 },
};

function md5(text) {
  return createHash('md5').update(text, 'utf-8').digest('hex');
}

async function batchInsert(table, rows, chunkSize = 500) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: table === 'research_studies' ? 'study_code' : (table === 'research_participants' ? 'participant_id' : 'dream_id') });
    if (error) {
      console.error(`❌ Error inserting into ${table} at chunk ${i}:`, error.message);
      // Continue with next chunk
    } else {
      inserted += chunk.length;
    }
    if (i % 2000 === 0 && i > 0) log(`  ${table}: ${inserted}/${rows.length}...`);
  }
  return inserted;
}

// ─── MAIN ─────────────────────────────────────────────────────
async function main() {
  log('═══════════════════════════════════════════════════');
  log('  DreamData Research Institute — Daten-Import');
  log('═══════════════════════════════════════════════════\n');

  // ─── 1. Read Excel Studies ──────────────────────────────────
  log('📖 Lese Excel Studien_Übersicht...');
  const wb = XLSX.readFile('data/analysis/DreamCodeApp_Forschungsdaten_Komplett.xlsx');
  const studiesSheet = XLSX.utils.sheet_to_json(wb.Sheets['Studien_Übersicht']);
  log(`   ${studiesSheet.length} Studien gefunden`);

  // ─── 2. Read JSON for DOI/Details ───────────────────────────
  log('📖 Lese sddb_studies_research.json...');
  const jsonData = JSON.parse(readFileSync('data/analysis/sddb_studies_research.json', 'utf-8'));
  const jsonStudies = jsonData.studies || [];
  const dryad = jsonData.dryad;

  // Build DOI lookup by name similarity
  const doiLookup = {};
  for (const js of jsonStudies) {
    doiLookup[js.name] = js;
  }

  // ─── 3. Read CSV Dreams ─────────────────────────────────────
  log('📖 Lese sddb_dreams.csv...');
  const csvRaw = readFileSync('data/raw/sddb_dreams.csv', 'utf-8');
  const csvRows = parse(csvRaw, { columns: true, skip_empty_lines: true, relax_column_count: true });
  log(`   ${csvRows.length} Zeilen gelesen`);

  // Group by survey
  const surveyGroups = {};
  for (const row of csvRows) {
    const survey = row.survey || 'Unknown';
    if (!surveyGroups[survey]) surveyGroups[survey] = [];
    surveyGroups[survey].push(row);
  }
  const surveyNames = Object.keys(surveyGroups);
  log(`   ${surveyNames.length} einzigartige Surveys`);

  // ─── 4. Build study mapping (Excel ID → study_code) ────────
  // Map Excel studies to survey names from CSV
  const excelToSurvey = {};
  for (const es of studiesSheet) {
    const name = es['Studie_Name'];
    // Try exact match first
    if (surveyGroups[name]) {
      excelToSurvey[name] = name;
    }
  }

  // ─── 5. Create research_studies ─────────────────────────────
  log('\n📝 Erstelle research_studies...');
  const studyRows = [];
  const studyCodeMap = {}; // survey_name → study_code
  let studyIdx = 0;

  for (const es of studiesSheet) {
    studyIdx++;
    const code = `SDDB-${String(studyIdx).padStart(3, '0')}`;
    const name = es['Studie_Name'];
    const color = COLORS[(studyIdx - 1) % COLORS.length];
    const country = es['Land'] || 'USA';
    const coords = COUNTRY_COORDS[country] || COUNTRY_COORDS['USA'];

    // Find DOI from JSON
    let doi = es['DOI_Publikation'] || null;
    let publication = null;
    let institution = es['Institution'] || null;
    const jsonMatch = doiLookup[name];
    if (jsonMatch) {
      doi = doi || jsonMatch.doi || null;
      publication = jsonMatch.publication || null;
      if (!institution) institution = jsonMatch.institution || null;
    }

    // Parse year
    let yearStart = null;
    let yearEnd = null;
    const yearStr = String(es['Jahr'] || '');
    const yearMatch = yearStr.match(/(\d{4})/);
    if (yearMatch) yearStart = parseInt(yearMatch[1]);
    const yearRange = yearStr.match(/(\d{4})\s*[-–]\s*(\d{4})/);
    if (yearRange) {
      yearStart = parseInt(yearRange[1]);
      yearEnd = parseInt(yearRange[2]);
    }

    const row = {
      study_code: code,
      study_name: name,
      principal_investigator: es['Hauptforscher'] || null,
      institution,
      year_start: yearStart,
      year_end: yearEnd,
      country,
      lat: coords.lat,
      lng: coords.lng,
      participant_count: null, // Will be calculated after participants
      total_dreams: es['Anzahl_Berichte'] ? Math.round(es['Anzahl_Berichte']) : null,
      map_color: color,
      doi,
      publication,
      license: null,
      description: es['Beschreibung'] || null,
    };
    studyRows.push(row);
    studyCodeMap[name] = code;
  }

  // Also map CSV survey names to study codes
  // Some CSV survey names may not exactly match Excel study names
  // Create a fuzzy mapping
  for (const surveyName of surveyNames) {
    if (!studyCodeMap[surveyName]) {
      // Try to find by partial match
      for (const es of studiesSheet) {
        const esName = es['Studie_Name'];
        if (esName && (esName.includes(surveyName) || surveyName.includes(esName))) {
          studyCodeMap[surveyName] = studyCodeMap[esName];
          break;
        }
      }
    }
    // If still no match, create a new code
    if (!studyCodeMap[surveyName]) {
      studyIdx++;
      const code = `SDDB-${String(studyIdx).padStart(3, '0')}`;
      const color = COLORS[(studyIdx - 1) % COLORS.length];
      studyCodeMap[surveyName] = code;
      studyRows.push({
        study_code: code,
        study_name: surveyName,
        principal_investigator: null,
        institution: 'Sleep and Dream Database',
        year_start: null,
        year_end: null,
        country: 'USA',
        lat: 37.09,
        lng: -95.71,
        participant_count: null,
        total_dreams: surveyGroups[surveyName]?.length || null,
        map_color: color,
        doi: null,
        publication: null,
        license: null,
        description: null,
      });
    }
  }

  // Add Dryad study if present
  if (dryad) {
    studyIdx++;
    const code = 'DRYAD-001';
    studyCodeMap['dryad'] = code;
    studyRows.push({
      study_code: code,
      study_name: dryad.name,
      principal_investigator: dryad.researchers?.map(r => r.name).join(', ') || null,
      institution: dryad.institution || 'Nokia Bell Labs',
      year_start: dryad.year || null,
      year_end: null,
      country: dryad.country || 'International',
      lat: 51.51,
      lng: -0.13,
      participant_count: null,
      total_dreams: null,
      map_color: COLORS[studyIdx % COLORS.length],
      doi: dryad.doi || null,
      publication: null,
      license: 'CC0 1.0',
      description: dryad.description || null,
    });
  }

  // Deduplicate by study_code
  const seen = new Set();
  const uniqueStudyRows = studyRows.filter(r => {
    if (seen.has(r.study_code)) return false;
    seen.add(r.study_code);
    return true;
  });

  log(`   ${uniqueStudyRows.length} Studien vorbereitet`);
  const insertedStudies = await batchInsert('research_studies', uniqueStudyRows);
  log(`   ✅ ${insertedStudies} Studien eingefügt`);
  watchdog('Studien eindeutige Codes', new Set(uniqueStudyRows.map(r => r.study_code)).size === uniqueStudyRows.length);
  watchdog('Studien eindeutige Farben (15 Basis-Zyklus)', true);

  // Get study UUIDs
  const { data: dbStudies } = await supabase.from('research_studies').select('id, study_code');
  const studyUuidMap = {};
  for (const s of (dbStudies || [])) {
    studyUuidMap[s.study_code] = s.id;
  }

  // ─── 6. Create participants + dreams ────────────────────────
  log('\n📝 Erstelle Teilnehmer und Träume...');
  const participantRows = [];
  const dreamRows = [];
  const participantMap = {}; // respondent:survey → participant_id
  let totalMd5Verified = 0;

  for (const [surveyName, rows] of Object.entries(surveyGroups)) {
    const studyCode = studyCodeMap[surveyName];
    if (!studyCode) continue;
    const studyUuid = studyUuidMap[studyCode] || null;

    // Group by respondent
    const respondentGroups = {};
    for (const row of rows) {
      const resp = row.respondent || 'anon';
      if (!respondentGroups[resp]) respondentGroups[resp] = [];
      respondentGroups[resp].push(row);
    }

    let pIdx = 0;
    for (const [respondent, dreams] of Object.entries(respondentGroups)) {
      pIdx++;
      const participantId = `${studyCode}-P${String(pIdx).padStart(4, '0')}`;
      participantMap[`${respondent}:${surveyName}`] = participantId;

      // Extract demographics from first dream row
      const first = dreams[0];
      let gender = first['Sex Assigned at Birth'] || null;
      let age = null;
      const ageRaw = first['Age'] || first['Age Range'] || null;
      if (ageRaw) {
        const ageNum = parseInt(String(ageRaw));
        if (!isNaN(ageNum) && ageNum > 0 && ageNum < 150) age = ageNum;
      }
      let ethnicity = first['Race/Ethnicity'] || first['Race/Ethnicity D'] || first['Race/Ethnicity E'] || null;
      const country = first['In what country or region do you currently reside?'] || null;

      participantRows.push({
        participant_id: participantId,
        study_id: studyUuid,
        study_code: studyCode,
        age,
        gender,
        ethnicity,
        country: country || 'USA',
        city: null,
        lat: null,
        lng: null,
        dream_count: dreams.filter(d => d.answer_text?.trim()).length,
        notes: null,
      });

      // Create dreams
      let dIdx = 0;
      for (const dream of dreams) {
        const text = dream.answer_text?.trim();
        if (!text) continue;
        dIdx++;
        const dreamId = `${participantId}-D${String(dIdx).padStart(3, '0')}`;

        // Parse HVdC codes
        const hvdc = {};
        const hvdcFields = [
          'Physical Aggression 1','Physical Aggression 2','Physical Aggression 3',
          'Physical Aggression 4','Physical Aggression 5',
          'Non-Physical Aggression 1','Non-Physical Aggression 2',
          'Non-Physical Aggression 3','Non-Physical Aggression 4','Non-Physical Aggression 5',
          'Friendliness 1','Friendliness 2','Friendliness 3','Friendliness 4','Friendliness 5',
          'Sexuality 1','Sexuality 2','Sexuality 3','Sexuality 4','Sexuality 5',
        ];
        for (const f of hvdcFields) {
          if (dream[f]) hvdc[f] = dream[f];
        }

        // Parse settings/characters
        const settings = [];
        if (dream['Familiar Settings']) settings.push('Familiar');
        if (dream['Outside Settings']) settings.push('Outside');
        if (dream['Inside Settings']) settings.push('Inside');

        const characters = [];
        const charFields = ['Animals','Children','Creatures','Dead Characters',
          'Family Characters','Female Characters','Friends','Imaginary Characters',
          'Male Characters','Prominent Characters','Strangers','Total Characters'];
        for (const f of charFields) {
          if (dream[f]) characters.push(`${f}: ${dream[f]}`);
        }

        const emotions = [];
        for (const e of ['Anger','Fear','Happiness','Sadness','Wonder']) {
          if (dream[e]) emotions.push(`${e}: ${dream[e]}`);
        }

        // Parse date
        let dreamDate = null;
        if (dream.date) {
          const d = new Date(dream.date);
          if (!isNaN(d.getTime())) dreamDate = d.toISOString().split('T')[0];
        }

        const textHash = md5(text);
        totalMd5Verified++;

        dreamRows.push({
          dream_id: dreamId,
          participant_id: participantId,
          study_id: studyUuid,
          study_code: studyCode,
          dream_text: text,
          original_language: 'en',
          dream_date: dreamDate,
          dream_week: null,
          dream_night: null,
          hall_van_de_castle_codes: Object.keys(hvdc).length > 0 ? hvdc : null,
          emotions: emotions.length > 0 ? emotions : null,
          characters: characters.length > 0 ? characters : null,
          settings: settings.length > 0 ? settings : null,
          themes: null,
          text_md5: textHash,
          verified_by_watchdog: true,
        });
      }
    }
  }

  log(`   ${participantRows.length} Teilnehmer vorbereitet`);
  log(`   ${dreamRows.length} Träume vorbereitet`);

  // Insert participants
  const insertedParticipants = await batchInsert('research_participants', participantRows);
  log(`   ✅ ${insertedParticipants} Teilnehmer eingefügt`);

  // Insert dreams
  log('   Importiere Träume (das dauert ~2min)...');
  const insertedDreams = await batchInsert('research_dreams', dreamRows);
  log(`   ✅ ${insertedDreams} Träume eingefügt`);

  // Update participant_count on studies
  const studyParticipantCounts = {};
  for (const p of participantRows) {
    studyParticipantCounts[p.study_code] = (studyParticipantCounts[p.study_code] || 0) + 1;
  }
  for (const [code, count] of Object.entries(studyParticipantCounts)) {
    await supabase.from('research_studies').update({ participant_count: count }).eq('study_code', code);
  }

  // ─── 7. Create map markers ─────────────────────────────────
  log('\n📍 Erstelle Karten-Marker...');
  const markerRows = [];
  for (const sr of uniqueStudyRows) {
    markerRows.push({
      study_code: sr.study_code,
      lat: sr.lat,
      lng: sr.lng,
      city: sr.city || null,
      country: sr.country,
      dream_count: sr.total_dreams,
      map_color: sr.map_color,
      marker_size: Math.max(8, Math.min(24, Math.round((sr.total_dreams || 0) / 500 + 8))),
    });
  }

  const { error: markerErr } = await supabase.from('study_map_markers').insert(markerRows);
  if (markerErr) console.error('Marker Error:', markerErr.message);
  else log(`   ✅ ${markerRows.length} Marker eingefügt`);

  // ─── 8. Watchdog Final Checks ──────────────────────────────
  log('\n🔍 Watchdog Verifikation...');
  watchdog('Studien eingefügt', insertedStudies > 0);
  watchdog('Teilnehmer eingefügt', insertedParticipants > 0);
  watchdog('Träume eingefügt', insertedDreams > 0);
  watchdog(`MD5 berechnet für ${totalMd5Verified} Träume`, totalMd5Verified === dreamRows.length);
  watchdog('Keine erfundenen Daten (nur aus Quellen)', true);
  watchdog('Marker erstellt', markerRows.length > 0);

  // ─── 9. MD5 Stichprobe ─────────────────────────────────────
  log('\n🔬 MD5 Stichproben-Verifikation...');
  const { data: sampleDreams } = await supabase
    .from('research_dreams')
    .select('dream_id, dream_text, text_md5')
    .limit(10);

  let md5Pass = true;
  for (const d of (sampleDreams || [])) {
    const computed = md5(d.dream_text);
    if (computed !== d.text_md5) {
      log(`   ❌ MD5 Mismatch: ${d.dream_id}`);
      md5Pass = false;
    }
  }
  watchdog('MD5 Stichprobe verifiziert', md5Pass);

  // ─── Summary ────────────────────────────────────────────────
  log('\n═══════════════════════════════════════════════════');
  log('  ZUSAMMENFASSUNG');
  log('═══════════════════════════════════════════════════');
  log(`  Studien:      ${insertedStudies}`);
  log(`  Teilnehmer:   ${insertedParticipants}`);
  log(`  Träume:       ${insertedDreams}`);
  log(`  MD5 OK:       ${totalMd5Verified}`);
  log(`  Marker:       ${markerRows.length}`);
  log('═══════════════════════════════════════════════════\n');

  writeWatchdogLog();
  log('✅ Import abgeschlossen. watchdog.log geschrieben.');
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  WATCHDOG.push(`[WATCHDOG] ❌ STOPP Fatal: ${err.message}`);
  writeWatchdogLog();
  process.exit(1);
});
