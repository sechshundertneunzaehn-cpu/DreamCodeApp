-- ============================================================
-- Migration 014: Zeitfilter fuer Knowledge Graph
-- Dynamische Symbol-Aggregation aus gefiltertem Dream-Set
-- statt statischer frequency-Spalte.
-- ============================================================

-- Fehlende Composite-Indexes fuer performante Joins
CREATE INDEX IF NOT EXISTS idx_symbol_links_dream_symbol
  ON dream_symbol_links(dream_id, symbol_id);

-- RPC: Graph-Daten mit optionalem Zeitfilter
-- p_years = NULL → alle Traeume (kein Filter)
-- p_years = 1   → nur Traeume der letzten 12 Monate
-- p_years = 5   → nur Traeume der letzten 5 Jahre
CREATE OR REPLACE FUNCTION get_graph_data_filtered(
  p_limit INTEGER DEFAULT 50,
  p_years INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Traeume koennen in user_dreams ODER research_dreams liegen.
  -- dream_symbol_links.dream_id verweist auf beide Tabellen.
  WITH filtered_dream_ids AS (
    -- user_dreams
    SELECT id FROM user_dreams
    WHERE CASE
      WHEN p_years IS NOT NULL AND p_years > 0
        THEN created_at > NOW() - (p_years || ' years')::INTERVAL
      ELSE true
    END
    UNION
    -- research_dreams
    SELECT id FROM research_dreams
    WHERE CASE
      WHEN p_years IS NOT NULL AND p_years > 0
        THEN created_at > NOW() - (p_years || ' years')::INTERVAL
      ELSE true
    END
  ),
  symbol_counts AS (
    SELECT dsl.symbol_id, COUNT(DISTINCT dsl.dream_id) AS dream_count
    FROM dream_symbol_links dsl
    WHERE dsl.dream_id IN (SELECT id FROM filtered_dream_ids)
    GROUP BY dsl.symbol_id
  ),
  top_symbols AS (
    SELECT
      ds.id,
      ds.name,
      ds.name_normalized,
      ds.kategorie,
      ds.element,
      ds.emoji,
      sc.dream_count AS frequency
    FROM dream_symbols ds
    JOIN symbol_counts sc ON sc.symbol_id = ds.id
    ORDER BY sc.dream_count DESC
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
      AND dsl.dream_id IN (SELECT id FROM filtered_dream_ids)
  ),
  symbol_emotions AS (
    SELECT DISTINCT de.emotion, de.dream_id, dsl.symbol_id
    FROM dream_emotions de
    JOIN dream_symbol_links dsl ON dsl.dream_id = de.dream_id
    WHERE dsl.symbol_id IN (SELECT id FROM top_symbols)
      AND de.dream_id IN (SELECT id FROM filtered_dream_ids)
  )
  SELECT jsonb_build_object(
    'symbols',  COALESCE((SELECT jsonb_agg(row_to_json(ts)::jsonb) FROM top_symbols ts), '[]'::jsonb),
    'cultures', COALESCE((SELECT jsonb_agg(row_to_json(sc)::jsonb) FROM symbol_cultures sc), '[]'::jsonb),
    'dreamers', COALESCE((SELECT jsonb_agg(row_to_json(sd)::jsonb) FROM symbol_dreamers sd), '[]'::jsonb),
    'emotions', COALESCE((SELECT jsonb_agg(row_to_json(se)::jsonb) FROM symbol_emotions se), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;
