-- Universal Translation Layer — Cache-Tabelle
-- Ausfuehren in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS translations_cache (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_table  TEXT NOT NULL,
  source_id     UUID NOT NULL,
  source_field  TEXT NOT NULL,
  source_lang   TEXT NOT NULL DEFAULT 'en',
  target_lang   TEXT NOT NULL,
  translated    TEXT NOT NULL,
  translated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_table, source_id, source_field, target_lang)
);

CREATE INDEX IF NOT EXISTS idx_translations_lookup
  ON translations_cache(source_table, source_id, target_lang);

-- RPC: Uebersetzung holen oder null zurueckgeben
CREATE OR REPLACE FUNCTION get_translation(
  p_table TEXT, p_id UUID, p_field TEXT, p_lang TEXT
) RETURNS TEXT AS $$
  SELECT translated FROM translations_cache
  WHERE source_table = p_table
    AND source_id = p_id
    AND source_field = p_field
    AND target_lang = p_lang
  LIMIT 1;
$$ LANGUAGE sql STABLE;
