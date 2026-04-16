import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Language, ThemeMode } from '../types';
import StoryVideoPlayer from './StoryVideoPlayer';
import LiveTranscriber from './LiveTranscriber';
import ReferenceLibrary from './ReferenceLibrary';
import { VideoGenerationOptions } from '../services/videoGenerationService';
import { apiFetch } from '../services/apiConfig';
import { enhanceDreamPrompt, type Scene } from '../services/dreamQualityService';
import { getVideoT } from './videoTranslations';
import { loadDreamsSecurely, saveDreamsSecurely } from '../services/storage';

export type ContentMode = 'dream_only' | 'interpretation' | 'both';

// ── Types ──────────────────────────────────────────────────────────
type Tab = 'ai' | 'slideshow';
type UITab = 'dream' | 'slideshow' | 'library';
type Quality = 'standard' | 'hd';
type VideoStyle = 'real' | 'anime' | 'cartoon' | 'cinematic' | 'fantasy' | 'surreal';
type VideoTier = 'standard' | 'vip';
type VideoDuration = 5 | 10 | 15;

export interface VideoGenerateOptions {
  tab: Tab;
  quality: Quality;
  voiceMode: 'user_voice' | 'ai_voice';
  contentMode: ContentMode;
  voiceId: string;
  voiceBlob: Blob | null;
  style?: string;
  extraPrompt?: string;
  faceSwapEnabled?: boolean;
}

export interface VideoStudioProps {
  language: Language;
  themeMode: ThemeMode;
  dreamText: string;
  interpretationText?: string;
  dreamId?: string | null;
  initialMode?: string;
  onClose: () => void;
  onSave: (result: { videoUrl: string; type: 'ai' | 'slideshow' }) => void;
  onGenerate?: (dreamText: string, options: VideoGenerateOptions) => Promise<string | null>;
  userCredits: number;
}

// ── Styles ─────────────────────────────────────────────────────────
const VIDEO_STYLE_IDS: { id: VideoStyle; icon: string; key: keyof import('./videoTranslations').VideoT }[] = [
  { id: 'real', icon: '\uD83C\uDFAC', key: 'style_real' },
  { id: 'anime', icon: '\uD83C\uDF8C', key: 'style_anime' },
  { id: 'cartoon', icon: '\uD83C\uDFA8', key: 'style_cartoon' },
  { id: 'cinematic', icon: '\uD83C\uDFA5', key: 'style_cinematic' },
  { id: 'fantasy', icon: '\u2728', key: 'style_fantasy' },
  { id: 'surreal', icon: '\uD83C\uDF00', key: 'style_surreal' },
];

// Mapping Frontend-Style → Backend-Kategorie
const STYLE_TO_CATEGORY: Record<VideoStyle, string> = {
  real: 'realistic', anime: 'anime', cartoon: 'cartoon',
  cinematic: 'cinematic', fantasy: 'fantasy', surreal: 'artistic',
};

// ── Hintergrundmusik Track IDs ────────────────────────────────────
const BGM_TRACK_IDS: { id: string; nameKey: keyof import('./videoTranslations').VideoT; moodKey: keyof import('./videoTranslations').VideoT }[] = [
  { id: 'calm_piano', nameKey: 'bgm_calm_piano', moodKey: 'mood_peaceful' },
  { id: 'mystical_ambient', nameKey: 'bgm_mystical_ambient', moodKey: 'mood_mysterious' },
  { id: 'dark_tension', nameKey: 'bgm_dark_tension', moodKey: 'mood_threatening' },
  { id: 'epic_orchestra', nameKey: 'bgm_epic_orchestra', moodKey: 'mood_heroic' },
  { id: 'arabic_oud', nameKey: 'bgm_arabic_oud', moodKey: 'mood_oriental' },
  { id: 'dreamy_synth', nameKey: 'bgm_dreamy_synth', moodKey: 'mood_dreamy' },
  { id: 'nature_forest', nameKey: 'bgm_nature_forest', moodKey: 'mood_natural' },
  { id: 'ocean_waves', nameKey: 'bgm_ocean_waves', moodKey: 'mood_calming' },
  { id: 'heartbeat_suspense', nameKey: 'bgm_heartbeat_suspense', moodKey: 'mood_exciting' },
  { id: 'celestial_choir', nameKey: 'bgm_celestial_choir', moodKey: 'mood_spiritual' },
  { id: 'jazz_lounge', nameKey: 'bgm_jazz_lounge', moodKey: 'mood_relaxed' },
  { id: 'tribal_drums', nameKey: 'bgm_tribal_drums', moodKey: 'mood_powerful' },
  { id: 'rain_thunder', nameKey: 'bgm_rain_thunder', moodKey: 'mood_dramatic' },
  { id: 'crystal_bells', nameKey: 'bgm_crystal_bells', moodKey: 'mood_magical' },
  { id: 'desert_wind', nameKey: 'bgm_desert_wind', moodKey: 'mood_lonely' },
  { id: 'underwater', nameKey: 'bgm_underwater', moodKey: 'mood_surreal' },
  { id: 'clock_ticking', nameKey: 'bgm_clock_ticking', moodKey: 'mood_eerie' },
  { id: 'children_laughter', nameKey: 'bgm_children_laughter', moodKey: 'mood_nostalgic' },
  { id: 'war_drums', nameKey: 'bgm_war_drums', moodKey: 'mood_combative' },
  { id: 'space_ambient', nameKey: 'bgm_space_ambient', moodKey: 'mood_cosmic' },
];

interface RefImage { id: string; label: string; category: string; image_url: string; }

