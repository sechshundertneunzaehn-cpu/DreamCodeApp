
import React, { useState, useMemo } from 'react';
import { Dream, Language, ReligiousCategory, ThemeMode } from '../types';
import DreamShare from './DreamShare';
import { getTheme } from '../theme';

interface DreamCalendarProps {
    dreams: Dream[];
    language: Language;
    onClose: () => void;
    onGenerateVideo: (quality: 'normal' | 'high', style: 'cartoon' | 'anime' | 'real' | 'fantasy', prompt: string) => void;
    themeMode?: ThemeMode;
}

const calendarTranslations = {
    [Language.EN]: {
        title: "Dream Calendar & Analysis",
        tab_calendar: "Calendar",
        tab_weekly: "Weekly Report",
        tab_monthly: "Monthly Report",
        tab_algo: "Dream Algorithm",
        no_data: "Not enough data for analysis.",
        total_dreams: "Total Dreams",
        mood_trend: "Mood Trend",
        top_symbols: "Top Categories",
        anomaly: "Anomaly Detected",
        algo_desc: "Analyzing subconscious patterns and irregularities...",
        algo_normal: "Your dream patterns appear stable.",
        algo_alert: "High frequency of intense dreams detected.",
        close: "Close Analysis",
        your_dream: "Your Dream",
        btn_video: "Generate Dream Video"
    },
    [Language.DE]: {
        title: "Traum Kalender & Analyse",
        tab_calendar: "Kalender",
        tab_weekly: "Wochenanalyse",
        tab_monthly: "Monatsanalyse",
        tab_algo: "Traum-Algorithmus",
        no_data: "Nicht genügend Daten für eine Analyse.",
        total_dreams: "Gesamtträume",
        mood_trend: "Stimmungstrend",
        top_symbols: "Häufigste Kategorien",
        anomaly: "Anomalie erkannt",
        algo_desc: "Analysiere unterbewusste Muster und Unregelmäßigkeiten...",
        algo_normal: "Deine Traummuster scheinen stabil zu sein.",
        algo_alert: "Hohe Frequenz intensiver Träume erkannt.",
        close: "Analyse schließen",
        your_dream: "Dein Traum",
        btn_video: "Traumvideo erstellen"
    },
    [Language.TR]: {
        title: "Rüya Takvimi & Analiz",
        tab_calendar: "Takvim",
        tab_weekly: "Haftalık Rapor",
        tab_monthly: "Aylık Rapor",
        tab_algo: "Rüya Algoritması",
        no_data: "Analiz için yeterli veri yok.",
        total_dreams: "Toplam Rüya",
        mood_trend: "Duygu Eğilimi",
        top_symbols: "En Sık Kategoriler",
        anomaly: "Anomali Tespit Edildi",
        algo_desc: "Bilinçaltı kalıpları ve düzensizlikler analiz ediliyor...",
        algo_normal: "Rüya düzeniniz istikrarlı görünüyor.",
        algo_alert: "Yüksek sıklıkta yoğun rüyalar tespit edildi.",
        close: "Analizi Kapat",
        your_dream: "Senin Rüyan",
        btn_video: "Rüya Videosu Oluştur"
    },
    [Language.ES]: {
        title: "Calendario de Sueños y Análisis",
        tab_calendar: "Calendario",
        tab_weekly: "Informe Semanal",
        tab_monthly: "Informe Mensual",
        tab_algo: "Algoritmo de Sueños",
        no_data: "No hay suficientes datos para el análisis.",
        total_dreams: "Sueños Totales",
        mood_trend: "Tendencia de Estado de Ánimo",
        top_symbols: "Categorías Principales",
        anomaly: "Anomalía Detectada",
        algo_desc: "Analizando patrones subconscientes e irregularidades...",
        algo_normal: "Tus patrones de sueño parecen estables.",
        algo_alert: "Alta frecuencia de sueños intensos detectada.",
        close: "Cerrar Análisis",
        your_dream: "Tu Sueño",
        btn_video: "Generar Video del Sueño"
    },
    [Language.FR]: {
        title: "Calendrier des Rêves et Analyse",
        tab_calendar: "Calendrier",
        tab_weekly: "Rapport Hebdomadaire",
        tab_monthly: "Rapport Mensuel",
        tab_algo: "Algorithme des Rêves",
        no_data: "Pas assez de données pour l'analyse.",
        total_dreams: "Total des Rêves",
        mood_trend: "Tendance de l'Humeur",
        top_symbols: "Catégories Principales",
        anomaly: "Anomalie Détectée",
        algo_desc: "Analyse des modèles subconscients et des irrégularités...",
        algo_normal: "Vos modèles de rêves semblent stables.",
        algo_alert: "Haute fréquence de rêves intenses détectée.",
        close: "Fermer l'Analyse",
        your_dream: "Votre Rêve",
        btn_video: "Générer une Vidéo du Rêve"
    },
    [Language.AR]: {
        title: "تقويم الأحلام والتحليل",
        tab_calendar: "التقويم",
        tab_weekly: "التقرير الأسبوعي",
        tab_monthly: "التقرير الشهري",
        tab_algo: "خوارزمية الأحلام",
        no_data: "لا توجد بيانات كافية للتحليل.",
        total_dreams: "إجمالي الأحلام",
        mood_trend: "اتجاه المزاج",
        top_symbols: "الفئات الرئيسية",
        anomaly: "تم اكتشاف شذوذ",
        algo_desc: "تحليل الأنماط اللاواعية والشذوذات...",
        algo_normal: "تبدو أنماط أحلامك مستقرة.",
        algo_alert: "تم اكتشاف تكرار عالٍ للأحلام المكثفة.",
        close: "إغلاق التحليل",
        your_dream: "حلمك",
        btn_video: "إنشاء فيديو الحلم"
    },
    [Language.PT]: {
        title: "Calendário de Sonhos e Análise",
        tab_calendar: "Calendário",
        tab_weekly: "Relatório Semanal",
        tab_monthly: "Relatório Mensal",
        tab_algo: "Algoritmo de Sonhos",
        no_data: "Dados insuficientes para análise.",
        total_dreams: "Total de Sonhos",
        mood_trend: "Tendência de Humor",
        top_symbols: "Categorias Principais",
        anomaly: "Anomalia Detectada",
        algo_desc: "Analisando padrões subconscientes e irregularidades...",
        algo_normal: "Seus padrões de sonho parecem estáveis.",
        algo_alert: "Alta frequência de sonhos intensos detectada.",
        close: "Fechar Análise",
        your_dream: "Seu Sonho",
        btn_video: "Gerar Vídeo do Sonho"
    },
    [Language.RU]: {
        title: "Календарь Снов и Анализ",
        tab_calendar: "Календарь",
        tab_weekly: "Недельный Отчёт",
        tab_monthly: "Месячный Отчёт",
        tab_algo: "Алгоритм Снов",
        no_data: "Недостаточно данных для анализа.",
        total_dreams: "Всего Снов",
        mood_trend: "Тенденция Настроения",
        top_symbols: "Основные Категории",
        anomaly: "Обнаружена Аномалия",
        algo_desc: "Анализ подсознательных паттернов и нарушений...",
        algo_normal: "Ваши паттерны снов выглядят стабильными.",
        algo_alert: "Обнаружена высокая частота интенсивных снов.",
        close: "Закрыть Анализ",
        your_dream: "Ваш Сон",
        btn_video: "Создать Видео Сна"
    }
};

