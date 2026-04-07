#!/usr/bin/env node
/**
 * import-research-data.mjs
 *
 * Importiert Forschungsdaten aus 4 Quellen in die Supabase-Tabellen:
 *   - research_studies
 *   - research_participants
 *   - research_dreams
 *   - study_map_markers
 *
 * Quellen:
 *   1. data/analysis/sddb_studies_research.json   — 15 Studien-Metadaten
 *   2. data/analysis/DreamCodeApp_Forschungsdaten_Komplett.xlsx — 99 Studien (Sheet "Studien_Uebersicht")
 *   3. data/analysis/geo_complete.json            — Geo-Daten (33 Laender mit Koordinaten)
 *   4. data/raw/sddb_dreams.csv                   — 39,075 Traumberichte mit Volltext
 *
 * Erfordert in .env:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/import-research-data.mjs
 *   node scripts/import-research-data.mjs --dry-run    # Nur parsen, kein DB-Insert
 */

import { readFileSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Dependency Check + Lazy Imports
// ---------------------------------------------------------------------------

async function ensureDeps() {
  const missing = [];
  try { await import('xlsx'); } catch { missing.push('xlsx'); }
  try { await import('csv-parse/sync'); } catch { missing.push('csv-parse'); }
  try { await import('dotenv'); } catch { missing.push('dotenv'); }
  try { await import('@supabase/supabase-js'); } catch { missing.push('@supabase/supabase-js'); }

  if (missing.length > 0) {
    console.log(`[SETUP] Installiere fehlende Abhaengigkeiten: ${missing.join(', ')}`);
    execFileSync('npm', ['install', '--save', ...missing], { cwd: ROOT, stdio: 'inherit' });
    console.log('[SETUP] Installation abgeschlossen.\n');
  }
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = 500;

const COLORS = [
  '#7c3aed', '#059669', '#dc2626', '#2563eb', '#d97706',
  '#0891b2', '#65a30d', '#9333ea', '#c2410c', '#0284c7',
  '#15803d', '#b91c1c', '#1d4ed8', '#a16207', '#0f766e',
];

const PATHS = {
  studiesJson: resolve(ROOT, 'data/analysis/sddb_studies_research.json'),
  excel:       resolve(ROOT, 'data/analysis/DreamCodeApp_Forschungsdaten_Komplett.xlsx'),
  geoJson:     resolve(ROOT, 'data/analysis/geo_complete.json'),
  csv:         resolve(ROOT, 'data/raw/sddb_dreams.csv'),
};

// HVdC-Spalten im CSV (Aggression, Friendliness, Sexuality, Settings)
const HVDC_COLS = [
  'Familiar Settings', 'Outside Settings', 'Inside Settings',
  'Non-Physical Aggression 1', 'Non-Physical Aggression 2',
  'Non-Physical Aggression 3', 'Non-Physical Aggression 4',
  'Non-Physical Aggression 5',
  'Physical Aggression 1', 'Physical Aggression 2',
  'Physical Aggression 3', 'Physical Aggression 4',
  'Physical Aggression 5',
  'Friendliness 1', 'Friendliness 2', 'Friendliness 3',
  'Friendliness 4', 'Friendliness 5',
  'Sexuality 1', 'Sexuality 2', 'Sexuality 3',
  'Sexuality 4', 'Sexuality 5',
];

const EMOTION_COLS = ['Anger', 'Fear', 'Happiness', 'Sadness', 'Wonder'];

const CHARACTER_COLS = [
  'Animals', 'Children', 'Creatures', 'Dead Characters',
  'Family Characters', 'Female Characters', 'Friends',
  'Imaginary Characters', 'Male Characters', 'Metamorphosis',
  'Occupational Characters', 'Prominent Characters',
  'Racial/Ethnic Characters', 'Strangers', 'Total Characters',
];

const SETTING_COLS = ['Familiar Settings', 'Outside Settings', 'Inside Settings', 'Dream Location'];
const FORTUNE_COLS = ['Good Fortunes', 'Misfortune'];

// ---------------------------------------------------------------------------
// .env Loader (Fallback wenn dotenv nicht verfuegbar)
// ---------------------------------------------------------------------------

function loadEnvManual() {
  const envPath = resolve(ROOT, '.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function getEnv(key) {
  const val = process.env[key];
  if (!val) throw new Error(`Fehlende Umgebungsvariable: ${key}`);
  return val;
}

// ---------------------------------------------------------------------------
// Geo-Koordinaten Lookup
// ---------------------------------------------------------------------------

/** Feste Koordinaten laut Anforderung */
const FIXED_COORDS = {
  'USA':              { lat: 37.09,  lng: -95.71 },
  'United States':    { lat: 37.09,  lng: -95.71 },
  'Nepal':            { lat: 27.72,  lng: 85.32 },
  'UK/International': { lat: 51.51,  lng: -0.13 },
  'UK':               { lat: 51.51,  lng: -0.13 },
  'England':          { lat: 51.51,  lng: -0.13 },
  'Scotland':         { lat: 55.93,  lng: -3.21 },
  'Northern Ireland': { lat: 54.60,  lng: -5.93 },
};

/** Mapping Laendernamen -> ISO-2-Code fuer geo_complete.json bot_profiles */
const COUNTRY_TO_ISO = {
  'United States': 'US', 'USA': 'US',
  'Germany': 'DE', 'Deutschland': 'DE',
  'India': 'IN', 'Brazil': 'BR', 'Brasil': 'BR',
  'United Kingdom': 'GB', 'UK': 'GB', 'England': 'GB',
  'France': 'FR', 'Mexico': 'MX', 'Japan': 'JP',
  'South Korea': 'KR', 'Korea': 'KR',
  'Canada': 'CA', 'Australia': 'AU',
  'Spain': 'ES', 'Italy': 'IT',
  'Netherlands': 'NL', 'Turkey': 'TR',
  'Russia': 'RU', 'Argentina': 'AR',
  'Ukraine': 'UA', 'Colombia': 'CO',
  'Egypt': 'EG', 'Nigeria': 'NG',
  'Indonesia': 'ID', 'Philippines': 'PH',
  'Thailand': 'TH', 'Vietnam': 'VN',
  'Poland': 'PL', 'Sweden': 'SE',
  'South Africa': 'ZA', 'Kenya': 'KE',
  'Israel': 'IL', 'Saudi Arabia': 'SA',
  'Pakistan': 'PK', 'Bangladesh': 'BD',
  'Ireland': 'IE', 'New Zealand': 'NZ',
  'Belgium': 'BE', 'Denmark': 'DK',
  'Malaysia': 'MY', 'Cyprus': 'CY',
  'Albania': 'AL', 'Greece': 'GR',
  'Malta': 'MT', 'Zimbabwe': 'ZW',
  'Switzerland': 'CH', 'Austria': 'AT',
  'Portugal': 'PT', 'Chile': 'CL',
  'Peru': 'PE',
};

/**
 * Baut Koordinaten-Lookup aus geo_complete.json -> bot_profiles.by_country
 * Nimmt die erste Stadt als Repraesentant pro Land.
 */
function buildGeoLookup(geoData) {
  const lookup = { ...FIXED_COORDS };

  const botProfiles = geoData?.bot_profiles?.by_country;
  if (botProfiles) {
    for (const [isoCode, info] of Object.entries(botProfiles)) {
      if (info.cities && info.cities.length > 0) {
        const city = info.cities[0];
        for (const [name, iso] of Object.entries(COUNTRY_TO_ISO)) {
          if (iso === isoCode && !lookup[name]) {
            lookup[name] = { lat: city.lat, lng: city.lng, city: city.name };
          }
        }
      }
    }
  }

  return lookup;
}

function getCoords(country, geoLookup) {
  if (!country) return { lat: null, lng: null };
  if (geoLookup[country]) {
    return { lat: geoLookup[country].lat, lng: geoLookup[country].lng };
  }
  const lc = country.toLowerCase();
  for (const [key, val] of Object.entries(geoLookup)) {
    if (key.toLowerCase() === lc) return { lat: val.lat, lng: val.lng };
  }
  return { lat: null, lng: null };
}

// ---------------------------------------------------------------------------
// MD5
// ---------------------------------------------------------------------------

function md5(text) {
  if (!text) return null;
  return createHash('md5').update(text, 'utf8').digest('hex');
}

// ---------------------------------------------------------------------------
// Robuster CSV Parser (multiline quoted fields)
// ---------------------------------------------------------------------------

function parseCSVRobust(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 2;
        continue;
      } else if (ch === '"') {
        inQuotes = false;
        i++;
        continue;
      } else {
        field += ch;
        i++;
        continue;
      }
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }

    if (ch === '\r' && next === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 2;
      continue;
    }

    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }

    field += ch;
    i++;
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) throw new Error('CSV ist leer');

  const headers = rows[0].map(h => h.trim());
  return { headers, dataRows: rows.slice(1) };
}

