import React, { useState, useEffect, useRef, useCallback } from 'react';
import { audioBlobToBase64 } from '../services/audioService';
import { Language, UserProfile } from '../types';
import { apiUrl } from '../services/apiConfig';

const recorderTranslations: Record<Language, {
    record_dream: string;
    stop: string;
    pause: string;
    resume: string;
    start_recording: string;
    stop_recording: string;
    processing: string;
    mic_denied: string;
    processing_error: string;
    edit: string;
    submit: string;
    listening: string;
}> = {
    [Language.DE]: {
        record_dream: "Traum aufnehmen",
        stop: "Stopp",
        pause: "Pause",
        resume: "Weiter",
        start_recording: "Aufnahme starten",
        stop_recording: "Aufnahme beenden",
        processing: "Verarbeite Aufnahme...",
        mic_denied: "Mikrofon-Zugriff verweigert oder nicht verfügbar",
        processing_error: "Fehler bei der Verarbeitung der Aufnahme",
        edit: "Bearbeiten",
        submit: "Zur Deutung senden",
        listening: "Hoere zu...",
    },
    [Language.EN]: {
        record_dream: "Record Dream",
        stop: "Stop",
        pause: "Pause",
        resume: "Resume",
        start_recording: "Start Recording",
        stop_recording: "Stop Recording",
        processing: "Processing recording...",
        mic_denied: "Microphone access denied or unavailable",
        processing_error: "Error processing the recording",
        edit: "Edit",
        submit: "Send for Interpretation",
        listening: "Listening...",
    },
    [Language.TR]: {
        record_dream: "Rüya Kaydet", stop: "Durdur", pause: "Duraklat", resume: "Devam",
        start_recording: "Kaydı Başlat", stop_recording: "Kaydı Durdur",
        processing: "Kayıt işleniyor...", mic_denied: "Mikrofon erişimi reddedildi veya kullanılamıyor",
        processing_error: "Kayıt işlenirken hata oluştu", edit: "Düzenle", submit: "Yoruma Gönder", listening: "Dinleniyor...",
    },
    [Language.ES]: {
        record_dream: "Grabar Sueño", stop: "Parar", pause: "Pausa", resume: "Continuar",
        start_recording: "Iniciar Grabación", stop_recording: "Detener Grabación",
        processing: "Procesando grabación...", mic_denied: "Acceso al micrófono denegado o no disponible",
        processing_error: "Error al procesar la grabación", edit: "Editar", submit: "Enviar a interpretación", listening: "Escuchando...",
    },
    [Language.FR]: {
        record_dream: "Enregistrer le Rêve", stop: "Arrêter", pause: "Pause", resume: "Reprendre",
        start_recording: "Démarrer l'enregistrement", stop_recording: "Arrêter l'enregistrement",
        processing: "Traitement de l'enregistrement...", mic_denied: "Accès au microphone refusé ou indisponible",
        processing_error: "Erreur lors du traitement de l'enregistrement", edit: "Modifier", submit: "Envoyer pour interprétation", listening: "Écoute...",
    },
    [Language.AR]: {
        record_dream: "تسجيل الحلم", stop: "إيقاف", pause: "إيقاف مؤقت", resume: "استئناف",
        start_recording: "بدء التسجيل", stop_recording: "إيقاف التسجيل",
        processing: "جارٍ معالجة التسجيل...", mic_denied: "تم رفض الوصول إلى الميكروفون أو غير متاح",
        processing_error: "خطأ في معالجة التسجيل", edit: "تعديل", submit: "إرسال للتفسير", listening: "...يستمع",
    },
    [Language.PT]: {
        record_dream: "Gravar Sonho", stop: "Parar", pause: "Pausar", resume: "Continuar",
        start_recording: "Iniciar Gravação", stop_recording: "Parar Gravação",
        processing: "Processando gravação...", mic_denied: "Acesso ao microfone negado ou indisponível",
        processing_error: "Erro ao processar a gravação", edit: "Editar", submit: "Enviar para interpretação", listening: "Ouvindo...",
    },
    [Language.RU]: {
        record_dream: "Записать Сон", stop: "Стоп", pause: "Пауза", resume: "Продолжить",
        start_recording: "Начать запись", stop_recording: "Остановить запись",
        processing: "Обработка записи...", mic_denied: "Доступ к микрофону отклонён или недоступен",
        processing_error: "Ошибка при обработке записи", edit: "Редактировать", submit: "Отправить на толкование", listening: "Слушаю...",
    },
    [Language.ZH]: {
        record_dream: "录制梦境", stop: "停止", pause: "暂停", resume: "继续",
        start_recording: "开始录音", stop_recording: "停止录音",
        processing: "正在处理录音...", mic_denied: "麦克风访问被拒绝或不可用",
        processing_error: "处理录音时出错", edit: "编辑", submit: "发送解梦", listening: "正在聆听...",
    },
    [Language.HI]: {
        record_dream: "सपना रिकॉर्ड करें", stop: "रोकें", pause: "रुकें", resume: "जारी रखें",
        start_recording: "रिकॉर्डिंग शुरू करें", stop_recording: "रिकॉर्डिंग बंद करें",
        processing: "रिकॉर्डिंग प्रोसेस हो रही है...", mic_denied: "माइक्रोफ़ोन एक्सेस अस्वीकृत या अनुपलब्ध",
        processing_error: "रिकॉर्डिंग प्रोसेसिंग में त्रुटि", edit: "संपादित करें", submit: "व्याख्या के लिए भेजें", listening: "सुन रहा है...",
    },
    [Language.JA]: {
        record_dream: "夢を録音", stop: "停止", pause: "一時停止", resume: "再開",
        start_recording: "録音開始", stop_recording: "録音停止",
        processing: "録音を処理中...", mic_denied: "マイクへのアクセスが拒否されたか利用できません",
        processing_error: "録音の処理中にエラーが発生しました", edit: "編集", submit: "解釈へ送信", listening: "聞いています...",
    },
    [Language.KO]: {
        record_dream: "꿈 녹음", stop: "중지", pause: "일시정지", resume: "재개",
        start_recording: "녹음 시작", stop_recording: "녹음 중지",
        processing: "녹음 처리 중...", mic_denied: "마이크 접근이 거부되었거나 사용할 수 없습니다",
        processing_error: "녹음 처리 중 오류 발생", edit: "편집", submit: "해석으로 보내기", listening: "듣고 있습니다...",
    },
    [Language.ID]: {
        record_dream: "Rekam Mimpi", stop: "Berhenti", pause: "Jeda", resume: "Lanjut",
        start_recording: "Mulai Merekam", stop_recording: "Berhenti Merekam",
        processing: "Memproses rekaman...", mic_denied: "Akses mikrofon ditolak atau tidak tersedia",
        processing_error: "Gagal memproses rekaman", edit: "Edit", submit: "Kirim untuk ditafsirkan", listening: "Mendengarkan...",
    },
    [Language.FA]: {
        record_dream: "ضبط خواب", stop: "توقف", pause: "مکث", resume: "ادامه",
        start_recording: "شروع ضبط", stop_recording: "پایان ضبط",
        processing: "در حال پردازش ضبط...", mic_denied: "دسترسی به میکروفون رد شد یا در دسترس نیست",
        processing_error: "خطا در پردازش ضبط", edit: "ویرایش", submit: "ارسال برای تعبیر", listening: "...در حال گوش دادن",
    },
    [Language.IT]: {
        record_dream: "Registra Sogno", stop: "Stop", pause: "Pausa", resume: "Riprendi",
        start_recording: "Avvia Registrazione", stop_recording: "Ferma Registrazione",
        processing: "Elaborazione registrazione...", mic_denied: "Accesso al microfono negato o non disponibile",
        processing_error: "Errore nell'elaborazione della registrazione", edit: "Modifica", submit: "Invia per interpretazione", listening: "In ascolto...",
    },
    [Language.PL]: {
        record_dream: "Nagraj Sen", stop: "Stop", pause: "Pauza", resume: "Wznów",
        start_recording: "Rozpocznij Nagrywanie", stop_recording: "Zatrzymaj Nagrywanie",
        processing: "Przetwarzanie nagrania...", mic_denied: "Dostęp do mikrofonu odrzucony lub niedostępny",
        processing_error: "Błąd przetwarzania nagrania", edit: "Edytuj", submit: "Wyślij do interpretacji", listening: "Słucham...",
    },
    [Language.BN]: {
        record_dream: "স্বপ্ন রেকর্ড করুন", stop: "থামুন", pause: "বিরতি", resume: "চালিয়ে যান",
        start_recording: "রেকর্ডিং শুরু করুন", stop_recording: "রেকর্ডিং বন্ধ করুন",
        processing: "রেকর্ডিং প্রক্রিয়াকরণ...", mic_denied: "মাইক্রোফোন অ্যাক্সেস প্রত্যাখ্যান বা অনুপলব্ধ",
        processing_error: "রেকর্ডিং প্রক্রিয়াকরণে ত্রুটি", edit: "সম্পাদনা", submit: "ব্যাখ্যার জন্য পাঠান", listening: "শুনছি...",
    },
    [Language.UR]: {
        record_dream: "خواب ریکارڈ کریں", stop: "رکیں", pause: "وقفہ", resume: "جاری رکھیں",
        start_recording: "ریکارڈنگ شروع کریں", stop_recording: "ریکارڈنگ بند کریں",
        processing: "ریکارڈنگ پروسیس ہو رہی ہے...", mic_denied: "مائیکروفون تک رسائی مسترد یا دستیاب نہیں",
        processing_error: "ریکارڈنگ پروسیسنگ میں خرابی", edit: "ترمیم", submit: "تعبیر کے لیے بھیجیں", listening: "...سن رہا ہے",
    },
    [Language.VI]: {
        record_dream: "Ghi âm Giấc mơ", stop: "Dừng", pause: "Tạm dừng", resume: "Tiếp tục",
        start_recording: "Bắt đầu Ghi âm", stop_recording: "Dừng Ghi âm",
        processing: "Đang xử lý bản ghi...", mic_denied: "Quyền truy cập micro bị từ chối hoặc không khả dụng",
        processing_error: "Lỗi khi xử lý bản ghi", edit: "Chỉnh sửa", submit: "Gửi giải mộng", listening: "Đang nghe...",
    },
    [Language.TH]: {
        record_dream: "บันทึกความฝัน", stop: "หยุด", pause: "หยุดชั่วคราว", resume: "ดำเนินการต่อ",
        start_recording: "เริ่มบันทึก", stop_recording: "หยุดบันทึก",
        processing: "กำลังประมวลผลการบันทึก...", mic_denied: "การเข้าถึงไมโครโฟนถูกปฏิเสธหรือไม่พร้อมใช้งาน",
        processing_error: "เกิดข้อผิดพลาดในการประมวลผลการบันทึก", edit: "แก้ไข", submit: "ส่งเพื่อตีความ", listening: "กำลังฟัง...",
    },
    [Language.SW]: {
        record_dream: "Rekodi Ndoto", stop: "Simama", pause: "Sitisha", resume: "Endelea",
        start_recording: "Anza Kurekodi", stop_recording: "Simamisha Kurekodi",
        processing: "Inachakata rekodi...", mic_denied: "Ufikiaji wa kipaza sauti umekataliwa au haupatikani",
        processing_error: "Hitilafu katika kuchakata rekodi", edit: "Hariri", submit: "Tuma kwa tafsiri", listening: "Inasikiliza...",
    },
    [Language.HU]: {
        record_dream: "Álom felvétele", stop: "Leállítás", pause: "Szünet", resume: "Folytatás",
        start_recording: "Felvétel indítása", stop_recording: "Felvétel leállítása",
        processing: "Felvétel feldolgozása...", mic_denied: "Mikrofon-hozzáférés megtagadva vagy nem elérhető",
        processing_error: "Hiba a felvétel feldolgozásakor", edit: "Szerkesztés", submit: "Küldés értelmezésre", listening: "Hallgatom...",
    },
};

