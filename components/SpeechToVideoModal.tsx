import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language, ThemeMode } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SpeechStatus = 'idle' | 'recording' | 'paused';

interface SpeechToVideoModalProps {
    open: boolean;
    initialText: string;
    language: Language;
    themeMode: ThemeMode;
    onClose: () => void;
    onContinue: (finalText: string, audioBlob?: Blob | null) => void;
}

// ---------------------------------------------------------------------------
// Browser Speech API
// ---------------------------------------------------------------------------

declare global {
    interface Window {
        webkitSpeechRecognition?: any;
        SpeechRecognition?: any;
    }
}

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

interface ModalTranslations {
    title: string;
    subtitle: string;
    placeholder: string;
    label: string;
    start_mic: string;
    pause: string;
    resume: string;
    continue_btn: string;
    close_btn: string;
    status_ready: string;
    status_recording: string;
    status_paused: string;
    not_supported: string;
    playback: string;
    audio_saved: string;
    voice_used: string;
}

const T: Record<Language, ModalTranslations> = {
    [Language.DE]: {
        title: 'Traumvideo vorbereiten',
        subtitle: 'Sprich deinen Traum ein, korrigiere den Text und gehe dann ins Video-Studio.',
        placeholder: 'Sprich deinen Traum ein oder tippe den Text hier.',
        label: 'Traumtext',
        start_mic: 'Mikrofon starten',
        pause: 'Pause',
        resume: 'Weiter aufnehmen',
        continue_btn: 'Weiter zum Video-Studio',
        close_btn: 'Abbrechen',
        status_ready: 'Bereit',
        status_recording: 'Aufnahme läuft',
        status_paused: 'Pausiert',
        not_supported: 'Spracherkennung wird in diesem Browser nicht unterstützt. Bitte tippe den Text manuell ein.',
        playback: '▶ Wiedergabe...',
        audio_saved: '🎤 Aufnahme gespeichert',
        voice_used: 'Eigene Stimme wird mit Video verwendet',
    },
    [Language.EN]: {
        title: 'Prepare Dream Video',
        subtitle: 'Speak your dream, correct the text, then continue to the Video Studio.',
        placeholder: 'Speak your dream or type it here.',
        label: 'Dream text',
        start_mic: 'Start microphone',
        pause: 'Pause',
        resume: 'Resume recording',
        continue_btn: 'Continue to Video Studio',
        close_btn: 'Cancel',
        status_ready: 'Ready',
        status_recording: 'Recording',
        status_paused: 'Paused',
        not_supported: 'Speech recognition is not supported in this browser. Please type the text manually.',
        playback: '▶ Playing...',
        audio_saved: '🎤 Recording saved',
        voice_used: 'Your voice will be used with video',
    },
    [Language.TR]: {
        title: 'Rüya Videosu Hazırla',
        subtitle: 'Rüyanı anlat, metni düzelt, sonra Video Stüdyoya geç.',
        placeholder: 'Rüyanı anlat ya da buraya yaz.',
        label: 'Rüya metni',
        start_mic: 'Mikrofonu başlat',
        pause: 'Durakla',
        resume: 'Kayda devam et',
        continue_btn: 'Video Stüdyoya devam',
        close_btn: 'İptal',
        status_ready: 'Hazır',
        status_recording: 'Kayıt devam ediyor',
        status_paused: 'Duraklatıldı',
        not_supported: 'Ses tanıma bu tarayıcıda desteklenmiyor. Lütfen metni elle yazın.',
        playback: '▶ Oynatılıyor...',
        audio_saved: '🎤 Kayıt kaydedildi',
        voice_used: 'Kendi sesiniz video ile kullanılacak',
    },
    [Language.ES]: {
        title: 'Preparar Vídeo de Sueño',
        subtitle: 'Habla tu sueño, corrige el texto y continúa al Estudio de Vídeo.',
        placeholder: 'Habla tu sueño o escribe aquí.',
        label: 'Texto del sueño',
        start_mic: 'Iniciar micrófono',
        pause: 'Pausar',
        resume: 'Continuar grabación',
        continue_btn: 'Continuar al Estudio',
        close_btn: 'Cancelar',
        status_ready: 'Listo',
        status_recording: 'Grabando',
        status_paused: 'En pausa',
        not_supported: 'El reconocimiento de voz no es compatible con este navegador.',
        playback: '▶ Reproduciendo...',
        audio_saved: '🎤 Grabación guardada',
        voice_used: 'Tu voz se usará con el vídeo',
    },
    [Language.FR]: {
        title: 'Préparer la Vidéo du Rêve',
        subtitle: 'Racontez votre rêve, corrigez le texte, puis passez au Studio Vidéo.',
        placeholder: 'Racontez votre rêve ou tapez-le ici.',
        label: 'Texte du rêve',
        start_mic: 'Démarrer le micro',
        pause: 'Pause',
        resume: 'Reprendre',
        continue_btn: 'Continuer vers le Studio',
        close_btn: 'Annuler',
        status_ready: 'Prêt',
        status_recording: 'Enregistrement',
        status_paused: 'En pause',
        not_supported: 'La reconnaissance vocale n\'est pas prise en charge dans ce navigateur.',
        playback: '▶ Lecture...',
        audio_saved: '🎤 Enregistrement sauvegardé',
        voice_used: 'Votre voix sera utilisée avec la vidéo',
    },
    [Language.AR]: {
        title: 'تحضير فيديو الحلم',
        subtitle: 'تحدّث عن حلمك، صحّح النص، ثم انتقل إلى الاستوديو.',
        placeholder: 'تحدّث عن حلمك أو اكتبه هنا.',
        label: 'نص الحلم',
        start_mic: 'تشغيل الميكروفون',
        pause: 'إيقاف مؤقت',
        resume: 'استئناف التسجيل',
        continue_btn: 'المتابعة إلى الاستوديو',
        close_btn: 'إلغاء',
        status_ready: 'جاهز',
        status_recording: 'جارٍ التسجيل',
        status_paused: 'متوقف',
        not_supported: 'التعرف على الكلام غير مدعوم في هذا المتصفح.',
        playback: '▶ جارٍ التشغيل...',
        audio_saved: '🎤 تم حفظ التسجيل',
        voice_used: 'سيتم استخدام صوتك مع الفيديو',
    },
    [Language.PT]: {
        title: 'Preparar Vídeo do Sonho',
        subtitle: 'Fale seu sonho, corrija o texto e continue para o Estúdio de Vídeo.',
        placeholder: 'Fale seu sonho ou digite aqui.',
        label: 'Texto do sonho',
        start_mic: 'Iniciar microfone',
        pause: 'Pausar',
        resume: 'Retomar gravação',
        continue_btn: 'Continuar para o Estúdio',
        close_btn: 'Cancelar',
        status_ready: 'Pronto',
        status_recording: 'Gravando',
        status_paused: 'Pausado',
        not_supported: 'Reconhecimento de voz não é suportado neste navegador.',
        playback: '▶ Reproduzindo...',
        audio_saved: '🎤 Gravação salva',
        voice_used: 'Sua voz será usada com o vídeo',
    },
    [Language.RU]: {
        title: 'Подготовить видео сна',
        subtitle: 'Расскажите свой сон, исправьте текст, затем перейдите в Видео-студию.',
        placeholder: 'Расскажите свой сон или введите текст здесь.',
        label: 'Текст сна',
        start_mic: 'Включить микрофон',
        pause: 'Пауза',
        resume: 'Продолжить запись',
        continue_btn: 'Перейти в Студию',
        close_btn: 'Отмена',
        status_ready: 'Готово',
        status_recording: 'Запись',
        status_paused: 'На паузе',
        not_supported: 'Распознавание речи не поддерживается в этом браузере.',
        playback: '▶ Воспроизведение...',
        audio_saved: '🎤 Запись сохранена',
        voice_used: 'Ваш голос будет использован в видео',
    },
    [Language.ZH]: {
        title: '准备梦境视频',
        subtitle: '讲述你的梦，修正文字，然后进入视频工作室。',
        placeholder: '讲述你的梦或在此输入文字。',
        label: '梦境文字',
        start_mic: '启动麦克风',
        pause: '暂停',
        resume: '继续录制',
        continue_btn: '继续到视频工作室',
        close_btn: '取消',
        status_ready: '准备就绪',
        status_recording: '正在录制',
        status_paused: '已暂停',
        not_supported: '此浏览器不支持语音识别。请手动输入文字。',
    },
    [Language.HI]: {
        title: 'स्वप्न वीडियो तैयार करें',
        subtitle: 'अपना सपना बोलें, टेक्स्ट सही करें, फिर वीडियो स्टूडियो में जाएं।',
        placeholder: 'अपना सपना बोलें या यहां टाइप करें।',
        label: 'स्वप्न टेक्स्ट',
        start_mic: 'माइक्रोफ़ोन शुरू करें',
        pause: 'रोकें',
        resume: 'रिकॉर्डिंग जारी रखें',
        continue_btn: 'वीडियो स्टूडियो में जाएं',
        close_btn: 'रद्द करें',
        status_ready: 'तैयार',
        status_recording: 'रिकॉर्डिंग',
        status_paused: 'रुका हुआ',
        not_supported: 'इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। कृपया टेक्स्ट मैन्युअली टाइप करें।',
    },
    [Language.JA]: {
        title: '夢動画を準備',
        subtitle: '夢を話し、テキストを修正して、ビデオスタジオへ進みましょう。',
        placeholder: '夢を話すか、ここにテキストを入力してください。',
        label: '夢のテキスト',
        start_mic: 'マイクを開始',
        pause: '一時停止',
        resume: '録音を再開',
        continue_btn: 'ビデオスタジオへ進む',
        close_btn: 'キャンセル',
        status_ready: '準備完了',
        status_recording: '録音中',
        status_paused: '一時停止中',
        not_supported: 'このブラウザでは音声認識がサポートされていません。テキストを手動で入力してください。',
    },
    [Language.KO]: {
        title: '꿈 영상 준비',
        subtitle: '꿈을 말하고, 텍스트를 수정한 다음 비디오 스튜디오로 이동하세요.',
        placeholder: '꿈을 말하거나 여기에 입력하세요.',
        label: '꿈 텍스트',
        start_mic: '마이크 시작',
        pause: '일시정지',
        resume: '녹음 재개',
        continue_btn: '비디오 스튜디오로 이동',
        close_btn: '취소',
        status_ready: '준비됨',
        status_recording: '녹음 중',
        status_paused: '일시정지됨',
        not_supported: '이 브라우저에서는 음성 인식이 지원되지 않습니다. 텍스트를 직접 입력해 주세요.',
    },
    [Language.ID]: {
        title: 'Siapkan Video Mimpi',
        subtitle: 'Ceritakan mimpimu, perbaiki teks, lalu lanjutkan ke Studio Video.',
        placeholder: 'Ceritakan mimpimu atau ketik di sini.',
        label: 'Teks mimpi',
        start_mic: 'Mulai mikrofon',
        pause: 'Jeda',
        resume: 'Lanjutkan rekaman',
        continue_btn: 'Lanjutkan ke Studio Video',
        close_btn: 'Batal',
        status_ready: 'Siap',
        status_recording: 'Merekam',
        status_paused: 'Dijeda',
        not_supported: 'Pengenalan suara tidak didukung di browser ini. Silakan ketik teks secara manual.',
    },
    [Language.FA]: {
        title: 'آماده‌سازی ویدیوی رویا',
        subtitle: 'رویای خود را بگویید، متن را تصحیح کنید، سپس به استودیو ویدیو بروید.',
        placeholder: 'رویای خود را بگویید یا اینجا تایپ کنید.',
        label: 'متن رویا',
        start_mic: 'شروع میکروفون',
        pause: 'توقف',
        resume: 'ادامه ضبط',
        continue_btn: 'ادامه به استودیو ویدیو',
        close_btn: 'لغو',
        status_ready: 'آماده',
        status_recording: 'در حال ضبط',
        status_paused: 'متوقف شده',
        not_supported: 'تشخیص گفتار در این مرورگر پشتیبانی نمی‌شود. لطفاً متن را دستی وارد کنید.',
    },
    [Language.IT]: {
        title: 'Prepara Video del Sogno',
        subtitle: 'Racconta il tuo sogno, correggi il testo, poi vai allo Studio Video.',
        placeholder: 'Racconta il tuo sogno o scrivilo qui.',
        label: 'Testo del sogno',
        start_mic: 'Avvia microfono',
        pause: 'Pausa',
        resume: 'Riprendi registrazione',
        continue_btn: 'Continua allo Studio',
        close_btn: 'Annulla',
        status_ready: 'Pronto',
        status_recording: 'Registrazione in corso',
        status_paused: 'In pausa',
        not_supported: 'Il riconoscimento vocale non è supportato in questo browser. Digita il testo manualmente.',
    },
    [Language.PL]: {
        title: 'Przygotuj Wideo ze Snu',
        subtitle: 'Opowiedz swój sen, popraw tekst, a potem przejdź do Studia Wideo.',
        placeholder: 'Opowiedz swój sen lub wpisz go tutaj.',
        label: 'Tekst snu',
        start_mic: 'Uruchom mikrofon',
        pause: 'Pauza',
        resume: 'Wznów nagrywanie',
        continue_btn: 'Przejdź do Studia',
        close_btn: 'Anuluj',
        status_ready: 'Gotowy',
        status_recording: 'Nagrywanie',
        status_paused: 'Wstrzymano',
        not_supported: 'Rozpoznawanie mowy nie jest obsługiwane w tej przeglądarce. Wpisz tekst ręcznie.',
    },
    [Language.BN]: {
        title: 'স্বপ্নের ভিডিও প্রস্তুত করুন',
        subtitle: 'আপনার স্বপ্ন বলুন, টেক্সট সংশোধন করুন, তারপর ভিডিও স্টুডিওতে যান।',
        placeholder: 'আপনার স্বপ্ন বলুন বা এখানে টাইপ করুন।',
        label: 'স্বপ্নের টেক্সট',
        start_mic: 'মাইক্রোফোন শুরু করুন',
        pause: 'বিরতি',
        resume: 'রেকর্ডিং চালিয়ে যান',
        continue_btn: 'ভিডিও স্টুডিওতে যান',
        close_btn: 'বাতিল',
        status_ready: 'প্রস্তুত',
        status_recording: 'রেকর্ডিং চলছে',
        status_paused: 'বিরতি দেওয়া হয়েছে',
        not_supported: 'এই ব্রাউজারে স্পিচ রিকগনিশন সমর্থিত নয়। দয়া করে টেক্সট ম্যানুয়ালি টাইপ করুন।',
    },
    [Language.UR]: {
        title: 'خواب ویڈیو تیار کریں',
        subtitle: 'اپنا خواب بیان کریں، متن درست کریں، پھر ویڈیو اسٹوڈیو میں جائیں۔',
        placeholder: 'اپنا خواب بیان کریں یا یہاں ٹائپ کریں۔',
        label: 'خواب کا متن',
        start_mic: 'مائیکروفون شروع کریں',
        pause: 'وقفہ',
        resume: 'ریکارڈنگ جاری رکھیں',
        continue_btn: 'ویڈیو اسٹوڈیو میں جائیں',
        close_btn: 'منسوخ',
        status_ready: 'تیار',
        status_recording: 'ریکارڈنگ جاری',
        status_paused: 'موقوف',
        not_supported: 'اس براؤزر میں اسپیچ ریکگنیشن معاونت نہیں ہے۔ براہ کرم متن دستی طور پر ٹائپ کریں۔',
    },
    [Language.VI]: {
        title: 'Chuẩn bị Video Giấc mơ',
        subtitle: 'Kể giấc mơ của bạn, sửa văn bản, rồi tiếp tục đến Phòng thu Video.',
        placeholder: 'Kể giấc mơ hoặc nhập văn bản tại đây.',
        label: 'Văn bản giấc mơ',
        start_mic: 'Bật micrô',
        pause: 'Tạm dừng',
        resume: 'Tiếp tục ghi',
        continue_btn: 'Tiếp tục đến Phòng thu',
        close_btn: 'Hủy',
        status_ready: 'Sẵn sàng',
        status_recording: 'Đang ghi',
        status_paused: 'Đã tạm dừng',
        not_supported: 'Trình duyệt này không hỗ trợ nhận dạng giọng nói. Vui lòng nhập văn bản thủ công.',
    },
    [Language.TH]: {
        title: 'เตรียมวิดีโอความฝัน',
        subtitle: 'เล่าความฝันของคุณ แก้ไขข้อความ แล้วไปยังสตูดิโอวิดีโอ',
        placeholder: 'เล่าความฝันของคุณหรือพิมพ์ที่นี่',
        label: 'ข้อความความฝัน',
        start_mic: 'เริ่มไมโครโฟน',
        pause: 'หยุดชั่วคราว',
        resume: 'บันทึกต่อ',
        continue_btn: 'ไปยังสตูดิโอวิดีโอ',
        close_btn: 'ยกเลิก',
        status_ready: 'พร้อม',
        status_recording: 'กำลังบันทึก',
        status_paused: 'หยุดชั่วคราว',
        not_supported: 'เบราว์เซอร์นี้ไม่รองรับการรู้จำเสียง กรุณาพิมพ์ข้อความด้วยตนเอง',
    },
    [Language.SW]: {
        title: 'Andaa Video ya Ndoto',
        subtitle: 'Eleza ndoto yako, sahihisha maandishi, kisha endelea kwenye Studio ya Video.',
        placeholder: 'Eleza ndoto yako au andika hapa.',
        label: 'Maandishi ya ndoto',
        start_mic: 'Anza maikrofoni',
        pause: 'Simamisha',
        resume: 'Endelea kurekodi',
        continue_btn: 'Endelea kwenye Studio',
        close_btn: 'Ghairi',
        status_ready: 'Tayari',
        status_recording: 'Inarekodi',
        status_paused: 'Imesimamishwa',
        not_supported: 'Utambuzi wa sauti hauaungi katika kivinjari hiki. Tafadhali andika maandishi kwa mkono.',
    },
    [Language.HU]: {
        title: 'Álomvideó előkészítése',
        subtitle: 'Meséld el az álmod, javítsd a szöveget, majd folytasd a Videóstúdióban.',
        placeholder: 'Meséld el az álmod vagy írd ide.',
        label: 'Álom szövege',
        start_mic: 'Mikrofon indítása',
        pause: 'Szünet',
        resume: 'Felvétel folytatása',
        continue_btn: 'Tovább a Stúdióba',
        close_btn: 'Mégse',
        status_ready: 'Kész',
        status_recording: 'Felvétel',
        status_paused: 'Szüneteltetve',
        not_supported: 'A hangfelismerés nem támogatott ebben a böngészőben. Kérjük, írja be a szöveget kézzel.',
    },
};

