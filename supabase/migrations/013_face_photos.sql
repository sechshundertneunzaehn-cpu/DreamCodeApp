-- ============================================================
-- Face Photos Schema for DreamCode
-- Speichert Metadaten fuer Face-Upload-Fotos.
-- Bilder selbst liegen im Supabase Storage Bucket 'face-photos'.
-- ============================================================

-- Tabelle: Metadaten pro Gesichtsfoto
CREATE TABLE IF NOT EXISTS face_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('FRONTAL', 'LEFT_PROFILE', 'RIGHT_PROFILE')),
  storage_path TEXT NOT NULL,
  client_quality JSONB,
  server_quality JSONB,
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  consent_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ein Foto pro Winkel pro User
  UNIQUE (user_id, photo_type)
);

CREATE INDEX IF NOT EXISTS idx_face_photos_user ON face_photos(user_id);

-- RLS aktivieren
ALTER TABLE face_photos ENABLE ROW LEVEL SECURITY;

-- User kann nur eigene Fotos lesen
CREATE POLICY "face_photos_select_own"
  ON face_photos FOR SELECT
  USING (auth.uid() = user_id);

-- User kann nur eigene Fotos einfuegen
CREATE POLICY "face_photos_insert_own"
  ON face_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User kann nur eigene Fotos aktualisieren
CREATE POLICY "face_photos_update_own"
  ON face_photos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User kann nur eigene Fotos loeschen (DSGVO)
CREATE POLICY "face_photos_delete_own"
  ON face_photos FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger: updated_at automatisch setzen
CREATE OR REPLACE FUNCTION update_face_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_face_photos_updated_at
  BEFORE UPDATE ON face_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_face_photos_updated_at();

-- ============================================================
-- Storage Bucket fuer Gesichtsfotos
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'face-photos',
  'face-photos',
  false,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: User kann nur in eigenen Ordner uploaden
CREATE POLICY "face_storage_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'face-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS: User kann nur eigene Dateien lesen
CREATE POLICY "face_storage_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'face-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS: User kann nur eigene Dateien loeschen
CREATE POLICY "face_storage_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'face-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS: User kann nur eigene Dateien aktualisieren (upsert)
CREATE POLICY "face_storage_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'face-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'face-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