const DreamCalendar: React.FC<DreamCalendarProps> = ({ dreams, language, onClose, onGenerateVideo, themeMode }) => {
    const th = getTheme(themeMode || ThemeMode.DARK);
    const t = calendarTranslations[language];
    const [activeTab, setActiveTab] = useState<'calendar' | 'weekly' | 'monthly' | 'algo'>('calendar');
    const [selectedDream, setSelectedDream] = useState<Dream | null>(null);

    // Helper: Parse Date (DD.MM.YYYY)
    const parseDate = (dateStr: string) => {
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return new Date();
    };

    // Calendar Logic
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const getDreamsForDay = (day: number) => {
        return dreams.filter(d => {
            const date = parseDate(d.date);
            return date.getDate() === day && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
    };

    const handleDayClick = (dayDreams: Dream[]) => {
        if (dayDreams.length > 0) {
            setSelectedDream(dayDreams[0]);
        }
    };

    // Analysis Stats
    const stats = useMemo(() => {
        const allTags = dreams.flatMap(d => d.tags || []);
        const tagCounts: Record<string, number> = {};
        allTags.forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });
        
        const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
        
        const nightmareCount = dreams.filter(d => d.tags.includes(ReligiousCategory.PSYCHOLOGICAL) || (d.moods || []).includes('nightmare')).length;
        const isAnomaly = nightmareCount > 2 && (nightmareCount / dreams.length) > 0.3;

        return { sortedTags, isAnomaly, total: dreams.length };
    }, [dreams]);

    return (
        <div className={`fixed inset-0 z-[60] ${th.modalOverlay} flex flex-col items-center justify-center p-4 animate-in zoom-in-95 duration-300`}>
            <div className={`w-full max-w-4xl ${th.modalBg} border ${th.borderAccent} rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh]`}>

                {/* Header */}
                <div className={`p-6 border-b ${th.border} flex justify-between items-center ${th.sectionHeaderBg}`}>
                    <h2 className={`text-2xl font-heading ${th.textPrimary} flex items-center gap-3`}>
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center border ${th.isLight ? 'bg-violet-100 border-violet-300' : 'bg-fuchsia-900/30 border-fuchsia-500/30'}`}>
                            <span className={`material-icons ${th.isLight ? 'text-violet-600' : 'text-fuchsia-400'}`}>calendar_month</span>
                        </span>
                        {t.title}
                    </h2>
                    <button onClick={onClose} className={`w-11 h-11 rounded-full ${th.closeBtn} flex items-center justify-center transition-colors`} aria-label="Close">
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className={`px-6 pt-4 pb-2 ${th.sectionHeaderBg}`}>
                    <div className={`grid grid-cols-2 gap-2 ${th.tabBg} rounded-xl p-2`}>
                        {[
                            { id: 'calendar', label: t.tab_calendar, icon: 'event' },
                            { id: 'weekly', label: t.tab_weekly, icon: 'view_week' },
                            { id: 'monthly', label: t.tab_monthly, icon: 'analytics' },
                            { id: 'algo', label: t.tab_algo, icon: 'fingerprint' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${activeTab === tab.id ? th.tabActive : th.tabInactive}`}
                            >
                                <span className="material-icons text-lg">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-transparent">
                    
                    {/* TAB: CALENDAR */}
                    {activeTab === 'calendar' && (
                        <div className="grid grid-cols-7 gap-1.5">
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                const dayDreams = getDreamsForDay(day);
                                const hasDreams = dayDreams.length > 0;
                                return (
                                    <div
                                        key={day}
                                        onClick={() => handleDayClick(dayDreams)}
                                        className={`aspect-square min-h-[40px] rounded-xl border p-1.5 flex flex-col transition-all cursor-pointer select-none active:scale-95 ${hasDreams ? (th.isLight ? 'bg-violet-100 border-violet-400/50 hover:bg-violet-200 shadow-sm' : 'bg-fuchsia-900/20 border-fuchsia-500/50 hover:bg-fuchsia-900/40 shadow-[0_0_15px_rgba(192,38,211,0.1)]') : (th.isLight ? 'bg-white/50 border-[#e0dcf5] hover:bg-white/80' : 'bg-slate-800/20 border-white/5 text-slate-600 hover:bg-white/5')}`}
                                    >
                                        <span className={`font-bold text-xs leading-none ${hasDreams ? th.textPrimary : th.textMuted}`}>{day}</span>
                                        {hasDreams && (
                                            <div className="mt-auto flex gap-1 flex-wrap">
                                                {dayDreams.map(d => (
                                                    <div key={d.id} className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_5px_rgba(232,121,249,0.8)]"></div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* TAB: WEEKLY / MONTHLY */}
                    {(activeTab === 'weekly' || activeTab === 'monthly') && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className={`${th.statsBg} p-6 rounded-3xl border ${th.border} flex flex-col justify-center`}>
                                    <h4 className={`${th.textSecondary} text-xs uppercase font-bold mb-2 tracking-wider`}>{t.total_dreams}</h4>
                                    <span className={`text-4xl font-bold ${th.statsGradient}`}>{stats.total}</span>
                                </div>
                                <div className={`${th.statsBg} p-6 rounded-3xl border ${th.border} col-span-2`}>
                                    <h4 className={`${th.textSecondary} text-xs uppercase font-bold mb-4 tracking-wider`}>{t.top_symbols}</h4>
                                    <div className="flex gap-3 flex-wrap">
                                        {stats.sortedTags.length > 0 ? stats.sortedTags.map(([tag, count]) => (
                                            <span key={tag} className={`px-4 py-2 ${th.tagBg} rounded-xl text-sm border font-bold`}>
                                                {tag} <span className="opacity-60 text-xs ms-1">({count})</span>
                                            </span>
                                        )) : <span className={`${th.textMuted} text-sm italic`}>{t.no_data}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className={`h-64 ${th.isLight ? 'bg-gradient-to-b from-violet-50 to-white' : 'bg-gradient-to-b from-slate-900/40 to-slate-900/10'} rounded-3xl border ${th.borderLight} flex items-center justify-center`}>
                                <div className="text-center z-10">
                                    <span className={`material-icons text-7xl mb-4 opacity-50 ${th.isLight ? 'text-violet-300' : 'text-slate-700'}`}>ssid_chart</span>
                                    <p className={`${th.textSecondary} font-bold`}>{t.mood_trend}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: ALGORITHM */}
                    {activeTab === 'algo' && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                            <div className={`w-40 h-40 rounded-full flex items-center justify-center border-8 transition-all duration-1000 relative ${stats.isAnomaly ? 'border-red-500/50 shadow-[0_0_80px_rgba(239,68,68,0.4)]' : 'border-green-500/50 shadow-[0_0_80px_rgba(34,197,94,0.2)]'}`}>
                                <div className={`absolute inset-0 rounded-full opacity-20 animate-pulse ${stats.isAnomaly ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                <span className={`material-icons text-7xl ${th.textPrimary} relative z-10`}>
                                    {stats.isAnomaly ? 'priority_high' : 'fingerprint'}
                                </span>
                            </div>
                            <div>
                                <h3 className={`text-3xl font-heading ${th.textPrimary} mb-3 tracking-wide`}>
                                    {stats.isAnomaly ? t.anomaly : t.algo_normal}
                                </h3>
                                <p className={`${th.textSecondary} max-w-md mx-auto leading-relaxed`}>
                                    {t.algo_desc}
                                    <br/>
                                    {stats.isAnomaly && <span className="text-red-400 font-bold mt-3 block bg-red-900/20 py-2 rounded-lg border border-red-500/30">{t.algo_alert}</span>}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Selected Dream - UPDATED with Video & Share Buttons */}
            {selectedDream && (
                <div className={`absolute inset-0 z-[70] ${th.modalOverlay} flex items-center justify-center p-4`} onClick={() => setSelectedDream(null)}>
                     <div className={`${th.modalBg} border ${th.border} w-full max-w-lg h-[85vh] rounded-3xl overflow-y-auto relative flex flex-col shadow-2xl`} onClick={e => e.stopPropagation()}>
                         <div className={`h-64 ${th.isLight ? 'bg-violet-100' : 'bg-slate-900'} relative shrink-0`}>
                             {selectedDream.imageUrl ? <img src={selectedDream.imageUrl} className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center ${th.textMuted}`}><span className="material-icons text-6xl">image</span></div>}
                             <button onClick={() => setSelectedDream(null)} className="absolute top-3 end-3 w-11 h-11 bg-black/50 rounded-full text-white flex items-center justify-center hover:bg-black/70 transition-colors" aria-label="Close"><span className="material-icons">close</span></button>
                             <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-lg text-xs font-bold border ${th.isLight ? 'bg-white/80 border-violet-200 text-violet-700' : 'bg-black/60 border-white/10 text-white'}`}>{selectedDream.date}</div>
                         </div>
                         <div className="p-8">
                             <div className={`mb-6 p-4 rounded-xl ${th.surfaceBg} border ${th.borderLight}`}>
                                 <h4 className={`text-xs uppercase font-bold ${th.textMuted} mb-2`}>{t.your_dream}</h4>
                                 <p className={`${th.textSecondary} text-sm italic leading-relaxed`}>"{selectedDream.description}"</p>
                             </div>

                             <h2 className={`text-2xl font-heading ${th.textPrimary} mb-4`}>{selectedDream.title}</h2>
                             <div className="prose prose-sm max-w-none mb-6">
                                <p className={`${th.textSecondary} leading-relaxed whitespace-pre-line`}>{selectedDream.interpretation}</p>
                             </div>
                             <div className="mb-6 flex gap-2 flex-wrap">
                                {selectedDream.tags.map(tag => (
                                    <span key={tag} className={`px-2 py-1 ${th.surfaceBg} rounded text-[10px] uppercase tracking-wider ${th.textMuted} border ${th.borderLight}`}>{tag}</span>
                                ))}
                             </div>

                             {/* --- SHARE & PDF --- */}
                             <DreamShare
                                dream={selectedDream}
                                language={language}
                                userProfile={null}
                                onGenerateVideo={(quality, style) => onGenerateVideo(quality, style, selectedDream.description)}
                            />
                         </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default DreamCalendar;
