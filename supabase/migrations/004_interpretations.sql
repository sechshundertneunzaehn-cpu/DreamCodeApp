-- =============================================================
-- Migration 004: Tabelle interpretations
-- Zweck: Gespeicherte KI-Traumdeutungen mit Quellenangaben,
--        Modell-Metadaten und Kostentracking
-- =============================================================

create table if not exists interpretations (
  -- Primaerschluessel
  id              uuid          primary key default gen_random_uuid(),

  -- Referenz auf den gedeuteten Traum (kaskadierendes Loeschen)
  dream_id        uuid          not null references user_dreams(id) on delete cascade,

  -- Deutungsinhalt
  content         text          not null,

  -- Zitatbelege aus den Referenzquellen
  -- Format: [{source: text, text: text, similarity_score: float}]
  citations       jsonb         default '[]',

  -- Deutungstradition
  -- Moegliche Werte: "ISLAMIC", "JUNGIAN", "FREUDIAN", "GESTALT",
  --                  "SPIRITUAL", "NEUROSCIENTIFIC", "UNIVERSAL"
  tradition       text          not null,

  -- KI-Modell-Metadaten (fuer Audit und Kostenoptimierung)
  model_used      text          default 'gemini-2.5-flash',
  tokens_used     integer,
  cost_estimate   numeric(10,6), -- Geschaetzte Kosten in USD

  -- Zeitstempel
  created_at      timestamptz   default now()
);

-- -------------------------------------------------------------
-- Indexes
-- -------------------------------------------------------------

-- Index fuer Abfragen aller Deutungen eines bestimmten Traums
create index if not exists interpretations_dream_id_idx
  on interpretations (dream_id);

-- Index fuer Filterung und Analyse nach Tradition
create index if not exists interpretations_tradition_idx
  on interpretations (tradition);

-- -------------------------------------------------------------
-- Kommentare
-- -------------------------------------------------------------
comment on table interpretations is
  'KI-generierte Traumdeutungen mit Quellenbelegen und Kostentracking. '
  'Jede Interpretation gehoert zu einem user_dream und repraesentiert '
  'eine bestimmte Deutungstradition.';

comment on column interpretations.citations is
  'JSON-Array der verwendeten Zitate aus den Referenzquellen. '
  'Format: [{source: text, text: text, similarity_score: float}]';

comment on column interpretations.tradition is
  'Deutungstradition/-schule. Bekannte Werte: ISLAMIC, JUNGIAN, FREUDIAN, '
  'GESTALT, SPIRITUAL, NEUROSCIENTIFIC, UNIVERSAL.';

comment on column interpretations.cost_estimate is
  'Geschaetzte API-Kosten in USD fuer diese Deutung (6 Dezimalstellen fuer Mikrocents).';
