import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch, apiUrl } from '../services/apiConfig';
import { getVideoT, type VideoT } from './videoTranslations';

interface RefImage {
  id: string;
  label: string;
  category: string;
  image_url: string;
}

interface ReferenceLibraryProps {
  selectionMode?: boolean;
  onSelectionChange?: (selected: RefImage[]) => void;
  onClose?: () => void;
  isLight?: boolean;
  language?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  person: '\uD83D\uDC64', // 👤
  object: '\uD83D\uDCE6', // 📦
  place: '\uD83C\uDFE0', // 🏠
  animal: '\uD83D\uDC15', // 🐕
};

const ReferenceLibrary: React.FC<ReferenceLibraryProps> = ({ selectionMode, onSelectionChange, onClose, isLight, language }) => {
  const t = getVideoT(language || 'de');
  const CATEGORY_LABELS: Record<string, string> = {
    person: t.cat_person, object: t.cat_object, place: t.cat_place, animal: t.cat_animal,
  };
  const [images, setImages] = useState<RefImage[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadLabel, setUploadLabel] = useState('');
  const [uploadCategory, setUploadCategory] = useState('person');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/reference-images');
      if (res.ok) setImages(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadImages(); }, [loadImages]);

  const handleUpload = useCallback(async () => {
    if (!uploadFile || !uploadLabel.trim()) { setError(t.image_label_required); return; }
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', uploadFile);
      fd.append('label', uploadLabel.trim());
      fd.append('category', uploadCategory);

      const res = await fetch(apiUrl('/api/reference-images'), {
        method: 'POST',
        body: fd,
        headers: {
          // Auth manuell (kein Content-Type — FormData setzt boundary automatisch)
          ...(await (async () => {
            try {
              const mod = await import('../services/supabaseClient');
              const { data: { session } } = await mod.supabase.auth.getSession();
              if (session?.access_token) return { Authorization: 'Bearer ' + session.access_token };
            } catch { /* ignore */ }
            return {};
          })()),
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: t.upload_failed }));
        setError(err.error || t.upload_failed);
        return;
      }

      setShowUpload(false);
      setUploadLabel('');
      setUploadFile(null);
      await loadImages();
    } catch (e) {
      setError(String(e));
    } finally {
      setUploading(false);
    }
  }, [uploadFile, uploadLabel, uploadCategory, loadImages]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiFetch('/api/reference-images/' + id, { method: 'DELETE' });
      setImages(prev => prev.filter(img => img.id !== id));
      setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
    } catch { /* ignore */ }
  }, []);

  const toggleSelection = useCallback((img: RefImage) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(img.id)) next.delete(img.id);
      else next.add(img.id);
      return next;
    });
  }, []);

  // Selection Change an Parent melden
  useEffect(() => {
    if (selectionMode && onSelectionChange) {
      onSelectionChange(images.filter(img => selected.has(img.id)));
    }
  }, [selected, images, selectionMode, onSelectionChange]);

  const cardBg = isLight ? 'bg-white border-indigo-100' : 'bg-white/5 border-white/10';
  const textColor = isLight ? 'text-gray-900' : 'text-white';
  const mutedColor = isLight ? 'text-gray-500' : 'text-white/50';

  return (
    <div className={`rounded-2xl border p-4 ${cardBg}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-semibold ${textColor}`}>{t.my_images}</h3>
          <p className={`text-xs ${mutedColor}`}>{images.length} / 20 {t.my_images_count}</p>
        </div>
        <div className="flex gap-2">
          {images.length < 20 && (
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-xl text-sm hover:scale-105 transition-transform"
            >
              <span className="material-icons text-sm">add_photo_alternate</span>
              {t.upload}
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className={`px-3 py-1.5 rounded-xl text-sm ${mutedColor} hover:bg-white/10`}>
              {t.close}
            </button>
          )}
        </div>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className={`rounded-xl border p-3 mb-4 ${isLight ? 'bg-indigo-50 border-indigo-200' : 'bg-white/5 border-white/10'}`}>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={uploadLabel}
              onChange={(e) => setUploadLabel(e.target.value)}
              placeholder={t.label_placeholder}
              maxLength={40}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-200' : 'bg-white/10 border-white/10 text-white'}`}
            />
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className={`rounded-lg border px-2 py-2 text-sm ${isLight ? 'bg-white border-gray-200' : 'bg-white/10 border-white/10 text-white'}`}
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{CATEGORY_ICONS[k]} {v}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className={`flex-1 rounded-lg border-2 border-dashed p-3 text-center text-sm transition-colors ${
                uploadFile
                  ? (isLight ? 'border-green-300 bg-green-50 text-green-700' : 'border-green-500/30 bg-green-500/10 text-green-400')
                  : (isLight ? 'border-gray-300 text-gray-400 hover:border-indigo-300' : 'border-white/20 text-white/40 hover:border-fuchsia-500/50')
              }`}
            >
              {uploadFile ? uploadFile.name : t.choose_image}
            </button>

            <button
              onClick={handleUpload}
              disabled={uploading || !uploadFile || !uploadLabel.trim()}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                uploading || !uploadFile || !uploadLabel.trim()
                  ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {uploading ? t.loading : t.save}
            </button>
          </div>

          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className={`text-center py-8 ${mutedColor}`}>{t.loading}</div>
      ) : images.length === 0 ? (
        <div className={`text-center py-8 ${mutedColor}`}>
          <span className="material-icons text-4xl mb-2 block opacity-30">photo_library</span>
          <p className="text-sm">{t.no_images}</p>
          <p className="text-xs mt-1">{t.no_images_hint}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {images.map(img => (
            <div
              key={img.id}
              onClick={selectionMode ? () => toggleSelection(img) : undefined}
              className={`relative rounded-xl overflow-hidden border transition-all ${
                selectionMode ? 'cursor-pointer hover:scale-[1.02]' : ''
              } ${
                selected.has(img.id)
                  ? 'border-fuchsia-500 ring-2 ring-fuchsia-500/50'
                  : isLight ? 'border-gray-200' : 'border-white/10'
              }`}
            >
              <img src={img.image_url} alt={img.label} className="w-full aspect-square object-cover" />

              {/* Selection Checkbox */}
              {selectionMode && (
                <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                  selected.has(img.id) ? 'bg-fuchsia-500 text-white' : 'bg-black/50 text-white/60'
                }`}>
                  {selected.has(img.id) && <span className="material-icons text-sm">check</span>}
                </div>
              )}

              {/* Label + Category */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs">{CATEGORY_ICONS[img.category]}</span>
                  <span className="text-white text-xs font-medium truncate">{img.label}</span>
                </div>
              </div>

              {/* Delete Button (nicht im selectionMode) */}
              {!selectionMode && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500/70 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <span className="material-icons text-sm">close</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReferenceLibrary;
