import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Language, ThemeMode } from '../types';
import { VOICE_CHARACTERS, VoiceCharacter } from './VoiceSelector';

type VoiceMode = 'user_voice' | 'ai_voice';
export type ContentMode = 'dream_only' | 'interpretation' | 'both';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VideoGenerateOptions {
    tab: Tab;
    quality: Quality;
    voiceMode: VoiceMode;
    contentMode: ContentMode;
    voiceId: string;
    voiceBlob: Blob | null;
    style?: 'dreamlike' | 'cinematic' | 'surreal' | 'fantasy' | 'cartoon' | 'anime' | 'real' | 'watercolor';
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

type Tab = 'ai' | 'slideshow';
type Quality = 'standard' | 'hd';

// ---------------------------------------------------------------------------
// Pricing constants
// ---------------------------------------------------------------------------

const PRICE = {
    ai: { standard: 180, hd: 280 },
    slideshow: { standard: 5, hd: 8 }, // cost per image
} as const;

const SLIDESHOW_DURATION_SECONDS = 30;

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

interface Translations {
    title: string;
    tab_ai: string;
    tab_slideshow: string;
    quality_label: string;
    standard: string;
    hd: string;
    interval_label: string;
    images_count: string;
    estimated_cost: string;
    audio_title: string;
    record_voice: string;
    upload_mp3: string;
    voice_volume: string;
    music_volume: string;
    voice_mode_own: string;
    voice_mode_ai: string;
    voice_select_label: string;
    fade_option: string;
    loop_option: string;
    price_label: string;
    balance_label: string;
    generate_btn: string;
    insufficient_funds: string;
    recording: string;
    stop_recording: string;
    mp3_loaded: string;
    back_btn: string;
    dream_text_label: string;
    settings_title: string;
    slideshow_only: string;
    generating: string;
    seconds_unit: string;
    content_label: string;
    content_dream: string;
    content_interp: string;
    content_both: string;
    est_duration: string;
    need_recording: string;
    minutes_unit: string;
}

const T: Partial<Record<Language, Translations>> = {
    [Language.DE]: {
        title: 'VIDEO STUDIO',
        tab_ai: 'KI-Video',
        tab_slideshow: 'Slideshow',
        quality_label: 'Qualität',
        standard: 'Standard',
        hd: 'HD',
        interval_label: 'Bildintervall',
        images_count: 'Bilder',
        estimated_cost: 'Geschätzte Kosten',
        audio_title: 'Audio',
        record_voice: 'Eigene Stimme aufnehmen',
        upload_mp3: 'MP3 hochladen',
        voice_volume: 'Stimme',
        music_volume: 'Musik',
        voice_mode_own: 'Eigene Stimme',
        voice_mode_ai: 'KI-Stimme',
        voice_select_label: 'Stimme wählen',
        fade_option: 'Fade-In / Fade-Out',
        loop_option: 'Musik loopen',
        price_label: 'Preis',
        balance_label: 'Dein Guthaben',
        generate_btn: 'Generieren',
        insufficient_funds: 'Nicht genug Coins',
        recording: 'Aufnahme läuft…',
        stop_recording: 'Aufnahme stoppen',
        mp3_loaded: 'MP3 geladen',
        back_btn: 'Zurück',
        dream_text_label: 'Traumtext',
        settings_title: 'Einstellungen',
        slideshow_only: 'Nur bei Slideshow',
        generating: 'Wird generiert…',
        seconds_unit: 's',
        content_label: 'Inhalt',
        content_dream: 'Nur Erzählung',
        content_interp: 'Nur Deutung',
        content_both: 'Beides',
        est_duration: 'Geschätzte Dauer',
        need_recording: 'Bitte zuerst aufnehmen',
        minutes_unit: 'Min.',
    },
    [Language.EN]: {
        title: 'VIDEO STUDIO',
        tab_ai: 'AI Video',
        tab_slideshow: 'Slideshow',
        quality_label: 'Quality',
        standard: 'Standard',
        hd: 'HD',
        interval_label: 'Image interval',
        images_count: 'Images',
        estimated_cost: 'Estimated cost',
        audio_title: 'Audio',
        record_voice: 'Record your voice',
        upload_mp3: 'Upload MP3',
        voice_volume: 'Voice',
        music_volume: 'Music',
        voice_mode_own: 'Own voice',
        voice_mode_ai: 'AI voice',
        voice_select_label: 'Select voice',
        fade_option: 'Fade-In / Fade-Out',
        loop_option: 'Loop music',
        price_label: 'Price',
        balance_label: 'Your balance',
        generate_btn: 'Generate',
        insufficient_funds: 'Not enough coins',
        recording: 'Recording…',
        stop_recording: 'Stop recording',
        mp3_loaded: 'MP3 loaded',
        back_btn: 'Back',
        dream_text_label: 'Dream text',
        settings_title: 'Settings',
        slideshow_only: 'Slideshow only',
        generating: 'Generating…',
        seconds_unit: 's',
        content_label: 'Content',
        content_dream: 'Narration only',
        content_interp: 'Interpretation only',
        content_both: 'Both',
        est_duration: 'Estimated duration',
        need_recording: 'Please record first',
        minutes_unit: 'min',
    },
    [Language.TR]: {
        title: 'VIDEO STUDYO',
        tab_ai: 'Yapay Zeka',
        tab_slideshow: 'Slayt Gösterisi',
        quality_label: 'Kalite',
        standard: 'Standart',
        hd: 'HD',
        interval_label: 'Görüntü aralığı',
        images_count: 'Görüntü',
        estimated_cost: 'Tahmini maliyet',
        audio_title: 'Ses',
        record_voice: 'Kendi sesini kaydet',
        upload_mp3: 'MP3 yükle',
        voice_volume: 'Ses',
        music_volume: 'Müzik',
        voice_mode_own: 'Kendi sesin',
        voice_mode_ai: 'Yapay zeka sesi',
        voice_select_label: 'Ses seç',
        fade_option: 'Geçiş efekti',
        loop_option: 'Müziği döngüle',
        price_label: 'Fiyat',
        balance_label: 'Bakiyen',
        generate_btn: 'Oluştur',
        insufficient_funds: 'Yeterli coin yok',
        recording: 'Kayıt devam ediyor…',
        stop_recording: 'Kaydı durdur',
        mp3_loaded: 'MP3 yüklendi',
        back_btn: 'Geri',
        dream_text_label: 'Rüya metni',
        settings_title: 'Ayarlar',
        slideshow_only: 'Sadece slayt gösterisi',
        generating: 'Oluşturuluyor…',
        seconds_unit: 's',
        content_label: 'İçerik',
        content_dream: 'Sadece anlatım',
        content_interp: 'Sadece yorum',
        content_both: 'İkisi de',
        est_duration: 'Tahmini süre',
        need_recording: 'Lütfen önce kayıt yapın',
        minutes_unit: 'dk',
    },
    [Language.ES]: {
        title: 'ESTUDIO VIDEO',
        tab_ai: 'Video IA',
        tab_slideshow: 'Diapositivas',
        quality_label: 'Calidad',
        standard: 'Estándar',
        hd: 'HD',
        interval_label: 'Intervalo de imagen',
        images_count: 'Imágenes',
        estimated_cost: 'Coste estimado',
        audio_title: 'Audio',
        record_voice: 'Grabar voz',
        upload_mp3: 'Subir MP3',
        voice_volume: 'Voz',
        music_volume: 'Música',
        voice_mode_own: 'Tu voz',
        voice_mode_ai: 'Voz IA',
        voice_select_label: 'Elegir voz',
        fade_option: 'Fade-In / Fade-Out',
        loop_option: 'Repetir música',
        price_label: 'Precio',
        balance_label: 'Tu saldo',
        generate_btn: 'Generar',
        insufficient_funds: 'Monedas insuficientes',
        recording: 'Grabando…',
        stop_recording: 'Detener grabación',
        mp3_loaded: 'MP3 cargado',
        back_btn: 'Volver',
        dream_text_label: 'Texto del sueño',
        settings_title: 'Configuración',
        slideshow_only: 'Solo diapositivas',
        generating: 'Generando…',
        seconds_unit: 's',
        content_label: 'Contenido',
        content_dream: 'Solo narración',
        content_interp: 'Solo interpretación',
        content_both: 'Ambos',
        est_duration: 'Duración estimada',
        need_recording: 'Primero graba tu voz',
        minutes_unit: 'min',
    },
    [Language.FR]: {
        title: 'STUDIO VIDEO',
        tab_ai: 'Vidéo IA',
        tab_slideshow: 'Diaporama',
        quality_label: 'Qualité',
        standard: 'Standard',
        hd: 'HD',
        interval_label: 'Intervalle image',
        images_count: 'Images',
        estimated_cost: 'Coût estimé',
        audio_title: 'Audio',
        record_voice: 'Enregistrer voix',
        upload_mp3: 'Importer MP3',
        voice_volume: 'Voix',
        music_volume: 'Musique',
        voice_mode_own: 'Votre voix',
        voice_mode_ai: 'Voix IA',
        voice_select_label: 'Choisir une voix',
        fade_option: 'Fondu entrant/sortant',
        loop_option: 'Boucler la musique',
        price_label: 'Prix',
        balance_label: 'Votre solde',
        generate_btn: 'Générer',
        insufficient_funds: 'Coins insuffisants',
        recording: 'Enregistrement…',
        stop_recording: 'Arrêter',
        mp3_loaded: 'MP3 chargé',
        back_btn: 'Retour',
        dream_text_label: 'Texte du rêve',
        settings_title: 'Paramètres',
        slideshow_only: 'Diaporama uniquement',
        generating: 'Génération…',
        seconds_unit: 's',
        content_label: 'Contenu',
        content_dream: 'Narration seule',
        content_interp: 'Interprétation seule',
        content_both: 'Les deux',
        est_duration: 'Durée estimée',
        need_recording: 'Veuillez enregistrer d\'abord',
        minutes_unit: 'min',
    },
    [Language.AR]: {
        title: 'استوديو الفيديو',
        tab_ai: 'فيديو ذكاء',
        tab_slideshow: 'عرض شرائح',
        quality_label: 'الجودة',
        standard: 'عادي',
        hd: 'عالي الدقة',
        interval_label: 'فاصل الصورة',
        images_count: 'صور',
        estimated_cost: 'التكلفة المتوقعة',
        audio_title: 'الصوت',
        record_voice: 'تسجيل الصوت',
        upload_mp3: 'رفع MP3',
        voice_volume: 'الصوت',
        music_volume: 'الموسيقى',
        voice_mode_own: 'صوتك',
        voice_mode_ai: 'صوت ذكاء اصطناعي',
        voice_select_label: 'اختر صوت',
        fade_option: 'تلاشي الدخول / الخروج',
        loop_option: 'تكرار الموسيقى',
        price_label: 'السعر',
        balance_label: 'رصيدك',
        generate_btn: 'إنشاء',
        insufficient_funds: 'رصيد غير كافٍ',
        recording: 'جاري التسجيل…',
        stop_recording: 'إيقاف التسجيل',
        mp3_loaded: 'تم تحميل MP3',
        back_btn: 'رجوع',
        dream_text_label: 'نص الحلم',
        settings_title: 'الإعدادات',
        slideshow_only: 'عرض الشرائح فقط',
        generating: 'جاري الإنشاء…',
        seconds_unit: 'ث',
        content_label: 'المحتوى',
        content_dream: 'السرد فقط',
        content_interp: 'التفسير فقط',
        content_both: 'كلاهما',
        est_duration: 'المدة المقدرة',
        need_recording: 'يرجى التسجيل أولاً',
        minutes_unit: 'د',
    },
    [Language.PT]: {
        title: 'ESTÚDIO DE VÍDEO',
        tab_ai: 'Vídeo IA',
        tab_slideshow: 'Apresentação',
        quality_label: 'Qualidade',
        standard: 'Padrão',
        hd: 'HD',
        interval_label: 'Intervalo de imagem',
        images_count: 'Imagens',
        estimated_cost: 'Custo estimado',
        audio_title: 'Áudio',
        record_voice: 'Gravar voz',
        upload_mp3: 'Enviar MP3',
        voice_volume: 'Voz',
        music_volume: 'Música',
        voice_mode_own: 'Sua voz',
        voice_mode_ai: 'Voz IA',
        voice_select_label: 'Escolher voz',
        fade_option: 'Fade-In / Fade-Out',
        loop_option: 'Loop de música',
        price_label: 'Preço',
        balance_label: 'Seu saldo',
        generate_btn: 'Gerar',
        insufficient_funds: 'Coins insuficientes',
        recording: 'Gravando…',
        stop_recording: 'Parar gravação',
        mp3_loaded: 'MP3 carregado',
        back_btn: 'Voltar',
        dream_text_label: 'Texto do sonho',
        settings_title: 'Configurações',
        slideshow_only: 'Apenas apresentação',
        generating: 'Gerando…',
        seconds_unit: 's',
        content_label: 'Conteúdo',
        content_dream: 'Apenas narração',
        content_interp: 'Apenas interpretação',
        content_both: 'Ambos',
        est_duration: 'Duração estimada',
        need_recording: 'Grave primeiro',
        minutes_unit: 'min',
    },
    [Language.RU]: {
        title: 'ВИДЕО СТУДИЯ',
        tab_ai: 'ИИ-Видео',
        tab_slideshow: 'Слайдшоу',
        quality_label: 'Качество',
        standard: 'Стандарт',
        hd: 'HD',
        interval_label: 'Интервал кадра',
        images_count: 'Изображений',
        estimated_cost: 'Примерная стоимость',
        audio_title: 'Аудио',
        record_voice: 'Записать голос',
        voice_mode_own: 'Свой голос',
        voice_mode_ai: 'ИИ-голос',
        voice_select_label: 'Выбрать голос',
        upload_mp3: 'Загрузить MP3',
        voice_volume: 'Голос',
        music_volume: 'Музыка',
        fade_option: 'Плавное появление/исчезновение',
        loop_option: 'Повторять музыку',
        price_label: 'Цена',
        balance_label: 'Ваш баланс',
        generate_btn: 'Создать',
        insufficient_funds: 'Недостаточно монет',
        recording: 'Запись…',
        stop_recording: 'Остановить',
        mp3_loaded: 'MP3 загружен',
        back_btn: 'Назад',
        dream_text_label: 'Текст сна',
        settings_title: 'Настройки',
        slideshow_only: 'Только слайдшоу',
        generating: 'Создание…',
        seconds_unit: 'с',
        content_label: 'Содержание',
        content_dream: 'Только рассказ',
        content_interp: 'Только толкование',
        content_both: 'Оба',
        est_duration: 'Примерная длительность',
        need_recording: 'Сначала запишите голос',
        minutes_unit: 'мин',
    },
};

function getT(lang: Language): Translations {
    return T[lang] ?? T[Language.EN]!;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface RangeSliderProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (v: number) => void;
    label: string;
    icon: string;
    isLight: boolean;
    unit?: string;
    showValue?: boolean;
    accentClass?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
    value,
    min,
    max,
    step = 1,
    onChange,
    label,
    icon,
    isLight,
    unit = '%',
    showValue = true,
    accentClass = 'accent-fuchsia-500',
}) => (
    <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className={`material-icons text-base ${isLight ? 'text-indigo-500' : 'text-fuchsia-400'}`}>
                    {icon}
                </span>
                <span className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-white/80'}`}>
                    {label}
                </span>
            </div>
            {showValue && (
                <span className={`text-sm font-semibold tabular-nums ${isLight ? 'text-indigo-600' : 'text-fuchsia-300'}`}>
                    {value}{unit}
                </span>
            )}
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`w-full h-2 rounded-full cursor-pointer ${accentClass}`}
            style={{ minHeight: '20px' }}
        />
        <div className={`flex justify-between text-[10px] ${isLight ? 'text-gray-400' : 'text-white/30'}`}>
            <span>{min}{unit}</span>
            <span>{max}{unit}</span>
        </div>
    </div>
);

