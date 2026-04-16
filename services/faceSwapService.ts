/**
 * Face-Swap Service.
 * Wendet Face-Swap auf Traumbilder und -videos via Replicate API an.
 */

export interface FaceSwapResult {
  imageUrl: string;
  originalUrl: string;
  provider: 'replicate';
  processingTime: number;
}

export interface VideoFaceSwapResult {
  videoUrl: string;
  originalUrl: string;
  provider: 'replicate';
  processingTime: number;
}

import { apiFetch } from './apiConfig';

// ── IndexedDB Helfer fuer Face-Foto ────────────────────────────

const DB_NAME = 'DreamCodeDB';
const PROFILE_STORE = 'profile';
const FACE_KEY = 'face_photo_frontal';

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Speichert das Frontal-Face-Foto als Base64 in IndexedDB.
 */
export async function saveFacePhoto(base64: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PROFILE_STORE, 'readwrite');
      const req = tx.objectStore(PROFILE_STORE).put(base64, FACE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback: localStorage
    try { localStorage.setItem(FACE_KEY, base64); } catch {}
  }
}

/**
 * Liest das gespeicherte Face-Foto aus IndexedDB.
 */
export async function getFacePhoto(): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PROFILE_STORE, 'readonly');
      const req = tx.objectStore(PROFILE_STORE).get(FACE_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback: localStorage
    return localStorage.getItem(FACE_KEY);
  }
}

/**
 * Loescht das Face-Foto aus IndexedDB.
 */
export async function deleteFacePhoto(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PROFILE_STORE, 'readwrite');
      const req = tx.objectStore(PROFILE_STORE).delete(FACE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    localStorage.removeItem(FACE_KEY);
  }
}

// ── Face-Swap auf Einzelbild ───────────────────────────────────

/**
 * Wendet Face-Swap auf ein Traumbild an.
 */
export async function applyFaceSwap(
  sourceImageUrl: string,
  faceImageBase64: string
): Promise<FaceSwapResult> {
  const start = performance.now();

  const res = await apiFetch('/api/replicate/face-swap', {
    method: 'POST',
    body: JSON.stringify({ sourceImageUrl, faceImageBase64 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Face-Swap fehlgeschlagen (${res.status})`);
  }

  const data = await res.json();
  const processingTime = Math.round(performance.now() - start);

  // Replicate gibt output als URL oder Array zurueck
  const imageUrl = Array.isArray(data.output) ? data.output[0] : data.output;

  return {
    imageUrl,
    originalUrl: sourceImageUrl,
    provider: 'replicate',
    processingTime,
  };
}

// ── Face-Swap auf Video (async mit Polling) ────────────────────

/**
 * Wendet Face-Swap auf ein Traumvideo an.
 * Pollt den Status alle 5 Sekunden. Ruft onProgress bei Status-Updates.
 */
export async function applyVideoFaceSwap(
  videoUrl: string,
  faceImageBase64: string,
  onProgress?: (status: string, percent: number) => void
): Promise<VideoFaceSwapResult> {
  const start = performance.now();

  // Prediction starten (async)
  const createRes = await apiFetch('/api/replicate/video-face-swap', {
    method: 'POST',
    body: JSON.stringify({ videoUrl, faceImageBase64 }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Video-Face-Swap Start fehlgeschlagen (${createRes.status})`);
  }

  const { id: predictionId } = await createRes.json();
  if (!predictionId) throw new Error('Keine Prediction-ID erhalten');

  onProgress?.('Gesicht wird analysiert...', 10);

  // Polling (max 180 Sekunden)
  const maxWait = 180_000;
  const pollInterval = 5_000;
  const startTime = Date.now();
  let pollCount = 0;

  while (Date.now() - startTime < maxWait) {
    await new Promise(r => setTimeout(r, pollInterval));
    pollCount++;

    const percent = Math.min(90, 10 + (pollCount * 5));
    onProgress?.('Video wird verarbeitet...', percent);

    const pollRes = await apiFetch(`/api/replicate/prediction/${predictionId}`);

    if (!pollRes.ok) continue;

    const prediction = await pollRes.json();

    if (prediction.status === 'succeeded') {
      onProgress?.('Fertig!', 100);
      const resultUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
      return {
        videoUrl: resultUrl,
        originalUrl: videoUrl,
        provider: 'replicate',
        processingTime: Math.round(performance.now() - start),
      };
    }

    if (prediction.status === 'failed') {
      throw new Error(prediction.error || 'Video-Face-Swap fehlgeschlagen');
    }
  }

  throw new Error('Video-Face-Swap Zeitlimit ueberschritten (180s)');
}
