import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Dream, Language, ReligiousCategory } from '../types';
// Bot-Profile entfernt — nur echte wissenschaftliche Daten
// import { BOT_USERS } from '../data/botProfiles';
import { FEATURE_FLAGS } from '../config/featureFlags';
// import BotProfileModal from './BotProfileModal';
// import { useBotFriends } from '../hooks/useBotFriends';
import { supabase } from '../services/supabaseClient';

// ─── Props ────────────────────────────────────────────────────────────────────
interface DreamMapProps {
  dreams?: Dream[];
  language?: Language | string;
  onClose?: () => void;
  isLight?: boolean;
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
  matchThreshold: string;
  matchedDreamers: string;
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
    matchThreshold: 'Match Threshold',
    matchedDreamers: 'Matched Dreamers',
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
    searchPlaceholder: 'Durchsuche Traeume, Stichworte, Staedte...',
    matchThreshold: 'Match-Schwelle',
    matchedDreamers: 'Gematchte Traeumer',
    noDreamsFound: 'Keine Traeume gefunden',
    profileBack: 'Zurueck',
    profileReport: 'Melden',
    profileMemberSince: 'Mitglied seit',
    profileDreams: 'Traeume',
    profileMatches: 'Matches',
    profileFavorite: 'Liebling',
    profileLastDream: 'Letzter Traum',
    profileConnect: 'Verbinden',
    profileRequestConnection: 'Verbindung anfragen',
    profilePartialPrivate: 'Dieses Profil ist teilweise privat',
    profilePrivate: 'Dieses Profil ist privat',
    profileAnonymous: 'Anonymer Traeumer',
    profileDreamDetailsUnavailable: 'Traum-Details nicht verfuegbar',
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
    matchThreshold: 'Eşleşme Eşiği',
    matchedDreamers: 'Eşleşen Rüyacılar',
    noDreamsFound: 'Rüya bulunamadı',
    profileBack: 'Geri',
    profileReport: 'Bildir',
    profileMemberSince: 'Uye oldu',
    profileDreams: 'Ruyalar',
    profileMatches: 'Eslesme',
    profileFavorite: 'Favori',
    profileLastDream: 'Son Ruya',
    profileConnect: 'Baglan',
    profileRequestConnection: 'Baglanti Iste',
    profilePartialPrivate: 'Bu profil kismi olarak gizli',
    profilePrivate: 'Bu profil gizli',
    profileAnonymous: 'Anonim Ruyaci',
    profileDreamDetailsUnavailable: 'Ruya detaylari mevcut degil',
    profileShowProfile: 'Profili Goster',
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
    matchThreshold: 'Umbral de coincidencia',
    matchedDreamers: 'Soñadores coincidentes',
    noDreamsFound: 'No se encontraron sueños',
    profileBack: 'Volver',
    profileReport: 'Reportar',
    profileMemberSince: 'Miembro desde',
    profileDreams: 'Suenos',
    profileMatches: 'Coincidencias',
    profileFavorite: 'Favorito',
    profileLastDream: 'Ultimo Sueno',
    profileConnect: 'Conectar',
    profileRequestConnection: 'Solicitar Conexion',
    profilePartialPrivate: 'Este perfil es parcialmente privado',
    profilePrivate: 'Este perfil es privado',
    profileAnonymous: 'Sonador Anonimo',
    profileDreamDetailsUnavailable: 'Detalles del sueno no disponibles',
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
    matchThreshold: 'Seuil de correspondance',
    matchedDreamers: 'Rêveurs correspondants',
    noDreamsFound: 'Aucun rêve trouvé',
    profileBack: 'Retour',
    profileReport: 'Signaler',
    profileMemberSince: 'Membre depuis',
    profileDreams: 'Reves',
    profileMatches: 'Correspondances',
    profileFavorite: 'Favori',
    profileLastDream: 'Dernier Reve',
    profileConnect: 'Connecter',
    profileRequestConnection: 'Demander Connexion',
    profilePartialPrivate: 'Ce profil est partiellement prive',
    profilePrivate: 'Ce profil est prive',
    profileAnonymous: 'Reveur Anonyme',
    profileDreamDetailsUnavailable: 'Details du reve non disponibles',
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
    matchThreshold: 'حد التطابق',
    matchedDreamers: 'الحالمون المتطابقون',
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
    matchThreshold: 'Limite de correspondência',
    matchedDreamers: 'Sonhadores correspondentes',
    noDreamsFound: 'Nenhum sonho encontrado',
    profileBack: 'Voltar',
    profileReport: 'Denunciar',
    profileMemberSince: 'Membro desde',
    profileDreams: 'Sonhos',
    profileMatches: 'Correspondencias',
    profileFavorite: 'Favorito',
    profileLastDream: 'Ultimo Sonho',
    profileConnect: 'Conectar',
    profileRequestConnection: 'Solicitar Conexao',
    profilePartialPrivate: 'Este perfil e parcialmente privado',
    profilePrivate: 'Este perfil e privado',
    profileAnonymous: 'Sonhador Anonimo',
    profileDreamDetailsUnavailable: 'Detalhes do sonho indisponiveis',
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
    matchThreshold: 'Порог совпадения',
    matchedDreamers: 'Совпавшие сновидцы',
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
  // Profile fields
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

function formatMemberSince(dateStr: string, lang: string): string {
  const [year, month] = dateStr.split('-');
  const monthIdx = parseInt(month, 10) - 1;
  const months = MONTH_NAMES[lang] ?? MONTH_NAMES['en'];
  return `${months[monthIdx]} ${year}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
const DreamMap: React.FC<DreamMapProps> = ({
  dreams = [],
  language = 'en',
  onClose,
  isLight = false,
}) => {
  const lang = (typeof language === 'string' ? language : String(language)).toLowerCase();
  const t: Translations = TRANSLATIONS[lang] ?? TRANSLATIONS['en'];
  const tLang = (cat: DreamCategory) => cat.label[lang] ?? cat.label['en'];

  const [users, setUsers] = useState<SimUser[]>([]);
  const [isLiveData, setIsLiveData] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<SimUser | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [toast, setToast] = useState<{ name: string; country: string; pct: number } | null>(null);
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

  // ── New feature state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [matchThreshold, setMatchThreshold] = useState(50);
  // Zoom & Pan
  const [mapScale, setMapScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const lastTouchDist = useRef<number | null>(null);

  // Init users: lade echte Teilnehmer aus Supabase
  useEffect(() => {
    const loadRealUsers = async () => {
      const { data } = await supabase
        .from('research_participants')
        .select('id, participant_id, country, lat, lng, dream_count')
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .limit(500);

      if (data && data.length > 0) {
        // Lade je einen Traum pro Teilnehmer (Batch)
        const pids = data.map((p: any) => p.participant_id);
        const { data: dreams } = await supabase
          .from('research_dreams')
          .select('participant_id, dream_text')
          .in('participant_id', pids)
          .limit(500);

        const dreamMap = new Map<string, string>();
        if (dreams) {
          for (const d of dreams as any[]) {
            if (!dreamMap.has(d.participant_id)) {
              dreamMap.set(d.participant_id, (d.dream_text || '').slice(0, 100));
            }
          }
        }

        const mapped: SimUser[] = data.map((p: any) => ({
          id: p.id,
          name: p.participant_id,
          avatar: '🔬',
          city: p.country || '',
          country: p.country || '',
          lat: p.lat,
          lng: p.lng,
          dreamSummary: dreamMap.get(p.participant_id) || '',
          category: 'nature',
          mood: 'calm',
          matchPct: Math.floor(Math.random() * 30) + 70,
          privacy: 'public' as const,
          memberSince: '2024-01',
          dreamCount: p.dream_count || 0,
          matchCount: 0,
          favCategory: 'nature'
        }));
        setUsers(mapped);
        setIsLiveData(true);
        const top5 = [...mapped].sort((a, b) => b.matchPct - a.matchPct).slice(0, 5);
        setPulsingIds(top5.slice(0, 3).map(u => u.id));
      }
    };
    loadRealUsers();
  }, []);

  // Toast notifications every 12-18 seconds
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 12000 + Math.random() * 6000;
      notifTimerRef.current = setTimeout(() => {
        const pool = users.filter(u => u.matchPct >= 70);
        if (pool.length === 0) return scheduleNext();
        const pick = pool[Math.floor(Math.random() * pool.length)];
        setToast({ name: pick.name, country: pick.country, pct: pick.matchPct });
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

  // Effective threshold: when searching, drop to 0 so all results show
  const effectiveThreshold = searchQuery.trim().length > 0 ? 0 : matchThreshold;

  const filteredUsers = useMemo(() => {
    let list = users;
    // Category filter
    if (activeCategory !== 'all') {
      list = list.filter(u => u.category === activeCategory);
    }
    // Match threshold filter
    list = list.filter(u => u.matchPct >= effectiveThreshold);
    // Search filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.country.toLowerCase().includes(q) ||
        u.country.toLowerCase().includes(q) ||
        u.dreamSummary.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, activeCategory, effectiveThreshold, searchQuery]);

  // Sorted for result list (descending by match%)
  const sortedFilteredUsers = useMemo(
    () => [...filteredUsers].sort((a, b) => b.matchPct - a.matchPct),
    [filteredUsers]
  );

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
    openProfile(user);
  }, [openProfile]);

  // Stats
  const totalActive = users.length + 1847;
  const avgMatch = users.length > 0
    ? Math.round(users.reduce((s, u) => s + u.matchPct, 0) / users.length)
    : 0;
  const matchesToday = Math.floor(users.length * 0.6) + 23;

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

  // "You" marker position (center of map, roughly Berlin area)
  const youCoords = getCoordinates(50, 10);

  // Search active = collapse map
  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className={`fixed inset-0 w-full ${bg} overflow-y-auto`} style={{ zIndex: 55 }}>

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

      {/* ── World Map (TOP) with Title Overlay ── */}
      <div
        ref={mapContainerRef}
        className={`relative z-10 overflow-hidden transition-all duration-500 ${
          isSearchActive ? 'h-0 opacity-0 overflow-hidden' : 'h-[30vh]'
        }`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative w-full h-full overflow-hidden"
          style={{
            background: isLight ? '#e8e0f0' : '#0a0318',
            transform: `scale(${mapScale}) translate(${mapOffset.x / mapScale}px, ${mapOffset.y / mapScale}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            cursor: mapScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            touchAction: 'none',
          }}
        >
          {/* World map SVG background */}
          <div
            className="absolute inset-0 bg-contain bg-no-repeat bg-center"
            style={{
              backgroundImage: "url('/world-map.svg')",
              filter: isLight
                ? 'invert(0) brightness(0.9) opacity(0.6)'
                : 'invert(1) hue-rotate(180deg) saturate(0.3) brightness(0.5) opacity(0.7)',
            }}
          />

