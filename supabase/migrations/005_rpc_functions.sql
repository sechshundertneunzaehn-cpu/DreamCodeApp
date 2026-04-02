-- =============================================================
-- Migration 005: RPC-Funktionen
-- Zweck: Server-seitige Funktionen fuer Embedding-Suche,
--        Statistiken und Trenddaten
-- =============================================================


-- -------------------------------------------------------------
-- Funktion: match_dreams
-- Sucht aehnliche Traumberichte in der Referenzdatenbank
-- basierend auf einem Embedding-Vektor (Kosinus-Aehnlichkeit)
-- -------------------------------------------------------------
create or replace function match_dreams(
  query_embedding   vector(768),
  match_threshold   float   default 0.5,
  match_count       int     default 15,
  filter_language   text    default null
)
returns table (
  id            uuid,
  text          text,
  source_name   text,
  similarity    float,
  tags          text[],
  themes        text[]
)
language plpgsql
as $$
begin
  return query
  select
    dr.id,
    dr.text,
    dr.source_name,
    -- Kosinus-Aehnlichkeit: 1 minus Kosinus-Distanz (Operator <=>)
    1 - (dr.embedding <=> query_embedding) as similarity,
    dr.tags,
    dr.themes
  from dream_reports dr
  where dr.embedding is not null
    -- Schwellenwert-Filter: Nur Ergebnisse ueber match_threshold
    and 1 - (dr.embedding <=> query_embedding) > match_threshold
    -- Optionaler Sprachfilter
    and (filter_language is null or dr.language = filter_language)
  -- Aufsteigend nach Distanz sortieren = absteigende Aehnlichkeit
  order by dr.embedding <=> query_embedding
  limit match_count;
end;
$$;

comment on function match_dreams is
  'Sucht semantisch aehnliche Traumberichte in dream_reports via Kosinus-Aehnlichkeit. '
  'Gibt die match_count aehnlichsten Berichte zurueck, gefiltert nach match_threshold.';


-- -------------------------------------------------------------
-- Funktion: match_user_dreams
-- Sucht aehnliche Traeume in der Nutzerdatenbank.
-- Nur oeffentliche Traeume werden beruecksichtigt (is_public = true),
-- es sei denn, ein expliziter user_id-Filter wird gesetzt.
-- -------------------------------------------------------------
create or replace function match_user_dreams(
  query_embedding   vector(768),
  match_threshold   float   default 0.5,
  match_count       int     default 15,
  filter_user_id    uuid    default null,
  filter_language   text    default null
)
returns table (
  id              uuid,
  text            text,
  anonymous_name  text,
  similarity      float,
  mood            text,
  category        text,
  created_at      timestamptz
)
language plpgsql
as $$
begin
  return query
  select
    ud.id,
    ud.text,
    ud.anonymous_name,
    1 - (ud.embedding <=> query_embedding) as similarity,
    ud.mood,
    ud.category,
    ud.created_at
  from user_dreams ud
  where ud.embedding is not null
    and 1 - (ud.embedding <=> query_embedding) > match_threshold
    -- Nur oeffentliche Traeume ODER Traeume des angemeldeten Nutzers
    and (ud.is_public = true or ud.user_id = filter_user_id)
    and (filter_language is null or ud.language = filter_language)
  order by ud.embedding <=> query_embedding
  limit match_count;
end;
$$;

comment on function match_user_dreams is
  'Sucht semantisch aehnliche Traeume in user_dreams via Kosinus-Aehnlichkeit. '
  'Beruecksichtigt nur oeffentliche Traeume oder Traeume des angegebenen Nutzers.';


-- -------------------------------------------------------------
-- Funktion: get_dream_stats
-- Gibt aggregierte Statistiken zur Plattform zurueck:
-- - Gesamtzahl Traeume
-- - Heute eingereichte Traeume
-- - Top 5 Themen der letzten 7 Tage
-- -------------------------------------------------------------
create or replace function get_dream_stats()
returns json
language plpgsql
as $$
declare
  total_dreams        bigint;
  dreams_today        bigint;
  total_reports       bigint;
  trending_themes_arr json;
begin
  -- Gesamtzahl Nutzertraeume
  select count(*) into total_dreams from user_dreams;

  -- Nutzertraeume von heute (UTC)
  select count(*) into dreams_today
  from user_dreams
  where created_at >= current_date;

  -- Gesamtzahl Referenzberichte
  select count(*) into total_reports from dream_reports;

  -- Top 5 Trend-Themen der letzten 7 Tage aus Referenzberichten
  select json_agg(theme_data)
  into trending_themes_arr
  from (
    select
      unnest(themes) as theme,
      count(*) as count
    from dream_reports
    where created_at >= now() - interval '7 days'
      and themes is not null
      and array_length(themes, 1) > 0
    group by theme
    order by count desc
    limit 5
  ) as theme_data;

  return json_build_object(
    'total_user_dreams',    total_dreams,
    'dreams_today',         dreams_today,
    'total_dream_reports',  total_reports,
    'trending_themes',      coalesce(trending_themes_arr, '[]'::json)
  );
end;
$$;

comment on function get_dream_stats is
  'Gibt aggregierte Plattformstatistiken zurueck: Gesamtzahl Traeume, '
  'heutige Einreichungen und aktuelle Referenzberichtsanzahl.';


-- -------------------------------------------------------------
-- Funktion: get_trending_themes
-- Top 10 Themen der letzten 7 Tage aus dream_reports,
-- sortiert nach Haeufigkeit
-- -------------------------------------------------------------
create or replace function get_trending_themes(
  days_back   int  default 7,
  top_n       int  default 10
)
returns table (
  theme   text,
  count   bigint
)
language plpgsql
as $$
begin
  return query
  select
    unnest(dr.themes) as theme,
    count(*) as count
  from dream_reports dr
  where dr.created_at >= now() - (days_back || ' days')::interval
    and dr.themes is not null
    and array_length(dr.themes, 1) > 0
  group by theme
  order by count desc
  limit top_n;
end;
$$;

comment on function get_trending_themes is
  'Gibt die Top-N Themen der letzten days_back Tage aus dream_reports zurueck. '
  'Standardmaessig: Top 10 der letzten 7 Tage.';
