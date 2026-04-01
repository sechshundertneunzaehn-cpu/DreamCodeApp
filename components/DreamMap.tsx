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

// 100 bot users with real lat/lng coordinates
const BASE_USERS: Omit<SimUser, 'matchPct'>[] = [
  // ── EUROPE (25) ──
  { id:'u1',  name:'Lena K.',     avatar:'👩‍🦰', city:'Berlin',       country:'DE', lat:52.52,  lng:13.40,  dreamSummary:'Flying over mountains in bright sunlight',           category:'flying',    mood:'excited'   },
  { id:'u2',  name:'Felix G.',    avatar:'🧑‍🦲', city:'Paris',        country:'FR', lat:48.85,  lng:2.35,   dreamSummary:'Fell from Eiffel Tower, woke before landing',       category:'falling',   mood:'scared'    },
  { id:'u3',  name:'Emma W.',     avatar:'👱‍♀️', city:'London',       country:'GB', lat:51.50,  lng:-0.12,  dreamSummary:'Tea party with talking animals in wonderland',       category:'animals',   mood:'playful'   },
  { id:'u4',  name:'Marco R.',    avatar:'🧑‍🦱', city:'Rome',         country:'IT', lat:41.90,  lng:12.50,  dreamSummary:'Lost in colosseum that never ends',                  category:'chase',     mood:'confused'  },
  { id:'u5',  name:'Rosa M.',     avatar:'👩🏽',  city:'Madrid',       country:'ES', lat:40.41,  lng:-3.70,  dreamSummary:'Running from bull through city streets',             category:'chase',     mood:'terrified' },
  { id:'u6',  name:'Nina F.',     avatar:'👩‍🦰', city:'Amsterdam',    country:'NL', lat:52.37,  lng:4.90,   dreamSummary:'Cycling canals that turned into rivers',             category:'water',     mood:'serene'    },
  { id:'u7',  name:'Sara J.',     avatar:'👩‍🦳', city:'Stockholm',    country:'SE', lat:59.33,  lng:18.07,  dreamSummary:'Northern lights spelling out a message',             category:'nature',    mood:'mystified' },
  { id:'u8',  name:'Erik H.',     avatar:'🧔',   city:'Oslo',         country:'NO', lat:59.91,  lng:10.75,  dreamSummary:'Viking longship voyage to edge of the world',        category:'nature',    mood:'adventurous'},
  { id:'u9',  name:'Greta L.',    avatar:'👩‍🦳', city:'Vienna',       country:'AT', lat:48.21,  lng:16.37,  dreamSummary:'Waltz with a skeleton at empty palace ball',         category:'death',     mood:'eerie'     },
  { id:'u10', name:'Leo B.',      avatar:'🧑‍🦱', city:'Munich',       country:'DE', lat:48.14,  lng:11.58,  dreamSummary:'UFO abduction with friendly aliens showing future',  category:'ufo',       mood:'amazed'    },
  { id:'u11', name:'Luisa F.',    avatar:'👩',   city:'Lisbon',       country:'PT', lat:38.72,  lng:-9.14,  dreamSummary:'Ocean swallowing the city, calm escape by boat',     category:'water',     mood:'melancholic'},
  { id:'u12', name:'Boris K.',    avatar:'👨',   city:'Kyiv',         country:'UA', lat:50.45,  lng:30.52,  dreamSummary:'Endless forest where sun never rises',               category:'nature',    mood:'melancholic'},
  { id:'u13', name:'Marta P.',    avatar:'👩🏻',  city:'Warsaw',       country:'PL', lat:52.23,  lng:21.01,  dreamSummary:'Piano playing itself in empty concert hall',         category:'spiritual', mood:'haunted'   },
  { id:'u14', name:'Nikos D.',    avatar:'🧔🏽',  city:'Athens',       country:'GR', lat:37.98,  lng:23.73,  dreamSummary:'Swimming in crystal sea with ancient statues',       category:'water',     mood:'peaceful'  },
  { id:'u15', name:'Elsa B.',     avatar:'👩‍🦱', city:'Helsinki',     country:'FI', lat:60.17,  lng:24.94,  dreamSummary:'Sauna melting into northern aurora',                 category:'nature',    mood:'bliss'     },
  { id:'u16', name:'Jan V.',      avatar:'🧑',   city:'Prague',       country:'CZ', lat:50.08,  lng:14.44,  dreamSummary:'Clock tower coming alive at midnight',               category:'timetravel',mood:'wonder'    },
  { id:'u17', name:'Katya S.',    avatar:'👩‍🦰', city:'Zurich',       country:'CH', lat:47.38,  lng:8.54,   dreamSummary:'Mountain splitting open revealing gold',             category:'money',     mood:'greedy'    },
  { id:'u18', name:'Liam O.',     avatar:'🧑‍🦱', city:'Dublin',       country:'IE', lat:53.35,  lng:-6.26,  dreamSummary:'Leprechaun leading to rainbow treasure',             category:'funny',     mood:'amused'    },
  { id:'u19', name:'Astrid N.',   avatar:'👩',   city:'Copenhagen',   country:'DK', lat:55.68,  lng:12.57,  dreamSummary:'Mermaid singing beneath frozen harbor',              category:'love',      mood:'longing'   },
  { id:'u20', name:'Dmitri V.',   avatar:'👨',   city:'St Petersburg',country:'RU', lat:59.93,  lng:30.32,  dreamSummary:'Walking through Winter Palace that never ends',      category:'timetravel',mood:'lost'      },
  { id:'u21', name:'Elena R.',    avatar:'👩🏻',  city:'Bucharest',    country:'RO', lat:44.43,  lng:26.10,  dreamSummary:'Vampire turning into a kind old man',                category:'horror',    mood:'surprised' },
  { id:'u22', name:'Ivan P.',     avatar:'👨',   city:'Moscow',       country:'RU', lat:55.75,  lng:37.62,  dreamSummary:'Frozen city, alone in snowstorm',                    category:'nature',    mood:'lonely'    },
  { id:'u23', name:'Giulia T.',   avatar:'👩🏽',  city:'Milan',        country:'IT', lat:45.46,  lng:9.19,   dreamSummary:'Fashion show where clothes fly away',                category:'funny',     mood:'embarrassed'},
  { id:'u24', name:'Henrik L.',   avatar:'🧔',   city:'Gothenburg',   country:'SE', lat:57.71,  lng:11.97,  dreamSummary:'Sailing through sky on viking ship',                 category:'flying',    mood:'free'      },
  { id:'u25', name:'Sofia K.',    avatar:'👩‍🦱', city:'Barcelona',    country:'ES', lat:41.39,  lng:2.17,   dreamSummary:'Gaudi buildings melting in surreal heat',             category:'horror',    mood:'disoriented'},
  // ── MIDDLE EAST & NORTH AFRICA (12) ──
  { id:'u26', name:'Omar K.',     avatar:'🧔🏽',  city:'Istanbul',     country:'TR', lat:41.01,  lng:28.98,  dreamSummary:'Flying over the Bosphorus at midnight',              category:'flying',    mood:'free'      },
  { id:'u27', name:'Ahmed S.',    avatar:'🧔',   city:'Cairo',        country:'EG', lat:30.04,  lng:31.24,  dreamSummary:'Lost in an ancient desert temple',                   category:'spiritual', mood:'anxious'   },
  { id:'u28', name:'Fatima Z.',   avatar:'👩🏽‍🦱',city:'Casablanca',  country:'MA', lat:33.59,  lng:-7.62,  dreamSummary:'Flying carpet ride over desert at sunset',           category:'flying',    mood:'magical'   },
  { id:'u29', name:'Tariq A.',    avatar:'🧔🏿',  city:'Riyadh',       country:'SA', lat:24.71,  lng:46.67,  dreamSummary:'Walking on water during prayer',                    category:'spiritual', mood:'blessed'   },
  { id:'u30', name:'Layla R.',    avatar:'👩🏻‍🦳',city:'Dubai',       country:'AE', lat:25.20,  lng:55.27,  dreamSummary:'Golden city rising from the sand',                   category:'money',     mood:'awed'      },
  { id:'u31', name:'Yasmin H.',   avatar:'👩🏽',  city:'Tehran',       country:'IR', lat:35.69,  lng:51.39,  dreamSummary:'Garden of paradise with talking flowers',            category:'spiritual', mood:'peaceful'  },
  { id:'u32', name:'Karim M.',    avatar:'🧑🏽',  city:'Amman',        country:'JO', lat:31.95,  lng:35.93,  dreamSummary:'Dead Sea turning into liquid gold',                  category:'money',     mood:'amazed'    },
  { id:'u33', name:'Nour E.',     avatar:'👩🏽',  city:'Beirut',       country:'LB', lat:33.89,  lng:35.50,  dreamSummary:'City rebuilding itself from ruins overnight',        category:'timetravel',mood:'hopeful'   },
  { id:'u34', name:'Ali F.',      avatar:'🧔🏽',  city:'Baghdad',      country:'IQ', lat:33.31,  lng:44.37,  dreamSummary:'Ancient library with books that speak',              category:'spiritual', mood:'wise'      },
  { id:'u35', name:'Dina S.',     avatar:'👩🏽',  city:'Tunis',        country:'TN', lat:36.81,  lng:10.18,  dreamSummary:'Medina maze where walls shift like sand',            category:'chase',     mood:'confused'  },
  { id:'u36', name:'Emre Y.',     avatar:'🧑',   city:'Ankara',       country:'TR', lat:39.93,  lng:32.85,  dreamSummary:'Hot air balloon revealing ancient ruins',            category:'nature',    mood:'awed'      },
  { id:'u37', name:'Samira K.',   avatar:'👩🏿',  city:'Algiers',      country:'DZ', lat:36.75,  lng:3.06,   dreamSummary:'Desert storm revealing hidden oasis city',           category:'nature',    mood:'amazed'    },
  // ── SUB-SAHARAN AFRICA (10) ──
  { id:'u38', name:'Amina B.',    avatar:'👩🏿',  city:'Lagos',        country:'NG', lat:6.52,   lng:3.38,   dreamSummary:'Meeting ancestors in ancestral village',             category:'spiritual', mood:'peaceful'  },
  { id:'u39', name:'Kofi A.',     avatar:'👨🏿',  city:'Accra',        country:'GH', lat:5.56,   lng:-0.19,  dreamSummary:'Lion chasing through savannah at dusk',              category:'animals',   mood:'fearful'   },
  { id:'u40', name:'Aisha T.',    avatar:'👩🏿',  city:'Nairobi',      country:'KE', lat:-1.29,  lng:36.82,  dreamSummary:'Climbing Kilimanjaro while fire rains',              category:'nature',    mood:'determined'},
  { id:'u41', name:'Moussa D.',   avatar:'👨🏿',  city:'Dakar',        country:'SN', lat:14.72,  lng:-17.47, dreamSummary:'Ancestral spirits guiding through desert',           category:'spiritual', mood:'guided'    },
  { id:'u42', name:'Zara A.',     avatar:'👩🏽‍🦲',city:'Johannesburg',country:'ZA', lat:-26.20, lng:28.04,  dreamSummary:'Becoming a bird and crossing oceans',                category:'flying',    mood:'free'      },
  { id:'u43', name:'Kwame O.',    avatar:'🧑🏿',  city:'Kampala',      country:'UG', lat:0.35,   lng:32.58,  dreamSummary:'Gorillas teaching sign language in forest',          category:'animals',   mood:'wonder'    },
  { id:'u44', name:'Blessing N.', avatar:'👩🏿',  city:'Abuja',        country:'NG', lat:9.06,   lng:7.49,   dreamSummary:'Market where everything is made of light',           category:'spiritual', mood:'luminous'  },
  { id:'u45', name:'Thabo M.',    avatar:'🧑🏿',  city:'Cape Town',    country:'ZA', lat:-33.93, lng:18.42,  dreamSummary:'Table Mountain floating into space',                 category:'ufo',       mood:'shocked'   },
  { id:'u46', name:'Aya L.',      avatar:'👩🏿',  city:'Addis Ababa',  country:'ET', lat:9.02,   lng:38.75,  dreamSummary:'Coffee ceremony with angels as guests',              category:'spiritual', mood:'serene'    },
  { id:'u47', name:'Jean-Pierre.',avatar:'🧑🏿',  city:'Kinshasa',     country:'CD', lat:-4.44,  lng:15.27,  dreamSummary:'River Congo flowing backwards revealing treasures',  category:'money',     mood:'excited'   },
  // ── SOUTH ASIA (8) ──
  { id:'u48', name:'Priya R.',    avatar:'👩🏽',  city:'Mumbai',       country:'IN', lat:19.08,  lng:72.88,  dreamSummary:'Sitting exam without preparation',                   category:'school',    mood:'stressed'  },
  { id:'u49', name:'Ravi S.',     avatar:'🧑🏽',  city:'Delhi',        country:'IN', lat:28.61,  lng:77.21,  dreamSummary:'Meeting a celebrity on a film set',                  category:'celebrity', mood:'star-struck'},
  { id:'u50', name:'Raj P.',      avatar:'🧑🏽‍🦱',city:'Bangalore',  country:'IN', lat:12.97,  lng:77.59,  dreamSummary:'Coding a program that solves world hunger',           category:'funny',     mood:'inspired'  },
  { id:'u51', name:'Ananya G.',   avatar:'👩🏽',  city:'Kolkata',      country:'IN', lat:22.57,  lng:88.36,  dreamSummary:'Durga goddess visiting during storm',                category:'spiritual', mood:'blessed'   },
  { id:'u52', name:'Sanjay M.',   avatar:'🧔🏽',  city:'Chennai',      country:'IN', lat:13.08,  lng:80.27,  dreamSummary:'Ocean temple rising from the waves',                 category:'water',     mood:'mystified' },
  { id:'u53', name:'Nisha T.',    avatar:'👩🏽',  city:'Kathmandu',    country:'NP', lat:27.72,  lng:85.32,  dreamSummary:'Flying over Himalayas touching clouds',              category:'flying',    mood:'euphoric'  },
  { id:'u54', name:'Arjun K.',    avatar:'🧑🏽',  city:'Colombo',      country:'LK', lat:6.93,   lng:79.85,  dreamSummary:'Elephant parade through golden streets',             category:'animals',   mood:'joyful'    },
  { id:'u55', name:'Fatima P.',   avatar:'👩🏽',  city:'Karachi',      country:'PK', lat:24.86,  lng:67.01,  dreamSummary:'Bazaar where memories are sold as gems',             category:'timetravel',mood:'nostalgic' },
  // ── EAST ASIA (12) ──
  { id:'u56', name:'Yuki H.',     avatar:'👩‍🦱', city:'Tokyo',        country:'JP', lat:35.68,  lng:139.69, dreamSummary:'Riding a giant koi fish across the ocean',           category:'water',     mood:'calm'      },
  { id:'u57', name:'Mei L.',      avatar:'👩🏻',  city:'Shanghai',     country:'CN', lat:31.23,  lng:121.47, dreamSummary:'Time traveling to ancient China dynasty',            category:'timetravel',mood:'amazed'    },
  { id:'u58', name:'Hana M.',     avatar:'👩🏻‍🦱', city:'Seoul',      country:'KR', lat:37.57,  lng:126.98, dreamSummary:'Surfing a tsunami wave towards safety',              category:'water',     mood:'brave'     },
  { id:'u59', name:'Chen W.',     avatar:'👨🏻',  city:'Beijing',      country:'CN', lat:39.90,  lng:116.40, dreamSummary:'Attending school exam in wrong century',             category:'school',    mood:'anxious'   },
  { id:'u60', name:'Yuna K.',     avatar:'👩🏻',  city:'Osaka',        country:'JP', lat:34.69,  lng:135.50, dreamSummary:'Robot parade led by dancing toaster',                category:'funny',     mood:'delighted' },
  { id:'u61', name:'Ji-woo P.',   avatar:'🧑🏻',  city:'Busan',        country:'KR', lat:35.18,  lng:129.08, dreamSummary:'Surfing through neon city on a cloud',               category:'flying',    mood:'euphoric'  },
  { id:'u62', name:'Lin Y.',      avatar:'👩🏻',  city:'Taipei',       country:'TW', lat:25.03,  lng:121.57, dreamSummary:'Night market food coming alive and dancing',         category:'funny',     mood:'amused'    },
  { id:'u63', name:'Tuan N.',     avatar:'🧑🏻',  city:'Hanoi',        country:'VN', lat:21.03,  lng:105.85, dreamSummary:'Dragons emerging from Ha Long Bay mist',             category:'animals',   mood:'awed'      },
  { id:'u64', name:'Sakura T.',   avatar:'👩🏻',  city:'Kyoto',        country:'JP', lat:35.01,  lng:135.77, dreamSummary:'Cherry blossoms turning into butterflies',           category:'nature',    mood:'peaceful'  },
  { id:'u65', name:'Wei Z.',      avatar:'🧑🏻',  city:'Chengdu',      country:'CN', lat:30.57,  lng:104.07, dreamSummary:'Panda army marching through bamboo forest',          category:'animals',   mood:'hilarious' },
  { id:'u66', name:'Min-ji L.',   avatar:'👩🏻',  city:'Incheon',      country:'KR', lat:37.46,  lng:126.70, dreamSummary:'K-pop concert where audience floats',               category:'celebrity', mood:'euphoric'  },
  { id:'u67', name:'Hiroshi K.',  avatar:'🧔🏻',  city:'Nagoya',       country:'JP', lat:35.18,  lng:136.91, dreamSummary:'Samurai duel on top of Mount Fuji',                  category:'chase',     mood:'intense'   },
  // ── SOUTHEAST ASIA (5) ──
  { id:'u68', name:'Rina S.',     avatar:'👩🏽',  city:'Jakarta',      country:'ID', lat:-6.21,  lng:106.85, dreamSummary:'Volcano erupting flowers instead of lava',           category:'nature',    mood:'wonder'    },
  { id:'u69', name:'Arun P.',     avatar:'🧑🏽',  city:'Bangkok',      country:'TH', lat:13.76,  lng:100.50, dreamSummary:'Golden temple floating above the clouds',            category:'spiritual', mood:'serene'    },
  { id:'u70', name:'Maria C.',    avatar:'👩🏽',  city:'Manila',       country:'PH', lat:14.60,  lng:120.98, dreamSummary:'Typhoon turning into a giant water dragon',          category:'water',     mood:'terrified' },
  { id:'u71', name:'Linh T.',     avatar:'👩🏻',  city:'Ho Chi Minh',  country:'VN', lat:10.82,  lng:106.63, dreamSummary:'Motorbike flying through time portals',              category:'timetravel',mood:'thrilled'  },
  { id:'u72', name:'Budi W.',     avatar:'🧑🏽',  city:'Bali',         country:'ID', lat:-8.41,  lng:115.19, dreamSummary:'Temple ceremony where everyone levitates',           category:'spiritual', mood:'transcendent'},
  // ── OCEANIA (5) ──
  { id:'u73', name:'Alex B.',     avatar:'🧑‍🦱', city:'Sydney',       country:'AU', lat:-33.87, lng:151.21, dreamSummary:'Alien spacecraft hovering over Opera House',         category:'ufo',       mood:'shocked'   },
  { id:'u74', name:'Jade M.',     avatar:'👩',   city:'Melbourne',    country:'AU', lat:-37.81, lng:144.96, dreamSummary:'Great Barrier Reef talking in whale song',            category:'animals',   mood:'amazed'    },
  { id:'u75', name:'Aroha T.',    avatar:'👩🏽',  city:'Auckland',     country:'NZ', lat:-36.85, lng:174.76, dreamSummary:'Maori ancestors performing haka in the sky',          category:'family',    mood:'powerful'   },
  { id:'u76', name:'Oliver H.',   avatar:'🧑',   city:'Perth',        country:'AU', lat:-31.95, lng:115.86, dreamSummary:'Outback turning into endless ocean',                 category:'water',     mood:'disoriented'},
  { id:'u77', name:'Tane R.',     avatar:'🧑🏽',  city:'Wellington',   country:'NZ', lat:-41.29, lng:174.78, dreamSummary:'Hobbit holes appearing in neighborhood',             category:'funny',     mood:'delighted' },
  // ── NORTH AMERICA (13) ──
  { id:'u78', name:'James T.',    avatar:'🧑',   city:'New York',     country:'US', lat:40.71,  lng:-74.01, dreamSummary:'Chased through a dark subway tunnel',                category:'chase',     mood:'fearful'   },
  { id:'u79', name:'Mia S.',      avatar:'👩‍🦰', city:'Toronto',      country:'CA', lat:43.65,  lng:-79.38, dreamSummary:'Reunion with passed grandmother in garden',          category:'family',    mood:'tearful'   },
  { id:'u80', name:'Diego L.',    avatar:'🧑🏽',  city:'Mexico City',  country:'MX', lat:19.43,  lng:-99.13, dreamSummary:'Day of the Dead festival with real spirits',        category:'death',     mood:'calm'      },
  { id:'u81', name:'Ashley R.',   avatar:'👩‍🦱', city:'Los Angeles',  country:'US', lat:34.05,  lng:-118.24,dreamSummary:'Walking red carpet but wearing pajamas',             category:'celebrity', mood:'embarrassed'},
  { id:'u82', name:'Brandon K.',  avatar:'🧑🏿',  city:'Chicago',      country:'US', lat:41.88,  lng:-87.63, dreamSummary:'Skyscrapers growing like trees in fast forward',     category:'timetravel',mood:'dizzy'     },
  { id:'u83', name:'Maria G.',    avatar:'👩🏽',  city:'Miami',        country:'US', lat:25.76,  lng:-80.19, dreamSummary:'Beach party where ocean dances to music',            category:'love',      mood:'ecstatic'  },
  { id:'u84', name:'Tyler W.',    avatar:'🧑',   city:'Seattle',      country:'US', lat:47.61,  lng:-122.33,dreamSummary:'Coffee shop floating in the clouds',                 category:'flying',    mood:'relaxed'   },
  { id:'u85', name:'Sarah L.',    avatar:'👩‍🦰', city:'Vancouver',    country:'CA', lat:49.28,  lng:-123.12,dreamSummary:'Forest trees whispering future events',              category:'nature',    mood:'mystified' },
  { id:'u86', name:'Kevin P.',    avatar:'🧑🏿',  city:'Atlanta',      country:'US', lat:33.75,  lng:-84.39, dreamSummary:'Playing basketball on the moon',                     category:'funny',     mood:'thrilled'  },
  { id:'u87', name:'Emily C.',    avatar:'👩',   city:'Boston',       country:'US', lat:42.36,  lng:-71.06, dreamSummary:'University exam where questions are in alien language',category:'school',    mood:'panicked'  },
  { id:'u88', name:'Carlos R.',   avatar:'🧑🏽',  city:'Houston',      country:'US', lat:29.76,  lng:-95.37, dreamSummary:'NASA rocket taking off from backyard',               category:'ufo',       mood:'excited'   },
  { id:'u89', name:'Chloe D.',    avatar:'👩‍🦱', city:'Montreal',     country:'CA', lat:45.50,  lng:-73.57, dreamSummary:'Ice castle that sings lullabies',                    category:'love',      mood:'enchanted' },
  { id:'u90', name:'Jake M.',     avatar:'🧑',   city:'Denver',       country:'US', lat:39.74,  lng:-104.99,dreamSummary:'Mountains opening like doors to another world',       category:'nature',    mood:'adventurous'},
  // ── SOUTH AMERICA (10) ──
  { id:'u91', name:'Sofia M.',    avatar:'👩',   city:'Buenos Aires', country:'AR', lat:-34.60, lng:-58.38, dreamSummary:'Dancing with strangers at moonlit party',             category:'love',      mood:'happy'     },
  { id:'u92', name:'Carlos V.',   avatar:'🧑🏽',  city:'São Paulo',    country:'BR', lat:-23.55, lng:-46.63, dreamSummary:'Finding treasure under ocean floor',                category:'money',     mood:'joyful'    },
  { id:'u93', name:'Natalia V.',  avatar:'👩‍🦱', city:'Montevideo',   country:'UY', lat:-34.88, lng:-56.16, dreamSummary:'Dancing tango with a ghost',                         category:'horror',    mood:'thrilled'  },
  { id:'u94', name:'Ana C.',      avatar:'👩🏽',  city:'Bogotá',       country:'CO', lat:4.71,   lng:-74.07, dreamSummary:'Jungle hike turning into fairy tale landscape',      category:'nature',    mood:'wonder'    },
  { id:'u95', name:'Pedro A.',    avatar:'🧑🏽',  city:'Lima',         country:'PE', lat:-12.05, lng:-77.04, dreamSummary:'Machu Picchu rebuilding itself in real-time',        category:'timetravel',mood:'awed'      },
  { id:'u96', name:'Valentina R.',avatar:'👩🏽',  city:'Santiago',     country:'CL', lat:-33.45, lng:-70.67, dreamSummary:'Andes mountains singing in deep voices',             category:'nature',    mood:'humbled'   },
  { id:'u97', name:'Lucas F.',    avatar:'🧑🏽',  city:'Rio de Janeiro',country:'BR',lat:-22.91, lng:-43.17, dreamSummary:'Christ statue coming to life and hugging everyone',  category:'spiritual', mood:'tearful'   },
  { id:'u98', name:'Isabella M.', avatar:'👩🏽',  city:'Quito',        country:'EC', lat:-0.18,  lng:-78.47, dreamSummary:'Volcano erupting with butterflies and light',        category:'nature',    mood:'magical'   },
  { id:'u99', name:'Miguel T.',   avatar:'🧑🏽',  city:'Caracas',      country:'VE', lat:10.49,  lng:-66.88, dreamSummary:'Family dinner table floating over city',             category:'family',    mood:'nostalgic' },
  { id:'u100',name:'Camila S.',   avatar:'👩🏽',  city:'Medellín',     country:'CO', lat:6.25,   lng:-75.56, dreamSummary:'Flowers growing from footsteps in the street',       category:'love',      mood:'enchanted' },
];

