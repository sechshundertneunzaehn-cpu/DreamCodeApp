#!/usr/bin/env node
/**
 * Import fehlende Studien-Daten aus CSV
 *
 * Kategorie 1: 15 regulaere Studien (CSV-Name = study_name) → direkt importieren
 * Kategorie 2: 9 Meta-Studien (Publikationen) → CSV-Daten unter Meta-Code importieren
 */
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function md5(text) {
  return createHash('md5').update(text, 'utf-8').digest('hex');
}

async function batchUpsert(table, rows, conflict) {
  let inserted = 0;
  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: conflict });
    if (error) {
      console.error(`  Error ${table} chunk ${i}: ${error.message}`);
    } else {
      inserted += chunk.length;
    }
  }
  return inserted;
}

// ─── Kategorie 1: Regulaere Studien mit exaktem CSV-Match ─────
const REGULAR_MISSING = [
  'SDDB-022', // 2013 Demographic Survey Winter
  'SDDB-028', // African Church Dreams B
  'SDDB-029', // African Church Dreams C
  'SDDB-037', // Bea Journal 2007-2010
  'SDDB-039', // Beverly Journal 1996
  'SDDB-040', // Beverly Journal 2006
  'SDDB-041', // Beverly Journal 2016
  'SDDB-049', // Hall & Van de Castle Male Norms 1947-1950
  'SDDB-054', // Jasmine Journal B
  'SDDB-055', // Jasmine Journal C
  'SDDB-056', // Jasmine Journal D
  'SDDB-068', // Lucid Dreams Study 2018 B
  'SDDB-071', // Lucrecia de Leon Journal 1590
  'SDDB-088', // Research Study 2015 B
  'SDDB-092', // Santa Clara Dreams 2012
];

