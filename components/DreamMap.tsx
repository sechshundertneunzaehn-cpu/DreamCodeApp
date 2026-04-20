import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Dream, Language, ReligiousCategory } from '../types';
// Bot-Profile entfernt — nur echte wissenschaftliche Daten
// import { BOT_USERS } from '../data/botProfiles';
import { FEATURE_FLAGS } from '../config/featureFlags';
// import BotProfileModal from './BotProfileModal';
// import { useBotFriends } from '../hooks/useBotFriends';
import { fetchMapDreams, type MapDreamUser } from '../services/dreamMapService';
import TranslatedText from './TranslatedText';
import { supabase } from '../services/supabaseClient';
import KnowledgeGraph from './KnowledgeGraph';
import WorldMapPreview from './WorldMapPreview';
import type { GraphNode } from '../services/graphDataService';
import { useSymbolSearch } from '../hooks/useSymbolSearch';
import { useDreamsFulltextSearch, type SearchMode } from '../hooks/useDreamsFulltextSearch';
import { BOT_SYMBOL_IDS } from '../data/botSymbolIds';
import { OCEAN_USER_IDS } from '../data/oceanUserIds';

const RTL_LOCALES_DM = new Set(['ar', 'he', 'fa', 'ur']);

// ─── Research Participant (individual) ────────────────────────────────────────
interface IndividualParticipant {
  id: string;
  participant_id: string;
  country: string | null;
  lat: number;
  lng: number;
  dream_count: number;
  study_title?: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface DreamMapProps {
  dreams?: Dream[];
  language?: Language | string;
  onClose?: () => void;
  isLight?: boolean;
  onSelectParticipant?: (id: any) => void;
  onNavigateToResearch?: () => void;
  onNavigateToStudy?: (studyCode: string) => void;
  // Legacy compat
  themeMode?: string;
}

// ─── i18n ─────────────────────────────────────────────────────────────────────
interface Translations {
  title: string;
  subtitle: string;
  activedreamers: string;
  similarToday: string;
  matchestoday: string;
  newmatch: string;
  from: string;
  similarDream: string;
  connect: string;
  matchScore: string;
  dreamSummary: string;
  category: string;
  mood: string;
  close: string;
  filterAll: string;
  worldwide: string;
  dreamersSimilar: string;
  loading: string;
  tapMarker: string;
  trendTitle: string;
  trendDreamers: string;
  showTrends: string;
  hideTrends: string;
  searchPlaceholder: string;
  matchingSymbols: string;
  translatedHint: (original: string, translated: string) => string;
  matchThreshold: string;
  matchedDreamers: string;
  scientificDreamReports: string;
  searchModeAllWords: string;
  searchModeExactPhrase: string;
  searchModeExactWord: string;
  searchLoadMore: string;
  searchLoadingMore: string;
  searchAllLoaded: string;
  noDreamsFound: string;
  // Profile translations
  profileBack: string;
  profileReport: string;
  profileMemberSince: string;
  profileDreams: string;
  profileMatches: string;
  profileFavorite: string;
  profileLastDream: string;
  profileConnect: string;
  profileRequestConnection: string;
  profilePartialPrivate: string;
  profilePrivate: string;
  profileAnonymous: string;
  profileDreamDetailsUnavailable: string;
  profileShowProfile: string;
}

const TRANSLATIONS: Record<string, Translations> = {
  en: {
    title: 'Dream Map',
    subtitle: 'Who dreamed the same?',
    activedreamers: 'active dreamers',
    similarToday: 'similar today',
    matchestoday: 'matches today',
    newmatch: 'New Match!',
    from: 'from',
    similarDream: 'had a similar dream',
    connect: 'Connect',
    matchScore: 'Match Score',
    dreamSummary: 'Dream Summary',
    category: 'Category',
    mood: 'Mood',
    close: 'Close',
    filterAll: 'All',
    worldwide: 'worldwide',
    dreamersSimilar: '% of dreamers had similar dreams',
    loading: 'Scanning dreamers...',
    tapMarker: 'Tap a marker to see match details',
    trendTitle: 'Most Dreamed Topics',
    trendDreamers: 'dreamers',
    showTrends: 'Show Trends',
    hideTrends: 'Hide Trends',
    searchPlaceholder: 'Search dreams, keywords, cities...',
    matchingSymbols: 'Matching Symbols',
    translatedHint: (o, tr) => `Translated: "${o}" → "${tr}"`,
    matchThreshold: 'Match Threshold',
    matchedDreamers: 'Matched Dreamers',
    scientificDreamReports: 'scientific dream reports',
    searchModeAllWords: 'all words',
    searchModeExactPhrase: 'exact phrase',
    searchModeExactWord: 'exact word',
    searchLoadMore: 'Load more',
    searchLoadingMore: 'Loading…',
    searchAllLoaded: 'All results loaded',
    noDreamsFound: 'No dreams found',
    profileBack: 'Back',
    profileReport: 'Report',
    profileMemberSince: 'Member since',
    profileDreams: 'Dreams',
    profileMatches: 'Matches',
    profileFavorite: 'Favorite',
    profileLastDream: 'Last Dream',
    profileConnect: 'Connect',
    profileRequestConnection: 'Request Connection',
    profilePartialPrivate: 'This profile is partially private',
    profilePrivate: 'This profile is private',
    profileAnonymous: 'Anonymous Dreamer',
    profileDreamDetailsUnavailable: 'Dream details unavailable',
    profileShowProfile: 'Show Profile',
  },
  de: {
    title: 'Traumkarte',
    subtitle: 'Wer hat das Gleiche geträumt?',
    activedreamers: 'aktive Träumer',
    similarToday: 'ähnlich heute',
    matchestoday: 'Matches heute',
    newmatch: 'Neuer Match!',
    from: 'aus',
    similarDream: 'hatte einen ähnlichen Traum',
    connect: 'Verbinden',
    matchScore: 'Match-Score',
    dreamSummary: 'Traum-Zusammenfassung',
    category: 'Kategorie',
    mood: 'Stimmung',
    close: 'Schließen',
    filterAll: 'Alle',
    worldwide: 'weltweit',
    dreamersSimilar: '% der Träumer hatten ähnliche Träume',
    loading: 'Scanne Träumer...',
    tapMarker: 'Marker antippen für Match-Details',
    trendTitle: 'Am meisten geträumt',
    trendDreamers: 'Träumer',
    showTrends: 'Trends zeigen',
    hideTrends: 'Trends ausblenden',
    searchPlaceholder: 'Durchsuche Träume, Stichworte, Städte...',
    matchingSymbols: 'Passende Symbole',
    translatedHint: (o, tr) => `Übersetzt: „${o}" → „${tr}"`,
    matchThreshold: 'Match-Schwelle',
    matchedDreamers: 'Gematchte Träumer',
    scientificDreamReports: 'wissenschaftliche Traumberichte',
    searchModeAllWords: 'alle Wörter',
    searchModeExactPhrase: 'ganzer Satz',
    searchModeExactWord: 'exaktes Wort',
    searchLoadMore: 'Mehr laden',
    searchLoadingMore: 'Lade…',
    searchAllLoaded: 'Alle Ergebnisse geladen',
    noDreamsFound: 'Keine Träume gefunden',
    profileBack: 'Zurück',
    profileReport: 'Melden',
    profileMemberSince: 'Mitglied seit',
    profileDreams: 'Träume',
    profileMatches: 'Matches',
    profileFavorite: 'Liebling',
    profileLastDream: 'Letzter Traum',
    profileConnect: 'Verbinden',
    profileRequestConnection: 'Verbindung anfragen',
    profilePartialPrivate: 'Dieses Profil ist teilweise privat',
    profilePrivate: 'Dieses Profil ist privat',
    profileAnonymous: 'Anonymer Träumer',
    profileDreamDetailsUnavailable: 'Traum-Details nicht verfügbar',
    profileShowProfile: 'Profil anzeigen',
  },
  tr: {
    title: 'Rüya Haritası',
    subtitle: 'Aynı şeyi kim rüyada gördü?',
    activedreamers: 'aktif rüyacı',
    similarToday: 'bugün benzer',
    matchestoday: 'bugün eşleşme',
    newmatch: 'Yeni Eşleşme!',
    from: 'şehri',
    similarDream: 'benzer bir rüya gördü',
    connect: 'Bağlan',
    matchScore: 'Eşleşme Skoru',
    dreamSummary: 'Rüya Özeti',
    category: 'Kategori',
    mood: 'Ruh Hali',
    close: 'Kapat',
    filterAll: 'Tümü',
    worldwide: 'dünya geneli',
    dreamersSimilar: '% rüyacı benzer rüyalar gördü',
    loading: 'Rüyacılar taranıyor...',
    tapMarker: 'Eşleşme detayları için işaretçiye dokun',
    trendTitle: 'En Çok Görülen Rüyalar',
    trendDreamers: 'rüyacı',
    showTrends: 'Trendleri Göster',
    hideTrends: 'Trendleri Gizle',
    searchPlaceholder: 'Rüyaları, anahtar kelimeleri, şehirleri ara...',
    matchingSymbols: 'Eşleşen Semboller',
    translatedHint: (o, tr) => `Çevrildi: "${o}" → "${tr}"`,
    matchThreshold: 'Eşleşme Eşiği',
    matchedDreamers: 'Eşleşen Rüyacılar',
    scientificDreamReports: 'bilimsel rüya raporları',
    searchModeAllWords: 'tüm kelimeler',
    searchModeExactPhrase: 'tam ifade',
    searchModeExactWord: 'tam kelime',
    searchLoadMore: 'Daha fazla',
    searchLoadingMore: 'Yükleniyor…',
    searchAllLoaded: 'Tüm sonuçlar yüklendi',
    noDreamsFound: 'Rüya bulunamadı',
    profileBack: 'Geri',
    profileReport: 'Bildir',
    profileMemberSince: 'Üye oldu',
    profileDreams: 'Rüyalar',
    profileMatches: 'Eşleşme',
    profileFavorite: 'Favori',
    profileLastDream: 'Son Rüya',
    profileConnect: 'Bağlan',
    profileRequestConnection: 'Bağlantı İste',
    profilePartialPrivate: 'Bu profil kısmen gizli',
    profilePrivate: 'Bu profil gizli',
    profileAnonymous: 'Anonim Rüyacı',
    profileDreamDetailsUnavailable: 'Rüya detayları mevcut değil',
    profileShowProfile: 'Profili Göster',
  },
  es: {
    title: 'Mapa de Sueños',
    subtitle: '¿Quién soñó lo mismo?',
    activedreamers: 'soñadores activos',
    similarToday: 'similares hoy',
    matchestoday: 'coincidencias hoy',
    newmatch: '¡Nueva coincidencia!',
    from: 'de',
    similarDream: 'tuvo un sueño similar',
    connect: 'Conectar',
    matchScore: 'Puntuación',
    dreamSummary: 'Resumen del sueño',
    category: 'Categoría',
    mood: 'Estado de ánimo',
    close: 'Cerrar',
    filterAll: 'Todos',
    worldwide: 'mundial',
    dreamersSimilar: '% de soñadores tuvieron sueños similares',
    loading: 'Escaneando soñadores...',
    tapMarker: 'Toca un marcador para ver detalles',
    trendTitle: 'Temas más soñados',
    trendDreamers: 'soñadores',
    showTrends: 'Mostrar tendencias',
    hideTrends: 'Ocultar tendencias',
    searchPlaceholder: 'Buscar sueños, palabras clave, ciudades...',
    matchingSymbols: 'Símbolos coincidentes',
    translatedHint: (o, tr) => `Traducido: "${o}" → "${tr}"`,
    matchThreshold: 'Umbral de coincidencia',
    matchedDreamers: 'Soñadores coincidentes',
    scientificDreamReports: 'informes científicos de sueños',
    searchModeAllWords: 'todas las palabras',
    searchModeExactPhrase: 'frase exacta',
    searchModeExactWord: 'palabra exacta',
    searchLoadMore: 'Cargar más',
    searchLoadingMore: 'Cargando…',
    searchAllLoaded: 'Todos los resultados cargados',
    noDreamsFound: 'No se encontraron sueños',
    profileBack: 'Volver',
    profileReport: 'Reportar',
    profileMemberSince: 'Miembro desde',
    profileDreams: 'Sueños',
    profileMatches: 'Coincidencias',
    profileFavorite: 'Favorito',
    profileLastDream: 'Último Sueño',
    profileConnect: 'Conectar',
    profileRequestConnection: 'Solicitar Conexión',
    profilePartialPrivate: 'Este perfil es parcialmente privado',
    profilePrivate: 'Este perfil es privado',
    profileAnonymous: 'Soñador Anónimo',
    profileDreamDetailsUnavailable: 'Detalles del sueño no disponibles',
    profileShowProfile: 'Ver Perfil',
  },
  fr: {
    title: 'Carte des Rêves',
    subtitle: 'Qui a rêvé pareil?',
    activedreamers: 'rêveurs actifs',
    similarToday: "similaires aujourd'hui",
    matchestoday: "correspondances aujourd'hui",
    newmatch: 'Nouvelle correspondance!',
    from: 'de',
    similarDream: 'a eu un rêve similaire',
    connect: 'Connecter',
    matchScore: 'Score',
    dreamSummary: 'Résumé du rêve',
    category: 'Catégorie',
    mood: 'Humeur',
    close: 'Fermer',
    filterAll: 'Tous',
    worldwide: 'mondial',
    dreamersSimilar: '% des rêveurs ont eu des rêves similaires',
    loading: 'Scan des rêveurs...',
    tapMarker: 'Appuyez sur un marqueur pour les détails',
    trendTitle: 'Thèmes les plus rêvés',
    trendDreamers: 'rêveurs',
    showTrends: 'Afficher tendances',
    hideTrends: 'Masquer tendances',
    searchPlaceholder: 'Rechercher rêves, mots-clés, villes...',
    matchingSymbols: 'Symboles correspondants',
    translatedHint: (o, tr) => `Traduit : « ${o} » → « ${tr} »`,
    matchThreshold: 'Seuil de correspondance',
    matchedDreamers: 'Rêveurs correspondants',
    scientificDreamReports: 'rapports de rêves scientifiques',
    searchModeAllWords: 'tous les mots',
    searchModeExactPhrase: 'phrase exacte',
    searchModeExactWord: 'mot exact',
    searchLoadMore: 'Charger plus',
    searchLoadingMore: 'Chargement…',
    searchAllLoaded: 'Tous les résultats chargés',
    noDreamsFound: 'Aucun rêve trouvé',
    profileBack: 'Retour',
    profileReport: 'Signaler',
    profileMemberSince: 'Membre depuis',
    profileDreams: 'Rêves',
    profileMatches: 'Correspondances',
    profileFavorite: 'Favori',
    profileLastDream: 'Dernier Rêve',
    profileConnect: 'Connecter',
    profileRequestConnection: 'Demander Connexion',
    profilePartialPrivate: 'Ce profil est partiellement privé',
    profilePrivate: 'Ce profil est privé',
    profileAnonymous: 'Rêveur Anonyme',
    profileDreamDetailsUnavailable: 'Détails du rêve non disponibles',
    profileShowProfile: 'Voir le Profil',
  },
  ar: {
    title: 'خريطة الأحلام',
    subtitle: 'من رأى نفس الحلم؟',
    activedreamers: 'حالم نشط',
    similarToday: 'متشابهة اليوم',
    matchestoday: 'تطابقات اليوم',
    newmatch: 'تطابق جديد!',
    from: 'من',
    similarDream: 'رأى حلماً مشابهاً',
    connect: 'تواصل',
    matchScore: 'نسبة التطابق',
    dreamSummary: 'ملخص الحلم',
    category: 'الفئة',
    mood: 'المزاج',
    close: 'إغلاق',
    filterAll: 'الكل',
    worldwide: 'حول العالم',
    dreamersSimilar: '% من الحالمين رأوا أحلاماً مشابهة',
    loading: 'جارٍ المسح...',
    tapMarker: 'اضغط على علامة لرؤية تفاصيل التطابق',
    trendTitle: 'أكثر المواضيع حلماً',
    trendDreamers: 'حالم',
    showTrends: 'عرض الاتجاهات',
    hideTrends: 'إخفاء الاتجاهات',
    searchPlaceholder: 'ابحث عن أحلام، كلمات، مدن...',
    matchingSymbols: 'رموز مطابقة',
    translatedHint: (o, tr) => `تُرجم: «${o}» ← «${tr}»`,
    matchThreshold: 'حد التطابق',
    matchedDreamers: 'الحالمون المتطابقون',
    scientificDreamReports: 'تقارير أحلام علمية',
    searchModeAllWords: 'كل الكلمات',
    searchModeExactPhrase: 'عبارة كاملة',
    searchModeExactWord: 'كلمة محددة',
    searchLoadMore: 'تحميل المزيد',
    searchLoadingMore: 'جارٍ التحميل…',
    searchAllLoaded: 'تم تحميل كل النتائج',
    noDreamsFound: 'لم يتم العثور على أحلام',
    profileBack: 'رجوع',
    profileReport: 'إبلاغ',
    profileMemberSince: 'عضو منذ',
    profileDreams: 'أحلام',
    profileMatches: 'تطابقات',
    profileFavorite: 'المفضل',
    profileLastDream: 'آخر حلم',
    profileConnect: 'تواصل',
    profileRequestConnection: 'طلب اتصال',
    profilePartialPrivate: 'هذا الملف الشخصي خاص جزئياً',
    profilePrivate: 'هذا الملف الشخصي خاص',
    profileAnonymous: 'حالم مجهول',
    profileDreamDetailsUnavailable: 'تفاصيل الحلم غير متاحة',
    profileShowProfile: 'عرض الملف الشخصي',
  },
  pt: {
    title: 'Mapa dos Sonhos',
    subtitle: 'Quem sonhou o mesmo?',
    activedreamers: 'sonhadores ativos',
    similarToday: 'similares hoje',
    matchestoday: 'correspondências hoje',
    newmatch: 'Nova correspondência!',
    from: 'de',
    similarDream: 'teve um sonho similar',
    connect: 'Conectar',
    matchScore: 'Pontuação',
    dreamSummary: 'Resumo do sonho',
    category: 'Categoria',
    mood: 'Humor',
    close: 'Fechar',
    filterAll: 'Todos',
    worldwide: 'mundial',
    dreamersSimilar: '% dos sonhadores tiveram sonhos similares',
    loading: 'Verificando sonhadores...',
    tapMarker: 'Toque em um marcador para ver detalhes',
    trendTitle: 'Temas mais sonhados',
    trendDreamers: 'sonhadores',
    showTrends: 'Mostrar tendências',
    hideTrends: 'Ocultar tendências',
    searchPlaceholder: 'Pesquisar sonhos, palavras-chave, cidades...',
    matchingSymbols: 'Símbolos correspondentes',
    translatedHint: (o, tr) => `Traduzido: "${o}" → "${tr}"`,
    matchThreshold: 'Limite de correspondência',
    matchedDreamers: 'Sonhadores correspondentes',
    scientificDreamReports: 'relatórios científicos de sonhos',
    searchModeAllWords: 'todas as palavras',
    searchModeExactPhrase: 'frase exata',
    searchModeExactWord: 'palavra exata',
    searchLoadMore: 'Carregar mais',
    searchLoadingMore: 'Carregando…',
    searchAllLoaded: 'Todos os resultados carregados',
    noDreamsFound: 'Nenhum sonho encontrado',
    profileBack: 'Voltar',
    profileReport: 'Denunciar',
    profileMemberSince: 'Membro desde',
    profileDreams: 'Sonhos',
    profileMatches: 'Correspondências',
    profileFavorite: 'Favorito',
    profileLastDream: 'Último Sonho',
    profileConnect: 'Conectar',
    profileRequestConnection: 'Solicitar Conexão',
    profilePartialPrivate: 'Este perfil é parcialmente privado',
    profilePrivate: 'Este perfil é privado',
    profileAnonymous: 'Sonhador Anônimo',
    profileDreamDetailsUnavailable: 'Detalhes do sonho indisponíveis',
    profileShowProfile: 'Ver Perfil',
  },
  ru: {
    title: 'Карта Снов',
    subtitle: 'Кто видел похожий сон?',
    activedreamers: 'активных сновидцев',
    similarToday: 'похожих сегодня',
    matchestoday: 'совпадений сегодня',
    newmatch: 'Новое совпадение!',
    from: 'из',
    similarDream: 'видел похожий сон',
    connect: 'Связаться',
    matchScore: 'Совпадение',
    dreamSummary: 'Краткое содержание',
    category: 'Категория',
    mood: 'Настроение',
    close: 'Закрыть',
    filterAll: 'Все',
    worldwide: 'по всему миру',
    dreamersSimilar: '% сновидцев видели похожие сны',
    loading: 'Сканирование сновидцев...',
    tapMarker: 'Нажмите на маркер для деталей',
    trendTitle: 'Самые популярные темы снов',
    trendDreamers: 'сновидцев',
    showTrends: 'Показать тренды',
    hideTrends: 'Скрыть тренды',
    searchPlaceholder: 'Поиск снов, ключевых слов, городов...',
    matchingSymbols: 'Подходящие символы',
    translatedHint: (o, tr) => `Переведено: «${o}» → «${tr}»`,
    matchThreshold: 'Порог совпадения',
    matchedDreamers: 'Совпавшие сновидцы',
    scientificDreamReports: 'научные отчёты о снах',
    searchModeAllWords: 'все слова',
    searchModeExactPhrase: 'точная фраза',
    searchModeExactWord: 'точное слово',
    searchLoadMore: 'Загрузить ещё',
    searchLoadingMore: 'Загрузка…',
    searchAllLoaded: 'Все результаты загружены',
    noDreamsFound: 'Сны не найдены',
    profileBack: 'Назад',
    profileReport: 'Пожаловаться',
    profileMemberSince: 'Участник с',
    profileDreams: 'Снов',
    profileMatches: 'Совпадений',
    profileFavorite: 'Любимое',
    profileLastDream: 'Последний сон',
    profileConnect: 'Связаться',
    profileRequestConnection: 'Запросить связь',
    profilePartialPrivate: 'Этот профиль частично закрыт',
    profilePrivate: 'Этот профиль закрыт',
    profileAnonymous: 'Анонимный сновидец',
    profileDreamDetailsUnavailable: 'Детали сна недоступны',
    profileShowProfile: 'Показать профиль',
  },
};

// ─── Dream Categories ─────────────────────────────────────────────────────────
interface DreamCategory {
  id: string;
  label: Record<string, string>;
  icon: string;
  color: string;
}

const DREAM_CATEGORIES: DreamCategory[] = [
  { id: 'horror',    label: { en:'Horror', de:'Gruselig', tr:'Korku', es:'Terror', fr:'Horreur', ar:'رعب', pt:'Horror', ru:'Ужас' },         icon: '👻', color: '#8b5cf6' },
  { id: 'funny',     label: { en:'Funny', de:'Lustig', tr:'Komik', es:'Gracioso', fr:'Drôle', ar:'مضحك', pt:'Engraçado', ru:'Смешной' },    icon: '😂', color: '#f59e0b' },
  { id: 'ufo',       label: { en:'UFO/Alien', de:'UFO', tr:'UFO', es:'OVNI', fr:'OVNI', ar:'مركبة فضائية', pt:'OVNI', ru:'НЛО' },             icon: '🛸', color: '#06b6d4' },
  { id: 'love',      label: { en:'Love', de:'Liebe', tr:'Aşk', es:'Amor', fr:'Amour', ar:'حب', pt:'Amor', ru:'Любовь' },                    icon: '❤️', color: '#ec4899' },
  { id: 'erotic',    label: { en:'Erotic', de:'Erotik', tr:'Erotik', es:'Erótico', fr:'Érotique', ar:'إثارة', pt:'Erótico', ru:'Эротика' },  icon: '🔥', color: '#ef4444' },
  { id: 'flying',    label: { en:'Flying', de:'Fliegen', tr:'Uçmak', es:'Volar', fr:'Voler', ar:'طيران', pt:'Voar', ru:'Полёт' },            icon: '✈️', color: '#3b82f6' },
  { id: 'falling',   label: { en:'Falling', de:'Fallen', tr:'Düşmek', es:'Caer', fr:'Chuter', ar:'سقوط', pt:'Cair', ru:'Падение' },          icon: '📉', color: '#64748b' },
  { id: 'water',     label: { en:'Water', de:'Wasser', tr:'Su', es:'Agua', fr:'Eau', ar:'ماء', pt:'Água', ru:'Вода' },                      icon: '🌊', color: '#0ea5e9' },
  { id: 'animals',   label: { en:'Animals', de:'Tiere', tr:'Hayvanlar', es:'Animales', fr:'Animaux', ar:'حيوانات', pt:'Animais', ru:'Животные' }, icon: '🐾', color: '#84cc16' },
  { id: 'death',     label: { en:'Death', de:'Tod', tr:'Ölüm', es:'Muerte', fr:'Mort', ar:'موت', pt:'Morte', ru:'Смерть' },                  icon: '💀', color: '#1e293b' },
  { id: 'chase',     label: { en:'Chase', de:'Verfolgung', tr:'Takip', es:'Persecución', fr:'Poursuite', ar:'مطاردة', pt:'Perseguição', ru:'Погоня' }, icon: '🏃', color: '#f97316' },
  { id: 'family',    label: { en:'Family', de:'Familie', tr:'Aile', es:'Familia', fr:'Famille', ar:'عائلة', pt:'Família', ru:'Семья' },      icon: '👨‍👩‍👧', color: '#10b981' },
  { id: 'money',     label: { en:'Money', de:'Geld', tr:'Para', es:'Dinero', fr:'Argent', ar:'مال', pt:'Dinheiro', ru:'Деньги' },            icon: '💰', color: '#eab308' },
  { id: 'school',    label: { en:'School', de:'Schule', tr:'Okul', es:'Escuela', fr:'École', ar:'مدرسة', pt:'Escola', ru:'Школа' },          icon: '🏫', color: '#6366f1' },
  { id: 'spiritual', label: { en:'Spiritual', de:'Spirituell', tr:'Ruhsal', es:'Espiritual', fr:'Spirituel', ar:'روحاني', pt:'Espiritual', ru:'Духовный' }, icon: '🧘', color: '#a855f7' },
  { id: 'nature',    label: { en:'Nature', de:'Natur', tr:'Doğa', es:'Naturaleza', fr:'Nature', ar:'طبيعة', pt:'Natureza', ru:'Природа' },   icon: '🌿', color: '#22c55e' },
  { id: 'timetravel',label: { en:'Time Travel', de:'Zeitreise', tr:'Zaman Yolculuğu', es:'Viaje en tiempo', fr:'Voyage temporel', ar:'سفر عبر الزمن', pt:'Viagem no tempo', ru:'Путешествие во времени' }, icon: '⏳', color: '#8b5cf6' },
  { id: 'celebrity', label: { en:'Celebrity', de:'Prominente', tr:'Ünlüler', es:'Famosos', fr:'Célébrités', ar:'مشاهير', pt:'Celebridades', ru:'Знаменитости' }, icon: '⭐', color: '#f59e0b' },
];

// ─── Simulated Users ──────────────────────────────────────────────────────────
interface BaseSimUser {
  id: string;
  name: string;
  avatar: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  dreamSummary: string;
  category: string;
  mood: string;
  religCategory?: ReligiousCategory;
}

interface SimUser extends BaseSimUser {
  matchPct: number;
  // Profile fields (generated in generateUsers)
  privacy: 'public' | 'partial' | 'private';
  age?: number;
  memberSince: string;
  bio?: string;
  dreamCount: number;
  matchCount: number;
  favCategory: string;
}

// Equirectangular projection: lat/lng -> percentage coordinates
const getCoordinates = (lat: number, lng: number) => {
  const x = (lng + 180) * (100 / 360);
  const y = ((-1 * lat) + 90) * (100 / 180);
  return { x, y };
};

// 150 bot users with real lat/lng coordinates — 90% female
const BASE_USERS: BaseSimUser[] = [
  // ── EUROPE (40) ──
  { id:'u1',  name:'Elif Yilmaz',       avatar:'👩🏽', city:'Istanbul',     country:'TR', lat:41.01, lng:28.98, category:'flying',    mood:'free',       dreamSummary:'Bogazin uzerinde ruzgarda suzuluyordum...' },
  { id:'u2',  name:'Marie Dupont',      avatar:'👩‍🦰', city:'Lyon',        country:'FR', lat:45.76, lng:4.84,  category:'love',      mood:'yearning',   dreamSummary:'Il me tenait la main sur un pont de lumiere...' },
  { id:'u3',  name:'Lena Hoffmann',     avatar:'👱‍♀️', city:'Berlin',      country:'DE', lat:52.52, lng:13.40, category:'falling',   mood:'scared',     dreamSummary:'Ich fiel durch Wolken und konnte nicht schreien...' },
  { id:'u4',  name:'Sofia Rossi',       avatar:'👩🏻', city:'Rome',         country:'IT', lat:41.90, lng:12.50, category:'chase',     mood:'terrified',  dreamSummary:'Correvo nel Colosseo e le mura si chiudevano...' },
  { id:'u5',  name:'Emma Lindqvist',    avatar:'👩‍🦳', city:'Stockholm',   country:'SE', lat:59.33, lng:18.07, category:'nature',    mood:'serene',     dreamSummary:'Norrsken som formade mitt namn pa himlen...' },
  { id:'u6',  name:'Clara Fernandez',   avatar:'👩🏽', city:'Madrid',       country:'ES', lat:40.42, lng:-3.70, category:'erotic',    mood:'passionate', dreamSummary:'Sus manos eran fuego y yo era agua...' },
  { id:'u7',  name:'Ingrid Bakken',     avatar:'👩‍🦰', city:'Oslo',        country:'NO', lat:59.91, lng:10.75, category:'water',     mood:'calm',       dreamSummary:'Fjorden ble til glass og jeg gikk over...' },
  { id:'u8',  name:'Anna Kowalska',     avatar:'👩🏻', city:'Warsaw',       country:'PL', lat:52.23, lng:21.01, category:'horror',    mood:'terrified',  dreamSummary:'Lustro w ktorym stala ktos inny niz ja...' },
  { id:'u9',  name:'Thomas Mueller',    avatar:'🧔',  city:'Munich',       country:'DE', lat:48.14, lng:11.58, category:'ufo',       mood:'amazed',     dreamSummary:'Das Licht kam naeher und ich hoerte Musik...' },
  { id:'u10', name:'Giulia Bianchi',    avatar:'👩‍🦱', city:'Milan',       country:'IT', lat:45.46, lng:9.19,  category:'celebrity', mood:'star-struck', dreamSummary:'Camminavo sul red carpet con le ali...' },
  { id:'u11', name:'Margot Lefevre',    avatar:'👩',  city:'Paris',        country:'FR', lat:48.86, lng:2.35,  category:'flying',    mood:'euphoric',   dreamSummary:'Je volais au-dessus de la Seine a minuit...' },
  { id:'u12', name:'Katarina Novak',    avatar:'👩🏻', city:'Prague',       country:'CZ', lat:50.08, lng:14.44, category:'timetravel',mood:'wonder',     dreamSummary:'Hodiny na Staromestskem namesti se tocily pozpatku...' },
  { id:'u13', name:'Isabel Mendes',     avatar:'👩🏽', city:'Lisbon',       country:'PT', lat:38.72, lng:-9.14, category:'water',     mood:'melancholic', dreamSummary:'O oceano engoliu a cidade e eu flutuava em paz...' },
  { id:'u14', name:'Freya Andersen',    avatar:'👱‍♀️', city:'Copenhagen',  country:'DK', lat:55.68, lng:12.57, category:'love',      mood:'longing',    dreamSummary:'Han holdt min hand under nordlyset...' },
  { id:'u15', name:'Nina Petrova',      avatar:'👩‍🦰', city:'Moscow',      country:'RU', lat:55.76, lng:37.62, category:'death',     mood:'eerie',      dreamSummary:'Babushka sidela v pustom dome i ulybalasc...' },
  { id:'u16', name:'Eva Szabo',         avatar:'👩🏻', city:'Budapest',     country:'HU', lat:47.50, lng:19.04, category:'funny',     mood:'amused',     dreamSummary:'A Parlament felszallt mint egy leggomb...' },
  { id:'u17', name:'Aleksandra Jovic',  avatar:'👩‍🦱', city:'Belgrade',    country:'RS', lat:44.79, lng:20.47, category:'school',    mood:'stressed',   dreamSummary:'Ispit je bio na jeziku koji ne poznajem...' },
  { id:'u18', name:'Fiona O\'Brien',    avatar:'👩‍🦰', city:'Dublin',      country:'IE', lat:53.35, lng:-6.26, category:'animals',   mood:'playful',    dreamSummary:'The sheep were flying over the cliffs singing...' },
  { id:'u19', name:'Greta Zimmer',      avatar:'👩‍🦳', city:'Vienna',      country:'AT', lat:48.21, lng:16.37, category:'spiritual', mood:'peaceful',   dreamSummary:'Ein Engel spielte Walzer im leeren Schloss...' },
  { id:'u20', name:'Eleni Papadaki',    avatar:'👩🏽', city:'Athens',       country:'GR', lat:37.98, lng:23.73, category:'water',     mood:'mystified',  dreamSummary:'Kolymboysa me archaia agalmata ston vytho...' },
  { id:'u21', name:'Chloe Martin',      avatar:'👩‍🦱', city:'Brussels',    country:'BE', lat:50.85, lng:4.35,  category:'chase',     mood:'breathless', dreamSummary:'Quelqu\'un me poursuivait dans un labyrinthe de chocolat...' },
  { id:'u22', name:'Astrid Holm',       avatar:'👱‍♀️', city:'Gothenburg',  country:'SE', lat:57.71, lng:11.97, category:'family',    mood:'nostalgic',  dreamSummary:'Mormor lagade mat i ett hus som inte finns langre...' },
  { id:'u23', name:'Maja Eriksen',      avatar:'👩',  city:'Helsinki',     country:'FI', lat:60.17, lng:24.94, category:'nature',    mood:'bliss',      dreamSummary:'Revontulet sulivat ja minusta tuli valo...' },
  { id:'u24', name:'Stefan Horvat',     avatar:'🧔',  city:'Zagreb',       country:'HR', lat:45.81, lng:15.98, category:'falling',   mood:'dizzy',      dreamSummary:'Padao sam kroz oblake iznad Jadrana...' },
  { id:'u25', name:'Carmen Ruiz',       avatar:'👩🏽', city:'Barcelona',    country:'ES', lat:41.39, lng:2.17,  category:'horror',    mood:'frightened', dreamSummary:'La Sagrada Familia se derretia como cera...' },
  { id:'u26', name:'Daria Volkov',      avatar:'👩‍🦰', city:'St Petersburg',country:'RU', lat:59.93, lng:30.32, category:'timetravel',mood:'lost',      dreamSummary:'Ya gulyala po Zimniemu dvortsu v drugom veke...' },
  { id:'u27', name:'Laura Visser',      avatar:'👩‍🦱', city:'Amsterdam',   country:'NL', lat:52.37, lng:4.90,  category:'money',     mood:'greedy',     dreamSummary:'De grachten waren van goud en ik zwom erin...' },
  { id:'u28', name:'Tatiana Ionescu',   avatar:'👩🏻', city:'Bucharest',    country:'RO', lat:44.43, lng:26.10, category:'horror',    mood:'chilled',    dreamSummary:'Castelul s-a trezit la viata si m-a chemat...' },
  { id:'u29', name:'Heidi Brunner',     avatar:'👱‍♀️', city:'Zurich',      country:'CH', lat:47.38, lng:8.54,  category:'flying',    mood:'free',       dreamSummary:'Ich flog ueber die Alpen wie ein Adler...' },
  { id:'u30', name:'Oksana Melnyk',     avatar:'👩🏻', city:'Kyiv',         country:'UA', lat:50.45, lng:30.52, category:'family',    mood:'tearful',    dreamSummary:'Babusya spivala pisniu yaku ya vzhe zabula...' },
  { id:'u31', name:'Agnieszka Wozniak', avatar:'👩‍🦰', city:'Krakow',     country:'PL', lat:50.06, lng:19.94, category:'spiritual', mood:'guided',     dreamSummary:'Kosciol unosil sie w powietrze i slyszalam chory...' },
  { id:'u32', name:'Sophie Bernard',    avatar:'👩',  city:'Marseille',    country:'FR', lat:43.30, lng:5.37,  category:'erotic',    mood:'intense',    dreamSummary:'La mer etait chaude comme sa peau...' },
  { id:'u33', name:'Valentina Costa',   avatar:'👩🏽', city:'Naples',       country:'IT', lat:40.85, lng:14.27, category:'death',     mood:'serene',     dreamSummary:'Il Vesuvio parlava e io capivo ogni parola...' },
  { id:'u34', name:'Emilia Fischer',    avatar:'👩‍🦳', city:'Hamburg',     country:'DE', lat:53.55, lng:9.99,  category:'animals',   mood:'wonder',     dreamSummary:'Ein Wal schwamm durch die Elbe und sang...' },
  { id:'u35', name:'Klara Johansson',   avatar:'👩🏻', city:'Malmoe',       country:'SE', lat:55.60, lng:13.00, category:'school',    mood:'anxious',    dreamSummary:'Provet var pa ett sprak som inte finns...' },
  { id:'u36', name:'Diana Almeida',     avatar:'👩🏽', city:'Porto',        country:'PT', lat:41.15, lng:-8.61, category:'love',      mood:'warm',       dreamSummary:'Dancavamos sobre o Douro enquanto chovia estrelas...' },
  { id:'u37', name:'Nadia Christensen', avatar:'👩‍🦱', city:'Aarhus',     country:'DK', lat:56.15, lng:10.21, category:'funny',     mood:'delighted',  dreamSummary:'Min kat talte og fortalte vittigheder...' },
  { id:'u38', name:'Sienna Clarke',     avatar:'👱‍♀️', city:'Edinburgh',   country:'GB', lat:55.95, lng:-3.19, category:'nature',    mood:'mystified',  dreamSummary:'The highlands whispered my name in Gaelic...' },
  { id:'u39', name:'Olivia Bennett',    avatar:'👩‍🦰', city:'London',      country:'GB', lat:51.51, lng:-0.13, category:'celebrity', mood:'embarrassed', dreamSummary:'I met the Queen but I was in my pyjamas...' },
  { id:'u40', name:'Livia Keller',      avatar:'👩🏻', city:'Bern',         country:'CH', lat:46.95, lng:7.45,  category:'money',     mood:'amazed',     dreamSummary:'Goldmuenzen fielen wie Schnee vom Himmel...' },
  // ── MIDDLE EAST (15) ──
  { id:'u41', name:'Zeynep Demir',      avatar:'👩🏽', city:'Ankara',       country:'TR', lat:39.93, lng:32.86, category:'spiritual', mood:'peaceful',   dreamSummary:'Cami kubbesinden isigin icine yukseldim...' },
  { id:'u42', name:'Layla Hassan',      avatar:'👩🏽', city:'Cairo',        country:'EG', lat:30.04, lng:31.24, category:'timetravel',mood:'awed',       dreamSummary:'Mashaytu bayn al-ahramat wa hiya jadida...' },
  { id:'u43', name:'Fatima Benali',     avatar:'👩🏽‍🦱', city:'Casablanca', country:'MA', lat:33.59, lng:-7.62, category:'flying',    mood:'magical',    dreamSummary:'Je volais sur un tapis au-dessus du desert...' },
  { id:'u44', name:'Nour Al-Ahmad',     avatar:'👩🏽', city:'Dubai',        country:'AE', lat:25.20, lng:55.27, category:'money',     mood:'dazzled',    dreamSummary:'Al-madina al-dhahabiya tash\'a min al-rimal...' },
  { id:'u45', name:'Yasmin Rahimi',     avatar:'👩🏽', city:'Tehran',       country:'IR', lat:35.69, lng:51.39, category:'nature',    mood:'enchanted',  dreamSummary:'Bagh-e behesht ba golhaye sokhangu...' },
  { id:'u46', name:'Sara Mansour',      avatar:'👩🏽', city:'Beirut',       country:'LB', lat:33.89, lng:35.50, category:'family',    mood:'hopeful',    dreamSummary:'Al-madina tu\'id bina\'a nafsaha min jadid...' },
  { id:'u47', name:'Omar Al-Farsi',     avatar:'🧔🏽', city:'Riyadh',      country:'SA', lat:24.71, lng:46.67, category:'spiritual', mood:'blessed',    dreamSummary:'Mashaytu ala al-ma\'a fi al-sahra\'...' },
  { id:'u48', name:'Mariam Khoury',     avatar:'👩🏽', city:'Amman',        country:'JO', lat:31.95, lng:35.93, category:'water',     mood:'peaceful',   dreamSummary:'Al-bahr al-mayyit tahawwal ila dhahab sa\'il...' },
  { id:'u49', name:'Rania Haddad',      avatar:'👩🏽', city:'Baghdad',      country:'IQ', lat:33.31, lng:44.37, category:'school',    mood:'anxious',    dreamSummary:'Al-maktaba al-qadima wa kutub tatakallam...' },
  { id:'u50', name:'Dina Trabelsi',     avatar:'👩🏽', city:'Tunis',        country:'TN', lat:36.81, lng:10.18, category:'chase',     mood:'breathless', dreamSummary:'Les murs de la medina changeaient de place...' },
  { id:'u51', name:'Hiba Oueslati',     avatar:'👩🏿', city:'Algiers',      country:'DZ', lat:36.75, lng:3.06,  category:'nature',    mood:'amazed',     dreamSummary:'La tempete de sable revelait une oasis cachee...' },
  { id:'u52', name:'Leila Sharif',      avatar:'👩🏽', city:'Muscat',       country:'OM', lat:23.59, lng:58.38, category:'love',      mood:'yearning',   dreamSummary:'Kana yamsik yadi taht nujum al-sahra\'...' },
  { id:'u53', name:'Amira El-Sayed',    avatar:'👩🏽', city:'Alexandria',   country:'EG', lat:31.20, lng:29.92, category:'horror',    mood:'frightened', dreamSummary:'Al-bahr ibtala\'a al-manarah wa ana wahdi...' },
  { id:'u54', name:'Nur Celik',         avatar:'👩🏽', city:'Izmir',        country:'TR', lat:38.42, lng:27.14, category:'erotic',    mood:'passionate', dreamSummary:'Deniz kenarinda ates gibi bir dans...' },
  { id:'u55', name:'Khalid Nasser',     avatar:'🧔🏽', city:'Kuwait City', country:'KW', lat:29.38, lng:47.99, category:'ufo',       mood:'shocked',    dreamSummary:'Markaba fada\'iya hawmat fawqa al-khalij...' },
  // ── AFRICA (15) ──
  { id:'u56', name:'Amina Okafor',      avatar:'👩🏿', city:'Lagos',        country:'NG', lat:6.52,  lng:3.38,  category:'spiritual', mood:'guided',     dreamSummary:'My ancestors spoke through the baobab tree...' },
  { id:'u57', name:'Aisha Wanjiku',     avatar:'👩🏿', city:'Nairobi',      country:'KE', lat:-1.29, lng:36.82, category:'animals',   mood:'brave',      dreamSummary:'I ran with lions across the golden savannah...' },
  { id:'u58', name:'Fatou Diallo',      avatar:'👩🏿', city:'Dakar',        country:'SN', lat:14.72, lng:-17.47,category:'flying',    mood:'free',       dreamSummary:'Je volais au-dessus de l\'ocean comme un oiseau...' },
  { id:'u59', name:'Zara Ndlovu',       avatar:'👩🏿', city:'Johannesburg', country:'ZA', lat:-26.20,lng:28.04, category:'money',     mood:'excited',    dreamSummary:'Gold was raining from the sky over Joburg...' },
  { id:'u60', name:'Blessing Adekunle', avatar:'👩🏿', city:'Abuja',        country:'NG', lat:9.06,  lng:7.49,  category:'love',      mood:'warm',       dreamSummary:'He held me under a sky full of fireflies...' },
  { id:'u61', name:'Kofi Mensah',       avatar:'👨🏿', city:'Accra',        country:'GH', lat:5.56,  lng:-0.19, category:'chase',     mood:'fearful',    dreamSummary:'Something chased me through the night market...' },
  { id:'u62', name:'Naledi Mokoena',    avatar:'👩🏿', city:'Cape Town',    country:'ZA', lat:-33.93,lng:18.42, category:'water',     mood:'calm',       dreamSummary:'Table Mountain melted into the ocean like butter...' },
  { id:'u63', name:'Aya Tesfaye',       avatar:'👩🏿', city:'Addis Ababa',  country:'ET', lat:9.02,  lng:38.75, category:'family',    mood:'nostalgic',  dreamSummary:'Grandmother served coffee to angels at dawn...' },
  { id:'u64', name:'Chioma Eze',        avatar:'👩🏿', city:'Enugu',        country:'NG', lat:6.44,  lng:7.50,  category:'school',    mood:'stressed',   dreamSummary:'The exam paper was written in a language of light...' },
  { id:'u65', name:'Grace Muthoni',     avatar:'👩🏿', city:'Kampala',      country:'UG', lat:0.35,  lng:32.58, category:'nature',    mood:'wonder',     dreamSummary:'The forest sang and every tree had a face...' },
  { id:'u66', name:'Mariame Toure',     avatar:'👩🏿', city:'Bamako',       country:'ML', lat:12.64, lng:-8.00, category:'death',     mood:'serene',     dreamSummary:'Les ancetres dansaient dans la lumiere doree...' },
  { id:'u67', name:'Fatoumata Camara',  avatar:'👩🏿', city:'Conakry',      country:'GN', lat:9.64,  lng:-13.58,category:'celebrity', mood:'star-struck', dreamSummary:'Je chantais sur scene devant des milliers...' },
  { id:'u68', name:'Thandiwe Phiri',    avatar:'👩🏿', city:'Lusaka',       country:'ZM', lat:-15.39,lng:28.32, category:'funny',     mood:'amused',     dreamSummary:'The elephants were doing a conga line at my wedding...' },
  { id:'u69', name:'Adama Traore',      avatar:'👩🏿', city:'Abidjan',      country:'CI', lat:5.36,  lng:-4.01, category:'falling',   mood:'dizzy',      dreamSummary:'Je tombais a travers les nuages de chocolat...' },
  { id:'u70', name:'Ruth Haile',        avatar:'👩🏿', city:'Dar es Salaam',country:'TZ', lat:-6.79, lng:39.28, category:'ufo',       mood:'shocked',    dreamSummary:'A bright light hovered over the Indian Ocean...' },
  // ── SOUTH ASIA (12) ──
  { id:'u71', name:'Priya Sharma',      avatar:'👩🏽', city:'Mumbai',       country:'IN', lat:19.08, lng:72.88, category:'school',    mood:'stressed',   dreamSummary:'Exam mein sawal hindi mein the lekin jawaab english mein...' },
  { id:'u72', name:'Ananya Gupta',      avatar:'👩🏽', city:'Delhi',        country:'IN', lat:28.61, lng:77.21, category:'spiritual', mood:'blessed',    dreamSummary:'Ganga ka paani sone ka ho gaya tha...' },
  { id:'u73', name:'Nisha Rajapaksa',   avatar:'👩🏽', city:'Colombo',      country:'LK', lat:6.93,  lng:79.85, category:'water',     mood:'calm',       dreamSummary:'The ocean turned to glass and I walked across...' },
  { id:'u74', name:'Kavya Reddy',       avatar:'👩🏽', city:'Bangalore',    country:'IN', lat:12.97, lng:77.59, category:'flying',    mood:'euphoric',   dreamSummary:'I flew over the Western Ghats touching the clouds...' },
  { id:'u75', name:'Deepika Iyer',      avatar:'👩🏽', city:'Chennai',      country:'IN', lat:13.08, lng:80.27, category:'celebrity', mood:'star-struck', dreamSummary:'Shah Rukh Khan was my neighbour and we had chai...' },
  { id:'u76', name:'Meera Joshi',       avatar:'👩🏽', city:'Kolkata',      country:'IN', lat:22.57, lng:88.36, category:'animals',   mood:'joyful',     dreamSummary:'Durga Puja mein sher mere saath naach raha tha...' },
  { id:'u77', name:'Sita Thapa',        avatar:'👩🏽', city:'Kathmandu',    country:'NP', lat:27.72, lng:85.32, category:'nature',    mood:'bliss',      dreamSummary:'Himalaya le malai aakash sammama puryayo...' },
  { id:'u78', name:'Fatima Bibi',       avatar:'👩🏽', city:'Karachi',      country:'PK', lat:24.86, lng:67.01, category:'timetravel',mood:'nostalgic',  dreamSummary:'Bazaar mein yaadein heeron ki tarah bik rahi thi...' },
  { id:'u79', name:'Rashmi Nair',       avatar:'👩🏽', city:'Kochi',        country:'IN', lat:9.93,  lng:76.26, category:'love',      mood:'yearning',   dreamSummary:'He whispered my name and the backwaters glowed...' },
  { id:'u80', name:'Ayesha Khan',       avatar:'👩🏽', city:'Lahore',       country:'PK', lat:31.55, lng:74.35, category:'family',    mood:'warm',       dreamSummary:'Ammi ki khushboo puri haveli mein pheli thi...' },
  { id:'u81', name:'Ravi Patel',        avatar:'🧑🏽', city:'Ahmedabad',    country:'IN', lat:23.02, lng:72.57, category:'money',     mood:'greedy',     dreamSummary:'Gold coins rained on the old city streets...' },
  { id:'u82', name:'Sunita Tamang',     avatar:'👩🏽', city:'Pokhara',      country:'NP', lat:28.21, lng:83.99, category:'horror',    mood:'terrified',  dreamSummary:'The mountain opened its eyes and looked at me...' },
  // ── EAST ASIA (15) ──
  { id:'u83', name:'Yuki Tanaka',       avatar:'👩🏻', city:'Osaka',        country:'JP', lat:34.69, lng:135.50,category:'water',     mood:'serene',     dreamSummary:'Crystal lake reflecting a thousand moons...' },
  { id:'u84', name:'Sakura Yamamoto',   avatar:'👩🏻', city:'Kyoto',        country:'JP', lat:35.01, lng:135.77,category:'nature',    mood:'peaceful',   dreamSummary:'Sakura no hana ga chou ni natta...' },
  { id:'u85', name:'Mei Lin Chen',      avatar:'👩🏻', city:'Shanghai',     country:'CN', lat:31.23, lng:121.47,category:'timetravel',mood:'amazed',     dreamSummary:'Wo chuan yue dao Tang chao de Chang\'an...' },
  { id:'u86', name:'Hana Kim',          avatar:'👩🏻', city:'Seoul',        country:'KR', lat:37.57, lng:126.98,category:'love',      mood:'yearning',   dreamSummary:'Geuneun bitmul soge nae ireumeul bulleosseo...' },
  { id:'u87', name:'Jia Wei',           avatar:'👩🏻', city:'Beijing',      country:'CN', lat:39.90, lng:116.40,category:'flying',    mood:'euphoric',   dreamSummary:'Wo fei guo Changcheng kan dao le yongheng...' },
  { id:'u88', name:'Yuna Park',         avatar:'👩🏻', city:'Busan',        country:'KR', lat:35.18, lng:129.08,category:'celebrity', mood:'thrilled',   dreamSummary:'K-pop mudae wieseo gaegeuri wa hamkke chuneul chwosseo...' },
  { id:'u89', name:'Rin Nakamura',      avatar:'👩🏻', city:'Tokyo',        country:'JP', lat:35.68, lng:139.69,category:'chase',     mood:'breathless', dreamSummary:'Shibuya no kosaten de kage ni oikaketeta...' },
  { id:'u90', name:'Xiao Yue',          avatar:'👩🏻', city:'Chengdu',      country:'CN', lat:30.57, lng:104.07,category:'animals',   mood:'delighted',  dreamSummary:'Xiongmao dailingzhe wo chuanguo zhulinjian...' },
  { id:'u91', name:'Soo-jin Lee',       avatar:'👩🏻', city:'Incheon',      country:'KR', lat:37.46, lng:126.70,category:'school',    mood:'panicked',   dreamSummary:'Siheom munje ga haengseong eoneoro doeeosseo...' },
  { id:'u92', name:'Lin Hsiao-Ting',    avatar:'👩🏻', city:'Taipei',       country:'TW', lat:25.03, lng:121.57,category:'funny',     mood:'amused',     dreamSummary:'Yeshi de shiw dou huo le guolai tiaow...' },
  { id:'u93', name:'Aoi Suzuki',        avatar:'👩🏻', city:'Nagoya',       country:'JP', lat:35.18, lng:136.91,category:'death',     mood:'eerie',      dreamSummary:'Obaachan ga mado kara hohoende miteita...' },
  { id:'u94', name:'Haruto Sato',       avatar:'🧑🏻', city:'Sapporo',     country:'JP', lat:43.06, lng:141.35,category:'horror',    mood:'chilled',    dreamSummary:'Yuki no naka de dareka ga watashi wo yonda...' },
  { id:'u95', name:'Minji Choi',        avatar:'👩🏻', city:'Daegu',        country:'KR', lat:35.87, lng:128.60,category:'erotic',    mood:'intense',    dreamSummary:'Geuui sonkili naui pireul bul buthyeosseo...' },
  { id:'u96', name:'Fang Zhi',          avatar:'👩🏻', city:'Hangzhou',     country:'CN', lat:30.27, lng:120.15,category:'spiritual', mood:'transcendent',dreamSummary:'Xihu de shui bian cheng le guang...' },
  { id:'u97', name:'Natsuki Ito',       avatar:'👩🏻', city:'Fukuoka',      country:'JP', lat:33.59, lng:130.40,category:'falling',   mood:'scared',     dreamSummary:'Ochiru toki ni tsubasa ga haeta...' },
  // ── SOUTHEAST ASIA (8) ──
  { id:'u98', name:'Rina Sari',         avatar:'👩🏽', city:'Jakarta',      country:'ID', lat:-6.21, lng:106.85,category:'nature',    mood:'wonder',     dreamSummary:'Gunung meletus bunga bukan lava...' },
  { id:'u99', name:'Ploy Suthamma',     avatar:'👩🏽', city:'Bangkok',      country:'TH', lat:13.76, lng:100.50,category:'spiritual', mood:'serene',     dreamSummary:'Wat thawng lawy yuu nuea mek...' },
  { id:'u100',name:'Maria Santos',      avatar:'👩🏽', city:'Manila',       country:'PH', lat:14.60, lng:120.98,category:'water',     mood:'terrified',  dreamSummary:'Bagyong naging isang dragon sa dagat...' },
  { id:'u101',name:'Linh Nguyen',       avatar:'👩🏻', city:'Ho Chi Minh',  country:'VN', lat:10.82, lng:106.63,category:'timetravel',mood:'thrilled',   dreamSummary:'Xe may bay qua cong thoi gian...' },
  { id:'u102',name:'Putri Wulandari',   avatar:'👩🏽', city:'Bali',         country:'ID', lat:-8.41, lng:115.19,category:'love',      mood:'enchanted',  dreamSummary:'Upacara di pura dimana semua melayang...' },
  { id:'u103',name:'Thanh Pham',        avatar:'👩🏻', city:'Hanoi',        country:'VN', lat:21.03, lng:105.85,category:'animals',   mood:'awed',       dreamSummary:'Rong bay len tu suong mu Vinh Ha Long...' },
  { id:'u104',name:'Aisyah Rahman',     avatar:'👩🏽', city:'Kuala Lumpur', country:'MY', lat:3.14,  lng:101.69,category:'celebrity', mood:'star-struck', dreamSummary:'Saya menyanyi di pentas bersama bintang K-pop...' },
  { id:'u105',name:'Nang Kham',         avatar:'👩🏽', city:'Yangon',       country:'MM', lat:16.87, lng:96.20, category:'flying',    mood:'free',       dreamSummary:'Shwedagon hpaya apaw ko pwyan pyee...' },
  // ── OCEANIA (5) ──
  { id:'u106',name:'Jade Mitchell',     avatar:'👩',  city:'Sydney',       country:'AU', lat:-33.87,lng:151.21,category:'ufo',       mood:'shocked',    dreamSummary:'A spacecraft hovered over the Opera House at dawn...' },
  { id:'u107',name:'Aroha Tane',        avatar:'👩🏽', city:'Auckland',     country:'NZ', lat:-36.85,lng:174.76,category:'family',    mood:'powerful',   dreamSummary:'Tipuna performed the haka across the sky...' },
  { id:'u108',name:'Sophie Harris',     avatar:'👱‍♀️', city:'Melbourne',   country:'AU', lat:-37.81,lng:144.96,category:'animals',   mood:'amazed',     dreamSummary:'The reef started singing in whale song...' },
  { id:'u109',name:'Emma Thompson',     avatar:'👩‍🦰', city:'Perth',       country:'AU', lat:-31.95,lng:115.86,category:'water',     mood:'disoriented',dreamSummary:'The outback turned into an endless ocean overnight...' },
  { id:'u110',name:'Mia Rawiri',        avatar:'👩🏽', city:'Wellington',   country:'NZ', lat:-41.29,lng:174.78,category:'funny',     mood:'delighted',  dreamSummary:'Hobbit holes appeared in my neighbourhood for real...' },
  // ── NORTH AMERICA (20) ──
  { id:'u111',name:'Jessica Rivera',    avatar:'👩🏽', city:'New York',     country:'US', lat:40.71, lng:-74.01,category:'chase',     mood:'fearful',    dreamSummary:'Something chased me through a dark subway tunnel...' },
  { id:'u112',name:'Mia Chen',          avatar:'👩🏻', city:'San Francisco',country:'US', lat:37.77, lng:-122.42,category:'flying',   mood:'euphoric',   dreamSummary:'I flew over the Golden Gate into another dimension...' },
  { id:'u113',name:'Chloe Tremblay',    avatar:'👩‍🦰', city:'Montreal',    country:'CA', lat:45.50, lng:-73.57,category:'love',      mood:'enchanted',  dreamSummary:'Le chateau de glace chantait des berceuses...' },
  { id:'u114',name:'Ashley Williams',   avatar:'👩‍🦱', city:'Los Angeles', country:'US', lat:34.05, lng:-118.24,category:'celebrity', mood:'embarrassed',dreamSummary:'I was on the red carpet in my pyjamas...' },
  { id:'u115',name:'Valentina Morales', avatar:'👩🏽', city:'Mexico City',  country:'MX', lat:19.43, lng:-99.13,category:'death',     mood:'calm',       dreamSummary:'Los muertos bailaban y yo me uni a la fiesta...' },
  { id:'u116',name:'Taylor Brooks',     avatar:'👩',  city:'Chicago',      country:'US', lat:41.88, lng:-87.63,category:'timetravel',mood:'dizzy',      dreamSummary:'The skyscrapers grew like trees in fast forward...' },
  { id:'u117',name:'Sophia Garcia',     avatar:'👩🏽', city:'Miami',        country:'US', lat:25.76, lng:-80.19,category:'erotic',    mood:'passionate', dreamSummary:'The ocean danced to the rhythm of our heartbeat...' },
  { id:'u118',name:'Emma Nguyen',       avatar:'👩🏻', city:'Toronto',      country:'CA', lat:43.65, lng:-79.38,category:'family',    mood:'tearful',    dreamSummary:'Grandma was waiting in a garden of light...' },
  { id:'u119',name:'Madison Cooper',    avatar:'👱‍♀️', city:'Seattle',     country:'US', lat:47.61, lng:-122.33,category:'nature',   mood:'mystified',  dreamSummary:'The coffee shop was floating in the clouds...' },
  { id:'u120',name:'Isabella Flores',   avatar:'👩🏽', city:'Houston',      country:'US', lat:29.76, lng:-95.37,category:'ufo',       mood:'excited',    dreamSummary:'Un cohete despego de mi jardin y yo iba dentro...' },
  { id:'u121',name:'Ava Campbell',      avatar:'👩‍🦰', city:'Vancouver',   country:'CA', lat:49.28, lng:-123.12,category:'animals',  mood:'playful',    dreamSummary:'Forest wolves invited me to their moonlit dance...' },
  { id:'u122',name:'Destiny Jackson',   avatar:'👩🏿', city:'Atlanta',      country:'US', lat:33.75, lng:-84.39,category:'money',     mood:'thrilled',   dreamSummary:'Money trees grew in my backyard overnight...' },
  { id:'u123',name:'Olivia Patel',      avatar:'👩🏽', city:'Denver',       country:'US', lat:39.74, lng:-104.99,category:'spiritual', mood:'transcendent',dreamSummary:'The mountains opened like doors to heaven...' },
  { id:'u124',name:'James Wilson',      avatar:'🧑',  city:'Boston',       country:'US', lat:42.36, lng:-71.06,category:'school',    mood:'panicked',   dreamSummary:'The exam was in an alien language I almost knew...' },
  { id:'u125',name:'Gabrielle Dube',    avatar:'👩‍🦱', city:'Quebec City', country:'CA', lat:46.81, lng:-71.21,category:'horror',    mood:'chilled',    dreamSummary:'Le Chateau Frontenac etait hante par ma voix...' },
  { id:'u126',name:'Aaliyah Brown',     avatar:'👩🏿', city:'Detroit',      country:'US', lat:42.33, lng:-83.05,category:'funny',     mood:'amused',     dreamSummary:'My car turned into a giant roller skate downtown...' },
  { id:'u127',name:'Sofia Hernandez',   avatar:'👩🏽', city:'Phoenix',      country:'US', lat:33.45, lng:-112.07,category:'falling',  mood:'scared',     dreamSummary:'Cai del cielo pero el desierto me atrapo suave...' },
  { id:'u128',name:'Naomi Williams',    avatar:'👩🏿', city:'Washington DC',country:'US', lat:38.91, lng:-77.04,category:'water',     mood:'calm',       dreamSummary:'The Potomac turned to crystal and I could see forever...' },
  { id:'u129',name:'Camila Rodriguez',  avatar:'👩🏽', city:'San Antonio',  country:'US', lat:29.42, lng:-98.49,category:'love',      mood:'warm',       dreamSummary:'El Alamo se lleno de luces y el me beso alli...' },
  { id:'u130',name:'Maya Thompson',     avatar:'👩',  city:'Portland',     country:'US', lat:45.52, lng:-122.68,category:'nature',   mood:'serene',     dreamSummary:'The trees whispered secrets about tomorrow...' },
  // ── SOUTH AMERICA (15) ──
  { id:'u131',name:'Valentina Rojas',   avatar:'👩🏽', city:'Buenos Aires', country:'AR', lat:-34.60,lng:-58.38,category:'love',      mood:'passionate', dreamSummary:'Bailabamos tango bajo una luna gigante...' },
  { id:'u132',name:'Beatriz Silva',     avatar:'👩🏽', city:'Sao Paulo',    country:'BR', lat:-23.55,lng:-46.63,category:'money',     mood:'excited',    dreamSummary:'Ouro chovia sobre a Paulista e eu dancava...' },
  { id:'u133',name:'Camila Vargas',     avatar:'👩🏽', city:'Bogota',       country:'CO', lat:4.71,  lng:-74.07,category:'nature',    mood:'wonder',     dreamSummary:'La selva se convirtio en un cuento de hadas...' },
  { id:'u134',name:'Ana Lucia Perez',   avatar:'👩🏽', city:'Lima',         country:'PE', lat:-12.05,lng:-77.04,category:'timetravel',mood:'awed',       dreamSummary:'Machu Picchu se reconstruia ante mis ojos...' },
  { id:'u135',name:'Isadora Mendes',    avatar:'👩🏽', city:'Rio de Janeiro',country:'BR', lat:-22.91,lng:-43.17,category:'spiritual', mood:'tearful',   dreamSummary:'O Cristo desceu e abracou cada pessoa...' },
  { id:'u136',name:'Francisca Munoz',   avatar:'👩🏽', city:'Santiago',     country:'CL', lat:-33.45,lng:-70.67,category:'falling',   mood:'dizzy',      dreamSummary:'Cai de los Andes pero flores me sostuvieron...' },
  { id:'u137',name:'Lucia Fernandez',   avatar:'👩🏽', city:'Montevideo',   country:'UY', lat:-34.88,lng:-56.16,category:'horror',    mood:'thrilled',   dreamSummary:'Bailaba tango con un fantasma en el puerto...' },
  { id:'u138',name:'Carolina Suarez',   avatar:'👩🏽', city:'Quito',        country:'EC', lat:-0.18, lng:-78.47,category:'animals',   mood:'enchanted',  dreamSummary:'Mariposas de luz brotaban del volcan...' },
  { id:'u139',name:'Gabriela Torres',   avatar:'👩🏽', city:'Medellin',     country:'CO', lat:6.25,  lng:-75.56,category:'flying',    mood:'free',       dreamSummary:'Volaba sobre las montanas con alas de flores...' },
  { id:'u140',name:'Diego Ramirez',     avatar:'🧑🏽', city:'Caracas',     country:'VE', lat:10.49, lng:-66.88,category:'family',    mood:'nostalgic',  dreamSummary:'La mesa familiar flotaba sobre la ciudad de noche...' },
  { id:'u141',name:'Juliana Costa',     avatar:'👩🏽', city:'Brasilia',     country:'BR', lat:-15.79,lng:-47.88,category:'ufo',       mood:'amazed',     dreamSummary:'Uma nave pousou na Esplanada dos Ministerios...' },
  { id:'u142',name:'Maria Jose Vidal',  avatar:'👩🏽', city:'Asuncion',     country:'PY', lat:-25.26,lng:-57.58,category:'erotic',    mood:'intense',    dreamSummary:'El rio Paraguay ardia y nosotros tambien...' },
  { id:'u143',name:'Alejandra Gomez',   avatar:'👩🏽', city:'Cali',         country:'CO', lat:3.45,  lng:-76.53,category:'celebrity', mood:'star-struck', dreamSummary:'Shakira me enseno a bailar en la Plaza de Caicedo...' },
  { id:'u144',name:'Renata Oliveira',   avatar:'👩🏽', city:'Salvador',     country:'BR', lat:-12.97,lng:-38.51,category:'death',     mood:'serene',     dreamSummary:'Os orixas danc\u0327avam e eu virei luz...' },
  { id:'u145',name:'Micaela Diaz',      avatar:'👩🏽', city:'Cordoba',      country:'AR', lat:-31.42,lng:-64.18,category:'school',    mood:'anxious',    dreamSummary:'El examen era en un idioma que inventaba mientras leia...' },
  // ── CENTRAL ASIA (5) ──
  { id:'u146',name:'Aizhan Bekova',     avatar:'👩🏽', city:'Almaty',       country:'KZ', lat:43.24, lng:76.95, category:'nature',    mood:'bliss',      dreamSummary:'Tauler altyn zharyqqa toldy, men ushtyp kettim...' },
  { id:'u147',name:'Gulnara Sadikova',  avatar:'👩🏽', city:'Tashkent',     country:'UZ', lat:41.30, lng:69.28, category:'chase',     mood:'breathless', dreamSummary:'Eski shahar devorlar ortida quvib yurdim...' },
  { id:'u148',name:'Madina Akhmetova',  avatar:'👩🏽', city:'Astana',       country:'KZ', lat:51.17, lng:71.43, category:'funny',     mood:'delighted',  dreamSummary:'At meni dalaga alip uchty, men kuldim...' },
  { id:'u149',name:'Farida Umarova',    avatar:'👩🏽', city:'Dushanbe',     country:'TJ', lat:38.54, lng:68.77, category:'water',     mood:'mystified',  dreamSummary:'Daryo oqib oqib, osmonga chiqib ketdi...' },
  { id:'u150',name:'Nuriya Aliyeva',    avatar:'👩🏽', city:'Baku',         country:'AZ', lat:40.41, lng:49.87, category:'spiritual', mood:'transcendent',dreamSummary:'Alov qullelerinin icinden nur yagirdi...' },
  // ─── Nickname Bots u151–u300 ─────────────────────────────────────────────────
  // Europa (u151–u190)
  { id:'u151', name:'jolly.m',        avatar:'👩🏼', city:'Munich',       country:'DE', lat:48.14, lng:11.58,  category:'love',      mood:'happy',        dreamSummary:'Er hat mich im Traum angelaechelt und ich bin aufgewacht mit Herzrasen...' },
  { id:'u152', name:'katya.a',        avatar:'👩🏼', city:'Vienna',       country:'AT', lat:48.21, lng:16.37,  category:'chase',     mood:'breathless',   dreamSummary:'Ich rannte durch die Ringstrasse und der Himmel war violett...' },
  { id:'u153', name:'beate.biene',    avatar:'👩🏼', city:'Hamburg',      country:'DE', lat:53.55, lng:10.00,  category:'nature',    mood:'bliss',        dreamSummary:'Der Hafen verschwand im Nebel und ich wurde ein Vogel...' },
  { id:'u154', name:'knoepfchen77',   avatar:'👩🏻', city:'Zurich',       country:'CH', lat:47.38, lng:8.54,   category:'water',     mood:'serene',       dreamSummary:'Der See war spiegelglatt und ich konnte durch ihn hindurchsehen...' },
  { id:'u155', name:'carolin1999',    avatar:'👩🏼', city:'Berlin',       country:'DE', lat:52.52, lng:13.40,  category:'school',    mood:'anxious',      dreamSummary:'Das Abitur war vorbei und trotzdem saß ich noch im Pruefungsraum...' },
  { id:'u156', name:'kate007',        avatar:'👩🏻', city:'London',       country:'GB', lat:51.51, lng:-0.13,  category:'spy',       mood:'intense',      dreamSummary:'I was chasing someone across Tower Bridge in the rain...' },
  { id:'u157', name:'dreamcatcher22', avatar:'👩🏻', city:'Dublin',       country:'IE', lat:53.33, lng:-6.25,  category:'spiritual', mood:'transcendent', dreamSummary:'The cliffs of Moher spoke to me in a language of wind...' },
  { id:'u158', name:'nightowl_99',    avatar:'👩🏼', city:'Paris',        country:'FR', lat:48.86, lng:2.35,   category:'ufo',       mood:'amazed',       dreamSummary:'Une lumiere au-dessus de la Tour Eiffel m\'a emmene dans le ciel...' },
  { id:'u159', name:'moonchild.x',    avatar:'👩🏼', city:'Amsterdam',    country:'NL', lat:52.37, lng:4.90,   category:'mystical',  mood:'mystified',    dreamSummary:'De grachten verdwenen en de stad zweefde boven de wolken...' },
  { id:'u160', name:'luna.stars',     avatar:'👩🏼', city:'Barcelona',    country:'ES', lat:41.39, lng:2.17,   category:'flying',    mood:'euphoric',     dreamSummary:'Sobrevolaba la Sagrada Familia y el mar brillaba como espejos...' },
  { id:'u161', name:'sunny.maya',     avatar:'👩🏼', city:'Madrid',       country:'ES', lat:40.42, lng:-3.70,  category:'love',      mood:'romantic',     dreamSummary:'Nos encontramos en el Retiro y el tiempo se detuvo...' },
  { id:'u162', name:'dreamy.sara',    avatar:'👩🏽', city:'Rome',         country:'IT', lat:41.90, lng:12.49,  category:'history',   mood:'awestruck',    dreamSummary:'Passeggiavo nel Colosseo e i gladiatori mi salutavano...' },
  { id:'u163', name:'mimi_paris',     avatar:'👩🏼', city:'Lyon',         country:'FR', lat:45.75, lng:4.84,   category:'food',      mood:'delighted',    dreamSummary:'La tarte aux pralines flottait dans les airs et je la mangeais...' },
  { id:'u164', name:'elli_berlin',    avatar:'👩🏼', city:'Leipzig',      country:'DE', lat:51.34, lng:12.38,  category:'music',     mood:'moved',        dreamSummary:'Ein Orchester spielte mitten auf dem Augustusplatz fuer mich allein...' },
  { id:'u165', name:'sofi.rose99',    avatar:'👩🏼', city:'Stockholm',    country:'SE', lat:59.33, lng:18.07,  category:'nature',    mood:'peaceful',     dreamSummary:'Snon fell upward in Stockholm and I danced in reverse...' },
  { id:'u166', name:'emma98',         avatar:'👩🏻', city:'Copenhagen',   country:'DK', lat:55.68, lng:12.57,  category:'family',    mood:'nostalgic',    dreamSummary:'Vi sad ved det gamle bage-bord og farmor sang for os igen...' },
  { id:'u167', name:'nina42',         avatar:'👩🏼', city:'Oslo',         country:'NO', lat:59.91, lng:10.75,  category:'water',     mood:'mystified',    dreamSummary:'Fjorden var full av lysende fisk og jeg svomte blant dem...' },
  { id:'u168', name:'traumfee',       avatar:'👩🏼', city:'Frankfurt',    country:'DE', lat:50.11, lng:8.68,   category:'flying',    mood:'free',         dreamSummary:'Ich stieg vom Maintower ab und glitt ueber die Stadt wie eine Feder...' },
  { id:'u169', name:'mondkind',       avatar:'👩🏼', city:'Cologne',      country:'DE', lat:50.94, lng:6.96,   category:'spiritual', mood:'transcendent', dreamSummary:'Der Dom leuchtete von innen und ich war ein Teil des Lichts...' },
  { id:'u170', name:'sakura.dreams',  avatar:'👩🏻', city:'Helsinki',     country:'FI', lat:60.17, lng:24.94,  category:'nature',    mood:'serene',       dreamSummary:'The northern lights shaped themselves into a hand reaching for me...' },
  { id:'u171', name:'elif.ist',       avatar:'👩🏽', city:'Istanbul',     country:'TR', lat:41.01, lng:28.95,  category:'history',   mood:'awestruck',    dreamSummary:'Ay Sofya\'nin kubbesi acildi ve icinden guvercinler cikti...' },
  { id:'u172', name:'marie.lyon',     avatar:'👩🏼', city:'Marseille',    country:'FR', lat:43.30, lng:5.37,   category:'water',     mood:'bliss',        dreamSummary:'La mer etait violette et les dauphins me guidaient vers l\'horizon...' },
  { id:'u173', name:'zara.x',         avatar:'👩🏼', city:'Milan',        country:'IT', lat:45.46, lng:9.19,   category:'celebrity', mood:'star-struck',  dreamSummary:'Sfilavo in Duomo davanti a tutto il mondo e non avevo paura...' },
  { id:'u174', name:'kiki.rio',       avatar:'👩🏼', city:'Porto',        country:'PT', lat:41.15, lng:-8.61,  category:'music',     mood:'joyful',       dreamSummary:'O fado soava nas ruas e as pedras cantavam comigo...' },
  { id:'u175', name:'leni.wave',      avatar:'👩🏼', city:'Lisbon',       country:'PT', lat:38.72, lng:-9.14,  category:'travel',    mood:'adventurous',  dreamSummary:'O Tejo levou-me para o mar e eu nao tive medo nenhum...' },
  { id:'u176', name:'anika.blue',     avatar:'👩🏼', city:'Brussels',     country:'BE', lat:50.85, lng:4.35,   category:'funny',     mood:'amused',       dreamSummary:'De EU-vergadering werd een danswedstrijd en ik won...' },
  { id:'u177', name:'vera.prg',       avatar:'👩🏼', city:'Prague',       country:'CZ', lat:50.08, lng:14.44,  category:'mystical',  mood:'mystified',    dreamSummary:'Prazsky hrad se pohyboval jako ziva bytost v noci...' },
  { id:'u178', name:'dina.waw',       avatar:'👩🏼', city:'Warsaw',       country:'PL', lat:52.23, lng:21.01,  category:'chase',     mood:'tense',        dreamSummary:'Biegłam przez Stare Miasto i mury stawały się coraz węższe...' },
  { id:'u179', name:'ria.bud',        avatar:'👩🏼', city:'Budapest',     country:'HU', lat:47.50, lng:19.04,  category:'love',      mood:'romantic',     dreamSummary:'A Duna partjan allva tudtam hogy ez igazi volt...' },
  { id:'u180', name:'sasha.kyiv',     avatar:'👩🏼', city:'Kyiv',         country:'UA', lat:50.45, lng:30.52,  category:'spiritual', mood:'hopeful',      dreamSummary:'Nad Khreshchatyk zlitaly angely i misto tsvilо bílym svitlom...' },
  { id:'u181', name:'tonia.buc',      avatar:'👩🏼', city:'Bucharest',    country:'RO', lat:44.43, lng:26.10,  category:'nature',    mood:'bliss',        dreamSummary:'Padurea Baneasa vorbea si fiecare copac spunea un secret...' },
  { id:'u182', name:'cleo.sofia',     avatar:'👩🏼', city:'Sofia',        country:'BG', lat:42.70, lng:23.32,  category:'history',   mood:'awestruck',    dreamSummary:'Vitosha se razhodila iz planina i mi pogledaxme v ochi...' },
  { id:'u183', name:'mela.ath',       avatar:'👩🏼', city:'Athens',       country:'GR', lat:37.98, lng:23.73,  category:'history',   mood:'awestruck',    dreamSummary:'Oi theoi tis Akropolhs mou milisan kai tous katalava...' },
  { id:'u184', name:'niko.m',         avatar:'🧑🏼', city:'Dusseldorf',   country:'DE', lat:51.23, lng:6.77,   category:'funny',     mood:'amused',       dreamSummary:'Ich war ein Rennwagen auf der Autobahn ohne Fahrer...' },
  { id:'u185', name:'luisa.stu',      avatar:'👩🏼', city:'Stuttgart',    country:'DE', lat:48.78, lng:9.18,   category:'work',      mood:'stressed',     dreamSummary:'Die Praesentation hatte 1000 Folien und keine Bilder...' },
  { id:'u186', name:'feli.muc',       avatar:'👩🏼', city:'Munich',       country:'DE', lat:48.15, lng:11.60,  category:'animals',   mood:'joyful',       dreamSummary:'Ein Fuchs fuehrte mich durch den Englischen Garten bei Nacht...' },
  { id:'u187', name:'pia.swiss',      avatar:'👩🏼', city:'Bern',         country:'CH', lat:46.95, lng:7.45,   category:'nature',    mood:'peaceful',     dreamSummary:'Die Alpen waren aus Kristall und ich spiegelte mich in ihnen...' },
  { id:'u188', name:'nora.wien',      avatar:'👩🏼', city:'Graz',         country:'AT', lat:47.07, lng:15.44,  category:'music',     mood:'moved',        dreamSummary:'Eine Geige spielte alleine im Schlossbergturm...' },
  { id:'u189', name:'bella.milan',    avatar:'👩🏼', city:'Turin',        country:'IT', lat:45.07, lng:7.69,   category:'travel',    mood:'adventurous',  dreamSummary:'Le Alpi erano un labirinto e trovai l\'uscita solo sorridendo...' },
  { id:'u190', name:'isla.scot',      avatar:'👩🏻', city:'Edinburgh',    country:'GB', lat:55.95, lng:-3.19,  category:'mystical',  mood:'eerie',        dreamSummary:'The castle ghosts danced reels all night and asked me to join...' },
  // Nahost (u191–u205)
  { id:'u191', name:'nour.bey',       avatar:'👩🏽', city:'Beirut',       country:'LB', lat:33.89, lng:35.50,  category:'water',     mood:'bittersweet',  dreamSummary:'Bahriyye kaanat tushriqu wa ana kuntu atadhakkaru al-manzil...' },
  { id:'u192', name:'lara.tel',       avatar:'👩🏽', city:'Tel Aviv',     country:'IL', lat:32.08, lng:34.78,  category:'love',      mood:'tender',       dreamSummary:'We danced on the beach and the sand turned to flowers...' },
  { id:'u193', name:'yasmin.cai',     avatar:'👩🏽', city:'Cairo',        country:'EG', lat:30.04, lng:31.24,  category:'history',   mood:'awestruck',    dreamSummary:'Kuntu amshi baina l-ahram wa l-nujum tatakallam...' },
  { id:'u194', name:'dina.amm',       avatar:'👩🏽', city:'Amman',        country:'JO', lat:31.96, lng:35.95,  category:'family',    mood:'nostalgic',    dreamSummary:'Bayt jiddi kaan ma\'li bish-shajar w as-sawt al-qadim...' },
  { id:'u195', name:'reem.kuw',       avatar:'👩🏽', city:'Kuwait City',  country:'KW', lat:29.37, lng:47.98,  category:'flying',    mood:'free',         dreamSummary:'Talaatu min burg al-kuwayt w tayartu fawq al-khalij...' },
  { id:'u196', name:'sara.dub',       avatar:'👩🏽', city:'Dubai',        country:'AE', lat:25.20, lng:55.27,  category:'celebrity', mood:'star-struck',  dreamSummary:'I was a guest at a party on the Burj Khalifa rooftop...' },
  { id:'u197', name:'mona.ira',       avatar:'👩🏽', city:'Baghdad',      country:'IQ', lat:33.34, lng:44.40,  category:'spiritual', mood:'transcendent', dreamSummary:'Dijla nehri altin renk akti ve ben onun uzerinde yuruyebildim...' },
  { id:'u198', name:'zoya.teh',       avatar:'👩🏽', city:'Tehran',       country:'IR', lat:35.69, lng:51.39,  category:'chase',     mood:'tense',        dreamSummary:'Dar koochehaye Tehran dowidan mikardam va saham az khودm bud...' },
  { id:'u199', name:'hana.ank',       avatar:'👩🏽', city:'Ankara',       country:'TR', lat:39.93, lng:32.86,  category:'school',    mood:'anxious',      dreamSummary:'Sinav kagidim bos kaldi ama herkese puan verdiler...' },
  { id:'u200', name:'mira.riy',       avatar:'👩🏽', city:'Riyadh',       country:'SA', lat:24.69, lng:46.72,  category:'nature',    mood:'serene',       dreamSummary:'Ar-Riyad kaanat khadraa wa l-anhar tajri fawqa r-raml...' },
  { id:'u201', name:'tala.jer',       avatar:'👩🏽', city:'Jerusalem',    country:'IL', lat:31.77, lng:35.22,  category:'spiritual', mood:'transcendent', dreamSummary:'The old city walls glowed gold and all gates were open...' },
  { id:'u202', name:'amal.mus',       avatar:'👩🏽', city:'Muscat',       country:'OM', lat:23.61, lng:58.59,  category:'water',     mood:'bliss',        dreamSummary:'Al-bahr kaan kafif al-lawn wa l-asmaak tatakallam...' },
  { id:'u203', name:'jude.man',       avatar:'🧑🏽', city:'Manama',       country:'BH', lat:26.22, lng:50.59,  category:'ufo',       mood:'amazed',       dreamSummary:'A disc-shaped craft hovered over the causeway and lit up the sea...' },
  { id:'u204', name:'nada.doe',       avatar:'👩🏽', city:'Doha',         country:'QA', lat:25.29, lng:51.53,  category:'funny',     mood:'delighted',    dreamSummary:'Al-ibil kaanat talbus thiyab wa tushahid kurat al-qadam...' },
  { id:'u205', name:'leen.aba',       avatar:'👩🏽', city:'Abu Dhabi',    country:'AE', lat:24.45, lng:54.38,  category:'animals',   mood:'joyful',       dreamSummary:'A white falcon took me across the desert on its back...' },
  // Afrika (u206–u220)
  { id:'u206', name:'amara.acc',      avatar:'👩🏿', city:'Accra',        country:'GH', lat:5.56,  lng:-0.20,  category:'music',     mood:'joyful',       dreamSummary:'The drums never stopped and my feet knew every beat...' },
  { id:'u207', name:'zola.joh',       avatar:'👩🏿', city:'Johannesburg', country:'ZA', lat:-26.20,lng:28.05,  category:'flying',    mood:'free',         dreamSummary:'I soared over the Highveld and the cities looked like circuits...' },
  { id:'u208', name:'kemi.lag',       avatar:'👩🏿', city:'Lagos',        country:'NG', lat:6.52,  lng:3.38,   category:'love',      mood:'romantic',     dreamSummary:'He was waiting on the bridge and the ocean smelled of frangipani...' },
  { id:'u209', name:'abeni.abi',      avatar:'👩🏿', city:'Abidjan',      country:'CI', lat:5.36,  lng:-4.01,  category:'nature',    mood:'bliss',        dreamSummary:'La foret de Tai chantait et les singes portaient des couronnes...' },
  { id:'u210', name:'sadia.dar',      avatar:'👩🏿', city:'Dar es Salaam',country:'TZ', lat:-6.79, lng:39.21,  category:'water',     mood:'serene',       dreamSummary:'Bahari ya Hindi ilikuwa ya rangi ya dhahabu usiku huo...' },
  { id:'u211', name:'nana.kin',       avatar:'👩🏿', city:'Kinshasa',     country:'CD', lat:-4.32, lng:15.32,  category:'family',    mood:'nostalgic',    dreamSummary:'Mama dansait dans la cour comme quand j\'etais petite...' },
  { id:'u212', name:'yara.nai',       avatar:'👩🏿', city:'Nairobi',      country:'KE', lat:-1.29, lng:36.82,  category:'animals',   mood:'amazed',       dreamSummary:'A giraffe looked me in the eye and I understood everything...' },
  { id:'u213', name:'lila.add',       avatar:'👩🏿', city:'Addis Ababa',  country:'ET', lat:9.03,  lng:38.74,  category:'spiritual', mood:'transcendent', dreamSummary:'Ye-sema neger metetat lijoch lay enkuan ena wede fiyamot leketalen...' },
  { id:'u214', name:'imara.lus',      avatar:'👩🏿', city:'Lusaka',       country:'ZM', lat:-15.42,lng:28.28,  category:'chase',     mood:'breathless',   dreamSummary:'I ran through copper-colored tunnels that kept shifting around me...' },
  { id:'u215', name:'tansy.tun',      avatar:'👩🏽', city:'Tunis',        country:'TN', lat:36.82, lng:10.17,  category:'history',   mood:'awestruck',    dreamSummary:'Carthage brulait de nouveau mais cette fois de lumiere bleue...' },
  { id:'u216', name:'malak.cas',      avatar:'👩🏽', city:'Casablanca',   country:'MA', lat:33.59, lng:-7.62,  category:'love',      mood:'tender',       dreamSummary:'Le cafe maure etait deserte et il m\'attendait avec du the a la menthe...' },
  { id:'u217', name:'ines.alg',       avatar:'👩🏽', city:'Algiers',      country:'DZ', lat:36.74, lng:3.06,   category:'flying',    mood:'euphoric',     dreamSummary:'Kunt attir fawqa l-qasba wa l-jasad kaan khafif ka-r-rih...' },
  { id:'u218', name:'binta.dak',      avatar:'👩🏿', city:'Dakar',        country:'SN', lat:14.72, lng:-17.47, category:'water',     mood:'mystified',    dreamSummary:'L\'ocean Atlantique s\'est retire et j\'ai marche jusqu\'en Amerique...' },
  { id:'u219', name:'sira.bam',       avatar:'👩🏿', city:'Bamako',       country:'ML', lat:12.65, lng:-8.00,  category:'music',     mood:'moved',        dreamSummary:'Le kora jouait seul sous le baobab et toute la nuit pleurait...' },
  { id:'u220', name:'priya.hre',      avatar:'👩🏿', city:'Harare',       country:'ZW', lat:-17.83,lng:31.05,  category:'school',    mood:'anxious',      dreamSummary:'The exam paper was written in the language of birds but I could read it...' },
  // Suedasien (u221–u232)
  { id:'u221', name:'riya.mum',       avatar:'👩🏽', city:'Mumbai',       country:'IN', lat:19.08, lng:72.88,  category:'love',      mood:'romantic',     dreamSummary:'Woh Marine Drive pe khada tha aur samundar hum dono ke liye ruka tha...' },
  { id:'u222', name:'devi.del',       avatar:'👩🏽', city:'Delhi',        country:'IN', lat:28.61, lng:77.21,  category:'spiritual', mood:'transcendent', dreamSummary:'Mata ji ne mujhe sapne mein darshan diye aur sab kuch roshan ho gaya...' },
  { id:'u223', name:'ananya.ban',     avatar:'👩🏽', city:'Bangalore',    country:'IN', lat:12.97, lng:77.59,  category:'work',      mood:'stressed',     dreamSummary:'The code compiled perfectly in the dream but crashed when I woke up...' },
  { id:'u224', name:'puja.kol',       avatar:'👩🏽', city:'Kolkata',      country:'IN', lat:22.57, lng:88.36,  category:'water',     mood:'serene',       dreamSummary:'Hooghly nodi amar sopne aakaasher moto phulike gyache chilo...' },
  { id:'u225', name:'layla.kar',      avatar:'👩🏽', city:'Karachi',      country:'PK', lat:24.86, lng:67.01,  category:'family',    mood:'nostalgic',    dreamSummary:'Ammi ki biryani ki khushbu sapne mein bhi aayi thi...' },
  { id:'u226', name:'sara.isk',       avatar:'👩🏽', city:'Islamabad',    country:'PK', lat:33.72, lng:73.04,  category:'nature',    mood:'peaceful',     dreamSummary:'The Margalla Hills sang a song only I could hear...' },
  { id:'u227', name:'nisha.col',      avatar:'👩🏽', city:'Colombo',      country:'LK', lat:6.93,  lng:79.85,  category:'animals',   mood:'amazed',       dreamSummary:'A blue elephant walked across the ocean floor and I followed it...' },
  { id:'u228', name:'mia.dha',        avatar:'👩🏽', city:'Dhaka',        country:'BD', lat:23.81, lng:90.41,  category:'flying',    mood:'euphoric',     dreamSummary:'Padma nadir upor diye ure gelam ar mone holo pakhir moto...' },
  { id:'u229', name:'tia.kat',        avatar:'👩🏽', city:'Kathmandu',    country:'NP', lat:27.71, lng:85.31,  category:'mystical',  mood:'eerie',        dreamSummary:'Pashupatinath ko mandir sanga boli ra mero naam dohoryayo...' },
  { id:'u230', name:'suni.mat',       avatar:'👩🏽', city:'Matara',       country:'LK', lat:5.95,  lng:80.54,  category:'water',     mood:'bliss',        dreamSummary:'Muhudu uda den hitiya aduma gahena me sapanaya oya...' },
  { id:'u231', name:'roo.kab',        avatar:'🧑🏽', city:'Kabul',        country:'AF', lat:34.53, lng:69.17,  category:'nature',    mood:'hopeful',      dreamSummary:'Paghman gardens were full of children laughing in the springtime...' },
  { id:'u232', name:'mara.mum2',      avatar:'👩🏽', city:'Pune',         country:'IN', lat:18.52, lng:73.86,  category:'funny',     mood:'amused',       dreamSummary:'Maza boss chakku gheun mala office madhye paduwa sambhavat hota...' },
  // Ostasien (u233–u247)
  { id:'u233', name:'yuki.tok',       avatar:'👩🏻', city:'Tokyo',        country:'JP', lat:35.69, lng:139.69, category:'love',      mood:'tender',       dreamSummary:'Sakura no shita de atta hito no kao ga wasurarenu yoru datta...' },
  { id:'u234', name:'hana.osk',       avatar:'👩🏻', city:'Osaka',        country:'JP', lat:34.69, lng:135.50, category:'food',      mood:'delighted',    dreamSummary:'Takoyaki ga sora wo tobikonde watashi no kuchi ni haitte kita...' },
  { id:'u235', name:'miku.kyo',       avatar:'👩🏻', city:'Kyoto',        country:'JP', lat:35.01, lng:135.77, category:'spiritual', mood:'transcendent', dreamSummary:'Fushimi Inari no torii ga tsuzuite tsuzuite yame ni natta...' },
  { id:'u236', name:'soo.seo',        avatar:'👩🏻', city:'Seoul',        country:'KR', lat:37.57, lng:126.98, category:'celebrity', mood:'star-struck',  dreamSummary:'BTS oppa naege sarang gosaek norae bulleo jwosseo jeongmal saebeol katda...' },
  { id:'u237', name:'ji.bur',         avatar:'👩🏻', city:'Busan',        country:'KR', lat:35.10, lng:129.04, category:'water',     mood:'serene',       dreamSummary:'Haeundae badag-eun hareubbam sai cheonggukhaeng haendabogo malhaesseo...' },
  { id:'u238', name:'wei.bei',        avatar:'👩🏻', city:'Beijing',      country:'CN', lat:39.91, lng:116.39, category:'history',   mood:'awestruck',    dreamSummary:'Gu Gong de chengqiang hui shuo hua huan gaosu wo qianshi de gushi...' },
  { id:'u239', name:'xiao.sha',       avatar:'👩🏻', city:'Shanghai',     country:'CN', lat:31.23, lng:121.47, category:'flying',    mood:'free',         dreamSummary:'Cong Dongfang Mingzhu shang tiao xia, wo xiang he zhi niao yi yang fei...' },
  { id:'u240', name:'mei.che',        avatar:'👩🏻', city:'Chengdu',      country:'CN', lat:30.66, lng:104.07, category:'animals',   mood:'joyful',       dreamSummary:'Xiong mao he wo yi qi tiao wu zhi dao tian liang...' },
  { id:'u241', name:'lin.tai',        avatar:'👩🏻', city:'Taipei',       country:'TW', lat:25.05, lng:121.53, category:'food',      mood:'amused',       dreamSummary:'Shilin ye shi de lu bian tan zhe hen duo wo hai mei chi guo de dongxi...' },
  { id:'u242', name:'yu.hon',         avatar:'👩🏻', city:'Hong Kong',    country:'HK', lat:22.32, lng:114.17, category:'chase',     mood:'breathless',   dreamSummary:'I ran across the harbour bridge as the city turned into a jungle...' },
  { id:'u243', name:'rina.sap',       avatar:'👩🏻', city:'Sapporo',      country:'JP', lat:43.06, lng:141.35, category:'nature',    mood:'peaceful',     dreamSummary:'Yuki ga furu shizuka na mori de kitsune ga tomodachi ni natta...' },
  { id:'u244', name:'luna.ulb',       avatar:'👩🏻', city:'Ulaanbaatar',  country:'MN', lat:47.91, lng:106.88, category:'animals',   mood:'amazed',       dreamSummary:'A white horse galloped across the steppe and I was its shadow...' },
  { id:'u245', name:'ruby.pyo',       avatar:'👩🏻', city:'Pyongyang',    country:'KP', lat:39.02, lng:125.75, category:'mystical',  mood:'eerie',        dreamSummary:'The city was silent except for a lullaby from a radio no one owned...' },
  { id:'u246', name:'ami.nag',        avatar:'👩🏻', city:'Nagoya',       country:'JP', lat:35.18, lng:136.91, category:'school',    mood:'anxious',      dreamSummary:'Nyuugaku shiken no hi ni seifuku wo wasurete gakkou ni itta yume...' },
  { id:'u247', name:'lin.gua',        avatar:'👩🏻', city:'Guangzhou',    country:'CN', lat:23.13, lng:113.26, category:'funny',     mood:'amused',       dreamSummary:'Wode laoshi bianle yi zhi ya dang wo da chiqian shuo cuo hua...' },
  // Suedostasien (u248–u255)
  { id:'u248', name:'anya.bkk',       avatar:'👩🏽', city:'Bangkok',      country:'TH', lat:13.75, lng:100.52, category:'spiritual', mood:'transcendent', dreamSummary:'Wat Phra Kaew sang phaan faan lae phra phum bin ma ha phon...' },
  { id:'u249', name:'sita.jog',       avatar:'👩🏽', city:'Yogyakarta',   country:'ID', lat:-7.80, lng:110.37, category:'history',   mood:'awestruck',    dreamSummary:'Borobudur bersinar dan setiap relief bergerak seperti film...' },
  { id:'u250', name:'maya.kul',       avatar:'👩🏽', city:'Kuala Lumpur', country:'MY', lat:3.14,  lng:101.69, category:'flying',    mood:'euphoric',     dreamSummary:'I flew between the Petronas Towers and touched the sky bridge...' },
  { id:'u251', name:'lita.sg',        avatar:'👩🏽', city:'Singapore',    country:'SG', lat:1.35,  lng:103.82, category:'food',      mood:'delighted',    dreamSummary:'The hawker centre had infinite stalls and I tried them all...' },
  { id:'u252', name:'ana.mnl',        avatar:'👩🏽', city:'Manila',       country:'PH', lat:14.60, lng:120.98, category:'water',     mood:'serene',       dreamSummary:'Ang dagat ng Batangas ay kumikinang sa gabi at lumapit sa aking mga paa...' },
  { id:'u253', name:'zin.ygn',        avatar:'👩🏽', city:'Yangon',       country:'MM', lat:16.87, lng:96.19,  category:'animals',   mood:'joyful',       dreamSummary:'A peacock danced on the Shwedagon stupa roof just for me...' },
  { id:'u254', name:'linh.han',       avatar:'👩🏽', city:'Hanoi',        country:'VN', lat:21.03, lng:105.85, category:'nature',    mood:'peaceful',     dreamSummary:'Ho Guom phang pha tren bau troi va toi boi trong may...' },
  { id:'u255', name:'bela.phn',       avatar:'👩🏽', city:'Phnom Penh',   country:'KH', lat:11.57, lng:104.92, category:'mystical',  mood:'eerie',        dreamSummary:'Angkor Wat floated down the Mekong in complete silence at midnight...' },
  // Ozeanien (u256–u260)
  { id:'u256', name:'ruby.syd',       avatar:'👩🏻', city:'Sydney',       country:'AU', lat:-33.87,lng:151.21, category:'water',     mood:'bliss',        dreamSummary:'I swam through the Opera House and the sails became the ocean...' },
  { id:'u257', name:'isla.mel',       avatar:'👩🏻', city:'Melbourne',    country:'AU', lat:-37.81,lng:144.96, category:'funny',     mood:'amused',       dreamSummary:'The trams flew off the tracks and orbited Federation Square...' },
  { id:'u258', name:'kiri.akl',       avatar:'👩🏽', city:'Auckland',     country:'NZ', lat:-36.86,lng:174.77, category:'nature',    mood:'serene',       dreamSummary:'I heard the kakapo call my name from the forest on Codfish Island...' },
  { id:'u259', name:'lani.sva',       avatar:'👩🏽', city:'Suva',         country:'FJ', lat:-18.14,lng:178.44, category:'spiritual', mood:'transcendent', dreamSummary:'The ancestors danced the meke on water and the stars watched...' },
  { id:'u260', name:'mele.apia',      avatar:'👩🏽', city:'Apia',         country:'WS', lat:-13.83,lng:-171.77,category:'family',    mood:'nostalgic',    dreamSummary:'Grandma was weaving a fine mat and singing the old songs again...' },
  // Nordamerika (u261–u280)
  { id:'u261', name:'chloe.nyc',      avatar:'👩🏻', city:'New York',     country:'US', lat:40.71, lng:-74.01, category:'celebrity', mood:'star-struck',  dreamSummary:'I was on a Broadway stage and the audience was made of stars...' },
  { id:'u262', name:'madison.la',     avatar:'👩🏻', city:'Los Angeles',  country:'US', lat:34.05, lng:-118.24,category:'love',      mood:'romantic',     dreamSummary:'We drove down Mulholland Drive at sunset and time stopped...' },
  { id:'u263', name:'alex.chi',       avatar:'👩🏻', city:'Chicago',      country:'US', lat:41.88, lng:-87.63, category:'chase',     mood:'breathless',   dreamSummary:'I ran up the Sears Tower staircase and it had no end...' },
  { id:'u264', name:'bri.hou',        avatar:'👩🏻', city:'Houston',      country:'US', lat:29.76, lng:-95.37, category:'ufo',       mood:'amazed',       dreamSummary:'A spacecraft landed in my backyard and the crew spoke Texan...' },
  { id:'u265', name:'nadia.mia',      avatar:'👩🏽', city:'Miami',        country:'US', lat:25.77, lng:-80.19, category:'water',     mood:'bliss',        dreamSummary:'The Atlantic was warm as a bath and glowing turquoise blue...' },
  { id:'u266', name:'zoey.sea',       avatar:'👩🏻', city:'Seattle',      country:'US', lat:47.61, lng:-122.33,category:'nature',    mood:'serene',       dreamSummary:'The Cascade Mountains walked into Puget Sound and lay down to rest...' },
  { id:'u267', name:'ava.bos',        avatar:'👩🏻', city:'Boston',       country:'US', lat:42.36, lng:-71.06, category:'school',    mood:'anxious',      dreamSummary:'My Harvard thesis was due but the library kept moving rooms...' },
  { id:'u268', name:'liv.por',        avatar:'👩🏻', city:'Portland',     country:'US', lat:45.52, lng:-122.68,category:'funny',     mood:'amused',       dreamSummary:'Every food cart served the same dream in a different bowl...' },
  { id:'u269', name:'grace.den',      avatar:'👩🏻', city:'Denver',       country:'US', lat:39.74, lng:-104.98,category:'animals',   mood:'joyful',       dreamSummary:'A bear handed me a snowboard and we raced down the Rockies...' },
  { id:'u270', name:'hailey.atl',     avatar:'👩🏽', city:'Atlanta',      country:'US', lat:33.75, lng:-84.39, category:'music',     mood:'moved',        dreamSummary:'Outkast played on my porch and the whole neighborhood danced...' },
  { id:'u271', name:'emma.pho',       avatar:'👩🏻', city:'Phoenix',      country:'US', lat:33.45, lng:-112.07,category:'mystical',  mood:'eerie',        dreamSummary:'The Sonoran Desert at night spoke in coyote voices that were mine...' },
  { id:'u272', name:'mia.van',        avatar:'👩🏼', city:'Vancouver',    country:'CA', lat:49.28, lng:-123.12,category:'nature',    mood:'peaceful',     dreamSummary:'I paddled a canoe through Stanley Park and the trees parted for me...' },
  { id:'u273', name:'lily.tor',       avatar:'👩🏼', city:'Toronto',      country:'CA', lat:43.65, lng:-79.38, category:'flying',    mood:'free',         dreamSummary:'I flew above the CN Tower and the lake below was like liquid glass...' },
  { id:'u274', name:'camille.mtl',    avatar:'👩🏼', city:'Montreal',     country:'CA', lat:45.51, lng:-73.55, category:'love',      mood:'romantic',     dreamSummary:'On se tenait sur le Mont Royal et la ville brillait pour nous...' },
  { id:'u275', name:'jade.mex',       avatar:'👩🏽', city:'Mexico City',  country:'MX', lat:19.43, lng:-99.13, category:'history',   mood:'awestruck',    dreamSummary:'Tenochtitlan regresó por una noche y caminé entre los canales...' },
  { id:'u276', name:'luna.gua',       avatar:'👩🏽', city:'Guadalajara',  country:'MX', lat:20.66, lng:-103.35,category:'music',     mood:'joyful',       dreamSummary:'Los mariachis tocaron hasta que el sol volvio a salir dos veces...' },
  { id:'u277', name:'rose.pty',       avatar:'👩🏽', city:'Panama City',  country:'PA', lat:8.99,  lng:-79.52, category:'water',     mood:'serene',       dreamSummary:'The canal was full of light-blue dolphins who carried the ships...' },
  { id:'u278', name:'mara.san',       avatar:'👩🏽', city:'San Jose',     country:'CR', lat:9.93,  lng:-84.08, category:'nature',    mood:'bliss',        dreamSummary:'La selva me abrio un camino solo para mi esta noche...' },
  { id:'u279', name:'kim.hav',        avatar:'👩🏽', city:'Havana',       country:'CU', lat:23.14, lng:-82.36, category:'music',     mood:'moved',        dreamSummary:'La salsa sonaba en el Malecon y el mar bailaba con nosotros...' },
  { id:'u280', name:'nico.m',         avatar:'🧑🏼', city:'Minneapolis',  country:'US', lat:44.98, lng:-93.27, category:'funny',     mood:'amused',       dreamSummary:'Prince showed up and we jammed in a purple snow fort all night...' },
  // Suedamerika (u281–u295)
  { id:'u281', name:'vale.bue',       avatar:'👩🏽', city:'Buenos Aires', country:'AR', lat:-34.61,lng:-58.38, category:'love',      mood:'passionate',   dreamSummary:'El tango duró toda la noche y los pies no me dolieron...' },
  { id:'u282', name:'isa.sp',         avatar:'👩🏽', city:'Sao Paulo',    country:'BR', lat:-23.55,lng:-46.63, category:'work',      mood:'stressed',     dreamSummary:'O prazo era ontem e o escritorio era um labirinto de elevadores...' },
  { id:'u283', name:'lua.rj',         avatar:'👩🏽', city:'Rio de Janeiro',country:'BR',lat:-22.91,lng:-43.17, category:'water',     mood:'bliss',        dreamSummary:'Copacabana era só minha naquela noite e o oceano cantou pra mim...' },
  { id:'u284', name:'alma.scl',       avatar:'👩🏽', city:'Santiago',     country:'CL', lat:-33.46,lng:-70.65, category:'nature',    mood:'serene',       dreamSummary:'Los Andes me hablaron en el idioma de las piedras antiguas...' },
  { id:'u285', name:'sofi.bog',       avatar:'👩🏽', city:'Bogota',       country:'CO', lat:4.71,  lng:-74.07, category:'flying',    mood:'free',         dreamSummary:'Sobrevolé la Sabana y los tunjos de oro brillaban bajo mis pies...' },
  { id:'u286', name:'vero.lim',       avatar:'👩🏽', city:'Lima',         country:'PE', lat:-12.04,lng:-77.03, category:'history',   mood:'awestruck',    dreamSummary:'Los incas me llevaron a Machu Picchu de noche y la luna era naranja...' },
  { id:'u287', name:'cami.qui',       avatar:'👩🏽', city:'Quito',        country:'EC', lat:-0.23, lng:-78.51, category:'mystical',  mood:'eerie',        dreamSummary:'El volcan Pichincha me susurro que todo el fuego era sueno...' },
  { id:'u288', name:'paz.mon',        avatar:'👩🏽', city:'Montevideo',   country:'UY', lat:-34.90,lng:-56.19, category:'family',    mood:'nostalgic',    dreamSummary:'La rambla era de mi abuela otra vez y el rio no terminaba...' },
  { id:'u289', name:'nadia.lpb',      avatar:'👩🏽', city:'La Paz',       country:'BO', lat:-16.49,lng:-68.12, category:'spiritual', mood:'transcendent', dreamSummary:'La Pachamama me tomo de la mano en el altiplano y vol amos juntas...' },
  { id:'u290', name:'lara.asu',       avatar:'👩🏽', city:'Asuncion',     country:'PY', lat:-25.30,lng:-57.64, category:'animals',   mood:'joyful',       dreamSummary:'Jaguares blancos nadaban en el rio Paraguay y me cantaban canciones...' },
  { id:'u291', name:'rita.gua',       avatar:'👩🏽', city:'Guayaquil',    country:'EC', lat:-2.20, lng:-79.90, category:'water',     mood:'serene',       dreamSummary:'El Guayas rio llevo mi canoa hasta el horizonte sin terminar...' },
  { id:'u292', name:'feli.rbo',       avatar:'👩🏽', city:'Rosario',      country:'AR', lat:-32.89,lng:-60.70, category:'music',     mood:'joyful',       dreamSummary:'Spinetta tocaba en el Parana y el rio cantaba los acordes...' },
  { id:'u293', name:'clara.cali',     avatar:'👩🏽', city:'Cali',         country:'CO', lat:3.44,  lng:-76.52, category:'dance',     mood:'euphoric',     dreamSummary:'La salsa caleña me enseño a volar sin mover los pies del suelo...' },
  { id:'u294', name:'mar.man',        avatar:'👩🏽', city:'Manaus',       country:'BR', lat:-3.10, lng:-60.02, category:'nature',    mood:'amazed',       dreamSummary:'A Amazonia respirou e me chamou pelo nome mais antigo que existe...' },
  { id:'u295', name:'tini.car',       avatar:'👩🏽', city:'Cartagena',    country:'CO', lat:10.39, lng:-75.51, category:'love',      mood:'romantic',     dreamSummary:'Las murallas de la ciudad vieja me contaron historias de amor...' },
  // Zentralasien (u296–u300)
  { id:'u296', name:'asel.bis',       avatar:'👩🏽', city:'Bishkek',      country:'KG', lat:42.87, lng:74.60,  category:'nature',    mood:'bliss',        dreamSummary:'Ala-Too mountains turned into a ocean of grass and I swam in it...' },
  { id:'u297', name:'zulfiya.sam',    avatar:'👩🏽', city:'Samarkand',    country:'UZ', lat:39.65, lng:66.98,  category:'history',   mood:'awestruck',    dreamSummary:'Registon maydoni kechasi yulduzlarga to\'lib ketdi va men qoldim...' },
  { id:'u298', name:'madi.nur',       avatar:'👩🏽', city:'Nur-Sultan',   country:'KZ', lat:51.18, lng:71.45,  category:'flying',    mood:'free',         dreamSummary:'Men Baiterek mungrasynyn bastinden koterilip ketip samaly boldym...' },
  { id:'u299', name:'gulya.ash',      avatar:'👩🏽', city:'Ashgabat',     country:'TM', lat:37.97, lng:58.38,  category:'mystical',  mood:'eerie',        dreamSummary:'Ak mermer sheher tunda yarydy we men yeke ozum shagalayardym...' },
  { id:'u300', name:'zar.dush',       avatar:'👩🏽', city:'Dushanbe',     country:'TJ', lat:38.56, lng:68.78,  category:'spiritual', mood:'transcendent', dreamSummary:'Kuh-i Bobo dar xob sukhban shud va man ba sitora suhbat kardam...' },
];

// ─── Profile Data ────────────────────────────────────────────────────────────
const BIO_POOL: string[] = [
  'Dream journaling changed my life. Looking for dream buddies!',
  'Nachteule mit lebhaften Träumen seit der Kindheit.',
  'Rüyalarımı çözümlemek benim tutkum.',
  'Los sueños son el espejo del alma.',
  'Je note tous mes rêves depuis 3 ans.',
  'I believe dreams connect us across the world.',
  'Meine Träume führen mich an Orte, die ich nie besucht habe.',
  'Lucid dreaming practitioner for 5 years.',
  'Sogni vividi ogni notte, cerco connessioni.',
  'Exploring the unconscious mind one dream at a time.',
  'Dreams are messages from the deeper self.',
  'Hayallerim beni başka dünyalara götürüyor.',
  'Fascinada por los sueños lúcidos y su significado.',
  'Mes rêves sont plus réels que la réalité parfois.',
  'Every night is an adventure in my mind.',
  'Träume zeigen uns, wer wir wirklich sind.',
  'I dream in colors most people have never seen.',
  'Sonhar é a minha forma de viajar sem sair do lugar.',
  'Мои сны открывают мне новые миры каждую ночь.',
  'My dreams predicted three events in my life.',
];

const MONTH_NAMES: Record<string, string[]> = {
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  de: ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
  tr: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  es: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  fr: ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'],
  ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
  pt: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  ru: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
};

const CONTINENT_MAP: Record<string, Record<string, string>> = {
  europe: { en:'Europe', de:'Europa', tr:'Avrupa', es:'Europa', fr:'Europe', ar:'أوروبا', pt:'Europa', ru:'Европа' },
  middleeast: { en:'Middle East', de:'Naher Osten', tr:'Orta Dogu', es:'Medio Oriente', fr:'Moyen-Orient', ar:'الشرق الأوسط', pt:'Oriente Medio', ru:'Ближний Восток' },
  africa: { en:'Africa', de:'Afrika', tr:'Afrika', es:'Africa', fr:'Afrique', ar:'أفريقيا', pt:'Africa', ru:'Африка' },
  southasia: { en:'South Asia', de:'Suedasien', tr:'Guney Asya', es:'Asia del Sur', fr:'Asie du Sud', ar:'جنوب آسيا', pt:'Sul da Asia', ru:'Южная Азия' },
  eastasia: { en:'East Asia', de:'Ostasien', tr:'Dogu Asya', es:'Asia Oriental', fr:'Asie de l\'Est', ar:'شرق آسيا', pt:'Leste Asiatico', ru:'Восточная Азия' },
  southeastasia: { en:'Southeast Asia', de:'Suedostasien', tr:'Guneydogu Asya', es:'Sudeste Asiatico', fr:'Asie du Sud-Est', ar:'جنوب شرق آسيا', pt:'Sudeste Asiatico', ru:'Юго-Восточная Азия' },
  oceania: { en:'Oceania', de:'Ozeanien', tr:'Okyanusya', es:'Oceania', fr:'Oceanie', ar:'أوقيانوسيا', pt:'Oceania', ru:'Океания' },
  northamerica: { en:'North America', de:'Nordamerika', tr:'Kuzey Amerika', es:'Norteamerica', fr:'Amerique du Nord', ar:'أمريكا الشمالية', pt:'America do Norte', ru:'Северная Америка' },
  southamerica: { en:'South America', de:'Suedamerika', tr:'Guney Amerika', es:'Sudamerica', fr:'Amerique du Sud', ar:'أمريكا الجنوبية', pt:'America do Sul', ru:'Южная Америка' },
  centralasia: { en:'Central Asia', de:'Zentralasien', tr:'Orta Asya', es:'Asia Central', fr:'Asie Centrale', ar:'آسيا الوسطى', pt:'Asia Central', ru:'Центральная Азия' },
};

function getContinentForUser(id: string): string {
  const num = parseInt(id.replace('u', ''), 10);
  if (num <= 40) return 'europe';
  if (num <= 55) return 'middleeast';
  if (num <= 70) return 'africa';
  if (num <= 82) return 'southasia';
  if (num <= 97) return 'eastasia';
  if (num <= 105) return 'southeastasia';
  if (num <= 110) return 'oceania';
  if (num <= 130) return 'northamerica';
  if (num <= 145) return 'southamerica';
  return 'centralasia';
}

// Seeded pseudo-random number generator (stable per user id)
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function formatMemberSince(dateStr: string, lang: string): string {
  const [year, month] = dateStr.split('-');
  const monthIdx = parseInt(month, 10) - 1;
  const months = MONTH_NAMES[lang] ?? MONTH_NAMES['en'];
  return `${months[monthIdx]} ${year}`;
}

function generateUsers(dreams: Dream[]): SimUser[] {
  const userCats = dreams.flatMap(d => d.tags ?? []);
  const baseUsers: SimUser[] = BASE_USERS.map((u, i) => {
    // Seeded pseudo-random based on index for stable distribution 35-98
    let matchPct = 35 + ((i * 7 + 13) % 64); // 35-98 range, well distributed
    if (userCats.length > 0) {
      const catMatch = userCats.some(c =>
        c.toLowerCase().includes(u.category.slice(0, 4))
      );
      if (catMatch) matchPct = Math.min(98, matchPct + 12);
    }

    // Seeded random for stable profile data
    const rng = seededRandom(i * 31 + 7);
    const privacyRoll = rng();
    const privacy: 'public' | 'partial' | 'private' =
      privacyRoll < 0.40 ? 'public' : privacyRoll < 0.75 ? 'partial' : 'private';

    const age = privacy === 'public' ? 18 + Math.floor(rng() * 28) : undefined;
    const memberYear = 2024 + Math.floor(rng() * 3); // 2024-2026
    const memberMonth = 1 + Math.floor(rng() * 12);  // 1-12
    const memberSince = `${memberYear}-${String(memberMonth).padStart(2, '0')}`;
    const bio = privacy === 'public' ? BIO_POOL[Math.floor(rng() * BIO_POOL.length)] : undefined;
    const dreamCount = 5 + Math.floor(rng() * 85); // 5-89
    const matchCount = 2 + Math.floor(rng() * 33); // 2-34
    const favCatIdx = Math.floor(rng() * DREAM_CATEGORIES.length);
    const favCategory = DREAM_CATEGORIES[favCatIdx].id;

    return { ...u, matchPct, privacy, age, memberSince, bio, dreamCount, matchCount, favCategory };
  });

  // Bot-Profile entfernt — nur echte Daten
  return baseUsers;
}

// ─── Dream Keywords für Autocomplete-Vorschläge ──────────────────────────────
const DREAM_KEYWORDS = [
  'flight', 'flying', 'falling', 'chasing', 'running', 'swimming',
  'water', 'ocean', 'river', 'flood', 'fire', 'earthquake', 'storm',
  'death', 'dying', 'birth', 'baby', 'child', 'family', 'friend',
  'teeth', 'naked', 'school', 'exam', 'test', 'car', 'driving',
  'house', 'home', 'door', 'window', 'stairs', 'bridge', 'forest',
  'monster', 'shadow', 'ghost', 'demon', 'angel', 'god', 'religion',
  'animal', 'snake', 'spider', 'dog', 'cat', 'horse', 'bird', 'wolf',
  'dream', 'nightmare', 'lucid', 'sleep', 'darkness', 'light', 'sun',
  'moon', 'stars', 'mountain', 'cave', 'city', 'street', 'crowd',
  'violence', 'war', 'attack', 'escape', 'lost', 'searching', 'finding',
  'love', 'sex', 'kiss', 'wedding', 'marriage', 'divorce', 'mother',
  'father', 'brother', 'sister', 'dead', 'cemetery', 'hospital',
  'treasure', 'money', 'work', 'late', 'missing', 'plane', 'train',
];

// ─── Component ────────────────────────────────────────────────────────────────
const DreamMap: React.FC<DreamMapProps> = ({
  dreams = [],
  language = 'en',
  onClose,
  isLight = false,
  onSelectParticipant,
  onNavigateToStudy,
  onNavigateToResearch,
}) => {
  const lang = (typeof language === 'string' ? language : String(language)).toLowerCase();
  const t: Translations = TRANSLATIONS[lang] ?? TRANSLATIONS['en'];
  const tLang = (cat: DreamCategory) => cat.label[lang] ?? cat.label['en'];

  const [users, setUsers] = useState<SimUser[]>([]);
  const [isLiveData, setIsLiveData] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<SimUser | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [toast, setToast] = useState<{ name: string; city: string; pct: number } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [pulsingIds, setPulsingIds] = useState<string[]>([]);
  const [showTrends, setShowTrends] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Profile overlay state ──
  const [profileUser, setProfileUser] = useState<SimUser | null>(null);
  const [profileVisible, setProfileVisible] = useState(false);

  // Bot-Profile entfernt

  const openProfile = useCallback((user: SimUser) => {
    // Bot-Check entfernt — nur echte Profile
    setProfileUser(user);
    // Trigger animation after mount
    requestAnimationFrame(() => setProfileVisible(true));
  }, []);

  const closeProfile = useCallback(() => {
    setProfileVisible(false);
    setTimeout(() => setProfileUser(null), 350);
  }, []);

  // BUG 2: Stabile Referenz fuer onNodeClick — verhindert D3-Rebuild bei
  // jedem Parent-Rerender. users per Ref, damit Callback stabil bleibt.
  const usersRef = useRef<SimUser[]>([]);
  useEffect(() => { usersRef.current = users; });
  const handleGraphNodeClick = useCallback((node: GraphNode) => {
    if (node.type === 'user' && node.metadata?.userId) {
      const uid = node.metadata.userId;
      const matchUser = usersRef.current.find(u => u.id === uid || u.id === `rp_${uid}`);
      if (matchUser) setSelectedUser(matchUser);
    }
  }, []);

  // ── Resizable split: graph height (vh) with drag handle ──
  const SPLIT_KEY = 'dreammap_graph_vh';
  const SPLIT_MIN = 15; // minimum 15vh
  const SPLIT_MAX = 65; // maximum 65vh
  const [graphVh, setGraphVh] = useState<number>(() => {
    try { const v = localStorage.getItem(SPLIT_KEY); return v ? Math.max(SPLIT_MIN, Math.min(SPLIT_MAX, Number(v))) : 35; } catch { return 35; }
  });
  const isDraggingSplitter = useRef(false);
  const splitterStartY = useRef(0);
  const splitterStartVh = useRef(35);

  const handleSplitterStart = useCallback((clientY: number) => {
    isDraggingSplitter.current = true;
    splitterStartY.current = clientY;
    splitterStartVh.current = graphVh;
  }, [graphVh]);

  const handleSplitterMove = useCallback((clientY: number) => {
    if (!isDraggingSplitter.current) return;
    const deltaVh = ((clientY - splitterStartY.current) / window.innerHeight) * 100;
    const newVh = Math.max(SPLIT_MIN, Math.min(SPLIT_MAX, splitterStartVh.current + deltaVh));
    setGraphVh(newVh);
  }, []);

  const handleSplitterEnd = useCallback(() => {
    if (!isDraggingSplitter.current) return;
    isDraggingSplitter.current = false;
    try { localStorage.setItem(SPLIT_KEY, String(Math.round(graphVh))); } catch {}
  }, [graphVh]);

  useEffect(() => {
    const onMove = (e: TouchEvent) => handleSplitterMove(e.touches[0].clientY);
    const onEnd = () => handleSplitterEnd();
    const onMouseMove = (e: MouseEvent) => handleSplitterMove(e.clientY);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    return () => { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onEnd); };
  }, [handleSplitterMove, handleSplitterEnd]);

