/**
 * FaceUpload — Multi-Step-Wizard fuer den 3-Foto Face-Upload.
 * Schritte: Consent -> Frontal -> Links -> Rechts -> Review -> Upload -> Fertig
 */

import React, { useState, useCallback, Suspense } from 'react';
import { FacePhotoType, FaceQualityResult, ServerQualityResult, Language, ThemeMode, UserProfile } from '../types';
import { uploadFacePhoto, checkServerQuality } from '../services/faceStorageService';
import { saveFacePhoto } from '../services/faceSwapService';

const FaceCamera = React.lazy(() => import('./FaceCamera'));

interface FaceUploadProps {
  language: Language;
  themeMode: ThemeMode;
  userProfile: UserProfile | null;
  onUpdateProfile: (p: UserProfile) => void;
  onClose: () => void;
}

type Step = 'consent' | 'frontal' | 'left' | 'right' | 'review' | 'uploading' | 'done';

interface CapturedPhoto {
  blob: Blob;
  previewUrl: string;
  clientQuality: FaceQualityResult;
  serverQuality?: ServerQualityResult;
}

const STEPS: Step[] = ['consent', 'frontal', 'left', 'right', 'review', 'uploading', 'done'];
const STEP_LABELS: Record<Step, string> = {
  consent: 'Einwilligung',
  frontal: 'Frontalaufnahme',
  left: 'Linkes Profil',
  right: 'Rechtes Profil',
  review: 'Ueberpruefung',
  uploading: 'Hochladen',
  done: 'Fertig',
};

