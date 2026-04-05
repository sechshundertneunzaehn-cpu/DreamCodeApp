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
}

export interface VideoStudioProps {
    language: Language;
    themeMode: ThemeMode;
    dreamText: string;
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
        voice_mode_own: 'Eigene Stimme',
        voice_mode_ai: 'KI-Stimme',
        voice_select_label: 'Stimme waehlen',
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
        content_label: 'Inhalt',
        content_dream: 'Nur Erzaehlung',
        content_interp: 'Nur Deutung',
        content_both: 'Beides',
        est_duration: 'Geschaetzte Dauer',
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
        voice_mode_own: 'Kendi sesin',
        voice_mode_ai: 'Yapay zeka sesi',
        voice_select_label: 'Ses sec',
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
        content_label: 'Icerik',
        content_dream: 'Sadece anlatim',
        content_interp: 'Sadece yorum',
        content_both: 'Ikisi de',
        est_duration: 'Tahmini sure',
        need_recording: 'Lutfen once kayit yapin',
        minutes_unit: 'dk',
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
        voice_mode_own: 'Tu voz',
        voice_mode_ai: 'Voz IA',
        voice_select_label: 'Elegir voz',
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
        content_label: 'Contenido',
        content_dream: 'Solo narracion',
        content_interp: 'Solo interpretacion',
        content_both: 'Ambos',
        est_duration: 'Duracion estimada',
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
        content_interp: 'Interpretation seule',
        content_both: 'Les deux',
        est_duration: 'Duree estimee',
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
        content_label: 'Conteudo',
        content_dream: 'Apenas narracao',
        content_interp: 'Apenas interpretacao',
        content_both: 'Ambos',
        est_duration: 'Duracao estimada',
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
    [Language.ZH]: {
        title: '视频工作室',
        tab_ai: 'AI视频',
        tab_slideshow: '幻灯片',
        quality_label: '质量',
        standard: '标准',
        hd: '高清',
        interval_label: '图片间隔',
        images_count: '图片',
        estimated_cost: '预估费用',
        audio_title: '音频',
        record_voice: '录制声音',
        upload_mp3: '上传MP3',
        voice_volume: '声音',
        music_volume: '音乐',
        voice_mode_own: '自己的声音',
        voice_mode_ai: 'AI声音',
        voice_select_label: '选择声音',
        fade_option: '淡入/淡出',
        loop_option: '循环音乐',
        price_label: '价格',
        balance_label: '你的余额',
        generate_btn: '生成',
        insufficient_funds: '金币不足',
        recording: '录制中…',
        stop_recording: '停止录制',
        mp3_loaded: 'MP3已加载',
        back_btn: '返回',
        dream_text_label: '梦境文本',
        settings_title: '设置',
        slideshow_only: '仅幻灯片',
        generating: '生成中…',
        seconds_unit: '秒',
        content_label: '内容',
        content_dream: '仅叙述',
        content_interp: '仅解读',
        content_both: '两者',
        est_duration: '预估时长',
        need_recording: '请先录制',
        minutes_unit: '分',
    },
    [Language.HI]: {
        title: 'वीडियो स्टूडियो',
        tab_ai: 'AI वीडियो',
        tab_slideshow: 'स्लाइडशो',
        quality_label: 'गुणवत्ता',
        standard: 'मानक',
        hd: 'HD',
        interval_label: 'छवि अंतराल',
        images_count: 'छवियां',
        estimated_cost: 'अनुमानित लागत',
        audio_title: 'ऑडियो',
        record_voice: 'आवाज़ रिकॉर्ड करें',
        upload_mp3: 'MP3 अपलोड',
        voice_volume: 'आवाज़',
        music_volume: 'संगीत',
        voice_mode_own: 'अपनी आवाज़',
        voice_mode_ai: 'AI आवाज़',
        voice_select_label: 'आवाज़ चुनें',
        fade_option: 'फेड-इन / फेड-आउट',
        loop_option: 'संगीत लूप',
        price_label: 'कीमत',
        balance_label: 'आपकी शेष राशि',
        generate_btn: 'बनाएं',
        insufficient_funds: 'पर्याप्त सिक्के नहीं',
        recording: 'रिकॉर्डिंग…',
        stop_recording: 'रिकॉर्डिंग रोकें',
        mp3_loaded: 'MP3 लोड हुआ',
        back_btn: 'वापस',
        dream_text_label: 'सपने का पाठ',
        settings_title: 'सेटिंग्स',
        slideshow_only: 'केवल स्लाइडशो',
        generating: 'बना रहा है…',
        seconds_unit: 'से',
        content_label: 'सामग्री',
        content_dream: 'केवल कथा',
        content_interp: 'केवल व्याख्या',
        content_both: 'दोनों',
        est_duration: 'अनुमानित अवधि',
        need_recording: 'कृपया पहले रिकॉर्ड करें',
        minutes_unit: 'मिनट',
    },
    [Language.JA]: {
        title: 'ビデオスタジオ',
        tab_ai: 'AI動画',
        tab_slideshow: 'スライドショー',
        quality_label: '品質',
        standard: 'スタンダード',
        hd: 'HD',
        interval_label: '画像間隔',
        images_count: '画像',
        estimated_cost: '推定コスト',
        audio_title: 'オーディオ',
        record_voice: '声を録音',
        upload_mp3: 'MP3アップロード',
        voice_volume: '声',
        music_volume: '音楽',
        voice_mode_own: '自分の声',
        voice_mode_ai: 'AI音声',
        voice_select_label: '声を選択',
        fade_option: 'フェードイン/アウト',
        loop_option: '音楽ループ',
        price_label: '価格',
        balance_label: '残高',
        generate_btn: '生成',
        insufficient_funds: 'コイン不足',
        recording: '録音中…',
        stop_recording: '録音停止',
        mp3_loaded: 'MP3読み込み済み',
        back_btn: '戻る',
        dream_text_label: '夢のテキスト',
        settings_title: '設定',
        slideshow_only: 'スライドショーのみ',
        generating: '生成中…',
        seconds_unit: '秒',
        content_label: 'コンテンツ',
        content_dream: 'ナレーションのみ',
        content_interp: '解釈のみ',
        content_both: '両方',
        est_duration: '推定時間',
        need_recording: '先に録音してください',
        minutes_unit: '分',
    },
    [Language.KO]: {
        title: '비디오 스튜디오',
        tab_ai: 'AI 영상',
        tab_slideshow: '슬라이드쇼',
        quality_label: '품질',
        standard: '표준',
        hd: 'HD',
        interval_label: '이미지 간격',
        images_count: '이미지',
        estimated_cost: '예상 비용',
        audio_title: '오디오',
        record_voice: '음성 녹음',
        upload_mp3: 'MP3 업로드',
        voice_volume: '음성',
        music_volume: '음악',
        voice_mode_own: '내 목소리',
        voice_mode_ai: 'AI 음성',
        voice_select_label: '음성 선택',
        fade_option: '페이드 인/아웃',
        loop_option: '음악 반복',
        price_label: '가격',
        balance_label: '잔액',
        generate_btn: '생성',
        insufficient_funds: '코인 부족',
        recording: '녹음 중…',
        stop_recording: '녹음 중지',
        mp3_loaded: 'MP3 로드됨',
        back_btn: '뒤로',
        dream_text_label: '꿈 텍스트',
        settings_title: '설정',
        slideshow_only: '슬라이드쇼만',
        generating: '생성 중…',
        seconds_unit: '초',
        content_label: '콘텐츠',
        content_dream: '내레이션만',
        content_interp: '해석만',
        content_both: '둘 다',
        est_duration: '예상 시간',
        need_recording: '먼저 녹음해주세요',
        minutes_unit: '분',
    },
    [Language.ID]: {
        title: 'STUDIO VIDEO',
        tab_ai: 'Video AI',
        tab_slideshow: 'Tayangan Slide',
        quality_label: 'Kualitas',
        standard: 'Standar',
        hd: 'HD',
        interval_label: 'Interval gambar',
        images_count: 'Gambar',
        estimated_cost: 'Perkiraan biaya',
        audio_title: 'Audio',
        record_voice: 'Rekam suara',
        upload_mp3: 'Unggah MP3',
        voice_volume: 'Suara',
        music_volume: 'Musik',
        voice_mode_own: 'Suara sendiri',
        voice_mode_ai: 'Suara AI',
        voice_select_label: 'Pilih suara',
        fade_option: 'Fade-In / Fade-Out',
        loop_option: 'Loop musik',
        price_label: 'Harga',
        balance_label: 'Saldo Anda',
        generate_btn: 'Buat',
        insufficient_funds: 'Koin tidak cukup',
        recording: 'Merekam…',
        stop_recording: 'Hentikan rekaman',
        mp3_loaded: 'MP3 dimuat',
        back_btn: 'Kembali',
        dream_text_label: 'Teks mimpi',
        settings_title: 'Pengaturan',
        slideshow_only: 'Hanya tayangan slide',
        generating: 'Membuat…',
        seconds_unit: 'd',
        content_label: 'Konten',
        content_dream: 'Hanya narasi',
        content_interp: 'Hanya interpretasi',
        content_both: 'Keduanya',
        est_duration: 'Perkiraan durasi',
        need_recording: 'Silakan rekam dulu',
        minutes_unit: 'mnt',
    },
    [Language.FA]: {
        title: 'استودیو ویدیو',
        tab_ai: 'ویدیو هوشمند',
        tab_slideshow: 'اسلایدشو',
        quality_label: 'کیفیت',
        standard: 'استاندارد',
        hd: 'اچ‌دی',
        interval_label: 'فاصله تصویر',
        images_count: 'تصاویر',
        estimated_cost: 'هزینه تخمینی',
        audio_title: 'صدا',
        record_voice: 'ضبط صدا',
        upload_mp3: 'بارگذاری MP3',
        voice_volume: 'صدا',
        music_volume: 'موسیقی',
        voice_mode_own: 'صدای خود',
        voice_mode_ai: 'صدای هوش مصنوعی',
        voice_select_label: 'انتخاب صدا',
        fade_option: 'محو شدن ورود/خروج',
        loop_option: 'تکرار موسیقی',
        price_label: 'قیمت',
        balance_label: 'موجودی شما',
        generate_btn: 'ایجاد',
        insufficient_funds: 'سکه کافی نیست',
        recording: 'در حال ضبط…',
        stop_recording: 'توقف ضبط',
        mp3_loaded: 'MP3 بارگذاری شد',
        back_btn: 'بازگشت',
        dream_text_label: 'متن رویا',
        settings_title: 'تنظیمات',
        slideshow_only: 'فقط اسلایدشو',
        generating: 'در حال ایجاد…',
        seconds_unit: 'ث',
        content_label: 'محتوا',
        content_dream: 'فقط روایت',
        content_interp: 'فقط تعبیر',
        content_both: 'هر دو',
        est_duration: 'مدت تخمینی',
        need_recording: 'لطفا ابتدا ضبط کنید',
        minutes_unit: 'دقیقه',
    },
    [Language.IT]: {
        title: 'STUDIO VIDEO',
        tab_ai: 'Video IA',
        tab_slideshow: 'Presentazione',
        quality_label: 'Qualita',
        standard: 'Standard',
        hd: 'HD',
        interval_label: 'Intervallo immagine',
        images_count: 'Immagini',
        estimated_cost: 'Costo stimato',
        audio_title: 'Audio',
        record_voice: 'Registra voce',
        upload_mp3: 'Carica MP3',
        voice_volume: 'Voce',
        music_volume: 'Musica',
        voice_mode_own: 'La tua voce',
        voice_mode_ai: 'Voce IA',
        voice_select_label: 'Scegli voce',
        fade_option: 'Fade-In / Fade-Out',
        loop_option: 'Ripeti musica',
        price_label: 'Prezzo',
        balance_label: 'Il tuo saldo',
        generate_btn: 'Genera',
        insufficient_funds: 'Monete insufficienti',
        recording: 'Registrazione…',
        stop_recording: 'Ferma registrazione',
        mp3_loaded: 'MP3 caricato',
        back_btn: 'Indietro',
        dream_text_label: 'Testo del sogno',
        settings_title: 'Impostazioni',
        slideshow_only: 'Solo presentazione',
        generating: 'Generazione…',
        seconds_unit: 's',
        content_label: 'Contenuto',
        content_dream: 'Solo narrazione',
        content_interp: 'Solo interpretazione',
        content_both: 'Entrambi',
        est_duration: 'Durata stimata',
        need_recording: 'Registra prima',
        minutes_unit: 'min',
    },
    [Language.PL]: {
        title: 'STUDIO WIDEO',
        tab_ai: 'Wideo AI',
        tab_slideshow: 'Pokaz slajdow',
        quality_label: 'Jakosc',
        standard: 'Standardowa',
        hd: 'HD',
        interval_label: 'Interwal obrazu',
        images_count: 'Obrazy',
        estimated_cost: 'Szacowany koszt',
        audio_title: 'Audio',
        record_voice: 'Nagraj glos',
        upload_mp3: 'Wgraj MP3',
        voice_volume: 'Glos',
        music_volume: 'Muzyka',
        voice_mode_own: 'Wlasny glos',
        voice_mode_ai: 'Glos AI',
        voice_select_label: 'Wybierz glos',
        fade_option: 'Fade-In / Fade-Out',
        loop_option: 'Zapetl muzyke',
        price_label: 'Cena',
        balance_label: 'Twoje saldo',
        generate_btn: 'Generuj',
        insufficient_funds: 'Za malo monet',
        recording: 'Nagrywanie…',
        stop_recording: 'Zatrzymaj nagrywanie',
        mp3_loaded: 'MP3 zaladowany',
        back_btn: 'Wstecz',
        dream_text_label: 'Tekst snu',
        settings_title: 'Ustawienia',
        slideshow_only: 'Tylko pokaz slajdow',
        generating: 'Generowanie…',
        seconds_unit: 's',
        content_label: 'Tresc',
        content_dream: 'Tylko narracja',
        content_interp: 'Tylko interpretacja',
        content_both: 'Oba',
        est_duration: 'Szacowany czas',
        need_recording: 'Najpierw nagraj',
        minutes_unit: 'min',
    },
    [Language.BN]: {
        title: 'ভিডিও স্টুডিও',
        tab_ai: 'AI ভিডিও',
        tab_slideshow: 'স্লাইডশো',
        quality_label: 'মান',
        standard: 'মানক',
        hd: 'HD',
        interval_label: 'ছবির ব্যবধান',
        images_count: 'ছবি',
        estimated_cost: 'আনুমানিক খরচ',
        audio_title: 'অডিও',
        record_voice: 'কণ্ঠ রেকর্ড করুন',
        upload_mp3: 'MP3 আপলোড',
        voice_volume: 'কণ্ঠ',
        music_volume: 'সঙ্গীত',
        voice_mode_own: 'নিজের কণ্ঠ',
        voice_mode_ai: 'AI কণ্ঠ',
        voice_select_label: 'কণ্ঠ নির্বাচন',
        fade_option: 'ফেড-ইন / ফেড-আউট',
        loop_option: 'সঙ্গীত লুপ',
        price_label: 'মূল্য',
        balance_label: 'আপনার ব্যালেন্স',
        generate_btn: 'তৈরি করুন',
        insufficient_funds: 'পর্যাপ্ত কয়েন নেই',
        recording: 'রেকর্ডিং…',
        stop_recording: 'রেকর্ডিং বন্ধ',
        mp3_loaded: 'MP3 লোড হয়েছে',
        back_btn: 'ফিরে যান',
        dream_text_label: 'স্বপ্নের পাঠ্য',
        settings_title: 'সেটিংস',
        slideshow_only: 'শুধু স্লাইডশো',
        generating: 'তৈরি হচ্ছে…',
        seconds_unit: 'সে',
        content_label: 'বিষয়বস্তু',
        content_dream: 'শুধু বর্ণনা',
        content_interp: 'শুধু ব্যাখ্যা',
        content_both: 'উভয়',
        est_duration: 'আনুমানিক সময়কাল',
        need_recording: 'অনুগ্রহ করে প্রথমে রেকর্ড করুন',
        minutes_unit: 'মিনিট',
    },
    [Language.UR]: {
        title: 'ویڈیو اسٹوڈیو',
        tab_ai: 'AI ویڈیو',
        tab_slideshow: 'سلائیڈ شو',
        quality_label: 'معیار',
        standard: 'سٹینڈرڈ',
        hd: 'HD',
        interval_label: 'تصویر کا وقفہ',
        images_count: 'تصاویر',
        estimated_cost: 'تخمینی لاگت',
        audio_title: 'آڈیو',
        record_voice: 'آواز ریکارڈ کریں',
        upload_mp3: 'MP3 اپلوڈ',
        voice_volume: 'آواز',
        music_volume: 'موسیقی',
        voice_mode_own: 'اپنی آواز',
        voice_mode_ai: 'AI آواز',
        voice_select_label: 'آواز چنیں',
        fade_option: 'فیڈ-ان / فیڈ-آؤٹ',
        loop_option: 'موسیقی لوپ',
        price_label: 'قیمت',
        balance_label: 'آپ کا بیلنس',
        generate_btn: 'بنائیں',
        insufficient_funds: 'سکے کافی نہیں',
        recording: 'ریکارڈنگ…',
        stop_recording: 'ریکارڈنگ بند کریں',
        mp3_loaded: 'MP3 لوڈ ہوا',
        back_btn: 'واپس',
        dream_text_label: 'خواب کا متن',
        settings_title: 'ترتیبات',
        slideshow_only: 'صرف سلائیڈ شو',
        generating: 'بنایا جا رہا ہے…',
        seconds_unit: 'سیکنڈ',
        content_label: 'مواد',
        content_dream: 'صرف بیانیہ',
        content_interp: 'صرف تعبیر',
        content_both: 'دونوں',
        est_duration: 'تخمینی مدت',
        need_recording: 'پہلے ریکارڈ کریں',
        minutes_unit: 'منٹ',
    },
    [Language.VI]: {
        title: 'STUDIO VIDEO',
        tab_ai: 'Video AI',
        tab_slideshow: 'Trinh chieu',
        quality_label: 'Chat luong',
        standard: 'Tieu chuan',
        hd: 'HD',
        interval_label: 'Khoang cach anh',
        images_count: 'Hinh anh',
        estimated_cost: 'Chi phi uoc tinh',
        audio_title: 'Am thanh',
        record_voice: 'Ghi am giong noi',
        upload_mp3: 'Tai len MP3',
        voice_volume: 'Giong noi',
        music_volume: 'Nhac',
        voice_mode_own: 'Giong cua ban',
        voice_mode_ai: 'Giong AI',
        voice_select_label: 'Chon giong',
        fade_option: 'Fade-In / Fade-Out',
        loop_option: 'Lap nhac',
        price_label: 'Gia',
        balance_label: 'So du cua ban',
        generate_btn: 'Tao',
        insufficient_funds: 'Khong du xu',
        recording: 'Dang ghi am…',
        stop_recording: 'Dung ghi am',
        mp3_loaded: 'MP3 da tai',
        back_btn: 'Quay lai',
        dream_text_label: 'Van ban giac mo',
        settings_title: 'Cai dat',
        slideshow_only: 'Chi trinh chieu',
        generating: 'Dang tao…',
        seconds_unit: 'giay',
        content_label: 'Noi dung',
        content_dream: 'Chi thuyet minh',
        content_interp: 'Chi giai thich',
        content_both: 'Ca hai',
        est_duration: 'Thoi luong uoc tinh',
        need_recording: 'Vui long ghi am truoc',
        minutes_unit: 'phut',
    },
    [Language.TH]: {
        title: 'สตูดิโอวิดีโอ',
        tab_ai: 'วิดีโอ AI',
        tab_slideshow: 'สไลด์โชว์',
        quality_label: 'คุณภาพ',
        standard: 'มาตรฐาน',
        hd: 'HD',
        interval_label: 'ช่วงเวลาภาพ',
        images_count: 'ภาพ',
        estimated_cost: 'ค่าใช้จ่ายโดยประมาณ',
        audio_title: 'เสียง',
        record_voice: 'บันทึกเสียง',
        upload_mp3: 'อัปโหลด MP3',
        voice_volume: 'เสียงพูด',
        music_volume: 'เพลง',
        voice_mode_own: 'เสียงของคุณ',
        voice_mode_ai: 'เสียง AI',
        voice_select_label: 'เลือกเสียง',
        fade_option: 'เฟดเข้า/ออก',
        loop_option: 'เล่นเพลงซ้ำ',
        price_label: 'ราคา',
        balance_label: 'ยอดเงินของคุณ',
        generate_btn: 'สร้าง',
        insufficient_funds: 'เหรียญไม่เพียงพอ',
        recording: 'กำลังบันทึก…',
        stop_recording: 'หยุดบันทึก',
        mp3_loaded: 'โหลด MP3 แล้ว',
        back_btn: 'กลับ',
        dream_text_label: 'ข้อความความฝัน',
        settings_title: 'การตั้งค่า',
        slideshow_only: 'เฉพาะสไลด์โชว์',
        generating: 'กำลังสร้าง…',
        seconds_unit: 'วิ',
        content_label: 'เนื้อหา',
        content_dream: 'เฉพาะการเล่าเรื่อง',
        content_interp: 'เฉพาะการตีความ',
        content_both: 'ทั้งสอง',
        est_duration: 'ระยะเวลาโดยประมาณ',
        need_recording: 'กรุณาบันทึกก่อน',
        minutes_unit: 'นาที',
    },
    [Language.SW]: {
        title: 'STUDIO YA VIDEO',
        tab_ai: 'Video ya AI',
        tab_slideshow: 'Onyesho la Picha',
        quality_label: 'Ubora',
        standard: 'Kawaida',
        hd: 'HD',
        interval_label: 'Muda wa picha',
        images_count: 'Picha',
        estimated_cost: 'Gharama inayokadiriwa',
        audio_title: 'Sauti',
        record_voice: 'Rekodi sauti',
        upload_mp3: 'Pakia MP3',
        voice_volume: 'Sauti',
        music_volume: 'Muziki',
        voice_mode_own: 'Sauti yako',
        voice_mode_ai: 'Sauti ya AI',
        voice_select_label: 'Chagua sauti',
        fade_option: 'Fifia Ndani / Nje',
        loop_option: 'Rudia muziki',
        price_label: 'Bei',
        balance_label: 'Salio lako',
        generate_btn: 'Tengeneza',
        insufficient_funds: 'Sarafu hazitoshi',
        recording: 'Inarekodia…',
        stop_recording: 'Simamisha rekodi',
        mp3_loaded: 'MP3 imepakiwa',
        back_btn: 'Rudi',
        dream_text_label: 'Maandishi ya ndoto',
        settings_title: 'Mipangilio',
        slideshow_only: 'Onyesho la picha tu',
        generating: 'Inatengeneza…',
        seconds_unit: 'sek',
        content_label: 'Maudhui',
        content_dream: 'Simulizi tu',
        content_interp: 'Tafsiri tu',
        content_both: 'Zote mbili',
        est_duration: 'Muda unaokadiriwa',
        need_recording: 'Tafadhali rekodi kwanza',
        minutes_unit: 'dak',
    },
    [Language.HU]: {
        title: 'VIDEO STUDIO',
        tab_ai: 'AI Video',
        tab_slideshow: 'Diavetites',
        quality_label: 'Minoseg',
        standard: 'Alap',
        hd: 'HD',
        interval_label: 'Kepintervallum',
        images_count: 'Kepek',
        estimated_cost: 'Becsult koltseg',
        audio_title: 'Hang',
        record_voice: 'Hang rogzitese',
        upload_mp3: 'MP3 feltoltes',
        voice_volume: 'Hang',
        music_volume: 'Zene',
        voice_mode_own: 'Sajat hang',
        voice_mode_ai: 'AI hang',
        voice_select_label: 'Hang valasztasa',
        fade_option: 'Fade-In / Fade-Out',
        loop_option: 'Zene ismetlese',
        price_label: 'Ar',
        balance_label: 'Egyenleged',
        generate_btn: 'Letrehozas',
        insufficient_funds: 'Nincs eleg erme',
        recording: 'Felvetel…',
        stop_recording: 'Felvetel leallitasa',
        mp3_loaded: 'MP3 betoltve',
        back_btn: 'Vissza',
        dream_text_label: 'Alom szovege',
        settings_title: 'Beallitasok',
        slideshow_only: 'Csak diavetites',
        generating: 'Letrehozas…',
        seconds_unit: 'mp',
        content_label: 'Tartalom',
        content_dream: 'Csak elbeszeles',
        content_interp: 'Csak ertelmez.',
        content_both: 'Mindketto',
        est_duration: 'Becsult idotartam',
        need_recording: 'Eloszor rogzitsen',
        minutes_unit: 'perc',
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
    onGenerate,
    userCredits,
}) => {
    const t = getT(language);
    const isLight = themeMode === ThemeMode.LIGHT;
    const isRtl = [Language.AR, Language.FA, Language.UR].includes(language);

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
