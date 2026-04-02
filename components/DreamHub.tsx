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