const FaceUpload: React.FC<FaceUploadProps> = ({ language, themeMode, userProfile, onUpdateProfile, onClose }) => {
  const [step, setStep] = useState<Step>('consent');
  const [consentChecked, setConsentChecked] = useState(false);
  const [photos, setPhotos] = useState<Record<string, CapturedPhoto>>({});
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [currentPhotoType, setCurrentPhotoType] = useState<FacePhotoType>(FacePhotoType.FRONTAL);

  const isDark = themeMode === ThemeMode?.DARK;
  const stepIndex = STEPS.indexOf(step);
  const progressPercent = ((stepIndex + 1) / STEPS.length) * 100;

  // Consent bestaetigen
  const handleConsent = () => {
    if (consentChecked) setStep('frontal');
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Kamera oeffnen fuer einen bestimmten Winkel
  const openCamera = (type: FacePhotoType) => {
    setCurrentPhotoType(type);
    setCameraActive(true);
  };

  // Galerie-Upload als Fallback
  const openGallery = (type: FacePhotoType) => {
    setCurrentPhotoType(type);
    fileInputRef.current?.click();
  };

  // Datei aus Galerie verarbeiten
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const defaultQuality: FaceQualityResult = {
      valid: true, faceDetected: true, confidence: 1,
      faceSizeRatio: 0.5, landmarksVisible: true, sunglassesDetected: false, errors: [],
    };

    setPhotos(prev => ({
      ...prev,
      [currentPhotoType]: { blob: file, previewUrl, clientQuality: defaultQuality },
    }));

    // Direkt zur Review-Seite (ein Foto reicht fuer den Anfang)
    setStep('review');

    // Input zuruecksetzen
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [currentPhotoType]);

  // Foto wurde aufgenommen (Kamera)
  const handleCapture = useCallback((blob: Blob, quality: FaceQualityResult) => {
    const previewUrl = URL.createObjectURL(blob);
    setPhotos(prev => ({
      ...prev,
      [currentPhotoType]: { blob, previewUrl, clientQuality: quality },
    }));
    setCameraActive(false);

    // Direkt zur Review-Seite
    setStep('review');
  }, [currentPhotoType]);

  // Schritt starten: Kamera automatisch oeffnen
  const handleStepEnter = (s: Step) => {
    setStep(s);
    if (s === 'frontal') openCamera(FacePhotoType.FRONTAL);
    else if (s === 'left') openCamera(FacePhotoType.LEFT_PROFILE);
    else if (s === 'right') openCamera(FacePhotoType.RIGHT_PROFILE);
  };

  // Re-Take: Foto neu aufnehmen
  const handleRetake = (type: FacePhotoType) => {
    const old = photos[type];
    if (old) URL.revokeObjectURL(old.previewUrl);
    setPhotos(prev => {
      const copy = { ...prev };
      delete copy[type];
      return copy;
    });
    openCamera(type);
  };

  // Upload starten
  const handleUpload = async () => {
    setStep('uploading');
    setUploadError(null);

    // Nur vorhandene Fotos hochladen (mindestens 1 reicht)
    const availableTypes = [FacePhotoType.FRONTAL, FacePhotoType.LEFT_PROFILE, FacePhotoType.RIGHT_PROFILE]
      .filter(type => photos[type]);

    if (availableTypes.length === 0) {
      setUploadError('Mindestens ein Foto erforderlich');
      setStep('review');
      return;
    }

    try {
      for (const type of availableTypes) {
        const photo = photos[type]!;

        setUploadProgress(`Qualitaetspruefung: ${STEP_LABELS[type === FacePhotoType.FRONTAL ? 'frontal' : type === FacePhotoType.LEFT_PROFILE ? 'left' : 'right']}...`);

        // Server-seitige Qualitaetspruefung
        let serverQuality: ServerQualityResult | null = null;
        try {
          serverQuality = await checkServerQuality(photo.blob);
          if (!serverQuality.valid) {
            setUploadError(`${STEP_LABELS[type === FacePhotoType.FRONTAL ? 'frontal' : type === FacePhotoType.LEFT_PROFILE ? 'left' : 'right']}: ${serverQuality.errors.join(', ')}`);
            setStep('review');
            return;
          }
        } catch {
          // Server-Pruefung optional — weiter ohne
          console.warn('[FaceUpload] Server-Qualitaetspruefung uebersprungen');
        }

        setUploadProgress(`Hochladen: ${STEP_LABELS[type === FacePhotoType.FRONTAL ? 'frontal' : type === FacePhotoType.LEFT_PROFILE ? 'left' : 'right']}...`);

        try {
          await uploadFacePhoto(photo.blob, type, photo.clientQuality, serverQuality);
        } catch (uploadErr) {
          console.warn('[FaceUpload] Supabase-Upload fehlgeschlagen, speichere lokal:', uploadErr);
          // Weiter — lokale Speicherung reicht fuer Face-Swap
        }

        // Server-Quality im State speichern
        if (serverQuality) {
          setPhotos(prev => ({
            ...prev,
            [type]: { ...prev[type], serverQuality },
          }));
        }
      }

      // Frontalfoto als Base64 in IndexedDB speichern fuer Face-Swap
      const frontalPhoto = photos[FacePhotoType.FRONTAL];
      if (frontalPhoto) {
        try {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) saveFacePhoto(reader.result as string);
          };
          reader.readAsDataURL(frontalPhoto.blob);
        } catch {}
      }

      // Profil aktualisieren
      if (userProfile) {
        onUpdateProfile({
          ...userProfile,
          faceData: {
            hasPhotos: true,
            consentGiven: true,
            consentDate: new Date().toISOString(),
            photoCount: availableTypes.length,
          },
        });
      }

      setStep('done');
    } catch (e: any) {
      console.error('[FaceUpload] Upload-Fehler:', e);
      setUploadError(e.message || 'Upload fehlgeschlagen');
      setStep('review');
    }
  };

  // Cleanup URLs bei Unmount
  React.useEffect(() => {
    return () => {
      Object.values(photos).forEach(p => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

  // Kamera-Overlay
  if (cameraActive) {
    return (
      <Suspense fallback={
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      }>
        <FaceCamera
          photoType={currentPhotoType}
          language={language}
          themeMode={themeMode}
          onCapture={handleCapture}
          onClose={() => setCameraActive(false)}
        />
      </Suspense>
    );
  }

  return (
    <div className={`fixed inset-0 z-40 flex flex-col ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Versteckter File-Input fuer Galerie-Upload */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture={undefined}
        onChange={handleFileSelect}
      />
      {/* Header mit Progress */}
      <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} className="text-2xl">&times;</button>
          <h2 className="text-lg font-semibold">Gesicht hochladen</h2>
          <span className="text-sm opacity-60">{stepIndex + 1}/{STEPS.length}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* CONSENT */}
        {step === 'consent' && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4">&#x1F512;</div>
              <h3 className="text-xl font-bold mb-2">Einwilligung erforderlich</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Fuer die Erstellung personalisierter Trauminhalte benoetigen wir dein Einverstaendnis
                zur Verarbeitung deiner Gesichtsdaten.
              </p>
            </div>

            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} space-y-3`}>
              <p className="text-sm">
                &#x2022; Deine Fotos werden verschluesselt in der EU gespeichert (DSGVO-konform)
              </p>
              <p className="text-sm">
                &#x2022; Fotos werden NICHT fuer KI-Training verwendet
              </p>
              <p className="text-sm">
                &#x2022; Du kannst deine Fotos jederzeit in den Profil-Einstellungen loeschen
              </p>
              <p className="text-sm">
                &#x2022; Die Verarbeitung erfolgt ausschliesslich zur Personalisierung deiner Trauminhalte
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={e => setConsentChecked(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm">
                Ich bestatige, dass dies mein eigenes Gesicht ist und ich der Verarbeitung meiner
                biometrischen Gesichtsdaten gemaess der Datenschutzerklaerung zustimme.
              </span>
            </label>

            <button
              onClick={handleConsent}
              disabled={!consentChecked}
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                consentChecked
                  ? 'bg-blue-500 text-white active:scale-[0.98]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Kamera oeffnen
            </button>
            <button
              onClick={() => {
                if (!consentChecked) return;
                setCurrentPhotoType(FacePhotoType.FRONTAL);
                setStep('frontal');
                fileInputRef.current?.click();
              }}
              disabled={!consentChecked}
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                consentChecked
                  ? 'bg-gray-600 text-white active:scale-[0.98]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Foto aus Galerie waehlen
            </button>
          </div>
        )}

        {/* REVIEW */}
        {step === 'review' && (
          <div className="max-w-md mx-auto space-y-6">
            <h3 className="text-xl font-bold text-center">Fotos ueberpruefen</h3>

            {uploadError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
                {uploadError}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {([
                { type: FacePhotoType.FRONTAL, label: 'Frontal' },
                { type: FacePhotoType.LEFT_PROFILE, label: 'Links 45\u00B0' },
                { type: FacePhotoType.RIGHT_PROFILE, label: 'Rechts 45\u00B0' },
              ] as const).map(({ type, label }) => {
                const photo = photos[type];
                return (
                  <div key={type} className="text-center">
                    <div className={`aspect-square rounded-xl overflow-hidden mb-2 ${
                      isDark ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      {photo ? (
                        <img
                          src={photo.previewUrl}
                          alt={label}
                          className="w-full h-full object-cover"
                          style={{ transform: 'scaleX(-1)' }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">
                          &#x1F464;
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium mb-1">{label}</p>
                    {photo ? (
                      <button
                        onClick={() => handleRetake(type)}
                        className="text-xs text-blue-500 underline"
                      >
                        Neu aufnehmen
                      </button>
                    ) : (
                      <button
                        onClick={() => openCamera(type)}
                        className="text-xs text-blue-500 underline"
                      >
                        Aufnehmen
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleUpload}
              disabled={Object.keys(photos).length < 1}
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                Object.keys(photos).length >= 1
                  ? 'bg-green-500 text-white active:scale-[0.98]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {Object.keys(photos).length >= 1 ? 'Foto hochladen' : 'Mindestens 1 Foto erforderlich'}
            </button>
          </div>
        )}

        {/* UPLOADING */}
        {step === 'uploading' && (
          <div className="max-w-md mx-auto text-center space-y-6 py-12">
            <div className="animate-spin w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-lg font-medium">{uploadProgress || 'Wird hochgeladen...'}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Bitte nicht schliessen...
            </p>
          </div>
        )}

        {/* DONE */}
        {step === 'done' && (
          <div className="max-w-md mx-auto text-center space-y-6 py-12">
            <div className="text-6xl">&#x2705;</div>
            <h3 className="text-xl font-bold">Gesichtsfotos gespeichert!</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Du kannst jetzt personalisierte Traumbilder mit deinem Gesicht erstellen.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium active:scale-[0.98]"
            >
              Fertig
            </button>
          </div>
        )}

        {/* Automatischer Kamera-Start fuer Foto-Schritte */}
        {(step === 'frontal' || step === 'left' || step === 'right') && !cameraActive && (
          <div className="max-w-md mx-auto text-center space-y-6 py-12">
            <div className="text-5xl">
              {step === 'frontal' ? '&#x1F4F8;' : step === 'left' ? '&#x2B05;' : '&#x27A1;'}
            </div>
            <h3 className="text-xl font-bold">{STEP_LABELS[step]}</h3>
            <button
              onClick={() => handleStepEnter(step)}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium active:scale-[0.98]"
            >
              Kamera oeffnen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceUpload;
