import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Language, ThemeMode } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VideoStudioProps {
    language: Language;
    themeMode: ThemeMode;
    dreamText: string;
    onClose: () => void;
    onSave: (result: { videoUrl: string; type: 'ai' | 'slideshow' }) => void;
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
}

const T: Record<Language, Translations> = {
    [Language.DE]: {
        title: 'VIDEO STUDIO',
        tab_ai: 'KI-Video',
        tab_slideshow: 'Slideshow',
        quality_label: 'Qualitaet',
        standard: 'Standard',
        hd: 'HD',
        interval_label: 'Bildintervall',
        images_count: 'Bilder',
        estimated_cost: 'Geschaetzte Kosten',
        audio_title: 'Audio',
        record_voice: 'Eigene Stimme aufnehmen',
        upload_mp3: 'MP3 hochladen',
        voice_volume: 'Stimme',
        music_volume: 'Musik',
        fade_option: 'Fade-In / Fade-Out',
        loop_option: 'Musik loopen',
        price_label: 'Preis',
        balance_label: 'Dein Guthaben',
        generate_btn: 'Generieren',
        insufficient_funds: 'Nicht genug Coins',
        recording: 'Aufnahme laeuft…',
        stop_recording: 'Aufnahme stoppen',
        mp3_loaded: 'MP3 geladen',
        back_btn: 'Zurueck',
        dream_text_label: 'Traumtext',
        settings_title: 'Einstellungen',
        slideshow_only: 'Nur bei Slideshow',
        generating: 'Wird generiert…',
        seconds_unit: 's',
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
    },
    [Language.TR]: {
        title: 'VIDEO STUDYO',
        tab_ai: 'Yapay Zeka',
        tab_slideshow: 'Slayt Gosterisi',
        quality_label: 'Kalite',
        standard: 'Standart',
        hd: 'HD',
        interval_label: 'Goruntu araligi',
        images_count: 'Goruntu',
        estimated_cost: 'Tahmini maliyet',
        audio_title: 'Ses',
        record_voice: 'Kendi sesini kaydet',
        upload_mp3: 'MP3 yukle',
        voice_volume: 'Ses',
        music_volume: 'Muzik',
        fade_option: 'Gecis efekti',
        loop_option: 'Muzigi dongule',
        price_label: 'Fiyat',
        balance_label: 'Bakiyen',
        generate_btn: 'Olustur',
        insufficient_funds: 'Yeterli coin yok',
        recording: 'Kayit devam ediyor…',
        stop_recording: 'Kaydı durdur',
        mp3_loaded: 'MP3 yuklendi',
        back_btn: 'Geri',
        dream_text_label: 'Ruya metni',
        settings_title: 'Ayarlar',
        slideshow_only: 'Sadece slayt gosterisi',
        generating: 'Olusturuluyor…',
        seconds_unit: 's',
    },
    [Language.ES]: {
        title: 'ESTUDIO VIDEO',
        tab_ai: 'Video IA',
        tab_slideshow: 'Diapositivas',
        quality_label: 'Calidad',
        standard: 'Estandar',
        hd: 'HD',
        interval_label: 'Intervalo de imagen',
        images_count: 'Imagenes',
        estimated_cost: 'Coste estimado',
        audio_title: 'Audio',
        record_voice: 'Grabar voz',
        upload_mp3: 'Subir MP3',
        voice_volume: 'Voz',
        music_volume: 'Musica',
        fade_option: 'Fade-In / Fade-Out',
        loop_option: 'Repetir musica',
        price_label: 'Precio',
        balance_label: 'Tu saldo',
        generate_btn: 'Generar',
        insufficient_funds: 'Monedas insuficientes',
        recording: 'Grabando…',
        stop_recording: 'Detener grabacion',
        mp3_loaded: 'MP3 cargado',
        back_btn: 'Volver',
        dream_text_label: 'Texto del sueno',
        settings_title: 'Configuracion',
        slideshow_only: 'Solo diapositivas',
        generating: 'Generando…',
        seconds_unit: 's',
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
    },
};

function getT(lang: Language): Translations {
    return T[lang] ?? T[Language.EN];
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

    // --- Audio ---
    const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
    const [musicFile, setMusicFile] = useState<File | null>(null);
    const [voiceVolume, setVoiceVolume] = useState<number>(80);
    const [musicVolume, setMusicVolume] = useState<number>(40);
    const [fadeEnabled, setFadeEnabled] = useState<boolean>(false);
    const [loopEnabled, setLoopEnabled] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);

    // --- Generation state ---
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    // --- MediaRecorder refs ---
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // --- Derived values ---
    const imageCount = Math.ceil(SLIDESHOW_DURATION_SECONDS / imageInterval);
    const costPerImage = PRICE.slideshow[quality];
    const slideshowPrice = imageCount * costPerImage;
    const aiPrice = PRICE.ai[quality];
    const totalPrice = activeTab === 'ai' ? aiPrice : slideshowPrice;
    const canAfford = userCredits >= totalPrice;

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
        } catch {
            console.error('[VideoStudio] Mikrofon-Zugriff verweigert');
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
        if (!canAfford || isGenerating) return;
        setIsGenerating(true);

        // Simulate async work (real API integration happens in parent/service)
        await new Promise<void>((resolve) => setTimeout(resolve, 800));

        // Return a placeholder URL — real URL comes from the service layer
        const placeholderUrl = `dream-${activeTab}-${quality}-${Date.now()}.mp4`;
        onSave({ videoUrl: placeholderUrl, type: activeTab === 'ai' ? 'ai' : 'slideshow' });
        setIsGenerating(false);
    }, [canAfford, isGenerating, activeTab, quality, onSave]);

    // ---------------------------------------------------------------------------
    // Style helpers
    // ---------------------------------------------------------------------------

    const bg = isLight ? 'bg-[#faf8ff]' : 'bg-[#0f0b1a]';
    const headerBg = isLight ? 'bg-[#faf8ff]/95 border-b border-indigo-100' : 'bg-[#0f0b1a]/95 border-b border-white/10';
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

    const generateDisabled = !canAfford || isGenerating;

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
                                        max={10}
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

                    {/* ── Audio ── */}
                    <div className={`rounded-2xl p-4 space-y-4 ${cardBg}`}>
                        <div className="flex items-center gap-2">
                            <span className={`material-icons text-base ${sectionLabel}`}>headphones</span>
                            <span className={`text-xs uppercase tracking-widest font-semibold ${sectionLabel}`}>
                                {t.audio_title}
                            </span>
                        </div>

                        {/* Record / Upload row */}
                        <div className="flex gap-2">
                            {/* Record voice button */}
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`
                                    flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
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

                            {/* Upload MP3 button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
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
                        </div>

                        {/* Volume sliders */}
                        <div className="space-y-4">
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

                        {/* Insufficient funds hint */}
                        {!canAfford && (
                            <div className={`
                                flex items-center gap-2 rounded-xl px-3 py-2.5
                                ${isLight ? 'bg-red-50 text-red-600' : 'bg-red-900/20 text-red-400'}
                            `}>
                                <span className="material-icons text-base">warning</span>
                                <span className="text-sm font-medium">{t.insufficient_funds}</span>
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
