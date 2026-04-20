-- =============================================================
-- Migration 006: Row Level Security (RLS) Policies
-- Zweck: Datenzugriff absichern nach dem Prinzip der minimalen
--        Rechte. Service-Key umgeht RLS fuer Batch-Imports.
-- =============================================================


-- =============================================================
-- Tabelle: dream_reports
-- Zugriff: Oeffentliches Lesen fuer alle (auch anonym),
--          Schreiben NUR ueber Service-Key (kein API-Schreiben)
-- =============================================================

alter table dream_reports enable row level security;

-- Jeder (auch nicht angemeldete Nutzer) kann Referenzberichte lesen.
-- Das ist gewollt, da dream_reports oeffentliche Forschungsdaten sind.
create policy "dream_reports_public_read"
  on dream_reports
  for select
  to public
  using (true);

-- Kein INSERT/UPDATE/DELETE ueber die Supabase API erlaubt.
-- Importe laufen ausschliesslich ueber den Service-Key (Backend/Edge Function).
-- Kein explizites Policy-Block noetig – fehlende Policy = kein Zugriff.


-- =============================================================
-- Tabelle: user_dreams
-- Zugriff:
--   - Eigene Traeume: lesen, schreiben, loeschen
--   - Fremde oeffentliche Traeume: nur lesen (is_public = true)
--   - Nicht angemeldete Nutzer: nur oeffentliche Traeume lesen
-- =============================================================

alter table user_dreams enable row level security;

-- Nutzer kann alle eigenen Traeume lesen (oeffentlich und privat)
create policy "user_dreams_own_read"
  on user_dreams
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Alle Nutzer (auch anonym) koennen oeffentliche Traeume lesen
create policy "user_dreams_public_read"
  on user_dreams
  for select
  to public
  using (is_public = true);

-- Authentifizierter Nutzer darf eigene Traeume einfuegen
create policy "user_dreams_own_insert"
  on user_dreams
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Authentifizierter Nutzer darf eigene Traeume aktualisieren
create policy "user_dreams_own_update"
  on user_dreams
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Authentifizierter Nutzer darf eigene Traeume loeschen
create policy "user_dreams_own_delete"
  on user_dreams
  for delete
  to authenticated
  using (auth.uid() = user_id);


-- =============================================================
-- Tabelle: interpretations
-- Zugriff:
--   - Eigene Interpretationen lesen (ueber dream_id -> user_id)
--   - Kein direktes Schreiben ueber API (nur Edge Function / Service-Key)
-- =============================================================

alter table interpretations enable row level security;

-- Nutzer kann Interpretationen lesen, die zu seinen eigenen Traeumen gehoeren
create policy "interpretations_own_read"
  on interpretations
  for select
  to authenticated
  using (
    exists (
      select 1
      from user_dreams ud
      where ud.id = interpretations.dream_id
        and ud.user_id = auth.uid()
    )
  );

-- Kein direktes INSERT/UPDATE/DELETE ueber API.
-- Interpretationen werden ausschliesslich von der Edge Function
-- ueber den Service-Key erstellt.


-- =============================================================
-- Hinweis zu RPC-Funktionen
-- Die RPC-Funktionen (match_dreams, match_user_dreams, etc.)
-- laufen mit SECURITY DEFINER falls noetig, oder nutzen
-- die bestehenden RLS-Policies des aufrufenden Nutzers.
-- Standardmaessig laufen sie als SECURITY INVOKER (sicherer).
-- =============================================================
