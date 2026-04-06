import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import symbolData from '../data/traumsymbole.json';

interface DreamSymbolsPageProps {
  language: Language;
  onClose: () => void;
  onNavigateHome: () => void;
  themeMode?: string;
}

// ─── Translations ────────────────────────────────────────────────────────────

const T: Record<string, {
  back: string; title: string; hero_title: string; hero_subtitle: string;
  stats_symbols: string; stats_freud: string; stats_ibn_sirin: string; stats_both: string;
  stats_categories: string; search_placeholder: string; all_categories: string;
  source_freud: string; source_ibn_sirin: string; no_results: string;
  context_examples: string; original_quote: string; related_symbols: string;
  east_west: string; western: string; eastern: string; cta_title: string; cta_btn: string;
  interpretations: string; category_names: Record<string, string>;
}> = {
  de: {
    back: 'Zurück', title: 'Traumsymbol-Bibliothek',
    hero_title: 'Die große Traumsymbol-Datenbank',
    hero_subtitle: '258 Traumsymbole mit Deutungen aus Psychoanalyse (Freud) und islamischer Tradition (Ibn Sirin)',
    stats_symbols: 'Symbole', stats_freud: 'Freud-Deutungen', stats_ibn_sirin: 'Ibn-Sirin-Deutungen',
    stats_both: 'mit beiden Perspektiven', stats_categories: 'Kategorien',
    search_placeholder: 'Symbol suchen...', all_categories: 'Alle',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'Keine Symbole gefunden',
    context_examples: 'Kontext-Beispiele', original_quote: 'Originalzitat',
    related_symbols: 'Verwandte Symbole', east_west: 'Ost-West-Vergleich',
    western: 'Westlich (Freud)', eastern: 'Östlich (Ibn Sirin)',
    cta_title: 'Bereit deinen Traum zu deuten?', cta_btn: 'Jetzt Traum eingeben',
    interpretations: 'Deutungen',
    category_names: { 'Natur': 'Natur', 'Objekte': 'Objekte', 'Personen': 'Personen', 'Tiere': 'Tiere', 'Aktivitäten': 'Aktivitäten', 'Emotionen': 'Emotionen', 'Körper': 'Körper', 'Orte': 'Orte' },
  },
  en: {
    back: 'Back', title: 'Dream Symbol Library',
    hero_title: 'The Great Dream Symbol Database',
    hero_subtitle: '258 dream symbols with interpretations from Psychoanalysis (Freud) and Islamic tradition (Ibn Sirin)',
    stats_symbols: 'Symbols', stats_freud: 'Freud Interpretations', stats_ibn_sirin: 'Ibn Sirin Interpretations',
    stats_both: 'with both perspectives', stats_categories: 'Categories',
    search_placeholder: 'Search symbol...', all_categories: 'All',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'No symbols found',
    context_examples: 'Context Examples', original_quote: 'Original Quote',
    related_symbols: 'Related Symbols', east_west: 'East-West Comparison',
    western: 'Western (Freud)', eastern: 'Eastern (Ibn Sirin)',
    cta_title: 'Ready to interpret your dream?', cta_btn: 'Enter dream now',
    interpretations: 'Interpretations',
    category_names: { 'Natur': 'Nature', 'Objekte': 'Objects', 'Personen': 'People', 'Tiere': 'Animals', 'Aktivitäten': 'Activities', 'Emotionen': 'Emotions', 'Körper': 'Body', 'Orte': 'Places' },
  },
  tr: {
    back: 'Geri', title: 'Rüya Sembol Kütüphanesi',
    hero_title: 'Büyük Rüya Sembol Veritabanı',
    hero_subtitle: '258 rüya sembolü — Psikanaliz (Freud) ve İslami gelenek (İbn Sirin) yorumlarıyla',
    stats_symbols: 'Sembol', stats_freud: 'Freud Yorumu', stats_ibn_sirin: 'İbn Sirin Yorumu',
    stats_both: 'her iki perspektifle', stats_categories: 'Kategori',
    search_placeholder: 'Sembol ara...', all_categories: 'Tümü',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'İbn Sirin',
    no_results: 'Sembol bulunamadı',
    context_examples: 'Bağlam Örnekleri', original_quote: 'Orijinal Alıntı',
    related_symbols: 'İlgili Semboller', east_west: 'Doğu-Batı Karşılaştırması',
    western: 'Batı (Freud)', eastern: 'Doğu (İbn Sirin)',
    cta_title: 'Rüyanı yorumlamaya hazır mısın?', cta_btn: 'Şimdi rüya gir',
    interpretations: 'Yorumlar',
    category_names: { 'Natur': 'Doğa', 'Objekte': 'Nesneler', 'Personen': 'Kişiler', 'Tiere': 'Hayvanlar', 'Aktivitäten': 'Aktiviteler', 'Emotionen': 'Duygular', 'Körper': 'Vücut', 'Orte': 'Yerler' },
  },
  es: {
    back: 'Volver', title: 'Biblioteca de Símbolos Oníricos',
    hero_title: 'La Gran Base de Datos de Símbolos Oníricos',
    hero_subtitle: '258 símbolos oníricos con interpretaciones del Psicoanálisis (Freud) y la tradición islámica (Ibn Sirin)',
    stats_symbols: 'Símbolos', stats_freud: 'Interpretaciones de Freud', stats_ibn_sirin: 'Interpretaciones de Ibn Sirin',
    stats_both: 'con ambas perspectivas', stats_categories: 'Categorías',
    search_placeholder: 'Buscar símbolo...', all_categories: 'Todos',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'No se encontraron símbolos',
    context_examples: 'Ejemplos de Contexto', original_quote: 'Cita Original',
    related_symbols: 'Símbolos Relacionados', east_west: 'Comparación Este-Oeste',
    western: 'Occidental (Freud)', eastern: 'Oriental (Ibn Sirin)',
    cta_title: '¿Listo para interpretar tu sueño?', cta_btn: 'Introducir sueño ahora',
    interpretations: 'Interpretaciones',
    category_names: { 'Natur': 'Naturaleza', 'Objekte': 'Objetos', 'Personen': 'Personas', 'Tiere': 'Animales', 'Aktivitäten': 'Actividades', 'Emotionen': 'Emociones', 'Körper': 'Cuerpo', 'Orte': 'Lugares' },
  },
  fr: {
    back: 'Retour', title: 'Bibliothèque des Symboles Oniriques',
    hero_title: 'La Grande Base de Données des Symboles Oniriques',
    hero_subtitle: '258 symboles oniriques avec interprétations de la Psychanalyse (Freud) et de la tradition islamique (Ibn Sirin)',
    stats_symbols: 'Symboles', stats_freud: 'Interprétations de Freud', stats_ibn_sirin: 'Interprétations d\'Ibn Sirin',
    stats_both: 'avec les deux perspectives', stats_categories: 'Catégories',
    search_placeholder: 'Rechercher un symbole...', all_categories: 'Tous',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'Aucun symbole trouvé',
    context_examples: 'Exemples de Contexte', original_quote: 'Citation Originale',
    related_symbols: 'Symboles Associés', east_west: 'Comparaison Est-Ouest',
    western: 'Occidental (Freud)', eastern: 'Oriental (Ibn Sirin)',
    cta_title: 'Prêt à interpréter votre rêve ?', cta_btn: 'Saisir un rêve maintenant',
    interpretations: 'Interprétations',
    category_names: { 'Natur': 'Nature', 'Objekte': 'Objets', 'Personen': 'Personnes', 'Tiere': 'Animaux', 'Aktivitäten': 'Activités', 'Emotionen': 'Émotions', 'Körper': 'Corps', 'Orte': 'Lieux' },
  },
  ar: {
    back: 'رجوع', title: 'مكتبة رموز الأحلام',
    hero_title: 'قاعدة بيانات رموز الأحلام الكبرى',
    hero_subtitle: '258 رمزاً للأحلام مع تفسيرات من التحليل النفسي (فرويد) والتراث الإسلامي (ابن سيرين)',
    stats_symbols: 'رمز', stats_freud: 'تفسير فرويد', stats_ibn_sirin: 'تفسير ابن سيرين',
    stats_both: 'بكلا المنظورين', stats_categories: 'فئات',
    search_placeholder: 'ابحث عن رمز...', all_categories: 'الكل',
    source_freud: 'سيغموند فرويد', source_ibn_sirin: 'ابن سيرين',
    no_results: 'لم يتم العثور على رموز',
    context_examples: 'أمثلة سياقية', original_quote: 'اقتباس أصلي',
    related_symbols: 'رموز مرتبطة', east_west: 'مقارنة شرق-غرب',
    western: 'غربي (فرويد)', eastern: 'شرقي (ابن سيرين)',
    cta_title: 'هل أنت مستعد لتفسير حلمك؟', cta_btn: 'أدخل الحلم الآن',
    interpretations: 'تفسيرات',
    category_names: { 'Natur': 'طبيعة', 'Objekte': 'أشياء', 'Personen': 'أشخاص', 'Tiere': 'حيوانات', 'Aktivitäten': 'أنشطة', 'Emotionen': 'مشاعر', 'Körper': 'جسم', 'Orte': 'أماكن' },
  },
  pt: {
    back: 'Voltar', title: 'Biblioteca de Símbolos Oníricos',
    hero_title: 'A Grande Base de Dados de Símbolos Oníricos',
    hero_subtitle: '258 símbolos oníricos com interpretações da Psicanálise (Freud) e da tradição islâmica (Ibn Sirin)',
    stats_symbols: 'Símbolos', stats_freud: 'Interpretações de Freud', stats_ibn_sirin: 'Interpretações de Ibn Sirin',
    stats_both: 'com ambas as perspectivas', stats_categories: 'Categorias',
    search_placeholder: 'Pesquisar símbolo...', all_categories: 'Todos',
    source_freud: 'Sigmund Freud', source_ibn_sirin: 'Ibn Sirin',
    no_results: 'Nenhum símbolo encontrado',
    context_examples: 'Exemplos de Contexto', original_quote: 'Citação Original',
    related_symbols: 'Símbolos Relacionados', east_west: 'Comparação Leste-Oeste',
    western: 'Ocidental (Freud)', eastern: 'Oriental (Ibn Sirin)',
    cta_title: 'Pronto para interpretar seu sonho?', cta_btn: 'Inserir sonho agora',
    interpretations: 'Interpretações',
    category_names: { 'Natur': 'Natureza', 'Objekte': 'Objetos', 'Personen': 'Pessoas', 'Tiere': 'Animais', 'Aktivitäten': 'Atividades', 'Emotionen': 'Emoções', 'Körper': 'Corpo', 'Orte': 'Lugares' },
  },
  ru: {
    back: 'Назад', title: 'Библиотека символов снов',
    hero_title: 'Большая база данных символов снов',
    hero_subtitle: '258 символов снов с толкованиями из психоанализа (Фрейд) и исламской традиции (Ибн Сирин)',
    stats_symbols: 'Символов', stats_freud: 'Толкований Фрейда', stats_ibn_sirin: 'Толкований Ибн Сирина',
    stats_both: 'с обоими перспективами', stats_categories: 'Категорий',
    search_placeholder: 'Искать символ...', all_categories: 'Все',
    source_freud: 'Зигмунд Фрейд', source_ibn_sirin: 'Ибн Сирин',
    no_results: 'Символы не найдены',
    context_examples: 'Контекстные примеры', original_quote: 'Оригинальная цитата',
    related_symbols: 'Связанные символы', east_west: 'Сравнение Восток-Запад',
    western: 'Западный (Фрейд)', eastern: 'Восточный (Ибн Сирин)',
    cta_title: 'Готовы истолковать свой сон?', cta_btn: 'Ввести сон сейчас',
    interpretations: 'Толкования',
    category_names: { 'Natur': 'Природа', 'Objekte': 'Предметы', 'Personen': 'Люди', 'Tiere': 'Животные', 'Aktivitäten': 'Действия', 'Emotionen': 'Эмоции', 'Körper': 'Тело', 'Orte': 'Места' },
  },
};