// ---------------------------------------------------------------------------
// Spalten-Map Helper
// ---------------------------------------------------------------------------

function buildColMap(headers) {
  const map = new Map();
  for (let i = 0; i < headers.length; i++) {
    map.set(headers[i], i);
  }
  return map;
}

function getCol(colMap, row, colName) {
  const idx = colMap.get(colName);
  if (idx === undefined) return null;
  const val = (row[idx] ?? '').trim();
  return val || null;
}

// ---------------------------------------------------------------------------
// HVdC + Metadata Extraction
// ---------------------------------------------------------------------------

function extractHvdcCodes(colMap, row) {
  const codes = {};
  for (const col of HVDC_COLS) {
    const val = getCol(colMap, row, col);
    if (val && val !== '0') {
      codes[col] = val;
    }
  }
  return Object.keys(codes).length > 0 ? codes : null;
}

function extractEmotions(colMap, row) {
  const emotions = [];
  for (const col of EMOTION_COLS) {
    const val = getCol(colMap, row, col);
    if (val && val !== '0') {
      emotions.push(col.toLowerCase());
    }
  }
  for (const col of FORTUNE_COLS) {
    const val = getCol(colMap, row, col);
    if (val && val !== '0') {
      emotions.push(col.toLowerCase().replace(/\s+/g, '_'));
    }
  }
  return emotions.length > 0 ? emotions : null;
}