// ---------------------------------------------------------------------------
// Language code mapping
// ---------------------------------------------------------------------------

function getLangCode(language: Language): string {
    const map: Record<Language, string> = {
        [Language.DE]: 'de-DE',
        [Language.EN]: 'en-US',
        [Language.TR]: 'tr-TR',
        [Language.ES]: 'es-ES',
        [Language.FR]: 'fr-FR',
        [Language.AR]: 'ar-SA',
        [Language.PT]: 'pt-PT',
        [Language.RU]: 'ru-RU',
        [Language.ZH]: 'zh-CN',
        [Language.HI]: 'hi-IN',
        [Language.JA]: 'ja-JP',
        [Language.KO]: 'ko-KR',
        [Language.ID]: 'id-ID',
        [Language.FA]: 'fa-IR',
        [Language.IT]: 'it-IT',
        [Language.PL]: 'pl-PL',
        [Language.BN]: 'bn-BD',
        [Language.UR]: 'ur-PK',
        [Language.VI]: 'vi-VN',
        [Language.TH]: 'th-TH',
        [Language.SW]: 'sw-KE',
        [Language.HU]: 'hu-HU',
    };
    return map[language] || 'de-DE';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SpeechToVideoModal: React.FC<SpeechToVideoModalProps> = ({
    open,
    initialText,
    language,
    themeMode,
    onClose,
    onContinue,
}) => {
    const t = T[language] || T[Language.DE];
    const isLight = themeMode === ThemeMode.LIGHT;
    const isRtl = [Language.AR, Language.FA, Language.UR].includes(language);

    const [text, setText] = useState('');
    const [interimText, setInterimText] = useState('');
    const [status, setStatus] = useState<SpeechStatus>('idle');
    const [supported, setSupported] = useState(true);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);

    const recognitionRef = useRef<any>(null);
    const statusRef = useRef<SpeechStatus>('idle');
    const textRef = useRef('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const previewAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => { statusRef.current = status; }, [status]);

    // Reset when modal opens
    useEffect(() => {
        if (!open) return;
        const initial = initialText || '';
        setText(initial);
        textRef.current = initial;
        setInterimText('');
        setStatus('idle');
    }, [open, initialText]);

    const stopRecognition = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.onresult = null;
                recognitionRef.current.onend = null;
                recognitionRef.current.onerror = null;
                recognitionRef.current.stop();
            } catch { /* ignore */ }
            recognitionRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => stopRecognition, [stopRecognition]);

    // Build a fresh SpeechRecognition instance (continuous=false to avoid
    // Chrome's result-list duplication when restarting the same object).
    const buildRecognition = useCallback(() => {
        const Ctor = typeof window !== 'undefined'
            ? window.SpeechRecognition || window.webkitSpeechRecognition
            : null;

        if (!Ctor) { setSupported(false); return null; }

        const rec = new Ctor();
        rec.lang = getLangCode(language);
        rec.continuous = false;       // one utterance per session — no stale results
        rec.interimResults = true;

        rec.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                const t = event.results[i][0]?.transcript || '';
                if (event.results[i].isFinal) {
                    finalTranscript += t;
                } else {
                    interimTranscript += t;
                }
            }
            if (finalTranscript) {
                // Append final transcript synchronously
                const base = textRef.current.trim();
                const add = finalTranscript.trim();
                const newText = base ? `${base} ${add}` : add;
                textRef.current = newText;
                setText(newText);
                setInterimText('');
            } else {
                setInterimText(interimTranscript.trim());
            }
        };

        rec.onerror = (ev: any) => {
            // no-speech / aborted are harmless — let onend handle restart
            if (ev.error === 'no-speech' || ev.error === 'aborted') return;
            setStatus('idle');
            statusRef.current = 'idle';
            setInterimText('');
        };

        rec.onend = () => {
            setInterimText('');
            if (statusRef.current !== 'recording') return;
            // Auto-restart with a FRESH instance to guarantee clean results
            const fresh = buildRecognition();
            if (!fresh) { setStatus('idle'); statusRef.current = 'idle'; return; }
            recognitionRef.current = fresh;
            try { fresh.start(); } catch {
                setStatus('idle');
                statusRef.current = 'idle';
            }
        };

        return rec;
    }, [language]);

    // Start MediaRecorder for audio capture
    const startMediaRecorder = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            audioChunksRef.current = [];
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                stream.getTracks().forEach(t => t.stop());
            };
            mediaRecorderRef.current = recorder;
            recorder.start(250); // collect chunks every 250ms
        } catch (e) {
            console.warn('[AUDIO] MediaRecorder not available:', e);
            setStatus('idle');
            statusRef.current = 'idle';
        }
    }, []);

    const stopMediaRecorder = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
    }, []);

    const startRecording = useCallback(async () => {
        stopRecognition();
        setAudioBlob(null);
        setAudioUrl(null);
        const rec = buildRecognition();
        if (!rec) return;
        recognitionRef.current = rec;
        try {
            rec.start();
            await startMediaRecorder();
            setStatus('recording');
            statusRef.current = 'recording';
        } catch {
            setStatus('idle');
            statusRef.current = 'idle';
        }
    }, [buildRecognition, stopRecognition, startMediaRecorder]);

    const pauseRecording = useCallback(() => {
        setStatus('paused');
        statusRef.current = 'paused';
        setInterimText('');
        stopRecognition();
        stopMediaRecorder();
    }, [stopRecognition, stopMediaRecorder]);

    const resumeRecording = useCallback(() => {
        stopRecognition();
        const rec = buildRecognition();
        if (!rec) return;
        recognitionRef.current = rec;
        try {
            rec.start();
            startMediaRecorder();
            setStatus('recording');
            statusRef.current = 'recording';
        } catch {
            setStatus('idle');
            statusRef.current = 'idle';
        }
    }, [buildRecognition, stopRecognition, startMediaRecorder]);

    const handleContinue = useCallback(() => {
        setStatus('idle');
        statusRef.current = 'idle';
        setInterimText('');
        stopRecognition();
        stopMediaRecorder();
        // Wait briefly for mediarecorder to finalize blob
        setTimeout(() => {
            onContinue(text.trim(), audioBlob);
        }, 300);
    }, [onContinue, stopRecognition, stopMediaRecorder, text, audioBlob]);

    const handleClose = useCallback(() => {
        setStatus('idle');
        statusRef.current = 'idle';
        setInterimText('');
        stopRecognition();
        stopMediaRecorder();
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        onClose();
    }, [onClose, stopRecognition, stopMediaRecorder, audioUrl]);

    // Audio preview playback
    const togglePreview = useCallback(() => {
        if (!audioUrl) return;
        if (isPlayingPreview && previewAudioRef.current) {
            previewAudioRef.current.pause();
            setIsPlayingPreview(false);
        } else {
            const audio = new Audio(audioUrl);
            previewAudioRef.current = audio;
            audio.onended = () => setIsPlayingPreview(false);
            audio.play().catch(() => {});
            setIsPlayingPreview(true);
        }
    }, [audioUrl, isPlayingPreview]);

    if (!open) return null;

    // --- Styles matching project theme ---
    const overlayBg = 'bg-black/50 backdrop-blur-sm';
    const modalBg = isLight
        ? 'bg-white/95 backdrop-blur-md border border-indigo-200/60'
        : 'bg-dream-surface/95 backdrop-blur-md border border-white/10';
    const textPrimary = isLight ? 'text-gray-900' : 'text-white';
    const textSecondary = isLight ? 'text-gray-500' : 'text-white/50';
    const sectionLabel = isLight ? 'text-indigo-600' : 'text-fuchsia-400';
    const inputBg = isLight
        ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
        : 'bg-white/5 border-white/10 text-white placeholder-white/30';
    const accentGradient = isLight
        ? 'bg-gradient-to-r from-indigo-500 to-violet-500'
        : 'bg-gradient-to-r from-fuchsia-600 to-violet-600';

    const displayText = interimText ? `${text} ${interimText}`.trim() : text;

    return (
        <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 ${overlayBg}`}>
            <div
                className={`w-full max-w-2xl rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${modalBg}`}
                dir={isRtl ? 'rtl' : 'ltr'}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                        <h2 className={`text-xl font-bold ${textPrimary}`}>{t.title}</h2>
                        <p className={`text-sm ${textSecondary}`}>{t.subtitle}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className={`min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center transition-colors ${
                            isLight ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-white/10 text-white/50'
                        }`}
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Textarea */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className={`material-icons text-base ${sectionLabel}`}>description</span>
                        <span className={`text-xs uppercase tracking-widest font-semibold ${sectionLabel}`}>
                            {t.label}
                        </span>
                    </div>
                    <textarea
                        value={displayText}
                        onChange={(e) => { setText(e.target.value); setInterimText(''); }}
                        placeholder={t.placeholder}
                        className={`w-full min-h-[220px] max-h-[360px] resize-none overflow-y-auto rounded-2xl border p-4 outline-none text-base leading-relaxed font-serif ${inputBg}`}
                    />
                </div>

                {/* Browser not supported */}
                {!supported && (
                    <div className={`rounded-2xl px-4 py-3 text-sm ${
                        isLight ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-red-900/20 border border-red-500/30 text-red-400'
                    }`}>
                        {t.not_supported}
                    </div>
                )}

                {/* Status indicator */}
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                        status === 'recording' ? 'bg-red-500 animate-pulse' :
                        status === 'paused' ? 'bg-amber-500' :
                        isLight ? 'bg-gray-300' : 'bg-white/20'
                    }`} />
                    <span className={`text-sm font-medium ${textSecondary}`}>
                        {status === 'idle' && t.status_ready}
                        {status === 'recording' && t.status_recording}
                        {status === 'paused' && t.status_paused}
                    </span>
                    {text.length > 0 && (
                        <span className={`text-xs ml-auto font-mono ${isLight ? 'text-gray-400' : 'text-white/30'}`}>
                            {text.length} chars
                        </span>
                    )}
                </div>

                {/* Audio Preview (after recording) */}
                {audioUrl && status !== 'recording' && (
                    <div className={`rounded-2xl border p-3 flex items-center gap-3 ${
                        isLight ? 'bg-violet-50 border-violet-200' : 'bg-violet-900/20 border-violet-500/30'
                    }`}>
                        <button
                            onClick={togglePreview}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                isLight
                                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                                    : 'bg-violet-600 text-white hover:bg-violet-500'
                            }`}
                        >
                            <span className="material-icons text-lg">{isPlayingPreview ? 'pause' : 'play_arrow'}</span>
                        </button>
                        <div className="flex-1">
                            <p className={`text-xs font-bold ${isLight ? 'text-violet-700' : 'text-violet-300'}`}>
                                {isPlayingPreview ? t.playback : t.audio_saved}
                            </p>
                            <p className={`text-[10px] ${isLight ? 'text-violet-500' : 'text-violet-400/60'}`}>
                                {t.voice_used}
                            </p>
                        </div>
                        <button
                            onClick={() => { setAudioBlob(null); setAudioUrl(null); }}
                            className={`text-xs px-2 py-1 rounded-lg ${
                                isLight ? 'text-red-600 hover:bg-red-50' : 'text-red-400 hover:bg-red-900/20'
                            }`}
                        >
                            Neu aufnehmen
                        </button>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                    {status === 'idle' && supported && (
                        <button
                            onClick={startRecording}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold min-h-[44px] transition-all border ${
                                isLight
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                            }`}
                        >
                            <span className="material-icons text-base">mic</span>
                            {t.start_mic}
                        </button>
                    )}

                    {status === 'recording' && (
                        <button
                            onClick={pauseRecording}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold min-h-[44px] transition-all border ${
                                isLight
                                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                                    : 'bg-amber-900/20 border-amber-500/40 text-amber-400'
                            }`}
                        >
                            <span className="material-icons text-base">pause</span>
                            {t.pause}
                        </button>
                    )}

                    {status === 'paused' && supported && (
                        <button
                            onClick={resumeRecording}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold min-h-[44px] transition-all border ${
                                isLight
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                            }`}
                        >
                            <span className="material-icons text-base">mic</span>
                            {t.resume}
                        </button>
                    )}

                    <button
                        onClick={handleContinue}
                        disabled={!text.trim()}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold min-h-[44px] transition-all ml-auto ${
                            text.trim()
                                ? `${accentGradient} text-white shadow-lg hover:opacity-90 active:scale-[0.98]`
                                : isLight ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                    >
                        <span className="material-icons text-base">arrow_forward</span>
                        {t.continue_btn}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpeechToVideoModal;
