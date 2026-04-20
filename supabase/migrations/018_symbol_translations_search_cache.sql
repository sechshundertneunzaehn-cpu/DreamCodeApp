-- =============================================================
-- Migration 018: symbol_translations + search_query_cache
-- Zweck: Multilinguale Suche (Task 4) — mehrsprachige Symbol-
--        Benennungen und Cache fuer uebersetzte User-Queries.
-- =============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- -------------------------------------------------------------
-- symbol_translations: mehrsprachige Namen fuer dream_symbols
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS symbol_translations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id        UUID NOT NULL REFERENCES dream_symbols(id) ON DELETE CASCADE,
  language_code    TEXT NOT NULL,
  translated_name  TEXT NOT NULL,
  aliases          JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (symbol_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_symtrans_lower_name
  ON symbol_translations (LOWER(translated_name));
CREATE INDEX IF NOT EXISTS idx_symtrans_trgm
  ON symbol_translations USING gin (translated_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_symtrans_aliases
  ON symbol_translations USING gin (aliases);
CREATE INDEX IF NOT EXISTS idx_symtrans_lang
  ON symbol_translations (language_code);

ALTER TABLE symbol_translations ENABLE ROW LEVEL SECURITY;

-- Lesen: anon + authenticated
CREATE POLICY "symbol_translations_select_public"
  ON symbol_translations FOR SELECT
  USING (TRUE);

-- Schreiben: nur service_role (RLS blockt anon/authenticated fuer
-- INSERT/UPDATE/DELETE, da keine Policy existiert).

-- -------------------------------------------------------------
-- search_query_cache: normalisierte User-Queries + Treffer
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS search_query_cache (
  query_hash          TEXT PRIMARY KEY,
  original_query      TEXT NOT NULL,
  original_locale     TEXT NOT NULL,
  normalized_en       TEXT,
  matched_symbol_ids  JSONB NOT NULL DEFAULT '[]'::jsonb,
  hit_count           INT NOT NULL DEFAULT 1,
  last_hit_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sqc_last_hit
  ON search_query_cache (last_hit_at);

ALTER TABLE search_query_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "search_query_cache_select_public"
  ON search_query_cache FOR SELECT
  USING (TRUE);

-- Schreiben: nur service_role.
