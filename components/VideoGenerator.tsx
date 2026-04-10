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
    },
    [Language.ZH]: {
        title: "梦境可视化（视频）",
        beta: "测试版 (Veo)",
        description: "生成梦境的电影级视频呈现。",
        generate: "生成视频",
        processing: "处理中...",
        error_generic: "视频生成失败",
        error_unavailable: "视频生成不可用"
    },
    [Language.HI]: {
        title: "सपना विज़ुअलाइज़ करें (वीडियो)",
        beta: "बीटा (Veo)",
        description: "अपने सपने का सिनेमाई वीडियो प्रस्तुतीकरण बनाएं।",
        generate: "वीडियो बनाएं",
        processing: "प्रोसेसिंग...",
        error_generic: "वीडियो बनाने में विफल",
        error_unavailable: "वीडियो जनरेशन उपलब्ध नहीं है"
    },
    [Language.JA]: {
        title: "夢を映像化（動画）",
        beta: "ベータ版 (Veo)",
        description: "夢のシネマティックな動画を生成します。",
        generate: "動画を生成",
        processing: "処理中...",
        error_generic: "動画の生成に失敗しました",
        error_unavailable: "動画生成は利用できません"
    },
    [Language.KO]: {
        title: "꿈 시각화 (영상)",
        beta: "베타 (Veo)",
        description: "꿈의 시네마틱 영상을 생성합니다.",
        generate: "영상 생성",
        processing: "처리 중...",
        error_generic: "영상 생성 실패",
        error_unavailable: "영상 생성을 사용할 수 없습니다"
    },
    [Language.ID]: {
        title: "Visualisasi Mimpi (Video)",
        beta: "BETA (Veo)",
        description: "Buat representasi video sinematik dari mimpi Anda.",
        generate: "Buat Video",
        processing: "Memproses...",
        error_generic: "Gagal membuat video",
        error_unavailable: "Pembuatan video tidak tersedia"
    },
    [Language.FA]: {
        title: "تصویرسازی خواب (ویدیو)",
        beta: "آزمایشی (Veo)",
        description: "یک نمایش ویدیویی سینمایی از خواب خود بسازید.",
        generate: "ساخت ویدیو",
        processing: "در حال پردازش...",
        error_generic: "ساخت ویدیو ناموفق بود",
        error_unavailable: "ساخت ویدیو در دسترس نیست"
    },
    [Language.IT]: {
        title: "Visualizza Sogno (Video)",
        beta: "BETA (Veo)",
        description: "Genera una rappresentazione cinematografica del tuo sogno in video.",
        generate: "Genera Video",
        processing: "Elaborazione...",
        error_generic: "Generazione video fallita",
        error_unavailable: "Generazione video non disponibile"
    },
    [Language.PL]: {
        title: "Wizualizuj Sen (Wideo)",
        beta: "BETA (Veo)",
        description: "Wygeneruj kinematograficzną reprezentację swojego snu w formie wideo.",
        generate: "Generuj Wideo",
        processing: "Przetwarzanie...",
        error_generic: "Nie udało się wygenerować wideo",
        error_unavailable: "Generowanie wideo niedostępne"
    },
    [Language.BN]: {
        title: "স্বপ্ন ভিজ্যুয়ালাইজ করুন (ভিডিও)",
        beta: "বিটা (Veo)",
        description: "আপনার স্বপ্নের একটি সিনেম্যাটিক ভিডিও উপস্থাপনা তৈরি করুন।",
        generate: "ভিডিও তৈরি করুন",
        processing: "প্রক্রিয়াকরণ...",
        error_generic: "ভিডিও তৈরি ব্যর্থ",
        error_unavailable: "ভিডিও তৈরি অনুপলব্ধ"
    },
    [Language.UR]: {
        title: "خواب کو تصور کریں (ویڈیو)",
        beta: "بیٹا (Veo)",
        description: "اپنے خواب کی سنیمائی ویڈیو نمائندگی بنائیں۔",
        generate: "ویڈیو بنائیں",
        processing: "پروسیسنگ...",
        error_generic: "ویڈیو بنانے میں ناکامی",
        error_unavailable: "ویڈیو بنانا دستیاب نہیں"
    },
    [Language.VI]: {
        title: "Hình dung Giấc mơ (Video)",
        beta: "BETA (Veo)",
        description: "Tạo video điện ảnh về giấc mơ của bạn.",
        generate: "Tạo Video",
        processing: "Đang xử lý...",
        error_generic: "Tạo video thất bại",
        error_unavailable: "Tạo video không khả dụng"
    },
    [Language.TH]: {
        title: "แสดงภาพความฝัน (วิดีโอ)",
        beta: "เบต้า (Veo)",
        description: "สร้างวิดีโอแบบภาพยนตร์จากความฝันของคุณ",
        generate: "สร้างวิดีโอ",
        processing: "กำลังประมวลผล...",
        error_generic: "สร้างวิดีโอไม่สำเร็จ",
        error_unavailable: "การสร้างวิดีโอไม่พร้อมใช้งาน"
    },
    [Language.SW]: {
        title: "Onyesha Ndoto (Video)",
        beta: "BETA (Veo)",
        description: "Tengeneza uwakilishi wa video wa sinema wa ndoto yako.",
        generate: "Tengeneza Video",
        processing: "Inachakata...",
        error_generic: "Imeshindwa kutengeneza video",
        error_unavailable: "Utengenezaji wa video haupatikani"
    },
    [Language.HU]: {
        title: "Álom megjelenítése (Videó)",
        beta: "BÉTA (Veo)",
        description: "Készíts filmes videómegjelenítést álmodból.",
        generate: "Videó készítése",
        processing: "Feldolgozás...",
        error_generic: "A videó készítése sikertelen",
        error_unavailable: "A videókészítés nem elérhető"
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

    const isRtl = [Language.AR, Language.FA, Language.UR].includes(language);
    return (
        <div dir={isRtl ? 'rtl' : 'ltr'} className="mt-8 bg-slate-900/50 border border-white/10 rounded-xl p-6">
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