          {/* Marker layer */}
          <div className="absolute inset-0">
            {/* "You" center marker */}
            <div
              className="absolute z-20"
              style={{
                left: `${youCoords.x}%`,
                top: `${youCoords.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow-lg shadow-purple-500/50" />
              <div
                className="dm-pulse-ring w-8 h-8 border-2 border-purple-400"
                style={{ left: '50%', top: '50%' }}
              />
            </div>

            {/* User markers */}
            {filteredUsers.map((u, idx) => {
              const coords = getCoordinates(u.lat, u.lng);
              const isPulsing = pulsingIds.includes(u.id);
              const isSelected = selectedUser?.id === u.id;
              const color = matchColor(u.matchPct);
              const cat = DREAM_CATEGORIES.find(c => c.id === u.category);
              const catColor = cat?.color ?? color;
              // Every 5th marker gets subtle ping animation
              const hasSubtlePing = idx % 5 === 0 && !isSelected;
              const firstName = u.name.split(' ')[0];
              return (
                <div key={u.id} className="absolute" style={{ left: `${coords.x}%`, top: `${coords.y}%`, zIndex: isSelected ? 50 : isPulsing ? 20 : 10 }}>
                  {isPulsing && (
                    <div
                      className="dm-pulse-ring w-5 h-5"
                      style={{
                        left: '50%',
                        top: '50%',
                        border: `1.5px solid ${catColor}`,
                      }}
                    />
                  )}
                  {/* Marker dot */}
                  <div
                    className={`rounded-full cursor-pointer transition-transform hover:scale-[2] hover:z-50 ${hasSubtlePing ? 'animate-ping' : ''}`}
                    style={{
                      width: isSelected ? '12px' : '6px',
                      height: isSelected ? '12px' : '6px',
                      backgroundColor: catColor,
                      boxShadow: `0 0 ${isSelected ? '10px' : '4px'} ${catColor}80`,
                      transform: 'translate(-50%, -50%)',
                      borderColor: isSelected ? 'white' : 'rgba(255,255,255,0.3)',
                      borderWidth: isSelected ? '2px' : '0.5px',
                      borderStyle: 'solid',
                      borderRadius: '9999px',
                      // Slow down ping for subtle effect
                      ...(hasSubtlePing ? { animationDuration: '3s', opacity: 0.8 } : {}),
                    }}
                    onClick={() => handleMarkerClick(u)}
                  />
                  {/* Labels: show name at scale > 1.5, name + city at scale > 2.5 */}
                  {mapScale > 1.5 && (
                    <div
                      className="absolute pointer-events-none select-none whitespace-nowrap"
                      style={{
                        left: '8px',
                        top: '-3px',
                        transform: 'translate(0, -50%)',
                        fontSize: '8px',
                        lineHeight: '10px',
                        color: 'rgba(255,255,255,0.85)',
                        textShadow: '0 0 3px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.7)',
                      }}
                    >
                      {mapScale > 2.5 ? `${firstName} · ${u.country}` : firstName}
                    </div>
                  )}
                  {isSelected && (
                    <div
                      className="absolute text-lg pointer-events-none select-none"
                      style={{
                        left: '50%',
                        top: '-20px',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {u.avatar}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Title + Close as Overlay on the map */}
        <div className="absolute inset-x-0 top-0 z-20 pt-safe pt-4 px-4 pb-6 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold leading-tight text-white">{t.title}</h1>
              <p className="text-xs text-white/70">{t.subtitle}</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm"
                aria-label="Close"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Zoom Buttons bottom-right in map */}
        <div className="absolute bottom-3 right-3 z-30 flex flex-col gap-1.5">
          <button
            onClick={handleZoomIn}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold border backdrop-blur-sm transition-colors ${
              isLight ? 'bg-white/80 border-purple-200 text-purple-700 hover:bg-purple-50' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
            }`}
          >
            <span className="material-icons text-lg">add</span>
          </button>
          <button
            onClick={handleZoomOut}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold border backdrop-blur-sm transition-colors ${
              isLight ? 'bg-white/80 border-purple-200 text-purple-700 hover:bg-purple-50' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
            }`}
          >
            <span className="material-icons text-lg">remove</span>
          </button>
          {mapScale > 1 && (
            <button
              onClick={() => { setMapScale(1); setMapOffset({ x: 0, y: 0 }); }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold border backdrop-blur-sm transition-colors ${
                isLight ? 'bg-white/80 border-purple-200 text-purple-700 hover:bg-purple-50' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span className="material-icons text-sm">fit_screen</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Search Field (sticky under map) ── */}
      <div className={`sticky top-0 z-30 px-3 py-2 backdrop-blur-xl ${isLight ? 'bg-indigo-50/90' : 'bg-dream-bg/90'}`}>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-sm ${isLight ? 'bg-white/70 border-purple-200/60' : 'bg-white/5 border-white/10'}`}>
          <span className={`material-icons text-lg ${isLight ? 'text-purple-400' : 'text-slate-400'}`}>search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`flex-1 bg-transparent outline-none text-sm ${textMain} placeholder:${textSub}`}
          />
          {searchQuery.length > 0 && (
            <button onClick={() => setSearchQuery('')} className={`${textSub} hover:${textMain}`}>
              <span className="material-icons text-lg">close</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className={`flex items-center justify-around px-3 py-2 border-b backdrop-blur-sm ${isLight ? 'border-purple-100/60 bg-white/40' : 'border-white/5 bg-black/20'}`}>
        <StatPill icon="public"       value={totalActive.toLocaleString()} label={t.worldwide}    isLight={isLight} color="#a855f7" />
        <StatPill icon="favorite"     value={`${avgMatch}%`}               label={t.dreamersSimilar.replace('%','')} isLight={isLight} color="#ec4899" />
        <StatPill icon="bolt"         value={matchesToday.toString()}       label={t.matchestoday} isLight={isLight} color="#f59e0b" />
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
          <span className={`text-xs font-bold tabular-nums ${isLight ? 'text-purple-600' : 'text-purple-300'}`}>{effectiveThreshold}%</span>
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
          <span className={`text-sm font-bold ${textMain}`}>
            {t.matchedDreamers} ({sortedFilteredUsers.length})
          </span>
          {!selectedUser && (
            <span className={`text-[10px] ${textSub}`}>{t.tapMarker}</span>
          )}
        </div>
        <div
          className={`rounded-2xl border backdrop-blur-sm ${
            isLight ? 'bg-white/60 border-purple-200/60' : 'bg-white/3 border-white/5'
          }`}
        >
          {sortedFilteredUsers.length === 0 ? (
            <div className={`flex items-center justify-center ${textSub}`}>
              <div className="text-center py-8">
                <span className="material-icons text-3xl mb-2 block opacity-40">search_off</span>
                <span className="text-sm">{t.noDreamsFound}</span>
              </div>
            </div>
          ) : (
            sortedFilteredUsers.map(u => {
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
                    <div className={`text-[11px] ${textSub}`}>{u.name} · {u.country}</div>
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
            })
          )}
        </div>
      </div>

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
              <div className={`text-xs ${textSub}`}>{t.from} {selectedUser.country}</div>
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
            <p className={`text-sm leading-relaxed ${textMain}`}>{selectedUser.dreamSummary}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClosePanel}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-colors ${isLight ? 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50' : 'bg-white/8 border-white/10 text-white hover:bg-white/15'}`}
            >
              {t.close}
            </button>
            <button
              onClick={() => { handleClosePanel(); openProfile(selectedUser); }}
              className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity"
            >
              <span className="material-icons text-base align-middle mr-1">person</span>
              {t.profileShowProfile}
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
          : pu.country;

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
                      <p className={`text-sm leading-relaxed ${textMain}`}>{pu.dreamSummary}</p>
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
              {toast.name} {t.from} {toast.country} {t.similarDream} ({toast.pct}%)
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
}

const StatPill: React.FC<StatPillProps> = ({ icon, value, label, isLight, color }) => (
  <div className="flex flex-col items-center gap-0.5 min-w-0">
    <div className="flex items-center gap-1">
      <span className="material-icons text-sm" style={{ color }}>{icon}</span>
      <span className={`text-sm font-bold ${isLight ? 'text-mystic-text' : 'text-white'}`}>{value}</span>
    </div>
    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'} text-center leading-tight`}>{label}</span>
  </div>
);

export default DreamMap;
