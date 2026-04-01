import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  x: number; // 0-100 percent of map width
  y: number; // 0-100 percent of map height
  dreamSummary: string;
  category: string;
  mood: string;
  matchPct: number;
  religCategory?: ReligiousCategory;
}

const BASE_USERS: Omit<SimUser, 'matchPct'>[] = [
  { id:'u1',  name:'Lena K.',     avatar:'👩‍🦰', city:'Berlin',        country:'DE', x:50.5, y:22.0, dreamSummary:'Flying over mountains in bright sunlight',          category:'flying',   mood:'excited'  },
  { id:'u2',  name:'Ahmed S.',    avatar:'🧔',   city:'Cairo',         country:'EG', x:57.5, y:38.0, dreamSummary:'Lost in an ancient desert temple',                  category:'spiritual',mood:'anxious'  },
  { id:'u3',  name:'Sofia M.',    avatar:'👩',   city:'Buenos Aires',  country:'AR', x:28.0, y:74.0, dreamSummary:'Dancing with strangers at a moonlit party',         category:'love',     mood:'happy'    },
  { id:'u4',  name:'James T.',    avatar:'🧑',   city:'New York',      country:'US', x:20.0, y:27.0, dreamSummary:'Chased through a dark subway tunnel',               category:'chase',    mood:'fearful'  },
  { id:'u5',  name:'Yuki H.',     avatar:'👩‍🦱', city:'Tokyo',         country:'JP', x:84.0, y:27.5, dreamSummary:'Riding a giant koi fish across the ocean',          category:'water',    mood:'calm'     },
  { id:'u6',  name:'Priya R.',    avatar:'👩🏽',  city:'Mumbai',        country:'IN', x:70.0, y:37.5, dreamSummary:'Sitting exam without preparation',                  category:'school',   mood:'stressed' },
  { id:'u7',  name:'Carlos V.',   avatar:'🧑🏽',  city:'São Paulo',     country:'BR', x:30.0, y:67.5, dreamSummary:'Finding treasure under ocean floor',               category:'money',    mood:'joyful'   },
  { id:'u8',  name:'Emma W.',     avatar:'👱‍♀️', city:'London',        country:'GB', x:47.5, y:20.5, dreamSummary:'Tea party with talking animals in wonderland',      category:'animals',  mood:'playful'  },
  { id:'u9',  name:'Ivan P.',     avatar:'👨',   city:'Moscow',        country:'RU', x:62.0, y:17.5, dreamSummary:'Frozen city, alone in snowstorm',                   category:'nature',   mood:'lonely'   },
  { id:'u10', name:'Amina B.',    avatar:'👩🏿',  city:'Lagos',         country:'NG', x:48.0, y:46.5, dreamSummary:'Meeting ancestors in ancestral village',            category:'spiritual',mood:'peaceful' },
  { id:'u11', name:'Felix G.',    avatar:'🧑‍🦲', city:'Paris',         country:'FR', x:48.5, y:22.5, dreamSummary:'Fell from Eiffel Tower, woke before landing',      category:'falling',  mood:'scared'   },
  { id:'u12', name:'Mei L.',      avatar:'👩🏻',  city:'Shanghai',      country:'CN', x:80.0, y:31.0, dreamSummary:'Time traveling to ancient China dynasty',           category:'timetravel',mood:'amazed' },
  { id:'u13', name:'Kofi A.',     avatar:'👨🏿',  city:'Accra',         country:'GH', x:46.5, y:46.0, dreamSummary:'Lion chasing through savannah at dusk',             category:'animals',  mood:'fearful'  },
  { id:'u14', name:'Sara J.',     avatar:'👩‍🦳', city:'Stockholm',     country:'SE', x:52.0, y:14.5, dreamSummary:'Northern lights spelling out a message',            category:'nature',   mood:'mystified'},
  { id:'u15', name:'Omar K.',     avatar:'🧔🏽',  city:'Istanbul',      country:'TR', x:57.0, y:27.5, dreamSummary:'Flying over the Bosphorus at midnight',             category:'flying',   mood:'free'     },
  { id:'u16', name:'Natalia V.',  avatar:'👩‍🦱', city:'Buenos Aires',  country:'AR', x:29.5, y:76.0, dreamSummary:'Dancing tango with a ghost',                        category:'horror',   mood:'thrilled' },
  { id:'u17', name:'Ravi S.',     avatar:'🧑🏽',  city:'Delhi',         country:'IN', x:69.5, y:34.5, dreamSummary:'Meeting a celebrity on a film set',                 category:'celebrity',mood:'star-struck'},
  { id:'u18', name:'Hana M.',     avatar:'👩🏻‍🦱', city:'Seoul',       country:'KR', x:83.5, y:28.5, dreamSummary:'Surfing a tsunami wave towards safety',             category:'water',    mood:'brave'    },
  { id:'u19', name:'Marco R.',    avatar:'🧑‍🦱', city:'Rome',          country:'IT', x:51.5, y:27.0, dreamSummary:'Lost in colosseum that never ends',                 category:'chase',    mood:'confused' },
  { id:'u20', name:'Fatima Z.',   avatar:'👩🏽‍🦱',city:'Casablanca',   country:'MA', x:45.5, y:33.5, dreamSummary:'Flying carpet ride over desert at sunset',          category:'flying',   mood:'magical'  },
  { id:'u21', name:'Alex B.',     avatar:'🧑‍🦱', city:'Sydney',        country:'AU', x:85.0, y:70.5, dreamSummary:'Alien spacecraft hovering over Opera House',        category:'ufo',      mood:'shocked'  },
  { id:'u22', name:'Nina F.',     avatar:'👩‍🦰', city:'Amsterdam',     country:'NL', x:49.5, y:20.5, dreamSummary:'Cycling through canals that turned into rivers',    category:'water',    mood:'serene'   },
  { id:'u23', name:'Diego L.',    avatar:'🧑🏽',  city:'Mexico City',   country:'MX', x:16.0, y:37.5, dreamSummary:'Day of the Dead festival with real spirits',       category:'death',    mood:'calm'     },
  { id:'u24', name:'Aisha T.',    avatar:'👩🏿',  city:'Nairobi',       country:'KE', x:59.0, y:50.0, dreamSummary:'Climbing Kilimanjaro while fire rains down',        category:'nature',   mood:'determined'},
  { id:'u25', name:'Chen W.',     avatar:'👨🏻',  city:'Beijing',       country:'CN', x:79.0, y:29.0, dreamSummary:'Attending school exam in wrong century',            category:'school',   mood:'anxious'  },
  { id:'u26', name:'Layla R.',    avatar:'👩🏻‍🦳',city:'Dubai',        country:'AE', x:63.0, y:36.5, dreamSummary:'Golden city rising from the sand',                  category:'money',    mood:'awed'     },
  { id:'u27', name:'Erik H.',     avatar:'🧔',   city:'Oslo',          country:'NO', x:50.5, y:12.5, dreamSummary:'Viking longship voyage to edge of the world',       category:'nature',   mood:'adventurous'},
  { id:'u28', name:'Rosa M.',     avatar:'👩🏽',  city:'Madrid',        country:'ES', x:46.0, y:28.5, dreamSummary:'Running from huge bull through city streets',       category:'chase',    mood:'terrified'},
  { id:'u29', name:'Tariq A.',    avatar:'🧔🏿',  city:'Riyadh',        country:'SA', x:62.5, y:37.5, dreamSummary:'Walking on water during prayer',                   category:'spiritual',mood:'blessed'  },
  { id:'u30', name:'Mia S.',      avatar:'👩‍🦰', city:'Toronto',       country:'CA', x:18.5, y:23.5, dreamSummary:'Reunion with passed grandmother in garden',         category:'family',   mood:'tearful'  },
  { id:'u31', name:'Boris K.',    avatar:'👨',   city:'Kyiv',          country:'UA', x:55.5, y:21.5, dreamSummary:'Endless forest where sun never rises',              category:'nature',   mood:'melancholic'},
  { id:'u32', name:'Zara A.',     avatar:'👩🏽‍🦲',city:'Johannesburg', country:'ZA', x:56.0, y:63.0, dreamSummary:'Becoming a bird and crossing oceans',               category:'flying',   mood:'free'     },
  { id:'u33', name:'Raj P.',      avatar:'🧑🏽‍🦱',city:'Bangalore',   country:'IN', x:71.5, y:40.5, dreamSummary:'Coding a program that solves world hunger',          category:'funny',    mood:'inspired' },
  { id:'u34', name:'Luisa F.',    avatar:'👩',   city:'Lisbon',        country:'PT', x:44.5, y:29.0, dreamSummary:'Ocean swallowing the city, calm escape by boat',    category:'water',    mood:'melancholic'},
  { id:'u35', name:'Yuna K.',     avatar:'👩🏻',  city:'Osaka',         country:'JP', x:85.5, y:30.0, dreamSummary:'Robot parade led by a dancing toaster',             category:'funny',    mood:'delighted'},
  { id:'u36', name:'Moussa D.',   avatar:'👨🏿',  city:'Dakar',         country:'SN', x:41.5, y:43.0, dreamSummary:'Ancestral spirits guiding through desert',          category:'spiritual',mood:'guided'   },
  { id:'u37', name:'Greta L.',    avatar:'👩‍🦳', city:'Vienna',        country:'AT', x:52.5, y:23.5, dreamSummary:'Waltz with a skeleton at an empty palace ball',     category:'death',    mood:'eerie'    },
  { id:'u38', name:'Ji-woo P.',   avatar:'🧑🏻',  city:'Busan',         country:'KR', x:84.5, y:29.5, dreamSummary:'Surfing through neon city on a cloud',              category:'flying',   mood:'euphoric' },
  { id:'u39', name:'Ana C.',      avatar:'👩🏽',  city:'Bogotá',        country:'CO', x:24.5, y:57.0, dreamSummary:'Jungle hike turning into fairy tale landscape',     category:'nature',   mood:'wonder'   },
  { id:'u40', name:'Leo B.',      avatar:'🧑‍🦱', city:'Munich',        country:'DE', x:51.0, y:23.5, dreamSummary:'UFO abduction with friendly aliens showing future', category:'ufo',      mood:'amazed'   },
];

