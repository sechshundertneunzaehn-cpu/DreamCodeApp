import React, { useState, useEffect } from 'react';
import { AudioRecorder as Recorder, audioBlobToBase64 } from '../services/audioService';
import { transcribeAudio } from '../services/speechService';
import { Language, UserProfile } from '../types';

const recorderTranslations: Record<Language, {
    record_dream: string;
    stop: string;
    start_recording: string;
    stop_recording: string;
    processing: string;
    mic_denied: string;
    processing_error: string;
}> = {
    [Language.DE]: {
        record_dream: "Traum aufnehmen",
        stop: "Stopp",
        start_recording: "Aufnahme starten",
        stop_recording: "Aufnahme beenden",
        processing: "Verarbeite Aufnahme...",
        mic_denied: "Mikrofon-Zugriff verweigert oder nicht verfügbar",
        processing_error: "Fehler bei der Verarbeitung der Aufnahme",
    },
    [Language.EN]: {
        record_dream: "Record Dream",
        stop: "Stop",
        start_recording: "Start Recording",
        stop_recording: "Stop Recording",
        processing: "Processing recording...",
        mic_denied: "Microphone access denied or unavailable",
        processing_error: "Error processing the recording",
    },
    [Language.TR]: {
        record_dream: "Rüya Kaydet",
        stop: "Durdur",
        start_recording: "Kaydı Başlat",
        stop_recording: "Kaydı Durdur",
        processing: "Kayıt işleniyor...",
        mic_denied: "Mikrofon erişimi reddedildi veya kullanılamıyor",
        processing_error: "Kayıt işlenirken hata oluştu",
    },
    [Language.ES]: {
        record_dream: "Grabar Sueño",
        stop: "Parar",
        start_recording: "Iniciar Grabación",
        stop_recording: "Detener Grabación",
        processing: "Procesando grabación...",
        mic_denied: "Acceso al micrófono denegado o no disponible",
        processing_error: "Error al procesar la grabación",
    },
    [Language.FR]: {
        record_dream: "Enregistrer le Rêve",
        stop: "Arrêter",
        start_recording: "Démarrer l'enregistrement",
        stop_recording: "Arrêter l'enregistrement",
        processing: "Traitement de l'enregistrement...",
        mic_denied: "Accès au microphone refusé ou indisponible",
        processing_error: "Erreur lors du traitement de l'enregistrement",
    },
    [Language.AR]: {
        record_dream: "تسجيل الحلم",
        stop: "إيقاف",
        start_recording: "بدء التسجيل",
        stop_recording: "إيقاف التسجيل",
        processing: "جارٍ معالجة التسجيل...",
        mic_denied: "تم رفض الوصول إلى الميكروفون أو غير متاح",
        processing_error: "خطأ في معالجة التسجيل",
    },
    [Language.PT]: {
        record_dream: "Gravar Sonho",
        stop: "Parar",
        start_recording: "Iniciar Gravação",
        stop_recording: "Parar Gravação",
        processing: "Processando gravação...",
        mic_denied: "Acesso ao microfone negado ou indisponível",
        processing_error: "Erro ao processar a gravação",
    },
    [Language.RU]: {
        record_dream: "Записать Сон",
        stop: "Стоп",
        start_recording: "Начать запись",
        stop_recording: "Остановить запись",
        processing: "Обработка записи...",
        mic_denied: "Доступ к микрофону отклонён или недоступен",
        processing_error: "Ошибка при обработке записи",
    },
};

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
    const [recorder] = useState(() => new Recorder());
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRecording) {
            timer = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(timer);
    }, [isRecording]);

    const startRecording = async () => {
        try {
            setError(null);
            await recorder.startRecording();
            setIsRecording(true);
        } catch (err) {
            setError(t.mic_denied);
            console.error('Recording error:', err);
        }
    };

    const stopRecording = async () => {
        try {
            setIsRecording(false);
            setIsProcessing(true);

            const audioBlob = await recorder.stopRecording();

            // Convert to base64 for storage
            const audioBase64 = await audioBlobToBase64(audioBlob);

            // Transcribe the audio
            const transcription = await transcribeAudio(audioBlob, language, userProfile);

            // Pass results back to parent
            onTranscriptionComplete(transcription, audioBase64);

            setIsProcessing(false);
        } catch (err) {
            setError(t.processing_error);
            setIsProcessing(false);
            console.error('Processing error:', err);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isVisible) return null;

    return (
        <div className="audio-recorder">
            <div className="recorder-controls">
                {!isRecording && !isProcessing && (
                    <button
                        onClick={startRecording}
                        className="record-button start"
                        title={t.start_recording}
                    >
                        🎤 {t.record_dream}
                    </button>
                )}

                {isRecording && (
                    <div className="recording-active">
                        <button
                            onClick={stopRecording}
                            className="record-button stop"
                            title={t.stop_recording}
                        >
                            ⏹️ {t.stop}
                        </button>
                        <div className="recording-indicator">
                            <span className="pulse-dot"></span>
                            <span className="recording-time">{formatTime(recordingTime)}</span>
                        </div>
                    </div>
                )}

                {isProcessing && (
                    <div className="processing">
                        <div className="spinner"></div>
                        <span>{t.processing}</span>
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            <style>{`
                .audio-recorder {
                    margin: 1rem 0;
                }

                .recorder-controls {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .record-button {
                    padding: 1rem 2rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                .record-button.start {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .record-button.start:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
                }

                .record-button.stop {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                }

                .record-button.stop:hover {
                    transform: scale(1.05);
                }

                .recording-active {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .recording-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #f5576c;
                }

                .pulse-dot {
                    width: 12px;
                    height: 12px;
                    background: #f5576c;
                    border-radius: 50%;
                    animation: pulse 1.5s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.5;
                        transform: scale(1.2);
                    }
                }

                .processing {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 2rem;
                    background: rgba(102, 126, 234, 0.1);
                    border-radius: 12px;
                    font-weight: 600;
                    color: #667eea;
                }

                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(102, 126, 234, 0.3);
                    border-top-color: #667eea;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .error-message {
                    margin-top: 1rem;
                    padding: 0.75rem 1rem;
                    background: rgba(245, 87, 108, 0.1);
                    border-left: 4px solid #f5576c;
                    border-radius: 8px;
                    color: #f5576c;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
};

export default AudioRecorder;
