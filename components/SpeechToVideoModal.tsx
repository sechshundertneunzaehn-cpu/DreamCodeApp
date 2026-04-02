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
        status_recording: 'Aufnahme laeuft',
        status_paused: 'Pausiert',
        not_supported: 'Spracherkennung wird in diesem Browser nicht unterstuetzt. Bitte tippe den Text manuell ein.',
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
    },
    [Language.TR]: {
        title: 'Ruya Videosu Hazirla',
        subtitle: 'Ruyani anlat, metni duzelt, sonra Video Studyoya gec.',
        placeholder: 'Ruyani anlat ya da buraya yaz.',
        label: 'Ruya metni',
        start_mic: 'Mikrofonu baslat',
        pause: 'Duraklat',
        resume: 'Kayda devam et',
        continue_btn: 'Video Studyoya devam',
        close_btn: 'Iptal',
        status_ready: 'Hazir',
        status_recording: 'Kayit devam ediyor',
        status_paused: 'Duraklatildi',
        not_supported: 'Ses tanima bu tarayicida desteklenmiyor. Lutfen metni elle yazin.',
    },
    [Language.ES]: {
        title: 'Preparar Video de Sueno',
        subtitle: 'Habla tu sueno, corrige el texto y continua al Estudio de Video.',
        placeholder: 'Habla tu sueno o escribe aqui.',
        label: 'Texto del sueno',
        start_mic: 'Iniciar microfono',
        pause: 'Pausar',
        resume: 'Continuar grabacion',
        continue_btn: 'Continuar al Estudio',
        close_btn: 'Cancelar',
        status_ready: 'Listo',
        status_recording: 'Grabando',
        status_paused: 'En pausa',
        not_supported: 'El reconocimiento de voz no es compatible con este navegador.',
    },
    [Language.FR]: {
        title: 'Preparer la Video du Reve',
        subtitle: 'Racontez votre reve, corrigez le texte, puis passez au Studio Video.',
        placeholder: 'Racontez votre reve ou tapez-le ici.',
        label: 'Texte du reve',
        start_mic: 'Demarrer le micro',
        pause: 'Pause',
        resume: 'Reprendre',
        continue_btn: 'Continuer vers le Studio',
        close_btn: 'Annuler',
        status_ready: 'Pret',
        status_recording: 'Enregistrement',
        status_paused: 'En pause',
        not_supported: 'La reconnaissance vocale n\'est pas prise en charge dans ce navigateur.',
    },
    [Language.AR]: {
        title: 'tahDiir fiidyuu al-Hulm',
        subtitle: 'taHaddath Hulmuak, SaHHiH an-naSS, thumma intaqil ilaa al-istuudyuu.',
        placeholder: 'taHaddath Hulmuak aw uktubhu hunaa.',
        label: 'naSS al-Hulm',
        start_mic: 'tasghiil al-maykruufuun',
        pause: 'iiqaaf muaqqat',
        resume: 'istinaaf at-tasjiil',
        continue_btn: 'al-mutaaba\'a ilaa al-istuudyuu',
        close_btn: 'ilghaa',
        status_ready: 'jaahiz',
        status_recording: 'jaariy at-tasjiil',
        status_paused: 'mutawaqqif',
        not_supported: 'at-ta\'arruf alaa al-kalaam ghayr mada\'uum fii haadha al-mutaSaffiH.',
    },
    [Language.PT]: {
        title: 'Preparar Video do Sonho',
        subtitle: 'Fale seu sonho, corrija o texto e continue para o Estudio de Video.',
        placeholder: 'Fale seu sonho ou digite aqui.',
        label: 'Texto do sonho',
        start_mic: 'Iniciar microfone',
        pause: 'Pausar',
        resume: 'Retomar gravacao',
        continue_btn: 'Continuar para o Estudio',
        close_btn: 'Cancelar',
        status_ready: 'Pronto',
        status_recording: 'Gravando',
        status_paused: 'Pausado',
        not_supported: 'Reconhecimento de voz nao e suportado neste navegador.',
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
    const isRtl = language === Language.AR;

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
            setStatus('recording');
            statusRef.current = 'recording';
        } catch {
            setStatus('idle');
            statusRef.current = 'idle';
        }
    }, [buildRecognition, stopRecognition]);

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
                                {isPlayingPreview ? '▶ Wiedergabe...' : '🎤 Aufnahme gespeichert'}
                            </p>
                            <p className={`text-[10px] ${isLight ? 'text-violet-500' : 'text-violet-400/60'}`}>
                                Eigene Stimme wird mit Video verwendet
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
