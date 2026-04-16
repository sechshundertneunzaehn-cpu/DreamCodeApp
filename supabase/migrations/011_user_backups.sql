-- =============================================================
-- Migration 011: Client-Backup Tabelle fuer Zweifach-Sicherung
-- Zweck: Vollstaendiges Backup aller Client-Daten (Dreams + Profile)
--        in Supabase als Remote-Sicherung neben localStorage/IndexedDB
-- =============================================================

CREATE TABLE IF NOT EXISTS user_backups (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dreams      JSONB DEFAULT '[]',
  profile     JSONB DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "backups_select_own" ON user_backups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "backups_insert_own" ON user_backups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "backups_update_own" ON user_backups
  FOR UPDATE USING (auth.uid() = user_id);