// ─── Category Icons ──────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  'Natur': '🌿', 'Objekte': '🔑', 'Personen': '👤', 'Tiere': '🐍',
  'Aktivitäten': '🏃', 'Emotionen': '💭', 'Körper': '🫀', 'Orte': '🏛️',
};

// ─── Helper: render bold markdown ────────────────────────────────────────────

function renderBold(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>);
}

// ─── Source definitions ──────────────────────────────────────────────────────

const SOURCE_DEFS: { key: string; label: string; icon: string; color: string }[] = [
  { key: 'freud', label: 'Freud', icon: '🧠', color: 'blue' },
  { key: 'ibn_sirin', label: 'Ibn Sirin', icon: '🕌', color: 'emerald' },
  { key: 'jung', label: 'C.G. Jung', icon: '🔮', color: 'purple' },
  { key: 'gestalt', label: 'Gestalt', icon: '🪞', color: 'orange' },
  { key: 'nabulsi', label: 'Al-Nabulsi', icon: '📖', color: 'teal' },
  { key: 'medieval', label: 'Mittelalter', icon: '🏰', color: 'amber' },
  { key: 'church_fathers', label: 'Kirchenväter', icon: '⛪', color: 'rose' },
  { key: 'modern_theology', label: 'Mod. Theologie', icon: '✝️', color: 'sky' },
  { key: 'tibetan', label: 'Tibet', icon: '🏔️', color: 'violet' },
  { key: 'zen', label: 'Zen', icon: '☯️', color: 'lime' },
  { key: 'theravada', label: 'Theravada', icon: '🪷', color: 'yellow' },
  { key: 'western_zodiac', label: 'Astrologie', icon: '♈', color: 'pink' },
];

