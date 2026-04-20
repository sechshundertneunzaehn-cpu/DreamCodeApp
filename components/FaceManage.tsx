/**
 * FaceManage — Gesichtsfotos verwalten (anzeigen, loeschen, neu hochladen).
 * Wird im Profil angezeigt wenn bereits Fotos vorhanden sind.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FacePhotoType, Language, ThemeMode, UserProfile } from '../types';
import {
  getFacePhotos,
  getFacePhotoUrl,
  deleteAllFacePhotos,
  deleteFacePhoto,
  FacePhotoRecord,
} from '../services/faceStorageService';

interface FaceManageProps {
  language: Language;
  themeMode: ThemeMode;
  userProfile: UserProfile | null;
  onUpdateProfile: (p: UserProfile) => void;
  onClose: () => void;
  onReUpload: (type?: FacePhotoType) => void;
}

const PHOTO_LABELS: Record<FacePhotoType, string> = {
  [FacePhotoType.FRONTAL]: 'Frontal',
  [FacePhotoType.LEFT_PROFILE]: 'Links 45\u00B0',
  [FacePhotoType.RIGHT_PROFILE]: 'Rechts 45\u00B0',
};

const ALL_TYPES: FacePhotoType[] = [FacePhotoType.FRONTAL, FacePhotoType.LEFT_PROFILE, FacePhotoType.RIGHT_PROFILE];

const FaceManage: React.FC<FaceManageProps> = ({ language, themeMode, userProfile, onUpdateProfile, onClose, onReUpload }) => {
  const [photos, setPhotos] = useState<FacePhotoRecord[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isDark = themeMode === ThemeMode?.DARK;

  // Fotos laden
  useEffect(() => {
    (async () => {
      try {
        const records = await getFacePhotos();
        setPhotos(records);

        // Signed URLs laden
        const urls: Record<string, string> = {};
        for (const record of records) {
          const url = await getFacePhotoUrl(record.storagePath);
          if (url) urls[record.photoType] = url;
        }
        setPhotoUrls(urls);
      } catch (e) {
        console.error('[FaceManage] Laden fehlgeschlagen:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Alle Fotos loeschen
  const handleDeleteAll = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteAllFacePhotos();

      // Profil aktualisieren
      if (userProfile) {
        onUpdateProfile({
          ...userProfile,
          faceData: {
            hasPhotos: false,
            consentGiven: false,
            photoCount: 0,
          },
        });
      }

      onClose();
    } catch (e) {
      console.error('[FaceManage] Loeschung fehlgeschlagen:', e);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [userProfile, onUpdateProfile, onClose]);

  // Einzelnes Foto loeschen
  const handleDeleteOne = useCallback(async (type: FacePhotoType) => {
    try {
      await deleteFacePhoto(type);
      setPhotos(prev => prev.filter(p => p.photoType !== type));
      setPhotoUrls(prev => {
        const copy = { ...prev };
        delete copy[type];
        return copy;
      });

      // Profil-Counter aktualisieren
      if (userProfile) {
        const newCount = (userProfile.faceData?.photoCount || 1) - 1;
        onUpdateProfile({
          ...userProfile,
          faceData: {
            hasPhotos: newCount > 0,
            consentGiven: userProfile.faceData?.consentGiven ?? false,
            consentDate: userProfile.faceData?.consentDate,
            photoCount: Math.max(0, newCount),
          },
        });
      }
    } catch (e) {
      console.error('[FaceManage] Einzel-Loeschung fehlgeschlagen:', e);
    }
  }, [userProfile, onUpdateProfile]);

  const consentDate = photos[0]?.consentDate
    ? new Date(photos[0].consentDate).toLocaleDateString('de-DE')
    : null;

  return (
    <div className={`fixed inset-0 z-40 flex flex-col ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <button onClick={onClose} className="text-2xl">&times;</button>
        <h2 className="text-lg font-semibold">Gesicht verwalten</h2>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-6">
            {/* Foto-Grid */}
            <div className="grid grid-cols-3 gap-3">
              {ALL_TYPES.map(type => {
                const url = photoUrls[type];
                const record = photos.find(p => p.photoType === type);

                return (
                  <div key={type} className="text-center">
                    <div className={`aspect-square rounded-xl overflow-hidden mb-2 relative ${
                      isDark ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      {url ? (
                        <>
                          <img
                            src={url}
                            alt={PHOTO_LABELS[type]}
                            className="w-full h-full object-cover"
                          />
                          {/* Qualitaets-Badge */}
                          {record?.serverQuality && (
                            <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                              record.serverQuality.valid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                              {record.serverQuality.valid ? '\u2713' : '!'}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">
                          &#x1F464;
                        </div>
                      )}
                    </div>

                    <p className="text-xs font-medium mb-1">{PHOTO_LABELS[type]}</p>

                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => onReUpload(type)}
                        className="text-xs text-blue-500 underline"
                      >
                        Neu
                      </button>
                      {url && (
                        <button
                          onClick={() => handleDeleteOne(type)}
                          className="text-xs text-red-500 underline"
                        >
                          X
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Consent-Info */}
            {consentDate && (
              <div className={`p-3 rounded-xl text-sm ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p>&#x1F512; Einwilligung erteilt am {consentDate}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {photos.length} von 3 Fotos gespeichert
                </p>
              </div>
            )}

            {/* Aktionen */}
            <div className="space-y-3">
              <button
                onClick={() => onReUpload()}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium active:scale-[0.98]"
              >
                Alle Fotos neu aufnehmen
              </button>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-3 border border-red-500 text-red-500 rounded-xl font-medium active:scale-[0.98]"
                >
                  Alle Fotos loeschen
                </button>
              ) : (
                <div className={`p-4 rounded-xl border border-red-500/50 ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                  <p className="text-sm text-red-500 mb-3">
                    Moechtest du wirklich alle Gesichtsfotos unwiderruflich loeschen?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAll}
                      disabled={deleting}
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
                    >
                      {deleting ? 'Wird geloescht...' : 'Ja, loeschen'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceManage;
