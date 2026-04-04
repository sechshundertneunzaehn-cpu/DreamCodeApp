import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Known institution coordinates
const INSTITUTION_MAP = [
  { match: /sleep\s*(and|&)\s*dream\s*database/i,          lat: 37.87, lng: -122.27 }, // Berkeley, CA
  { match: /kelly\s*bulkeley/i,                             lat: 37.87, lng: -122.27 },
  { match: /central\s*institute\s*of\s*mental\s*health/i,   lat: 49.49, lng: 8.47   }, // Mannheim
  { match: /mannheim/i,                                      lat: 49.49, lng: 8.47   },
  { match: /santa\s*clara\s*university/i,                   lat: 37.35, lng: -121.94 },
  { match: /saybrook\s*university/i,                        lat: 37.77, lng: -122.42 }, // Oakland/SF
  { match: /monash\s*university/i,                          lat: -37.91, lng: 145.13 }, // Melbourne
  { match: /baylor/i,                                        lat: 31.55, lng: -97.14  }, // Waco, TX
  { match: /university\s*of\s*virginia/i,                   lat: 38.03, lng: -78.51  },
  { match: /harvard/i,                                       lat: 42.37, lng: -71.12  },
  { match: /mit\b/i,                                         lat: 42.36, lng: -71.09  },
  { match: /massachusetts\s*institute/i,                    lat: 42.36, lng: -71.09  },
];

// Country-based fallback coordinates
const COUNTRY_COORDS = {
  'nepal':       { lat: 27.72, lng: 85.32  },  // Kathmandu
  'australia':   { lat: -37.91, lng: 145.13 }, // Melbourne
  'germany':     { lat: 50.11, lng: 8.68    }, // Frankfurt
  'uk':          { lat: 51.51, lng: -0.13   }, // London
  'canada':      { lat: 43.65, lng: -79.38  }, // Toronto
  'india':       { lat: 28.61, lng: 77.21   }, // New Delhi
  'japan':       { lat: 35.68, lng: 139.69  }, // Tokyo
  'china':       { lat: 39.90, lng: 116.40  }, // Beijing
  'brazil':      { lat: -23.55, lng: -46.63 }, // Sao Paulo
  'france':      { lat: 48.86, lng: 2.35    }, // Paris
  'italy':       { lat: 41.90, lng: 12.50   }, // Rome
  'spain':       { lat: 40.42, lng: -3.70   }, // Madrid
  'netherlands': { lat: 52.37, lng: 4.90    }, // Amsterdam
  'switzerland': { lat: 47.38, lng: 8.54    }, // Zurich
  'sweden':      { lat: 59.33, lng: 18.07   }, // Stockholm
  'south korea': { lat: 37.57, lng: 126.98  }, // Seoul
  'mexico':      { lat: 19.43, lng: -99.13  }, // Mexico City
  'argentina':   { lat: -34.60, lng: -58.38 }, // Buenos Aires
  'israel':      { lat: 32.07, lng: 34.78   }, // Tel Aviv
  'turkey':      { lat: 41.01, lng: 28.98   }, // Istanbul
};

// US research cities for scatter
const US_CITIES = [
  { lat: 37.77, lng: -122.42 }, // San Francisco
  { lat: 40.71, lng: -74.01  }, // New York
  { lat: 41.88, lng: -87.63  }, // Chicago
  { lat: 34.05, lng: -118.24 }, // Los Angeles
  { lat: 42.36, lng: -71.06  }, // Boston
  { lat: 39.74, lng: -104.99 }, // Denver
  { lat: 47.61, lng: -122.33 }, // Seattle
  { lat: 38.91, lng: -77.04  }, // DC
];

let cityIndex = 0;

function scatter(lat, lng, range = 0.5) {
  return {
    lat: lat + (Math.random() - 0.5) * 2 * range,
    lng: lng + (Math.random() - 0.5) * 2 * range,
  };
}

