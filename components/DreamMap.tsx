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

// ─── World Map SVG Paths (realistic continents, viewBox 0 0 100 80) ───────────
const CONTINENT_PATHS = {
  // North America - Alaska, Canada, USA with Great Lakes, Florida
  northAmerica: `
    M 5.5 10.5
    C 5.0 9.8, 4.5 9.5, 4.0 10.0
    C 3.5 10.5, 3.0 11.5, 3.5 12.0
    C 4.0 12.5, 5.0 12.5, 5.5 12.0
    L 6.0 12.5
    C 6.5 13.0, 7.0 12.5, 7.5 12.0
    C 8.0 11.5, 8.5 11.0, 9.0 11.2
    C 9.8 11.5, 10.5 11.0, 11.0 10.5
    C 11.5 10.0, 12.5 9.5, 13.5 9.5
    C 14.5 9.5, 15.5 9.0, 16.5 8.5
    C 17.5 8.0, 18.5 8.0, 19.5 8.5
    C 20.5 9.0, 21.0 9.5, 21.5 10.5
    C 22.0 11.5, 22.5 12.0, 22.0 13.0
    C 21.5 14.0, 21.0 14.5, 21.5 15.5
    C 22.0 16.5, 22.5 17.0, 22.5 18.0
    C 22.5 19.0, 22.0 19.5, 22.5 20.5
    C 23.0 21.5, 23.5 22.0, 23.5 23.0
    C 23.5 24.0, 23.0 24.5, 22.5 25.0
    C 22.0 25.5, 21.5 26.0, 21.5 27.0
    C 21.5 28.0, 22.0 28.5, 21.5 29.5
    C 21.0 30.5, 20.5 31.0, 20.5 32.0
    C 20.5 33.0, 20.0 33.5, 19.5 34.0
    C 19.0 34.5, 18.5 34.5, 18.0 35.0
    C 17.5 35.5, 17.0 36.0, 16.5 36.5
    C 16.0 37.0, 15.5 37.5, 15.0 37.5
    C 14.5 37.5, 14.0 37.0, 13.5 37.5
    C 13.0 38.0, 12.5 39.0, 12.0 39.5
    C 11.5 40.0, 11.0 40.5, 10.5 40.0
    C 10.0 39.5, 9.5 39.0, 9.0 38.5
    C 8.5 38.0, 8.0 37.5, 7.5 37.0
    C 7.0 36.5, 7.0 35.5, 7.0 34.5
    C 7.0 33.5, 7.0 32.5, 7.0 31.5
    C 7.0 30.5, 7.0 29.5, 7.0 28.5
    C 7.0 27.5, 7.0 26.5, 7.0 25.5
    C 7.0 24.5, 7.0 23.5, 6.5 22.5
    C 6.0 21.5, 5.5 20.5, 5.5 19.5
    C 5.5 18.5, 5.5 17.5, 5.5 16.5
    C 5.5 15.5, 5.5 14.5, 5.5 13.5
    C 5.5 12.5, 5.5 11.5, 5.5 10.5 Z`,

  // Florida peninsula
  floridaMex: `
    M 19.5 34.0
    C 20.0 34.5, 20.5 35.0, 20.8 35.8
    C 21.0 36.5, 21.2 37.0, 21.0 37.5
    C 20.8 38.0, 20.5 38.3, 20.0 38.5
    C 19.5 38.7, 19.0 38.5, 18.8 38.0
    C 18.5 37.5, 18.5 37.0, 18.5 36.5
    C 18.5 36.0, 18.8 35.5, 19.0 35.0
    C 19.2 34.5, 19.3 34.2, 19.5 34.0 Z`,

  // Mexico & Central America
  centralAmerica: `
    M 12.0 39.5
    C 12.5 40.0, 13.0 40.5, 13.5 41.0
    C 14.0 41.5, 14.5 42.0, 15.0 42.5
    C 15.5 43.0, 16.0 43.5, 16.5 44.0
    C 17.0 44.5, 17.5 44.5, 18.0 44.8
    C 18.5 45.0, 19.0 45.2, 19.5 45.5
    C 20.0 45.8, 20.2 46.0, 20.5 46.2
    C 20.8 46.5, 21.0 46.5, 21.5 46.8
    C 22.0 47.0, 22.5 47.0, 22.5 47.5
    C 22.5 48.0, 22.0 48.0, 21.5 47.5
    C 21.0 47.0, 20.5 47.0, 20.0 47.0
    C 19.5 47.0, 19.0 47.5, 18.5 47.0
    C 18.0 46.5, 17.5 46.0, 17.0 45.5
    C 16.5 45.0, 16.0 44.5, 15.5 44.0
    C 15.0 43.5, 14.5 43.0, 14.0 42.5
    C 13.5 42.0, 13.0 41.5, 12.5 41.0
    C 12.0 40.5, 11.5 40.0, 12.0 39.5 Z`,

  // South America - Amazon bulge, Andes west, Patagonia taper
  southAmerica: `
    M 23.0 48.0
    C 24.0 47.0, 25.0 46.5, 26.5 46.5
    C 28.0 46.5, 29.5 47.0, 30.5 47.5
    C 31.5 48.0, 32.5 48.5, 33.5 49.5
    C 34.5 50.5, 35.0 51.5, 35.5 52.5
    C 36.0 53.5, 36.0 54.5, 35.8 55.5
    C 35.5 56.5, 35.5 57.5, 35.0 58.5
    C 34.5 59.5, 34.0 60.5, 33.5 61.5
    C 33.0 62.5, 32.5 63.5, 32.0 64.5
    C 31.5 65.5, 31.0 66.5, 30.5 67.5
    C 30.0 68.5, 29.5 69.5, 29.0 70.5
    C 28.5 71.5, 28.0 72.0, 27.5 73.0
    C 27.0 74.0, 26.5 74.5, 26.0 75.0
    C 25.5 75.5, 25.0 76.0, 24.5 76.5
    C 24.0 77.0, 23.5 77.5, 23.0 77.5
    C 22.5 77.5, 22.0 77.0, 22.0 76.0
    C 22.0 75.0, 22.0 74.0, 22.5 73.0
    C 23.0 72.0, 23.0 71.0, 22.5 70.0
    C 22.0 69.0, 22.0 68.0, 22.0 67.0
    C 22.0 66.0, 22.0 65.0, 22.0 64.0
    C 22.0 63.0, 22.0 62.0, 21.5 61.0
    C 21.0 60.0, 21.0 59.0, 21.0 58.0
    C 21.0 57.0, 21.0 56.0, 21.0 55.0
    C 21.0 54.0, 21.0 53.0, 21.5 52.0
    C 22.0 51.0, 22.0 50.0, 22.5 49.0
    C 22.5 48.5, 22.5 48.2, 23.0 48.0 Z`,

  // Europe - Scandinavia, France, Italy boot, Balkans, Iberia
  europe: `
    M 47.0 10.0
    C 47.5 9.0, 48.5 8.0, 49.5 7.5
    C 50.5 7.0, 51.5 7.5, 52.0 8.5
    C 52.5 9.5, 53.0 10.0, 53.5 10.5
    C 54.0 11.0, 54.5 11.0, 55.0 11.5
    C 55.5 12.0, 55.5 12.5, 55.5 13.0
    C 55.5 13.5, 55.0 14.0, 55.5 14.5
    C 56.0 15.0, 56.5 14.5, 57.0 15.0
    C 57.5 15.5, 57.5 16.0, 57.0 16.5
    C 56.5 17.0, 56.0 17.5, 55.5 18.0
    C 55.0 18.5, 54.5 19.0, 54.0 19.5
    C 53.5 20.0, 53.0 20.5, 52.5 21.0
    C 52.0 21.5, 51.5 22.0, 51.0 22.5
    C 50.5 23.0, 50.5 23.5, 51.0 24.0
    C 51.5 24.5, 52.0 25.0, 52.5 25.5
    C 53.0 26.0, 53.5 26.0, 54.0 26.5
    C 54.5 27.0, 55.0 27.0, 55.0 27.5
    C 55.0 28.0, 54.5 28.0, 54.0 27.5
    C 53.5 27.0, 53.0 27.0, 52.5 27.0
    C 52.0 27.0, 51.5 27.0, 51.0 26.5
    C 50.5 26.0, 50.0 25.5, 49.5 25.5
    C 49.0 25.5, 48.5 26.0, 48.0 26.0
    C 47.5 26.0, 47.0 25.5, 46.5 25.0
    C 46.0 24.5, 45.5 24.0, 45.0 23.5
    C 44.5 23.0, 44.0 22.5, 44.0 22.0
    C 44.0 21.5, 44.5 21.0, 44.5 20.5
    C 44.5 20.0, 44.0 19.5, 44.0 19.0
    C 44.0 18.5, 44.5 18.0, 44.5 17.5
    C 44.5 17.0, 44.0 16.5, 44.5 16.0
    C 45.0 15.5, 45.5 15.5, 45.5 15.0
    C 45.5 14.5, 45.0 14.0, 45.0 13.5
    C 45.0 13.0, 45.5 12.5, 46.0 12.0
    C 46.5 11.5, 46.5 11.0, 46.5 10.5
    C 46.5 10.2, 46.8 10.2, 47.0 10.0 Z`,

  // Iberian Peninsula - Spain/Portugal
  iberia: `
    M 44.0 23.5
    C 44.5 23.0, 45.0 22.5, 45.5 22.5
    C 46.0 22.5, 46.5 22.5, 47.0 23.0
    C 47.5 23.5, 48.0 24.0, 48.0 24.5
    C 48.0 25.0, 47.5 25.5, 47.0 26.0
    C 46.5 26.5, 46.0 27.0, 45.5 27.5
    C 45.0 28.0, 44.5 28.0, 44.0 27.5
    C 43.5 27.0, 43.0 26.5, 43.0 26.0
    C 43.0 25.5, 43.0 25.0, 43.5 24.5
    C 43.5 24.0, 43.8 23.8, 44.0 23.5 Z`,

  // Italy boot
  italy: `
    M 50.5 23.5
    C 51.0 24.0, 51.5 24.5, 51.5 25.0
    C 51.5 25.5, 51.5 26.0, 52.0 26.5
    C 52.5 27.0, 52.5 27.5, 52.0 28.0
    C 51.5 28.5, 51.0 28.5, 50.5 28.0
    C 50.0 27.5, 50.0 27.0, 50.5 26.5
    C 51.0 26.0, 50.5 25.5, 50.0 25.0
    C 49.5 24.5, 50.0 24.0, 50.5 23.5 Z`,

  // Scandinavia - Norway/Sweden
  scandinavia: `
    M 49.5 7.5
    C 50.0 6.5, 50.5 5.5, 51.0 5.0
    C 51.5 4.5, 52.0 4.0, 52.5 4.5
    C 53.0 5.0, 53.5 5.5, 54.0 6.0
    C 54.5 6.5, 55.0 7.0, 55.5 7.5
    C 56.0 8.0, 56.0 8.5, 55.5 9.0
    C 55.0 9.5, 54.5 10.0, 54.0 10.5
    C 53.5 11.0, 53.0 11.5, 52.5 11.5
    C 52.0 11.5, 51.5 11.0, 51.0 10.5
    C 50.5 10.0, 50.0 9.5, 49.5 9.0
    C 49.0 8.5, 49.2 8.0, 49.5 7.5 Z`,

  // Africa - realistic outline with Gulf of Guinea, Horn, taper south
  africa: `
    M 44.5 28.0
    C 45.5 27.5, 46.5 27.0, 47.5 27.0
    C 48.5 27.0, 49.5 27.0, 50.5 27.0
    C 51.5 27.0, 52.5 27.0, 53.5 27.5
    C 54.5 28.0, 55.5 28.5, 56.5 29.0
    C 57.5 29.5, 58.0 30.0, 58.5 31.0
    C 59.0 32.0, 59.5 33.0, 60.0 34.0
    C 60.5 35.0, 60.5 36.0, 60.5 37.0
    C 60.5 38.0, 60.5 39.0, 60.5 40.0
    C 60.5 41.0, 60.0 42.0, 59.5 43.0
    C 59.0 44.0, 58.5 45.0, 58.0 46.0
    C 57.5 47.0, 57.0 48.0, 56.5 49.0
    C 56.0 50.0, 55.5 51.0, 55.0 52.0
    C 54.5 53.0, 54.0 54.0, 53.5 55.0
    C 53.0 56.0, 52.5 57.0, 52.0 58.0
    C 51.5 59.0, 51.0 60.0, 50.5 61.0
    C 50.0 62.0, 49.5 62.5, 49.5 63.0
    C 49.5 63.5, 50.0 64.0, 50.5 64.5
    C 51.0 65.0, 51.0 65.5, 50.5 66.0
    C 50.0 66.5, 49.5 66.5, 49.0 66.0
    C 48.5 65.5, 48.5 65.0, 48.5 64.5
    C 48.5 64.0, 48.0 63.5, 47.5 63.0
    C 47.0 62.5, 46.5 62.0, 46.0 61.5
    C 45.5 61.0, 45.5 60.5, 46.0 60.0
    C 46.5 59.5, 46.5 59.0, 46.5 58.5
    C 46.5 58.0, 46.0 57.5, 45.5 57.0
    C 45.0 56.5, 44.5 56.0, 44.0 55.5
    C 43.5 55.0, 43.5 54.5, 43.5 54.0
    C 43.5 53.5, 43.5 53.0, 43.0 52.5
    C 42.5 52.0, 42.5 51.5, 42.5 51.0
    C 42.5 50.5, 42.5 50.0, 42.5 49.5
    C 42.5 49.0, 43.0 48.5, 43.0 48.0
    C 43.0 47.5, 42.5 47.0, 42.5 46.5
    C 42.5 46.0, 43.0 45.0, 43.0 44.0
    C 43.0 43.0, 42.5 42.0, 42.5 41.0
    C 42.5 40.0, 43.0 39.0, 43.5 38.0
    C 44.0 37.0, 44.0 36.0, 43.5 35.0
    C 43.0 34.0, 42.5 33.0, 42.5 32.0
    C 42.5 31.0, 43.0 30.0, 43.5 29.0
    C 44.0 28.5, 44.2 28.2, 44.5 28.0 Z`,

  // Horn of Africa
  hornAfrica: `
    M 60.5 37.0
    C 61.0 36.5, 61.5 36.0, 62.0 36.0
    C 62.5 36.0, 63.0 36.5, 63.5 37.0
    C 64.0 37.5, 64.5 38.0, 64.5 38.5
    C 64.5 39.0, 64.0 39.5, 63.5 39.5
    C 63.0 39.5, 62.5 39.5, 62.0 39.0
    C 61.5 38.5, 61.0 38.0, 60.5 37.5
    C 60.0 37.2, 60.2 37.2, 60.5 37.0 Z`,

  // Asia - Russia across top, China, Korea peninsula
  asia: `
    M 57.0 15.0
    C 58.0 14.0, 59.0 13.0, 60.0 12.0
    C 61.0 11.0, 62.0 10.5, 63.0 10.0
    C 64.0 9.5, 65.0 9.0, 66.0 8.5
    C 67.0 8.0, 68.0 7.5, 69.5 7.0
    C 71.0 6.5, 72.5 6.0, 74.0 6.0
    C 75.5 6.0, 77.0 6.0, 78.5 6.5
    C 80.0 7.0, 81.5 7.5, 83.0 8.0
    C 84.5 8.5, 86.0 9.0, 87.0 10.0
    C 88.0 11.0, 89.0 12.0, 89.5 13.0
    C 90.0 14.0, 90.5 15.0, 90.5 16.0
    C 90.5 17.0, 90.0 18.0, 89.5 19.0
    C 89.0 20.0, 88.5 20.5, 88.0 21.0
    C 87.5 21.5, 87.0 22.0, 86.5 22.5
    C 86.0 23.0, 85.5 23.5, 85.0 24.0
    C 84.5 24.5, 84.0 25.0, 83.5 25.5
    C 83.0 26.0, 82.5 26.5, 82.0 27.0
    C 81.5 27.5, 81.0 28.0, 80.5 28.0
    C 80.0 28.0, 79.5 27.5, 79.0 27.5
    C 78.5 27.5, 78.0 28.0, 77.5 28.5
    C 77.0 29.0, 76.5 29.5, 76.0 30.0
    C 75.5 30.5, 75.0 31.0, 74.5 31.0
    C 74.0 31.0, 73.5 30.5, 73.0 30.5
    C 72.5 30.5, 72.0 31.0, 71.5 31.0
    C 71.0 31.0, 70.5 30.5, 70.0 30.0
    C 69.5 29.5, 69.0 29.0, 68.5 29.0
    C 68.0 29.0, 67.5 29.5, 67.0 29.5
    C 66.5 29.5, 66.0 29.0, 65.5 28.5
    C 65.0 28.0, 64.5 28.0, 64.0 28.0
    C 63.5 28.0, 63.0 28.5, 62.5 28.5
    C 62.0 28.5, 61.5 28.0, 61.0 27.5
    C 60.5 27.0, 60.0 26.5, 59.5 26.0
    C 59.0 25.5, 58.5 25.0, 58.0 24.5
    C 57.5 24.0, 57.0 23.5, 57.0 23.0
    C 57.0 22.5, 57.5 22.0, 57.5 21.5
    C 57.5 21.0, 57.0 20.5, 57.0 20.0
    C 57.0 19.5, 57.0 19.0, 57.0 18.5
    C 57.0 18.0, 57.0 17.5, 57.0 17.0
    C 57.0 16.5, 57.0 16.0, 57.0 15.5
    C 57.0 15.2, 57.0 15.0, 57.0 15.0 Z`,

  // Arabian Peninsula
  arabia: `
    M 59.0 30.0
    C 59.5 29.5, 60.0 29.0, 60.5 29.0
    C 61.0 29.0, 61.5 29.5, 62.0 30.0
    C 62.5 30.5, 63.0 31.0, 63.5 31.5
    C 64.0 32.0, 64.5 32.5, 64.5 33.0
    C 64.5 33.5, 64.5 34.0, 64.0 34.5
    C 63.5 35.0, 63.0 35.5, 62.5 36.0
    C 62.0 36.5, 61.5 36.5, 61.0 36.5
    C 60.5 36.5, 60.0 36.0, 59.5 35.5
    C 59.0 35.0, 58.5 34.5, 58.0 34.0
    C 57.5 33.5, 57.5 33.0, 57.5 32.5
    C 57.5 32.0, 58.0 31.5, 58.5 31.0
    C 58.5 30.5, 58.8 30.2, 59.0 30.0 Z`,

  // Indian subcontinent - triangular with Sri Lanka implied
  india: `
    M 67.5 30.0
    C 68.0 30.0, 68.5 30.5, 69.0 31.0
    C 69.5 31.5, 70.0 32.0, 70.5 32.5
    C 71.0 33.0, 71.5 33.5, 72.0 34.0
    C 72.5 34.5, 73.0 35.0, 73.0 35.5
    C 73.0 36.0, 73.0 36.5, 73.0 37.0
    C 73.0 37.5, 72.5 38.0, 72.0 38.5
    C 71.5 39.0, 71.0 39.5, 70.5 40.0
    C 70.0 40.5, 69.5 41.0, 69.0 41.5
    C 68.5 42.0, 68.0 42.0, 67.5 41.5
    C 67.0 41.0, 66.5 40.5, 66.5 40.0
    C 66.5 39.5, 66.5 39.0, 66.5 38.5
    C 66.5 38.0, 66.5 37.5, 66.5 37.0
    C 66.5 36.5, 66.5 36.0, 66.5 35.5
    C 66.5 35.0, 66.5 34.5, 66.5 34.0
    C 66.5 33.5, 66.5 33.0, 67.0 32.5
    C 67.0 32.0, 67.0 31.5, 67.0 31.0
    C 67.0 30.5, 67.2 30.2, 67.5 30.0 Z`,

  // Southeast Asia mainland (Indochina/Thailand/Vietnam)
  indochina: `
    M 75.0 31.0
    C 75.5 31.0, 76.0 31.5, 76.5 32.0
    C 77.0 32.5, 77.5 33.0, 78.0 33.5
    C 78.5 34.0, 79.0 34.5, 79.0 35.0
    C 79.0 35.5, 79.0 36.0, 78.5 36.5
    C 78.0 37.0, 77.5 37.5, 77.0 38.0
    C 76.5 38.5, 76.0 39.0, 75.5 39.5
    C 75.0 40.0, 75.0 40.5, 75.5 41.0
    C 76.0 41.5, 76.5 41.5, 77.0 42.0
    C 77.5 42.5, 77.5 43.0, 77.0 43.5
    C 76.5 44.0, 76.0 44.0, 75.5 43.5
    C 75.0 43.0, 74.5 42.5, 74.0 42.0
    C 73.5 41.5, 73.5 41.0, 73.5 40.5
    C 73.5 40.0, 73.5 39.5, 74.0 39.0
    C 74.0 38.5, 74.0 38.0, 74.0 37.5
    C 74.0 37.0, 74.0 36.5, 74.0 36.0
    C 74.0 35.5, 74.0 35.0, 74.0 34.5
    C 74.0 34.0, 74.0 33.5, 74.0 33.0
    C 74.0 32.5, 74.0 32.0, 74.5 31.5
    C 74.5 31.2, 74.8 31.0, 75.0 31.0 Z`,

  // Australia
  oceania: `
    M 79.0 57.0
    C 80.0 56.0, 81.0 55.5, 82.5 55.5
    C 84.0 55.5, 85.5 56.0, 87.0 56.5
    C 88.5 57.0, 89.5 57.5, 90.0 58.5
    C 90.5 59.5, 91.0 60.5, 91.0 61.5
    C 91.0 62.5, 91.0 63.5, 91.0 64.5
    C 91.0 65.5, 90.5 66.5, 90.0 67.5
    C 89.5 68.5, 89.0 69.0, 88.5 69.5
    C 88.0 70.0, 87.5 70.5, 87.0 70.5
    C 86.5 70.5, 86.0 70.5, 85.5 70.5
    C 85.0 70.5, 84.5 70.5, 84.0 70.0
    C 83.5 69.5, 83.0 69.0, 82.5 68.5
    C 82.0 68.0, 81.5 67.5, 81.0 67.0
    C 80.5 66.5, 80.0 66.0, 79.5 65.5
    C 79.0 65.0, 78.5 64.5, 78.5 64.0
    C 78.5 63.5, 78.5 63.0, 78.5 62.5
    C 78.5 62.0, 78.5 61.5, 78.5 61.0
    C 78.5 60.5, 78.5 60.0, 78.5 59.5
    C 78.5 59.0, 78.5 58.5, 78.5 58.0
    C 78.5 57.5, 78.8 57.2, 79.0 57.0 Z`,

  // Greenland
  greenland: `
    M 30.0 2.5
    C 31.0 1.5, 32.0 1.0, 33.0 1.0
    C 34.0 1.0, 35.0 1.0, 36.0 1.5
    C 37.0 2.0, 37.5 2.5, 38.0 3.5
    C 38.5 4.5, 38.5 5.5, 38.5 6.5
    C 38.5 7.5, 38.0 8.5, 37.5 9.5
    C 37.0 10.5, 36.5 11.0, 36.0 11.5
    C 35.5 12.0, 35.0 12.5, 34.5 12.5
    C 34.0 12.5, 33.5 12.5, 33.0 12.0
    C 32.5 11.5, 32.0 11.0, 31.5 10.5
    C 31.0 10.0, 30.5 9.5, 30.0 9.0
    C 29.5 8.5, 29.0 7.5, 29.0 6.5
    C 29.0 5.5, 29.0 4.5, 29.5 3.5
    C 29.8 3.0, 29.8 2.8, 30.0 2.5 Z`,

  // Great Britain
  greatBritain: `
    M 46.0 12.0
    C 46.2 11.5, 46.5 11.0, 47.0 10.8
    C 47.5 10.5, 47.8 10.8, 48.0 11.5
    C 48.2 12.0, 48.2 12.5, 48.0 13.0
    C 47.8 13.5, 47.5 14.0, 47.2 14.5
    C 47.0 15.0, 46.8 15.5, 46.5 15.8
    C 46.2 16.0, 45.8 16.0, 45.5 15.5
    C 45.2 15.0, 45.0 14.5, 45.0 14.0
    C 45.0 13.5, 45.2 13.0, 45.5 12.5
    C 45.7 12.2, 45.8 12.0, 46.0 12.0 Z`,

  // Ireland
  ireland: `
    M 44.5 14.0
    C 44.8 13.5, 45.2 13.5, 45.2 14.0
    C 45.2 14.5, 45.0 15.0, 44.8 15.5
    C 44.5 16.0, 44.2 16.0, 44.0 15.5
    C 43.8 15.0, 44.0 14.5, 44.5 14.0 Z`,

  // Japan (Honshu + Hokkaido + Kyushu)
  japan: `
    M 84.0 19.0
    C 84.5 18.5, 85.0 18.5, 85.5 19.0
    C 86.0 19.5, 86.0 20.0, 85.5 20.5
    C 85.0 21.0, 84.5 21.0, 84.0 20.5
    C 83.5 20.0, 83.5 19.5, 84.0 19.0 Z
    M 83.5 21.5
    C 84.0 21.0, 84.5 21.0, 85.0 21.5
    C 85.5 22.0, 86.0 22.5, 86.0 23.0
    C 86.0 23.5, 85.5 24.0, 85.0 24.5
    C 84.5 25.0, 84.0 25.0, 83.5 24.5
    C 83.0 24.0, 83.0 23.5, 83.0 23.0
    C 83.0 22.5, 83.2 22.0, 83.5 21.5 Z
    M 82.5 25.0
    C 83.0 24.8, 83.5 25.0, 83.5 25.5
    C 83.5 26.0, 83.0 26.5, 82.5 26.5
    C 82.0 26.5, 82.0 26.0, 82.0 25.5
    C 82.0 25.2, 82.2 25.0, 82.5 25.0 Z`,

  // Korea
  korea: `
    M 81.0 22.0
    C 81.5 21.5, 82.0 21.5, 82.0 22.0
    C 82.0 22.5, 82.0 23.0, 81.5 23.5
    C 81.0 24.0, 80.5 24.5, 80.5 25.0
    C 80.5 25.5, 80.5 25.5, 80.0 25.5
    C 79.5 25.5, 79.5 25.0, 80.0 24.5
    C 80.5 24.0, 80.5 23.5, 80.5 23.0
    C 80.5 22.5, 80.8 22.2, 81.0 22.0 Z`,

  // Indonesia (Sumatra + Java + Borneo arc)
  indonesia: `
    M 75.5 48.0
    C 76.0 47.5, 77.0 47.5, 78.0 48.0
    C 79.0 48.5, 79.5 49.0, 79.5 49.5
    C 79.5 50.0, 79.0 50.5, 78.5 50.5
    C 78.0 50.5, 77.5 50.5, 77.0 50.5
    C 76.5 50.5, 76.0 50.0, 75.5 49.5
    C 75.0 49.0, 75.2 48.5, 75.5 48.0 Z
    M 79.0 50.5
    C 79.5 50.0, 80.0 50.0, 80.5 50.5
    C 81.0 51.0, 81.5 51.5, 82.0 51.5
    C 82.5 51.5, 83.0 51.0, 83.5 51.5
    C 84.0 52.0, 83.5 52.5, 83.0 52.5
    C 82.5 52.5, 82.0 52.5, 81.5 52.5
    C 81.0 52.5, 80.5 52.0, 80.0 51.5
    C 79.5 51.0, 79.2 50.8, 79.0 50.5 Z`,

  // Philippines
  philippines: `
    M 81.5 36.5
    C 82.0 36.0, 82.5 36.0, 82.5 36.5
    C 82.5 37.0, 82.5 37.5, 82.5 38.0
    C 82.5 38.5, 82.0 39.0, 81.5 39.5
    C 81.0 40.0, 81.0 40.5, 81.0 41.0
    C 81.0 41.5, 80.5 41.5, 80.5 41.0
    C 80.5 40.5, 80.5 40.0, 81.0 39.5
    C 81.0 39.0, 81.0 38.5, 81.0 38.0
    C 81.0 37.5, 81.2 37.0, 81.5 36.5 Z`,

  // Madagascar
  madagascar: `
    M 62.5 52.0
    C 63.0 51.5, 63.5 51.5, 63.8 52.0
    C 64.0 52.5, 64.0 53.0, 64.0 53.5
    C 64.0 54.0, 64.0 54.5, 64.0 55.0
    C 64.0 55.5, 63.5 56.0, 63.0 56.5
    C 62.5 57.0, 62.0 57.0, 62.0 56.5
    C 62.0 56.0, 62.0 55.5, 62.0 55.0
    C 62.0 54.5, 62.0 54.0, 62.0 53.5
    C 62.0 53.0, 62.2 52.5, 62.5 52.0 Z`,

  // New Zealand (North + South)
  newZealand: `
    M 92.0 68.0
    C 92.5 67.5, 93.0 67.5, 93.0 68.0
    C 93.0 68.5, 93.0 69.0, 92.5 69.5
    C 92.0 70.0, 91.5 70.0, 91.5 69.5
    C 91.5 69.0, 91.8 68.5, 92.0 68.0 Z
    M 91.5 70.5
    C 92.0 70.0, 92.5 70.0, 92.5 70.5
    C 92.5 71.0, 92.5 71.5, 92.0 72.0
    C 91.5 72.5, 91.0 73.0, 90.5 73.0
    C 90.0 73.0, 90.0 72.5, 90.5 72.0
    C 91.0 71.5, 91.2 71.0, 91.5 70.5 Z`,

  // Taiwan
  taiwan: `
    M 81.5 30.5
    C 82.0 30.0, 82.5 30.0, 82.5 30.5
    C 82.5 31.0, 82.0 31.5, 81.5 31.5
    C 81.0 31.5, 81.2 31.0, 81.5 30.5 Z`,

  // Sri Lanka
  sriLanka: `
    M 71.5 43.0
    C 72.0 42.5, 72.5 42.5, 72.5 43.0
    C 72.5 43.5, 72.0 44.0, 71.5 44.0
    C 71.0 44.0, 71.2 43.5, 71.5 43.0 Z`,

  // Iceland
  iceland: `
    M 41.5 6.5
    C 42.0 6.0, 42.5 6.0, 43.0 6.0
    C 43.5 6.0, 44.0 6.5, 44.0 7.0
    C 44.0 7.5, 43.5 8.0, 43.0 8.0
    C 42.5 8.0, 42.0 7.5, 41.5 7.0
    C 41.2 6.8, 41.2 6.5, 41.5 6.5 Z`,
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
            viewBox="0 0 100 80"
            className="w-full h-full"
            style={{ background: mapBg }}
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Graticule grid */}
            {[10,20,30,40,50,60,70].map(y => (
              <line key={`gy${y}`} x1="0" y1={y} x2="100" y2={y}
                stroke={isLight ? '#c4b5fd' : '#2d1b5a'} strokeWidth="0.1" opacity="0.35" />
            ))}
            {[10,20,30,40,50,60,70,80,90].map(x => (
              <line key={`gx${x}`} x1={x} y1="0" x2={x} y2="80"
                stroke={isLight ? '#c4b5fd' : '#2d1b5a'} strokeWidth="0.1" opacity="0.35" />
            ))}

            {/* Continent shapes */}
            <path d={CONTINENT_PATHS.northAmerica}   fill={mapFill} stroke={mapStroke} strokeWidth="0.3" />
            <path d={CONTINENT_PATHS.floridaMex}     fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.centralAmerica} fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.southAmerica}   fill={mapFill} stroke={mapStroke} strokeWidth="0.3" />
            <path d={CONTINENT_PATHS.europe}         fill={mapFill} stroke={mapStroke} strokeWidth="0.3" />
            <path d={CONTINENT_PATHS.scandinavia}    fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.iberia}         fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.italy}          fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.africa}         fill={mapFill} stroke={mapStroke} strokeWidth="0.3" />
            <path d={CONTINENT_PATHS.hornAfrica}     fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.asia}           fill={mapFill} stroke={mapStroke} strokeWidth="0.3" />
            <path d={CONTINENT_PATHS.arabia}         fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.india}          fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.indochina}      fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.oceania}        fill={mapFill} stroke={mapStroke} strokeWidth="0.3" />
            {/* Islands */}
            <path d={CONTINENT_PATHS.greenland}      fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.greatBritain}   fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.ireland}        fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.iceland}        fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.japan}          fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.korea}          fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.taiwan}         fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.indonesia}      fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.philippines}    fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.sriLanka}       fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.madagascar}     fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />
            <path d={CONTINENT_PATHS.newZealand}     fill={mapFill} stroke={mapStroke} strokeWidth="0.2" />

            {/* Connection lines for top matches */}
            {filteredUsers
              .filter(u => connectionLines.includes(u.id))
              .map(u => (
                <line
                  key={`line-${u.id}`}
                  x1={50} y1={40}
                  x2={u.x} y2={u.y}
                  stroke={matchColor(u.matchPct)}
                  strokeWidth="0.2"
                  strokeDasharray="2 1.5"
                  opacity="0.4"
                  className="dm-dash"
                />
              ))
            }

            {/* "You" center marker */}
            <circle cx={50} cy={40} r={0.8} fill="#a855f7" opacity="0.9" />
            <circle cx={50} cy={40} r={1.5} fill="none" stroke="#a855f7" strokeWidth="0.3" opacity="0.5" className="dm-pulse" />

            {/* User markers */}
            {filteredUsers.map(u => {
              const isPulsing = pulsingIds.includes(u.id);
              const isSelected = selectedUser?.id === u.id;
              const color = matchColor(u.matchPct);
              return (
                <g key={u.id} onClick={() => handleMarkerClick(u)} style={{ cursor: 'pointer' }}>
                  {isPulsing && (
                    <circle cx={u.x} cy={u.y} r={1.5} fill={color} opacity="0.2" className="dm-pulse" />
                  )}
                  <circle
                    cx={u.x} cy={u.y}
                    r={isSelected ? 1.0 : 0.6}
                    fill={color}
                    opacity={0.85}
                    stroke={isSelected ? 'white' : 'rgba(255,255,255,0.3)'}
                    strokeWidth="0.2"
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
