-- ============================================================
-- Knowledge Graph Schema for DreamCode
-- Adds symbol extraction, cultural interpretations, and
-- emotion tracking to power the interactive knowledge graph.
-- ============================================================

-- Symbole die aus Traeumen extrahiert werden
CREATE TABLE IF NOT EXISTS dream_symbols (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_normalized TEXT NOT NULL,
  kategorie TEXT,
  element TEXT,
  emoji TEXT,
  frequency INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_symbols_name_normalized ON dream_symbols(name_normalized);
CREATE INDEX IF NOT EXISTS idx_symbols_kategorie ON dream_symbols(kategorie);
CREATE INDEX IF NOT EXISTS idx_symbols_frequency ON dream_symbols(frequency DESC);

-- Verknuepfung: Welcher Traum enthaelt welches Symbol
CREATE TABLE IF NOT EXISTS dream_symbol_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dream_id UUID REFERENCES user_dreams(id) ON DELETE CASCADE,
  symbol_id UUID REFERENCES dream_symbols(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  confidence FLOAT DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dream_id, symbol_id)
);

CREATE INDEX IF NOT EXISTS idx_symbol_links_symbol ON dream_symbol_links(symbol_id);
CREATE INDEX IF NOT EXISTS idx_symbol_links_user ON dream_symbol_links(user_id);
CREATE INDEX IF NOT EXISTS idx_symbol_links_dream ON dream_symbol_links(dream_id);

-- Kulturelle Deutungen pro Symbol
CREATE TABLE IF NOT EXISTS symbol_interpretations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol_id UUID REFERENCES dream_symbols(id) ON DELETE CASCADE,
  culture_key TEXT NOT NULL,
  culture_label TEXT NOT NULL,
  interpretation_summary TEXT,
  interpretation_full TEXT,
  source_file TEXT,
  language TEXT DEFAULT 'de',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(symbol_id, culture_key, language)
);

CREATE INDEX IF NOT EXISTS idx_interpretations_symbol ON symbol_interpretations(symbol_id);
CREATE INDEX IF NOT EXISTS idx_interpretations_culture ON symbol_interpretations(culture_key);

-- Emotionen aus Traeumen
CREATE TABLE IF NOT EXISTS dream_emotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dream_id UUID REFERENCES user_dreams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion TEXT NOT NULL,
  intensity FLOAT DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emotions_dream ON dream_emotions(dream_id);
CREATE INDEX IF NOT EXISTS idx_emotions_user ON dream_emotions(user_id);
CREATE INDEX IF NOT EXISTS idx_emotions_emotion ON dream_emotions(emotion);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE dream_symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_symbol_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE symbol_interpretations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_emotions ENABLE ROW LEVEL SECURITY;

-- dream_symbols: public read
CREATE POLICY "symbols_public_read" ON dream_symbols
  FOR SELECT USING (true);

CREATE POLICY "symbols_service_write" ON dream_symbols
  FOR ALL USING (auth.role() = 'service_role');

-- symbol_interpretations: public read
CREATE POLICY "interpretations_public_read" ON symbol_interpretations
  FOR SELECT USING (true);

CREATE POLICY "interpretations_service_write" ON symbol_interpretations
  FOR ALL USING (auth.role() = 'service_role');

-- dream_symbol_links: read own + aggregated public
CREATE POLICY "symbol_links_read_own" ON dream_symbol_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "symbol_links_public_aggregate" ON dream_symbol_links
  FOR SELECT USING (true);

CREATE POLICY "symbol_links_service_write" ON dream_symbol_links
  FOR ALL USING (auth.role() = 'service_role');

-- dream_emotions: read own + public aggregate
CREATE POLICY "emotions_read_own" ON dream_emotions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "emotions_public_aggregate" ON dream_emotions
  FOR SELECT USING (true);

CREATE POLICY "emotions_service_write" ON dream_emotions
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- RPC: Graph-Daten in einem Call laden (Performance)
-- ============================================================

CREATE OR REPLACE FUNCTION get_graph_data(p_limit INTEGER DEFAULT 50)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  WITH top_symbols AS (
    SELECT id, name, name_normalized, kategorie, element, emoji, frequency
    FROM dream_symbols
    ORDER BY frequency DESC
    LIMIT p_limit
  ),
  symbol_cultures AS (
    SELECT si.symbol_id, si.culture_key, si.culture_label, si.interpretation_summary
    FROM symbol_interpretations si
    WHERE si.symbol_id IN (SELECT id FROM top_symbols)
  ),
  symbol_dreamers AS (
    SELECT DISTINCT dsl.symbol_id, dsl.user_id, p.display_name, p.avatar_url
    FROM dream_symbol_links dsl
    LEFT JOIN profiles p ON p.id = dsl.user_id
    WHERE dsl.symbol_id IN (SELECT id FROM top_symbols)
  ),
  symbol_emotions AS (
    SELECT DISTINCT de.emotion, de.dream_id, dsl.symbol_id
    FROM dream_emotions de
    JOIN dream_symbol_links dsl ON dsl.dream_id = de.dream_id
    WHERE dsl.symbol_id IN (SELECT id FROM top_symbols)
  )
  SELECT jsonb_build_object(
    'symbols', COALESCE((SELECT jsonb_agg(row_to_json(ts)) FROM top_symbols ts), '[]'::jsonb),
    'cultures', COALESCE((SELECT jsonb_agg(row_to_json(sc)) FROM symbol_cultures sc), '[]'::jsonb),
    'dreamers', COALESCE((SELECT jsonb_agg(row_to_json(sd)) FROM symbol_dreamers sd), '[]'::jsonb),
    'emotions', COALESCE((SELECT jsonb_agg(DISTINCT row_to_json(se)) FROM symbol_emotions se), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;
