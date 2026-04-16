import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../types';

interface TrustBannerProps {
  language: Language;
  onNavigateToScience: () => void;
}

const TRUST_TRANSLATIONS: Record<Language, { text: string; sources: string[] }> = {
  [Language.DE]: {
    text: 'Basierend auf 39.075+ wissenschaftlichen Traumberichten aus 3 Forschungsdatenbanken',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.EN]: {
    text: 'Based on 39,075+ scientific dream reports from 3 research databases',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.TR]: {
    text: '3 araştırma veri tabanından 39.075+ bilimsel rüya raporuna dayanmaktadır',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.ES]: {
    text: 'Basado en 39.075+ informes científicos de sueños de 3 bases de datos de investigación',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.FR]: {
    text: 'Basé sur 39 075+ rapports scientifiques de rêves issus de 3 bases de données',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.AR]: {
    text: 'يستند إلى أكثر من 39,075 تقرير علمي للأحلام من 3 قواعد بيانات بحثية',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.AR_GULF]: { text: 'مبني على أكثر من 39,075 تقرير علمي للأحلام من 3 قواعد بيانات', sources: ['SDDb', 'DreamBank', 'Monash'] },
  [Language.AR_EG]: { text: 'مبني على أكتر من 39,075 تقرير علمي للأحلام من 3 قواعد بيانات', sources: ['SDDb', 'DreamBank', 'Monash'] },
  [Language.AR_LEV]: { text: 'مبني على أكتر من 39,075 تقرير علمي للأحلام من 3 قواعد بيانات', sources: ['SDDb', 'DreamBank', 'Monash'] },
  [Language.AR_MAG]: { text: 'مبني على أكثر من 39,075 تقرير علمي للأحلام من 3 قواعد بيانات', sources: ['SDDb', 'DreamBank', 'Monash'] },
  [Language.AR_IQ]: { text: 'مبني على أكثر من 39,075 تقرير علمي للأحلام من 3 قواعد بيانات', sources: ['SDDb', 'DreamBank', 'Monash'] },
  [Language.PT]: {
    text: 'Baseado em 39.075+ relatórios científicos de sonhos de 3 bases de dados de pesquisa',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.RU]: {
    text: 'Основано на 39 075+ научных отчётах о снах из 3 исследовательских баз данных',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.ZH]: {
    text: '基于3个研究数据库的39,075+份科学梦境报告',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.HI]: {
    text: '3 शोध डेटाबेस से 39,075+ वैज्ञानिक स्वप्न रिपोर्ट पर आधारित',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.JA]: {
    text: '3つの研究データベースから39,075件以上の科学的な夢のレポートに基づいています',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.KO]: {
    text: '3개 연구 데이터베이스의 39,075건 이상의 과학적 꿈 보고서를 기반으로 합니다',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.ID]: {
    text: 'Berdasarkan 39.075+ laporan mimpi ilmiah dari 3 database penelitian',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.FA]: {
    text: 'بر اساس بیش از 39,075 گزارش علمی رؤیا از 3 پایگاه داده تحقیقاتی',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.IT]: {
    text: 'Basato su oltre 39.075 rapporti scientifici sui sogni da 3 database di ricerca',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.PL]: {
    text: 'Na podstawie ponad 39 075 naukowych raportów o snach z 3 baz danych badawczych',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.BN]: {
    text: '3টি গবেষণা ডেটাবেস থেকে 39,075+ বৈজ্ঞানিক স্বপ্ন প্রতিবেদনের উপর ভিত্তি করে',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.UR]: {
    text: '3 تحقیقی ڈیٹابیس سے 39,075+ سائنسی خوابوں کی رپورٹس پر مبنی',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.VI]: {
    text: 'Dựa trên hơn 39.075 báo cáo giấc mơ khoa học từ 3 cơ sở dữ liệu nghiên cứu',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.TH]: {
    text: 'อ้างอิงจากรายงานความฝันทางวิทยาศาสตร์กว่า 39,075 รายการจาก 3 ฐานข้อมูลวิจัย',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.SW]: {
    text: 'Kulingana na ripoti 39,075+ za kisayansi za ndoto kutoka hifadhidata 3 za utafiti',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.HU]: {
    text: '39 075+ tudomanyos alomjelentes alapjan 3 kutatasi adatbazisbol',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.TA]: {
    text: '3 ஆராய்ச்சி தரவுத்தளங்களிலிருந்து 39,075+ அறிவியல் கனவு அறிக்கைகளின் அடிப்படையில்',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.TE]: {
    text: '3 పరిశోధన డేటాబేస్‌ల నుండి 39,075+ శాస్త్రీయ కల నివేదికల ఆధారంగా',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.TL]: {
    text: 'Batay sa 39,075+ siyentipikong ulat ng panaginip mula sa 3 database ng pananaliksik',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.ML]: {
    text: '3 ഗവേഷണ ഡാറ്റാബേസുകളിൽ നിന്നുള്ള 39,075+ ശാസ്ത്രീയ സ്വപ്ന റിപ്പോർട്ടുകളുടെ അടിസ്ഥാനത്തിൽ',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.MR]: {
    text: '3 संशोधन डेटाबेसमधील 39,075+ वैज्ञानिक स्वप्न अहवालांवर आधारित',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.KN]: {
    text: '3 ಸಂಶೋಧನಾ ಡೇಟಾಬೇಸ್‌ಗಳಿಂದ 39,075+ ವೈಜ್ಞಾನಿಕ ಕನಸು ವರದಿಗಳ ಆಧಾರದ ಮೇಲೆ',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.GU]: {
    text: '3 સંશોધન ડેટાબેઝમાંથી 39,075+ વૈજ્ઞાનિક સ્વપ્ન અહેવાલો પર આધારિત',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.HE]: {
    text: 'מבוסס על 39,075+ דוחות חלומות מדעיים מ-3 מאגרי מחקר',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.NE]: {
    text: '3 अनुसन्धान डाटाबेसबाट 39,075+ वैज्ञानिक सपना प्रतिवेदनहरूमा आधारित',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.PRS]: {
    text: 'بر اساس بیشتر از 39,075 گزارش علمی خواب از 3 پایگاه داده تحقیقاتی',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
};

const TrustBanner: React.FC<TrustBannerProps> = ({ language, onNavigateToScience }) => {
  const t = TRUST_TRANSLATIONS[language] || TRUST_TRANSLATIONS[language.startsWith("ar") ? Language.AR : Language.DE] || TRUST_TRANSLATIONS[Language.DE];
  const isRtl = ((language as string).startsWith('ar') || [Language.FA, Language.UR, Language.HE, Language.PRS].includes(language));
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      dir={isRtl ? 'rtl' : 'ltr'}
      onClick={onNavigateToScience}
      className={`w-full text-left rounded-xl border border-purple-500/20 bg-purple-950/30 backdrop-blur-sm px-4 py-3 mb-5 transition-all duration-700 hover:border-purple-400/40 hover:bg-purple-950/40 group ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-500/30 flex items-center justify-center">
          <span className="material-icons text-purple-300 text-base">biotech</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-300 text-xs leading-snug">{t.text}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {t.sources.map((src) => (
              <span
                key={src}
                className="px-2 py-0.5 rounded-full bg-violet-900/50 border border-violet-500/30 text-violet-300 text-[10px] font-bold"
              >
                {src}
              </span>
            ))}
          </div>
        </div>
        <span className="material-icons text-slate-600 group-hover:text-purple-400 transition-colors text-base shrink-0">chevron_right</span>
      </div>
    </button>
  );
};

export default TrustBanner;