function generateUsers(dreams: Dream[]): SimUser[] {
  const userCats = dreams.flatMap(d => d.tags ?? []);
  return BASE_USERS.map(u => {
    let matchPct = Math.floor(Math.random() * 40) + 45; // 45-84 base
    if (userCats.length > 0) {
      const catMatch = userCats.some(c =>
        c.toLowerCase().includes(u.category.slice(0, 4))
      );
      if (catMatch) matchPct = Math.min(98, matchPct + 15);
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
            {filteredUsers.map(u => {
              const coords = getCoordinates(u.lat, u.lng);
              const isPulsing = pulsingIds.includes(u.id);
              const isSelected = selectedUser?.id === u.id;
              const color = matchColor(u.matchPct);
              return (
                <div key={u.id} className="absolute" style={{ left: `${coords.x}%`, top: `${coords.y}%`, zIndex: isSelected ? 50 : isPulsing ? 20 : 10 }}>
                  {isPulsing && (
                    <div
                      className="dm-pulse-ring w-6 h-6"
                      style={{
                        left: '50%',
                        top: '50%',
                        border: `2px solid ${color}`,
                      }}
                    />
                  )}
                  <div
                    className="w-2.5 h-2.5 rounded-full border border-white/40 cursor-pointer transition-transform hover:scale-150 hover:z-50"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 6px ${color}80`,
                      transform: `translate(-50%, -50%)${isSelected ? ' scale(1.8)' : ''}`,
                      borderColor: isSelected ? 'white' : 'rgba(255,255,255,0.4)',
                      borderWidth: isSelected ? '2px' : '1px',
                    }}
                    onClick={() => handleMarkerClick(u)}
                  />
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
