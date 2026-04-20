-- =============================================================
-- Migration 015: user_media_config — Voice-Config-Bot Ergebnisse
-- Zweck: Speichert pro User die via Sprachassistent erfragten
--        Video-/Slideshow-Präferenzen (Persona, Stil, Mood, Wünsche).
-- =============================================================

CREATE TABLE IF NOT EXISTS user_media_config (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona                JSONB DEFAULT '{}'::jsonb,
  video_preferences      JSONB DEFAULT '{}'::jsonb,
  slideshow_preferences  JSONB DEFAULT '{}'::jsonb,
  use_own_photos         BOOLEAN DEFAULT FALSE,
  custom_wishes          TEXT,
  last_updated           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_media_config_user ON user_media_config(user_id);

ALTER TABLE user_media_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_media_config_select_own" ON user_media_config
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_media_config_insert_own" ON user_media_config
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_media_config_update_own" ON user_media_config
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_media_config_delete_own" ON user_media_config
  FOR DELETE USING (auth.uid() = user_id);
