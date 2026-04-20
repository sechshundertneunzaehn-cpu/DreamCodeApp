-- =============================================================
-- Migration 007: Wissenschaftliche Forschungsdaten
-- DreamData Research Institute
-- =============================================================

-- Aufgabe 1: Fake-Bot Daten bereinigen
DELETE FROM dream_reports
WHERE source_name IS NULL
   OR source_name LIKE '%bot%'
   OR source_name LIKE '%fake%'
   OR source_name LIKE '%synthetic%';

-- Wissenschaftliche Studien
CREATE TABLE IF NOT EXISTS research_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_code VARCHAR(20) UNIQUE NOT NULL,
  study_name TEXT NOT NULL,
  principal_investigator TEXT,
  institution TEXT,
  year_start INTEGER,
  year_end INTEGER,
  country TEXT,
  city TEXT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  participant_count INTEGER,
  total_dreams INTEGER,
  map_color VARCHAR(7),
  doi TEXT,
  publication TEXT,
  license TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Anonyme Teilnehmer
CREATE TABLE IF NOT EXISTS research_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id VARCHAR(50) UNIQUE NOT NULL,
  study_id UUID REFERENCES research_studies(id),
  study_code VARCHAR(20),
  age INTEGER,
  gender VARCHAR(20),
  ethnicity TEXT,
  country TEXT,
  city TEXT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  study_duration_days INTEGER,
  dream_count INTEGER,
  notes TEXT
);

-- Traumberichte 1:1 Original
CREATE TABLE IF NOT EXISTS research_dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id VARCHAR(50) UNIQUE NOT NULL,
  participant_id VARCHAR(50) REFERENCES research_participants(participant_id),
  study_id UUID REFERENCES research_studies(id),
  study_code VARCHAR(20),
  dream_text TEXT NOT NULL,
  original_language VARCHAR(10) DEFAULT 'en',
  dream_date DATE,
  dream_week INTEGER,
  dream_night INTEGER,
  hall_van_de_castle_codes JSONB,
  emotions TEXT[],
  characters TEXT[],
  settings TEXT[],
  themes TEXT[],
  scientific_interpretation TEXT,
  interpretation_by TEXT,
  interpretation_date DATE,
  source_page TEXT,
  text_md5 VARCHAR(32),
  verified_by_watchdog BOOLEAN DEFAULT false,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Karten-Pins
CREATE TABLE IF NOT EXISTS study_map_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_code VARCHAR(20),
  participant_id VARCHAR(50),
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  city TEXT,
  country TEXT,
  dream_count INTEGER,
  map_color VARCHAR(7),
  marker_size INTEGER DEFAULT 8
);

-- Indexes
CREATE INDEX IF NOT EXISTS research_dreams_study_code_idx ON research_dreams(study_code);
CREATE INDEX IF NOT EXISTS research_dreams_participant_idx ON research_dreams(participant_id);
CREATE INDEX IF NOT EXISTS research_dreams_md5_idx ON research_dreams(text_md5);
CREATE INDEX IF NOT EXISTS research_participants_study_idx ON research_participants(study_code);
CREATE INDEX IF NOT EXISTS study_map_markers_study_idx ON study_map_markers(study_code);
CREATE INDEX IF NOT EXISTS research_studies_code_idx ON research_studies(study_code);

-- RLS Policies (lesend fuer alle)
ALTER TABLE research_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_map_markers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "research_studies_public_read" ON research_studies FOR SELECT USING (true);
CREATE POLICY "research_participants_public_read" ON research_participants FOR SELECT USING (true);
CREATE POLICY "research_dreams_public_read" ON research_dreams FOR SELECT USING (true);
CREATE POLICY "study_map_markers_public_read" ON study_map_markers FOR SELECT USING (true);

-- Kommentare
COMMENT ON TABLE research_studies IS 'Wissenschaftliche Traumstudien aus SDDb, DreamBank, Dryad etc.';
COMMENT ON TABLE research_participants IS 'Anonymisierte Studienteilnehmer';
COMMENT ON TABLE research_dreams IS 'Original-Traumberichte 1:1 unveraendert';
COMMENT ON TABLE study_map_markers IS 'Kartenmarker fuer die Weltkarte';