function resolveCoords(study) {
  const text = [
    study.institution || '',
    study.principal_investigator || '',
    study.study_name || '',
    study.city || '',
    study.description || '',
  ].join(' ');

  // Check known institutions first
  for (const entry of INSTITUTION_MAP) {
    if (entry.match.test(text)) {
      return scatter(entry.lat, entry.lng, 0.05); // small scatter for known
    }
  }

  // Check country
  const country = (study.country || '').toLowerCase().trim();
  for (const [key, coords] of Object.entries(COUNTRY_COORDS)) {
    if (country.includes(key) || key.includes(country)) {
      if (key === 'nepal' || country === 'nepal') {
        return scatter(coords.lat, coords.lng, 0.3);
      }
      return scatter(coords.lat, coords.lng, 0.5);
    }
  }

  // USA fallback — or if country contains "us", "usa", "united states", or is empty (most studies are US-based)
  if (!country || /^(us|usa|united\s*states)/i.test(country)) {
    const city = US_CITIES[cityIndex % US_CITIES.length];
    cityIndex++;
    return scatter(city.lat, city.lng, 0.5);
  }

  // True unknown — scatter around world center with large offset
  return scatter(30, 0, 30);
}

async function main() {
  console.log('Fetching research_studies...');
  const { data: studies, error: studiesErr } = await supabase
    .from('research_studies')
    .select('study_code, study_name, institution, principal_investigator, country, city, description');

  if (studiesErr) {
    console.error('Fehler beim Laden der Studies:', studiesErr.message);
    process.exit(1);
  }
  console.log(`${studies.length} Studies geladen.`);

  // Build study_code -> coords map
  const coordsMap = new Map();
  for (const study of studies) {
    const coords = resolveCoords(study);
    coordsMap.set(study.study_code, coords);
    console.log(`  ${study.study_code}: ${study.institution || '(kein Institut)'} -> (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
  }

  // Update research_studies itself (also has lat/lng)
  console.log('\nUpdating research_studies...');
  let studyUpdated = 0;
  let studyErrors = 0;
  for (const [studyCode, coords] of coordsMap) {
    const { error } = await supabase
      .from('research_studies')
      .update({ lat: coords.lat, lng: coords.lng })
      .eq('study_code', studyCode);

    if (error) {
      console.error(`  FEHLER Study ${studyCode}:`, error.message);
      studyErrors++;
    } else {
      studyUpdated++;
    }
  }
  console.log(`research_studies: ${studyUpdated} aktualisiert, ${studyErrors} Fehler.`);

  // Update study_map_markers
  console.log('\nUpdating study_map_markers...');
  let markerUpdated = 0;
  let markerErrors = 0;
  for (const [studyCode, coords] of coordsMap) {
    const { error } = await supabase
      .from('study_map_markers')
      .update({ lat: coords.lat, lng: coords.lng })
      .eq('study_code', studyCode);

    if (error) {
      console.error(`  FEHLER Marker ${studyCode}:`, error.message);
      markerErrors++;
    } else {
      markerUpdated++;
    }
  }
  console.log(`study_map_markers: ${markerUpdated} aktualisiert, ${markerErrors} Fehler.`);

  // Update research_participants
  console.log('\nUpdating research_participants...');
  let partUpdated = 0;
  let partErrors = 0;
  for (const [studyCode, coords] of coordsMap) {
    const { error } = await supabase
      .from('research_participants')
      .update({ lat: coords.lat, lng: coords.lng })
      .eq('study_code', studyCode);

    if (error) {
      console.error(`  FEHLER Participant ${studyCode}:`, error.message);
      partErrors++;
    } else {
      partUpdated++;
    }
  }
  console.log(`research_participants: ${partUpdated} aktualisiert, ${partErrors} Fehler.`);

  // Verification
  console.log('\nVerifikation...');
  const { data: placeholders } = await supabase
    .from('study_map_markers')
    .select('study_code, lat, lng')
    .gte('lat', 37.08)
    .lte('lat', 37.10)
    .gte('lng', -95.72)
    .lte('lng', -95.70);

  console.log(`Noch ${placeholders?.length || 0} Marker mit Placeholder-Koordinaten (37.09, -95.71).`);
  console.log('\nFertig.');
}

main().catch(err => {
  console.error('Unerwarteter Fehler:', err);
  process.exit(1);
});