function getSymbolSources(sym: any): string[] {
  const sources: string[] = [];
  if (sym.freud?.vorhanden) sources.push('freud');
  if (sym.ibn_sirin?.vorhanden) sources.push('ibn_sirin');
  if (sym.additional_sources) {
    Object.keys(sym.additional_sources).forEach(k => sources.push(k));
  }
  return sources;
}

// ─── Translated name helper ──────────────────────────────────────────────────

function getSymbolName(sym: any, lang: string): string {
  if (lang === 'de') return sym.name;
  return sym.name_translations?.[lang] || sym.name;
}

// ─── Component ───────────────────────────────────────────────────────────────

const DreamSymbolsPage: React.FC<DreamSymbolsPageProps> = ({ language, onClose, onNavigateHome, themeMode }) => {
  const isLight = themeMode === 'light';
  const t = T[language] || T.en;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

  const symbols = (symbolData as any).symbole as any[];
  const meta = (symbolData as any).metadata;
  const categories = Object.keys(CATEGORY_ICONS);

  // Count how many symbols each source has
  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    symbols.forEach((s: any) => {
      getSymbolSources(s).forEach(src => {
        counts[src] = (counts[src] || 0) + 1;
      });
    });
    return counts;
  }, [symbols]);

  const filtered = useMemo(() => {
    let result = symbols;
    if (selectedCategory) result = result.filter((s: any) => s.kategorie === selectedCategory);
    if (selectedSource) result = result.filter((s: any) => getSymbolSources(s).includes(selectedSource));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s: any) =>
        s.name.toLowerCase().includes(q) ||
        getSymbolName(s, language).toLowerCase().includes(q) ||
        (s.synonyme || []).some((syn: string) => syn.toLowerCase().includes(q))
      );
    }
    return result;
  }, [search, selectedCategory, selectedSource, symbols]);

  const card = isLight ? 'bg-white/80 border-slate-200' : 'bg-white/5 border-white/10';
  const accent = isLight ? 'text-indigo-700' : 'text-indigo-400';

  return (
    <div className={`min-h-screen ${isLight ? 'bg-white text-slate-800' : 'bg-[#0a0a1a] text-slate-200'} pb-32`}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back */}
        <button onClick={onClose} className={`mb-4 flex items-center gap-1 text-sm font-medium ${isLight ? 'text-fuchsia-600' : 'text-fuchsia-400'}`}>
          <span className="material-icons text-base">arrow_back</span> {t.back}
        </button>

        {/* Hero */}
        <div className={`rounded-2xl p-6 mb-6 text-center ${isLight ? 'bg-gradient-to-br from-indigo-50 to-fuchsia-50' : 'bg-gradient-to-br from-indigo-900/30 to-fuchsia-900/20'}`}>
          <h1 className="text-2xl font-bold font-mystic mb-2">{t.hero_title}</h1>
          <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{t.hero_subtitle}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className={`rounded-xl border p-3 text-center ${card}`}>
            <div className="text-2xl mb-1">📚</div>
            <div className={`text-xl font-bold ${accent}`}>{meta.statistik.gesamt_symbole}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{t.stats_symbols}</div>
          </div>
          <div className={`rounded-xl border p-3 text-center ${card}`}>
            <div className="text-2xl mb-1">📖</div>
            <div className={`text-xl font-bold ${accent}`}>{SOURCE_DEFS.filter(s => sourceCounts[s.key]).length}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{t.stats_categories}</div>
          </div>
          <div className={`rounded-xl border p-3 text-center ${card}`}>
            <div className="text-2xl mb-1">🌍</div>
            <div className={`text-xl font-bold ${accent}`}>{Object.keys(CATEGORY_ICONS).length}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{t.all_categories}</div>
          </div>
        </div>

        {/* Source Filter Buttons */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">{t.stats_freud.includes('Freud') ? 'Quellen' : 'Sources'}</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setSelectedSource(null)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${!selectedSource ? 'bg-indigo-600 text-white shadow-lg' : `border ${card}`}`}>
              {t.all_categories} ({meta.statistik.gesamt_symbole})
            </button>
            {SOURCE_DEFS.filter(s => sourceCounts[s.key]).map(src => (
              <button key={src.key} onClick={() => setSelectedSource(selectedSource === src.key ? null : src.key)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${selectedSource === src.key ? 'bg-indigo-600 text-white shadow-lg' : `border ${card}`}`}>
                <span>{src.icon}</span> {src.label} <span className="opacity-60">({sourceCounts[src.key]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t.search_placeholder}
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${isLight ? 'bg-white border-slate-200 focus:border-indigo-400' : 'bg-white/5 border-white/10 focus:border-indigo-500'}`}
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${!selectedCategory ? 'bg-fuchsia-600 text-white' : `border ${card}`}`}>
            {t.all_categories}
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${selectedCategory === cat ? 'bg-fuchsia-600 text-white' : `border ${card}`}`}>
              {CATEGORY_ICONS[cat]} {t.category_names[cat] || cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs mb-3 text-slate-500">{filtered.length} {t.stats_symbols}</p>

        {/* Symbol List */}
        {filtered.length === 0 ? (
          <div className={`text-center py-12 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>{t.no_results}</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((sym: any) => {
              const isExpanded = expandedSymbol === sym.id;
              const hasFreud = sym.freud?.vorhanden;
              const hasIbnSirin = sym.ibn_sirin?.vorhanden;
              const allSources = getSymbolSources(sym);

              return (
                <div key={sym.id} className={`rounded-xl border overflow-hidden transition-all ${card} ${isExpanded ? 'ring-1 ring-indigo-500/50' : ''}`}>
                  {/* Header */}
                  <button onClick={() => setExpandedSymbol(isExpanded ? null : sym.id)}
                    className="w-full flex items-center justify-between p-4 text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{CATEGORY_ICONS[sym.kategorie] || '✨'}</span>
                      <div>
                        <span className="font-bold text-sm">{getSymbolName(sym, language)}</span>
                        {sym.synonyme?.length > 0 && (
                          <span className={`text-xs ml-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                            ({sym.synonyme.slice(0, 3).join(', ')})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {allSources.map(src => {
                          const def = SOURCE_DEFS.find(d => d.key === src);
                          return def ? <span key={src} className="text-xs" title={def.label}>{def.icon}</span> : null;
                        })}
                      </div>
                      <span className="text-xs text-slate-500">{allSources.length} {t.interpretations}</span>
                      <span className={`material-icons text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className={`px-4 pb-4 space-y-4 border-t ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                      {/* Freud */}
                      {hasFreud && (
                        <div className="pt-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2 flex items-center gap-1">
                            <span>🧠</span> {t.source_freud}
                          </h4>
                          <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            {sym.freud.interpretation}
                          </p>
                          {sym.freud.original_zitat && (
                            <blockquote className={`mt-2 pl-3 border-l-2 italic text-xs ${isLight ? 'border-blue-300 text-slate-500' : 'border-blue-700 text-slate-400'}`}>
                              &ldquo;{sym.freud.original_zitat}&rdquo;
                            </blockquote>
                          )}
                          {sym.freud.kontext_beispiele?.length > 0 && (
                            <div className="mt-2">
                              <p className="text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-500">{t.context_examples}</p>
                              <ul className={`text-xs space-y-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                {sym.freud.kontext_beispiele.map((ex: string, i: number) => <li key={i}>• {ex}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ibn Sirin */}
                      {hasIbnSirin && (
                        <div className={hasFreud ? 'pt-2' : 'pt-4'}>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2 flex items-center gap-1">
                            <span>🕌</span> {t.source_ibn_sirin}
                          </h4>
                          <ul className={`text-sm space-y-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            {sym.ibn_sirin.deutungen?.map((d: string, i: number) => (
                              <li key={i} className="leading-relaxed">{renderBold(d)}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Additional Sources (Jung, Gestalt, etc.) */}
                      {sym.additional_sources && Object.entries(sym.additional_sources).map(([key, val]: [string, any]) => {
                        const def = SOURCE_DEFS.find(d => d.key === key);
                        return (
                          <div key={key} className="pt-2">
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>
                              <span>{def?.icon || '📖'}</span> {val.label || def?.label || key}
                            </h4>
                            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                              {val.text}
                            </p>
                          </div>
                        );
                      })}

                      {/* East-West Comparison */}
                      {sym.ost_west_vergleich?.unterschiede && (
                        <div className={`rounded-lg p-3 ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}>
                          <p className={`text-[10px] uppercase tracking-wider font-bold mb-2 ${accent}`}>{t.east_west}</p>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="font-bold text-blue-500 mb-1">{t.western}</p>
                              <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>{sym.ost_west_vergleich.unterschiede.westlich_freud}</p>
                            </div>
                            <div>
                              <p className="font-bold text-emerald-500 mb-1">{t.eastern}</p>
                              <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>{sym.ost_west_vergleich.unterschiede.östlich_ibn_sirin}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Related Symbols */}
                      {sym.verwandte_symbole?.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-500">{t.related_symbols}</p>
                          <div className="flex flex-wrap gap-1">
                            {sym.verwandte_symbole.map((r: string, i: number) => (
                              <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-slate-400'}`}>{r}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <h3 className={`text-lg font-bold mb-3 ${accent}`}>{t.cta_title}</h3>
          <button onClick={onNavigateHome}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all">
            {t.cta_btn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DreamSymbolsPage;
