/**
 * ImageEditor — KI-Bildbearbeitung mit Text/Sprach-Input und Canvas-Masking.
 * Unterstuetzt Undo/Redo-Stack (max 5 Versionen).
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Language, ThemeMode } from '../types';
import { editImage, EditResult } from '../services/imageEditService';
import { FEATURE_PRICES } from '../config/pricing';

interface ImageEditorProps {
  initialImageUrl: string;
  language: Language;
  themeMode: ThemeMode;
  userCoins: number;
  onSave: (finalImageUrl: string, history: EditResult[]) => void;
  onClose: () => void;
}

const MAX_HISTORY = 5;

const ImageEditor: React.FC<ImageEditorProps> = ({
  initialImageUrl,
  language,
  themeMode,
  userCoins,
  onSave,
  onClose,
}) => {
  const [currentImageUrl, setCurrentImageUrl] = useState(initialImageUrl);
  const [editPrompt, setEditPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [maskActive, setMaskActive] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Undo/Redo
  const [history, setHistory] = useState<EditResult[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDark = themeMode === ThemeMode?.DARK;
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;
  const editCost = FEATURE_PRICES.IMAGE_EDIT;

  // Canvas fuer Maske initialisieren
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [currentImageUrl]);

  // Maske zeichnen
  const startDraw = useCallback((e: React.PointerEvent) => {
    if (!maskActive) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(
      ((e.clientX - rect.left) / rect.width) * canvas.width,
      ((e.clientY - rect.top) / rect.height) * canvas.height
    );
  }, [maskActive]);

  const draw = useCallback((e: React.PointerEvent) => {
    if (!isDrawing || !maskActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [isDrawing, maskActive]);

  const stopDraw = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Maske als Base64 exportieren
  const getMaskBase64 = useCallback((): string | undefined => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = imageData.data.some((v, i) => i % 4 === 3 && v > 0);
    if (!hasContent) return undefined;

    // Maske in Schwarz/Weiss konvertieren (Weiss = zu bearbeitender Bereich)
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d')!;
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] > 0) {
        const px = (i / 4) % canvas.width;
        const py = Math.floor((i / 4) / canvas.width);
        maskCtx.fillStyle = 'white';
        maskCtx.fillRect(px, py, 1, 1);
      }
    }

    return maskCanvas.toDataURL('image/png');
  }, []);

  // Maske loeschen
  const clearMask = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Edit ausfuehren
  const handleEdit = useCallback(async () => {
    if (!editPrompt.trim() || loading) return;
    if (userCoins < editCost) {
      setError(`Nicht genug Coins (${userCoins}/${editCost})`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const maskBase64 = getMaskBase64();
      const result = await editImage({
        sourceImageUrl: currentImageUrl,
        prompt: editPrompt.trim(),
        maskBase64,
      });

      // History aktualisieren
      const newHistory = [...history.slice(0, historyIndex + 1), result].slice(-MAX_HISTORY);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCurrentImageUrl(result.imageUrl);
      setEditPrompt('');
      clearMask();
    } catch (e: any) {
      setError(e.message || 'Bearbeitung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }, [editPrompt, loading, currentImageUrl, history, historyIndex, userCoins, editCost, getMaskBase64, clearMask]);

  // Undo
  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setCurrentImageUrl(newIndex >= 0 ? history[newIndex].imageUrl : initialImageUrl);
  }, [canUndo, historyIndex, history, initialImageUrl]);

  // Redo
  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setCurrentImageUrl(history[newIndex].imageUrl);
  }, [canRedo, historyIndex, history]);

  // Spracheingabe
  const toggleVoice = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      setError('Spracherkennung wird von diesem Browser nicht unterstuetzt');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'de' ? 'de-DE' : language === 'tr' ? 'tr-TR' : language === 'ar' ? 'ar-SA' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setEditPrompt(prev => prev ? `${prev} ${text}` : text);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  }, [isListening, language]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <button onClick={onClose} className="text-2xl">&times;</button>
        <h2 className="text-sm font-bold">Bild bearbeiten</h2>
        <button
          onClick={() => onSave(currentImageUrl, history)}
          className="text-sm text-blue-500 font-bold"
        >
          Speichern
        </button>
      </div>

      {/* Toolbar */}
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`p-2 rounded-lg text-sm ${canUndo ? 'text-blue-500' : 'text-gray-500 opacity-40'}`}
          title="Rueckgaengig"
        >
          <span className="material-icons text-lg">undo</span>
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className={`p-2 rounded-lg text-sm ${canRedo ? 'text-blue-500' : 'text-gray-500 opacity-40'}`}
          title="Wiederherstellen"
        >
          <span className="material-icons text-lg">redo</span>
        </button>
        <div className="w-px h-6 bg-gray-600" />
        <button
          onClick={() => { setMaskActive(!maskActive); if (maskActive) clearMask(); }}
          className={`p-2 rounded-lg text-sm ${maskActive ? 'bg-red-500/20 text-red-400' : isDark ? 'text-gray-400' : 'text-gray-600'}`}
          title="Bereich markieren"
        >
          <span className="material-icons text-lg">gesture</span>
        </button>
        {maskActive && (
          <button onClick={clearMask} className="p-2 rounded-lg text-sm text-gray-400" title="Maske loeschen">
            <span className="material-icons text-lg">delete_sweep</span>
          </button>
        )}
        <div className="flex-1" />
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {userCoins} Coins
        </span>
      </div>

      {/* Bild + Canvas-Overlay */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
        <img
          src={currentImageUrl}
          alt="Bearbeitung"
          className="max-w-full max-h-full object-contain"
          draggable={false}
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            if (canvasRef.current) {
              canvasRef.current.width = img.naturalWidth;
              canvasRef.current.height = img.naturalHeight;
            }
          }}
        />
        {maskActive && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            style={{ touchAction: 'none' }}
            onPointerDown={startDraw}
            onPointerMove={draw}
            onPointerUp={stopDraw}
            onPointerLeave={stopDraw}
          />
        )}
        {loading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-white text-sm">Wird bearbeitet...</p>
            </div>
          </div>
        )}
      </div>

      {/* Fehler */}
      {error && (
        <div className="px-3 py-2 bg-red-500/10 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Input-Bereich */}
      <div className={`p-3 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="flex gap-2">
          <button
            onClick={toggleVoice}
            className={`p-3 rounded-xl ${isListening ? 'bg-red-500 text-white animate-pulse' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
          >
            <span className="material-icons">{isListening ? 'mic' : 'mic_none'}</span>
          </button>
          <input
            type="text"
            value={editPrompt}
            onChange={e => setEditPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEdit()}
            placeholder={maskActive ? 'Was soll in diesem Bereich geaendert werden?' : 'Was moechtest du aendern?'}
            className={`flex-1 px-4 py-3 rounded-xl text-sm ${isDark ? 'bg-gray-700 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'} outline-none`}
          />
          <button
            onClick={handleEdit}
            disabled={!editPrompt.trim() || loading}
            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              editPrompt.trim() && !loading
                ? 'bg-blue-500 text-white active:scale-95'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? '...' : `${editCost}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
