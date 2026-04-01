import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Dream, Language, ReligiousCategory } from '../types';

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
interface SimUser {
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
  matchPct: number;
  religCategory?: ReligiousCategory;
}

// Equirectangular projection: lat/lng -> percentage coordinates
const getCoordinates = (lat: number, lng: number) => {
  const x = (lng + 180) * (100 / 360);
  const y = ((-1 * lat) + 90) * (100 / 180);
  return { x, y };
};

// 150 bot users with real lat/lng coordinates — 90% female
const BASE_USERS: Omit<SimUser, 'matchPct'>[] = [
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
];

function generateUsers(dreams: Dream[]): SimUser[] {
  const userCats = dreams.flatMap(d => d.tags ?? []);
  return BASE_USERS.map((u, i) => {
    // Seeded pseudo-random based on index for stable distribution 35-98
    let matchPct = 35 + ((i * 7 + 13) % 64); // 35-98 range, well distributed
    if (userCats.length > 0) {
      const catMatch = userCats.some(c =>
        c.toLowerCase().includes(u.category.slice(0, 4))
      );
      if (catMatch) matchPct = Math.min(98, matchPct + 12);
    }
    return { ...u, matchPct };
  });
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
  const [selectedUser, setSelectedUser] = useState<SimUser | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [toast, setToast] = useState<{ name: string; city: string; pct: number } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [pulsingIds, setPulsingIds] = useState<string[]>([]);
  const [showTrends, setShowTrends] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Init users
  useEffect(() => {
    const generated = generateUsers(dreams);
    setUsers(generated);
    const top5 = [...generated].sort((a, b) => b.matchPct - a.matchPct).slice(0, 5);
    setPulsingIds(top5.slice(0, 3).map(u => u.id));
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
        u.city.toLowerCase().includes(q) ||
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

  // Select user from result list
  const handleResultClick = useCallback((user: SimUser) => {
    setSelectedUser(prev => prev?.id === user.id ? null : user);
  }, []);

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
  const textMain = isLight ? 'text-slate-800' : 'text-white';
  const textSub = isLight ? 'text-slate-500' : 'text-slate-400';
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
                      {mapScale > 2.5 ? `${firstName}, ${u.city}` : firstName}
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
      <div className={`sticky top-0 z-30 px-3 py-2 backdrop-blur-xl ${isLight ? 'bg-indigo-50/90' : 'bg-[#06030f]/90'}`}>
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
            isLight ? 'bg-white/90 border-purple-100' : 'bg-[#0d0722]/90 border-white/5'
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
                    <div className={`text-[11px] ${textSub}`}>{u.city}, {u.country}</div>
                    <p className={`text-xs italic truncate mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
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
        <div className={`fixed bottom-0 inset-x-0 z-50 rounded-t-3xl border-t backdrop-blur-xl p-5 dm-slide-up ${isLight ? 'bg-white/85 border-purple-200/60' : 'bg-[#0d0722]/90 border-white/10'}`}
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
              className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity"
            >
              <span className="material-icons text-base align-middle mr-1">person_add</span>
              {t.connect}
            </button>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <div
          className={`fixed top-4 inset-x-4 z-50 rounded-2xl border backdrop-blur-xl px-4 py-3 flex items-center gap-3 shadow-2xl ${toastVisible ? 'dm-slide-down' : 'dm-fade-out'} ${isLight ? 'bg-white/90 border-purple-200/60' : 'bg-[#1a0a3a]/90 border-white/15'}`}
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
}

const StatPill: React.FC<StatPillProps> = ({ icon, value, label, isLight, color }) => (
  <div className="flex flex-col items-center gap-0.5 min-w-0">
    <div className="flex items-center gap-1">
      <span className="material-icons text-sm" style={{ color }}>{icon}</span>
      <span className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{value}</span>
    </div>
    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'} text-center leading-tight`}>{label}</span>
  </div>
);

export default DreamMap;