// ── Component ──────────────────────────────────────────────────────
const VideoStudio: React.FC<VideoStudioProps> = ({
  language, themeMode, dreamText, onClose, onSave, onGenerate, userCredits,
}) => {
  const isLight = themeMode === 'light';
  const t = getVideoT(language as string);

  // UI State
  const [uiTab, setUiTab] = useState<UITab>('dream');
  const [prompt, setPrompt] = useState(dreamText || '');
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle>('cinematic');
  const [duration, setDuration] = useState<VideoDuration>(5);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [showTranscriber, setShowTranscriber] = useState(false);
  const [showRefPicker, setShowRefPicker] = useState(false);

  // Config-Chat Assistent
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant'; content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [selectedRefs, setSelectedRefs] = useState<RefImage[]>([]);

  // Tier + Preise
  const [selectedTier, setSelectedTier] = useState<VideoTier>('standard');
  const [standardPrice, setStandardPrice] = useState<{coins: number; modelName: string; hasAudio: boolean; maxDuration: number} | null>(null);
  const [vipPrice, setVipPrice] = useState<{coins: number; modelName: string; hasAudio: boolean; maxDuration: number} | null>(null);

  // Eigene Stimme + Hintergrundmusik
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [useOwnVoice, setUseOwnVoice] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(80);
  const [selectedBgm, setSelectedBgm] = useState<string | null>(null);
  const [bgmVolume, setBgmVolume] = useState(30);
  const [bgmPreviewAudio, setBgmPreviewAudio] = useState<HTMLAudioElement | null>(null);

  // DreamQuality Agent
  const [agentScenes, setAgentScenes] = useState<Scene[] | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);

  // MP3 Upload
  const [userMusicFile, setUserMusicFile] = useState<File | null>(null);
  const [userMusicUrl, setUserMusicUrl] = useState<string | null>(null);
  const [musicLoop, setMusicLoop] = useState(true);
  const musicFileRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Geräte-Foto Upload (Referenzbild)
  const [devicePhoto, setDevicePhoto] = useState<string | null>(null);
  const devicePhotoRef = useRef<HTMLInputElement>(null);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState('');
  const [genError, setGenError] = useState('');
  const [userNotice, setUserNotice] = useState<string | null>(null);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [narrationAudioUrl, setNarrationAudioUrl] = useState<string | null>(null);
  const narrationRef = useRef<HTMLAudioElement | null>(null);
  const resultTypeRef = useRef<'ai' | 'slideshow'>('ai');
  const abortRef = useRef(false);

  // Theme
  const bg = isLight ? 'bg-mystic-bg' : 'bg-dream-surface';
  const cardBg = isLight ? 'bg-white border border-indigo-100/80' : 'bg-white/5 border border-white/10';
  const textP = isLight ? 'text-gray-900' : 'text-white';
  const textS = isLight ? 'text-gray-500' : 'text-white/50';
  const accent = isLight ? 'text-indigo-600' : 'text-fuchsia-400';

  // Model detection + Einschraenkungen bei Fotos
  const hasPhoto = selectedRefs.length > 0 || !!devicePhoto;
  const useSeedance = selectedRefs.length > 0;
  const maxDurationForMode = hasPhoto ? 10 : 15;

  // Stile die Image-to-Video unterstuetzen (Backend: wan2.6-i2v, seedance-i2v, kling-o3-i2v)
  const I2V_SUPPORTED_STYLES: VideoStyle[] = ['real', 'anime', 'cartoon', 'fantasy', 'surreal', 'cinematic'];
  // Auto-Korrektur: Dauer reduzieren wenn Fotos hinzugefuegt werden
  useEffect(() => {
    if (hasPhoto && duration > maxDurationForMode) {
      setDuration(maxDurationForMode as VideoDuration);
    }
  }, [hasPhoto, duration, maxDurationForMode]);
  const activePrice = selectedTier === 'vip' ? vipPrice : standardPrice;
  const tierLabel = selectedTier === 'vip' ? t.quality_vip : t.quality_standard;
  const durationWarning = activePrice && duration > activePrice.maxDuration;

  // ── Live Dual-Price Fetch ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const base = { category: STYLE_TO_CATEGORY[selectedStyle], duration: String(duration), mode: useSeedance ? 'image' : 'text', zone: 'zone1' };
    const fetchTier = (tier: string) =>
      fetch(`/api/video/price?${new URLSearchParams({ ...base, tier })}`).then(r => r.ok ? r.json() : null).catch(() => null);

    Promise.all([fetchTier('standard'), fetchTier('vip')]).then(([std, vip]) => {
      if (cancelled) return;
      setStandardPrice(std);
      setVipPrice(vip);
    });
    return () => { cancelled = true; };
  }, [selectedStyle, duration, useSeedance]);

  // ── DreamQuality Agent (Slideshow) ──────────────────────────────
  useEffect(() => {
    if (uiTab !== 'slideshow' || !prompt.trim() || prompt.trim().length < 10) return;
    let cancelled = false;
    setAgentLoading(true);
    enhanceDreamPrompt(prompt, language as string, STYLE_TO_CATEGORY[selectedStyle], selectedTier)
      .then(result => { if (!cancelled) setAgentScenes(result.scenes); })
      .catch(() => { if (!cancelled) setAgentScenes(null); })
      .finally(() => { if (!cancelled) setAgentLoading(false); });
    return () => { cancelled = true; };
  }, [uiTab, prompt, selectedStyle, selectedTier, language]);

  // ── Abbrechen ────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    abortRef.current = true;
    setIsGenerating(false);
    setGenProgress('');
    setGenError(t.error_cancelled);
  }, []);

  // ── Geschaetzte Dauer ───────────────────────────────────────────
  const estimatedSeconds = (() => {
    const words = prompt.trim().split(/\s+/).filter(Boolean).length;
    if (uiTab === 'slideshow') {
      const imgCount = agentScenes ? agentScenes.length : Math.max(3, Math.ceil(words / 15));
      return Math.round(imgCount * (duration || 3));
    }
    return duration || 5;
  })();

  // ── Config-Chat Handler ──────────────────────────────────────────
  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setChatLoading(true);

    try {
      const res = await apiFetch('/api/video/config-chat', {
        method: 'POST',
        body: JSON.stringify({ message: msg, history: chatMessages, currentConfig: { persona: {}, defaults: { art_style: selectedStyle, mood: 'auto' }, onboarding_completed: false } }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply || t.error_generic }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: t.error_connection }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, chatMessages, selectedStyle]);

  // ── Result Display ───────────────────────────────────────────────
  if (resultVideoUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        {/* Narration Audio (auto-play mit Video) */}
        {narrationAudioUrl && (
          <audio
            ref={narrationRef}
            src={narrationAudioUrl}
            autoPlay
            onEnded={() => {}}
          />
        )}
        <StoryVideoPlayer
          videoUrl={resultVideoUrl}
          onClose={() => {
            if (narrationRef.current) { narrationRef.current.pause(); }
            if (narrationAudioUrl) URL.revokeObjectURL(narrationAudioUrl);
            onSave({ videoUrl: resultVideoUrl, type: resultTypeRef.current });
            setResultVideoUrl(null);
            setNarrationAudioUrl(null);
          }}
        />
      </div>
    );
  }

  // ── Generate Handler ─────────────────────────────────────────────
  const handleGenerate = async () => {
    if (isGenerating || !prompt.trim()) return;
    abortRef.current = false;
    setIsGenerating(true);
    setGenError('');
    setGenProgress(t.progress_enriching);

    try {
      setGenProgress(useSeedance
        ? t.progress_photos
        : t.progress_video);

      // Prompt-Agent: Risk-Check → Routing → Generierung mit Fallback
      const styleHint = VIDEO_STYLE_IDS.find(s => s.id === selectedStyle);
      const safeBody: Record<string, unknown> = {
        prompt: prompt.trim(),
        mediaType: 'video',
        stylePrompt: styleHint ? `${t[styleHint.key]} style, dreamlike atmosphere` : undefined,
      };
      // Foto mitschicken: devicePhoto (eigener Upload) oder selectedRefs (Bibliothek)
      const photoUrl = devicePhoto || (selectedRefs.length > 0 ? selectedRefs[0].image_url : null);
      if (photoUrl) {
        safeBody.customization = { reference_photo: photoUrl };
      }
      const createRes = await apiFetch('/api/video/safe-generate', {
        method: 'POST',
        body: JSON.stringify(safeBody),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData.user_notice || errData.error || errData.detail || t.error_server + ': ' + createRes.status);
      }

      const result = await createRes.json();
      const taskId = result.taskId;
      if (!taskId) throw new Error(result.user_notice || t.error_no_task);

      // User-Hinweis persistent anzeigen wenn Prompt umgeschrieben wurde
      if (result.user_notice) {
        setUserNotice(result.user_notice);
      }

      setGenProgress(`Video wird generiert... (ca. ${result.estimatedWaitSeconds || 60}s)`);

      // Polling via /api/video/status (mit Abbruch-Check)
      let attempts = 0;
      while (attempts < 120) {
        await new Promise(r => setTimeout(r, 5000));
        if (abortRef.current) throw new Error(t.error_cancelled);
        attempts++;

        try {
          const pollRes = await apiFetch(`/api/video/status?taskId=${taskId}&provider=evolink`);
          if (!pollRes.ok) continue;
          const data = await pollRes.json();

          if (data.status === 'succeeded' && data.videoUrl) {
            resultTypeRef.current = 'ai';
            // TTS-Narration generieren
            setGenProgress('Erzählstimme wird generiert...');
            try {
              const ttsRes = await apiFetch('/api/deepgram-tts', {
                method: 'POST',
                body: JSON.stringify({ text: prompt.trim(), language: language }),
              });
              if (ttsRes.ok) {
                const audioBlob = await ttsRes.blob();
                setNarrationAudioUrl(URL.createObjectURL(audioBlob));
              }
            } catch { /* Narration optional */ }

            // Dream mit Video in Storage speichern
            try {
              const existingDreams = await loadDreamsSecurely();
              const newDream = {
                id: `dream-${Date.now()}`,
                title: prompt.trim().slice(0, 60) + (prompt.trim().length > 60 ? '...' : ''),
                description: prompt.trim(),
                interpretation: '',
                date: new Date().toISOString().split('T')[0],
                userAvatar: '',
                videoUrl: data.videoUrl,
                tags: [],
                likes: 0,
                comments: 0,
                matchPercentage: 0,
              };
              await saveDreamsSecurely([newDream, ...existingDreams]);
              console.log('[VideoStudio] Dream mit Video gespeichert:', newDream.id);
            } catch (saveErr) {
              console.error('[VideoStudio] Dream-Speicherung fehlgeschlagen:', saveErr);
            }

            setResultVideoUrl(data.videoUrl);
            return;
          }

          if (data.status === 'failed') {
            throw new Error(t.error_failed + ': ' + (data.error || t.error_unknown));
          }

          const pct = data.progress || Math.min(95, Math.round((attempts / 60) * 100));
          setGenProgress(t.progress_generating + ' ' + pct + '%');
        } catch (pollErr: any) {
          if (pollErr.message?.includes('fehlgeschlagen')) throw pollErr;
        }
      }
      throw new Error(t.error_timeout);

    } catch (e: any) {
      console.error('[VideoStudio] Generation failed:', e);
      setGenError(e.message || t.error_generation);
    } finally {
      setIsGenerating(false);
      setGenProgress('');
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className={`fixed inset-0 z-50 ${bg} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${isLight ? 'border-indigo-100 bg-white/95' : 'border-white/10 bg-dream-surface/95'}`}>
        <h2 className={`text-lg font-bold ${textP}`}>{t.title}</h2>
        <button onClick={onClose} className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
          <span className="material-icons">close</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-3 gap-2">
        {([['dream', 'movie_creation', t.tab_dreamvideo], ['slideshow', 'slideshow', t.tab_slideshow], ['library', 'photo_library', t.tab_my_images]] as [string, string, string][]).map(([tab, icon, label]) => (
          <button
            key={tab}
            onClick={() => setUiTab(tab as UITab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              uiTab === tab
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg'
                : isLight ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-white/60'
            }`}
          >
            <span className="material-icons text-base">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* ── Meine Bilder Tab ── */}
        {uiTab === 'library' && (
          <ReferenceLibrary isLight={isLight} />
        )}

        {/* ── Slideshow Tab ── */}
        {uiTab === 'slideshow' && (
          <>
            {/* Prompt */}
            <div className={`rounded-2xl border p-4 ${cardBg}`}>
              <label className={`text-sm font-semibold mb-2 block ${accent}`}>{t.tab_slideshow}</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.placeholder_slideshow}
                rows={4}
                className={`w-full rounded-xl border p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-fuchsia-500 ${
                  isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'
                }`}
              />
            </div>

            {/* Stil + Qualitaet + Intervall */}
            <div className={`rounded-2xl border p-4 ${cardBg}`}>
              {/* Style Picker (gleich wie Video-Tab) */}
              <label className={`text-sm font-semibold mb-2 block ${accent}`}>{t.style_label}</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {VIDEO_STYLE_IDS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-sm flex items-center gap-1 transition-all ${
                      selectedStyle === s.id
                        ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md'
                        : isLight ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <span>{s.icon}</span> {t[s.key]}
                  </button>
                ))}
              </div>

              {/* Tier Toggle (gleich wie Video-Tab) */}
              <label className={`text-sm font-semibold mb-2 block ${accent}`}>{t.quality_label}</label>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSelectedTier('standard')}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold flex flex-col items-center gap-0.5 transition-all ${
                    selectedTier === 'standard'
                      ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md'
                      : isLight ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-white/60'
                  }`}
                >
                  <span>{'\u26A1'} {t.quality_standard}</span>
                  <span className="text-[11px] font-bold opacity-80">{t.coins_per_image}</span>
                </button>
                <button
                  onClick={() => setSelectedTier('vip')}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold flex flex-col items-center gap-0.5 transition-all ${
                    selectedTier === 'vip'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : isLight ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-white/60'
                  }`}
                >
                  <span>{'\uD83D\uDC51'} {t.quality_vip}</span>
                  <span className="text-[11px] font-bold opacity-80">{t.coins_per_image}</span>
                </button>
              </div>

              {/* Intervall-Regler */}
              <label className={`text-sm font-semibold mb-2 block ${accent}`}>{t.slide_interval}: ~{duration}s</label>
              <input
                type="range"
                min={2}
                max={6}
                step={0.5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) as VideoDuration)}
                className={`w-full h-2 rounded-full cursor-pointer mb-1 ${isLight ? 'accent-indigo-500' : 'accent-fuchsia-500'}`}
                style={{ minHeight: '20px' }}
              />
              <div className={`flex justify-between text-[10px] mb-4 ${textS}`}>
                <span>2s</span>
                <span>6s</span>
              </div>

              {/* Szenen-Info + Live-Preis */}
              <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${isLight ? 'bg-indigo-50' : 'bg-white/5'}`}>
                <div className="flex flex-col">
                  <span className={`text-xs ${textS}`}>
                    {agentLoading ? t.chat_thinking : agentScenes
                      ? `${agentScenes.length} ${t.slide_scenes}, ~${Math.round(agentScenes.reduce((s, sc) => s + sc.duration, 0))}s`
                      : `${t.slide_estimated}: ${Math.ceil(30 / (duration || 3))} ${t.my_images_count}, ~30s`}
                  </span>
                </div>
                <span className={`text-base font-bold ${accent}`}>
                  {(() => {
                    const imgCount = agentScenes ? agentScenes.length : Math.ceil(30 / (duration || 3));
                    const costPerImg = selectedTier === 'vip' ? 12 : 5;
                    return `${imgCount * costPerImg} Coins`;
                  })()}
                </span>
              </div>
            </div>

            {/* Referenzbilder fuer Slideshow */}
            <div className={`rounded-2xl border p-4 ${cardBg}`}>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-semibold ${accent}`}>{t.ref_images_label}</label>
                <button
                  onClick={() => setShowRefPicker(!showRefPicker)}
                  className={`text-sm flex items-center gap-1 ${accent} hover:underline`}
                >
                  <span className="material-icons text-base">add_photo_alternate</span>
                  {showRefPicker ? t.close : t.ref_choose}
                </button>
              </div>
              {selectedRefs.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedRefs.map(ref => (
                    <div key={ref.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isLight ? 'bg-indigo-50 border-indigo-200' : 'bg-fuchsia-500/10 border-fuchsia-500/30'}`}>
                      <img src={ref.image_url} alt={ref.label} className="w-6 h-6 rounded-full object-cover" />
                      <span className={`text-xs font-medium ${textP}`}>{ref.label}</span>
                      <button onClick={() => setSelectedRefs(prev => prev.filter(r => r.id !== ref.id))} className="text-red-400">
                        <span className="material-icons text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {showRefPicker && (
                <div className="mt-2">
                  <ReferenceLibrary selectionMode isLight={isLight} onSelectionChange={setSelectedRefs} onClose={() => setShowRefPicker(false)} />
                </div>
              )}
            </div>

            {/* Audio Controls fuer Slideshow */}
            <div className={`rounded-2xl border p-4 ${cardBg}`}>
              <label className={`text-sm font-semibold mb-3 block ${accent}`}>{t.audio_label}</label>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-icons text-base" style={{ color: useOwnVoice ? '#a855f7' : undefined }}>mic</span>
                  <span className={`text-sm ${textP}`}>{t.own_voice}</span>
                  {voiceBlob && <span className={`text-[10px] px-2 py-0.5 rounded-full ${isLight ? 'bg-green-100 text-green-700' : 'bg-green-900/30 text-green-400'}`}>{t.recording_available}</span>}
                </div>
                <button onClick={() => setUseOwnVoice(!useOwnVoice)}
                  className={`w-12 h-7 rounded-full transition-all relative ${useOwnVoice ? 'bg-fuchsia-600' : isLight ? 'bg-gray-300' : 'bg-white/20'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${useOwnVoice ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              {useOwnVoice && voiceBlob && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs ${textS}`}>{t.voice_volume}</span>
                    <span className={`text-xs font-semibold ${accent}`}>{voiceVolume}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={voiceVolume} onChange={(e) => setVoiceVolume(Number(e.target.value))}
                    className={`w-full h-2 rounded-full cursor-pointer ${isLight ? 'accent-indigo-500' : 'accent-fuchsia-500'}`} style={{ minHeight: '20px' }} />
                </div>
              )}
              <div className={`border-t pt-3 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-icons text-base" style={{ color: selectedBgm ? '#f59e0b' : undefined }}>music_note</span>
                  <span className={`text-sm ${textP}`}>{t.bgm_label}</span>
                </div>
                <select value={selectedBgm || ''} onChange={(e) => { setSelectedBgm(e.target.value || null); bgmPreviewAudio?.pause(); setBgmPreviewAudio(null); }}
                  className={`w-full rounded-xl border p-2.5 text-sm mb-2 ${isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`}>
                  <option value="">{t.no_music}</option>
                  {BGM_TRACK_IDS.map(bgm => (<option key={bgm.id} value={bgm.id}>{t[bgm.nameKey]} ({t[bgm.moodKey]})</option>))}
                </select>
                {selectedBgm && (
                  <>
                    <button onClick={() => { if (bgmPreviewAudio) { bgmPreviewAudio.pause(); setBgmPreviewAudio(null); return; } const a = new Audio(`/app/audio/bgm/${selectedBgm}.mp3`); a.volume = bgmVolume / 100; a.loop = true; a.play().catch(() => {}); setBgmPreviewAudio(a); }}
                      className={`flex items-center gap-1 text-sm mb-2 ${accent} hover:underline`}>
                      <span className="material-icons text-base">{bgmPreviewAudio ? 'pause' : 'play_arrow'}</span>
                      {bgmPreviewAudio ? t.stop : t.preview}
                    </button>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${textS}`}>{t.music_volume}</span>
                      <span className={`text-xs font-semibold ${accent}`}>{bgmVolume}%</span>
                    </div>
                    <input type="range" min={0} max={100} value={bgmVolume} onChange={(e) => { setBgmVolume(Number(e.target.value)); if (bgmPreviewAudio) bgmPreviewAudio.volume = Number(e.target.value) / 100; }}
                      className="w-full h-2 rounded-full cursor-pointer accent-amber-500" style={{ minHeight: '20px' }} />
                  </>
                )}
              </div>
              {/* MP3 Upload */}
              <div className={`border-t pt-3 mt-3 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-icons text-base">upload_file</span>
                  <span className={`text-sm ${textP}`}>{t.own_music}</span>
                </div>
                <button onClick={() => musicFileRef.current?.click()}
                  className={`w-full rounded-xl border-2 border-dashed p-3 text-center text-sm mb-2 ${userMusicFile ? (isLight ? 'border-green-300 bg-green-50 text-green-700' : 'border-green-500/30 bg-green-500/10 text-green-400') : (isLight ? 'border-gray-300 text-gray-400' : 'border-white/20 text-white/40')}`}>
                  {userMusicFile ? userMusicFile.name : t.upload_mp3}
                </button>
              </div>
            </div>

            {/* Error */}
            {genError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-red-400 text-sm">{genError}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={async () => {
                if (isGenerating || !prompt.trim() || !onGenerate) return;
                setIsGenerating(true);
                setGenError('');
                setGenProgress(t.progress_slideshow);
                try {
                  const videoUrl = await onGenerate(prompt.trim(), {
                    tab: 'slideshow',
                    quality: selectedTier === 'vip' ? 'hd' : 'standard',
                    voiceMode: useOwnVoice && voiceBlob ? 'user_voice' : 'ai_voice',
                    contentMode: 'dream_only',
                    voiceId: 'luna',
                    voiceBlob: useOwnVoice ? voiceBlob : null,
                    style: selectedStyle,
                  });
                  if (videoUrl) {
                    resultTypeRef.current = 'slideshow';
                    setResultVideoUrl(videoUrl);
                  } else {
                    setGenError(t.error_slideshow);
                  }
                } catch (e: any) {
                  setGenError(e.message || t.error_slideshow);
                } finally {
                  setIsGenerating(false);
                  setGenProgress('');
                }
              }}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 transition-all ${
                isGenerating || !prompt.trim()
                  ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:scale-[1.02]'
              }`}
            >
              {isGenerating ? (
                <>
                  <span className="material-icons animate-spin text-xl">hourglass_top</span>
                  {genProgress}
                </>
              ) : (
                <>
                  <span className="material-icons text-xl">slideshow</span>
                  {t.slide_generate}
                </>
              )}
            </button>
          </>
        )}

        {/* ── KI-Video Tab (dream) ── */}
        {uiTab === 'dream' && (
          <>
            {/* Prompt */}
            <div className={`rounded-2xl border p-4 ${cardBg}`}>
              <label className={`text-sm font-semibold mb-2 block ${accent}`}>
                {uiTab === 'dream' ? t.describe_scene : t.describe_dream}
              </label>

              {showTranscriber ? (
                <LiveTranscriber
                  language={language as string}
                  isLight={isLight}
                  onTranscriptComplete={(text, audioBlob) => { setPrompt(text); if (audioBlob) { setVoiceBlob(audioBlob); setUseOwnVoice(true); } setShowTranscriber(false); }}
                  onCancel={() => setShowTranscriber(false)}
                />
              ) : (
                <>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={uiTab === 'dream'
                      ? t.placeholder_dream
                      : t.describe_dream}
                    rows={4}
                    className={`w-full rounded-xl border p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-fuchsia-500 ${
                      isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                  <button
                    onClick={() => setShowTranscriber(true)}
                    className={`mt-2 flex items-center gap-1.5 text-sm ${accent} hover:underline`}
                  >
                    <span className="material-icons text-base">mic</span>
                    {t.speak_input}
                  </button>
                </>
              )}
            </div>

            {/* Reference Images */}
            <div className={`rounded-2xl border p-4 ${cardBg}`}>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-semibold ${accent}`}>{t.ref_images_label}</label>
                <button
                  onClick={() => setShowRefPicker(!showRefPicker)}
                  className={`text-sm flex items-center gap-1 ${accent} hover:underline`}
                >
                  <span className="material-icons text-base">add_photo_alternate</span>
                  {showRefPicker ? t.close : t.ref_choose}
                </button>
              </div>

              {/* Selected Chips */}
              {selectedRefs.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedRefs.map(ref => (
                    <div key={ref.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isLight ? 'bg-indigo-50 border-indigo-200' : 'bg-fuchsia-500/10 border-fuchsia-500/30'}`}>
                      <img src={ref.image_url} alt={ref.label} className="w-6 h-6 rounded-full object-cover" />
                      <span className={`text-xs font-medium ${textP}`}>{ref.label}</span>
                      <button onClick={() => setSelectedRefs(prev => prev.filter(r => r.id !== ref.id))} className="text-red-400 hover:text-red-500">
                        <span className="material-icons text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Geräte-Foto Upload */}
              <div className="mt-2">
                <input ref={devicePhotoRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onloadend = () => setDevicePhoto(reader.result as string);
                    reader.readAsDataURL(f);
                    e.target.value = '';
                  }}
                />
                {devicePhoto ? (
                  <div className="flex items-center gap-2">
                    <img src={devicePhoto} alt="Ref" className="w-12 h-12 rounded-xl object-cover border border-green-500/50" />
                    <span className={`text-xs flex-1 ${isLight ? 'text-green-700' : 'text-green-400'}`}>Referenzfoto geladen</span>
                    <button onClick={() => setDevicePhoto(null)} className="text-red-400 hover:text-red-500">
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => devicePhotoRef.current?.click()}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border-2 border-dashed transition-colors ${
                      isLight ? 'border-indigo-200 text-indigo-500 hover:bg-indigo-50' : 'border-white/20 text-white/50 hover:bg-white/5'
                    }`}
                  >
                    <span className="material-icons text-base">photo_camera</span>
                    Eigenes Foto hochladen
                  </button>
                )}
              </div>

              {/* Model Hint */}
              <p className={`text-xs ${textS}`}>
                {useSeedance || devicePhoto
                  ? '📸 Mit Fotos — deine Bilder erscheinen im Video'
                  : '🎬 Ohne Fotos — reines KI-Video'}
              </p>

              {showRefPicker && (
                <div className="mt-3">
                  <ReferenceLibrary
                    selectionMode
                    isLight={isLight}
                    onSelectionChange={setSelectedRefs}
                    onClose={() => setShowRefPicker(false)}
                  />
                </div>
              )}
            </div>

            {/* Style + Duration + Format */}
            <div className={`rounded-2xl border p-4 ${cardBg}`}>
              {/* Style Picker */}
              <label className={`text-sm font-semibold mb-2 block ${accent}`}>{t.style_label}</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {VIDEO_STYLE_IDS.map(s => {
                  const styleDisabled = hasPhoto && !I2V_SUPPORTED_STYLES.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => !styleDisabled && setSelectedStyle(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-sm flex items-center gap-1 transition-all ${
                        styleDisabled
                          ? 'opacity-30 cursor-not-allowed bg-gray-500/10 text-gray-500'
                          : selectedStyle === s.id
                            ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md'
                            : isLight ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <span>{s.icon}</span> {t[s.key]}
                      {hasPhoto && !styleDisabled && <span className="text-[10px]">📸</span>}
                    </button>
                  );
                })}
              </div>
              {hasPhoto && (
                <p className={`text-xs mb-3 ${isLight ? 'text-green-600' : 'text-green-400'}`}>
                  📸 Stile mit Foto-Support sind markiert
                </p>
              )}

              {/* Tier Toggle mit Dual-Preisen */}
              <label className={`text-sm font-semibold mb-2 block ${accent}`}>{t.quality_label}</label>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSelectedTier('standard')}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold flex flex-col items-center gap-0.5 transition-all ${
                    selectedTier === 'standard'
                      ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md'
                      : isLight ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-white/60'
                  }`}
                >
                  <span>{'\u26A1'} Standard</span>
                  <span className="text-[11px] font-bold opacity-80">
                    {standardPrice ? `${standardPrice.coins} Coins` : '...'}
                  </span>
                </button>
                <button
                  onClick={() => setSelectedTier('vip')}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold flex flex-col items-center gap-0.5 transition-all ${
                    selectedTier === 'vip'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : isLight ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-white/60'
                  }`}
                >
                  <span>{'\uD83D\uDC51'} VIP</span>
                  <span className="text-[11px] font-bold opacity-80">
                    {vipPrice ? `${vipPrice.coins} Coins` : '...'}
                  </span>
                </button>
              </div>

              {/* Duration + Format */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className={`text-xs font-semibold mb-1 block ${textS}`}>{t.duration_label}</label>
                  <div className="flex gap-2">
                    {([5, 10, 15] as VideoDuration[]).map(d => {
                      const disabled = d > maxDurationForMode;
                      return (
                        <button
                          key={d}
                          onClick={() => !disabled && setDuration(d)}
                          className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                            disabled
                              ? 'opacity-30 cursor-not-allowed bg-gray-500/10 text-gray-500'
                              : duration === d
                                ? 'bg-fuchsia-600 text-white'
                                : isLight ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-white/60'
                          }`}
                        >
                          {d}s
                        </button>
                      );
                    })}
                  </div>
                  {durationWarning && (
                    <p className={`text-xs mt-1 ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
                      {'\u26A0\uFE0F'} Dieses Modell unterstuetzt max {activePrice?.maxDuration}s
                    </p>
                  )}
                  <p
                    className={`text-xs mt-2 cursor-pointer hover:underline ${textS}`}
                    onClick={() => setUiTab('slideshow')}
                  >
                    {'\uD83D\uDCA1'} {t.longer_videos_hint}
                  </p>
                </div>

                {/* Format */}
                <div>
                  <label className={`text-xs font-semibold mb-1 block ${textS}`}>{t.format_label}</label>
                  <div className="flex gap-2">
                    {([['16:9', t.format_landscape], ['9:16', t.format_portrait]] as [string, string][]).map(([ar, label]) => (
                      <button
                        key={ar}
                        onClick={() => setAspectRatio(ar as '16:9' | '9:16')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          aspectRatio === ar
                            ? 'bg-fuchsia-600 text-white'
                            : isLight ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-white/60'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modell + Preis Info */}
              <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${isLight ? 'bg-indigo-50' : 'bg-white/5'}`}>
                <span className={`text-xs ${textS}`}>{tierLabel}</span>
                <span className={`text-base font-bold ${accent}`}>
                  {activePrice ? `${activePrice.coins} Coins` : '...'}
                </span>
              </div>
            </div>

            {/* ── Audio Controls: Eigene Stimme + Hintergrundmusik ── */}
            <div className={`rounded-2xl border p-4 ${cardBg}`}>
              <label className={`text-sm font-semibold mb-3 block ${accent}`}>{t.audio_label}</label>

              {/* Eigene Stimme Toggle */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-icons text-base" style={{ color: useOwnVoice ? '#a855f7' : undefined }}>mic</span>
                  <span className={`text-sm ${textP}`}>{t.own_voice}</span>
                  {voiceBlob && <span className={`text-[10px] px-2 py-0.5 rounded-full ${isLight ? 'bg-green-100 text-green-700' : 'bg-green-900/30 text-green-400'}`}>{t.recording_available}</span>}
                </div>
                <button
                  onClick={() => setUseOwnVoice(!useOwnVoice)}
                  className={`w-12 h-7 rounded-full transition-all relative ${useOwnVoice ? 'bg-fuchsia-600' : isLight ? 'bg-gray-300' : 'bg-white/20'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${useOwnVoice ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              {useOwnVoice && !voiceBlob && (
                <p className={`text-xs mb-3 ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
                  {t.record_hint}
                </p>
              )}
              {useOwnVoice && voiceBlob && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs ${textS}`}>{t.voice_volume}</span>
                    <span className={`text-xs font-semibold ${accent}`}>{voiceVolume}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={voiceVolume} onChange={(e) => setVoiceVolume(Number(e.target.value))}
                    className={`w-full h-2 rounded-full cursor-pointer ${isLight ? 'accent-indigo-500' : 'accent-fuchsia-500'}`} style={{ minHeight: '20px' }} />
                </div>
              )}

              {/* Hintergrundmusik */}
              <div className={`border-t pt-3 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-icons text-base" style={{ color: selectedBgm ? '#f59e0b' : undefined }}>music_note</span>
                  <span className={`text-sm ${textP}`}>{t.bgm_label}</span>
                </div>
                <select
                  value={selectedBgm || ''}
                  onChange={(e) => {
                    setSelectedBgm(e.target.value || null);
                    bgmPreviewAudio?.pause();
                    setBgmPreviewAudio(null);
                  }}
                  className={`w-full rounded-xl border p-2.5 text-sm mb-2 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  <option value="">{t.no_music}</option>
                  {BGM_TRACK_IDS.map(bgm => (
                    <option key={bgm.id} value={bgm.id}>{t[bgm.nameKey]} ({t[bgm.moodKey]})</option>
                  ))}
                </select>
                {selectedBgm && (
                  <>
                    <button
                      onClick={() => {
                        if (bgmPreviewAudio) { bgmPreviewAudio.pause(); setBgmPreviewAudio(null); return; }
                        const a = new Audio(`/app/audio/bgm/${selectedBgm}.mp3`);
                        a.volume = bgmVolume / 100;
                        a.loop = true;
                        a.play().catch(() => {});
                        setBgmPreviewAudio(a);
                      }}
                      className={`flex items-center gap-1 text-sm mb-2 ${accent} hover:underline`}
                    >
                      <span className="material-icons text-base">{bgmPreviewAudio ? 'pause' : 'play_arrow'}</span>
                      {bgmPreviewAudio ? t.stop : t.preview}
                    </button>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${textS}`}>{t.music_volume}</span>
                      <span className={`text-xs font-semibold ${accent}`}>{bgmVolume}%</span>
                    </div>
                    <input type="range" min={0} max={100} value={bgmVolume} onChange={(e) => {
                      setBgmVolume(Number(e.target.value));
                      if (bgmPreviewAudio) bgmPreviewAudio.volume = Number(e.target.value) / 100;
                    }}
                      className={`w-full h-2 rounded-full cursor-pointer accent-amber-500`} style={{ minHeight: '20px' }} />
                  </>
                )}
              </div>

              {/* MP3 Upload: Eigene Musik hochladen */}
              <div className={`border-t pt-3 mt-3 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-icons text-base" style={{ color: userMusicFile ? '#10b981' : undefined }}>upload_file</span>
                  <span className={`text-sm ${textP}`}>{t.own_music}</span>
                </div>
                <input ref={musicFileRef} type="file" accept="audio/mpeg,audio/mp3,.mp3" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setUserMusicFile(f);
                      if (userMusicUrl) URL.revokeObjectURL(userMusicUrl);
                      setUserMusicUrl(URL.createObjectURL(f));
                    }
                    e.target.value = '';
                  }}
                />
                <button
                  onClick={() => musicFileRef.current?.click()}
                  className={`w-full rounded-xl border-2 border-dashed p-3 text-center text-sm transition-colors mb-2 ${
                    userMusicFile
                      ? (isLight ? 'border-green-300 bg-green-50 text-green-700' : 'border-green-500/30 bg-green-500/10 text-green-400')
                      : (isLight ? 'border-gray-300 text-gray-400' : 'border-white/20 text-white/40')
                  }`}
                >
                  {userMusicFile ? `${userMusicFile.name}` : t.upload_mp3}
                </button>
                {userMusicUrl && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (isPreviewing && previewAudioRef.current) {
                          previewAudioRef.current.pause();
                          setIsPreviewing(false);
                        } else {
                          const a = new Audio(userMusicUrl);
                          a.volume = bgmVolume / 100;
                          a.loop = musicLoop;
                          a.onended = () => setIsPreviewing(false);
                          previewAudioRef.current = a;
                          a.play().catch(() => {});
                          setIsPreviewing(true);
                        }
                      }}
                      className={`flex items-center gap-1 text-sm ${accent} hover:underline`}
                    >
                      <span className="material-icons text-base">{isPreviewing ? 'pause' : 'play_arrow'}</span>
                      {isPreviewing ? t.stop : t.listen}
                    </button>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={musicLoop} onChange={(e) => setMusicLoop(e.target.checked)}
                        className="accent-fuchsia-500" />
                      <span className={`text-xs ${textS}`}>Loop</span>
                    </label>
                    <button onClick={() => { setUserMusicFile(null); if (userMusicUrl) URL.revokeObjectURL(userMusicUrl); setUserMusicUrl(null); }}
                      className="text-red-400 text-xs hover:underline ml-auto">{t.remove}</button>
                  </div>
                )}
              </div>
            </div>

            {/* Geschaetzte Dauer */}
            <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${isLight ? 'bg-indigo-50' : 'bg-white/5'}`}>
              <div className="flex items-center gap-2">
                <span className={`material-icons text-base ${accent}`}>schedule</span>
                <span className={`text-sm ${textS}`}>{t.estimated_duration}</span>
              </div>
              <span className={`text-sm font-bold ${accent}`}>~{estimatedSeconds}s</span>
            </div>

            {/* Persistent user_notice */}
            {userNotice && (
              <div className={`flex items-start gap-2 rounded-xl p-3 border ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-900/20 border-amber-500/30'}`}>
                <span className={`material-icons text-sm mt-0.5 flex-shrink-0 ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>info</span>
                <span className={`text-xs leading-relaxed flex-1 ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>{userNotice}</span>
                <button onClick={() => setUserNotice(null)} className={`flex-shrink-0 ${isLight ? 'text-amber-400 hover:text-amber-600' : 'text-amber-600 hover:text-amber-400'}`}>
                  <span className="material-icons text-sm">close</span>
                </button>
              </div>
            )}

            {/* Error */}
            {genError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-red-400 text-sm">{genError}</p>
              </div>
            )}

            {/* Generate + Abbrechen Buttons */}
            {isGenerating ? (
              <div className="space-y-2">
                <div className="w-full py-4 rounded-2xl bg-gray-500/20 text-center">
                  <span className="material-icons animate-spin text-xl text-fuchsia-400 align-middle mr-2">hourglass_top</span>
                  <span className={`text-sm font-medium ${textP}`}>{genProgress || t.generating}</span>
                </div>
                <button
                  onClick={handleCancel}
                  className={`w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                    isLight ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <span className="material-icons text-base">cancel</span>
                  {t.cancel}
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className={`w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 transition-all ${
                  !prompt.trim()
                    ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg hover:scale-[1.02]'
                }`}
              >
                <span className="material-icons text-xl">movie_creation</span>
                Video generieren (~{estimatedSeconds}s) — {tierLabel}
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Config-Chat Assistent (Bubble) ── */}
      {!chatOpen ? (
        <button
          onClick={() => { setChatOpen(true); if (chatMessages.length === 0) setChatMessages([{ role: 'assistant', content: t.chat_greeting }]); }}
          className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-[60]"
        >
          <span className="material-icons text-2xl">smart_toy</span>
        </button>
      ) : (
        <div className={`fixed bottom-16 right-2 left-2 sm:left-auto sm:w-96 max-h-[70vh] rounded-2xl shadow-2xl flex flex-col z-[60] ${isLight ? 'bg-white border border-gray-200' : 'bg-dream-surface border border-white/10'}`}>
          {/* Chat Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
            <div className="flex items-center gap-2">
              <span className="material-icons text-fuchsia-500">smart_toy</span>
              <span className={`text-sm font-semibold ${textP}`}>{t.chat_title}</span>
            </div>
            <button onClick={() => setChatOpen(false)} className={`w-8 h-8 rounded-full flex items-center justify-center ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
              <span className="material-icons text-sm">close</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-[50vh]">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white'
                    : isLight ? 'bg-gray-100 text-gray-800' : 'bg-white/5 text-white/90'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className={`rounded-2xl px-3 py-2 text-sm ${isLight ? 'bg-gray-100' : 'bg-white/5'}`}>
                  <span className="material-icons animate-spin text-sm align-middle mr-1">refresh</span>
                  {t.chat_thinking}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className={`px-3 py-2 border-t ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder={t.chat_placeholder}
                className={`flex-1 rounded-xl px-3 py-2 text-sm border ${
                  isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'
                }`}
              />
              <button
                onClick={sendChatMessage}
                disabled={chatLoading || !chatInput.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white flex items-center justify-center disabled:opacity-30"
              >
                <span className="material-icons text-sm">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoStudio;