// Deepgram Sprach-Codes fuer STT
const DEEPGRAM_LANG: Record<string, string> = {
    de: 'de', en: 'en', tr: 'tr', es: 'es', fr: 'fr', ar: 'ar', pt: 'pt-BR',
    ru: 'ru', zh: 'zh', hi: 'hi', ja: 'ja', ko: 'ko', id: 'id', fa: 'fa',
    it: 'it', pl: 'pl', bn: 'bn', ur: 'ur', vi: 'vi', th: 'th', sw: 'sw', hu: 'hu',
};

type RecordingPhase = 'idle' | 'recording' | 'paused' | 'stopped' | 'editing';

interface AudioRecorderProps {
    language: Language;
    userProfile: UserProfile | null;
    onTranscriptionComplete: (text: string, audioBase64: string) => void;
    isVisible: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
    language,
    userProfile,
    onTranscriptionComplete,
    isVisible
}) => {
    const t = recorderTranslations[language];
    const isRtl = [Language.AR, Language.FA, Language.UR].includes(language);

    const [phase, setPhase] = useState<RecordingPhase>('idle');
    const [error, setError] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [liveText, setLiveText] = useState('');
    const [interimText, setInterimText] = useState('');
    const [editText, setEditText] = useState('');

    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const liveTextRef = useRef('');

    // Timer fuer Aufnahmedauer
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (phase === 'recording') {
            timer = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        }
        return () => clearInterval(timer);
    }, [phase]);

    // Cleanup bei unmount
    useEffect(() => {
        return () => {
            wsRef.current?.close();
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, []);

    const getDeepgramToken = async (): Promise<string | null> => {
        try {
            const res = await fetch(apiUrl('/api/transcribe'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get-token' }),
            });
            const data = await res.json() as { key?: string | null };
            return data.key || null;
        } catch {
            return null;
        }
    };

    const startRecording = useCallback(async () => {
        setError(null);
        setLiveText('');
        setInterimText('');
        liveTextRef.current = '';
        chunksRef.current = [];
        setRecordingTime(0);

        try {
            // 1. Mic oeffnen
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // 2. MediaRecorder fuer Blob-Aufnahme (parallel)
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            mediaRecorder.start(250);

            // 3. Deepgram Token holen
            const token = await getDeepgramToken();

            if (token) {
                // 4. WebSocket zu Deepgram
                const lang = DEEPGRAM_LANG[language] || 'en';
                const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=${lang}&interim_results=true&punctuate=true&smart_format=true&encoding=linear16&sample_rate=16000`;

                const ws = new WebSocket(wsUrl, ['token', token]);
                wsRef.current = ws;

                ws.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);
                        const transcript = msg.channel?.alternatives?.[0]?.transcript || '';
                        if (!transcript) return;

                        if (msg.is_final) {
                            liveTextRef.current = (liveTextRef.current + ' ' + transcript).trim();
                            setLiveText(liveTextRef.current);
                            setInterimText('');
                        } else {
                            setInterimText(transcript);
                        }
                    } catch { /* ignore parse errors */ }
                };

                ws.onerror = () => {
                    console.warn('[AudioRecorder] Deepgram WS error, continuing with recording only');
                };

                // 5. Audio-Stream via AudioContext zu Deepgram senden
                const audioContext = new AudioContext({ sampleRate: 16000 });
                const source = audioContext.createMediaStreamSource(stream);
                const processor = audioContext.createScriptProcessor(4096, 1, 1);

                processor.onaudioprocess = (e) => {
                    if (ws.readyState !== WebSocket.OPEN) return;
                    const input = e.inputBuffer.getChannelData(0);
                    const pcm16 = new Int16Array(input.length);
                    for (let i = 0; i < input.length; i++) {
                        pcm16[i] = Math.max(-32768, Math.min(32767, Math.round(input[i] * 32767)));
                    }
                    ws.send(pcm16.buffer);
                };

                source.connect(processor);
                processor.connect(audioContext.destination);

                // Cleanup refs fuer spaeter
                (ws as any)._audioContext = audioContext;
                (ws as any)._processor = processor;
                (ws as any)._source = source;
            }

            setPhase('recording');
        } catch (err) {
            setError(t.mic_denied);
            console.error('[AudioRecorder] Start error:', err);
        }
    }, [language, t]);

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.pause();
        }
        // Deepgram WS bleibt offen, aber kein Audio wird gesendet weil MediaRecorder pausiert
        setPhase('paused');
    }, []);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'paused') {
            mediaRecorderRef.current.resume();
        }
        setPhase('recording');
    }, []);

    const stopRecording = useCallback(() => {
        // WebSocket schliessen
        const ws = wsRef.current;
        if (ws) {
            // AudioContext cleanup
            const ctx = (ws as any)._audioContext as AudioContext | undefined;
            const proc = (ws as any)._processor as ScriptProcessorNode | undefined;
            const src = (ws as any)._source as MediaStreamAudioSourceNode | undefined;
            proc?.disconnect();
            src?.disconnect();
            ctx?.close().catch(() => {});
            ws.close();
            wsRef.current = null;
        }

        // MediaRecorder stoppen
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        // Mic-Stream stoppen
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        // Finalen Text setzen
        const finalText = (liveTextRef.current + ' ' + interimText).trim();
        setLiveText(finalText);
        setInterimText('');
        setEditText(finalText);
        setPhase('stopped');
    }, [interimText]);

    const handleEdit = useCallback(() => {
        setPhase('editing');
    }, []);

    const handleSubmit = useCallback(async () => {
        const textToSend = phase === 'editing' ? editText.trim() : (liveText || editText).trim();
        if (!textToSend) return;

        // Audio-Blob aus chunks zusammenbauen
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioBase64 = await audioBlobToBase64(audioBlob);

        onTranscriptionComplete(textToSend, audioBase64);

        // Reset
        setPhase('idle');
        setLiveText('');
        setInterimText('');
        setEditText('');
        setRecordingTime(0);
        chunksRef.current = [];
    }, [phase, editText, liveText, onTranscriptionComplete]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isVisible) return null;

    const displayText = liveText + (interimText ? ` ${interimText}` : '');

    return (
        <div dir={isRtl ? 'rtl' : 'ltr'} className="audio-recorder">
            {/* Live-Text Anzeige waehrend Aufnahme */}
            {(phase === 'recording' || phase === 'paused') && (
                <div className="live-transcript">
                    {displayText ? (
                        <p className="live-text">{displayText}<span className="interim-cursor">|</span></p>
                    ) : (
                        <p className="live-text placeholder">{t.listening}</p>
                    )}
                </div>
            )}

            {/* Text nach Stop - anzeigen oder editieren */}
            {phase === 'stopped' && (
                <div className="live-transcript">
                    <p className="live-text">{editText || liveText}</p>
                </div>
            )}

            {phase === 'editing' && (
                <textarea
                    className="edit-textarea"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={5}
                    autoFocus
                />
            )}

            {/* Buttons */}
            <div className="recorder-controls">
                {phase === 'idle' && (
                    <button onClick={startRecording} className="record-button start" title={t.start_recording}>
                        <span className="material-icons" style={{ fontSize: '1.2rem', verticalAlign: 'middle' }}>mic</span> {t.record_dream}
                    </button>
                )}

                {phase === 'recording' && (
                    <div className="recording-active">
                        <div className="button-row">
                            <button onClick={pauseRecording} className="record-button pause" title={t.pause}>
                                <span className="material-icons" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>pause</span> {t.pause}
                            </button>
                            <button onClick={stopRecording} className="record-button stop" title={t.stop_recording}>
                                <span className="material-icons" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>stop</span> {t.stop}
                            </button>
                        </div>
                        <div className="recording-indicator">
                            <span className="pulse-dot"></span>
                            <span className="recording-time">{formatTime(recordingTime)}</span>
                        </div>
                    </div>
                )}

                {phase === 'paused' && (
                    <div className="recording-active">
                        <div className="button-row">
                            <button onClick={resumeRecording} className="record-button resume" title={t.resume}>
                                <span className="material-icons" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>play_arrow</span> {t.resume}
                            </button>
                            <button onClick={stopRecording} className="record-button stop" title={t.stop_recording}>
                                <span className="material-icons" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>stop</span> {t.stop}
                            </button>
                        </div>
                        <div className="recording-indicator paused">
                            <span className="material-icons" style={{ fontSize: '1rem', color: '#f59e0b' }}>pause_circle</span>
                            <span className="recording-time">{formatTime(recordingTime)}</span>
                        </div>
                    </div>
                )}

                {(phase === 'stopped' || phase === 'editing') && (
                    <div className="button-row">
                        {phase === 'stopped' && (
                            <button onClick={handleEdit} className="record-button edit">
                                <span className="material-icons" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>edit</span> {t.edit}
                            </button>
                        )}
                        <button onClick={handleSubmit} className="record-button submit">
                            <span className="material-icons" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>send</span> {t.submit}
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message">
                    <span className="material-icons" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>warning</span> {error}
                </div>
            )}

            <style>{`
                .audio-recorder { margin: 1rem 0; }
                .recorder-controls { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
                .button-row { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; }

                .record-button {
                    padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 600;
                    border: none; border-radius: 12px; cursor: pointer;
                    transition: all 0.3s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    display: inline-flex; align-items: center; gap: 0.5rem;
                }
                .record-button.start { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                .record-button.start:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(102,126,234,0.4); }
                .record-button.stop { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
                .record-button.pause { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
                .record-button.resume { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
                .record-button.edit { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
                .record-button.submit { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                .record-button:hover { transform: scale(1.03); }

                .recording-active { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
                .recording-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; font-weight: 600; color: #f5576c; }
                .recording-indicator.paused { color: #f59e0b; }
                .pulse-dot { width: 12px; height: 12px; background: #f5576c; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite; }
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.2)} }

                .live-transcript {
                    margin-bottom: 1rem; padding: 1rem 1.25rem;
                    background: rgba(102,126,234,0.08); border: 1px solid rgba(102,126,234,0.2);
                    border-radius: 12px; min-height: 60px; max-height: 200px; overflow-y: auto;
                }
                .live-text { color: white; font-size: 1rem; line-height: 1.6; margin: 0; white-space: pre-wrap; }
                .live-text.placeholder { color: rgba(255,255,255,0.4); font-style: italic; }
                .interim-cursor { color: #667eea; animation: blink 1s infinite; }
                @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

                .edit-textarea {
                    width: 100%; margin-bottom: 1rem; padding: 1rem 1.25rem;
                    background: rgba(102,126,234,0.08); border: 1px solid rgba(102,126,234,0.4);
                    border-radius: 12px; color: white; font-size: 1rem; line-height: 1.6;
                    resize: vertical; font-family: inherit;
                }
                .edit-textarea:focus { outline: none; border-color: #667eea; }

                .error-message {
                    margin-top: 1rem; padding: 0.75rem 1rem;
                    background: rgba(245,87,108,0.1); border-left: 4px solid #f5576c;
                    border-radius: 8px; color: #f5576c; font-weight: 500;
                    display: flex; align-items: center; gap: 0.5rem;
                }
            `}</style>
        </div>
    );
};

export default AudioRecorder;
