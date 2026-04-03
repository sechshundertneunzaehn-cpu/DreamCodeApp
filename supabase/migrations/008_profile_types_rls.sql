-- =============================================================
-- Migration 008: 2 Profil-Typen + RLS + Triggers
-- TYP 1: Forschungsteilnehmer (READ-ONLY)
-- TYP 2: App-Nutzer (aktiv)
-- =============================================================

-- ── TYP 1: FORSCHUNGS-TABELLEN (READ-ONLY) ──

ALTER TABLE research_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_participants" ON research_participants;
DROP POLICY IF EXISTS "research_participants_public_read" ON research_participants;
CREATE POLICY "public_read_participants"
  ON research_participants FOR SELECT USING (true);

ALTER TABLE research_dreams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_dreams" ON research_dreams;
DROP POLICY IF EXISTS "research_dreams_public_read" ON research_dreams;
CREATE POLICY "public_read_dreams"
  ON research_dreams FOR SELECT USING (true);

ALTER TABLE research_studies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "research_studies_public_read" ON research_studies;
CREATE POLICY "public_read_studies"
  ON research_studies FOR SELECT USING (true);

ALTER TABLE study_map_markers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "study_map_markers_public_read" ON study_map_markers;
CREATE POLICY "public_read_markers"
  ON study_map_markers FOR SELECT USING (true);

-- ── TYP 2: APP-NUTZER TABELLEN ──

CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE,
  display_name    TEXT,
  bio             TEXT,
  avatar_url      TEXT,
  preferred_lang  TEXT DEFAULT 'de',
  coin_balance    INTEGER DEFAULT 0,
  subscription    TEXT DEFAULT 'bronze',
  dream_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS comments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dream_id        UUID REFERENCES user_dreams(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON comments FOR DELETE USING (auth.uid() = user_id);

-- ── TRIGGERS ──

CREATE OR REPLACE FUNCTION update_dream_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET dream_count = (
    SELECT COUNT(*) FROM user_dreams WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
  )
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_dream_changed ON user_dreams;
CREATE TRIGGER on_dream_changed
  AFTER INSERT OR DELETE ON user_dreams
  FOR EACH ROW EXECUTE FUNCTION update_dream_count();

CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, preferred_lang, coin_balance, subscription)
  VALUES (NEW.id, 'de', 100, 'bronze')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();
