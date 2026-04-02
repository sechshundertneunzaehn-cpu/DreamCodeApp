-- =============================================================
-- Migration 002: Tabelle dream_reports
-- Zweck: Wissenschaftliche Traumberichte aus externen Quellen
--        (z.B. SDDb, DreamBank) als Referenzdaten fuer RAG
-- =============================================================

create table if not exists dream_reports (
  -- Primaerschluessel
  id              uuid        primary key default gen_random_uuid(),

  -- Trauminhalt und Herkunft
  text            text        not null,
  source_name     text        not null,   -- z.B. "SDDb - 2012 Demographic Survey"
  source_url      text,                   -- Optionaler Link zur Originalquelle

  -- Sprache und Klassifikation
  language        text        default 'en',
  tags            text[]      default '{}',
  themes          text[]      default '{}',

  -- Embedding-Vektor (Gemini gemini-embedding-001, 768 Dimensionen)
  embedding       vector(768),

  -- Metadaten zur Quelle
  word_count      integer,
  survey_name     text,                   -- Name der Studie/Umfrage
  respondent_id   text,                   -- Anonymisierte Teilnehmer-ID
  dream_date      timestamptz,            -- Datum des Traums (falls bekannt)
  metadata        jsonb       default '{}',

  -- Zeitstempel
  created_at      timestamptz default now()
);

-- -------------------------------------------------------------
-- Indexes
-- -------------------------------------------------------------

-- HNSW Index fuer schnelle Kosinus-Aehnlichkeitssuche auf Embeddings.
-- HNSW ist gegenueber IVFFlat vorzuziehen, da kein Trainingsschritt
-- noetig ist und die Recall-Rate bei kleinen bis mittleren Datensaetzen
-- deutlich besser ist.
create index if not exists dream_reports_embedding_hnsw_idx
  on dream_reports
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- GIN-Indexes fuer Array-Spalten (tags, themes) ermoeglichen
-- effiziente Suche mit dem @> Operator
create index if not exists dream_reports_tags_gin_idx
  on dream_reports using gin (tags);

create index if not exists dream_reports_themes_gin_idx
  on dream_reports using gin (themes);

-- B-Tree Indexes fuer haeufige Filterbedingungen
create index if not exists dream_reports_source_name_idx
  on dream_reports (source_name);

create index if not exists dream_reports_language_idx
  on dream_reports (language);

-- -------------------------------------------------------------
-- Kommentare fuer Datenbankdokumentation
-- -------------------------------------------------------------
comment on table dream_reports is
  'Wissenschaftliche Traumberichte aus externen Forschungsquellen. '
  'Werden als Referenzdaten fuer den RAG-Mechanismus der Traumdeutung verwendet.';

comment on column dream_reports.embedding is
  'Embedding-Vektor (768 Dimensionen, Gemini gemini-embedding-001). '
  'Wird fuer semantische Aehnlichkeitssuche via Kosinus-Distanz verwendet.';

comment on column dream_reports.metadata is
  'Beliebige zusaetzliche Metadaten der Originalquelle als JSON-Objekt.';