function generateUsers(dreams: Dream[]): SimUser[] {
  // Determine dominant categories from user's dreams
  const userCats = dreams.flatMap(d => d.tags ?? []);
  return BASE_USERS.map(u => {
    let matchPct = Math.floor(Math.random() * 40) + 45; // 45-84 base
    // Boost if dream category matches user's dream categories
    if (userCats.length > 0) {
      const catMatch = userCats.some(c =>
        c.toLowerCase().includes(u.category.slice(0, 4))
      );
      if (catMatch) matchPct = Math.min(98, matchPct + 15);
    }
    return { ...u, matchPct };
  });
}

// ─── World Map SVG Paths (simplified continents) ──────────────────────────────
const CONTINENT_PATHS = {
  northAmerica: `M 8 18 L 12 14 L 16 13 L 22 13 L 26 16 L 26 22 L 24 28 L 22 35 L 20 42 L 17 44 L 14 42 L 10 38 L 8 32 L 6 25 Z`,
  southAmerica: `M 22 47 L 26 44 L 32 45 L 34 52 L 33 58 L 31 65 L 28 72 L 24 78 L 20 80 L 18 76 L 19 68 L 20 60 L 21 53 Z`,
  europe: `M 44 12 L 50 10 L 56 11 L 58 14 L 56 18 L 52 22 L 48 23 L 44 22 L 42 18 Z`,
  africa: `M 44 30 L 50 27 L 56 28 L 60 33 L 62 40 L 62 48 L 60 56 L 56 62 L 52 66 L 48 64 L 44 58 L 42 50 L 42 42 L 43 35 Z`,
  asia: `M 56 12 L 68 10 L 80 12 L 88 16 L 90 22 L 88 28 L 82 32 L 76 34 L 70 36 L 64 34 L 58 30 L 56 24 L 56 18 Z`,
  oceania: `M 80 58 L 88 56 L 92 60 L 92 66 L 88 70 L 82 70 L 78 66 L 78 60 Z`,
};

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
  const [connectionLines, setConnectionLines] = useState<string[]>([]);
  const [pulsingIds, setPulsingIds] = useState<string[]>([]);
  const [showTrends, setShowTrends] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<SVGSVGElement>(null);

  // Init users
  useEffect(() => {
    const generated = generateUsers(dreams);
    setUsers(generated);
    // Initial connections: top 5 matches
    const top5 = [...generated].sort((a, b) => b.matchPct - a.matchPct).slice(0, 5);
    setConnectionLines(top5.map(u => u.id));
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

  const filteredUsers = activeCategory === 'all'
    ? users
    : users.filter(u => u.category === activeCategory);

  const matchColor = (pct: number) =>
    pct >= 80 ? '#22c55e' : pct >= 60 ? '#eab308' : '#f97316';

  const handleMarkerClick = useCallback((user: SimUser) => {
    setSelectedUser(prev => prev?.id === user.id ? null : user);
  }, []);

  const handleClosePanel = () => setSelectedUser(null);

  // Stats
  const totalActive = users.length + 1847;
  const avgMatch = users.length > 0
    ? Math.round(users.reduce((s, u) => s + u.matchPct, 0) / users.length)
    : 0;
  const matchesToday = Math.floor(users.length * 0.6) + 23;

  // Trend rankings: count users per category, sort by count descending
  const trendRanking = React.useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach(u => {
      counts[u.category] = (counts[u.category] || 0) + 1;
    });
    // Add simulated global numbers for realism
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
  const mapBg = isLight ? '#ddd6fe' : '#0f0529';
  const mapFill = isLight ? '#c4b5fd' : '#1e0b4a';
  const mapStroke = isLight ? '#8b5cf6' : '#4c1d95';
  const cardBg = isLight
    ? 'bg-white/70 border-purple-200/60'
    : 'bg-white/5 border-white/10';
  const textMain = isLight ? 'text-slate-800' : 'text-white';
  const textSub = isLight ? 'text-slate-500' : 'text-slate-400';
  const chipBg = isLight ? 'bg-white/80 border-purple-200' : 'bg-white/8 border-white/10';
  const chipActive = 'bg-purple-600 border-purple-500 text-white';

  return (
    <div className={`relative flex flex-col min-h-screen w-full ${bg} overflow-hidden`}>

      {/* ── Keyframe Styles ── */}
      <style>{`
        @keyframes dmPulse {
          0%,100% { transform: scale(1); opacity:1; }
          50%      { transform: scale(1.6); opacity:0.5; }
        }
        @keyframes dmDash {
          to { stroke-dashoffset: -20; }
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
        .dm-pulse { animation: dmPulse 2s ease-in-out infinite; }
        .dm-dash  { animation: dmDash 1.5s linear infinite; }
        .dm-slide-down { animation: dmSlideDown 0.35s ease both; }
        .dm-slide-up   { animation: dmSlideUp 0.35s ease both; }
        .dm-fade-out   { animation: dmFadeOut 0.4s ease forwards; }
        .dm-chip-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Header ── */}
      <div className={`relative z-20 flex items-center justify-between px-4 pt-safe pt-4 pb-2 backdrop-blur-sm border-b ${isLight ? 'border-purple-100/60' : 'border-white/5'}`}>
        <div>
          <h1 className={`text-lg font-bold leading-tight ${textMain}`}>{t.title}</h1>
          <p className={`text-xs ${textSub}`}>{t.subtitle}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isLight ? 'bg-purple-100 hover:bg-purple-200 text-purple-700' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            aria-label="Close"
          >
            <span className="material-icons text-xl">close</span>
          </button>
        )}
      </div>

      {/* ── Stats Bar ── */}
      <div className={`z-20 flex items-center justify-around px-3 py-2 border-b backdrop-blur-sm ${isLight ? 'border-purple-100/60 bg-white/40' : 'border-white/5 bg-black/20'}`}>
        <StatPill icon="public"       value={totalActive.toLocaleString()} label={t.worldwide}    isLight={isLight} color="#a855f7" />
        <StatPill icon="favorite"     value={`${avgMatch}%`}               label={t.dreamersSimilar.replace('%','')} isLight={isLight} color="#ec4899" />
        <StatPill icon="bolt"         value={matchesToday.toString()}       label={t.matchestoday} isLight={isLight} color="#f59e0b" />
      </div>

      {/* ── Trend Rankings Toggle ── */}
      <button
        onClick={() => setShowTrends(prev => !prev)}
        className={`z-20 mx-3 mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
          showTrends
            ? 'bg-purple-600 border-purple-500 text-white'
            : `${cardBg} ${textSub} backdrop-blur-sm`
        }`}
      >
        <span className="material-icons text-sm">{showTrends ? 'leaderboard' : 'leaderboard'}</span>
        {showTrends ? t.hideTrends : t.showTrends}
        <span className="material-icons text-sm">{showTrends ? 'expand_less' : 'expand_more'}</span>
      </button>

      {/* ── Trend Rankings List ── */}
      {showTrends && (
        <div className={`z-20 mx-3 mt-2 rounded-2xl border backdrop-blur-xl overflow-hidden dm-slide-up ${
          isLight ? 'bg-white/80 border-purple-200/60' : 'bg-white/5 border-white/10'
        }`} style={{ maxHeight: '40vh', overflowY: 'auto' }}>
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
                {/* Rank number */}
                <div
                  className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                    isTop3 ? 'text-white' : `${isLight ? 'bg-purple-100 text-purple-600' : 'bg-white/8 text-slate-400'}`
                  }`}
                  style={rankBg ? { background: rankBg } : undefined}
                >
                  {i + 1}
                </div>
                {/* Icon + Name */}
                <span className="text-lg leading-none shrink-0">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold truncate ${textMain}`}>{tLang(cat)}</span>
                    <span className={`text-[10px] font-bold tabular-nums ${isLight ? 'text-purple-600' : 'text-purple-300'}`}>
                      {cat.globalCount.toLocaleString()} {t.trendDreamers}
                    </span>
                  </div>
                  {/* Progress bar */}
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

      {/* ── Category Chips ── */}
      <div className="z-20 flex gap-2 px-3 py-2.5 overflow-x-auto dm-chip-scroll shrink-0">
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

      {/* ── World Map ── */}
      <div className="relative z-10 flex-1 min-h-0 overflow-hidden px-2 pb-2">
        <div className={`w-full h-full rounded-2xl overflow-hidden border shadow-xl ${isLight ? 'border-purple-200/60 shadow-purple-200/20' : 'border-white/5 shadow-black/40'}`}
          style={{ minHeight: 280 }}>

          <svg
            ref={mapRef}
            viewBox="0 0 100 80"
            className="w-full h-full"
            style={{ background: mapBg }}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Graticule grid */}
            {[10,20,30,40,50,60,70].map(y => (
              <line key={`gy${y}`} x1="0" y1={y} x2="100" y2={y}
                stroke={isLight ? '#c4b5fd' : '#2d1b5a'} strokeWidth="0.2" opacity="0.5" />
            ))}
            {[10,20,30,40,50,60,70,80,90].map(x => (
              <line key={`gx${x}`} x1={x} y1="0" x2={x} y2="80"
                stroke={isLight ? '#c4b5fd' : '#2d1b5a'} strokeWidth="0.2" opacity="0.5" />
            ))}

            {/* Continent shapes */}
            <path d={CONTINENT_PATHS.northAmerica} fill={mapFill} stroke={mapStroke} strokeWidth="0.4" />
            <path d={CONTINENT_PATHS.southAmerica} fill={mapFill} stroke={mapStroke} strokeWidth="0.4" />
            <path d={CONTINENT_PATHS.europe}       fill={mapFill} stroke={mapStroke} strokeWidth="0.4" />
            <path d={CONTINENT_PATHS.africa}       fill={mapFill} stroke={mapStroke} strokeWidth="0.4" />
            <path d={CONTINENT_PATHS.asia}         fill={mapFill} stroke={mapStroke} strokeWidth="0.4" />
            <path d={CONTINENT_PATHS.oceania}      fill={mapFill} stroke={mapStroke} strokeWidth="0.4" />

            {/* Connection lines for top matches */}
            {filteredUsers
              .filter(u => connectionLines.includes(u.id))
              .map(u => (
                <line
                  key={`line-${u.id}`}
                  x1={50} y1={40}
                  x2={u.x} y2={u.y}
                  stroke={matchColor(u.matchPct)}
                  strokeWidth="0.4"
                  strokeDasharray="2 1"
                  opacity="0.6"
                  className="dm-dash"
                />
              ))
            }

            {/* "You" center marker */}
            <circle cx={50} cy={40} r={1.2} fill="#a855f7" opacity="0.9" />
            <circle cx={50} cy={40} r={2.2} fill="none" stroke="#a855f7" strokeWidth="0.5" opacity="0.5" className="dm-pulse" />

            {/* User markers */}
            {filteredUsers.map(u => {
              const isPulsing = pulsingIds.includes(u.id);
              const isSelected = selectedUser?.id === u.id;
              const color = matchColor(u.matchPct);
              return (
                <g key={u.id} onClick={() => handleMarkerClick(u)} style={{ cursor: 'pointer' }}>
                  {isPulsing && (
                    <circle cx={u.x} cy={u.y} r={2.5} fill={color} opacity="0.2" className="dm-pulse" />
                  )}
                  <circle
                    cx={u.x} cy={u.y}
                    r={isSelected ? 2.0 : 1.4}
                    fill={color}
                    opacity={0.85}
                    stroke={isSelected ? 'white' : 'transparent'}
                    strokeWidth="0.5"
                    style={{ transition: 'r 0.2s ease' }}
                  />
                  {isSelected && (
                    <text x={u.x} y={u.y - 2.5} fontSize="1.8" textAnchor="middle" fill="white"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}>
                      {u.avatar}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ── Tap hint ── */}
      {!selectedUser && (
        <p className={`text-center text-xs pb-2 ${textSub}`}>{t.tapMarker}</p>
      )}

      {/* ── Match Detail Panel ── */}
      {selectedUser && (
        <div className={`z-30 absolute bottom-0 inset-x-0 rounded-t-3xl border-t backdrop-blur-xl p-5 dm-slide-up ${isLight ? 'bg-white/85 border-purple-200/60' : 'bg-[#0d0722]/90 border-white/10'}`}
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
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold`}
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
                className="w-14 h-14 rounded-full flex flex-col items-center justify-center border-4 font-bold text-white text-xs"
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
          className={`absolute top-24 inset-x-4 z-50 rounded-2xl border backdrop-blur-xl px-4 py-3 flex items-center gap-3 shadow-2xl ${toastVisible ? 'dm-slide-down' : 'dm-fade-out'} ${isLight ? 'bg-white/90 border-purple-200/60' : 'bg-[#1a0a3a]/90 border-white/15'}`}
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
          className="absolute inset-0 z-20 bg-black/30 backdrop-blur-[1px]"
          onClick={handleClosePanel}
          style={{ bottom: '55vh' }}
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
