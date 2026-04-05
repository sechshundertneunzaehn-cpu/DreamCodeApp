import React from 'react';
import { Language, ThemeMode } from '../types';
import { getTheme } from '../theme';

interface DreamHubProps {
    language?: Language | string;
    themeMode?: string;
    dreams?: any[];
    onClose?: () => void;
}

const hubTranslations: Record<string, { title: string; subtitle: string; coming: string; features: string[] }> = {
    en: {
        title: 'Dream Hub',
        subtitle: 'Your dream community space',
        coming: 'Coming Soon',
        features: ['Share dreams with the community', 'Discover others\' interpretations', 'Join dream circles', 'Collaborative dream analysis'],
    },
    de: {
        title: 'Dream Hub',
        subtitle: 'Dein Traum-Community-Bereich',
        coming: 'Demnächst',
        features: ['Träume mit der Community teilen', 'Deutungen anderer entdecken', 'Dream-Kreisen beitreten', 'Kollaborative Traumanalyse'],
    },
    tr: {
        title: 'Rüya Merkezi',
        subtitle: 'Rüya topluluğun alanı',
        coming: 'Yakında',
        features: ['Rüyaları topluluğla paylaş', 'Yorumları keşfet', 'Rüya çevrelerine katıl', 'Ortak rüya analizi'],
    },
    es: {
        title: 'Centro de Sueños',
        subtitle: 'Tu espacio de comunidad de sueños',
        coming: 'Próximamente',
        features: ['Comparte sueños con la comunidad', 'Descubre interpretaciones', 'Únete a círculos de sueños', 'Análisis colaborativo'],
    },
    fr: {
        title: 'Hub des Rêves',
        subtitle: 'Votre espace communautaire de rêves',
        coming: 'Bientôt',
        features: ['Partager des rêves', 'Découvrir des interprétations', 'Rejoindre des cercles', 'Analyse collaborative'],
    },
    ar: {
        title: 'مركز الأحلام',
        subtitle: 'فضاء مجتمع أحلامك',
        coming: 'قريباً',
        features: ['شارك الأحلام مع المجتمع', 'اكتشف التفسيرات', 'انضم إلى دوائر الأحلام', 'تحليل تعاوني'],
    },
    pt: {
        title: 'Hub dos Sonhos',
        subtitle: 'Seu espaço comunitário de sonhos',
        coming: 'Em breve',
        features: ['Compartilhe sonhos', 'Descubra interpretações', 'Junte-se a círculos', 'Análise colaborativa'],
    },
    ru: {
        title: 'Хаб Снов',
        subtitle: 'Ваше сообщество сновидений',
        coming: 'Скоро',
        features: ['Делитесь снами с сообществом', 'Открывайте толкования', 'Вступайте в круги снов', 'Совместный анализ'],
    },
    zh: {
        title: '梦境中心',
        subtitle: '你的梦境社区空间',
        coming: '即将推出',
        features: ['与社区分享梦境', '发现他人的解梦', '加入梦境圈子', '协作梦境分析'],
    },
    hi: {
        title: 'ड्रीम हब',
        subtitle: 'आपका स्वप्न समुदाय स्थान',
        coming: 'जल्द आ रहा है',
        features: ['समुदाय के साथ सपने साझा करें', 'दूसरों की व्याख्याएँ खोजें', 'स्वप्न मंडलों में शामिल हों', 'सहयोगी स्वप्न विश्लेषण'],
    },
    ja: {
        title: 'ドリームハブ',
        subtitle: 'あなたの夢のコミュニティスペース',
        coming: '近日公開',
        features: ['コミュニティと夢を共有', '他の人の解釈を発見', 'ドリームサークルに参加', '共同夢分析'],
    },
    ko: {
        title: '드림 허브',
        subtitle: '당신의 꿈 커뮤니티 공간',
        coming: '곧 출시',
        features: ['커뮤니티와 꿈 공유', '다른 사람의 해몽 발견', '꿈 서클 참여', '협력 꿈 분석'],
    },
    id: {
        title: 'Pusat Mimpi',
        subtitle: 'Ruang komunitas mimpimu',
        coming: 'Segera Hadir',
        features: ['Bagikan mimpi dengan komunitas', 'Temukan tafsir mimpi lainnya', 'Bergabung dengan lingkaran mimpi', 'Analisis mimpi kolaboratif'],
    },
    fa: {
        title: 'مرکز رؤیا',
        subtitle: 'فضای انجمن رؤیاهای شما',
        coming: 'به زودی',
        features: ['رؤیاها را با انجمن به اشتراک بگذارید', 'تعبیرهای دیگران را کشف کنید', 'به حلقه‌های رؤیا بپیوندید', 'تحلیل مشارکتی رؤیا'],
    },
    it: {
        title: 'Hub dei Sogni',
        subtitle: 'Il tuo spazio comunitario dei sogni',
        coming: 'Prossimamente',
        features: ['Condividi sogni con la comunità', 'Scopri le interpretazioni', 'Unisciti ai circoli dei sogni', 'Analisi collaborativa dei sogni'],
    },
    pl: {
        title: 'Centrum Snów',
        subtitle: 'Twoja przestrzeń społeczności snów',
        coming: 'Wkrótce',
        features: ['Dziel się snami ze społecznością', 'Odkrywaj interpretacje innych', 'Dołącz do kręgów snów', 'Wspólna analiza snów'],
    },
    bn: {
        title: 'স্বপ্ন হাব',
        subtitle: 'আপনার স্বপ্ন সম্প্রদায়ের জায়গা',
        coming: 'শীঘ্রই আসছে',
        features: ['সম্প্রদায়ের সাথে স্বপ্ন শেয়ার করুন', 'অন্যদের ব্যাখ্যা আবিষ্কার করুন', 'স্বপ্ন চক্রে যোগ দিন', 'সহযোগী স্বপ্ন বিশ্লেষণ'],
    },
    ur: {
        title: 'خوابوں کا مرکز',
        subtitle: 'آپ کی خوابوں کی کمیونٹی',
        coming: 'جلد آ رہا ہے',
        features: ['کمیونٹی کے ساتھ خواب شیئر کریں', 'دوسروں کی تعبیریں دریافت کریں', 'خواب حلقوں میں شامل ہوں', 'مشترکہ خواب تجزیہ'],
    },
    vi: {
        title: 'Trung tâm Giấc mơ',
        subtitle: 'Không gian cộng đồng giấc mơ của bạn',
        coming: 'Sắp ra mắt',
        features: ['Chia sẻ giấc mơ với cộng đồng', 'Khám phá giải mộng của người khác', 'Tham gia vòng tròn giấc mơ', 'Phân tích giấc mơ hợp tác'],
    },
    th: {
        title: 'ศูนย์กลางความฝัน',
        subtitle: 'พื้นที่ชุมชนความฝันของคุณ',
        coming: 'เร็ว ๆ นี้',
        features: ['แบ่งปันความฝันกับชุมชน', 'ค้นพบการตีความของผู้อื่น', 'เข้าร่วมวงความฝัน', 'วิเคราะห์ความฝันร่วมกัน'],
    },
    sw: {
        title: 'Kituo cha Ndoto',
        subtitle: 'Nafasi ya jamii ya ndoto zako',
        coming: 'Inakuja Hivi Karibuni',
        features: ['Shiriki ndoto na jamii', 'Gundua tafsiri za wengine', 'Jiunge na miduara ya ndoto', 'Uchambuzi wa ndoto kwa ushirikiano'],
    },
    hu: {
        title: 'Álomközpont',
        subtitle: 'A te álom-közösségi tered',
        coming: 'Hamarosan',
        features: ['Oszd meg álmaidat a közösséggel', 'Fedezd fel mások értelmezéseit', 'Csatlakozz álomkörökhöz', 'Közös álomélemzés'],
    },
};

