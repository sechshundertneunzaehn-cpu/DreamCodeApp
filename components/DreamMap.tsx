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

// 100 bot users distributed across the globe
const BASE_USERS: Omit<SimUser, 'matchPct'>[] = [
  // ── EUROPE (25) ──
  { id:'u1',  name:'Lena K.',     avatar:'👩‍🦰', city:'Berlin',       country:'DE', x:50.5, y:22.0, dreamSummary:'Flying over mountains in bright sunlight',           category:'flying',    mood:'excited'   },
  { id:'u2',  name:'Felix G.',    avatar:'🧑‍🦲', city:'Paris',        country:'FR', x:48.5, y:22.5, dreamSummary:'Fell from Eiffel Tower, woke before landing',       category:'falling',   mood:'scared'    },
  { id:'u3',  name:'Emma W.',     avatar:'👱‍♀️', city:'London',       country:'GB', x:47.5, y:20.5, dreamSummary:'Tea party with talking animals in wonderland',       category:'animals',   mood:'playful'   },
  { id:'u4',  name:'Marco R.',    avatar:'🧑‍🦱', city:'Rome',         country:'IT', x:51.5, y:27.0, dreamSummary:'Lost in colosseum that never ends',                  category:'chase',     mood:'confused'  },
  { id:'u5',  name:'Rosa M.',     avatar:'👩🏽',  city:'Madrid',       country:'ES', x:46.0, y:28.5, dreamSummary:'Running from bull through city streets',             category:'chase',     mood:'terrified' },
  { id:'u6',  name:'Nina F.',     avatar:'👩‍🦰', city:'Amsterdam',    country:'NL', x:49.5, y:20.5, dreamSummary:'Cycling canals that turned into rivers',             category:'water',     mood:'serene'    },
  { id:'u7',  name:'Sara J.',     avatar:'👩‍🦳', city:'Stockholm',    country:'SE', x:52.0, y:14.5, dreamSummary:'Northern lights spelling out a message',             category:'nature',    mood:'mystified' },
  { id:'u8',  name:'Erik H.',     avatar:'🧔',   city:'Oslo',         country:'NO', x:50.5, y:12.5, dreamSummary:'Viking longship voyage to edge of the world',        category:'nature',    mood:'adventurous'},
  { id:'u9',  name:'Greta L.',    avatar:'👩‍🦳', city:'Vienna',       country:'AT', x:52.5, y:23.5, dreamSummary:'Waltz with a skeleton at empty palace ball',         category:'death',     mood:'eerie'     },
  { id:'u10', name:'Leo B.',      avatar:'🧑‍🦱', city:'Munich',       country:'DE', x:51.0, y:23.5, dreamSummary:'UFO abduction with friendly aliens showing future',  category:'ufo',       mood:'amazed'    },
  { id:'u11', name:'Luisa F.',    avatar:'👩',   city:'Lisbon',       country:'PT', x:44.5, y:29.0, dreamSummary:'Ocean swallowing the city, calm escape by boat',     category:'water',     mood:'melancholic'},
  { id:'u12', name:'Boris K.',    avatar:'👨',   city:'Kyiv',         country:'UA', x:55.5, y:21.5, dreamSummary:'Endless forest where sun never rises',               category:'nature',    mood:'melancholic'},
  { id:'u13', name:'Marta P.',    avatar:'👩🏻',  city:'Warsaw',       country:'PL', x:53.0, y:20.0, dreamSummary:'Piano playing itself in empty concert hall',         category:'spiritual', mood:'haunted'   },
  { id:'u14', name:'Nikos D.',    avatar:'🧔🏽',  city:'Athens',       country:'GR', x:54.0, y:29.0, dreamSummary:'Swimming in crystal sea with ancient statues',       category:'water',     mood:'peaceful'  },
  { id:'u15', name:'Elsa B.',     avatar:'👩‍🦱', city:'Helsinki',     country:'FI', x:54.5, y:12.0, dreamSummary:'Sauna melting into northern aurora',                 category:'nature',    mood:'bliss'     },
  { id:'u16', name:'Jan V.',      avatar:'🧑',   city:'Prague',       country:'CZ', x:52.0, y:21.5, dreamSummary:'Clock tower coming alive at midnight',               category:'timetravel',mood:'wonder'    },
  { id:'u17', name:'Katya S.',    avatar:'👩‍🦰', city:'Zurich',       country:'CH', x:50.0, y:24.0, dreamSummary:'Mountain splitting open revealing gold',             category:'money',     mood:'greedy'    },
  { id:'u18', name:'Liam O.',     avatar:'🧑‍🦱', city:'Dublin',       country:'IE', x:45.0, y:19.0, dreamSummary:'Leprechaun leading to rainbow treasure',             category:'funny',     mood:'amused'    },
  { id:'u19', name:'Astrid N.',   avatar:'👩',   city:'Copenhagen',   country:'DK', x:51.0, y:16.0, dreamSummary:'Mermaid singing beneath frozen harbor',              category:'love',      mood:'longing'   },
  { id:'u20', name:'Dmitri V.',   avatar:'👨',   city:'St Petersburg',country:'RU', x:58.0, y:14.0, dreamSummary:'Walking through Winter Palace that never ends',      category:'timetravel',mood:'lost'      },
  { id:'u21', name:'Elena R.',    avatar:'👩🏻',  city:'Bucharest',    country:'RO', x:55.0, y:25.0, dreamSummary:'Vampire turning into a kind old man',                category:'horror',    mood:'surprised' },
  { id:'u22', name:'Ivan P.',     avatar:'👨',   city:'Moscow',       country:'RU', x:62.0, y:17.5, dreamSummary:'Frozen city, alone in snowstorm',                    category:'nature',    mood:'lonely'    },
  { id:'u23', name:'Giulia T.',   avatar:'👩🏽',  city:'Milan',        country:'IT', x:50.5, y:25.5, dreamSummary:'Fashion show where clothes fly away',                category:'funny',     mood:'embarrassed'},
  { id:'u24', name:'Henrik L.',   avatar:'🧔',   city:'Gothenburg',   country:'SE', x:51.5, y:15.0, dreamSummary:'Sailing through sky on viking ship',                 category:'flying',    mood:'free'      },
  { id:'u25', name:'Sofia K.',    avatar:'👩‍🦱', city:'Barcelona',    country:'ES', x:47.0, y:28.0, dreamSummary:'Gaudi buildings melting in surreal heat',             category:'horror',    mood:'disoriented'},
  // ── MIDDLE EAST & NORTH AFRICA (12) ──
  { id:'u26', name:'Omar K.',     avatar:'🧔🏽',  city:'Istanbul',     country:'TR', x:57.0, y:27.5, dreamSummary:'Flying over the Bosphorus at midnight',              category:'flying',    mood:'free'      },
  { id:'u27', name:'Ahmed S.',    avatar:'🧔',   city:'Cairo',        country:'EG', x:57.5, y:38.0, dreamSummary:'Lost in an ancient desert temple',                   category:'spiritual', mood:'anxious'   },
  { id:'u28', name:'Fatima Z.',   avatar:'👩🏽‍🦱',city:'Casablanca',  country:'MA', x:45.5, y:33.5, dreamSummary:'Flying carpet ride over desert at sunset',           category:'flying',    mood:'magical'   },
  { id:'u29', name:'Tariq A.',    avatar:'🧔🏿',  city:'Riyadh',       country:'SA', x:62.5, y:37.5, dreamSummary:'Walking on water during prayer',                    category:'spiritual', mood:'blessed'   },
  { id:'u30', name:'Layla R.',    avatar:'👩🏻‍🦳',city:'Dubai',       country:'AE', x:63.0, y:36.5, dreamSummary:'Golden city rising from the sand',                   category:'money',     mood:'awed'      },
  { id:'u31', name:'Yasmin H.',   avatar:'👩🏽',  city:'Tehran',       country:'IR', x:64.5, y:32.0, dreamSummary:'Garden of paradise with talking flowers',            category:'spiritual', mood:'peaceful'  },
  { id:'u32', name:'Karim M.',    avatar:'🧑🏽',  city:'Amman',        country:'JO', x:59.5, y:34.0, dreamSummary:'Dead Sea turning into liquid gold',                  category:'money',     mood:'amazed'    },
  { id:'u33', name:'Nour E.',     avatar:'👩🏽',  city:'Beirut',       country:'LB', x:59.0, y:32.5, dreamSummary:'City rebuilding itself from ruins overnight',        category:'timetravel',mood:'hopeful'   },
  { id:'u34', name:'Ali F.',      avatar:'🧔🏽',  city:'Baghdad',      country:'IQ', x:61.5, y:33.0, dreamSummary:'Ancient library with books that speak',              category:'spiritual', mood:'wise'      },
  { id:'u35', name:'Dina S.',     avatar:'👩🏽',  city:'Tunis',        country:'TN', x:49.0, y:31.0, dreamSummary:'Medina maze where walls shift like sand',            category:'chase',     mood:'confused'  },
  { id:'u36', name:'Emre Y.',     avatar:'🧑',   city:'Ankara',       country:'TR', x:58.0, y:28.5, dreamSummary:'Hot air balloon revealing ancient ruins',            category:'nature',    mood:'awed'      },
  { id:'u37', name:'Samira K.',   avatar:'👩🏿',  city:'Algiers',      country:'DZ', x:47.5, y:32.0, dreamSummary:'Desert storm revealing hidden oasis city',           category:'nature',    mood:'amazed'    },
  // ── SUB-SAHARAN AFRICA (10) ──
  { id:'u38', name:'Amina B.',    avatar:'👩🏿',  city:'Lagos',        country:'NG', x:48.0, y:46.5, dreamSummary:'Meeting ancestors in ancestral village',             category:'spiritual', mood:'peaceful'  },
  { id:'u39', name:'Kofi A.',     avatar:'👨🏿',  city:'Accra',        country:'GH', x:46.5, y:46.0, dreamSummary:'Lion chasing through savannah at dusk',              category:'animals',   mood:'fearful'   },
  { id:'u40', name:'Aisha T.',    avatar:'👩🏿',  city:'Nairobi',      country:'KE', x:59.0, y:50.0, dreamSummary:'Climbing Kilimanjaro while fire rains',              category:'nature',    mood:'determined'},
  { id:'u41', name:'Moussa D.',   avatar:'👨🏿',  city:'Dakar',        country:'SN', x:41.5, y:43.0, dreamSummary:'Ancestral spirits guiding through desert',           category:'spiritual', mood:'guided'    },
  { id:'u42', name:'Zara A.',     avatar:'👩🏽‍🦲',city:'Johannesburg',country:'ZA', x:56.0, y:63.0, dreamSummary:'Becoming a bird and crossing oceans',                category:'flying',    mood:'free'      },
  { id:'u43', name:'Kwame O.',    avatar:'🧑🏿',  city:'Kampala',      country:'UG', x:58.5, y:49.5, dreamSummary:'Gorillas teaching sign language in forest',          category:'animals',   mood:'wonder'    },
  { id:'u44', name:'Blessing N.', avatar:'👩🏿',  city:'Abuja',        country:'NG', x:49.0, y:45.5, dreamSummary:'Market where everything is made of light',           category:'spiritual', mood:'luminous'  },
  { id:'u45', name:'Thabo M.',    avatar:'🧑🏿',  city:'Cape Town',    country:'ZA', x:53.0, y:66.0, dreamSummary:'Table Mountain floating into space',                 category:'ufo',       mood:'shocked'   },
  { id:'u46', name:'Aya L.',      avatar:'👩🏿',  city:'Addis Ababa',  country:'ET', x:60.0, y:46.0, dreamSummary:'Coffee ceremony with angels as guests',              category:'spiritual', mood:'serene'    },
  { id:'u47', name:'Jean-Pierre.',avatar:'🧑🏿',  city:'Kinshasa',     country:'CD', x:53.5, y:52.0, dreamSummary:'River Congo flowing backwards revealing treasures',  category:'money',     mood:'excited'   },
  // ── SOUTH ASIA (8) ──
  { id:'u48', name:'Priya R.',    avatar:'👩🏽',  city:'Mumbai',       country:'IN', x:70.0, y:37.5, dreamSummary:'Sitting exam without preparation',                   category:'school',    mood:'stressed'  },
  { id:'u49', name:'Ravi S.',     avatar:'🧑🏽',  city:'Delhi',        country:'IN', x:69.5, y:34.5, dreamSummary:'Meeting a celebrity on a film set',                  category:'celebrity', mood:'star-struck'},
  { id:'u50', name:'Raj P.',      avatar:'🧑🏽‍🦱',city:'Bangalore',  country:'IN', x:71.5, y:40.5, dreamSummary:'Coding a program that solves world hunger',           category:'funny',     mood:'inspired'  },
  { id:'u51', name:'Ananya G.',   avatar:'👩🏽',  city:'Kolkata',      country:'IN', x:73.0, y:36.0, dreamSummary:'Durga goddess visiting during storm',                category:'spiritual', mood:'blessed'   },
  { id:'u52', name:'Sanjay M.',   avatar:'🧔🏽',  city:'Chennai',      country:'IN', x:72.0, y:42.0, dreamSummary:'Ocean temple rising from the waves',                 category:'water',     mood:'mystified' },
  { id:'u53', name:'Nisha T.',    avatar:'👩🏽',  city:'Kathmandu',    country:'NP', x:72.5, y:33.0, dreamSummary:'Flying over Himalayas touching clouds',              category:'flying',    mood:'euphoric'  },
  { id:'u54', name:'Arjun K.',    avatar:'🧑🏽',  city:'Colombo',      country:'LK', x:72.0, y:44.0, dreamSummary:'Elephant parade through golden streets',             category:'animals',   mood:'joyful'    },
  { id:'u55', name:'Fatima P.',   avatar:'👩🏽',  city:'Karachi',      country:'PK', x:66.5, y:35.0, dreamSummary:'Bazaar where memories are sold as gems',             category:'timetravel',mood:'nostalgic' },
  // ── EAST ASIA (12) ──
  { id:'u56', name:'Yuki H.',     avatar:'👩‍🦱', city:'Tokyo',        country:'JP', x:84.0, y:27.5, dreamSummary:'Riding a giant koi fish across the ocean',           category:'water',     mood:'calm'      },
  { id:'u57', name:'Mei L.',      avatar:'👩🏻',  city:'Shanghai',     country:'CN', x:80.0, y:31.0, dreamSummary:'Time traveling to ancient China dynasty',            category:'timetravel',mood:'amazed'    },
  { id:'u58', name:'Hana M.',     avatar:'👩🏻‍🦱', city:'Seoul',      country:'KR', x:83.5, y:28.5, dreamSummary:'Surfing a tsunami wave towards safety',              category:'water',     mood:'brave'     },
  { id:'u59', name:'Chen W.',     avatar:'👨🏻',  city:'Beijing',      country:'CN', x:79.0, y:29.0, dreamSummary:'Attending school exam in wrong century',             category:'school',    mood:'anxious'   },
  { id:'u60', name:'Yuna K.',     avatar:'👩🏻',  city:'Osaka',        country:'JP', x:85.5, y:30.0, dreamSummary:'Robot parade led by dancing toaster',                category:'funny',     mood:'delighted' },
  { id:'u61', name:'Ji-woo P.',   avatar:'🧑🏻',  city:'Busan',        country:'KR', x:84.5, y:29.5, dreamSummary:'Surfing through neon city on a cloud',               category:'flying',    mood:'euphoric'  },
  { id:'u62', name:'Lin Y.',      avatar:'👩🏻',  city:'Taipei',       country:'TW', x:82.5, y:34.0, dreamSummary:'Night market food coming alive and dancing',         category:'funny',     mood:'amused'    },
  { id:'u63', name:'Tuan N.',     avatar:'🧑🏻',  city:'Hanoi',        country:'VN', x:78.5, y:37.0, dreamSummary:'Dragons emerging from Ha Long Bay mist',             category:'animals',   mood:'awed'      },
  { id:'u64', name:'Sakura T.',   avatar:'👩🏻',  city:'Kyoto',        country:'JP', x:85.0, y:28.0, dreamSummary:'Cherry blossoms turning into butterflies',           category:'nature',    mood:'peaceful'  },
  { id:'u65', name:'Wei Z.',      avatar:'🧑🏻',  city:'Chengdu',      country:'CN', x:77.0, y:32.0, dreamSummary:'Panda army marching through bamboo forest',          category:'animals',   mood:'hilarious' },
  { id:'u66', name:'Min-ji L.',   avatar:'👩🏻',  city:'Incheon',      country:'KR', x:83.0, y:27.5, dreamSummary:'K-pop concert where audience floats',               category:'celebrity', mood:'euphoric'  },
  { id:'u67', name:'Hiroshi K.',  avatar:'🧔🏻',  city:'Nagoya',       country:'JP', x:84.5, y:28.5, dreamSummary:'Samurai duel on top of Mount Fuji',                  category:'chase',     mood:'intense'   },
  // ── SOUTHEAST ASIA (5) ──
  { id:'u68', name:'Rina S.',     avatar:'👩🏽',  city:'Jakarta',      country:'ID', x:78.0, y:52.0, dreamSummary:'Volcano erupting flowers instead of lava',           category:'nature',    mood:'wonder'    },
  { id:'u69', name:'Arun P.',     avatar:'🧑🏽',  city:'Bangkok',      country:'TH', x:76.5, y:40.0, dreamSummary:'Golden temple floating above the clouds',            category:'spiritual', mood:'serene'    },
  { id:'u70', name:'Maria C.',    avatar:'👩🏽',  city:'Manila',       country:'PH', x:82.0, y:40.0, dreamSummary:'Typhoon turning into a giant water dragon',          category:'water',     mood:'terrified' },
  { id:'u71', name:'Linh T.',     avatar:'👩🏻',  city:'Ho Chi Minh',  country:'VN', x:78.0, y:42.0, dreamSummary:'Motorbike flying through time portals',              category:'timetravel',mood:'thrilled'  },
  { id:'u72', name:'Budi W.',     avatar:'🧑🏽',  city:'Bali',         country:'ID', x:79.5, y:54.0, dreamSummary:'Temple ceremony where everyone levitates',           category:'spiritual', mood:'transcendent'},
  // ── OCEANIA (5) ──
  { id:'u73', name:'Alex B.',     avatar:'🧑‍🦱', city:'Sydney',       country:'AU', x:85.0, y:70.5, dreamSummary:'Alien spacecraft hovering over Opera House',         category:'ufo',       mood:'shocked'   },
  { id:'u74', name:'Jade M.',     avatar:'👩',   city:'Melbourne',    country:'AU', x:83.5, y:72.0, dreamSummary:'Great Barrier Reef talking in whale song',            category:'animals',   mood:'amazed'    },
  { id:'u75', name:'Aroha T.',    avatar:'👩🏽',  city:'Auckland',     country:'NZ', x:90.0, y:72.0, dreamSummary:'Maori ancestors performing haka in the sky',          category:'family',    mood:'powerful'   },
  { id:'u76', name:'Oliver H.',   avatar:'🧑',   city:'Perth',        country:'AU', x:79.0, y:68.0, dreamSummary:'Outback turning into endless ocean',                 category:'water',     mood:'disoriented'},
  { id:'u77', name:'Tane R.',     avatar:'🧑🏽',  city:'Wellington',   country:'NZ', x:91.0, y:74.0, dreamSummary:'Hobbit holes appearing in neighborhood',             category:'funny',     mood:'delighted' },
  // ── NORTH AMERICA (13) ──
  { id:'u78', name:'James T.',    avatar:'🧑',   city:'New York',     country:'US', x:20.0, y:27.0, dreamSummary:'Chased through a dark subway tunnel',                category:'chase',     mood:'fearful'   },
  { id:'u79', name:'Mia S.',      avatar:'👩‍🦰', city:'Toronto',      country:'CA', x:18.5, y:23.5, dreamSummary:'Reunion with passed grandmother in garden',          category:'family',    mood:'tearful'   },
  { id:'u80', name:'Diego L.',    avatar:'🧑🏽',  city:'Mexico City',  country:'MX', x:16.0, y:37.5, dreamSummary:'Day of the Dead festival with real spirits',        category:'death',     mood:'calm'      },
  { id:'u81', name:'Ashley R.',   avatar:'👩‍🦱', city:'Los Angeles',  country:'US', x:11.0, y:30.0, dreamSummary:'Walking red carpet but wearing pajamas',             category:'celebrity', mood:'embarrassed'},
  { id:'u82', name:'Brandon K.',  avatar:'🧑🏿',  city:'Chicago',      country:'US', x:17.5, y:27.5, dreamSummary:'Skyscrapers growing like trees in fast forward',     category:'timetravel',mood:'dizzy'     },
  { id:'u83', name:'Maria G.',    avatar:'👩🏽',  city:'Miami',        country:'US', x:19.0, y:33.0, dreamSummary:'Beach party where ocean dances to music',            category:'love',      mood:'ecstatic'  },
  { id:'u84', name:'Tyler W.',    avatar:'🧑',   city:'Seattle',      country:'US', x:10.5, y:24.0, dreamSummary:'Coffee shop floating in the clouds',                 category:'flying',    mood:'relaxed'   },
  { id:'u85', name:'Sarah L.',    avatar:'👩‍🦰', city:'Vancouver',    country:'CA', x:10.0, y:22.5, dreamSummary:'Forest trees whispering future events',              category:'nature',    mood:'mystified' },
  { id:'u86', name:'Kevin P.',    avatar:'🧑🏿',  city:'Atlanta',      country:'US', x:18.0, y:31.0, dreamSummary:'Playing basketball on the moon',                     category:'funny',     mood:'thrilled'  },
  { id:'u87', name:'Emily C.',    avatar:'👩',   city:'Boston',       country:'US', x:21.0, y:26.0, dreamSummary:'University exam where questions are in alien language',category:'school',    mood:'panicked'  },
  { id:'u88', name:'Carlos R.',   avatar:'🧑🏽',  city:'Houston',      country:'US', x:15.5, y:32.5, dreamSummary:'NASA rocket taking off from backyard',               category:'ufo',       mood:'excited'   },
  { id:'u89', name:'Chloe D.',    avatar:'👩‍🦱', city:'Montreal',     country:'CA', x:20.5, y:23.0, dreamSummary:'Ice castle that sings lullabies',                    category:'love',      mood:'enchanted' },
  { id:'u90', name:'Jake M.',     avatar:'🧑',   city:'Denver',       country:'US', x:14.0, y:28.5, dreamSummary:'Mountains opening like doors to another world',       category:'nature',    mood:'adventurous'},
  // ── SOUTH AMERICA (10) ──
  { id:'u91', name:'Sofia M.',    avatar:'👩',   city:'Buenos Aires', country:'AR', x:28.0, y:74.0, dreamSummary:'Dancing with strangers at moonlit party',             category:'love',      mood:'happy'     },
  { id:'u92', name:'Carlos V.',   avatar:'🧑🏽',  city:'São Paulo',    country:'BR', x:30.0, y:67.5, dreamSummary:'Finding treasure under ocean floor',                category:'money',     mood:'joyful'    },
  { id:'u93', name:'Natalia V.',  avatar:'👩‍🦱', city:'Montevideo',   country:'UY', x:27.5, y:73.0, dreamSummary:'Dancing tango with a ghost',                         category:'horror',    mood:'thrilled'  },
  { id:'u94', name:'Ana C.',      avatar:'👩🏽',  city:'Bogotá',       country:'CO', x:24.5, y:57.0, dreamSummary:'Jungle hike turning into fairy tale landscape',      category:'nature',    mood:'wonder'    },
  { id:'u95', name:'Pedro A.',    avatar:'🧑🏽',  city:'Lima',         country:'PE', x:23.0, y:62.0, dreamSummary:'Machu Picchu rebuilding itself in real-time',        category:'timetravel',mood:'awed'      },
  { id:'u96', name:'Valentina R.',avatar:'👩🏽',  city:'Santiago',     country:'CL', x:25.0, y:72.5, dreamSummary:'Andes mountains singing in deep voices',             category:'nature',    mood:'humbled'   },
  { id:'u97', name:'Lucas F.',    avatar:'🧑🏽',  city:'Rio de Janeiro',country:'BR',x:31.5, y:66.0, dreamSummary:'Christ statue coming to life and hugging everyone',  category:'spiritual', mood:'tearful'   },
  { id:'u98', name:'Isabella M.', avatar:'👩🏽',  city:'Quito',        country:'EC', x:23.5, y:55.0, dreamSummary:'Volcano erupting with butterflies and light',        category:'nature',    mood:'magical'   },
  { id:'u99', name:'Miguel T.',   avatar:'🧑🏽',  city:'Caracas',      country:'VE', x:25.5, y:51.0, dreamSummary:'Family dinner table floating over city',             category:'family',    mood:'nostalgic' },
  { id:'u100',name:'Camila S.',   avatar:'👩🏽',  city:'Medellín',     country:'CO', x:24.0, y:55.5, dreamSummary:'Flowers growing from footsteps in the street',       category:'love',      mood:'enchanted' },
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

// ─── World Map SVG Paths (viewBox 0 0 1000 500) ─────────────────────────────
// Equirectangular projection.
// Formula: x = (lon + 180) / 360 * 1000,  y = (90 - lat) / 180 * 500
// Reference points:  London(0,51.5)→x500,y107  NYC(-74,40.7)→x294,y137
//   Tokyo(139.7,35.7)→x888,y151  Sydney(151.2,-33.9)→x920,y344
//   Cairo(31.2,30)→x586,y167  Rio(-43.2,-22.9)→x380,y314
const CONTINENT_PATHS = {
  // ── NORTH AMERICA ──────────────────────────────────────────────────────────
  northAmerica: [
    // Alaska south coast
    'M 47 101 L 53 99 59 97 64 96 70 97 76 96 82 94 86 92 90 90 95 91',
    '100 93 106 92 110 90 114 88 118 90 123 92 128 90 133 87 138 86',
    '142 88 147 90 153 88 158 86 161 84 164 86 168 89',
    // Canada west coast up to Arctic
    '172 88 175 85 178 82 180 78 183 75 186 72 190 69 194 67 198 65',
    '202 63 206 61 210 60 215 59 220 60 225 62 230 63',
    // Northern Canada / Hudson Bay entrance
    '234 60 238 57 242 55 247 53 252 52 257 53 261 56 264 59',
    '267 62 270 65 273 62 276 59 280 56 284 53 288 50 292 52',
    '295 56 297 60 294 64',
    // Hudson Bay (dip south then back north)
    '290 68 286 72 282 76 278 80 275 84 272 87 268 90 265 86',
    '262 82 260 78 262 74 266 70 270 68 274 66 278 64 282 62',
    '286 60 290 58',
    // Labrador coast going south
    '294 62 297 66 300 70 303 66 306 62 309 58 312 56 315 60',
    // East coast heading south
    '312 64 309 68 306 72 304 76 302 80 300 84 298 88 296 92',
    '295 96 294 100 293 104 292 108 291 112 290 116 289 120',
    '288 124 287 128 286 132 285 136',
    // Florida
    '284 140 283 144 282 148 281 152 280 156 279 160 278 164',
    '280 168 283 172 286 176 284 180 280 182 276 180 273 176',
    '270 172',
    // Gulf of Mexico
    '267 170 264 172 260 174 256 172 252 170 248 172 244 175',
    '240 178 236 180 232 182',
    // Mexico south coast & Yucatan
    '228 184 224 186 220 188 218 192 216 196 214 200 212 204',
    '210 208 209 212 208 216 210 218 214 220 218 218 222 215',
    // Central America
    '220 220 218 224 216 228 214 232 212 236 210 240 208 244',
    '206 248',
    // Return north on Pacific side
    '204 244 206 240 208 236 210 232 212 228 214 224 216 220',
    '218 216 216 212 214 208 212 204 210 200 210 196 212 192',
    '214 188 218 184 222 180 226 176 230 172 234 168',
    // Texas coast
    '238 166 242 164 246 162 250 160 254 158 258 156 262 154',
    '266 152 268 148 270 144 272 140 274 136 276 132 278 128',
    // Return north along coast
    '280 124 282 120 284 116 286 112 288 108 290 104 292 100',
    '293 96 294 92 296 88 298 84 300 80 302 76 304 72 306 68',
    '308 64 310 60 306 56 302 52 298 50 294 48 290 46 286 44',
    '282 42 278 41 274 42 270 44 266 47 262 50 258 53 254 56',
    // Arctic return west
    '250 54 246 52 242 50 238 48 234 50 230 53 226 56 222 58',
    '218 56 214 53 210 50 206 48 202 50 198 54 194 58 190 60',
    '186 58 182 55 178 52 174 50 170 52 166 56 162 60 158 62',
    '154 60 150 56 146 54 142 56 138 60 134 64 130 66 126 64',
    '122 60 118 58 114 60 110 64 106 67 102 70 98 68 94 65',
    '90 62 86 60 82 62 78 66 74 70 70 72 66 70 62 68 58 72',
    '54 76 50 80 48 84 46 88 44 92 46 96 47 101 Z',
  ].join(' '),

  // ── SOUTH AMERICA ──────────────────────────────────────────────────────────
  southAmerica: [
    // Colombia/Venezuela Caribbean coast
    'M 280 193 L 284 190 288 188 292 186 296 185 300 184 305 186',
    '310 188 315 190 320 192 325 195 330 193 335 190 340 188',
    '345 189 350 192',
    // Guianas & Amazon mouth
    '354 194 358 192 362 190 366 191 370 194 374 197 378 200',
    '382 204 386 208 390 212',
    // Brazilian NE bulge (Natal)
    '393 215 396 218 398 222 400 226 401 230 400 234 398 238',
    '396 242 394 246',
    // SE Brazil coast
    '392 250 390 254 388 258 386 262 384 266 382 270 380 274',
    '378 278 376 282 374 286 372 290',
    // Uruguay / Rio de la Plata
    '370 294 368 298 366 302 364 306 362 310 360 314',
    // Argentina coast
    '358 318 356 322 354 326 352 330 350 334 348 338 346 342',
    '344 346 342 350 340 354 338 358 336 362',
    // Patagonia
    '334 366 332 370 330 374 328 378 326 382 324 386 322 390',
    // Tierra del Fuego
    '320 394 318 398 316 400 314 402 312 400 310 396',
    // Chile coast going north
    '308 392 307 388 306 384 305 380 304 376 303 372 302 368',
    '301 364 300 360 299 356 298 352 297 348 296 344 295 340',
    '294 336 293 332 292 328 291 324 290 320 289 316 288 312',
    '287 308 286 304 285 300 284 296 283 292 282 288',
    // Peru coast
    '281 284 280 280 279 276 278 272 278 268 278 264 278 260',
    '278 256 278 252 278 248 279 244',
    // Ecuador / Colombia Pacific
    '280 240 280 236 280 232 280 228 280 224 280 220 280 216',
    '280 212 280 208 280 204 280 200 280 196 280 193 Z',
  ].join(' '),

  // ── EUROPE (mainland) ─────────────────────────────────────────────────────
  europe: [
    // NW France / Brittany
    'M 476 101 L 480 104 484 106 488 108 492 110 496 112',
    // Netherlands / Germany / Poland coast
    '500 108 504 106 508 104 512 102 516 100 520 102 524 104',
    '528 106 532 104 536 102 540 104 544 106 548 108',
    // Baltic states
    '550 106 552 104 554 102 556 104 558 108',
    // Black Sea / Turkey border
    '560 112 562 116 564 120 566 124 568 128 570 132',
    // Greece
    '568 136 566 140 564 144 562 148 560 152 558 156',
    '556 154 554 150 552 146 550 142 548 140',
    // Adriatic east coast
    '546 138 544 134 542 130 540 126 538 122 536 118',
    '534 116 532 114 530 112 528 110',
    // South France / Med coast
    '526 112 524 114 522 116 520 118 518 120 516 118',
    '514 116 512 114 510 112 508 110 506 108',
    // France west coast return
    '504 106 502 104 500 106 498 108 496 110 494 108',
    '492 106 490 104 488 102 486 100 484 99 482 100 480 101 478 102 476 101 Z',
  ].join(' '),

  // Iberian Peninsula
  iberia: [
    'M 464 118 L 468 115 472 113 476 112 480 113 484 115 488 118',
    '490 121 492 124 494 128 495 132 494 136 492 140 490 143',
    '488 146 484 148 480 149 476 148 472 146 468 144 466 142',
    '464 140 462 137 460 134 459 131 459 128 460 125 462 122 464 118 Z',
  ].join(' '),

  // Italian Peninsula + Sicily + Sardinia
  italy: [
    'M 510 118 L 512 121 514 124 515 127 516 130 517 133 518 136',
    '519 139 520 142 521 145 522 148 523 151 524 154 523 157',
    '521 160 519 162 517 160 515 157 514 154 515 151 516 148',
    '515 145 514 142 513 139 512 136 511 133 510 130 510 127',
    '510 124 510 121 510 118 Z',
    // Sicily
    'M 516 163 L 520 161 524 162 525 166 522 169 518 169 515 167 516 163 Z',
    // Sardinia
    'M 504 138 L 508 136 510 139 509 143 506 145 503 143 503 140 504 138 Z',
  ].join(' '),

  // Scandinavia
  scandinavia: [
    'M 514 38 L 518 34 522 30 526 27 530 25 534 28 536 32 538 36',
    '540 40 541 44 542 48 543 52 543 56 542 60 541 64 540 68',
    '538 72 536 76 534 78 532 80',
    // Finland
    '536 80 540 78 544 76 548 78 550 82',
    // Return south
    '548 84 546 86 544 88 542 86 540 84 538 82 536 80',
    // Sweden coast south
    '534 78 532 76 530 74 528 72 526 70 524 68 522 66 520 64',
    '518 62 516 60 514 58 512 56 510 54 510 52 512 50 514 48',
    '516 46 516 44 514 42 514 40 514 38 Z',
  ].join(' '),

  // ── AFRICA ─────────────────────────────────────────────────────────────────
  africa: [
    // Morocco coast
    'M 456 152 L 460 150 464 148 468 147 472 146 476 146',
    // North Africa (Tunisia, Libya, Egypt)
    '480 147 484 147 488 148 492 148 496 148 500 149 504 150',
    '508 152 512 154 516 155 520 156 524 158 528 160 532 162',
    '536 164 540 166 544 168 548 170',
    // Sinai & down Red Sea
    '552 172 556 174 558 176 560 178',
    // East Africa (Eritrea, Djibouti, Somalia Horn)
    '562 180 564 182 566 184 568 188 570 192 574 196',
    '578 199 582 196 585 192 587 188 586 184 583 180',
    // Kenya, Tanzania, Mozambique coast
    '580 180 576 184 574 188 572 192 571 196 570 200 568 204',
    '566 208 564 212 562 216 560 220 558 224 556 228 554 232',
    '552 236 550 240 548 244 546 248 544 252 542 256 540 260',
    // Southern Africa
    '538 264 536 268 534 272 532 276 530 280 528 284 526 288',
    '524 292 522 296 520 300 518 304 516 308',
    // Cape
    '514 312 512 316 510 320 508 324 506 327 503 330',
    '500 328 497 326 495 322 494 318',
    // West coast going north (Namibia, Angola)
    '492 314 490 310 488 306 486 302 484 298 482 294 480 290',
    '478 286 476 282 474 278 472 274 470 270 468 266 466 262',
    '464 258 462 254 461 250 460 246 458 242 456 238 454 234',
    '453 230 452 226',
    // Gulf of Guinea (indent then bulge)
    '454 222 456 218 458 214 460 210 462 214 464 218',
    '466 222 468 226 466 230 464 234 462 238',
    // West Africa bulge
    '458 236 454 232 450 228 446 224 442 220 440 216 438 212',
    '436 208 434 204 432 200 431 196 432 192 434 188 436 184',
    '438 180 440 176 442 172 444 168 446 164 448 160 450 156',
    '452 153 456 152 Z',
  ].join(' '),

  // ── ASIA (Russia/Siberia + Central/East Asia) ─────────────────────────────
  asia: [
    // Turkey, Caucasus
    'M 552 108 L 556 106 560 104 564 102 568 100 572 98',
    // Central Asia
    '576 96 580 94 584 92 588 90 592 88 596 86 600 84 604 82',
    '608 80 612 78 616 76 620 74 624 72 628 70 632 68',
    // Siberia
    '636 66 640 64 644 62 648 60 652 58 656 57 660 56 664 56',
    '668 56 672 56 676 57 680 58 684 60 688 62 692 64 696 66',
    '700 68 704 70 708 72 712 74 716 76 720 78 724 80 728 82',
    '732 84 736 86 740 88 744 90 748 92 752 94 756 96 760 98',
    '764 100 768 102 772 104 776 106 780 108',
    // Kamchatka
    '783 106 786 102 789 98 792 94 795 90 797 86 798 82',
    '796 78 793 74 790 72 786 74 784 78 782 82 780 86',
    // Pacific coast south (Siberia → China)
    '778 90 776 94 774 98 772 102 770 106 768 110',
    // China coast
    '766 114 764 118 762 122 760 126 758 130 756 134 754 138',
    '752 142 750 146 748 150 746 154 744 158',
    // Vietnam area
    '742 162 740 166 738 170 736 174 734 178 732 182 730 186',
    '728 188 726 184 724 180 722 176',
    // Return west through interior
    '720 172 716 168 712 164 708 160 704 156 700 152 696 148',
    '692 144 688 140 684 136 680 132 676 128 672 124 668 120',
    '664 118 660 116 656 114 652 112 648 110 644 108 640 107',
    '636 106 632 105 628 104 624 103 620 102 616 100 612 98',
    '608 96 604 94 600 92 596 92 592 94 588 96 584 98',
    '580 100 576 102 572 104 568 106 564 108 560 108 556 108 552 108 Z',
  ].join(' '),

  // Arabian Peninsula
  arabia: [
    'M 580 162 L 584 159 588 156 592 154 596 153 600 154 604 156',
    '608 160 612 164 615 168 618 172 620 176 622 180 623 184',
    '621 188 618 192 614 194 610 193 606 190 602 186 598 182',
    '594 178 590 174 586 170 583 166 580 163 580 162 Z',
  ].join(' '),

  // Indian subcontinent
  india: [
    'M 672 148 L 676 144 680 142 684 140 688 139 692 140 696 142',
    '700 145 703 148 706 152 708 156 710 160 712 164 714 168',
    '715 172 716 176 716 180 714 184 712 188 710 192 708 196',
    '706 200 704 204 700 208 696 210 692 208 688 204 685 200',
    '682 196 680 192 678 188 676 184 674 180 673 176 672 172',
    '671 168 670 164 670 160 670 156 671 152 672 148 Z',
  ].join(' '),

  // Southeast Asia mainland
  indochina: [
    'M 736 150 L 740 146 744 144 748 146 750 150 752 154 754 158',
    '756 162 758 166 756 170 754 174 752 178 750 182 748 186',
    '746 190 744 194 742 198 740 202 738 206 736 210 734 214',
    '732 218 730 222 728 226 726 228',
    '724 224 722 220 720 216 720 212 722 208 724 204 726 200',
    '726 196 724 192 722 188 722 184 724 180 726 176 728 172',
    '730 168 732 164 734 160 736 156 736 152 736 150 Z',
  ].join(' '),

  // ── AUSTRALIA ──────────────────────────────────────────────────────────────
  oceania: [
    // Cape York
    'M 870 290 L 874 286 878 283 882 281 886 280 890 282',
    '894 284 897 286 900 282 903 280 906 282 909 286',
    // East coast
    '912 290 914 294 916 298 918 302 919 306 920 310 920 314',
    '920 318 919 322 918 326 916 330 914 334 912 338 910 342',
    // SE corner
    '908 346 905 348 902 350 899 352 896 354 892 356 888 358',
    // South coast
    '884 356 880 354 876 352 872 350 868 352 864 356 860 358',
    '856 358 852 356 848 354',
    // Great Australian Bight
    '844 356 840 358 836 360 832 358 828 356 824 354 820 352',
    // West coast going north
    '818 350 816 346 814 342 812 338 810 334 810 330 810 326',
    '812 322 814 318 816 314 818 310 820 306 822 302',
    // NW coast
    '826 298 830 296 834 294 838 292 842 290 846 288 850 286',
    '854 284 858 283 862 284 866 286 870 290 Z',
    // Tasmania
    'M 908 360 L 912 358 916 360 916 364 912 366 908 364 908 360 Z',
  ].join(' '),

  // ── GREENLAND ──────────────────────────────────────────────────────────────
  greenland: [
    'M 330 18 L 335 14 340 10 346 7 352 5 358 4 364 5 370 8',
    '375 12 378 18 380 24 382 30 382 36 380 42 378 48 374 54',
    '370 58 366 62 362 66 358 68 354 70 350 70 346 68 342 66',
    '338 62 334 58 330 54 328 50 326 46 324 42 324 38 324 34',
    '326 30 328 26 330 22 330 18 Z',
  ].join(' '),

  // ── GREAT BRITAIN ─────────────────────────────────────────────────────────
  greatBritain: [
    'M 494 82 L 498 78 501 76 504 78 505 82 506 86 505 90',
    '504 94 502 98 500 101 498 103 496 101 494 98 492 95',
    '491 92 490 89 490 86 492 84 494 82 Z',
  ].join(' '),

  // Ireland
  ireland: [
    'M 484 86 L 488 83 490 86 490 90 488 94 486 96 484 94',
    '482 92 482 89 484 86 Z',
  ].join(' '),

  // ── ICELAND ────────────────────────────────────────────────────────────────
  iceland: [
    'M 434 54 L 438 50 443 49 448 50 452 52 454 56 452 60',
    '448 62 443 63 438 62 435 59 434 56 434 54 Z',
  ].join(' '),

  // ── JAPAN ──────────────────────────────────────────────────────────────────
  japan: [
    // Hokkaido
    'M 878 105 L 882 101 887 99 891 101 893 105 891 109 887 112',
    '883 112 879 110 878 107 878 105 Z',
    // Honshu
    'M 876 116 L 880 112 884 110 888 112 892 116 894 120 895 124',
    '894 128 892 132 889 136 886 138 882 138 878 136 876 132',
    '874 128 874 124 874 120 876 116 Z',
    // Shikoku
    'M 884 140 L 888 138 890 141 888 144 885 145 883 143 884 140 Z',
    // Kyushu
    'M 876 139 L 880 137 883 140 882 144 879 146 876 144 875 141 876 139 Z',
  ].join(' '),

  // Korea Peninsula
  korea: [
    'M 854 114 L 858 110 862 108 864 112 864 116 862 120 860 124',
    '858 128 856 130 853 128 851 124 851 120 852 116 854 114 Z',
  ].join(' '),

  // ── INDONESIA ──────────────────────────────────────────────────────────────
  indonesia: [
    // Sumatra (NW-SE diagonal)
    'M 772 252 L 778 248 784 246 790 250 795 256 798 262',
    '796 266 792 268 786 266 780 262 776 258 772 254 772 252 Z',
    // Java
    'M 800 270 L 806 268 812 268 818 270 822 272 824 275',
    '820 278 814 278 808 276 802 274 800 272 800 270 Z',
    // Borneo
    'M 808 234 L 814 230 820 228 826 230 830 236 830 242',
    '826 246 820 248 814 246 810 242 808 238 808 234 Z',
    // Sulawesi
    'M 836 240 L 840 236 844 238 844 244 840 248 836 246 836 242 836 240 Z',
    // Papua
    'M 864 248 L 870 244 876 243 882 246 886 252 882 256 876 258',
    '870 256 866 252 864 248 Z',
  ].join(' '),

  // Philippines
  philippines: [
    // Luzon
    'M 840 182 L 844 178 848 180 848 186 846 192 843 196 840 192',
    '839 188 839 184 840 182 Z',
    // Mindanao
    'M 842 200 L 846 197 850 200 850 206 847 210 843 210 841 206',
    '841 203 842 200 Z',
  ].join(' '),

  // ── MADAGASCAR ─────────────────────────────────────────────────────────────
  madagascar: [
    'M 624 308 L 628 302 632 300 634 304 634 310 633 316 632 322',
    '630 328 628 334 626 338 624 340 622 336 620 330 620 324',
    '621 318 622 312 624 308 Z',
  ].join(' '),

  // ── NEW ZEALAND ────────────────────────────────────────────────────────────
  newZealand: [
    // North Island
    'M 986 346 L 990 342 994 340 996 344 996 350 994 356 990 360',
    '986 358 984 354 985 350 986 346 Z',
    // South Island
    'M 978 362 L 982 358 986 356 988 360 988 368 986 374 982 378',
    '978 376 976 372 976 368 978 364 978 362 Z',
  ].join(' '),

  // ── TAIWAN ─────────────────────────────────────────────────────────────────
  taiwan: [
    'M 838 160 L 842 156 845 158 844 164 842 168 839 166 838 162 838 160 Z',
  ].join(' '),

  // ── SRI LANKA ──────────────────────────────────────────────────────────────
  sriLanka: [
    'M 720 218 L 724 214 728 216 728 222 726 226 722 226 720 222 720 218 Z',
  ].join(' '),

  // ── CUBA ───────────────────────────────────────────────────────────────────
  cuba: [
    'M 266 175 L 272 172 278 171 284 170 290 172 294 175',
    '291 178 285 180 279 180 273 179 268 178 266 176 266 175 Z',
  ].join(' '),

  // ── HISPANIOLA ─────────────────────────────────────────────────────────────
  hispaniola: [
    'M 298 176 L 304 174 310 175 312 178 308 180 302 180 298 178 298 176 Z',
  ].join(' '),
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
  const mapFill = isLight ? 'rgba(196,181,253,0.7)' : 'rgba(30,11,74,0.7)';
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
        <div className={`w-full h-full rounded-2xl overflow-hidden border shadow-xl ${isLight ? 'border-purple-200/60 shadow-purple-200/20' : 'border-white/5 shadow-black/40'}`}>

          <svg
            ref={mapRef}
            viewBox="0 0 1000 500"
            className="w-full h-full"
            style={{ background: mapBg }}
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="youGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Graticule grid */}
            {[62.5,125,187.5,250,312.5,375,437.5].map(y => (
              <line key={`gy${y}`} x1="0" y1={y} x2="1000" y2={y}
                stroke={isLight ? '#c4b5fd' : '#2d1b5a'} strokeWidth="0.5" opacity="0.25" />
            ))}
            {[100,200,300,400,500,600,700,800,900].map(x => (
              <line key={`gx${x}`} x1={x} y1="0" x2={x} y2="500"
                stroke={isLight ? '#c4b5fd' : '#2d1b5a'} strokeWidth="0.5" opacity="0.25" />
            ))}

            {/* Continent shapes */}
            <path d={CONTINENT_PATHS.northAmerica}   fill={mapFill} stroke={mapStroke} strokeWidth="1.5" />
            <path d={CONTINENT_PATHS.southAmerica}   fill={mapFill} stroke={mapStroke} strokeWidth="1.5" />
            <path d={CONTINENT_PATHS.europe}         fill={mapFill} stroke={mapStroke} strokeWidth="1.5" />
            <path d={CONTINENT_PATHS.scandinavia}    fill={mapFill} stroke={mapStroke} strokeWidth="1.2" />
            <path d={CONTINENT_PATHS.iberia}         fill={mapFill} stroke={mapStroke} strokeWidth="1.2" />
            <path d={CONTINENT_PATHS.italy}          fill={mapFill} stroke={mapStroke} strokeWidth="1.2" />
            <path d={CONTINENT_PATHS.africa}         fill={mapFill} stroke={mapStroke} strokeWidth="1.5" />
            <path d={CONTINENT_PATHS.asia}           fill={mapFill} stroke={mapStroke} strokeWidth="1.5" />
            <path d={CONTINENT_PATHS.arabia}         fill={mapFill} stroke={mapStroke} strokeWidth="1.2" />
            <path d={CONTINENT_PATHS.india}          fill={mapFill} stroke={mapStroke} strokeWidth="1.2" />
            <path d={CONTINENT_PATHS.indochina}      fill={mapFill} stroke={mapStroke} strokeWidth="1.2" />
            <path d={CONTINENT_PATHS.oceania}        fill={mapFill} stroke={mapStroke} strokeWidth="1.5" />
            {/* Islands */}
            <path d={CONTINENT_PATHS.greenland}      fill={mapFill} stroke={mapStroke} strokeWidth="1" />
            <path d={CONTINENT_PATHS.greatBritain}   fill={mapFill} stroke={mapStroke} strokeWidth="1" />
            <path d={CONTINENT_PATHS.ireland}        fill={mapFill} stroke={mapStroke} strokeWidth="1" />
            <path d={CONTINENT_PATHS.iceland}        fill={mapFill} stroke={mapStroke} strokeWidth="1" />
            <path d={CONTINENT_PATHS.japan}          fill={mapFill} stroke={mapStroke} strokeWidth="1" />
            <path d={CONTINENT_PATHS.korea}          fill={mapFill} stroke={mapStroke} strokeWidth="1" />
            <path d={CONTINENT_PATHS.taiwan}         fill={mapFill} stroke={mapStroke} strokeWidth="1" />
            <path d={CONTINENT_PATHS.indonesia}      fill={mapFill} stroke={mapStroke} strokeWidth="1" />
            <path d={CONTINENT_PATHS.philippines}    fill={mapFill} stroke={mapStroke} strokeWidth="1" />
            <path d={CONTINENT_PATHS.sriLanka}       fill={mapFill} stroke={mapStroke} strokeWidth="1" />
            <path d={CONTINENT_PATHS.madagascar}     fill={mapFill} stroke={mapStroke} strokeWidth="1" />
            <path d={CONTINENT_PATHS.newZealand}     fill={mapFill} stroke={mapStroke} strokeWidth="1" />
            <path d={CONTINENT_PATHS.cuba}           fill={mapFill} stroke={mapStroke} strokeWidth="1" />
            <path d={CONTINENT_PATHS.hispaniola}     fill={mapFill} stroke={mapStroke} strokeWidth="1" />

            {/* Connection lines for top matches (coordinates scaled: x*10, y*6.25) */}
            {filteredUsers
              .filter(u => connectionLines.includes(u.id))
              .map(u => (
                <line
                  key={`line-${u.id}`}
                  x1={500} y1={250}
                  x2={u.x * 10} y2={u.y * 6.25}
                  stroke={matchColor(u.matchPct)}
                  strokeWidth="1"
                  strokeDasharray="12 8"
                  opacity="0.35"
                  className="dm-dash"
                />
              ))
            }

            {/* "You" center marker */}
            <circle cx={500} cy={250} r={8} fill="#a855f7" opacity="0.9" filter="url(#youGlow)" />
            <circle cx={500} cy={250} r={16} fill="none" stroke="#a855f7" strokeWidth="2" opacity="0.4" className="dm-pulse" />

            {/* User markers (coordinates scaled: x*10, y*6.25) */}
            {filteredUsers.map(u => {
              const isPulsing = pulsingIds.includes(u.id);
              const isSelected = selectedUser?.id === u.id;
              const color = matchColor(u.matchPct);
              const mx = u.x * 10;
              const my = u.y * 6.25;
              return (
                <g key={u.id} onClick={() => handleMarkerClick(u)} style={{ cursor: 'pointer' }}>
                  {isPulsing && (
                    <circle cx={mx} cy={my} r={14} fill={color} opacity="0.15" className="dm-pulse" />
                  )}
                  <circle
                    cx={mx} cy={my}
                    r={isSelected ? 8 : 5}
                    fill={color}
                    opacity={0.9}
                    stroke={isSelected ? 'white' : 'rgba(255,255,255,0.4)'}
                    strokeWidth="1.5"
                    filter="url(#markerGlow)"
                    style={{ transition: 'r 0.2s ease' }}
                  />
                  {isSelected && (
                    <text x={mx} y={my - 16} fontSize="16" textAnchor="middle" fill="white"
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