function extractCharacters(colMap, row) {
  const chars = [];
  for (const col of CHARACTER_COLS) {
    if (col === 'Total Characters') continue;
    const val = getCol(colMap, row, col);
    if (val && val !== '0') {
      chars.push(col.toLowerCase().replace(/\s+/g, '_'));
    }
  }
  return chars.length > 0 ? chars : null;
}

function extractSettings(colMap, row) {
  const settings = [];
  for (const col of SETTING_COLS) {
    const val = getCol(colMap, row, col);
    if (val && val !== '0') {
      if (col === 'Dream Location') {
        settings.push(val.toLowerCase().replace(/\s+/g, '_'));
      } else {
        settings.push(col.toLowerCase().replace(/\s+/g, '_'));
      }
    }
  }
  return settings.length > 0 ? settings : null;
}

function extractThemes(colMap, row) {
  const themes = [];

  for (const col of EMOTION_COLS) {
    const val = getCol(colMap, row, col);
    if (val && val !== '0') themes.push(col.toLowerCase());
  }

  const hasAggression = HVDC_COLS.filter(c => c.includes('Aggression')).some(c => {
    const v = getCol(colMap, row, c); return v && v !== '0';
  });
  if (hasAggression) themes.push('aggression');

  const hasFriendliness = HVDC_COLS.filter(c => c.includes('Friendliness')).some(c => {
    const v = getCol(colMap, row, c); return v && v !== '0';
  });
  if (hasFriendliness) themes.push('friendliness');

  const hasSexuality = HVDC_COLS.filter(c => c.includes('Sexuality')).some(c => {
    const v = getCol(colMap, row, c); return v && v !== '0';
  });
  if (hasSexuality) themes.push('sexuality');

  if (getCol(colMap, row, 'Good Fortunes') && getCol(colMap, row, 'Good Fortunes') !== '0') {
    themes.push('good_fortune');
  }
  if (getCol(colMap, row, 'Misfortune') && getCol(colMap, row, 'Misfortune') !== '0') {
    themes.push('misfortune');
  }

  return themes.length > 0 ? themes : null;
}

// ---------------------------------------------------------------------------
// Excel: Sheet "Studien_Uebersicht" lesen
// ---------------------------------------------------------------------------

