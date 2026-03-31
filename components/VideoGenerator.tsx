import React, { useState } from 'react';
import { generateDreamVideo } from '../services/geminiService';
import { Language, UserProfile } from '../types';

interface VideoGeneratorProps {
    dreamDescription: string;
    language: Language;
    userProfile: UserProfile | null;
}

const videoTranslations = {
    [Language.EN]: {
        title: "Visualize Dream (Video)",
        beta: "BETA (Veo)",
        description: "Generate a cinematic video representation of your dream.",
        generate: "Generate Video",
        processing: "Processing...",
        error_generic: "Failed to generate video",
        error_unavailable: "Video generation unavailable"
    },
    [Language.DE]: {
        title: "Traum visualisieren (Video)",
        beta: "BETA (Veo)",
        description: "Erstelle ein cineastisches Video deines Traums.",
        generate: "Video generieren",
        processing: "Verarbeite...",
        error_generic: "Fehler bei der Videogenerierung",
        error_unavailable: "Videogenerierung nicht verfügbar"
    },
    [Language.TR]: {
        title: "Rüyayı Görselleştir (Video)",
        beta: "BETA (Veo)",
        description: "Rüyalarınızın sinematik bir video temsilini oluşturun.",
        generate: "Video Oluştur",
        processing: "İşleniyor...",
        error_generic: "Video oluşturulamadı",
        error_unavailable: "Video oluşturma kullanılamıyor"
    },
    [Language.ES]: {
        title: "Visualizar Sueño (Video)",
        beta: "BETA (Veo)",
        description: "Genera una representación cinematográfica de tu sueño en video.",
        generate: "Generar Video",
        processing: "Procesando...",
        error_generic: "Error al generar video",
        error_unavailable: "Generación de video no disponible"
    },
    [Language.FR]: {
        title: "Visualiser le Rêve (Vidéo)",
        beta: "BETA (Veo)",
        description: "Générez une représentation cinématographique de votre rêve en vidéo.",
        generate: "Générer Vidéo",
        processing: "Traitement...",
        error_generic: "Échec de la génération vidéo",
        error_unavailable: "Génération vidéo indisponible"
    },
    [Language.AR]: {
        title: "تصور الحلم (فيديو)",
        beta: "تجريبي (Veo)",
        description: "أنشئ تمثيلاً سينمائياً لحلمك في فيديو.",
        generate: "إنشاء فيديو",
        processing: "جاري المعالجة...",
        error_generic: "فشل إنشاء الفيديو",
        error_unavailable: "إنشاء الفيديو غير متاح"
    },
    [Language.PT]: {
        title: "Visualizar Sonho (Vídeo)",
        beta: "BETA (Veo)",
        description: "Gere uma representação cinematográfica do seu sonho em vídeo.",
        generate: "Gerar Vídeo",
        processing: "Processando...",
        error_generic: "Falha ao gerar vídeo",
        error_unavailable: "Geração de vídeo indisponível"
    },
    [Language.RU]: {
        title: "Визуализировать Сон (Видео)",
        beta: "БЕТА (Veo)",
        description: "Создайте кинематографическое видео-представление вашего сна.",
        generate: "Создать Видео",
        processing: "Обработка...",
        error_generic: "Не удалось создать видео",
        error_unavailable: "Создание видео недоступно"
    }
};

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ dreamDescription, language, userProfile }) => {
    const [loading, setLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const t = videoTranslations[language];

    const handleGenerate = async () => {
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            // Determine if premium based on subscription tier
            const isPremium = userProfile?.subscriptionTier === 'PRO' || userProfile?.subscriptionTier === 'SMART';

            const url = await generateDreamVideo(dreamDescription, userProfile, isPremium);
            if (url) {
                setVideoUrl(url);
            } else {
                setError(t.error_generic);
            }
        } catch (e) {
            setError(t.error_unavailable);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 bg-slate-900/50 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-mystic text-white">
                    {t.title}
                </h3>
                <span className="text-xs bg-fuchsia-900/50 text-fuchsia-300 px-2 py-0.5 rounded border border-fuchsia-500/30">{t.beta}</span>
            </div>

            {videoUrl ? (
                <div className="rounded-lg overflow-hidden border border-fuchsia-500/30 shadow-lg">
                    <video src={videoUrl} controls autoPlay loop className="w-full" />
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-slate-400 text-center">
                        {t.description}
                    </p>
                    <button 
                        onClick={handleGenerate}
                        disabled={loading}
                        className={`
                            px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-all
                            ${loading ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg hover:shadow-fuchsia-500/20'}
                        `}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                {t.processing}
                            </span>
                        ) : (
                            <>
                                <span className="material-icons text-sm">videocam</span>
                                {t.generate}
                            </>
                        )}
                    </button>
                    {error && <span className="text-xs text-red-400">{error}</span>}
                </div>
            )}
        </div>
    );
};

export default VideoGenerator;