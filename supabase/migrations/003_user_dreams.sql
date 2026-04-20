-- =============================================================
-- Migration 003: Tabelle user_dreams
-- Zweck: Von Nutzern eingegebene Traeume mit optionaler
--        Geodaten-Anreicherung fuer die Traumkarte
-- =============================================================

create table if not exists user_dreams (
  -- Primaerschluessel
  id              uuid          primary key default gen_random_uuid(),

  -- Nutzer-Referenz (kaskadierendes Loeschen bei Account-Loeschung)
  user_id         uuid          references auth.users(id) on delete cascade,

  -- Trauminhalt
  text            text          not null,

  -- Embedding-Vektor fuer Aehnlichkeitssuche unter Nutzertraeumen
  embedding       vector(768),

  -- Deutungsergebnis
  interpretation  text,

  -- Quellennachweis: Array von {source_name, tradition, relevance_score}
  sources_used    jsonb         default '[]',

  -- Klassifikation und Sprache
  language        text          default 'de',
  mood            text,         -- z.B. "angst", "freude", "neutral"
  category        text,         -- z.B. "verfolgung", "fliegen", "verlust"

  -- Sichtbarkeit und Anonymisierung
  is_public       boolean       default false,
  anonymous_name  text,         -- Generierter anonymer Name fuer die Traumkarte

  -- Geodaten (optional, fuer Traumkarten-Feature)
  country_code    text,         -- ISO 3166-1 alpha-2, z.B. "DE"
  city            text,
  latitude        double precision,
  longitude       double precision,

  -- Zeitstempel
  created_at      timestamptz   default now()
);

-- -------------------------------------------------------------
-- Indexes
-- -------------------------------------------------------------

-- HNSW Index fuer semantische Aehnlichkeitssuche unter Nutzertraeumen
create index if not exists user_dreams_embedding_hnsw_idx
  on user_dreams
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Index fuer user-spezifische Abfragen (haeufigste Query-Art)
create index if not exists user_dreams_user_id_idx
  on user_dreams (user_id);

-- Index fuer oeffentliche Traum-Feeds und Traumkarte
create index if not exists user_dreams_is_public_idx
  on user_dreams (is_public)
  where is_public = true;

-- Index fuer zeitbasierte Sortierung und Trenddaten
create index if not exists user_dreams_created_at_idx
  on user_dreams (created_at desc);

-- Index fuer geografische Filterung (Traumkarte)
create index if not exists user_dreams_country_code_idx
  on user_dreams (country_code)
  where country_code is not null;

-- -------------------------------------------------------------
-- Kommentare
-- -------------------------------------------------------------
comment on table user_dreams is
  'Traeume, die von registrierten Nutzern eingegeben wurden. '
  'Enthaelt optionale Geodaten fuer das Traumkarten-Feature.';

comment on column user_dreams.sources_used is
  'JSON-Array der verwendeten Quellen bei der Deutung. '
  'Format: [{source_name: text, tradition: text, relevance_score: float}]';

comment on column user_dreams.anonymous_name is
  'Automatisch generierter anonymer Anzeigename fuer die oeffentliche Traumkarte, '
  'z.B. "Traumreisender aus Berlin".';

comment on column user_dreams.is_public is
  'Wenn true, erscheint der Traum (anonymisiert) auf der oeffentlichen Traumkarte.';