function readExcelStudies(xlsxLib) {
  if (!existsSync(PATHS.excel)) {
    console.warn('[WARN] Excel nicht gefunden:', PATHS.excel);
    return [];
  }

  const workbook = xlsxLib.readFile(PATHS.excel);
  // Suche nach dem Sheet (mit/ohne Umlaute)
  let sheetName = workbook.SheetNames.find(n =>
    n.includes('Studien') || n.includes('bersicht') || n.includes('Overview')
  );
  if (!sheetName) {
    console.warn('[WARN] Sheet "Studien_Uebersicht" nicht gefunden. Sheets:', workbook.SheetNames);
    sheetName = workbook.SheetNames[0];
    console.log(`[INFO] Verwende erstes Sheet: "${sheetName}"`);
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = xlsxLib.utils.sheet_to_json(sheet, { defval: null });
  console.log(`[EXCEL] ${rows.length} Zeilen aus Sheet "${sheetName}" gelesen`);
  return rows;
}

// ---------------------------------------------------------------------------
// Studien zusammenfuehren (Excel + JSON)
// ---------------------------------------------------------------------------

function buildStudies(excelRows, jsonStudies, geoLookup) {
  const studies = [];

  for (let i = 0; i < excelRows.length; i++) {
    const row = excelRows[i];
    const idx = i + 1;
    const studyCode = `SDDB-${String(idx).padStart(3, '0')}`;
    const color = COLORS[i % COLORS.length];

    const studyName = row['Studie_Name'] || row['Name'] || row['Studie'] || `Studie ${idx}`;
    const year = row['Jahr'] || null;
    const pi = row['Hauptforscher'] || row['Forscher'] || null;
    const institution = row['Institution'] || null;
    const country = row['Land'] || 'USA';
    const reportCount = row['Anzahl_Berichte'] || row['Berichte'] || null;
    const doi = row['DOI_Publikation'] || row['DOI'] || null;
    const url = row['URL'] || null;
    const description = row['Beschreibung'] || null;

    const coords = getCoords(country, geoLookup);

    // Versuche Zusatzinfos aus JSON zu mergen (Teilstring-Match)
    const jsonMatch = jsonStudies.find(js => {
      const jn = (js.name || '').toLowerCase();
      const en = (studyName || '').toLowerCase();
      return (en.length >= 20 && jn.includes(en.slice(0, 20))) ||
             (jn.length >= 20 && en.includes(jn.slice(0, 20)));
    });

    // Jahr parsen (mit Range-Support)
    let yearStart = parseYear(year) || parseYear(jsonMatch?.year) || null;
    let yearEnd = null;
    if (year) {
      const rangeMatch = String(year).match(/(\d{4})\s*[-\u2013]\s*(\d{4})/);
      if (rangeMatch) {
        yearStart = parseInt(rangeMatch[1]);
        yearEnd = parseInt(rangeMatch[2]);
      }
    }

    studies.push({
      study_code: studyCode,
      study_name: studyName,
      principal_investigator: pi || (Array.isArray(jsonMatch?.researchers) ? jsonMatch.researchers[0] : null),
      institution: institution || jsonMatch?.institution || null,
      year_start: yearStart,
      year_end: yearEnd,
      country,
      city: coords.city || null,
      lat: coords.lat,
      lng: coords.lng,
      participant_count: null, // Wird aus CSV berechnet
      total_dreams: typeof reportCount === 'number' ? reportCount : parseInt(reportCount) || null,
      map_color: color,
      doi: doi || jsonMatch?.doi || null,
      publication: jsonMatch?.publication || url || null,
      license: 'CC BY-NC-SA 4.0',
      description: description || jsonMatch?.description || null,
    });
  }

  return studies;
}

function parseYear(val) {
  if (!val) return null;
  if (typeof val === 'number') return val;
  const match = String(val).match(/(\d{4})/);
  return match ? parseInt(match[1]) : null;
}

// ---------------------------------------------------------------------------
// CSV -> Participants + Dreams
// ---------------------------------------------------------------------------

function processCSV(csvText, studies, geoLookup) {
  const { headers, dataRows } = parseCSVRobust(csvText);
  const cm = buildColMap(headers);

  console.log(`[CSV] ${dataRows.length} Zeilen, ${headers.length} Spalten`);

  // Unique Surveys sammeln
  const surveyIdx = cm.get('survey');
  const surveys = new Map(); // survey-Name -> Set<respondent>
  for (const row of dataRows) {
    const survey = (row[surveyIdx] ?? '').trim();
    if (!survey) continue;
    if (!surveys.has(survey)) surveys.set(survey, new Set());
    const resp = (row[cm.get('respondent')] ?? '').trim();
    if (resp) surveys.get(survey).add(resp);
  }

  console.log(`[CSV] ${surveys.size} unique Surveys gefunden`);

  // Survey-Name -> study_code Mapping
  const surveyNames = [...surveys.keys()].sort();
  const surveyToCode = new Map();

  // Schritt 1: Name-Matching mit Excel-Studien
  for (const surveyName of surveyNames) {
    const sLower = surveyName.toLowerCase();
    const match = studies.find(s => {
      const sn = (s.study_name || '').toLowerCase();
      return (sn.length >= 15 && sLower.includes(sn.slice(0, 15))) ||
             (sLower.length >= 15 && sn.includes(sLower.slice(0, 15)));
    });
    if (match) {
      surveyToCode.set(surveyName, match.study_code);
    }
  }

  // Schritt 2: Nicht gematchte Surveys -> verfuegbare oder neue Codes
  const usedCodes = new Set(surveyToCode.values());
  const availableCodes = studies.map(s => s.study_code).filter(c => !usedCodes.has(c));
  let availIdx = 0;

  for (const surveyName of surveyNames) {
    if (surveyToCode.has(surveyName)) continue;

    if (availIdx < availableCodes.length) {
      surveyToCode.set(surveyName, availableCodes[availIdx++]);
    } else {
      // Neue Studie anlegen
      const newIdx = studies.length + 1;
      const newCode = `SDDB-${String(newIdx).padStart(3, '0')}`;
      surveyToCode.set(surveyName, newCode);

      const coords = getCoords('USA', geoLookup);
      studies.push({
        study_code: newCode,
        study_name: surveyName,
        principal_investigator: null,
        institution: 'Sleep and Dream Database',
        year_start: null,
        year_end: null,
        country: 'USA',
        city: null,
        lat: coords.lat,
        lng: coords.lng,
        participant_count: null,
        total_dreams: null,
        map_color: COLORS[studies.length % COLORS.length],
        doi: null,
        publication: null,
        license: 'CC BY-NC-SA 4.0',
        description: null,
      });
      availIdx++;
    }
  }

  // Participants und Dreams aufbauen
  const participants = new Map(); // key: `${studyCode}:${respondent}` -> participant
  const dreams = [];
  const participantCounters = new Map(); // studyCode -> laufende Nr
  const dreamCounters = new Map();       // participantId -> laufende Nr

  for (const row of dataRows) {
    const surveyName = (row[surveyIdx] ?? '').trim();
    if (!surveyName) continue;

    const studyCode = surveyToCode.get(surveyName);
    if (!studyCode) continue;

    const dreamText = (row[cm.get('answer_text')] ?? '').trim();
    if (!dreamText) continue; // Kein Text -> ueberspringen

    const respondent = (row[cm.get('respondent')] ?? '').trim() || 'anonymous';
    const pKey = `${studyCode}:${respondent}`;

    // Neuen Participant anlegen
    if (!participants.has(pKey)) {
      if (!participantCounters.has(studyCode)) participantCounters.set(studyCode, 0);
      const pNum = participantCounters.get(studyCode) + 1;
      participantCounters.set(studyCode, pNum);

      const participantId = `${studyCode}-P${String(pNum).padStart(4, '0')}`;

      // Demografie aus CSV
      const gender = getCol(cm, row, 'Sex Assigned at Birth');
      const age = getCol(cm, row, 'Age') || getCol(cm, row, 'Age Range');
      const ethnicity = getCol(cm, row, 'Race/Ethnicity');
      const countryRes = getCol(cm, row, 'Country of Residence') ||
                         getCol(cm, row, 'In what country or region do you currently reside?');

      const study = studies.find(s => s.study_code === studyCode);
      const pCountry = countryRes || study?.country || 'USA';
      const coords = getCoords(pCountry, geoLookup);

      participants.set(pKey, {
        participant_id: participantId,
        study_id: null, // Wird ggf. nach Study-Insert via FK gesetzt
        study_code: studyCode,
        age: parseAge(age),
        gender: gender || null,
        ethnicity: ethnicity || null,
        country: pCountry,
        city: null,
        lat: coords.lat,
        lng: coords.lng,
        dream_count: 0,
      });
    }

    const participant = participants.get(pKey);
    participant.dream_count++;

    // Dream-ID generieren
    if (!dreamCounters.has(participant.participant_id)) {
      dreamCounters.set(participant.participant_id, 0);
    }
    const dNum = dreamCounters.get(participant.participant_id) + 1;
    dreamCounters.set(participant.participant_id, dNum);

    const dreamId = `${participant.participant_id}-D${String(dNum).padStart(4, '0')}`;

    // HVdC + Metadata extrahieren
    const hvdcCodes = extractHvdcCodes(cm, row);
    const emotions = extractEmotions(cm, row);
    const characters = extractCharacters(cm, row);
    const settings = extractSettings(cm, row);
    const themes = extractThemes(cm, row);
    const dreamDate = getCol(cm, row, 'date');

    dreams.push({
      dream_id: dreamId,
      participant_id: participant.participant_id,
      study_id: null,
      study_code: studyCode,
      dream_text: dreamText,
      original_language: 'en',
      dream_date: parseDateSafe(dreamDate),
      hall_van_de_castle_codes: hvdcCodes,
      emotions,
      characters,
      settings,
      themes,
      text_md5: md5(dreamText),
    });
  }

  // Studien-Counters aus CSV aktualisieren
  const studyParticipantCount = new Map();
  const studyDreamCount = new Map();
  for (const p of participants.values()) {
    studyParticipantCount.set(p.study_code, (studyParticipantCount.get(p.study_code) || 0) + 1);
    studyDreamCount.set(p.study_code, (studyDreamCount.get(p.study_code) || 0) + p.dream_count);
  }

  for (const study of studies) {
    if (studyParticipantCount.has(study.study_code)) {
      study.participant_count = studyParticipantCount.get(study.study_code);
    }
    if (studyDreamCount.has(study.study_code)) {
      const csvCount = studyDreamCount.get(study.study_code);
      if (!study.total_dreams || csvCount > 0) {
        study.total_dreams = csvCount;
      }
    }
  }

  return {
    participants: [...participants.values()],
    dreams,
  };
}

function parseAge(val) {
  if (!val) return null;
  if (typeof val === 'number') return val;
  const str = String(val).trim();
  // Direkte Zahl
  const num = parseInt(str);
  if (!isNaN(num) && String(num) === str) return num;
  // Range "25-34" -> Mittelpunkt
  const rangeMatch = str.match(/^(\d+)\s*[-\u2013]\s*(\d+)/);
  if (rangeMatch) return Math.round((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2);
  // "65+" -> 65
  const plusMatch = str.match(/^(\d+)\+/);
  if (plusMatch) return parseInt(plusMatch[1]);
  return null;
}

function parseDateSafe(val) {
  if (!val) return null;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Map Markers aufbauen (ein Marker pro Studie+Land)
// ---------------------------------------------------------------------------

function buildMapMarkers(studies, participants) {
  const markers = [];

  // Gruppiere Teilnehmer pro Studie+Land
  const groups = new Map();
  for (const p of participants) {
    const key = `${p.study_code}:${p.country || 'Unknown'}`;
    if (!groups.has(key)) {
      groups.set(key, {
        study_code: p.study_code,
        country: p.country,
        lat: p.lat,
        lng: p.lng,
        city: p.city,
        dreamCount: 0,
        participantCount: 0,
      });
    }
    const g = groups.get(key);
    g.dreamCount += p.dream_count;
    g.participantCount += 1;
    if (!g.lat && p.lat) { g.lat = p.lat; g.lng = p.lng; }
  }

  for (const g of groups.values()) {
    const study = studies.find(s => s.study_code === g.study_code);

    // Marker-Groesse basierend auf Traumanzahl
    let markerSize = 'small';
    if (g.dreamCount >= 1000) markerSize = 'large';
    else if (g.dreamCount >= 100) markerSize = 'medium';

    markers.push({
      study_code: g.study_code,
      participant_id: null, // Aggregierter Marker
      lat: g.lat || study?.lat || null,
      lng: g.lng || study?.lng || null,
      city: g.city || study?.city || null,
      country: g.country || study?.country || null,
      dream_count: g.dreamCount,
      map_color: study?.map_color || COLORS[0],
      marker_size: markerSize,
    });
  }

  return markers;
}

// ---------------------------------------------------------------------------
// Batched Supabase Upsert (500er Chunks)
// ---------------------------------------------------------------------------

async function batchInsert(supabase, table, rows, batchSize = BATCH_SIZE) {
  if (rows.length === 0) {
    console.log(`  [${table}] Keine Daten zum Einfuegen.`);
    return { inserted: 0, errors: 0 };
  }

  let inserted = 0;
  let errors = 0;
  const totalBatches = Math.ceil(rows.length / batchSize);

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;

    const { error } = await supabase
      .from(table)
      .upsert(batch, {
        onConflict: getConflictColumn(table),
        ignoreDuplicates: true,
      });

    if (error) {
      console.error(`  [${table}] Batch ${batchNum}/${totalBatches} FEHLER:`, error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      if (batchNum % 10 === 0 || batchNum === totalBatches) {
        console.log(`  [${table}] Batch ${batchNum}/${totalBatches} OK (${inserted}/${rows.length})`);
      }
    }
  }

  return { inserted, errors };
}

function getConflictColumn(table) {
  switch (table) {
    case 'research_studies':       return 'study_code';
    case 'research_participants':  return 'participant_id';
    case 'research_dreams':        return 'dream_id';
    case 'study_map_markers':      return 'study_code,participant_id';
    default: return undefined;
  }
}

// ---------------------------------------------------------------------------
// MD5 Verifikation (alle Traeume gegen berechneten Hash pruefen)
// ---------------------------------------------------------------------------

function verifyMD5(dreams) {
  let verified = 0;
  let mismatched = 0;

  for (const dream of dreams) {
    if (!dream.dream_text || !dream.text_md5) continue;
    const expected = md5(dream.dream_text);
    if (expected === dream.text_md5) {
      verified++;
    } else {
      mismatched++;
    }
  }

  return { verified, mismatched };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('============================================');
  console.log('  DreamCode Research Data Import');
  console.log('============================================');
  if (DRY_RUN) console.log('  *** DRY RUN -- kein DB-Insert ***\n');

  // 1. Dependencies pruefen + installieren
  await ensureDeps();

  // 2. .env laden
  try {
    const dotenv = await import('dotenv');
    dotenv.config({ path: resolve(ROOT, '.env') });
  } catch {
    loadEnvManual();
  }

  // 3. Lazy Imports (nach ensureDeps)
  const xlsx = (await import('xlsx')).default || await import('xlsx');
  const { createClient } = await import('@supabase/supabase-js');

  // -----------------------------------------------------------------------
  // [1/6] Quelldateien lesen
  // -----------------------------------------------------------------------
  console.log('\n[1/6] Lese Quelldateien...');

  const studiesJson = JSON.parse(readFileSync(PATHS.studiesJson, 'utf8'));
  const jsonStudies = studiesJson.studies || [];
  console.log(`  sddb_studies_research.json: ${jsonStudies.length} Studien`);

  const geoData = JSON.parse(readFileSync(PATHS.geoJson, 'utf8'));
  const geoLookup = buildGeoLookup(geoData);
  console.log(`  geo_complete.json: ${Object.keys(geoLookup).length} Laender mit Koordinaten`);

  const excelRows = readExcelStudies(xlsx);
  console.log(`  Excel: ${excelRows.length} Studien-Zeilen`);

  console.log('  Lese CSV (kann dauern bei 39k+ Zeilen)...');
  const csvText = readFileSync(PATHS.csv, 'utf8');
  console.log(`  CSV geladen: ${(csvText.length / 1024 / 1024).toFixed(1)} MB`);

  // -----------------------------------------------------------------------
  // [2/6] research_studies aufbauen
  // -----------------------------------------------------------------------
  console.log('\n[2/6] Erstelle research_studies...');
  const studies = buildStudies(excelRows, jsonStudies, geoLookup);
  console.log(`  ${studies.length} Studien aus Excel erstellt`);

  // -----------------------------------------------------------------------
  // [3/6] CSV parsen -> Participants + Dreams
  // -----------------------------------------------------------------------
  console.log('\n[3/6] Parse CSV -> Participants + Dreams...');
  const { participants, dreams } = processCSV(csvText, studies, geoLookup);
  console.log(`  ${participants.length} Teilnehmer`);
  console.log(`  ${dreams.length} Traeume`);

  // -----------------------------------------------------------------------
  // [4/6] Map Markers
  // -----------------------------------------------------------------------
  console.log('\n[4/6] Erstelle study_map_markers...');
  const markers = buildMapMarkers(studies, participants);
  console.log(`  ${markers.length} Marker erstellt`);

  // -----------------------------------------------------------------------
  // [5/6] MD5 Verifikation
  // -----------------------------------------------------------------------
  console.log('\n[5/6] MD5-Verifikation...');
  const md5Result = verifyMD5(dreams);
  console.log(`  Verifiziert: ${md5Result.verified} | Fehler: ${md5Result.mismatched}`);

  // -----------------------------------------------------------------------
  // [6/6] Supabase Insert
  // -----------------------------------------------------------------------
  console.log('\n[6/6] Supabase Insert...');

  if (DRY_RUN) {
    console.log('  DRY RUN -- ueberspringe DB-Insert.');
  } else {
    const supabaseUrl = getEnv('VITE_SUPABASE_URL');
    const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('\n  Tabelle: research_studies');
    const studyResult = await batchInsert(supabase, 'research_studies', studies);

    console.log('\n  Tabelle: research_participants');
    const partResult = await batchInsert(supabase, 'research_participants', participants);

    console.log('\n  Tabelle: research_dreams');
    const dreamResult = await batchInsert(supabase, 'research_dreams', dreams);

    console.log('\n  Tabelle: study_map_markers');
    const markerResult = await batchInsert(supabase, 'study_map_markers', markers);

    console.log('\n--------------------------------------------');
    console.log('  IMPORT ERGEBNIS');
    console.log('--------------------------------------------');
    console.log(`  research_studies:       ${studyResult.inserted} OK, ${studyResult.errors} Fehler`);
    console.log(`  research_participants:  ${partResult.inserted} OK, ${partResult.errors} Fehler`);
    console.log(`  research_dreams:        ${dreamResult.inserted} OK, ${dreamResult.errors} Fehler`);
    console.log(`  study_map_markers:      ${markerResult.inserted} OK, ${markerResult.errors} Fehler`);
  }

  // -----------------------------------------------------------------------
  // Zusammenfassung (wird immer ausgegeben)
  // -----------------------------------------------------------------------
  console.log('\n============================================');
  console.log('  ZUSAMMENFASSUNG');
  console.log('============================================');
  console.log(`  Studien:        ${studies.length}`);
  console.log(`  Teilnehmer:     ${participants.length}`);
  console.log(`  Traeume:        ${dreams.length}`);
  console.log(`  Map-Marker:     ${markers.length}`);
  console.log(`  MD5 OK:         ${md5Result.verified}`);
  console.log(`  MD5 Fehler:     ${md5Result.mismatched}`);

  const uniqueSurveys = new Set(dreams.map(d => d.study_code));
  console.log(`  Unique Surveys: ${uniqueSurveys.size}`);

  // Top-5 Studien nach Traumanzahl
  const top5 = studies
    .filter(s => s.total_dreams)
    .sort((a, b) => (b.total_dreams || 0) - (a.total_dreams || 0))
    .slice(0, 5);
  if (top5.length > 0) {
    console.log('\n  Top-5 Studien (nach Traumanzahl):');
    for (const s of top5) {
      console.log(`    ${s.study_code} ${s.study_name}: ${s.total_dreams} Traeume`);
    }
  }

  console.log('\n  Fertig.');
}

main().catch(err => {
  console.error('\n[FATAL]', err);
  process.exit(1);
});
