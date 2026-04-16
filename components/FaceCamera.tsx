/**
 * FaceCamera — Kamera-Komponente mit Live-Gesichtserkennung.
 * Zeigt gruenen/roten Rahmen je nach Qualitaet und Guide-Silhouette pro Winkel.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FacePhotoType, FaceQualityResult, Language, ThemeMode } from '../types';
import {
  initFaceDetector,
  setVideoMode,
  setImageMode,
  validateFace,
  getOverlayColor,
  disposeFaceDetector,
} from '../services/faceDetectionService';

interface FaceCameraProps {
  photoType: FacePhotoType;
  language: Language;
  themeMode: ThemeMode;
  onCapture: (blob: Blob, quality: FaceQualityResult) => void;
  onClose: () => void;
}

const GUIDE_LABELS: Record<FacePhotoType, string> = {
  [FacePhotoType.FRONTAL]: 'Schaue direkt in die Kamera',
  [FacePhotoType.LEFT_PROFILE]: 'Drehe deinen Kopf leicht nach links (45\u00B0)',
  [FacePhotoType.RIGHT_PROFILE]: 'Drehe deinen Kopf leicht nach rechts (45\u00B0)',
};

const FaceCamera: React.FC<FaceCameraProps> = ({ photoType, language, themeMode, onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const [quality, setQuality] = useState<FaceQualityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const isDark = themeMode === ThemeMode?.DARK;

  // Kamera starten + MediaPipe initialisieren
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Kamera anfordern
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // MediaPipe laden
        await initFaceDetector();
        await setVideoMode();

        if (!cancelled) setLoading(false);
      } catch (e: any) {
        if (!cancelled) {
          setError('Kamera konnte nicht gestartet werden. Bitte Kamerazugriff erlauben.');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Detection-Loop (throttled ~5fps)
  useEffect(() => {
    if (loading || error) return;

    let lastRun = 0;
    const interval = 200; // 5fps

    const loop = () => {
      const now = performance.now();
      if (now - lastRun >= interval && videoRef.current && videoRef.current.readyState >= 2) {
        lastRun = now;
        const video = videoRef.current;
        validateFace(video, video.videoWidth, video.videoHeight)
          .then(result => setQuality(result))
          .catch(() => {});
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [loading, error]);

  // Foto aufnehmen
  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !quality?.valid || capturing) return;

    setCapturing(true);

    try {
      // Zurueck auf IMAGE-Modus fuer finale Validierung
      await setImageMode();

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0);

      // Finale Validierung auf dem Standbild
      const img = new Image();
      img.src = canvas.toDataURL('image/jpeg', 0.92);
      await new Promise(resolve => { img.onload = resolve; });

      const finalQuality = await validateFace(img, canvas.width, canvas.height);

      // Als Blob exportieren
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          b => b ? resolve(b) : reject(new Error('Blob-Erstellung fehlgeschlagen')),
          'image/jpeg',
          0.92
        );
      });

      // Zurueck auf VIDEO-Modus
      await setVideoMode();

      onCapture(blob, finalQuality);
    } catch (e) {
      console.error('[FaceCamera] Capture-Fehler:', e);
      await setVideoMode().catch(() => {});
    } finally {
      setCapturing(false);
    }
  }, [quality, capturing, onCapture]);

  const overlayColor = quality ? getOverlayColor(quality) : 'red';

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <button onClick={onClose} className="text-2xl">&times;</button>
        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {GUIDE_LABELS[photoType]}
        </span>
        <div className="w-8" /> {/* Spacer */}
      </div>

      {/* Kamera-Bereich */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {loading && (
          <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full mx-auto mb-2" />
            Kamera wird geladen...
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 px-6">
            <p className="text-lg mb-2">{error}</p>
            <button onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded-lg">
              Schliessen
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ display: loading || error ? 'none' : 'block', transform: 'scaleX(-1)' }}
        />

        {/* Overlay-Rahmen */}
        {!loading && !error && (
          <div
            className="absolute inset-4 rounded-3xl pointer-events-none transition-colors duration-300"
            style={{
              border: `4px solid ${overlayColor === 'green' ? '#22c55e' : '#ef4444'}`,
              boxShadow: `0 0 20px ${overlayColor === 'green' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          />
        )}

        {/* Guide-Silhouette */}
        {!loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="text-6xl">
              {photoType === FacePhotoType.FRONTAL && '\u{1F464}'}
              {photoType === FacePhotoType.LEFT_PROFILE && '\u{1F464}'}
              {photoType === FacePhotoType.RIGHT_PROFILE && '\u{1F464}'}
            </div>
          </div>
        )}
      </div>

      {/* Fehleranzeige */}
      {quality && quality.errors.length > 0 && (
        <div className="px-4 py-2 bg-red-500/10">
          {quality.errors.map((err, i) => (
            <p key={i} className="text-red-500 text-sm">{err}</p>
          ))}
        </div>
      )}

      {/* Capture-Button */}
      {!loading && !error && (
        <div className={`p-6 flex justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <button
            onClick={handleCapture}
            disabled={!quality?.valid || capturing}
            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
              quality?.valid
                ? 'border-green-500 bg-green-500/20 active:scale-95'
                : 'border-gray-400 bg-gray-400/20 opacity-50 cursor-not-allowed'
            }`}
          >
            {capturing ? (
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <div className={`w-14 h-14 rounded-full ${quality?.valid ? 'bg-green-500' : 'bg-gray-400'}`} />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FaceCamera;
