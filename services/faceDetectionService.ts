/**
 * Client-seitige Gesichtserkennung mit MediaPipe Tasks Vision.
 * Validiert Fotos fuer den Face-Upload-Flow (Qualitaet, Landmarks, Sonnenbrille).
 */

import { FaceQualityResult } from '../types';

// MediaPipe wird lazy importiert (WASM ~4MB, nur bei Bedarf)
let FaceDetector: any = null;
let detector: any = null;
let initPromise: Promise<void> | null = null;

const MIN_CONFIDENCE = 0.85;
const MIN_FACE_SIZE_RATIO = 0.25;
const SUNGLASSES_DELTA = 0.15;

// Keypoint-Indizes in MediaPipe FaceDetector
const KEYPOINT_NAMES = ['rightEye', 'leftEye', 'noseTip', 'mouthCenter', 'rightEarTragion', 'leftEarTragion'];

/**
 * Initialisiert den MediaPipe FaceDetector (einmalig, gecacht).
 */
export async function initFaceDetector(): Promise<void> {
  if (detector) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const vision = await import('@mediapipe/tasks-vision');
      FaceDetector = vision.FaceDetector;

      const wasmPath = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
      detector = await FaceDetector.createFromOptions(
        { wasmLoaderPath: `${wasmPath}/vision_wasm_internal.js`, wasmBinaryPath: `${wasmPath}/vision_wasm_internal.wasm` },
        {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'GPU',
          },
          runningMode: 'IMAGE',
          minDetectionConfidence: 0.5, // Niedriger Schwellenwert, wir pruefen selbst
        }
      );
    } catch (e) {
      console.error('[FACE] MediaPipe Initialisierung fehlgeschlagen:', e);
      initPromise = null;
      throw e;
    }
  })();
  return initPromise;
}

/**
 * Setzt den Detector auf VIDEO-Modus fuer Live-Kamera-Feedback.
 */
export async function setVideoMode(): Promise<void> {
  await initFaceDetector();
  if (detector) {
    detector.setOptions({ runningMode: 'VIDEO' });
  }
}

/**
 * Setzt den Detector zurueck auf IMAGE-Modus fuer Einzelbild-Validierung.
 */
export async function setImageMode(): Promise<void> {
  await initFaceDetector();
  if (detector) {
    detector.setOptions({ runningMode: 'IMAGE' });
  }
}

/**
 * Validiert ein Gesichtsfoto (Einzelbild).
 */
export async function validateFace(
  image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  imageWidth: number,
  imageHeight: number
): Promise<FaceQualityResult> {
  const errors: string[] = [];

  if (!detector) {
    try {
      await initFaceDetector();
    } catch {
      return {
        valid: false,
        faceDetected: false,
        confidence: 0,
        faceSizeRatio: 0,
        landmarksVisible: false,
        sunglassesDetected: false,
        errors: ['Gesichtserkennung konnte nicht geladen werden'],
      };
    }
  }

  let result: any;
  try {
    if (image instanceof HTMLVideoElement) {
      result = detector.detectForVideo(image, performance.now());
    } else {
      result = detector.detect(image);
    }
  } catch (e) {
    return {
      valid: false,
      faceDetected: false,
      confidence: 0,
      faceSizeRatio: 0,
      landmarksVisible: false,
      sunglassesDetected: false,
      errors: ['Fehler bei der Gesichtserkennung'],
    };
  }

  // Kein Gesicht erkannt
  if (!result.detections || result.detections.length === 0) {
    return {
      valid: false,
      faceDetected: false,
      confidence: 0,
      faceSizeRatio: 0,
      landmarksVisible: false,
      sunglassesDetected: false,
      errors: ['Kein Gesicht erkannt. Bitte schaue direkt in die Kamera.'],
    };
  }

  const detection = result.detections[0];
  const confidence = detection.categories?.[0]?.score ?? 0;
  const bbox = detection.boundingBox;
  const keypoints = detection.keypoints || [];

  // Confidence pruefen
  const faceDetected = confidence >= MIN_CONFIDENCE;
  if (!faceDetected) {
    errors.push('Gesicht nicht klar genug erkannt. Bitte fuer bessere Beleuchtung sorgen.');
  }

  // Gesichtsgroesse pruefen
  const faceWidth = bbox?.width ?? 0;
  const faceSizeRatio = imageWidth > 0 ? faceWidth / imageWidth : 0;
  if (faceSizeRatio < MIN_FACE_SIZE_RATIO) {
    errors.push('Gesicht zu klein im Bild. Bitte naeher an die Kamera heranruecken.');
  }

  // Landmarks pruefen (6 Key-Landmarks muessen sichtbar sein)
  const visibleKeypoints = keypoints.filter(
    (kp: any) => KEYPOINT_NAMES.includes(kp.label) && kp.x >= 0 && kp.x <= 1 && kp.y >= 0 && kp.y <= 1
  );
  const landmarksVisible = visibleKeypoints.length >= 6;
  if (!landmarksVisible) {
    errors.push('Nicht alle Gesichtsmerkmale sichtbar. Bitte Haar aus dem Gesicht streichen und direkt in die Kamera schauen.');
  }

  // Sonnenbrillen-Heuristik: Augen-Confidence deutlich niedriger als Nase/Mund
  let sunglassesDetected = false;
  if (keypoints.length >= 4) {
    const eyeKps = keypoints.filter((kp: any) => kp.label === 'rightEye' || kp.label === 'leftEye');
    const otherKps = keypoints.filter((kp: any) => kp.label === 'noseTip' || kp.label === 'mouthCenter');

    if (eyeKps.length >= 2 && otherKps.length >= 2) {
      const avgEyeScore = eyeKps.reduce((s: number, kp: any) => s + (kp.score ?? 1), 0) / eyeKps.length;
      const avgOtherScore = otherKps.reduce((s: number, kp: any) => s + (kp.score ?? 1), 0) / otherKps.length;

      if (avgOtherScore - avgEyeScore > SUNGLASSES_DELTA) {
        sunglassesDetected = true;
        errors.push('Bitte Sonnenbrille abnehmen fuer eine bessere Erkennung.');
      }
    }
  }

  const valid = faceDetected && faceSizeRatio >= MIN_FACE_SIZE_RATIO && landmarksVisible && !sunglassesDetected;

  return {
    valid,
    faceDetected,
    confidence,
    faceSizeRatio,
    landmarksVisible,
    sunglassesDetected,
    errors,
  };
}

/**
 * Gibt die Overlay-Farbe fuer die Kamera-Vorschau zurueck.
 */
export function getOverlayColor(result: FaceQualityResult): 'green' | 'red' {
  return result.valid ? 'green' : 'red';
}

/**
 * Raeume den Detector auf (z.B. bei Komponenten-Unmount).
 */
export function disposeFaceDetector(): void {
  if (detector) {
    detector.close();
    detector = null;
    initPromise = null;
  }
}
