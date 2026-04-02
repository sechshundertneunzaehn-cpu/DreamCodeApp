-- =============================================================
-- Migration 001: Extensions aktivieren
-- Zweck: pgvector fuer Embedding-basierte Aehnlichkeitssuche
-- =============================================================

-- pgvector ermooglicht das Speichern und Abfragen von Vektoren
-- (Embeddings) direkt in PostgreSQL. Wird benoetigt fuer:
-- - Semantische Traumsuche (match_dreams)
-- - Aehnlichkeitsberechnung via Kosinus-Distanz
create extension if not exists vector with schema extensions;
