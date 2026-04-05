import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Language, ReligiousCategory, ReligiousSource, ThemeMode } from '../types';
import VoiceSelector, { VoiceCharacter, VOICE_CHARACTERS } from './VoiceSelector';
import { getTheme } from '../theme';

interface LiveSessionProps {
    onClose: () => void;
    onSaveSession: (transcript: string, audioData?: string) => void;
    language: Language;
    voiceName: string;
    selectedCategories: ReligiousCategory[];
    selectedSources: ReligiousSource[];
    themeMode?: ThemeMode;
}

const liveTranslations: Record<Language, {
    ready: string; start: string; connecting: string; listening: string;
    error: string; instruction: string; disconnect: string;
    session_ended: string; save_btn: string; discard_btn: string;
    thinking: string; speaking: string;
}> = {
    [Language.EN]: {
        ready: "Ready to Connect", start: "Start Session", connecting: "Connecting to Oracle...",
        listening: "Oracle is Listening", error: "Connection Lost / Error",
        instruction: "Speak your dream freely. The oracle will listen and respond with voice.",
        disconnect: "End Session", session_ended: "Session Ended",
        save_btn: "Analyze & Save Dream", discard_btn: "Discard",
        thinking: "Oracle is thinking...", speaking: "Oracle is speaking..."
    },
    [Language.DE]: {
        ready: "Bereit zur Verbindung", start: "Sitzung starten", connecting: "Verbindung zum Orakel...",
        listening: "Das Orakel hoert zu", error: "Verbindung verloren / Fehler",
        instruction: "Erzaehle deinen Traum frei. Das Orakel wird zuhoeren und antworten.",
        disconnect: "Sitzung beenden", session_ended: "Sitzung beendet",
        save_btn: "Traum analysieren & speichern", discard_btn: "Verwerfen",
        thinking: "Das Orakel denkt nach...", speaking: "Das Orakel spricht..."
    },
    [Language.TR]: {
        ready: "Bağlanmaya Hazır", start: "Oturumu Başlat", connecting: "Kahine Bağlanıyor...",
        listening: "Kahin Dinliyor", error: "Bağlantı Koptu / Hata",
        instruction: "Rüyanı rahatça anlat. Kahin seni dinleyecek ve sesle yanıt verecek.",
        disconnect: "Oturumu Bitir", session_ended: "Oturum Sona Erdi",
        save_btn: "Analiz Et ve Kaydet", discard_btn: "Vazgeç",
        thinking: "Kahin düşünüyor...", speaking: "Kahin konuşuyor..."
    },
    [Language.ES]: {
        ready: "Listo para Conectar", start: "Iniciar Sesion", connecting: "Conectando al Oraculo...",
        listening: "El Oraculo Escucha", error: "Conexion Perdida / Error",
        instruction: "Habla tu sueno libremente. El oraculo escuchara y respondera con voz.",
        disconnect: "Finalizar Sesion", session_ended: "Sesion Finalizada",
        save_btn: "Analizar y Guardar", discard_btn: "Descartar",
        thinking: "El oraculo piensa...", speaking: "El oraculo habla..."
    },
    [Language.FR]: {
        ready: "Pret a Se Connecter", start: "Demarrer la Session", connecting: "Connexion a l'Oracle...",
        listening: "L'Oracle Ecoute", error: "Connexion Perdue / Erreur",
        instruction: "Parlez librement de votre reve. L'oracle ecoutera et repondra par la voix.",
        disconnect: "Terminer la Session", session_ended: "Session Terminee",
        save_btn: "Analyser et Sauvegarder", discard_btn: "Annuler",
        thinking: "L'oracle reflechit...", speaking: "L'oracle parle..."
    },
    [Language.AR]: {
        ready: "جاهز للاتصال", start: "بدء الجلسة", connecting: "جارٍ الاتصال بالكاهن...",
        listening: "الكاهن يستمع", error: "انقطع الاتصال / خطأ",
        instruction: "تحدث عن حلمك بحرية. سيستمع الكاهن ويجيب بالصوت.",
        disconnect: "إنهاء الجلسة", session_ended: "انتهت الجلسة",
        save_btn: "تحليل وحفظ الحلم", discard_btn: "تجاهل",
        thinking: "الكاهن يفكر...", speaking: "الكاهن يتحدث..."
    },
    [Language.PT]: {
        ready: "Pronto para Conectar", start: "Iniciar Sessao", connecting: "Conectando ao Oraculo...",
        listening: "O Oraculo Esta Ouvindo", error: "Conexao Perdida / Erro",
        instruction: "Fale livremente sobre seu sonho. O oraculo ouvira e respondera com voz.",
        disconnect: "Encerrar Sessao", session_ended: "Sessao Encerrada",
        save_btn: "Analisar e Salvar Sonho", discard_btn: "Descartar",
        thinking: "O oraculo pensa...", speaking: "O oraculo fala..."
    },
    [Language.RU]: {
        ready: "Gotov k Podklyucheniyu", start: "Nachat Sessiyu", connecting: "Podklyucheniye k Orakulu...",
        listening: "Orakul Slushayet", error: "Soedineniye Poteryano / Oshibka",
        instruction: "Svobodno rasskazhite svoy son. Orakul vyslushayet i otvetit golosom.",
        disconnect: "Zavershit Sessiyu", session_ended: "Sessiya Zavershena",
        save_btn: "Proanalizirovat i Sokhranit", discard_btn: "Otmenit",
        thinking: "Orakul dumayet...", speaking: "Orakul govorit..."
    },
    [Language.ZH]: {
        ready: "准备连接", start: "开始会话", connecting: "正在连接神谕...",
        listening: "神谕正在聆听", error: "连接丢失 / 错误",
        instruction: "自由讲述你的梦境。神谕会聆听并用语音回应。",
        disconnect: "结束会话", session_ended: "会话已结束",
        save_btn: "分析并保存梦境", discard_btn: "丢弃",
        thinking: "神谕正在思考...", speaking: "神谕正在说话..."
    },
    [Language.HI]: {
        ready: "कनेक्ट करने को तैयार", start: "सत्र शुरू करें", connecting: "ओरेकल से कनेक्ट हो रहा है...",
        listening: "ओरेकल सुन रहा है", error: "कनेक्शन टूट गया / त्रुटि",
        instruction: "अपना सपना स्वतंत्र रूप से बताएं। ओरेकल सुनेगा और आवाज़ से जवाब देगा।",
        disconnect: "सत्र समाप्त करें", session_ended: "सत्र समाप्त हुआ",
        save_btn: "विश्लेषण करें और सहेजें", discard_btn: "हटाएं",
        thinking: "ओरेकल सोच रहा है...", speaking: "ओरेकल बोल रहा है..."
    },
    [Language.JA]: {
        ready: "接続準備完了", start: "セッション開始", connecting: "オラクルに接続中...",
        listening: "オラクルが聞いています", error: "接続が切れました / エラー",
        instruction: "自由に夢を語ってください。オラクルが聞いて音声で答えます。",
        disconnect: "セッション終了", session_ended: "セッションが終了しました",
        save_btn: "分析して保存", discard_btn: "破棄",
        thinking: "オラクルが考えています...", speaking: "オラクルが話しています..."
    },
    [Language.KO]: {
        ready: "연결 준비 완료", start: "세션 시작", connecting: "오라클에 연결 중...",
        listening: "오라클이 듣고 있습니다", error: "연결 끊김 / 오류",
        instruction: "자유롭게 꿈을 말해 주세요. 오라클이 듣고 음성으로 답합니다.",
        disconnect: "세션 종료", session_ended: "세션이 종료되었습니다",
        save_btn: "분석 및 저장", discard_btn: "삭제",
        thinking: "오라클이 생각 중...", speaking: "오라클이 말하고 있습니다..."
    },
    [Language.ID]: {
        ready: "Siap Terhubung", start: "Mulai Sesi", connecting: "Menghubungkan ke Oracle...",
        listening: "Oracle Mendengarkan", error: "Koneksi Terputus / Error",
        instruction: "Ceritakan mimpimu dengan bebas. Oracle akan mendengarkan dan menjawab dengan suara.",
        disconnect: "Akhiri Sesi", session_ended: "Sesi Berakhir",
        save_btn: "Analisis & Simpan Mimpi", discard_btn: "Buang",
        thinking: "Oracle sedang berpikir...", speaking: "Oracle sedang berbicara..."
    },
    [Language.FA]: {
        ready: "آماده اتصال", start: "شروع جلسه", connecting: "در حال اتصال به اوراکل...",
        listening: "اوراکل گوش می‌دهد", error: "اتصال قطع شد / خطا",
        instruction: "خواب خود را آزادانه بیان کنید. اوراکل گوش می‌دهد و با صدا پاسخ می‌دهد.",
        disconnect: "پایان جلسه", session_ended: "جلسه پایان یافت",
        save_btn: "تحلیل و ذخیره خواب", discard_btn: "حذف",
        thinking: "اوراکل در حال تفکر...", speaking: "اوراکل در حال صحبت..."
    },
    [Language.IT]: {
        ready: "Pronto a Connettersi", start: "Avvia Sessione", connecting: "Connessione all'Oracolo...",
        listening: "L'Oracolo Ascolta", error: "Connessione Persa / Errore",
        instruction: "Racconta il tuo sogno liberamente. L'oracolo ascolterà e risponderà con la voce.",
        disconnect: "Termina Sessione", session_ended: "Sessione Terminata",
        save_btn: "Analizza e Salva Sogno", discard_btn: "Scarta",
        thinking: "L'oracolo sta pensando...", speaking: "L'oracolo sta parlando..."
    },
    [Language.PL]: {
        ready: "Gotowy do Połączenia", start: "Rozpocznij Sesję", connecting: "Łączenie z Wyrocznią...",
        listening: "Wyrocznia Słucha", error: "Połączenie Utracone / Błąd",
        instruction: "Opowiedz swój sen swobodnie. Wyrocznia wysłucha i odpowie głosem.",
        disconnect: "Zakończ Sesję", session_ended: "Sesja Zakończona",
        save_btn: "Analizuj i Zapisz Sen", discard_btn: "Odrzuć",
        thinking: "Wyrocznia myśli...", speaking: "Wyrocznia mówi..."
    },
    [Language.BN]: {
        ready: "সংযুক্ত হতে প্রস্তুত", start: "সেশন শুরু করুন", connecting: "ওরাকলের সাথে সংযোগ হচ্ছে...",
        listening: "ওরাকল শুনছে", error: "সংযোগ বিচ্ছিন্ন / ত্রুটি",
        instruction: "আপনার স্বপ্ন স্বাধীনভাবে বলুন। ওরাকল শুনবে এবং কণ্ঠে উত্তর দেবে।",
        disconnect: "সেশন শেষ করুন", session_ended: "সেশন শেষ হয়েছে",
        save_btn: "বিশ্লেষণ করুন ও সংরক্ষণ করুন", discard_btn: "বাতিল",
        thinking: "ওরাকল ভাবছে...", speaking: "ওরাকল বলছে..."
    },
    [Language.UR]: {
        ready: "جڑنے کے لیے تیار", start: "سیشن شروع کریں", connecting: "اوریکل سے جڑ رہا ہے...",
        listening: "اوریکل سن رہا ہے", error: "کنکشن ٹوٹ گیا / خرابی",
        instruction: "اپنا خواب آزادی سے بیان کریں۔ اوریکل سنے گا اور آواز سے جواب دے گا۔",
        disconnect: "سیشن ختم کریں", session_ended: "سیشن ختم ہوا",
        save_btn: "تجزیہ کریں اور محفوظ کریں", discard_btn: "رد کریں",
        thinking: "اوریکل سوچ رہا ہے...", speaking: "اوریکل بول رہا ہے..."
    },
    [Language.VI]: {
        ready: "Sẵn sàng Kết nối", start: "Bắt đầu Phiên", connecting: "Đang kết nối với Nhà tiên tri...",
        listening: "Nhà tiên tri đang Lắng nghe", error: "Mất kết nối / Lỗi",
        instruction: "Hãy kể giấc mơ của bạn tự do. Nhà tiên tri sẽ lắng nghe và trả lời bằng giọng nói.",
        disconnect: "Kết thúc Phiên", session_ended: "Phiên đã Kết thúc",
        save_btn: "Phân tích & Lưu Giấc mơ", discard_btn: "Hủy bỏ",
        thinking: "Nhà tiên tri đang suy nghĩ...", speaking: "Nhà tiên tri đang nói..."
    },
    [Language.TH]: {
        ready: "พร้อมเชื่อมต่อ", start: "เริ่มเซสชัน", connecting: "กำลังเชื่อมต่อกับนักพยากรณ์...",
        listening: "นักพยากรณ์กำลังฟัง", error: "การเชื่อมต่อขาด / ข้อผิดพลาด",
        instruction: "เล่าความฝันของคุณอย่างอิสระ นักพยากรณ์จะฟังและตอบด้วยเสียง",
        disconnect: "จบเซสชัน", session_ended: "เซสชันสิ้นสุดแล้ว",
        save_btn: "วิเคราะห์และบันทึกความฝัน", discard_btn: "ทิ้ง",
        thinking: "นักพยากรณ์กำลังคิด...", speaking: "นักพยากรณ์กำลังพูด..."
    },
    [Language.SW]: {
        ready: "Tayari Kuunganisha", start: "Anza Kipindi", connecting: "Inaunganisha na Oracle...",
        listening: "Oracle Inasikiliza", error: "Muunganisho Umepotea / Kosa",
        instruction: "Eleza ndoto yako kwa uhuru. Oracle itasikiliza na kujibu kwa sauti.",
        disconnect: "Maliza Kipindi", session_ended: "Kipindi Kimemalizika",
        save_btn: "Changanua na Hifadhi Ndoto", discard_btn: "Tupa",
        thinking: "Oracle inafikiria...", speaking: "Oracle inazungumza..."
    },
    [Language.HU]: {
        ready: "Csatlakozásra kész", start: "Munkamenet indítása", connecting: "Csatlakozás az Orákulumhoz...",
        listening: "Az Orákulum hallgat", error: "Kapcsolat megszakadt / Hiba",
        instruction: "Meséld el szabadon az álmod. Az Orákulum hallgat és hangban válaszol.",
        disconnect: "Munkamenet befejezése", session_ended: "A munkamenet véget ért",
        save_btn: "Elemzés és álom mentése", discard_btn: "Elvetés",
        thinking: "Az Orákulum gondolkodik...", speaking: "Az Orákulum beszél..."
    }
};