interface CheckboxRowProps {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    isLight: boolean;
}

const CheckboxRow: React.FC<CheckboxRowProps> = ({ checked, onChange, label, isLight }) => (
    <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
        <div
            onClick={() => onChange(!checked)}
            className={`
                w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150
                ${checked
                    ? (isLight ? 'bg-indigo-500' : 'bg-fuchsia-600')
                    : (isLight ? 'bg-gray-200 border border-gray-300' : 'bg-white/10 border border-white/20')
                }
            `}
        >
            {checked && (
                <span className="material-icons text-white text-sm" style={{ fontSize: '14px' }}>check</span>
            )}
        </div>
        <span className={`text-sm ${isLight ? 'text-gray-700' : 'text-white/80'}`}>{label}</span>
    </label>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const VideoStudio: React.FC<VideoStudioProps> = ({
    language,
    themeMode,
    dreamText,
    onClose,
    onSave,
    onGenerate,
    userCredits,
}) => {
    const t = getT(language);
    const isLight = themeMode === ThemeMode.LIGHT;
    const isRtl = language === Language.AR;

    // --- Tab & quality ---
    const [activeTab, setActiveTab] = useState<Tab>('slideshow');
    const [quality, setQuality] = useState<Quality>('standard');

    // --- Slideshow settings ---
    const [imageInterval, setImageInterval] = useState<number>(3);

    // --- Content & Voice mode ---
    const [contentMode, setContentMode] = useState<ContentMode>('dream_only');
    const [voiceMode, setVoiceMode] = useState<VoiceMode>('user_voice');
    const [selectedAiVoice, setSelectedAiVoice] = useState<string>('luna');

    // --- Audio ---
    const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
    const [musicFile, setMusicFile] = useState<File | null>(null);
    const [voiceVolume, setVoiceVolume] = useState<number>(80);
    const [musicVolume, setMusicVolume] = useState<number>(40);
    const [fadeEnabled, setFadeEnabled] = useState<boolean>(false);
    const [loopEnabled, setLoopEnabled] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
    const [isPreviewingMusic, setIsPreviewingMusic] = useState(false);
    const previewVoiceRef = useRef<HTMLAudioElement | null>(null);
    const previewMusicRef = useRef<HTMLAudioElement | null>(null);

    // --- Generation state ---
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    // --- MediaRecorder refs ---
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // --- Preview Functions ---
    const toggleVoicePreview = useCallback(() => {
        if (!voiceBlob) return;
        if (isPreviewingVoice && previewVoiceRef.current) {
            previewVoiceRef.current.pause();
            setIsPreviewingVoice(false);
        } else {
            const url = URL.createObjectURL(voiceBlob);
            const audio = new Audio(url);
            audio.volume = voiceVolume / 100;
            previewVoiceRef.current = audio;
            audio.onended = () => { setIsPreviewingVoice(false); URL.revokeObjectURL(url); };
            audio.play().catch(() => {});
            setIsPreviewingVoice(true);
        }
    }, [voiceBlob, voiceVolume, isPreviewingVoice]);

    const toggleMusicPreview = useCallback(() => {
        if (!musicFile) return;
        if (isPreviewingMusic && previewMusicRef.current) {
            previewMusicRef.current.pause();
            setIsPreviewingMusic(false);
        } else {
            const url = URL.createObjectURL(musicFile);
            const audio = new Audio(url);
            audio.volume = musicVolume / 100;
            previewMusicRef.current = audio;
            audio.onended = () => { setIsPreviewingMusic(false); URL.revokeObjectURL(url); };
            audio.play().catch(() => {});
            setIsPreviewingMusic(true);
        }
    }, [musicFile, musicVolume, isPreviewingMusic]);

    // Update preview volume in real-time
    useEffect(() => {
        if (previewVoiceRef.current) previewVoiceRef.current.volume = voiceVolume / 100;
    }, [voiceVolume]);
    useEffect(() => {
        if (previewMusicRef.current) previewMusicRef.current.volume = musicVolume / 100;
    }, [musicVolume]);

    // --- Derived values ---
    const imageCount = Math.ceil(SLIDESHOW_DURATION_SECONDS / imageInterval);
    const costPerImage = PRICE.slideshow[quality];
    const slideshowPrice = imageCount * costPerImage;
    const aiPrice = PRICE.ai[quality];
    const totalPrice = activeTab === 'ai' ? aiPrice : slideshowPrice;
    const canAfford = userCredits >= totalPrice;

    // Voice mode forced to AI for interpretation-only or both
    const effectiveVoiceMode: VoiceMode = contentMode === 'dream_only' ? voiceMode : 'ai_voice';
    // User voice requires recording
    const needsRecording = effectiveVoiceMode === 'user_voice' && !voiceBlob;

    // Duration estimation (words / 2.5 = seconds)
    const dreamWords = dreamText.trim().split(/\s+/).filter(Boolean).length;
    const estimatedSeconds = (() => {
        const dreamDur = dreamWords / 2.5;
        const interpDur = dreamWords * 1.5 / 2.5; // interpretation is ~1.5x longer
        if (contentMode === 'dream_only') return dreamDur;
        if (contentMode === 'interpretation') return interpDur;
        return dreamDur + interpDur; // both
    })();
    const estimatedMinutes = Math.max(0.5, Math.round(estimatedSeconds / 30) / 2); // round to 0.5

    // Cleanup stream on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    // --- Recording ---
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            recordedChunksRef.current = [];

            const recorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm',
            });

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
                setVoiceBlob(blob);
                stream.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
        } catch (e) {
            console.error('[VideoStudio] Mikrofon-Zugriff verweigert:', e);
            setIsRecording(false);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const handleMp3Upload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && (file.type === 'audio/mpeg' || file.name.endsWith('.mp3'))) {
            setMusicFile(file);
        }
        // Reset input so same file can be re-selected
        e.target.value = '';
    }, []);

    // --- Generate ---
    const handleGenerate = useCallback(async () => {
        if (!canAfford || isGenerating || needsRecording) return;
        setIsGenerating(true);

        try {
            if (onGenerate) {
                const videoUrl = await onGenerate(dreamText, {
                    tab: activeTab,
                    quality,
                    voiceMode: effectiveVoiceMode,
                    contentMode,
                    voiceId: selectedAiVoice,
                    voiceBlob,
                });
                if (videoUrl) {
                    onSave({ videoUrl, type: activeTab === 'ai' ? 'ai' : 'slideshow' });
                }
            } else {
                const placeholderUrl = `dream-${activeTab}-${quality}-${Date.now()}.mp4`;
                onSave({ videoUrl: placeholderUrl, type: activeTab === 'ai' ? 'ai' : 'slideshow' });
            }
        } catch (e) {
            console.error('[VideoStudio] Generation failed', e);
        } finally {
            setIsGenerating(false);
        }
    }, [canAfford, isGenerating, needsRecording, activeTab, quality, effectiveVoiceMode, contentMode, selectedAiVoice, voiceBlob, dreamText, onSave, onGenerate]);

    // ---------------------------------------------------------------------------
    // Style helpers
    // ---------------------------------------------------------------------------

    const bg = isLight ? 'bg-mystic-bg' : 'bg-dream-surface';
    const headerBg = isLight ? 'bg-mystic-bg/95 border-b border-indigo-100' : 'bg-dream-surface/95 border-b border-white/10';
    const cardBg = isLight ? 'bg-white border border-indigo-100/80 shadow-sm' : 'bg-white/5 border border-white/10';
    const textPrimary = isLight ? 'text-gray-900' : 'text-white';
    const textSecondary = isLight ? 'text-gray-500' : 'text-white/50';
    const sectionLabel = isLight ? 'text-indigo-600' : 'text-fuchsia-400';
    const divider = isLight ? 'border-indigo-100' : 'border-white/10';

    const accentGradient = isLight
        ? 'bg-gradient-to-r from-indigo-500 to-violet-500'
        : 'bg-gradient-to-r from-fuchsia-600 to-violet-600';

    const tabActive = isLight
        ? 'bg-indigo-500 text-white shadow-md'
        : 'bg-fuchsia-600 text-white shadow-[0_0_16px_rgba(217,70,239,0.45)]';

    const tabInactive = isLight
        ? 'text-gray-500 hover:text-indigo-500'
        : 'text-white/40 hover:text-white/70';

    const qualityActive = isLight
        ? 'bg-indigo-500 text-white'
        : 'bg-fuchsia-600 text-white';

    const qualityInactive = isLight
        ? 'bg-gray-100 text-gray-500 hover:bg-indigo-50'
        : 'bg-white/10 text-white/50 hover:bg-white/15';

    const inputBase = isLight
        ? 'bg-gray-50 border border-gray-200 text-gray-900'
        : 'bg-white/5 border border-white/10 text-white';

    const generateDisabled = !canAfford || isGenerating || needsRecording;

    const generateBtn = generateDisabled
        ? (isLight ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-white/10 text-white/30 cursor-not-allowed')
        : `${accentGradient} text-white hover:opacity-90 active:scale-[0.98] shadow-[0_4px_24px_rgba(168,85,247,0.35)]`;

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col ${bg} overflow-hidden`}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            {/* ── Header ── */}
            <div className={`flex items-center gap-3 px-4 py-3 ${headerBg} flex-shrink-0`}>
                <button
                    onClick={onClose}
                    className={`
                        min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors
                        ${isLight ? 'hover:bg-indigo-50 text-indigo-600' : 'hover:bg-white/10 text-white/60'}
                    `}
                    aria-label={t.back_btn}
                >
                    <span className="material-icons">
                        {isRtl ? 'arrow_forward' : 'arrow_back'}
                    </span>
                </button>
                <h1 className={`text-sm font-bold tracking-widest uppercase flex-1 text-center ${sectionLabel}`}>
                    {t.title}
                </h1>
                {/* Spacer to balance header */}
                <div className="min-w-[44px]" />
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-8">

                    {/* ── Tab Toggle ── */}
                    <div className={`flex rounded-2xl p-1 ${isLight ? 'bg-gray-100' : 'bg-white/5'}`}>
                        {(['ai', 'slideshow'] as Tab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[44px]
                                    ${activeTab === tab ? tabActive : tabInactive}
                                `}
                            >
                                {tab === 'ai' ? t.tab_ai : t.tab_slideshow}
                            </button>
                        ))}
                    </div>

                    {/* ── Dream text ── */}
                    <div className={`rounded-2xl p-4 ${cardBg}`}>
                        <div className={`flex items-center gap-2 mb-2`}>
                            <span className={`material-icons text-base ${sectionLabel}`}>description</span>
                            <span className={`text-xs uppercase tracking-widest font-semibold ${sectionLabel}`}>
                                {t.dream_text_label}
                            </span>
                        </div>
                        <p className={`text-sm leading-relaxed line-clamp-4 ${textSecondary}`}>
                            {dreamText || '—'}
                        </p>
                    </div>

                    {/* ── Content Mode ── */}
                    <div className={`rounded-2xl p-4 space-y-3 ${cardBg}`}>
                        <div className="flex items-center gap-2">
                            <span className={`material-icons text-base ${sectionLabel}`}>auto_stories</span>
                            <span className={`text-xs uppercase tracking-widest font-semibold ${sectionLabel}`}>
                                {t.content_label}
                            </span>
                        </div>
                        <div className="flex gap-1.5">
                            {([
                                { key: 'dream_only' as ContentMode, label: t.content_dream },
                                { key: 'interpretation' as ContentMode, label: t.content_interp },
                                { key: 'both' as ContentMode, label: t.content_both },
                            ]).map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setContentMode(key)}
                                    className={`
                                        flex-1 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-all duration-150
                                        ${contentMode === key ? tabActive : tabInactive}
                                    `}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {/* Duration estimate */}
                        <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${
                            isLight ? 'bg-indigo-50' : 'bg-white/5'
                        }`}>
                            <div className="flex items-center gap-2">
                                <span className={`material-icons text-base ${sectionLabel}`}>schedule</span>
                                <span className={`text-sm ${textSecondary}`}>{t.est_duration}</span>
                            </div>
                            <span className={`text-sm font-bold tabular-nums ${isLight ? 'text-indigo-600' : 'text-fuchsia-300'}`}>
                                ~{estimatedMinutes} {t.minutes_unit}
                            </span>
                        </div>
                    </div>

                    {/* ── Settings ── */}
                    <div className={`rounded-2xl p-4 space-y-4 ${cardBg}`}>
                        <div className={`flex items-center gap-2`}>
                            <span className={`material-icons text-base ${sectionLabel}`}>tune</span>
                            <span className={`text-xs uppercase tracking-widest font-semibold ${sectionLabel}`}>
                                {t.settings_title}
                            </span>
                        </div>

                        {/* Quality toggle */}
                        <div className="space-y-2">
                            <span className={`text-sm font-medium ${textPrimary}`}>{t.quality_label}</span>
                            <div className="flex gap-2">
                                {(['standard', 'hd'] as Quality[]).map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => setQuality(q)}
                                        className={`
                                            flex-1 py-2.5 rounded-xl text-sm font-semibold min-h-[44px] transition-all duration-150
                                            ${quality === q ? qualityActive : qualityInactive}
                                        `}
                                    >
                                        {q === 'standard' ? t.standard : t.hd}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Slideshow-only: image interval */}
                        {activeTab === 'slideshow' && (
                            <>
                                <div className={`border-t ${divider} pt-4`}>
                                    <span className={`text-[10px] uppercase tracking-widest font-semibold ${sectionLabel} mb-3 block`}>
                                        {t.slideshow_only}
                                    </span>

                                    <RangeSlider
                                        value={imageInterval}
                                        min={1}
                                        max={30}
                                        step={1}
                                        onChange={setImageInterval}
                                        label={t.interval_label}
                                        icon="timer"
                                        isLight={isLight}
                                        unit={t.seconds_unit}
                                        accentClass={isLight ? 'accent-indigo-500' : 'accent-fuchsia-500'}
                                    />

                                    {/* Derived stats */}
                                    <div className={`
                                        mt-3 flex items-center justify-between rounded-xl px-4 py-2.5
                                        ${isLight ? 'bg-indigo-50' : 'bg-white/5'}
                                    `}>
                                        <span className={`text-sm ${textSecondary}`}>
                                            {imageCount} {t.images_count}
                                        </span>
                                        <span className={`text-sm font-semibold ${isLight ? 'text-indigo-600' : 'text-fuchsia-300'}`}>
                                            ~{slideshowPrice} Coins
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── Stimme ── */}
                    <div className={`rounded-2xl p-4 space-y-4 ${cardBg}`}>
                        <div className="flex items-center gap-2">
                            <span className={`material-icons text-base ${sectionLabel}`}>record_voice_over</span>
                            <span className={`text-xs uppercase tracking-widest font-semibold ${sectionLabel}`}>
                                {t.voice_select_label}
                            </span>
                        </div>

                        {/* Voice mode toggle — only for dream_only */}
                        {contentMode === 'dream_only' ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setVoiceMode('user_voice')}
                                className={`
                                    flex-1 py-3 rounded-xl text-sm font-semibold min-h-[44px] transition-all duration-150
                                    ${voiceMode === 'user_voice' ? qualityActive : qualityInactive}
                                `}
                            >
                                {t.voice_mode_own}
                            </button>
                            <button
                                onClick={() => setVoiceMode('ai_voice')}
                                className={`
                                    flex-1 py-3 rounded-xl text-sm font-semibold min-h-[44px] transition-all duration-150
                                    ${voiceMode === 'ai_voice' ? qualityActive : qualityInactive}
                                `}
                            >
                                {t.voice_mode_ai}
                            </button>
                        </div>

                        ) : (
                            <div className={`text-sm ${textSecondary}`}>
                                <span className="material-icons text-base align-middle mr-1">smart_toy</span>
                                {t.voice_mode_ai}
                            </div>
                        )}

                        {/* Own voice: record button (only dream_only + user_voice) */}
                        {effectiveVoiceMode === 'user_voice' && (
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`
                                    w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
                                    min-h-[44px] transition-all duration-150 border
                                    ${isRecording
                                        ? (isLight
                                            ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                                            : 'bg-red-900/30 border-red-500/50 text-red-400 animate-pulse')
                                        : (isLight
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10')
                                    }
                                `}
                            >
                                <span className="material-icons text-base">
                                    {isRecording ? 'stop' : voiceBlob ? 'check_circle' : 'mic'}
                                </span>
                                <span className="truncate">
                                    {isRecording
                                        ? t.stop_recording
                                        : voiceBlob
                                            ? t.recording.replace('…', '') + ' ✓'
                                            : t.record_voice}
                                </span>
                            </button>
                        )}

                        {/* AI voice: character grid */}
                        {effectiveVoiceMode === 'ai_voice' && (
                            <div className="grid grid-cols-2 gap-2">
                                {VOICE_CHARACTERS.map((vc) => (
                                    <button
                                        key={vc.id}
                                        onClick={() => setSelectedAiVoice(vc.id)}
                                        className={`
                                            p-3 rounded-xl text-left transition-all duration-150 border min-h-[44px]
                                            ${selectedAiVoice === vc.id
                                                ? (isLight
                                                    ? 'bg-indigo-50 border-indigo-400 shadow-sm'
                                                    : 'bg-fuchsia-900/30 border-fuchsia-500/60 shadow-[0_0_12px_rgba(217,70,239,0.2)]')
                                                : (isLight
                                                    ? 'bg-white border-gray-200 hover:border-indigo-200'
                                                    : 'bg-white/5 border-white/10 hover:border-white/20')
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`material-icons text-base ${
                                                selectedAiVoice === vc.id ? sectionLabel : textSecondary
                                            }`}>{vc.icon}</span>
                                            <span className={`text-sm font-semibold ${textPrimary}`}>{vc.name}</span>
                                        </div>
                                        <div className={`text-[11px] mt-1 leading-snug ${textSecondary}`}>
                                            {vc.descriptions[language] || vc.descriptions['en']}
                                        </div>
                                        <div className={`text-[10px] mt-0.5 uppercase tracking-wide font-semibold ${
                                            isLight ? 'text-gray-400' : 'text-white/30'
                                        }`}>
                                            {vc.gender === 'female' ? '♀' : '♂'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Audio / Musik ── */}
                    <div className={`rounded-2xl p-4 space-y-4 ${cardBg}`}>
                        <div className="flex items-center gap-2">
                            <span className={`material-icons text-base ${sectionLabel}`}>headphones</span>
                            <span className={`text-xs uppercase tracking-widest font-semibold ${sectionLabel}`}>
                                {t.audio_title}
                            </span>
                        </div>

                        {/* Upload MP3 button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                                w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
                                min-h-[44px] transition-all duration-150 border
                                ${musicFile
                                    ? (isLight
                                        ? 'bg-green-50 border-green-300 text-green-700'
                                        : 'bg-green-900/30 border-green-500/50 text-green-400')
                                    : (isLight
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10')
                                }
                            `}
                        >
                            <span className="material-icons text-base">
                                {musicFile ? 'audio_file' : 'upload'}
                            </span>
                            <span className="truncate">
                                {musicFile ? t.mp3_loaded : t.upload_mp3}
                            </span>
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/mpeg,audio/mp3,.mp3"
                            onChange={handleMp3Upload}
                            className="hidden"
                        />

                        {/* Volume sliders with preview buttons */}
                        <div className="space-y-4">
                            <div className="flex items-end gap-2">
                                <div className="flex-1">
                                    <RangeSlider
                                        value={voiceVolume}
                                        min={0}
                                        max={100}
                                        onChange={setVoiceVolume}
                                        label={t.voice_volume}
                                        icon="volume_up"
                                        isLight={isLight}
                                        accentClass={isLight ? 'accent-indigo-500' : 'accent-fuchsia-500'}
                                    />
                                </div>
                                {voiceBlob && (
                                    <button
                                        onClick={toggleVoicePreview}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                            isPreviewingVoice
                                                ? 'bg-fuchsia-600 text-white'
                                                : isLight ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-white/10 text-white/60 hover:bg-white/20'
                                        }`}
                                        title="Stimme voranhoeren"
                                    >
                                        <span className="material-icons text-sm">{isPreviewingVoice ? 'pause' : 'play_arrow'}</span>
                                    </button>
                                )}
                            </div>
                            <div className="flex items-end gap-2">
                                <div className="flex-1">
                                    <RangeSlider
                                        value={musicVolume}
                                        min={0}
                                        max={100}
                                        onChange={setMusicVolume}
                                        label={t.music_volume}
                                        icon="music_note"
                                        isLight={isLight}
                                        accentClass={isLight ? 'accent-violet-500' : 'accent-violet-500'}
                                    />
                                </div>
                                {musicFile && (
                                    <button
                                        onClick={toggleMusicPreview}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                            isPreviewingMusic
                                                ? 'bg-violet-600 text-white'
                                                : isLight ? 'bg-violet-100 text-violet-600 hover:bg-violet-200' : 'bg-white/10 text-white/60 hover:bg-white/20'
                                        }`}
                                        title="Musik voranhoeren"
                                    >
                                        <span className="material-icons text-sm">{isPreviewingMusic ? 'pause' : 'play_arrow'}</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Checkboxes */}
                        <div className={`space-y-1 border-t ${divider} pt-3`}>
                            <CheckboxRow
                                checked={fadeEnabled}
                                onChange={setFadeEnabled}
                                label={t.fade_option}
                                isLight={isLight}
                            />
                            <CheckboxRow
                                checked={loopEnabled}
                                onChange={setLoopEnabled}
                                label={t.loop_option}
                                isLight={isLight}
                            />
                        </div>
                    </div>

                    {/* ── Price & Generate ── */}
                    <div className={`rounded-2xl p-4 space-y-3 ${cardBg}`}>
                        {/* Price row */}
                        <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${textSecondary}`}>{t.price_label}</span>
                            <span className={`text-xl font-bold ${isLight ? 'text-indigo-600' : 'text-fuchsia-300'}`}>
                                {totalPrice} Coins
                            </span>
                        </div>

                        {/* Balance row */}
                        <div className="flex items-center justify-between">
                            <span className={`text-sm ${textSecondary}`}>{t.balance_label}</span>
                            <span className={`text-sm font-semibold ${canAfford
                                ? (isLight ? 'text-green-600' : 'text-green-400')
                                : (isLight ? 'text-red-500' : 'text-red-400')
                            }`}>
                                {userCredits} Coins
                            </span>
                        </div>

                        {/* Hints */}
                        {!canAfford && (
                            <div className={`
                                flex items-center gap-2 rounded-xl px-3 py-2.5
                                ${isLight ? 'bg-red-50 text-red-600' : 'bg-red-900/20 text-red-400'}
                            `}>
                                <span className="material-icons text-base">warning</span>
                                <span className="text-sm font-medium">{t.insufficient_funds}</span>
                            </div>
                        )}
                        {needsRecording && canAfford && (
                            <div className={`
                                flex items-center gap-2 rounded-xl px-3 py-2.5
                                ${isLight ? 'bg-amber-50 text-amber-700' : 'bg-amber-900/20 text-amber-400'}
                            `}>
                                <span className="material-icons text-base">mic_off</span>
                                <span className="text-sm font-medium">{t.need_recording}</span>
                            </div>
                        )}

                        {/* Generate button */}
                        <button
                            onClick={handleGenerate}
                            disabled={generateDisabled}
                            className={`
                                w-full py-4 rounded-2xl text-base font-bold tracking-wide min-h-[52px]
                                flex items-center justify-center gap-2 transition-all duration-200
                                ${generateBtn}
                            `}
                        >
                            {isGenerating ? (
                                <>
                                    <span className="material-icons animate-spin text-base">refresh</span>
                                    {t.generating}
                                </>
                            ) : (
                                <>
                                    <span className="material-icons text-base">
                                        {activeTab === 'ai' ? 'movie' : 'slideshow'}
                                    </span>
                                    {canAfford ? t.generate_btn : t.insufficient_funds}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoStudio;