  // ── New feature state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMapSymbolId, setExpandedMapSymbolId] = useState<string | null>(null);
  const { data: symbolSearch } = useSymbolSearch(searchQuery, lang);
  const [searchMode, setSearchMode] = useState<SearchMode>('all_words');
  const fulltext = useDreamsFulltextSearch(searchQuery, searchMode, lang);
  const infiniteSentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = infiniteSentinelRef.current;
    if (!el || !fulltext.hasMore || fulltext.loadingMore || fulltext.loading) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) fulltext.loadMore();
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [fulltext.hasMore, fulltext.loadingMore, fulltext.loading, fulltext.loadMore, fulltext.results.length]);
  const mapIsRtl = RTL_LOCALES_DM.has(lang);
  const [matchThreshold, setMatchThreshold] = useState(50);
  const [liveSearchResults, setLiveSearchResults] = useState<SimUser[]>([]);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  // ── Search type + demographic filters ──
  const [searchType, setSearchType] = useState<'all' | 'dreams' | 'interpretations' | 'symbols'>('all');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterAgeMin, setFilterAgeMin] = useState<number>(0);
  const [filterAgeMax, setFilterAgeMax] = useState<number>(99);
  const [filterNationality, setFilterNationality] = useState('');
  const [filterCity, setFilterCity] = useState('');
  // Zoom & Pan
  const [mapScale, setMapScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const lastTouchDist = useRef<number | null>(null);
  const [mapContainerSize, setMapContainerSize] = useState({ w: 375, h: 200 });
  const [individualParticipants, setIndividualParticipants] = useState<IndividualParticipant[]>([]);
  const [showResearchLayer, setShowResearchLayer] = useState(false);
  const [selectedResearchParticipant, setSelectedResearchParticipant] = useState<IndividualParticipant | null>(null);

  // Measure map container so dots align with SVG (bg-contain letterboxes 2:1 SVG)
  useEffect(() => {
    const measure = () => {
      if (mapContainerRef.current) {
        const { clientWidth, clientHeight } = mapContainerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setMapContainerSize({ w: clientWidth, h: clientHeight });
        }
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Init users: lade echte Forschungsdaten aus Supabase
  useEffect(() => {
    let cancelled = false;

    async function loadResearchData(): Promise<SimUser[]> {
      try {
        const { data: markers } = await supabase
          .from('study_map_markers')
          .select('study_code, lat, lng, city, country, dream_count, map_color')
          .limit(500);

        const { data: studies } = await supabase
          .from('research_studies')
          .select('study_code, study_name, principal_investigator, total_dreams')
          .limit(200);

        const studyMap = new Map((studies || []).map((s: any) => [s.study_code, s]));

        if (markers && markers.length > 0) {
          return markers.map((m: any, i: number) => {
            const study = studyMap.get(m.study_code) as any;
            return {
              id: `research-${m.study_code}-${i}`,
              name: study?.study_name?.substring(0, 30) || m.study_code,
              avatar: '🔬',
              city: m.city || '',
              country: m.country || '',
              lat: (m.lat > 37.72 && m.lat < 38.05 && m.lng < -122.28 && m.lng > -122.55) ? 37.8716 : m.lat,
              lng: (m.lat > 37.72 && m.lat < 38.05 && m.lng < -122.28 && m.lng > -122.55) ? -122.2594 : m.lng,
              dreamSummary: `${m.dream_count || 0} Traumberichte — ${study?.principal_investigator || 'SDDb'}`,
              category: 'spiritual',
              mood: 'peaceful',
              matchPct: Math.min(98, 40 + (m.dream_count || 0) / 100),
              privacy: 'public' as const,
              memberSince: '',
              bio: study?.study_name || '',
              dreamCount: m.dream_count || 0,
              matchCount: 0,
              favCategory: 'spiritual',
            };
          });
        }
      } catch (e) {
        console.warn('DreamMap: Supabase nicht erreichbar', e);
      }
      return [];
    }

    Promise.all([fetchMapDreams(), loadResearchData()]).then(([liveUsers, researchUsers]) => {
      if (cancelled) return;

      let finalUsers: SimUser[];

      // Kombiniere: erst echte Supabase-Daten, dann dreamMapService Daten
      const allLive = [...researchUsers];
      if (liveUsers && liveUsers.length > 0) {
        const mapped: SimUser[] = liveUsers
          .filter((u: MapDreamUser) => !u.id.startsWith('research-')) // Keine Duplikate
          .map((u: MapDreamUser) => ({
            id: u.id,
            name: u.name,
            avatar: u.avatar,
            city: u.city,
            country: u.country,
            lat: u.lat,
            lng: u.lng,
            dreamSummary: u.dreamSummary,
            category: u.category,
            mood: u.mood,
            matchPct: u.matchPct,
            privacy: u.privacy,
            memberSince: u.memberSince,
            bio: u.bio,
            dreamCount: u.dreamCount,
            matchCount: u.matchCount,
            favCategory: u.favCategory,
          }));
        allLive.push(...mapped);
      }

      // Always combine live data WITH BASE_USERS (1000 SimUsers) so the map
      // shows the full population and symbol-based filtering (BOT_SYMBOL_IDS) works.
      const base = generateUsers(dreams);
      finalUsers = allLive.length > 0 ? [...allLive, ...base] : base;
      setIsLiveData(allLive.length > 0);

      // Ocean-Fix: filter out bots whose lat/lng is not on land
      const landOnly = finalUsers.filter(u => !OCEAN_USER_IDS.has(u.id));
      setUsers(landOnly);
      const top5 = [...landOnly].sort((a, b) => b.matchPct - a.matchPct).slice(0, 5);
      setPulsingIds(top5.slice(0, 3).map(u => u.id));
    });

    return () => { cancelled = true; };
  }, []);

  // Load individual research participants for the toggle layer (paginated — all 27k+)
  useEffect(() => {
    let cancelled = false;
    async function loadIndividualParticipants() {
      try {
        const { data: studies } = await supabase
          .from('research_studies')
          .select('id, study_name');
        const studyTitleMap = new Map<string, string>(
          (studies || []).map((s: any) => [s.id, s.study_name])
        );

        // Paginate to bypass Supabase 1000-row default limit
        const BATCH = 1000;
        let allRows: any[] = [];
        let from = 0;
        while (true) {
          if (cancelled) return;
          const { data, error } = await supabase
            .from('research_participants')
            .select('id, participant_id, country, lat, lng, dream_count, study_id')
            .gt('dream_count', 0)
            .not('lat', 'is', null)
            .range(from, from + BATCH - 1);
          if (error || !data || data.length === 0) break;
          allRows.push(...data);
          if (data.length < BATCH) break;
          from += BATCH;
        }
        if (cancelled) return;
        const mapped: IndividualParticipant[] = allRows.map((p) => ({
          id: p.id,
          participant_id: p.participant_id,
          country: p.country,
          lat: p.lat,
          lng: p.lng,
          dream_count: p.dream_count,
          study_title: studyTitleMap.get(p.study_id),
        }));
        setIndividualParticipants(mapped);
      } catch (e) {
        console.warn('DreamMap: Could not load individual participants', e);
      }
    }
    loadIndividualParticipants();
    return () => { cancelled = true; };
  }, []);

  // Toast notifications every 12-18 seconds
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 12000 + Math.random() * 6000;
      notifTimerRef.current = setTimeout(() => {
        const pool = users.filter(u => u.matchPct >= 70);
        if (pool.length === 0) return scheduleNext();
        const pick = pool[Math.floor(Math.random() * pool.length)];
        setToast({ name: pick.name, city: pick.city, pct: pick.matchPct });
        setToastVisible(true);
        setPulsingIds(prev => [...new Set([...prev, pick.id])]);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
          setToastVisible(false);
          setTimeout(() => setToast(null), 400);
        }, 4000);
        scheduleNext();
      }, delay);
    };
    if (users.length > 0) scheduleNext();
    return () => {
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [users]);

  // Live Supabase search — immer ausfuehren, mit Typ- und Demografie-Filtern
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) { setLiveSearchResults([]); return; }

    const timer = setTimeout(async () => {
      setIsLiveSearching(true);
      try {
        const allResults: SimUser[] = [];

        // ── Traeume durchsuchen (Wort-basierte AND-Suche) ──
        if (searchType === 'all' || searchType === 'dreams') {
          // Jedes Wort als eigene AND-Bedingung
          const searchWords = q.split(/\s+/).filter((w: string) => w.length >= 2);
          let dreamQuery = supabase
            .from('research_dreams')
            .select('participant_id, dream_text');
          for (const word of searchWords) {
            dreamQuery = dreamQuery.ilike('dream_text', `%${word}%`);
          }
          const { data: dreams } = await dreamQuery.limit(500);

          if (dreams && dreams.length > 0) {
            const pIds = [...new Set(dreams.map((d: any) => d.participant_id as string))].slice(0, 100);
            let pQuery = supabase
              .from('research_participants')
              .select('id, participant_id, country, city, lat, lng, dream_count, gender, age')
              .in('participant_id', pIds);
            if (filterGender !== 'all') pQuery = pQuery.eq('gender', filterGender);
            if (filterAgeMin >= 0) pQuery = pQuery.gte('age', filterAgeMin);
            if (filterAgeMax < 99) pQuery = pQuery.lte('age', filterAgeMax);
            if (filterNationality) pQuery = pQuery.ilike('country', `%${filterNationality}%`);
            if (filterCity) pQuery = pQuery.ilike('city', `%${filterCity}%`);

            const { data: participants } = await pQuery;

            if (participants && participants.length > 0) {
              for (const p of participants) {
                const snippet = dreams.find((d: any) => d.participant_id === p.participant_id)?.dream_text || '';
                const idx = snippet.toLowerCase().indexOf(q.toLowerCase());
                const start = Math.max(0, idx - 30);
                const excerpt = idx >= 0
                  ? (start > 0 ? '…' : '') + snippet.slice(start, idx + q.length + 50) + '…'
                  : snippet.slice(0, 80);
                const genderTag = p.gender ? (p.gender === 'male' ? ' ♂' : p.gender === 'female' ? ' ♀' : '') : '';
                const ageTag = p.age ? `, ${p.age}J` : '';
                allResults.push({
                  id: `rp_${p.participant_id}`,
                  name: `${p.participant_id}${genderTag}${ageTag}`,
                  avatar: '🔬',
                  city: p.city || '',
                  country: p.country || '',
                  lat: p.lat || 0,
                  lng: p.lng || 0,
                  dreamSummary: `💭 ${excerpt}`,
                  category: 'spiritual',
                  mood: 'peaceful',
                  matchPct: 80,
                  privacy: 'public' as const,
                  memberSince: '',
                  bio: '',
                  dreamCount: p.dream_count || 0,
                  matchCount: 0,
                  favCategory: 'spiritual',
                });
              }
            }
          }
        }

        // ── Deutungen durchsuchen (Wort-basierte AND-Suche) ──
        if (searchType === 'all' || searchType === 'interpretations') {
          const interpWords = q.split(/\s+/).filter((w: string) => w.length >= 2);
          let interpQuery = supabase
            .from('research_interpretations')
            .select('participant_id, content, tradition');
          for (const word of interpWords) {
            interpQuery = interpQuery.ilike('content', `%${word}%`);
          }
          const { data: interps } = await interpQuery.limit(300);

          if (interps && interps.length > 0) {
            const pIds = [...new Set(interps.map((d: any) => d.participant_id as string))].slice(0, 80);
            let pQuery = supabase
              .from('research_participants')
              .select('id, participant_id, country, city, lat, lng, dream_count, gender, age')
              .in('participant_id', pIds);
            if (filterGender !== 'all') pQuery = pQuery.eq('gender', filterGender);
            if (filterAgeMin >= 0) pQuery = pQuery.gte('age', filterAgeMin);
            if (filterAgeMax < 99) pQuery = pQuery.lte('age', filterAgeMax);
            if (filterNationality) pQuery = pQuery.ilike('country', `%${filterNationality}%`);
            if (filterCity) pQuery = pQuery.ilike('city', `%${filterCity}%`);

            const { data: participants } = await pQuery;

            if (participants && participants.length > 0) {
              for (const p of participants) {
                const interp = interps.find((d: any) => d.participant_id === p.participant_id);
                const snippet = interp?.content || '';
                const idx = snippet.toLowerCase().indexOf(q.toLowerCase());
                const start = Math.max(0, idx - 30);
                const excerpt = idx >= 0
                  ? (start > 0 ? '…' : '') + snippet.slice(start, idx + q.length + 50) + '…'
                  : snippet.slice(0, 80);
                const existingId = `rp_${p.participant_id}_interp`;
                if (!allResults.some(r => r.id === existingId)) {
                  allResults.push({
                    id: existingId,
                    name: `${p.participant_id} — ${interp?.tradition || 'Deutung'}`,
                    avatar: '📖',
                    city: p.city || '',
                    country: p.country || '',
                    lat: p.lat || 0,
                    lng: p.lng || 0,
                    dreamSummary: `📝 ${excerpt}`,
                    category: 'spiritual',
                    mood: 'peaceful',
                    matchPct: 75,
                    privacy: 'public' as const,
                    memberSince: '',
                    bio: '',
                    dreamCount: p.dream_count || 0,
                    matchCount: 0,
                    favCategory: 'spiritual',
                  });
                }
              }
            }
          }
        }

        setLiveSearchResults(allResults);
      } catch {
        setLiveSearchResults([]);
      } finally {
        setIsLiveSearching(false);
      }
    }, 300);

    return () => { clearTimeout(timer); setIsLiveSearching(false); };
  }, [searchQuery, searchType, filterGender, filterAgeMin, filterAgeMax, filterNationality, filterCity]);

  // Effective threshold: when searching, drop to 0 so all results show
  const effectiveThreshold = searchQuery.trim().length > 0 ? 0 : matchThreshold;

  // Unique countries and cities for autocomplete
  // Laender aus Backend laden (research_participants)
  const [dbCountries, setDbCountries] = useState<string[]>([]);
  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
    fetch(`${apiBase}/api/demographics/countries`)
      .then(r => r.json())
      .then(d => setDbCountries(d.countries || []))
      .catch(() => {});
  }, []);

  const uniqueCountries = useMemo(() =>
    [...new Set([...users.map(u => u.country).filter(Boolean), ...dbCountries])].sort(),
    [users, dbCountries]
  );
  const uniqueCities = useMemo(() =>
    [...new Set(users.map(u => u.city).filter(Boolean))].sort(),
    [users]
  );

  const filteredUsers = useMemo(() => {
    let list = users;
    // Category filter
    if (activeCategory !== 'all') {
      list = list.filter(u => u.category === activeCategory);
    }
    // Match threshold filter
    list = list.filter(u => u.matchPct >= effectiveThreshold);
    // Gender filter
    if (filterGender !== 'all') {
      list = list.filter(u => {
        const name = u.name.toLowerCase();
        const isFemale = u.avatar.includes('👩') || u.avatar.includes('👱‍♀️') || u.avatar.includes('♀') || name.includes('♀');
        const isMale = u.avatar.includes('👨') || u.avatar.includes('🧔') || u.avatar.includes('♂') || name.includes('♂');
        if (filterGender === 'female') return isFemale;
        if (filterGender === 'male') return isMale;
        return true;
      });
    }
    // Age filter
    if (filterAgeMin > 0 || filterAgeMax < 99) {
      list = list.filter(u => {
        if (u.age == null) return true; // don't filter out users without age data
        return u.age >= filterAgeMin && u.age <= filterAgeMax;
      });
    }
    // Country filter
    if (filterNationality.trim()) {
      const nat = filterNationality.trim().toLowerCase();
      list = list.filter(u => u.country.toLowerCase().includes(nat));
    }
    // City filter
    if (filterCity.trim()) {
      const ct = filterCity.trim().toLowerCase();
      list = list.filter(u => u.city.toLowerCase().includes(ct));
    }
    // Search filter (keyword match on user-text OR symbol-id match from backend)
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      const matchedSymbolIds = new Set<string>(
        (symbolSearch?.results ?? []).map((r: any) => String(r.symbol_id ?? r.id)).filter(Boolean),
      );
      list = list.filter(u => {
        const textMatch =
          u.name.toLowerCase().includes(q) ||
          u.city.toLowerCase().includes(q) ||
          u.country.toLowerCase().includes(q) ||
          u.dreamSummary.toLowerCase().includes(q);
        if (textMatch) return true;
        if (matchedSymbolIds.size === 0) return false;
        const userSymbolIds = BOT_SYMBOL_IDS[u.id] ?? [];
        return userSymbolIds.some(sid => matchedSymbolIds.has(sid));
      });
    }
    return list;
  }, [users, activeCategory, effectiveThreshold, searchQuery, symbolSearch, filterGender, filterAgeMin, filterAgeMax, filterNationality, filterCity]);

  // Sorted for result list (descending by match%) — merge live search results (deduplicated)
  const sortedFilteredUsers = useMemo(() => {
    const localSorted = [...filteredUsers].sort((a, b) => b.matchPct - a.matchPct);
    if (liveSearchResults.length === 0) return localSorted;
    const existingIds = new Set(localSorted.map(u => u.id));
    const uniqueLive = liveSearchResults.filter(u => !existingIds.has(u.id));
    return [...localSorted, ...uniqueLive];
  }, [filteredUsers, liveSearchResults]);

  const matchColor = (pct: number) =>
    pct >= 80 ? '#22c55e' : pct >= 60 ? '#eab308' : '#f97316';

  const handleMarkerClick = useCallback((user: SimUser) => {
    setSelectedUser(prev => prev?.id === user.id ? null : user);
  }, []);

  const handleClosePanel = () => setSelectedUser(null);

  // ── Zoom / Pan handlers ──
  const handleZoomIn = useCallback(() => {
    setMapScale(s => Math.min(s + 0.5, 5));
  }, []);
  const handleZoomOut = useCallback(() => {
    setMapScale(s => {
      const next = Math.max(s - 0.5, 1);
      if (next === 1) setMapOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setMapScale(s => {
      const next = e.deltaY < 0 ? Math.min(s + 0.3, 5) : Math.max(s - 0.3, 1);
      if (next === 1) setMapOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (mapScale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: mapOffset.x, oy: mapOffset.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [mapScale, mapOffset]);
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setMapOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  }, [isDragging]);
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Pinch-to-zoom for touch
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastTouchDist.current !== null) {
        const delta = dist - lastTouchDist.current;
        setMapScale(s => {
          const next = Math.max(1, Math.min(5, s + delta * 0.01));
          if (next === 1) setMapOffset({ x: 0, y: 0 });
          return next;
        });
      }
      lastTouchDist.current = dist;
    }
  }, []);
  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null;
  }, []);

  // Select user from result list → open profile
  const handleResultClick = useCallback((user: SimUser) => {
    // Individuelle Forschungsteilnehmer → ParticipantProfile
    if (user.id.startsWith('rp_') && onSelectParticipant) {
      onSelectParticipant(user.id.slice(3));
    // Research markers (study_map_markers) → navigate to specific study's participant list
    } else if (user.id.startsWith('research-') && onNavigateToStudy) {
      const studyCode = user.id.replace(/^research-/, '').replace(/-\d+$/, '');
      onNavigateToStudy(studyCode);
    } else if (user.avatar === '🔬' && onNavigateToStudy) {
      // dream_reports entries (dr_ prefix) → go to all studies / participant profiles
      onNavigateToStudy('');
    } else {
      openProfile(user);
    }
  }, [openProfile, onSelectParticipant, onNavigateToStudy]);

  // Stats — API-basierter Counter bei aktiven Demografie-Filtern
  // BUG 3: Request-Token verhindert Race-Condition bei schnellem Filterwechsel.
  // demoCount wird nur auf erfolgreichen API-Response gesetzt; bei Fehler/0-
  // Wert-Response bleibt letzter bekannter Wert. Waehrend Loading → demoLoading=true
  // signalisiert Skeleton, statt auf 0 zurueckzuspringen.
  const hasDemoFilter = filterGender !== 'all' || filterAgeMin > 0 || filterAgeMax < 99 || !!filterNationality || !!filterCity;
  const [demoCount, setDemoCount] = useState<number | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const demoReqTokenRef = useRef(0);
  useEffect(() => {
    if (!hasDemoFilter) {
      setDemoCount(null);
      setDemoLoading(false);
      return;
    }
    setDemoLoading(true);
    const token = ++demoReqTokenRef.current;
    const timer = setTimeout(() => {
      const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
      const p = new URLSearchParams();
      if (filterGender !== 'all') p.set('gender', filterGender === 'male' ? 'Male' : 'Female');
      if (filterAgeMin > 0) p.set('age_min', String(filterAgeMin));
      if (filterAgeMax < 99) p.set('age_max', String(filterAgeMax));
      if (filterNationality) p.set('country', filterNationality);
      fetch(`${apiBase}/api/demographics/filtered-symbols?${p}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (token !== demoReqTokenRef.current) return; // stale
          if (d && typeof d.participantCount === 'number') {
            setDemoCount(d.participantCount);
          }
          setDemoLoading(false);
        })
        .catch(() => {
          if (token === demoReqTokenRef.current) setDemoLoading(false);
        });
    }, 500);
    return () => clearTimeout(timer);
  }, [hasDemoFilter, filterGender, filterAgeMin, filterAgeMax, filterNationality]);

  const baseTotal = users.length + 1847;
  const totalActive = hasDemoFilter && demoCount !== null ? demoCount : baseTotal;
  const avgMatch = filteredUsers.length > 0
    ? Math.round(filteredUsers.reduce((s, u) => s + u.matchPct, 0) / filteredUsers.length)
    : (users.length > 0 ? Math.round(users.reduce((s, u) => s + u.matchPct, 0) / users.length) : 0);
  const matchesToday = hasDemoFilter && demoCount !== null
    ? Math.floor(demoCount * 0.18)
    : Math.floor(users.length * 0.6) + 23;
  // BUG 3: Skeleton-State fuer Stats — verhindert Null->Wert-Spruenge.
  // Loading solange Users noch nicht geladen sind ODER ein Demo-Filter-Fetch
  // laeuft ohne vorherigen bekannten Wert.
  const statsLoading = users.length === 0 || (demoLoading && demoCount === null);

  // Trend rankings
  const trendRanking = React.useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach(u => {
      counts[u.category] = (counts[u.category] || 0) + 1;
    });
    const globalMultipliers: Record<string, number> = {
      flying: 892, water: 764, chase: 701, animals: 658, falling: 623,
      horror: 589, love: 547, family: 512, school: 489, spiritual: 467,
      nature: 434, death: 398, funny: 376, money: 351, erotic: 328,
      ufo: 287, timetravel: 264, celebrity: 241,
    };
    return DREAM_CATEGORIES
      .map(cat => ({
        ...cat,
        localCount: counts[cat.id] || 0,
        globalCount: (counts[cat.id] || 0) + (globalMultipliers[cat.id] || 200),
      }))
      .sort((a, b) => b.globalCount - a.globalCount);
  }, [users]);

  // Theme vars
  const bg = isLight
    ? 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
    : 'bg-gradient-to-br from-[#06030f] via-[#0d0722] to-[#0a0318]';
  const cardBg = isLight
    ? 'bg-white/70 border-purple-200/60'
    : 'bg-white/5 border-white/10';
  const textMain = isLight ? 'text-mystic-text' : 'text-white';
  const textSub = isLight ? 'text-mystic-text-secondary' : 'text-slate-400';
  const chipBg = isLight ? 'bg-white/80 border-purple-200' : 'bg-white/8 border-white/10';
  const chipActive = 'bg-purple-600 border-purple-500 text-white';

  // Letterbox-corrected coordinate mapper: bg-contain with a 2:1 SVG adds padding
  // when the container ratio ≠ 2:1 (always true on mobile portrait screens).
  const getMapCoords = (lat: number, lng: number) => {
    const w = mapContainerSize.w;
    const h = mapContainerSize.h;
    const sx = (lng + 180) / 360;
    const sy = (90 - lat) / 180;
    if (h > 0 && w / h < 2) {
      // Container narrower than 2:1 → SVG letterboxed top+bottom
      const svgH = w / 2;
      const topPad = (h - svgH) / 2;
      return { x: sx * 100, y: (topPad + sy * svgH) / h * 100 };
    }
    // Container wider than 2:1 → SVG letterboxed left+right
    const svgW = h * 2;
    const leftPad = (w - svgW) / 2;
    return { x: (leftPad + sx * svgW) / w * 100, y: sy * 100 };
  };

  // "You" marker position (center of map, roughly Berlin area)
  const youCoords = getMapCoords(50, 10);

  // Search active = collapse map
  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className={`fixed inset-0 w-full ${bg} flex flex-col`} style={{ zIndex: 55 }}>

      {/* ── Keyframe Styles ── */}
      <style>{`
        @keyframes dmPulse {
          0%,100% { transform: translate(-50%,-50%) scale(1); opacity:1; }
          50%      { transform: translate(-50%,-50%) scale(2.2); opacity:0; }
        }
        @keyframes dmSlideDown {
          from { transform: translateY(-100%); opacity:0; }
          to   { transform: translateY(0);    opacity:1; }
        }
        @keyframes dmSlideUp {
          from { transform: translateY(20px); opacity:0; }
          to   { transform: translateY(0);    opacity:1; }
        }
        @keyframes dmFadeOut {
          from { opacity:1; }
          to   { opacity:0; }
        }
        .dm-pulse-ring {
          animation: dmPulse 2s ease-in-out infinite;
          position: absolute;
          border-radius: 9999px;
          pointer-events: none;
        }
        .dm-slide-down { animation: dmSlideDown 0.35s ease both; }
        .dm-slide-up   { animation: dmSlideUp 0.35s ease both; }
        .dm-fade-out   { animation: dmFadeOut 0.4s ease forwards; }
        .dm-chip-scroll::-webkit-scrollbar { display: none; }
        @keyframes dmLivePulse { 0%,100%{opacity:1;} 50%{opacity:0.2;} }
        @keyframes dmProfileSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes dmProfileSlideDown {
          from { transform: translateY(0); }
          to   { transform: translateY(100%); }
        }
        .dm-profile-enter { animation: dmProfileSlideUp 0.35s cubic-bezier(0.32,0.72,0,1) forwards; }
        .dm-profile-exit  { animation: dmProfileSlideDown 0.35s cubic-bezier(0.32,0.72,0,1) forwards; }
      `}</style>

      {/* ── Knowledge Graph (TOP — resizable via drag handle) ── */}
      <div
        className="relative z-10 overflow-hidden shrink-0"
        style={{ height: `${graphVh}vh` }}
      >
        {/* Title + Close overlay */}
        <div className="absolute inset-x-0 top-0 z-20 pt-safe pt-3 px-4 pb-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            <div>
              <h1 className={`text-lg font-bold leading-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>{t.title}</h1>
              <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-white/60'}`}>{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              {onNavigateToResearch && (
                <button
                  onClick={onNavigateToResearch}
                  className={`h-8 px-3 rounded-full flex items-center gap-1.5 text-[10px] font-bold transition-colors ${
                    isLight ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <span className="material-icons" style={{ fontSize: 13 }}>science</span>
                  Forschungskarte
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  aria-label={lang === 'de' ? 'Zurück' : 'Back'}
                  title={lang === 'de' ? 'Zurück zur Startseite' : 'Back to home'}
                  className={`flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-semibold transition-colors ${
                    isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/10 hover:bg-white/20 text-white/80'
                  }`}
                >
                  <span className="material-icons text-base">arrow_back</span>
                  <span>{lang === 'de' ? 'Zurück' : 'Back'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {FEATURE_FLAGS.ENABLE_GRAPH ? (
          <KnowledgeGraph
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            matchThreshold={matchThreshold}
            isLight={isLight}
            language={lang}
            filterGender={filterGender}
            filterAgeMin={filterAgeMin}
            filterAgeMax={filterAgeMax}
            filterCountry={filterNationality}
            onNodeClick={handleGraphNodeClick}
            highlightedUserId={selectedUser?.id}
          />
        ) : (
          <WorldMapPreview
            isLight={!!isLight}
            language={typeof lang === 'string' ? lang : undefined}
            onClickFullscreen={() => onNavigateToResearch?.()}
          />
        )}
      </div>

      {/* ── Drag Handle (resize graph / list split) ── */}
      <div
        className={`shrink-0 flex items-center justify-center cursor-row-resize select-none touch-none z-20 ${isLight ? 'bg-indigo-100/80' : 'bg-white/5'}`}
        style={{ height: 20 }}
        onTouchStart={e => handleSplitterStart(e.touches[0].clientY)}
        onMouseDown={e => { e.preventDefault(); handleSplitterStart(e.clientY); }}
      >
        <div className={`w-10 h-1 rounded-full ${isLight ? 'bg-indigo-300' : 'bg-white/25'}`} />
      </div>

      {/* ── Scrollable bottom section (search + list) ── */}
      <div className="flex-1 overflow-y-auto min-h-0">

      {/* ── Search Field (sticky under map) ── */}
      <div className={`sticky top-0 z-30 px-3 py-2 backdrop-blur-xl ${isLight ? 'bg-indigo-50/90' : 'bg-dream-bg/90'}`}>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-sm ${isLight ? 'bg-white/70 border-purple-200/60' : 'bg-white/5 border-white/10'}`}>
          <span className={`material-icons text-lg ${isLight ? 'text-purple-400' : 'text-slate-400'}`}>search</span>
          <input
            type="search"
            inputMode="search"
            enterKeyHint="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
            placeholder={t.searchPlaceholder}
            className={`flex-1 bg-transparent outline-none text-sm ${textMain} placeholder:${textSub}`}
          />
          {searchQuery.length > 0 && (
            <button onClick={() => setSearchQuery('')} className={`${textSub} hover:${textMain}`}>
              <span className="material-icons text-lg">close</span>
            </button>
          )}
        </div>
        {/* Search-Modi-Chips — AND vs. Phrase vs. ExactWord */}
        {searchQuery.trim().length >= 2 && (
          <div className="mt-1.5 flex flex-wrap gap-1" data-testid="dreammap-search-modes">
            {(['all_words','exact_phrase','exact_word'] as const).map((m) => {
              const label = m === 'all_words' ? t.searchModeAllWords : m === 'exact_phrase' ? t.searchModeExactPhrase : t.searchModeExactWord;
              const active = searchMode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSearchMode(m)}
                  data-search-mode={m}
                  data-active={active ? 'true' : 'false'}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition ${
                    active
                      ? 'bg-cyan-600 border-cyan-500 text-white'
                      : isLight
                        ? 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                        : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
        {/* ── Matching Symbols — POST /api/symbols/search ── */}
        {searchQuery.trim().length >= 2 && (symbolSearch?.results?.length ?? 0) > 0 && (
          <div
            data-testid="dreammap-symbol-section"
            dir={mapIsRtl ? 'rtl' : 'ltr'}
            className={`mt-2 rounded-xl border overflow-hidden shadow-lg ${isLight ? 'bg-white border-indigo-200' : 'bg-gray-900 border-white/10'}`}
          >
            <div className={`flex items-center justify-between px-3 py-1.5 text-[10px] font-bold border-b ${isLight ? 'text-indigo-700 border-indigo-100 bg-indigo-50/60' : 'text-indigo-300 border-white/5 bg-white/3'}`}>
              <span className="flex items-center gap-1.5">
                <span className="material-icons text-xs">psychology</span>
                {t.matchingSymbols}
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-white/10 text-indigo-200'}`}>
                  {symbolSearch!.results.length}
                </span>
              </span>
            </div>
            {(symbolSearch!.matched_via === 'gemini_translation' || symbolSearch!.matched_via === 'query_cache') && symbolSearch!.translated_to && (
              <div
                data-testid="dreammap-symbol-translated-hint"
                className={`px-3 py-1 text-[11px] ${isLight ? 'text-slate-600 bg-indigo-50/40' : 'text-slate-300 bg-white/3'}`}
              >
                {t.translatedHint(searchQuery.trim(), symbolSearch!.translated_to)}
              </div>
            )}
            <div className="flex gap-2 overflow-x-auto px-3 py-2 dm-chip-scroll">
              {Array.from(new Map(symbolSearch!.results.map((s: any) => [String(s.symbol_id ?? s.id ?? s.name), s])).values()).slice(0, 20).map((s: any) => {
                const id = String(s.symbol_id ?? s.id ?? s.name);
                const isExpanded = expandedMapSymbolId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    data-testid="dreammap-symbol-chip"
                    onClick={() => setExpandedMapSymbolId(isExpanded ? null : id)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors ${
                      isExpanded
                        ? isLight ? 'bg-indigo-100 border-indigo-400 text-indigo-900' : 'bg-indigo-900/40 border-indigo-400 text-indigo-100'
                        : isLight ? 'bg-white border-indigo-200 text-indigo-800 hover:bg-indigo-50' : 'bg-white/5 border-white/10 text-indigo-200 hover:bg-white/10'
                    }`}
                    title={s.name}
                  >
                    <span className="text-base leading-none">{s.emoji || '✨'}</span>
                    <span className="font-semibold">{s.name}</span>
                    {s.matched_translation?.translated_name && s.matched_translation.translated_name.toLowerCase() !== String(s.name).toLowerCase() && (
                      <span className="opacity-60">· {s.matched_translation.translated_name}</span>
                    )}
                  </button>
                );
              })}
            </div>
            {(() => {
              const expanded = symbolSearch!.results.find((s: any) => String(s.symbol_id ?? s.id ?? s.name) === expandedMapSymbolId);
              if (!expanded) return null;
              return (
                <div
                  data-testid="dreammap-symbol-detail"
                  className={`px-3 py-2 text-xs border-t ${isLight ? 'border-indigo-100 bg-indigo-50/30 text-slate-700' : 'border-white/5 bg-white/3 text-slate-200'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{expanded.emoji || '✨'}</span>
                    <span className="font-bold">{expanded.name}</span>
                    {expanded.kategorie && (
                      <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-white/10 text-indigo-200'}`}>
                        {expanded.kategorie}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 opacity-80 text-[11px]">
                    {expanded.element && <span>element: {expanded.element}</span>}
                    {expanded.name_normalized && <span>id: {expanded.name_normalized}</span>}
                    {typeof expanded.frequency === 'number' && <span>freq: {expanded.frequency}</span>}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        {/* 2026-04-20 disabled: DreamMap zeigt nur Research-Dreams (User-Regel)
            SimUser-Autocomplete komplett gated, Kontext erhalten für Rollback. */}
        {false && searchQuery.trim().length >= 2 && sortedFilteredUsers.length > 0 && (
          <div className={`mt-1 rounded-xl border overflow-hidden shadow-lg ${isLight ? 'bg-white border-purple-200' : 'bg-gray-900 border-white/10'}`}>
            <div className={`px-3 py-1.5 text-[10px] font-bold border-b ${isLight ? 'text-purple-600 border-purple-100 bg-purple-50/50' : 'text-purple-300 border-white/5 bg-white/3'}`} data-testid="dreammap-combined-counter">
              {sortedFilteredUsers.length + (symbolSearch?.matching_dreams?.research_count ?? 0)} Treffer
              {(symbolSearch?.matching_dreams?.research_count ?? 0) > 0 && (
                <span className="ml-1 opacity-70 font-normal">
                  ({sortedFilteredUsers.length} SimUser + {symbolSearch!.matching_dreams!.research_count} Research)
                </span>
              )}
            </div>
            {sortedFilteredUsers.slice(0, 10).map(u => {
              const q = searchQuery.trim().toLowerCase();
              const snippet = u.dreamSummary
                ? u.dreamSummary.toLowerCase().includes(q)
                  ? (() => {
                      const idx = u.dreamSummary.toLowerCase().indexOf(q);
                      const start = Math.max(0, idx - 30);
                      return (start > 0 ? '…' : '') + u.dreamSummary.slice(start, idx + q.length + 40) + (idx + q.length + 40 < u.dreamSummary.length ? '…' : '');
                    })()
                  : u.dreamSummary.slice(0, 70)
                : '';
              return (
                <button
                  key={u.id}
                  onClick={() => handleResultClick(u)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${isLight ? 'hover:bg-purple-50' : 'hover:bg-white/5'} border-b last:border-b-0 ${isLight ? 'border-purple-100' : 'border-white/5'}`}
                >
                  <span className="text-xl shrink-0">{u.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-semibold truncate ${textMain}`}>{u.name}</div>
                    {snippet && <div className={`text-xs truncate opacity-60 ${textSub}`}>{snippet}</div>}
                  </div>
                  <span className="text-xs opacity-40 shrink-0">{u.city}</span>
                </button>
              );
            })}
          </div>
        )}
        {/* Research-Dreams aus Symbol-Match — Bug 2/3 Fix 2026-04-20
            Datenquelle: useSymbolSearch Hook, Pfad `response.matching_dreams.research_sample`
            Sample-Felder: dream_id, study_code, participant_id, snippet_80chars (bis zu 50 Samples) */}
        {searchQuery.trim().length >= 2 && (symbolSearch?.matching_dreams?.research_sample?.length ?? 0) > 0 && (
          <div className={`mt-1 rounded-xl border overflow-hidden shadow-lg ${isLight ? 'bg-white border-cyan-200' : 'bg-gray-900 border-cyan-500/20'}`} data-testid="dreammap-research-cards">
            <div className={`px-3 py-1.5 text-[10px] font-bold border-b flex items-center gap-1.5 ${isLight ? 'text-cyan-700 border-cyan-100 bg-cyan-50/50' : 'text-cyan-300 border-white/5 bg-cyan-500/5'}`}>
              <span>🔬</span>
              <span>
                {lang === 'de' ? 'Forschungs-Träume' : 'Research Dreams'} ({symbolSearch!.matching_dreams!.research_sample!.length}
                {symbolSearch!.matching_dreams!.research_total > symbolSearch!.matching_dreams!.research_sample!.length
                  ? ` ${lang === 'de' ? 'von' : 'of'} ${symbolSearch!.matching_dreams!.research_total.toLocaleString()}`
                  : ''}
                )
              </span>
            </div>
            {symbolSearch!.matching_dreams!.research_sample!.slice(0, 20).map((d) => (
              <button
                key={d.dream_id}
                onClick={() => onNavigateToStudy?.(d.study_code ?? '')}
                data-dream-id={d.dream_id}
                data-study={d.study_code ?? ''}
                className={`w-full flex items-start gap-3 px-3 py-2 text-left transition-colors ${isLight ? 'hover:bg-cyan-50' : 'hover:bg-white/5'} border-b last:border-b-0 ${isLight ? 'border-cyan-100' : 'border-white/5'}`}
              >
                <span className="text-lg shrink-0 leading-6">🔬</span>
                <div className="min-w-0 flex-1">
                  <div className={`text-[11px] font-semibold truncate ${textMain}`}>
                    {d.study_code ?? '—'} <span className="opacity-60 font-normal">· {d.participant_id ?? '—'}</span>
                  </div>
                  {d.snippet_80chars && (
                    <div className={`text-xs opacity-75 line-clamp-2 ${textSub}`}>{d.snippet_80chars}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
        {/* Keyword-Vorschläge wenn 0 Ergebnisse */}
        {searchQuery.trim().length >= 2 && sortedFilteredUsers.length === 0 && (() => {
          const q = searchQuery.trim().toLowerCase();
          const suggestions = DREAM_KEYWORDS.filter(k => k.startsWith(q) || k.includes(q));
          if (suggestions.length === 0) return null;
          return (
            <div className={`mt-1 rounded-xl border p-2 shadow-lg ${isLight ? 'bg-white border-purple-200' : 'bg-gray-900 border-white/10'}`}>
              <p className={`text-[11px] opacity-50 mb-1.5 px-1 ${textSub}`}>Traumthemen:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.slice(0, 8).map(kw => (
                  <button
                    key={kw}
                    onClick={() => setSearchQuery(kw)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${isLight ? 'border-purple-200 text-purple-700 hover:bg-purple-50' : 'border-white/20 text-purple-300 hover:bg-white/10'}`}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}
        {/* Live-Suche Lade-Indikator */}
        {searchQuery.trim().length >= 2 && isLiveSearching && (
          <div className={`mt-1 rounded-xl border overflow-hidden shadow-lg ${isLight ? 'bg-white border-purple-200' : 'bg-gray-900 border-white/10'}`}>
            <div className={`px-3 py-2 text-xs opacity-50 ${textSub}`}>Suche Traumberichte…</div>
          </div>
        )}

        {/* ── Search Type Filter: Traeume / Deutungen / Symbole ── */}
        <div className="flex gap-1.5 mt-2 overflow-x-auto dm-chip-scroll">
          {([
            { id: 'all', label: 'Alle', icon: 'apps' },
            { id: 'dreams', label: 'Traeume', icon: 'nights_stay' },
            { id: 'interpretations', label: 'Deutungen', icon: 'auto_stories' },
            { id: 'symbols', label: 'Symbole', icon: 'psychology' },
          ] as const).map(st => (
            <button
              key={st.id}
              onClick={() => setSearchType(st.id)}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                searchType === st.id ? 'bg-violet-600 border-violet-500 text-white' : `${chipBg} ${textSub}`
              }`}
            >
              <span className="material-icons" style={{ fontSize: 13 }}>{st.icon}</span>
              {st.label}
            </button>
          ))}
        </div>

        {/* 2026-04-20 gated: Demografische Filter (Alter/Land/Ort/Gender) wirkten nur
            auf SimUser-Liste, die seit DreamMap-Research-only-View versteckt ist.
            Aktuelle Quelle (matching_dreams.research_sample aus /api/symbols/search)
            akzeptiert diese Filter-Parameter noch nicht — Wiederaktivierung sobald
            Backend unterstützt. */}
        {false && (
        <div className={`mt-1.5 flex flex-wrap gap-1.5 items-center`}>
          {/* Gender */}
          <div className="flex gap-1">
            {([
              { id: 'all', label: 'Alle', icon: 'people' },
              { id: 'male', label: '♂', icon: '' },
              { id: 'female', label: '♀', icon: '' },
            ] as const).map(g => (
              <button
                key={g.id}
                onClick={() => setFilterGender(g.id)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                  filterGender === g.id ? 'bg-cyan-600 border-cyan-500 text-white' : `${chipBg} ${textSub}`
                }`}
              >
                {g.icon && <span className="material-icons mr-0.5" style={{ fontSize: 11 }}>{g.icon}</span>}
                {g.label}
              </button>
            ))}
          </div>

          {/* Age Range */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] ${chipBg} ${textSub}`}>
            <span className="material-icons" style={{ fontSize: 11 }}>calendar_today</span>
            <input
              type="number"
              min={0}
              max={99}
              value={filterAgeMin}
              onChange={e => setFilterAgeMin(Math.max(0, Number(e.target.value)))}
              className={`w-7 bg-transparent outline-none text-center text-[10px] font-bold ${textMain}`}
            />
            <span>–</span>
            <input
              type="number"
              min={0}
              max={99}
              value={filterAgeMax}
              onChange={e => setFilterAgeMax(Math.min(99, Number(e.target.value)))}
              className={`w-7 bg-transparent outline-none text-center text-[10px] font-bold ${textMain}`}
            />
            <span>J</span>
          </div>

          {/* Nationality */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] ${chipBg} ${textSub}`}>
            <span className="material-icons" style={{ fontSize: 11 }}>flag</span>
            <input
              type="text"
              list="country-suggestions"
              value={filterNationality}
              onChange={e => setFilterNationality(e.target.value)}
              placeholder="Land"
              className={`w-14 bg-transparent outline-none text-[10px] ${textMain} placeholder:${textSub}`}
            />
            <datalist id="country-suggestions">
              {uniqueCountries.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* City */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] ${chipBg} ${textSub}`}>
            <span className="material-icons" style={{ fontSize: 11 }}>location_city</span>
            <input
              type="text"
              list="city-suggestions"
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              placeholder="Ort"
              className={`w-14 bg-transparent outline-none text-[10px] ${textMain} placeholder:${textSub}`}
            />
            <datalist id="city-suggestions">
              {uniqueCities.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* Reset all filters */}
          {(filterGender !== 'all' || filterAgeMin > 0 || filterAgeMax < 99 || filterNationality || filterCity || searchType !== 'all') && (
            <button
              onClick={() => { setFilterGender('all'); setFilterAgeMin(0); setFilterAgeMax(99); setFilterNationality(''); setFilterCity(''); setSearchType('all'); }}
              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 border border-red-500/30 text-red-400 transition-all hover:bg-red-500/30"
            >
              Reset
            </button>
          )}
        </div>
        )}
      </div>

      {/* ── Stats Bar ── */}
      <div className={`flex items-center justify-around px-3 py-2 border-b backdrop-blur-sm ${isLight ? 'border-purple-100/60 bg-white/40' : 'border-white/5 bg-black/20'}`}>
        <StatPill icon="public"       value={totalActive.toLocaleString()} label={t.worldwide}    isLight={isLight} color="#a855f7" loading={statsLoading} />
        <StatPill icon="favorite"     value={`${avgMatch}%`}               label={t.dreamersSimilar.replace('%','')} isLight={isLight} color="#ec4899" loading={statsLoading} />
        <StatPill icon="bolt"         value={matchesToday.toString()}       label={t.matchestoday} isLight={isLight} color="#f59e0b" loading={statsLoading} />
        {/* Live/Demo-Badge */}
        <span
          className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            isLiveData
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : 'bg-slate-500/20 border-slate-500/30 text-slate-400'
          }`}
        >
          {isLiveData ? '● Live' : '○ Demo'}
        </span>
      </div>

      {/* ── Category Chips ── */}
      <div className="flex gap-2 px-3 py-2.5 overflow-x-auto dm-chip-scroll">
        <button
          onClick={() => setActiveCategory('all')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeCategory === 'all' ? chipActive : `${chipBg} ${textSub}`}`}
        >
          <span className="material-icons text-sm">apps</span>
          {t.filterAll}
        </button>
        {DREAM_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? 'all' : cat.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeCategory === cat.id ? chipActive : `${chipBg} ${textSub}`}`}
          >
            <span className="text-sm leading-none">{cat.icon}</span>
            {tLang(cat)}
          </button>
        ))}
      </div>

      {/* ── Match Threshold Slider ── */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-semibold ${textSub}`}>{t.matchThreshold}</span>
          <span className={`text-xs font-bold tabular-nums ${isLight ? 'text-purple-600' : 'text-purple-300'}`}>{matchThreshold}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={matchThreshold}
          onChange={e => setMatchThreshold(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #a855f7 ${matchThreshold}%, ${isLight ? '#e2e0e7' : '#1e1b2e'} ${matchThreshold}%)`,
          }}
        />
      </div>

      {/* ── Research Participants Toggle ── */}
      <button
        onClick={() => { setShowResearchLayer(prev => !prev); setSelectedResearchParticipant(null); }}
        className={`mx-3 mb-2 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
          showResearchLayer
            ? 'bg-cyan-600 border-cyan-500 text-white'
            : `${cardBg} ${textSub} backdrop-blur-sm`
        }`}
      >
        <span className="text-sm">🔬</span>
        {showResearchLayer
          ? (lang === 'de' ? `Forschungsteilnehmer ausblenden (${individualParticipants.length.toLocaleString()})` : `Hide Research Participants (${individualParticipants.length.toLocaleString()})`)
          : (lang === 'de' ? `Forschungsteilnehmer anzeigen (${individualParticipants.length.toLocaleString()})` : `Show Research Participants (${individualParticipants.length.toLocaleString()})`)
        }
        <span className="material-icons text-sm">{showResearchLayer ? 'visibility_off' : 'visibility'}</span>
      </button>

      {/* ── Trend Rankings Toggle ── */}
      <button
        onClick={() => setShowTrends(prev => !prev)}
        className={`mx-3 mb-2 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
          showTrends
            ? 'bg-purple-600 border-purple-500 text-white'
            : `${cardBg} ${textSub} backdrop-blur-sm`
        }`}
      >
        <span className="material-icons text-sm">leaderboard</span>
        {showTrends ? t.hideTrends : t.showTrends}
        <span className="material-icons text-sm">{showTrends ? 'expand_less' : 'expand_more'}</span>
      </button>

      {/* ── Trend Rankings List ── */}
      {showTrends && (
        <div className={`mx-3 mb-2 rounded-2xl border backdrop-blur-xl overflow-hidden dm-slide-up ${
          isLight ? 'bg-white/80 border-purple-200/60' : 'bg-white/5 border-white/10'
        }`}>
          <div className={`sticky top-0 px-4 py-2.5 border-b backdrop-blur-xl ${
            isLight ? 'bg-white/90 border-purple-100' : 'bg-dream-surface/90 border-white/5'
          }`}>
            <div className="flex items-center gap-2">
              <span className="material-icons text-purple-400 text-base">trending_up</span>
              <span className={`text-sm font-bold ${textMain}`}>{t.trendTitle}</span>
            </div>
          </div>
          {trendRanking.map((cat, i) => {
            const maxCount = trendRanking[0]?.globalCount || 1;
            const barWidth = (cat.globalCount / maxCount) * 100;
            const isTop3 = i < 3;
            const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32'];
            const rankBg = isTop3 ? rankColors[i] : undefined;
            return (
              <div
                key={cat.id}
                className={`relative flex items-center gap-3 px-4 py-2.5 border-b transition-colors cursor-pointer ${
                  isLight ? 'border-purple-50 hover:bg-purple-50/60' : 'border-white/3 hover:bg-white/5'
                }`}
                onClick={() => { setActiveCategory(cat.id); setShowTrends(false); }}
              >
                <div
                  className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                    isTop3 ? 'text-white' : `${isLight ? 'bg-purple-100 text-purple-600' : 'bg-white/8 text-slate-400'}`
                  }`}
                  style={rankBg ? { background: rankBg } : undefined}
                >
                  {i + 1}
                </div>
                <span className="text-lg leading-none shrink-0">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold truncate ${textMain}`}>{tLang(cat)}</span>
                    <span className={`text-[10px] font-bold tabular-nums ${isLight ? 'text-purple-600' : 'text-purple-300'}`}>
                      {cat.globalCount.toLocaleString()} {t.trendDreamers}
                    </span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-purple-100' : 'bg-white/8'}`}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${barWidth}%`,
                        background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Result List (NO own scroll container) ── */}
      <div className="px-2 pt-1" style={{ paddingBottom: '80px' }}>
        <div className="flex items-center justify-between px-3 py-2">
          <span className={`text-sm font-bold ${textMain}`} data-testid="dreammap-research-counter">
            {fulltext.total.toLocaleString()} {t.scientificDreamReports}
            {fulltext.total > 0 && fulltext.results.length < fulltext.total && (
              <span className={`ml-1 text-[10px] font-normal opacity-60`} data-testid="dreammap-loaded-count">
                ({fulltext.results.length} {lang === 'de' ? 'geladen' : 'loaded'})
              </span>
            )}
          </span>
          {!selectedUser && (
            <span className={`text-[10px] ${textSub}`}>{t.tapMarker}</span>
          )}
        </div>
        <div
          className={`rounded-2xl border backdrop-blur-sm ${
            isLight ? 'bg-white/60 border-cyan-200/60' : 'bg-white/3 border-cyan-500/10'
          }`}
          data-testid="dreammap-research-list"
        >
          {/* 2026-04-20 Research-Dreams-List via /api/dreams/fulltext-search
              AND-Match je nach searchMode (all_words / exact_phrase / exact_word).
              Infinite-Scroll: IntersectionObserver am Sentinel unten ruft loadMore(). */}
          {fulltext.results.length === 0 && !fulltext.loading ? (
            <div className={`flex items-center justify-center ${textSub}`}>
              <div className="text-center py-8">
                <span className="material-icons text-3xl mb-2 block opacity-40">search_off</span>
                <span className="text-sm">{t.noDreamsFound}</span>
              </div>
            </div>
          ) : (
            <>
              {fulltext.results.map((d) => (
                <button
                  key={d.dream_id}
                  onClick={() => onNavigateToStudy?.(d.study_code ?? '')}
                  data-dream-id={d.dream_id}
                  data-study={d.study_code ?? ''}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors border-b last:border-b-0 ${
                    isLight ? 'hover:bg-cyan-50 border-cyan-100/60' : 'hover:bg-white/5 border-white/5'
                  }`}
                >
                  <span className="text-xl shrink-0 leading-6">🔬</span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-semibold truncate ${textMain}`}>
                      {d.study_code ?? '—'} <span className="opacity-60 font-normal">· {d.participant_id ?? '—'}</span>
                    </div>
                    {d.snippet && (
                      <div className={`text-xs opacity-75 line-clamp-2 ${textSub}`}>{d.snippet}</div>
                    )}
                  </div>
                </button>
              ))}
              {/* Infinite-Scroll Sentinel + Status */}
              <div
                ref={infiniteSentinelRef}
                data-testid="dreammap-infinite-sentinel"
                className={`px-3 py-3 text-center text-[11px] ${textSub}`}
              >
                {fulltext.loadingMore ? t.searchLoadingMore : fulltext.hasMore ? '…' : fulltext.results.length > 0 ? t.searchAllLoaded : ''}
              </div>
            </>
          )}
          {/* 2026-04-20 disabled: SimUser-Map (DreamMap zeigt nur Research-Dreams, User-Regel) */}
          {false && sortedFilteredUsers.length > 0 && sortedFilteredUsers.map(u => {
              const isActive = selectedUser?.id === u.id;
              const cat = DREAM_CATEGORIES.find(c => c.id === u.category);
              return (
                <div
                  key={u.id}
                  onClick={() => handleResultClick(u)}
                  className={`flex items-center gap-3 px-3 py-2.5 border-b cursor-pointer transition-colors ${
                    isActive
                      ? (isLight ? 'bg-purple-100/80 border-purple-200' : 'bg-purple-900/30 border-purple-500/20')
                      : (isLight ? 'border-purple-50 hover:bg-purple-50/60' : 'border-white/3 hover:bg-white/5')
                  }`}
                >
                  <span className="text-2xl leading-none shrink-0">{u.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold truncate ${textMain}`}>{u.name}</span>
                      {cat && <span className="text-xs leading-none">{cat.icon}</span>}
                    </div>
                    <div className={`text-[11px] ${textSub}`}>{u.city}, {u.country}</div>
                    <p className={`text-xs italic truncate mt-0.5 ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'}`}>
                      {u.dreamSummary}
                    </p>
                  </div>
                  <div
                    className="shrink-0 px-2 py-1 rounded-lg text-xs font-extrabold tabular-nums"
                    style={{
                      background: matchColor(u.matchPct) + '22',
                      color: matchColor(u.matchPct),
                      border: `1px solid ${matchColor(u.matchPct)}44`,
                    }}
                  >
                    {u.matchPct}%
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      </div>{/* ── End scrollable bottom section ── */}

      {/* ── Research Participant Mini-Popup ── */}
      {selectedResearchParticipant && !selectedUser && (
        <div className={`fixed bottom-0 inset-x-0 z-50 rounded-t-3xl border-t backdrop-blur-xl p-5 dm-slide-up ${isLight ? 'bg-white/85 border-cyan-200/60' : 'bg-dream-surface/90 border-cyan-700/20'}`}
          style={{ maxHeight: '40vh', overflowY: 'auto' }}>
          <div className={`w-10 h-1 rounded-full mx-auto mb-4 ${isLight ? 'bg-cyan-300' : 'bg-white/20'}`} />
          <div className="flex items-start gap-3 mb-4">
            <div className="text-3xl leading-none">🔬</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`font-bold text-base ${textMain}`}>{selectedResearchParticipant.participant_id}</div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {lang === 'de' ? 'Forschungsteilnehmer' : 'Research Participant'}
                </span>
              </div>
              {selectedResearchParticipant.country && (
                <div className={`text-xs mt-0.5 ${textSub}`}>{selectedResearchParticipant.country}</div>
              )}
              {selectedResearchParticipant.study_title && (
                <div className={`text-xs mt-1 opacity-70 ${textMain}`}>{selectedResearchParticipant.study_title}</div>
              )}
              <div className={`text-xs mt-1 ${textSub}`}>
                {lang === 'de' ? 'Träume' : 'Dreams'}: <span className="font-bold text-cyan-400">{selectedResearchParticipant.dream_count}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedResearchParticipant(null)}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-colors ${isLight ? 'bg-white border-cyan-200 text-cyan-700 hover:bg-cyan-50' : 'bg-white/8 border-white/10 text-white hover:bg-white/15'}`}
            >
              {lang === 'de' ? 'Schließen' : 'Close'}
            </button>
            {onSelectParticipant && (
              <button
                onClick={() => { setSelectedResearchParticipant(null); onSelectParticipant(selectedResearchParticipant.id); }}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:opacity-90 transition-opacity"
              >
                <span className="material-icons text-base align-middle mr-1">person</span>
                {lang === 'de' ? 'Profil ansehen' : 'View Profile'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Match Detail Panel (Slide-Up) ── */}
      {selectedUser && (
        <div className={`fixed bottom-0 inset-x-0 z-50 rounded-t-3xl border-t backdrop-blur-xl p-5 dm-slide-up ${isLight ? 'bg-white/85 border-purple-200/60' : 'bg-dream-surface/90 border-white/10'}`}
          style={{ maxHeight: '55vh', overflowY: 'auto' }}>

          {/* Drag handle */}
          <div className={`w-10 h-1 rounded-full mx-auto mb-4 ${isLight ? 'bg-purple-300' : 'bg-white/20'}`} />

          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl leading-none">{selectedUser.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className={`font-bold text-base truncate ${textMain}`}>{selectedUser.name}</div>
              <div className={`text-xs ${textSub}`}>{t.from} {selectedUser.city}, {selectedUser.country}</div>
              <div className="mt-1 flex items-center gap-1.5">
                {(() => {
                  const cat = DREAM_CATEGORIES.find(c => c.id === selectedUser.category);
                  return cat ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: cat.color + '22', color: cat.color, border: `1px solid ${cat.color}44` }}>
                      {cat.icon} {tLang(cat)}
                    </span>
                  ) : null;
                })()}
                <span className={`text-xs ${textSub}`}>{selectedUser.mood}</span>
              </div>
            </div>
            {/* Match score circle */}
            <div className="shrink-0 flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-full flex flex-col items-center justify-center border-4 font-bold text-xs"
                style={{
                  borderColor: matchColor(selectedUser.matchPct),
                  background: matchColor(selectedUser.matchPct) + '22',
                  color: matchColor(selectedUser.matchPct),
                }}
              >
                <span className="text-base font-extrabold leading-none">{selectedUser.matchPct}%</span>
                <span className="text-[9px] opacity-70">match</span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-3 mb-4 border ${isLight ? 'bg-purple-50/80 border-purple-100' : 'bg-white/5 border-white/8'}`}>
            <div className={`text-xs font-semibold mb-1 ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>{t.dreamSummary}</div>
            <TranslatedText text={selectedUser.dreamSummary} sourceId={selectedUser.id} table="map_users" field="dreamSummary" as="p" className={`text-sm leading-relaxed ${textMain}`} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClosePanel}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-colors ${isLight ? 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50' : 'bg-white/8 border-white/10 text-white hover:bg-white/15'}`}
            >
              {t.close}
            </button>
            <button
              onClick={() => {
                handleClosePanel();
                if (selectedUser.id.startsWith('rp_') && onSelectParticipant) {
                  onSelectParticipant(selectedUser.id.slice(3));
                } else if (selectedUser.id.startsWith('research-') && onNavigateToStudy) {
                  const studyCode = selectedUser.id.replace(/^research-/, '').replace(/-\d+$/, '');
                  onNavigateToStudy(studyCode);
                } else if (selectedUser.avatar === '🔬' && onNavigateToStudy) {
                  onNavigateToStudy('');
                } else {
                  openProfile(selectedUser);
                }
              }}
              className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity"
            >
              <span className="material-icons text-base align-middle mr-1">{selectedUser.id.startsWith('rp_') ? 'person' : (selectedUser.id.startsWith('research-') || selectedUser.avatar === '🔬') ? 'science' : 'person'}</span>
              {selectedUser.id.startsWith('rp_') ? (language === 'de' ? 'Profil öffnen' : 'Open Profile') : (selectedUser.id.startsWith('research-') || selectedUser.avatar === '🔬') ? (language === 'de' ? 'Studie öffnen' : 'Open Study') : t.profileShowProfile}
            </button>
          </div>
        </div>
      )}

      {/* ── Profile Overlay ── */}
      {profileUser && (() => {
        const pu = profileUser;
        const continent = getContinentForUser(pu.id);
        const continentLabel = CONTINENT_MAP[continent]?.[lang] ?? CONTINENT_MAP[continent]?.['en'] ?? continent;
        const favCat = DREAM_CATEGORIES.find(c => c.id === pu.favCategory);
        const favCatLabel = favCat ? (favCat.label[lang] ?? favCat.label['en']) : '';
        const displayName = pu.privacy === 'private'
          ? t.profileAnonymous
          : pu.privacy === 'partial'
            ? `${pu.name.split(' ')[0]} ${pu.name.split(' ').slice(1).map(n => n[0] + '.').join(' ')}`.trim()
            : pu.name;
        const displayAvatar = pu.privacy === 'private' ? '🔮' : pu.avatar;
        const displayLocation = pu.privacy === 'private'
          ? continentLabel
          : pu.privacy === 'partial'
            ? pu.city
            : `${pu.city}, ${pu.country}`;

        return (
          <>
            {/* Backdrop */}
            <div
              className={`fixed inset-0 z-[60] transition-opacity duration-300 ${profileVisible ? 'bg-black/50 backdrop-blur-sm opacity-100' : 'opacity-0'}`}
              onClick={closeProfile}
            />
            {/* Profile Sheet */}
            <div
              className={`fixed inset-0 z-[61] flex flex-col ${profileVisible ? 'dm-profile-enter' : 'dm-profile-exit'}`}
            >
              <div
                className={`flex-1 flex flex-col overflow-y-auto ${
                  isLight
                    ? 'bg-gradient-to-b from-white/95 via-indigo-50/95 to-purple-50/95 backdrop-blur-2xl'
                    : 'bg-gradient-to-b from-[#0d0722]/98 via-[#0a0318]/98 to-[#06030f]/98 backdrop-blur-2xl'
                }`}
              >
                {/* Header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b ${
                  isLight ? 'border-purple-100/60' : 'border-white/8'
                }`}>
                  <button
                    onClick={closeProfile}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                      isLight ? 'text-purple-700 hover:bg-purple-50' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="material-icons text-lg">arrow_back</span>
                    {t.profileBack}
                  </button>
                  <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/8'
                    }`}
                  >
                    <span className="material-icons text-sm">flag</span>
                    {t.profileReport}
                  </button>
                </div>

                {/* Avatar + Name */}
                <div className="flex flex-col items-center pt-8 pb-4 px-4">
                  <div className="text-6xl leading-none mb-3">{displayAvatar}</div>
                  <div className={`text-xl font-bold ${textMain}`}>{displayName}</div>
                  <div className={`text-sm mt-1 ${textSub}`}>{displayLocation}</div>
                  {pu.privacy === 'public' && (
                    <div className={`text-xs mt-1 ${textSub}`}>
                      {t.profileMemberSince} {formatMemberSince(pu.memberSince, lang)}
                    </div>
                  )}
                  {/* Privacy badge */}
                  {pu.privacy === 'partial' && (
                    <div className={`mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                      isLight ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-900/20 text-amber-400 border border-amber-500/20'
                    }`}>
                      <span className="text-sm">🔒</span>
                      {t.profilePartialPrivate}
                    </div>
                  )}
                  {pu.privacy === 'private' && (
                    <div className={`mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                      isLight ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}>
                      <span className="text-sm">🔒</span>
                      {t.profilePrivate}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className={`mx-4 rounded-2xl border p-4 mb-4 ${
                  isLight ? 'bg-white/60 border-purple-200/60' : 'bg-white/5 border-white/8'
                }`}>
                  <div className="flex items-center justify-around">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-lg">🌙</span>
                        <span className={`text-lg font-bold ${textMain}`}>{pu.dreamCount}</span>
                      </div>
                      <span className={`text-[10px] ${textSub}`}>{t.profileDreams}</span>
                    </div>
                    {pu.privacy === 'public' && (
                      <>
                        <div className={`w-px h-8 ${isLight ? 'bg-purple-200' : 'bg-white/10'}`} />
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-lg">🤝</span>
                            <span className={`text-lg font-bold ${textMain}`}>{pu.matchCount}</span>
                          </div>
                          <span className={`text-[10px] ${textSub}`}>{t.profileMatches}</span>
                        </div>
                        <div className={`w-px h-8 ${isLight ? 'bg-purple-200' : 'bg-white/10'}`} />
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-lg">❤️</span>
                            {favCat && <span className="text-sm">{favCat.icon}</span>}
                          </div>
                          <span className={`text-[10px] ${textSub}`}>{t.profileFavorite}: {favCatLabel}</span>
                        </div>
                      </>
                    )}
                  </div>
                  {pu.privacy === 'public' && pu.age && (
                    <div className={`mt-3 pt-3 text-center text-xs border-t ${
                      isLight ? 'border-purple-100 text-slate-500' : 'border-white/5 text-slate-400'
                    }`}>
                      {pu.age} years old
                    </div>
                  )}
                </div>

                {/* Bio (public only) */}
                {pu.privacy === 'public' && pu.bio && (
                  <div className={`mx-4 rounded-2xl border p-4 mb-4 ${
                    isLight ? 'bg-white/60 border-purple-200/60' : 'bg-white/5 border-white/8'
                  }`}>
                    <p className={`text-sm leading-relaxed italic ${textMain}`}>
                      &ldquo;{pu.bio}&rdquo;
                    </p>
                  </div>
                )}

                {/* Last Dream (public + partial) */}
                {pu.privacy !== 'private' ? (
                  <div className={`mx-4 rounded-2xl border p-4 mb-4 ${
                    isLight ? 'bg-white/60 border-purple-200/60' : 'bg-white/5 border-white/8'
                  }`}>
                    <div className={`text-xs font-semibold mb-2 ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
                      {t.profileLastDream}:
                    </div>
                    <div className={`rounded-xl p-3 border ${
                      isLight ? 'bg-purple-50/80 border-purple-100' : 'bg-white/3 border-white/5'
                    }`}>
                      <TranslatedText text={pu.dreamSummary} sourceId={pu.id} table="map_users" field="dreamSummary" as="p" className={`text-sm leading-relaxed ${textMain}`} />
                      <div className="flex items-center gap-2 mt-2">
                        {(() => {
                          const cat = DREAM_CATEGORIES.find(c => c.id === pu.category);
                          return cat ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{ background: cat.color + '22', color: cat.color, border: `1px solid ${cat.color}44` }}>
                              🏷 {tLang(cat)}
                            </span>
                          ) : null;
                        })()}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ background: matchColor(pu.matchPct) + '22', color: matchColor(pu.matchPct), border: `1px solid ${matchColor(pu.matchPct)}44` }}>
                          💜 {pu.matchPct}% Match
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`mx-4 rounded-2xl border p-4 mb-4 text-center ${
                    isLight ? 'bg-white/60 border-purple-200/60' : 'bg-white/5 border-white/8'
                  }`}>
                    <span className={`text-sm ${textSub}`}>{t.profileDreamDetailsUnavailable}</span>
                  </div>
                )}

                {/* Spacer for bottom button */}
                <div className="flex-1" />

                {/* Action Button */}
                {pu.privacy !== 'private' && (
                  <div className="px-4 pb-8 pt-4">
                    {pu.privacy === 'public' ? (
                      <button className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25">
                        <span className="mr-1.5">💜</span>
                        {t.profileConnect}
                      </button>
                    ) : (
                      <button className={`w-full py-3.5 rounded-2xl font-semibold text-sm border transition-colors ${
                        isLight
                          ? 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50'
                          : 'bg-white/8 border-white/10 text-white hover:bg-white/15'
                      }`}>
                        <span className="mr-1.5">🔗</span>
                        {t.profileRequestConnection}
                      </button>
                    )}
                  </div>
                )}
                {pu.privacy === 'private' && <div className="pb-8" />}
              </div>
            </div>
          </>
        );
      })()}

      {/* Bot Profile Modal entfernt */}

      {/* ── Toast Notification ── */}
      {toast && (
        <div
          className={`fixed top-4 inset-x-4 z-50 rounded-2xl border backdrop-blur-xl px-4 py-3 flex items-center gap-3 shadow-2xl ${toastVisible ? 'dm-slide-down' : 'dm-fade-out'} ${isLight ? 'bg-white/90 border-purple-200/60' : 'bg-dream-deep/90 border-white/15'}`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
            <span className="material-icons text-white text-lg">favorite</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-bold text-sm ${textMain}`}>{t.newmatch}</div>
            <div className={`text-xs truncate ${textSub}`}>
              {toast.name} {t.from} {toast.city} {t.similarDream} ({toast.pct}%)
            </div>
          </div>
          <div className="shrink-0 font-extrabold text-sm" style={{ color: matchColor(toast.pct) }}>
            {toast.pct}%
          </div>
        </div>
      )}

      {/* ── Backdrop dim when panel open ── */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
          onClick={handleClosePanel}
        />
      )}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────
interface StatPillProps {
  icon: string;
  value: string;
  label: string;
  isLight: boolean;
  color: string;
  loading?: boolean;
}

const StatPill: React.FC<StatPillProps> = ({ icon, value, label, isLight, color, loading }) => (
  <div className="flex flex-col items-center gap-0.5 min-w-0">
    <div className="flex items-center gap-1">
      <span className="material-icons text-sm" style={{ color }}>{icon}</span>
      {loading ? (
        <span className={`inline-block h-3 w-10 rounded ${isLight ? 'bg-slate-200' : 'bg-white/10'} animate-pulse`} />
      ) : (
        <span className={`text-sm font-bold ${isLight ? 'text-mystic-text' : 'text-white'}`}>{value}</span>
      )}
    </div>
    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'} text-center leading-tight`}>{label}</span>
  </div>
);

export default DreamMap;