const DEEPGRAM_LANG: Record<string, string> = {
    de: 'de', tr: 'tr', en: 'en', es: 'es', fr: 'fr', ar: 'ar', pt: 'pt-BR', ru: 'ru',
};

const VOICE_STORAGE_KEY = 'dreamcode_selected_voice';
const VOICE_ONBOARDED_KEY = 'dreamcode_voice_onboarded';

const getStoredVoice = (): VoiceCharacter | null => {
    try {
        const saved = localStorage.getItem(VOICE_STORAGE_KEY);
        if (!saved) return null;
        const parsed = JSON.parse(saved);
        return VOICE_CHARACTERS.find(v => v.id === parsed.id) || null;
    } catch { return null; }
};

const isVoiceOnboarded = (): boolean => {
    return localStorage.getItem(VOICE_ONBOARDED_KEY) === 'true';
};

const saveVoice = (character: VoiceCharacter) => {
    localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify({ id: character.id }));
    localStorage.setItem(VOICE_ONBOARDED_KEY, 'true');
};

// Fallback silence timer (only for post-interrupt / queued speech)
const SILENCE_FALLBACK_MS = 2000;

const LiveSession: React.FC<LiveSessionProps> = ({
    onClose, onSaveSession, language, voiceName, selectedCategories, selectedSources, themeMode
}) => {
    const th = getTheme(themeMode || ThemeMode.DARK);
    const [status, setStatus] = useState<'idle' | 'voiceSelect' | 'connecting' | 'connected' | 'thinking' | 'speaking' | 'ended' | 'error'>('idle');
    const [sessionTranscript, setSessionTranscript] = useState('');
    const [currentUserText, setCurrentUserText] = useState('');
    const [currentOracleText, setCurrentOracleText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState<VoiceCharacter | null>(getStoredVoice);
    const [debugInfo, setDebugInfo] = useState('init');

    // Core audio refs
    const wsRef = useRef<WebSocket | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const playbackContextRef = useRef<AudioContext | null>(null);
    const mediaSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    // State refs
    const isConnectingRef = useRef(false);
    const chatHistoryRef = useRef<Array<{ role: string; content: string }>>([]);
    const sessionLanguageRef = useRef(language);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const currentTranscriptRef = useRef('');
    const roundRef = useRef(0);
    const statusRef = useRef(status);

    // KEY: Phone-call behavior refs
    const isMutedRef = useRef(false);           // Controls audio sending to Deepgram
    const currentSourceRef = useRef<AudioBufferSourceNode | null>(null); // For interrupt
    const isPlayingRef = useRef(false);          // Oracle audio currently playing
    const selectedVoiceRef = useRef(selectedVoice);
    const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null); // Deepgram KeepAlive
    const isProcessingRef = useRef(false); // Guard against concurrent processUserInput calls
    const wasInterruptedRef = useRef(false); // Skip onended delay when user interrupted
    const queuedSpeechRef = useRef('');      // Captures user speech DURING oracle thinking/speaking
    const patienceUsedRef = useRef(false);   // Patience mode only once per accumulation

    // Visualizer refs
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const visualizerCircleRef = useRef<HTMLDivElement>(null);

    const t = liveTranslations[language] || liveTranslations[Language.DE];

    // Keep refs synced
    useEffect(() => { statusRef.current = status; }, [status]);
    useEffect(() => { selectedVoiceRef.current = selectedVoice; }, [selectedVoice]);

    // ── Cleanup ──────────────────────────────────────────────────────────
    const cleanup = useCallback(() => {
        isConnectingRef.current = false;
        isMutedRef.current = false;
        isPlayingRef.current = false;
        queuedSpeechRef.current = '';
        if (keepAliveRef.current) { clearInterval(keepAliveRef.current); keepAliveRef.current = null; }
        if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
        if (animationFrameRef.current) { cancelAnimationFrame(animationFrameRef.current); animationFrameRef.current = null; }
        if (currentSourceRef.current) { try { currentSourceRef.current.stop(); } catch (_) {} currentSourceRef.current = null; }
        if (wsRef.current) { try { wsRef.current.close(); } catch (_) {} wsRef.current = null; }
        if (processorRef.current) { try { processorRef.current.disconnect(); } catch (_) {} processorRef.current = null; }
        if (mediaSourceRef.current) { try { mediaSourceRef.current.disconnect(); } catch (_) {} mediaSourceRef.current = null; }
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        if (audioContextRef.current?.state !== 'closed') { audioContextRef.current?.close().catch(() => {}); }
        if (playbackContextRef.current?.state !== 'closed') { playbackContextRef.current?.close().catch(() => {}); }
    }, []);

    useEffect(() => () => { cleanup(); }, [cleanup]);

    // ── Visualizer ───────────────────────────────────────────────────────
    const startVisualizer = useCallback(() => {
        if (!analyserRef.current) return;
        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const animate = () => {
            if (!analyserRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
            const scale = 1 + (average / 255) * 0.5;
            const glow = (average / 255) * 60;
            if (visualizerCircleRef.current) {
                visualizerCircleRef.current.style.transform = `scale(${scale})`;
                visualizerCircleRef.current.style.boxShadow = `0 0 ${glow + 20}px rgba(192,38,211,${0.4 + (average / 255)})`;
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animate();
    }, []);

    // ── Interrupt oracle (fallback for manual tap on orb) ────────────────
    const interruptOracle = useCallback(() => {
        if (!isPlayingRef.current && !currentSourceRef.current) return;
        console.log('[LiveSession] Manual interrupt (tap)');
        wasInterruptedRef.current = true;
        if (currentSourceRef.current) {
            try { currentSourceRef.current.stop(); } catch (_) {}
            currentSourceRef.current = null;
        }
        isPlayingRef.current = false;
        isProcessingRef.current = false;
        isMutedRef.current = false;
        setStatus('connected');
        setCurrentOracleText('');
        setCurrentUserText('');
        currentTranscriptRef.current = '';
    }, []);

    // ── Process user input → LLM → TTS → Playback ──────────────────────
    const processUserInput = useCallback(async (userText: string) => {
        if (!userText.trim() || isProcessingRef.current) {
            console.log('[LiveSession] Skipped:', !userText.trim() ? 'empty' : 'already processing');
            return;
        }
        isProcessingRef.current = true;
        patienceUsedRef.current = false;
        const lang = sessionLanguageRef.current;
        roundRef.current += 1;
        const round = roundRef.current;
        console.log(`[LiveSession] Round ${round}: "${userText.substring(0, 60)}"`);

        // Mute mic (boolean flag – processor stays connected!)
        isMutedRef.current = true;
        // No KeepAlive needed – processor always sends audio to Deepgram

        setCurrentUserText(userText);
        setSessionTranscript(prev => prev + `\n[User]: ${userText}`);
        setStatus('thinking');

        chatHistoryRef.current.push({ role: 'user', content: userText });

        const categoriesStr = selectedCategories.length > 0 ? selectedCategories.join(', ') : 'General';
        const sourcesStr = selectedSources.length > 0 ? selectedSources.join(', ') : 'General sources';

        const LANG_NAMES: Record<string, string> = {
            de: 'Deutsch', tr: 'Tuerkisch', en: 'English', es: 'Spanisch',
            fr: 'Franzoesisch', ar: 'Arabisch', pt: 'Portugiesisch', ru: 'Russisch',
        };
        const langName = LANG_NAMES[lang] || 'Deutsch';

        // Category/source knowledge for the oracle (English for LLM clarity)
        const CATEGORY_INFO = `AVAILABLE INTERPRETATION CATEGORIES:
1. Islamic – Dream interpretation in Islamic tradition (Sources: Ibn Sirin, Nabulsi, Al-Iskhafi)
2. Christian – Biblical and church-based interpretation (Sources: Medieval, Modern Theology, Church Fathers)
3. Buddhist – Meditation and consciousness (Sources: Zen, Tibetan, Theravada)
4. Psychological – Scientific dream analysis (Sources: Freud, Jung, Gestalt)
5. Astrology – Zodiac and cosmic influences (Sources: Western Zodiac, Vedic Astrology, Chinese Zodiac)
6. Numerology – Meaning of numbers in dreams (Sources: Pythagorean, Chaldean, Kabbalah, Islamic, Vedic)
NOTE: Present these category names in ${langName} to the user.`;

        // Phase instructions in English (LLM translates to target language)
        let phaseInstruction = '';
        if (round === 1) {
            phaseInstruction = `GREETING: Greet the user warmly and mystically IN ${langName}. Say you are the Dream Code Oracle and ask them to share their dream. Say the equivalent of "Tell me everything, take your time, I'm listening." (2 sentences max). RESPOND IN ${langName} ONLY.`;
        } else if (round === 2) {
            phaseInstruction = `LISTENING: The user is telling their dream. Say only a brief acknowledgment like "I understand..." and ask "Would you like to tell more, or is that everything?" DO NOT ask detail questions yet. Wait until the user says they are done. (1-2 sentences max). RESPOND IN ${langName} ONLY.`;
        } else if (round <= 4) {
            phaseInstruction = `DETAIL QUESTIONS: Now ask targeted follow-up questions about dream details:
- Colors, water (clean/dirty), numbers, feelings, people, animals, symbols, places.
Ask 2 questions per response. DO NOT give interpretation yet. RESPOND IN ${langName} ONLY.`;
        } else if (round === 5) {
            phaseInstruction = `CATEGORY CHOICE: Say the equivalent of "I have a good picture. How would you like your dream interpreted?"
List: Islamic, Christian, Buddhist, Psychological, Astrology, Numerology.
Briefly explain differences if asked. User can choose multiple. RESPOND IN ${langName} ONLY.`;
        } else {
            phaseInstruction = `DREAM INTERPRETATION: Give the full interpretation based on:
Categories: ${categoriesStr}, Traditions: ${sourcesStr}.
Reference the specific details the user mentioned.
Be wise and profound. End with a message/insight.
IMPORTANT: At the end say the equivalent of "Your dream will be automatically saved in your profile and dream calendar when you end the session." RESPOND IN ${langName} ONLY.`;
        }

        const systemPrompt = `You are the Dream Code Oracle – a wise, empathetic dream interpreter.
LANGUAGE: You MUST respond EXCLUSIVELY in ${langName}. EVERY word must be in ${langName}. NEVER use any other language. This is the #1 rule.
STYLE: This is a spoken dialog like a phone call. Keep answers short and natural (max 3 sentences per response).
ADDRESS: Never say "my son", "my child" or similar. Address the user respectfully with the informal "you" form in ${langName}.

${phaseInstruction}

${CATEGORY_INFO}`;

        try {
            const chatRes = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: chatHistoryRef.current,
                    language: lang,
                    systemPrompt,
                }),
            });

            if (!chatRes.ok) throw new Error(`Chat API error: ${chatRes.status}`);
            const chatData = await chatRes.json();
            const reply = chatData.reply || '';

            chatHistoryRef.current.push({ role: 'assistant', content: reply });
            setCurrentOracleText(reply);
            setSessionTranscript(prev => prev + `\n[Oracle]: ${reply}`);
            setStatus('speaking');

            // TTS: Direct Google Cloud from browser (fastest) → Vercel endpoint fallback
            const voiceSuffix = selectedVoiceRef.current?.voiceSuffix || 'Achernar';
            let audioBuffer: ArrayBuffer | null = null;

            const LANG_CODES: Record<string, string> = {
                de: 'de-DE', tr: 'tr-TR', ar: 'ar-XA', es: 'es-ES',
                fr: 'fr-FR', pt: 'pt-BR', ru: 'ru-RU', en: 'en-US',
            };
            const langCode = LANG_CODES[lang] || 'de-DE';
            const gcVoice = `${langCode}-Chirp3-HD-${voiceSuffix}`;
            const gcKey = (import.meta.env.VITE_GOOGLE_CLOUD_TTS_KEY as string || '').trim();

            let ttsOk = false;
            if (gcKey) {
                try {
                    const t0 = Date.now();
                    const directRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${gcKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            input: { text: reply },
                            voice: { languageCode: langCode, name: gcVoice },
                            audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: 24000 },
                        }),
                    });
                    if (directRes.ok) {
                        const data = await directRes.json();
                        if (data.audioContent) {
                            const binaryStr = atob(data.audioContent);
                            const bytes = new Uint8Array(binaryStr.length);
                            for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
                            audioBuffer = bytes.buffer;
                            ttsOk = true;
                            console.log(`[LiveSession] Direct TTS: ${Date.now() - t0}ms, voice=${gcVoice}`);
                        }
                    } else {
                        console.warn(`[LiveSession] Direct TTS failed (${directRes.status}), trying fallback...`);
                    }
                } catch (e) {
                    console.warn('[LiveSession] Direct TTS error, trying fallback...', e);
                }
            }

            // Fallback: Vercel serverless /api/tts
            if (!ttsOk) {
                const ttsRes = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: reply, language: lang, voiceSuffix }),
                });
                if (!ttsRes.ok) throw new Error(`TTS API error: ${ttsRes.status}`);
                const ct = ttsRes.headers.get('content-type') || '';
                if (!ct.includes('audio')) throw new Error(`TTS non-audio: ${ct}`);
                audioBuffer = await ttsRes.arrayBuffer();
            }

            if (!audioBuffer || audioBuffer.byteLength < 100) {
                throw new Error(`TTS empty audio: ${audioBuffer?.byteLength} bytes`);
            }

            // Play audio
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
                playbackContextRef.current = new AudioCtx({ sampleRate: 24000 });
            }
            let ctx = playbackContextRef.current;
            await ctx.resume();

            // Stop previous audio before starting new one (prevents echo)
            if (currentSourceRef.current) {
                wasInterruptedRef.current = true;
                try { currentSourceRef.current.stop(); } catch (_) {}
                currentSourceRef.current = null;
            }

            // decodeAudioData can fail if AudioContext is in bad state - recover
            let decoded;
            try {
                decoded = await ctx.decodeAudioData(audioBuffer);
            } catch (decodeErr) {
                console.warn('[LiveSession] decodeAudioData failed, recreating context:', decodeErr);
                playbackContextRef.current = new AudioCtx({ sampleRate: 24000 });
                ctx = playbackContextRef.current;
                await ctx.resume();
                // arrayBuffer is consumed after first decode attempt, re-fetch TTS
                const retryRes = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: reply, language: lang, voiceSuffix }),
                });
                if (!retryRes.ok) throw new Error('TTS retry failed');
                const retryBuffer = await retryRes.arrayBuffer();
                decoded = await ctx.decodeAudioData(retryBuffer);
            }

            const source = ctx.createBufferSource();
            source.buffer = decoded;
            source.connect(ctx.destination);
            currentSourceRef.current = source;
            isPlayingRef.current = true;

            // Track this source to detect stale onended
            const sourceId = Date.now();
            (source as any)._sourceId = sourceId;

            source.start();
            console.log(`[LiveSession] Audio playing (source ${sourceId}), duration: ${decoded.duration.toFixed(1)}s`);

            source.onended = () => {
                // Skip if this source was interrupted (old source stopped for new one)
                if (wasInterruptedRef.current) {
                    wasInterruptedRef.current = false;
                    console.log(`[LiveSession] onended skipped (interrupted, source ${(source as any)._sourceId})`);
                    return;
                }
                console.log(`[LiveSession] onended firing (source ${(source as any)._sourceId})`);
                currentSourceRef.current = null;
                isPlayingRef.current = false;
                isProcessingRef.current = false;
                isMutedRef.current = false;
                setStatus('connected');
                setCurrentOracleText('');

                // Check if user spoke during oracle's response
                const queued = queuedSpeechRef.current.trim();
                queuedSpeechRef.current = '';
                if (queued.length > 3) {
                    console.log('[LiveSession] Queued speech found:', queued.substring(0, 60));
                    currentTranscriptRef.current = queued;
                    setCurrentUserText(queued);
                    silenceTimerRef.current = setTimeout(() => {
                        const finalText = currentTranscriptRef.current.trim();
                        if (finalText) {
                            currentTranscriptRef.current = '';
                            processUserInput(finalText);
                        }
                    }, SILENCE_FALLBACK_MS);
                } else {
                    setCurrentUserText('');
                    currentTranscriptRef.current = '';
                }
                console.log('[LiveSession] Listening. WS:', wsRef.current?.readyState);
            };

            // Safety timeout: if onended doesn't fire within expected time + 5s, force reset
            const safetyMs = (decoded.duration * 1000) + 5000;
            setTimeout(() => {
                if (isProcessingRef.current && currentSourceRef.current === source) {
                    console.warn('[LiveSession] Safety reset: onended did not fire');
                    currentSourceRef.current = null;
                    isPlayingRef.current = false;
                    isProcessingRef.current = false;
                    isMutedRef.current = false;
                    setStatus('connected');
                    setCurrentOracleText('');
                }
            }, safetyMs);

        } catch (e: any) {
            console.error('[LiveSession] Process error:', e.message);
            isProcessingRef.current = false;
            isMutedRef.current = false;
            audioContextRef.current?.resume().catch(() => {});
            setStatus('connected');
        }
    }, [selectedCategories, selectedSources]);

    // ── Start session (internal, after voice selected) ──────────────────
    const startSessionInternal = useCallback(async () => {
        if (isConnectingRef.current) return;
        isConnectingRef.current = true;
        setStatus('connecting');
        setSessionTranscript('');
        chatHistoryRef.current = [];
        roundRef.current = 0;
        sessionLanguageRef.current = language;

        const deepgramKey = (import.meta.env.VITE_DEEPGRAM_API_KEY as string || '').trim();
        if (!deepgramKey) {
            console.error('[LiveSession] Deepgram key missing');
            setStatus('error');
            isConnectingRef.current = false;
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const inputCtx = new AudioCtx({ sampleRate: 16000 });
            audioContextRef.current = inputCtx;
            await inputCtx.resume();

            // Visualizer setup
            const mediaSrc = inputCtx.createMediaStreamSource(stream);
            mediaSourceRef.current = mediaSrc;
            const analyser = inputCtx.createAnalyser();
            analyser.fftSize = 256;
            mediaSrc.connect(analyser);
            analyserRef.current = analyser;

            // Deepgram STT WebSocket – explicit audio format parameters
            const dgLang = DEEPGRAM_LANG[language] || 'de';
            const sampleRate = inputCtx.sampleRate; // actual context sample rate
            const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=${dgLang}&encoding=linear16&sample_rate=${sampleRate}&channels=1&smart_format=true&interim_results=true&endpointing=300&utterance_end_ms=3000&vad_events=true`;
            console.log(`[LiveSession] Connecting Deepgram: lang=${dgLang}, sampleRate=${sampleRate}`);
            const ws = new WebSocket(wsUrl, ['token', deepgramKey]);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[LiveSession] Deepgram STT connected, sampleRate:', sampleRate);
                setDebugInfo(`DG open | SR:${sampleRate}`);
                setStatus('connected');
                isConnectingRef.current = false;
                startVisualizer();

                // Audio processor – always sends audio to keep Deepgram alive
                const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                processorRef.current = processor;
                let frameCount = 0;

                processor.onaudioprocess = (e) => {
                    if (ws.readyState !== WebSocket.OPEN) return;
                    frameCount++;
                    const inputData = e.inputBuffer.getChannelData(0);
                    const int16 = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        const s = Math.max(-1, Math.min(1, inputData[i]));
                        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    }
                    ws.send(int16.buffer);

                    if (frameCount % 50 === 0) {
                        setDebugInfo(`F:${frameCount} | WS:${ws.readyState} | Play:${isPlayingRef.current ? 'Y' : 'N'} | Mute:${isMutedRef.current ? 'Y' : 'N'}`);
                    }
                };

                mediaSrc.connect(processor);
                processor.connect(inputCtx.destination);

                // Send initial greeting
                const GREETINGS: Record<string, string> = {
                    de: 'Hallo', tr: 'Merhaba', en: 'Hello', es: 'Hola',
                    fr: 'Bonjour', ar: 'Marhaba', pt: 'Ola', ru: 'Privet',
                };
                processUserInput(GREETINGS[language] || 'Hallo');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const msgType = data.type || '';

                    // ── SpeechStarted: User began speaking → cancel any patience/fallback timer ──
                    if (msgType === 'SpeechStarted') {
                        if (silenceTimerRef.current) {
                            clearTimeout(silenceTimerRef.current);
                            silenceTimerRef.current = null;
                            setDebugInfo('SpeechStarted → timer cancelled');
                        } else {
                            setDebugInfo('SpeechStarted');
                        }
                        return;
                    }

                    // ── UtteranceEnd: Deepgram detected ~3s silence after speech ──
                    // Round-adaptive: dream narration gets ONE patience window, then process
                    if (msgType === 'UtteranceEnd') {
                        if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
                        const finalText = currentTranscriptRef.current.trim();
                        if (finalText && !isMutedRef.current && !isPlayingRef.current) {
                            const round = roundRef.current;
                            const wordCount = finalText.split(/\s+/).length;
                            const isQuickTurn = wordCount <= 5 || /\?$/.test(finalText);

                            // Patience only ONCE per accumulation: prevents infinite loop
                            if (round <= 3 && !isQuickTurn && !patienceUsedRef.current) {
                                patienceUsedRef.current = true;
                                setDebugInfo(`UttEnd patience r${round} w${wordCount} 4s...`);
                                console.log(`[LiveSession] UtteranceEnd (patience, round ${round}) waiting 4s...`);
                                silenceTimerRef.current = setTimeout(() => {
                                    const text = currentTranscriptRef.current.trim();
                                    if (text && !isMutedRef.current && !isPlayingRef.current) {
                                        currentTranscriptRef.current = '';
                                        patienceUsedRef.current = false;
                                        console.log(`[LiveSession] Patience expired → process: "${text.substring(0, 60)}"`);
                                        processUserInput(text);
                                    }
                                }, 4000);
                            } else {
                                currentTranscriptRef.current = '';
                                patienceUsedRef.current = false;
                                setDebugInfo(`UttEnd → process r${round} w${wordCount}`);
                                console.log(`[LiveSession] UtteranceEnd → process: "${finalText.substring(0, 60)}"`);
                                processUserInput(finalText);
                            }
                        }
                        return;
                    }

                    // Skip non-transcript messages
                    const transcript = data.channel?.alternatives?.[0]?.transcript || '';
                    const isFinal = data.is_final;
                    if (!transcript) return;

                    // ── Oracle is SPEAKING: queue speech, interrupt on real words ──
                    if (isPlayingRef.current) {
                        if (isFinal) {
                            queuedSpeechRef.current += ' ' + transcript;
                            if (transcript.trim().length > 5) {
                                console.log('[LiveSession] Voice interrupt:', transcript.substring(0, 40));
                                wasInterruptedRef.current = true;
                                if (currentSourceRef.current) {
                                    try { currentSourceRef.current.stop(); } catch (_) {}
                                    currentSourceRef.current = null;
                                }
                                isPlayingRef.current = false;
                                isProcessingRef.current = false;
                                isMutedRef.current = false;
                                setStatus('connected');
                                setCurrentOracleText('');
                                currentTranscriptRef.current = queuedSpeechRef.current.trim();
                                queuedSpeechRef.current = '';
                                setCurrentUserText(currentTranscriptRef.current);
                            }
                        }
                        return;
                    }

                    // ── Oracle is THINKING: queue speech silently ──
                    if (isMutedRef.current) {
                        if (isFinal) queuedSpeechRef.current += ' ' + transcript;
                        return;
                    }

                    // ── Normal listening: accumulate, show live text ──
                    if (isFinal) {
                        currentTranscriptRef.current += ' ' + transcript;
                        setCurrentUserText(currentTranscriptRef.current.trim());
                        // Cancel existing timer – user is still talking
                        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                        // Dynamic fallback: long patience for dream narration, shorter for dialog
                        const fallbackMs = roundRef.current <= 3 ? 8000 : 4000;
                        silenceTimerRef.current = setTimeout(() => {
                            const finalText = currentTranscriptRef.current.trim();
                            if (finalText && !isMutedRef.current && !isPlayingRef.current) {
                                currentTranscriptRef.current = '';
                                console.log('[LiveSession] Fallback timer → process:', finalText.substring(0, 60));
                                processUserInput(finalText);
                            }
                        }, fallbackMs);
                    } else {
                        setCurrentUserText((currentTranscriptRef.current + ' ' + transcript).trim());
                    }
                } catch (_) {}
            };

            ws.onerror = (err) => {
                console.error('[LiveSession] Deepgram error:', err);
                setStatus('error');
                cleanup();
            };

            ws.onclose = (event) => {
                console.warn(`[LiveSession] Deepgram disconnected: code=${event.code} reason="${event.reason || 'none'}"`);
                setDebugInfo(`DG CLOSED code=${event.code}`);
                // Reset processing state so user can reconnect
                isProcessingRef.current = false;
                isMutedRef.current = false;
                isPlayingRef.current = false;
                if (statusRef.current !== 'ended') {
                    setStatus('error');
                }
            };

        } catch (e: any) {
            console.error('[LiveSession] Init error:', e.message);
            setStatus('error');
            isConnectingRef.current = false;
            cleanup();
        }
    }, [language, cleanup, startVisualizer, processUserInput, interruptOracle]);

    // ── Public start: check voice onboarding first ───────────────────────
    const startSession = useCallback(() => {
        if (!isVoiceOnboarded() || !selectedVoice) {
            setStatus('voiceSelect');
            return;
        }
        startSessionInternal();
    }, [selectedVoice, startSessionInternal]);

    // ── Voice selection handler ──────────────────────────────────────────
    const handleVoiceSelected = useCallback((character: VoiceCharacter) => {
        setSelectedVoice(character);
        selectedVoiceRef.current = character;
        saveVoice(character);
        setStatus('idle');
        // Brief delay for UI transition, then start
        setTimeout(() => startSessionInternal(), 200);
    }, [startSessionInternal]);

    // ── Disconnect ───────────────────────────────────────────────────────
    const handleDisconnect = useCallback(() => {
        cleanup();
        setStatus('ended');
    }, [cleanup]);

    // ── Save ─────────────────────────────────────────────────────────────
    const handleSave = useCallback(() => {
        onSaveSession(sessionTranscript.trim() || "Audio Session");
    }, [sessionTranscript, onSaveSession]);

    // ── Status text ──────────────────────────────────────────────────────
    const statusText = status === 'idle' ? t.ready :
        status === 'connecting' ? t.connecting :
        status === 'connected' ? t.listening :
        status === 'thinking' ? t.thinking :
        status === 'speaking' ? t.speaking :
        status === 'ended' ? t.session_ended :
        status === 'error' ? t.error : '';

    // ── Voice select modal ───────────────────────────────────────────────
    if (status === 'voiceSelect') {
        return (
            <VoiceSelector
                mode="firstTime"
                language={language}
                currentVoiceId={selectedVoice?.id}
                onSelect={handleVoiceSelected}
                onClose={onClose}
            />
        );
    }

    // ── Main UI ──────────────────────────────────────────────────────────
    return (
        <div
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500"
            translate="no"
        >
            {/* Debug panel - remove after fixing */}
            <div className="fixed top-2 left-2 right-2 z-[60] bg-black/80 border border-yellow-500/50 rounded-lg px-3 py-1.5 text-[10px] font-mono text-yellow-300 space-y-0.5">
                <div>{debugInfo}</div>
                <div>st={status} | r={roundRef.current} | mut={isMutedRef.current?1:0} play={isPlayingRef.current?1:0} proc={isProcessingRef.current?1:0} pat={patienceUsedRef.current?1:0}</div>
            </div>
            {/* Visualizer orb – tap to interrupt as silent fallback */}
            <div
                ref={visualizerCircleRef}
                onClick={status === 'speaking' ? interruptOracle : undefined}
                className={`w-48 h-48 rounded-full flex items-center justify-center mb-8 transition-transform duration-75 relative ease-linear will-change-transform ${
                    status === 'connected' ? 'bg-fuchsia-600' :
                    status === 'thinking' ? 'bg-amber-600 animate-pulse' :
                    status === 'speaking' ? 'bg-emerald-600 cursor-pointer' :
                    'bg-slate-800 border-2 border-slate-700'
                }`}
                style={{ transition: status === 'connected' ? 'none' : 'all 0.5s ease' }}
            >
                {status === 'connecting' && (
                    <div className="w-full h-full rounded-full border-4 border-t-fuchsia-500 animate-spin absolute"></div>
                )}
                <span className="material-icons text-6xl text-white relative z-10">
                    {status === 'connected' ? 'graphic_eq' :
                     status === 'thinking' ? 'psychology' :
                     status === 'speaking' ? 'record_voice_over' :
                     status === 'ended' ? 'save' :
                     status === 'error' ? 'error_outline' : 'mic'}
                </span>
            </div>

            {/* Voice character badge */}
            {selectedVoice && (status === 'connected' || status === 'thinking' || status === 'speaking') && (
                <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                    <span className="material-icons text-sm text-purple-300">{selectedVoice.icon}</span>
                    <span className="text-xs text-white/70">{selectedVoice.name}</span>
                </div>
            )}

            <h2 key={status} className="text-2xl font-bold text-white mb-2 text-center">{statusText}</h2>

            {/* Current user speech */}
            {(status === 'connected' || status === 'thinking') && currentUserText ? (
                <div key="user-text" className="max-w-sm w-full mb-3 p-3 bg-blue-900/30 rounded-xl border border-blue-500/30">
                    <p className="text-blue-200 text-sm" translate="no">{currentUserText}</p>
                </div>
            ) : null}

            {/* Oracle response */}
            {status === 'speaking' && currentOracleText ? (
                <div key="oracle-text" className="max-w-sm w-full mb-3 p-3 bg-fuchsia-900/30 rounded-xl border border-fuchsia-500/30">
                    <p className="text-fuchsia-200 text-sm" translate="no">{currentOracleText}</p>
                </div>
            ) : null}

            <div className="flex gap-4 flex-col items-center">
                {(status === 'idle' || status === 'error') && (
                    <>
                        <p className="text-slate-400 text-center max-w-sm mb-4">{t.instruction}</p>
                        <div className="flex gap-4">
                            <button
                                onClick={startSession}
                                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <span className="material-icons">play_arrow</span> {t.start}
                            </button>
                            <button onClick={onClose} className="px-4 py-4 bg-slate-800 rounded-full text-white hover:bg-slate-700">
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                    </>
                )}

                {status === 'connecting' && (
                    <button onClick={onClose} className="px-4 py-4 bg-slate-800 rounded-full text-white hover:bg-slate-700 mt-4">
                        <span className="material-icons">close</span>
                    </button>
                )}

                {(status === 'connected' || status === 'thinking' || status === 'speaking') && (
                    <button
                        onClick={handleDisconnect}
                        className="px-8 py-4 bg-red-900/30 border border-red-500 text-red-200 rounded-full font-bold text-lg hover:bg-red-900/50 transition-colors flex items-center gap-2 animate-in slide-in-from-bottom-4"
                    >
                        <span className="material-icons">stop</span> {t.disconnect}
                    </button>
                )}

                {status === 'ended' && (
                    <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4 w-full max-w-xs">
                        <button
                            onClick={handleSave}
                            className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                        >
                            <span className="material-icons">auto_awesome</span> {t.save_btn}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold border border-white/10"
                        >
                            {t.discard_btn}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveSession;