const DreamHub: React.FC<DreamHubProps> = ({ language = 'en', onClose, themeMode }) => {
    const th = getTheme((themeMode as ThemeMode) || ThemeMode.DARK);
    const isLight = th.isLight;
    const lang = (typeof language === 'string' ? language : String(language)).toLowerCase();
    const t = hubTranslations[lang] ?? hubTranslations['en'];

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12 text-center relative">
            {onClose && (
                <button onClick={onClose} className={`absolute top-4 end-4 w-11 h-11 rounded-full flex items-center justify-center z-50 transition-colors ${isLight ? 'bg-[#e0dcf5] hover:bg-[#c4bce6] text-[#4a3a5d]' : 'bg-white/10 hover:bg-white/20 text-white'}`} aria-label="Close">
                    <span className="material-icons">close</span>
                </button>
            )}
            {/* Icon */}
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-fuchsia-600/30 to-indigo-600/30 border border-fuchsia-500/30 flex items-center justify-center shadow-[0_0_60px_rgba(192,38,211,0.2)]">
                    <span className="material-icons text-5xl text-fuchsia-400">hub</span>
                </div>
                <div className="absolute -top-1 -end-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                    <span className="material-icons text-xs text-white">bolt</span>
                </div>
            </div>

            {/* Title */}
            <h2 className={`text-3xl font-bold mb-2 tracking-tight ${isLight ? 'text-[#2a1a3a]' : 'text-white'}`}>{t.title}</h2>
            <p className={`text-sm mb-6 ${isLight ? 'text-[#6b5a80]' : 'text-slate-400'}`}>{t.subtitle}</p>

            {/* Coming Soon Badge */}
            <span className="px-4 py-1.5 rounded-full bg-fuchsia-600/20 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-bold uppercase tracking-widest mb-10">
                {t.coming}
            </span>

            {/* Feature list */}
            <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
                {t.features.map((feature, i) => (
                    <div
                        key={i}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-start ${isLight ? 'bg-white/70 border-[#c4bce6]' : 'bg-white/5 border-white/8'}`}
                    >
                        <span className="material-icons text-fuchsia-400 text-base flex-shrink-0">
                            {['groups', 'explore', 'workspaces', 'psychology'][i] || 'star'}
                        </span>
                        <span className={`text-sm leading-snug ${isLight ? 'text-[#4a3a5d]' : 'text-slate-300'}`}>{feature}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DreamHub;
