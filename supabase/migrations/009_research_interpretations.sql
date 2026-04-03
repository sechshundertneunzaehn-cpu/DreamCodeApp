-- Research Interpretations: AI-generierte Deutungen fuer Forschungstraeume
-- Separate Tabelle weil interpretations.dream_id FK auf user_dreams zeigt

CREATE TABLE IF NOT EXISTS research_interpretations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id uuid NOT NULL REFERENCES research_dreams(id) ON DELETE CASCADE,
  participant_id text NOT NULL,
  study_id uuid,
  content text NOT NULL,
  tradition text NOT NULL DEFAULT 'scientific',
  created_at timestamptz DEFAULT now(),
  UNIQUE(dream_id)
);

CREATE INDEX IF NOT EXISTS idx_research_interp_participant ON research_interpretations(participant_id);
CREATE INDEX IF NOT EXISTS idx_research_interp_dream ON research_interpretations(dream_id);

-- RLS: Oeffentlich lesbar (Forschungsdaten)
ALTER TABLE research_interpretations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "research_interpretations_public_read"
  ON research_interpretations FOR SELECT USING (true);

-- Service-Role darf inserten (fuer Batch-Script)
CREATE POLICY "research_interpretations_service_insert"
  ON research_interpretations FOR INSERT WITH CHECK (true);

CREATE POLICY "research_interpretations_service_update"
  ON research_interpretations FOR UPDATE USING (true);
