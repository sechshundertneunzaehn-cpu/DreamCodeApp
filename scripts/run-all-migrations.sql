-- ================================================================
-- DreamCodeApp: KOMPLETTES DATENBANKSCHEMA
-- Kopiere dieses gesamte Script in den Supabase SQL Editor
-- und klicke "Run" (Ctrl+Enter)
-- ================================================================

-- 001: pgvector aktivieren
create extension if not exists vector with schema extensions;

-- 002: Tabelle dream_reports
create table if not exists dream_reports (
  id              uuid        primary key default gen_random_uuid(),
  text            text        not null,
  source_name     text        not null,
  source_url      text,
  language        text        default 'en',
  tags            text[]      default '{}',
  themes          text[]      default '{}',
  embedding       vector(768),
  word_count      integer,
  survey_name     text,
  respondent_id   text,
  dream_date      timestamptz,
  metadata        jsonb       default '{}',
  created_at      timestamptz default now()
);

create index if not exists dream_reports_embedding_hnsw_idx
  on dream_reports using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);
create index if not exists dream_reports_tags_gin_idx
  on dream_reports using gin (tags);
create index if not exists dream_reports_themes_gin_idx
  on dream_reports using gin (themes);
create index if not exists dream_reports_source_name_idx
  on dream_reports (source_name);
create index if not exists dream_reports_language_idx
  on dream_reports (language);

-- 003: Tabelle user_dreams
create table if not exists user_dreams (
  id              uuid          primary key default gen_random_uuid(),
  user_id         uuid          references auth.users(id) on delete cascade,
  text            text          not null,
  embedding       vector(768),
  interpretation  text,
  sources_used    jsonb         default '[]',
  language        text          default 'de',
  mood            text,
  category        text,
  is_public       boolean       default false,
  anonymous_name  text,
  country_code    text,
  city            text,
  latitude        double precision,
  longitude       double precision,
  created_at      timestamptz   default now()
);

create index if not exists user_dreams_embedding_hnsw_idx
  on user_dreams using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);
create index if not exists user_dreams_user_id_idx on user_dreams (user_id);
create index if not exists user_dreams_is_public_idx on user_dreams (is_public) where is_public = true;
create index if not exists user_dreams_created_at_idx on user_dreams (created_at desc);
create index if not exists user_dreams_country_code_idx on user_dreams (country_code) where country_code is not null;

-- 004: Tabelle interpretations
create table if not exists interpretations (
  id              uuid          primary key default gen_random_uuid(),
  dream_id        uuid          not null references user_dreams(id) on delete cascade,
  content         text          not null,
  citations       jsonb         default '[]',
  tradition       text          not null,
  model_used      text          default 'gemini-2.5-flash',
  tokens_used     integer,
  cost_estimate   numeric(10,6),
  created_at      timestamptz   default now()
);

create index if not exists interpretations_dream_id_idx on interpretations (dream_id);
create index if not exists interpretations_tradition_idx on interpretations (tradition);

-- 005: RPC Funktionen
create or replace function match_dreams(
  query_embedding vector(768),
  match_threshold float default 0.5,
  match_count int default 15,
  filter_language text default null
)
returns table (id uuid, text text, source_name text, similarity float, tags text[], themes text[])
language plpgsql as $$
begin
  return query
  select dr.id, dr.text, dr.source_name,
    1 - (dr.embedding <=> query_embedding) as similarity,
    dr.tags, dr.themes
  from dream_reports dr
  where dr.embedding is not null
    and 1 - (dr.embedding <=> query_embedding) > match_threshold
    and (filter_language is null or dr.language = filter_language)
  order by dr.embedding <=> query_embedding
  limit match_count;
end; $$;

create or replace function match_user_dreams(
  query_embedding vector(768),
  match_threshold float default 0.5,
  match_count int default 15,
  filter_user_id uuid default null,
  filter_language text default null
)
returns table (id uuid, text text, anonymous_name text, similarity float, mood text, category text, created_at timestamptz)
language plpgsql as $$
begin
  return query
  select ud.id, ud.text, ud.anonymous_name,
    1 - (ud.embedding <=> query_embedding) as similarity,
    ud.mood, ud.category, ud.created_at
  from user_dreams ud
  where ud.embedding is not null
    and 1 - (ud.embedding <=> query_embedding) > match_threshold
    and (ud.is_public = true or ud.user_id = filter_user_id)
    and (filter_language is null or ud.language = filter_language)
  order by ud.embedding <=> query_embedding
  limit match_count;
end; $$;

create or replace function get_dream_stats()
returns json language plpgsql as $$
declare
  total_dreams bigint; dreams_today bigint; total_reports bigint; trending_themes_arr json;
begin
  select count(*) into total_dreams from user_dreams;
  select count(*) into dreams_today from user_dreams where created_at >= current_date;
  select count(*) into total_reports from dream_reports;
  select json_agg(theme_data) into trending_themes_arr
  from (select unnest(themes) as theme, count(*) as count
        from dream_reports where created_at >= now() - interval '7 days'
          and themes is not null and array_length(themes, 1) > 0
        group by theme order by count desc limit 5) as theme_data;
  return json_build_object('total_user_dreams', total_dreams, 'dreams_today', dreams_today,
    'total_dream_reports', total_reports, 'trending_themes', coalesce(trending_themes_arr, '[]'::json));
end; $$;

create or replace function get_trending_themes(days_back int default 7, top_n int default 10)
returns table (theme text, count bigint) language plpgsql as $$
begin
  return query
  select unnest(dr.themes) as theme, count(*) as count
  from dream_reports dr
  where dr.created_at >= now() - (days_back || ' days')::interval
    and dr.themes is not null and array_length(dr.themes, 1) > 0
  group by theme order by count desc limit top_n;
end; $$;

-- 006: Row Level Security
alter table dream_reports enable row level security;
create policy "dream_reports_public_read" on dream_reports for select to public using (true);

alter table user_dreams enable row level security;
create policy "user_dreams_own_read" on user_dreams for select to authenticated using (auth.uid() = user_id);
create policy "user_dreams_public_read" on user_dreams for select to public using (is_public = true);
create policy "user_dreams_own_insert" on user_dreams for insert to authenticated with check (auth.uid() = user_id);
create policy "user_dreams_own_update" on user_dreams for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_dreams_own_delete" on user_dreams for delete to authenticated using (auth.uid() = user_id);

alter table interpretations enable row level security;
create policy "interpretations_own_read" on interpretations for select to authenticated
  using (exists (select 1 from user_dreams ud where ud.id = interpretations.dream_id and ud.user_id = auth.uid()));

-- FERTIG! Alle Tabellen, Indexes, Funktionen und Policies erstellt.
select 'Migration erfolgreich! Tabellen: dream_reports, user_dreams, interpretations' as status;
