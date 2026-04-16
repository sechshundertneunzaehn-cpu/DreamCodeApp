/**
 * Face-Foto Storage Service.
 * Verwaltet Upload/Download/Loeschung von Gesichtsfotos in Supabase Storage
 * und die zugehoerige face_photos-Tabelle.
 */

import { supabase, ensureAuth } from './supabaseClient';
import { FacePhotoType, FaceQualityResult, ServerQualityResult } from '../types';

export interface FacePhotoRecord {
  id: string;
  photoType: FacePhotoType;
  storagePath: string;
  clientQuality: FaceQualityResult | null;
  serverQuality: ServerQualityResult | null;
  consentGiven: boolean;
  consentDate: string | null;
  createdAt: string;
}

const BUCKET = 'face-photos';

/**
 * Laedt ein Gesichtsfoto in Supabase Storage hoch und speichert Metadaten.
 */
export async function uploadFacePhoto(
  photoBlob: Blob,
  type: FacePhotoType,
  clientQuality: FaceQualityResult,
  serverQuality: ServerQualityResult | null
): Promise<string> {
  const userId = await ensureAuth();
  if (!userId) throw new Error('Nicht authentifiziert');

  const ext = photoBlob.type === 'image/png' ? 'png' : 'jpg';
  const storagePath = `${userId}/${type}.${ext}`;

  // Upload zu Supabase Storage (upsert)
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, photoBlob, {
      contentType: photoBlob.type,
      upsert: true,
    });

  if (uploadError) {
    console.error('[FACE] Upload fehlgeschlagen:', uploadError);
    throw new Error('Foto-Upload fehlgeschlagen: ' + uploadError.message);
  }

  // Metadaten in face_photos Tabelle speichern (upsert)
  const { error: dbError } = await supabase
    .from('face_photos')
    .upsert(
      {
        user_id: userId,
        photo_type: type,
        storage_path: storagePath,
        client_quality: clientQuality,
        server_quality: serverQuality,
        consent_given: true,
        consent_date: new Date().toISOString(),
      },
      { onConflict: 'user_id,photo_type' }
    );

  if (dbError) {
    console.error('[FACE] DB-Eintrag fehlgeschlagen:', dbError);
    // Storage-Datei aufraumen bei DB-Fehler
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error('Metadaten-Speicherung fehlgeschlagen: ' + dbError.message);
  }

  return storagePath;
}

/**
 * Gibt alle gespeicherten Face-Fotos des Users zurueck.
 */
export async function getFacePhotos(): Promise<FacePhotoRecord[]> {
  const userId = await ensureAuth();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('face_photos')
    .select('*')
    .eq('user_id', userId)
    .order('photo_type');

  if (error) {
    console.error('[FACE] Fotos laden fehlgeschlagen:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    photoType: row.photo_type as FacePhotoType,
    storagePath: row.storage_path,
    clientQuality: row.client_quality,
    serverQuality: row.server_quality,
    consentGiven: row.consent_given,
    consentDate: row.consent_date,
    createdAt: row.created_at,
  }));
}

/**
 * Erzeugt eine signierte URL fuer ein Face-Foto (60 Minuten gueltig).
 */
export async function getFacePhotoUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600); // 1 Stunde

  if (error) {
    console.error('[FACE] Signed URL fehlgeschlagen:', error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Gibt die signierte URL fuer einen bestimmten Foto-Typ zurueck.
 */
export async function getFacePhotoUrlByType(type: FacePhotoType): Promise<string | null> {
  const photos = await getFacePhotos();
  const photo = photos.find(p => p.photoType === type);
  if (!photo) return null;
  return getFacePhotoUrl(photo.storagePath);
}

/**
 * Loescht alle Gesichtsfotos des Users (DSGVO-Loeschung).
 */
export async function deleteAllFacePhotos(): Promise<void> {
  const userId = await ensureAuth();
  if (!userId) throw new Error('Nicht authentifiziert');

  const photos = await getFacePhotos();

  // Storage-Dateien loeschen
  if (photos.length > 0) {
    const paths = photos.map(p => p.storagePath);
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove(paths);

    if (storageError) {
      console.error('[FACE] Storage-Loeschung fehlgeschlagen:', storageError);
    }
  }

  // DB-Eintraege loeschen
  const { error: dbError } = await supabase
    .from('face_photos')
    .delete()
    .eq('user_id', userId);

  if (dbError) {
    console.error('[FACE] DB-Loeschung fehlgeschlagen:', dbError);
    throw new Error('Loeschung fehlgeschlagen: ' + dbError.message);
  }
}

/**
 * Loescht ein einzelnes Gesichtsfoto.
 */
export async function deleteFacePhoto(type: FacePhotoType): Promise<void> {
  const userId = await ensureAuth();
  if (!userId) throw new Error('Nicht authentifiziert');

  const photos = await getFacePhotos();
  const photo = photos.find(p => p.photoType === type);

  if (photo) {
    await supabase.storage.from(BUCKET).remove([photo.storagePath]);
    await supabase.from('face_photos').delete().eq('id', photo.id);
  }
}

/**
 * Prueft ob der User bereits Gesichtsfotos hochgeladen hat.
 */
export async function hasFacePhotos(): Promise<boolean> {
  const photos = await getFacePhotos();
  return photos.length > 0;
}

/**
 * Gibt die Anzahl der gespeicherten Fotos zurueck.
 */
export async function getFacePhotoCount(): Promise<number> {
  const photos = await getFacePhotos();
  return photos.length;
}

/**
 * Sendet ein Foto zur Server-seitigen Qualitaetspruefung.
 */
export async function checkServerQuality(photoBlob: Blob): Promise<ServerQualityResult> {
  const formData = new FormData();
  formData.append('photo', photoBlob);

  const { apiUrl } = await import('./apiConfig');
  const res = await fetch(apiUrl('/api/face-check/quality'), {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unbekannter Fehler');
    throw new Error(`Qualitaetspruefung fehlgeschlagen: ${text}`);
  }

  return res.json();
}
