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
  [Language.PT]: {
    text: 'Baseado em 39.075+ relatórios científicos de sonhos de 3 bases de dados de pesquisa',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
  [Language.RU]: {
    text: 'Основано на 39 075+ научных отчётах о снах из 3 исследовательских баз данных',
    sources: ['SDDb', 'DreamBank', 'Monash'],
  },
};

const TrustBanner: React.FC<TrustBannerProps> = ({ language, onNavigateToScience }) => {
  const t = TRUST_TRANSLATIONS[language] || TRUST_TRANSLATIONS[Language.DE];
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
