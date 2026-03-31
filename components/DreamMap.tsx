import React from 'react';
import { Language } from '../types';

interface DreamMapProps {
    language?: Language | string;
}

const mapTranslations: Record<string, { title: string; subtitle: string; coming: string; description: string; features: string[] }> = {
    en: {
        title: 'Dream Map',
        subtitle: 'Navigate your subconscious',
        coming: 'Coming Soon',
        description: 'Visualize your dream patterns as an interactive constellation map.',
        features: ['Symbol frequency map', 'Mood journey timeline', 'Recurring theme clusters', 'Emotional landscape view'],
    },
    de: {
        title: 'Traumkarte',
        subtitle: 'Navigiere dein Unterbewusstsein',
        coming: 'Demnächst',
        description: 'Visualisiere deine Traumuster als interaktive Konstellationskarte.',
        features: ['Symbol-Häufigkeitskarte', 'Stimmungs-Zeitlinie', 'Wiederkehrende Themen', 'Emotionale Landschaft'],
    },
    tr: {
        title: 'Rüya Haritası',
        subtitle: 'Bilinçaltını keşfet',
        coming: 'Yakında',
        description: 'Rüya kalıplarını interaktif bir harita olarak görselleştir.',
        features: ['Sembol sıklık haritası', 'Duygu zaman çizelgesi', 'Tekrarlayan temalar', 'Duygusal peyzaj'],
    },
    es: {
        title: 'Mapa de Sueños',
        subtitle: 'Navega tu subconsciente',
        coming: 'Próximamente',
        description: 'Visualiza tus patrones de sueños como un mapa de constelaciones.',
        features: ['Mapa de símbolos', 'Línea de tiempo emocional', 'Temas recurrentes', 'Paisaje emocional'],
    },
    fr: {
        title: 'Carte des Rêves',
        subtitle: 'Naviguez dans votre subconscient',
        coming: 'Bientôt',
        description: 'Visualisez vos patterns de rêves comme une carte de constellations.',
        features: ['Carte des symboles', 'Chronologie émotionnelle', 'Thèmes récurrents', 'Paysage émotionnel'],
    },
    ar: {
        title: 'خريطة الأحلام',
        subtitle: 'تنقل في لاوعيك',
        coming: 'قريباً',
        description: 'تصور أنماط أحلامك كخريطة تفاعلية للكوكبات.',
        features: ['خريطة تكرار الرموز', 'جدول زمني للمزاج', 'مجموعات الموضوعات', 'المشهد العاطفي'],
    },
    pt: {
        title: 'Mapa dos Sonhos',
        subtitle: 'Navegue pelo seu subconsciente',
        coming: 'Em breve',
        description: 'Visualize seus padrões de sonhos como um mapa de constelações.',
        features: ['Mapa de símbolos', 'Linha do tempo emocional', 'Temas recorrentes', 'Paisagem emocional'],
    },
    ru: {
        title: 'Карта Снов',
        subtitle: 'Исследуйте своё подсознание',
        coming: 'Скоро',
        description: 'Визуализируйте паттерны снов как интерактивную карту созвездий.',
        features: ['Карта частоты символов', 'Временная шкала настроения', 'Кластеры тем', 'Эмоциональный ландшафт'],
    },
};

const DreamMap: React.FC<DreamMapProps> = ({ language = 'en' }) => {
    const lang = (typeof language === 'string' ? language : String(language)).toLowerCase();
    const t = mapTranslations[lang] ?? mapTranslations['en'];

    // Static decorative "star" positions for the constellation preview
    const stars = [
        { x: '15%', y: '20%', size: 'w-2 h-2', glow: 'fuchsia' },
        { x: '42%', y: '12%', size: 'w-3 h-3', glow: 'indigo' },
        { x: '70%', y: '25%', size: 'w-2 h-2', glow: 'fuchsia' },
        { x: '25%', y: '55%', size: 'w-2.5 h-2.5', glow: 'purple' },
        { x: '58%', y: '48%', size: 'w-4 h-4', glow: 'fuchsia' },
        { x: '80%', y: '60%', size: 'w-2 h-2', glow: 'indigo' },
        { x: '35%', y: '75%', size: 'w-2 h-2', glow: 'purple' },
        { x: '65%', y: '78%', size: 'w-3 h-3', glow: 'fuchsia' },
    ];

    return (
        <div className="flex flex-col items-center justify-start min-h-[60vh] px-4 py-8">
            {/* Constellation Preview */}
            <div className="w-full max-w-sm h-48 rounded-3xl bg-gradient-to-b from-slate-900 to-[#0a0514] border border-fuchsia-500/20 relative overflow-hidden mb-8 shadow-[0_0_40px_rgba(192,38,211,0.1)]">
                {/* Star dots */}
                {stars.map((star, i) => (
                    <div
                        key={i}
                        className={`absolute ${star.size} rounded-full animate-pulse`}
                        style={{
                            left: star.x,
                            top: star.y,
                            background: star.glow === 'fuchsia' ? 'rgba(232,121,249,0.9)' : star.glow === 'indigo' ? 'rgba(129,140,248,0.9)' : 'rgba(192,132,252,0.9)',
                            boxShadow: `0 0 8px 2px ${star.glow === 'fuchsia' ? 'rgba(232,121,249,0.5)' : 'rgba(129,140,248,0.5)'}`,
                            animationDelay: `${i * 0.3}s`,
                        }}
                    />
                ))}
                {/* SVG lines connecting stars */}
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <line x1="15%" y1="20%" x2="42%" y2="12%" stroke="#e879f9" strokeWidth="0.8" />
                    <line x1="42%" y1="12%" x2="70%" y2="25%" stroke="#818cf8" strokeWidth="0.8" />
                    <line x1="25%" y1="55%" x2="58%" y2="48%" stroke="#c084fc" strokeWidth="0.8" />
                    <line x1="58%" y1="48%" x2="80%" y2="60%" stroke="#e879f9" strokeWidth="0.8" />
                    <line x1="35%" y1="75%" x2="65%" y2="78%" stroke="#818cf8" strokeWidth="0.8" />
                    <line x1="25%" y1="55%" x2="15%" y2="20%" stroke="#c084fc" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="58%" y1="48%" x2="42%" y2="12%" stroke="#e879f9" strokeWidth="0.5" strokeDasharray="3 3" />
                </svg>
                {/* Center label */}
                <div className="absolute bottom-3 inset-x-0 flex justify-center">
                    <span className="px-3 py-1 rounded-full bg-black/50 border border-fuchsia-500/20 text-fuchsia-300 text-[10px] font-bold uppercase tracking-widest">
                        {t.coming}
                    </span>
                </div>
            </div>

            {/* Title block */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="material-icons text-3xl text-fuchsia-400">explore</span>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{t.title}</h2>
                </div>
                <p className="text-slate-400 text-sm mb-2">{t.subtitle}</p>
                <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">{t.description}</p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                {t.features.map((feature, i) => (
                    <div
                        key={i}
                        className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl bg-white/5 border border-white/8 text-center"
                    >
                        <span className="material-icons text-xl text-fuchsia-400">
                            {['map', 'timeline', 'workspaces', 'mood'][i] || 'star'}
                        </span>
                        <span className="text-slate-300 text-xs leading-snug">{feature}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DreamMap;