// ─── Kategorie 2: Meta-Studien → CSV-Survey Mapping ──────────
const META_MAPPING = {
  'SDDB-001': ['2010 Demographic Survey'],
  'SDDB-002': ['2012 Demographic Survey'],
  'SDDB-003': ['2020 Pandemic April', '2020 Pandemic May'],
  'SDDB-004': ['2020 Racial Justice Survey'],
  'SDDB-005': ['2013 Demographic Survey Summer', '2013 Demographic Survey Winter'],
  'SDDB-006': ['Sports Dreams Survey 2021'],
  'SDDB-011': ['Hall & Van de Castle Female Norms 1947-1950', 'Hall & Van de Castle Male Norms 1947-1950'],
  'SDDB-012': ['Barb Sanders baseline 250'],
  'SDDB-015': ['2020 Pandemic April', '2020 Pandemic May', '2020 Racial Justice Survey'],
};

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Import fehlende Studien');
  console.log('═══════════════════════════════════════════════\n');

  // 1. Lade alle Studien aus DB
  const { data: dbStudies } = await supabase
    .from('research_studies')
    .select('id, study_code, study_name');
  const studyByCode = {};
  const studyByName = {};
  for (const s of dbStudies) {
    studyByCode[s.study_code] = s;
    studyByName[s.study_name] = s;
  }

  // 2. Lade CSV
  console.log('Lade sddb_dreams.csv...');
  const csvRaw = readFileSync('data/raw/sddb_dreams.csv', 'utf-8');
  const csvRows = parse(csvRaw, { columns: true, skip_empty_lines: true, relax_column_count: true });
  console.log(`  ${csvRows.length} Zeilen gelesen\n`);

  // Gruppiere CSV nach survey
  const surveyGroups = {};
  for (const row of csvRows) {
    const survey = (row.survey || '').trim();
    if (!survey) continue;
    if (!surveyGroups[survey]) surveyGroups[survey] = [];
    surveyGroups[survey].push(row);
  }

  // ─── Kategorie 1: Regulaere Studien importieren ─────────────
  console.log('=== KATEGORIE 1: Regulaere Studien ===\n');

  let totalParticipants = 0;
  let totalDreams = 0;

  for (const studyCode of REGULAR_MISSING) {
    const study = studyByCode[studyCode];
    if (!study) { console.log(`  ${studyCode}: nicht in DB, ueberspringe`); continue; }

    // CSV-Survey Name = study_name
    const surveyName = study.study_name;
    const rows = surveyGroups[surveyName];

    if (!rows || rows.length === 0) {
      // Versuche mit Trim/Varianten
      const trimmedMatch = Object.keys(surveyGroups).find(
        k => k.trim() === surveyName.trim()
      );
      if (trimmedMatch) {
        console.log(`  ${studyCode}: Trim-Match "${trimmedMatch}"`);
        const result = await importSurveyData(studyCode, study.id, surveyGroups[trimmedMatch]);
        totalParticipants += result.participants;
        totalDreams += result.dreams;
      } else {
        console.log(`  ${studyCode}: KEINE CSV-Daten fuer "${surveyName}"`);
      }
      continue;
    }

    const result = await importSurveyData(studyCode, study.id, rows);
    totalParticipants += result.participants;
    totalDreams += result.dreams;
  }

  console.log(`\nKategorie 1 gesamt: ${totalParticipants} Teilnehmer, ${totalDreams} Traeume\n`);

  // ─── Kategorie 2: Meta-Studien importieren ──────────────────
  console.log('=== KATEGORIE 2: Meta-Studien ===\n');

  let metaParticipants = 0;
  let metaDreams = 0;

  for (const [metaCode, csvSurveys] of Object.entries(META_MAPPING)) {
    const study = studyByCode[metaCode];
    if (!study) { console.log(`  ${metaCode}: nicht in DB`); continue; }

    // Pruefe ob bereits Daten existieren
    const { count: existing } = await supabase
      .from('research_participants')
      .select('*', { count: 'exact', head: true })
      .eq('study_code', metaCode);

    if (existing > 0) {
      console.log(`  ${metaCode}: bereits ${existing} Teilnehmer, ueberspringe`);
      continue;
    }

    // Sammle alle CSV-Rows aus den gemappten Surveys
    const allRows = [];
    for (const surveyName of csvSurveys) {
      const rows = surveyGroups[surveyName];
      if (rows) allRows.push(...rows);
      else console.log(`    Warnung: Survey "${surveyName}" nicht in CSV`);
    }

    if (allRows.length === 0) {
      console.log(`  ${metaCode}: keine CSV-Daten fuer ${csvSurveys.join(', ')}`);
      continue;
    }

    const result = await importSurveyData(metaCode, study.id, allRows);
    metaParticipants += result.participants;
    metaDreams += result.dreams;
  }

  console.log(`\nKategorie 2 gesamt: ${metaParticipants} Teilnehmer, ${metaDreams} Traeume\n`);

  // ─── Update participant_count auf Studien ───────────────────
  console.log('Update participant_count auf Studien...');
  const allCodes = [...REGULAR_MISSING, ...Object.keys(META_MAPPING)];
  for (const code of allCodes) {
    const { count: pCount } = await supabase
      .from('research_participants')
      .select('*', { count: 'exact', head: true })
      .eq('study_code', code);
    if (pCount > 0) {
      await supabase.from('research_studies')
        .update({ participant_count: pCount })
        .eq('study_code', code);
    }
  }

  // ─── Zusammenfassung ───────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════');
  console.log('  ZUSAMMENFASSUNG');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Kat 1 (regulaer):  ${totalParticipants} Teilnehmer, ${totalDreams} Traeume`);
  console.log(`  Kat 2 (meta):      ${metaParticipants} Teilnehmer, ${metaDreams} Traeume`);
  console.log(`  GESAMT:            ${totalParticipants + metaParticipants} Teilnehmer, ${totalDreams + metaDreams} Traeume`);
  console.log('═══════════════════════════════════════════════\n');
}

/**
 * Importiert CSV-Rows als Participants + Dreams unter einem study_code
 */
async function importSurveyData(studyCode, studyUuid, rows) {
  const participantRows = [];
  const dreamRows = [];

  // Gruppiere nach respondent
  const respondentGroups = {};
  for (const row of rows) {
    const resp = (row.respondent || 'anon').trim();
    if (!respondentGroups[resp]) respondentGroups[resp] = [];
    respondentGroups[resp].push(row);
  }

  let pIdx = 0;
  for (const [respondent, dreams] of Object.entries(respondentGroups)) {
    pIdx++;
    const participantId = `${studyCode}-P${String(pIdx).padStart(4, '0')}`;

    const first = dreams[0];
    let gender = first['Sex Assigned at Birth'] || null;
    let age = null;
    const ageRaw = first['Age'] || first['Age Range'] || null;
    if (ageRaw) {
      const ageNum = parseInt(String(ageRaw));
      if (!isNaN(ageNum) && ageNum > 0 && ageNum < 150) age = ageNum;
    }
    const ethnicity = first['Race/Ethnicity'] || first['Race/Ethnicity D'] || first['Race/Ethnicity E'] || null;
    const country = first['In what country or region do you currently reside?'] || null;

    const dreamsWithText = dreams.filter(d => d.answer_text?.trim());
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
      dream_count: dreamsWithText.length,
      notes: null,
    });

    let dIdx = 0;
    for (const dream of dreams) {
      const text = dream.answer_text?.trim();
      if (!text) continue;
      dIdx++;
      const dreamId = `${participantId}-D${String(dIdx).padStart(3, '0')}`;

      // HVdC codes
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

      const settings = [];
      if (dream['Familiar Settings']) settings.push('Familiar');
      if (dream['Outside Settings']) settings.push('Outside');
      if (dream['Inside Settings']) settings.push('Inside');

      const characters = [];
      for (const f of ['Animals','Children','Creatures','Dead Characters',
        'Family Characters','Female Characters','Friends','Imaginary Characters',
        'Male Characters','Prominent Characters','Strangers','Total Characters']) {
        if (dream[f]) characters.push(`${f}: ${dream[f]}`);
      }

      const emotions = [];
      for (const e of ['Anger','Fear','Happiness','Sadness','Wonder']) {
        if (dream[e]) emotions.push(`${e}: ${dream[e]}`);
      }

      let dreamDate = null;
      if (dream.date) {
        const d = new Date(dream.date);
        if (!isNaN(d.getTime())) dreamDate = d.toISOString().split('T')[0];
      }

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
        text_md5: md5(text),
        verified_by_watchdog: true,
      });
    }
  }

  console.log(`  ${studyCode}: ${participantRows.length} Teilnehmer, ${dreamRows.length} Traeume`);

  if (participantRows.length > 0) {
    const pInserted = await batchUpsert('research_participants', participantRows, 'participant_id');
    const dInserted = await batchUpsert('research_dreams', dreamRows, 'dream_id');
    console.log(`    → eingefuegt: ${pInserted} Teilnehmer, ${dInserted} Traeume`);
  }

  return { participants: participantRows.length, dreams: dreamRows.length };
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
