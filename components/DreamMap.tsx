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
  onSelectParticipant?: (id: string) => void;
  onNavigateToResearch?: () => void;
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
  zh: {
    title: '梦境地图',
    subtitle: '谁做了同样的梦？',
    activedreamers: '活跃梦者',
    similarToday: '今日相似',
    matchestoday: '今日匹配',
    newmatch: '新匹配！',
    from: '来自',
    similarDream: '做了类似的梦',
    connect: '连接',
    matchScore: '匹配分数',
    dreamSummary: '梦境摘要',
    category: '类别',
    mood: '心情',
    close: '关闭',
    filterAll: '全部',
    worldwide: '全球',
    dreamersSimilar: '%的梦者有类似的梦',
    loading: '正在扫描梦者...',
    tapMarker: '点击标记查看匹配详情',
    trendTitle: '最热门梦境主题',
    trendDreamers: '梦者',
    showTrends: '显示趋势',
    hideTrends: '隐藏趋势',
    searchPlaceholder: '搜索梦境、关键词、城市...',
    matchThreshold: '匹配阈值',
    matchedDreamers: '匹配的梦者',
    noDreamsFound: '未找到梦境',
    profileBack: '返回',
    profileReport: '举报',
    profileMemberSince: '加入于',
    profileDreams: '梦境',
    profileMatches: '匹配',
    profileFavorite: '收藏',
    profileLastDream: '最近的梦',
    profileConnect: '连接',
    profileRequestConnection: '请求连接',
    profilePartialPrivate: '此个人资料部分私密',
    profilePrivate: '此个人资料为私密',
    profileAnonymous: '匿名梦者',
    profileDreamDetailsUnavailable: '梦境详情不可用',
    profileShowProfile: '查看资料',
  },
  hi: {
    title: 'सपनों का नक्शा',
    subtitle: 'किसने वही सपना देखा?',
    activedreamers: 'सक्रिय स्वप्नदर्शी',
    similarToday: 'आज समान',
    matchestoday: 'आज के मैच',
    newmatch: 'नया मैच!',
    from: 'से',
    similarDream: 'ने एक समान सपना देखा',
    connect: 'जुड़ें',
    matchScore: 'मैच स्कोर',
    dreamSummary: 'सपने का सारांश',
    category: 'श्रेणी',
    mood: 'मनोदशा',
    close: 'बंद करें',
    filterAll: 'सभी',
    worldwide: 'विश्वव्यापी',
    dreamersSimilar: '% स्वप्नदर्शियों ने समान सपने देखे',
    loading: 'स्वप्नदर्शी स्कैन हो रहे हैं...',
    tapMarker: 'मैच विवरण के लिए मार्कर टैप करें',
    trendTitle: 'सबसे लोकप्रिय सपने',
    trendDreamers: 'स्वप्नदर्शी',
    showTrends: 'रुझान दिखाएं',
    hideTrends: 'रुझान छुपाएं',
    searchPlaceholder: 'सपने, कीवर्ड, शहर खोजें...',
    matchThreshold: 'मैच सीमा',
    matchedDreamers: 'मिलान स्वप्नदर्शी',
    noDreamsFound: 'कोई सपने नहीं मिले',
    profileBack: 'वापस',
    profileReport: 'रिपोर्ट',
    profileMemberSince: 'सदस्य बने',
    profileDreams: 'सपने',
    profileMatches: 'मैच',
    profileFavorite: 'पसंदीदा',
    profileLastDream: 'अंतिम सपना',
    profileConnect: 'जुड़ें',
    profileRequestConnection: 'कनेक्शन अनुरोध',
    profilePartialPrivate: 'यह प्रोफ़ाइल आंशिक रूप से निजी है',
    profilePrivate: 'यह प्रोफ़ाइल निजी है',
    profileAnonymous: 'अनाम स्वप्नदर्शी',
    profileDreamDetailsUnavailable: 'सपने का विवरण उपलब्ध नहीं',
    profileShowProfile: 'प्रोफ़ाइल देखें',
  },
  ja: {
    title: 'ドリームマップ',
    subtitle: '同じ夢を見たのは誰？',
    activedreamers: 'アクティブな夢見る人',
    similarToday: '今日の類似',
    matchestoday: '今日のマッチ',
    newmatch: '新しいマッチ！',
    from: '出身',
    similarDream: '似た夢を見ました',
    connect: 'つながる',
    matchScore: 'マッチスコア',
    dreamSummary: '夢の要約',
    category: 'カテゴリー',
    mood: '気分',
    close: '閉じる',
    filterAll: 'すべて',
    worldwide: '世界中',
    dreamersSimilar: '%の夢見る人が似た夢を見ました',
    loading: '夢見る人をスキャン中...',
    tapMarker: 'マーカーをタップして詳細を表示',
    trendTitle: '最も人気のある夢のテーマ',
    trendDreamers: '夢見る人',
    showTrends: 'トレンドを表示',
    hideTrends: 'トレンドを非表示',
    searchPlaceholder: '夢、キーワード、都市を検索...',
    matchThreshold: 'マッチ閾値',
    matchedDreamers: 'マッチした夢見る人',
    noDreamsFound: '夢が見つかりません',
    profileBack: '戻る',
    profileReport: '報告',
    profileMemberSince: '登録日',
    profileDreams: '夢',
    profileMatches: 'マッチ',
    profileFavorite: 'お気に入り',
    profileLastDream: '最後の夢',
    profileConnect: 'つながる',
    profileRequestConnection: '接続リクエスト',
    profilePartialPrivate: 'このプロフィールは一部非公開です',
    profilePrivate: 'このプロフィールは非公開です',
    profileAnonymous: '匿名の夢見る人',
    profileDreamDetailsUnavailable: '夢の詳細は利用できません',
    profileShowProfile: 'プロフィールを表示',
  },
  ko: {
    title: '꿈 지도',
    subtitle: '누가 같은 꿈을 꿨을까?',
    activedreamers: '활동 중인 꿈꾸는 이',
    similarToday: '오늘 유사',
    matchestoday: '오늘 매치',
    newmatch: '새로운 매치!',
    from: '출신',
    similarDream: '비슷한 꿈을 꿨습니다',
    connect: '연결',
    matchScore: '매치 점수',
    dreamSummary: '꿈 요약',
    category: '카테고리',
    mood: '기분',
    close: '닫기',
    filterAll: '전체',
    worldwide: '전 세계',
    dreamersSimilar: '%의 꿈꾸는 이가 비슷한 꿈을 꿨습니다',
    loading: '꿈꾸는 이를 스캔 중...',
    tapMarker: '매치 세부 정보를 보려면 마커를 탭하세요',
    trendTitle: '가장 인기 있는 꿈 주제',
    trendDreamers: '꿈꾸는 이',
    showTrends: '트렌드 보기',
    hideTrends: '트렌드 숨기기',
    searchPlaceholder: '꿈, 키워드, 도시 검색...',
    matchThreshold: '매치 임계값',
    matchedDreamers: '매치된 꿈꾸는 이',
    noDreamsFound: '꿈을 찾을 수 없습니다',
    profileBack: '뒤로',
    profileReport: '신고',
    profileMemberSince: '가입일',
    profileDreams: '꿈',
    profileMatches: '매치',
    profileFavorite: '즐겨찾기',
    profileLastDream: '마지막 꿈',
    profileConnect: '연결',
    profileRequestConnection: '연결 요청',
    profilePartialPrivate: '이 프로필은 부분적으로 비공개입니다',
    profilePrivate: '이 프로필은 비공개입니다',
    profileAnonymous: '익명의 꿈꾸는 이',
    profileDreamDetailsUnavailable: '꿈 세부 정보를 사용할 수 없습니다',
    profileShowProfile: '프로필 보기',
  },
  id: {
    title: 'Peta Mimpi',
    subtitle: 'Siapa yang bermimpi sama?',
    activedreamers: 'pemimpi aktif',
    similarToday: 'mirip hari ini',
    matchestoday: 'kecocokan hari ini',
    newmatch: 'Kecocokan Baru!',
    from: 'dari',
    similarDream: 'bermimpi serupa',
    connect: 'Hubungkan',
    matchScore: 'Skor Kecocokan',
    dreamSummary: 'Ringkasan Mimpi',
    category: 'Kategori',
    mood: 'Suasana Hati',
    close: 'Tutup',
    filterAll: 'Semua',
    worldwide: 'seluruh dunia',
    dreamersSimilar: '% pemimpi memiliki mimpi serupa',
    loading: 'Memindai pemimpi...',
    tapMarker: 'Ketuk penanda untuk melihat detail',
    trendTitle: 'Topik Mimpi Terpopuler',
    trendDreamers: 'pemimpi',
    showTrends: 'Tampilkan Tren',
    hideTrends: 'Sembunyikan Tren',
    searchPlaceholder: 'Cari mimpi, kata kunci, kota...',
    matchThreshold: 'Ambang Kecocokan',
    matchedDreamers: 'Pemimpi yang Cocok',
    noDreamsFound: 'Tidak ada mimpi ditemukan',
    profileBack: 'Kembali',
    profileReport: 'Laporkan',
    profileMemberSince: 'Anggota sejak',
    profileDreams: 'Mimpi',
    profileMatches: 'Kecocokan',
    profileFavorite: 'Favorit',
    profileLastDream: 'Mimpi Terakhir',
    profileConnect: 'Hubungkan',
    profileRequestConnection: 'Minta Koneksi',
    profilePartialPrivate: 'Profil ini sebagian privat',
    profilePrivate: 'Profil ini privat',
    profileAnonymous: 'Pemimpi Anonim',
    profileDreamDetailsUnavailable: 'Detail mimpi tidak tersedia',
    profileShowProfile: 'Lihat Profil',
  },
  fa: {
    title: 'نقشه رویاها',
    subtitle: 'چه کسی همان خواب را دید؟',
    activedreamers: 'رویابین فعال',
    similarToday: 'مشابه امروز',
    matchestoday: 'تطابق‌های امروز',
    newmatch: 'تطابق جدید!',
    from: 'از',
    similarDream: 'خواب مشابهی دید',
    connect: 'اتصال',
    matchScore: 'امتیاز تطابق',
    dreamSummary: 'خلاصه رویا',
    category: 'دسته‌بندی',
    mood: 'حال و هوا',
    close: 'بستن',
    filterAll: 'همه',
    worldwide: 'جهانی',
    dreamersSimilar: '% از رویابینان خواب‌های مشابهی دیدند',
    loading: 'در حال اسکن رویابینان...',
    tapMarker: 'برای مشاهده جزئیات روی نشانگر بزنید',
    trendTitle: 'محبوب‌ترین موضوعات رویا',
    trendDreamers: 'رویابین',
    showTrends: 'نمایش روندها',
    hideTrends: 'پنهان کردن روندها',
    searchPlaceholder: 'جستجوی رویاها، کلمات کلیدی، شهرها...',
    matchThreshold: 'آستانه تطابق',
    matchedDreamers: 'رویابینان مطابق',
    noDreamsFound: 'رویایی یافت نشد',
    profileBack: 'بازگشت',
    profileReport: 'گزارش',
    profileMemberSince: 'عضو از',
    profileDreams: 'رویاها',
    profileMatches: 'تطابق‌ها',
    profileFavorite: 'مورد علاقه',
    profileLastDream: 'آخرین رویا',
    profileConnect: 'اتصال',
    profileRequestConnection: 'درخواست اتصال',
    profilePartialPrivate: 'این پروفایل تا حدی خصوصی است',
    profilePrivate: 'این پروفایل خصوصی است',
    profileAnonymous: 'رویابین ناشناس',
    profileDreamDetailsUnavailable: 'جزئیات رویا در دسترس نیست',
    profileShowProfile: 'مشاهده پروفایل',
  },
  it: {
    title: 'Mappa dei Sogni',
    subtitle: 'Chi ha sognato lo stesso?',
    activedreamers: 'sognatori attivi',
    similarToday: 'simili oggi',
    matchestoday: 'corrispondenze oggi',
    newmatch: 'Nuova corrispondenza!',
    from: 'da',
    similarDream: 'ha avuto un sogno simile',
    connect: 'Connetti',
    matchScore: 'Punteggio',
    dreamSummary: 'Riassunto del sogno',
    category: 'Categoria',
    mood: 'Umore',
    close: 'Chiudi',
    filterAll: 'Tutti',
    worldwide: 'mondiale',
    dreamersSimilar: '% dei sognatori ha avuto sogni simili',
    loading: 'Scansione sognatori...',
    tapMarker: 'Tocca un indicatore per i dettagli',
    trendTitle: 'Temi dei sogni piu popolari',
    trendDreamers: 'sognatori',
    showTrends: 'Mostra tendenze',
    hideTrends: 'Nascondi tendenze',
    searchPlaceholder: 'Cerca sogni, parole chiave, citta...',
    matchThreshold: 'Soglia di corrispondenza',
    matchedDreamers: 'Sognatori corrispondenti',
    noDreamsFound: 'Nessun sogno trovato',
    profileBack: 'Indietro',
    profileReport: 'Segnala',
    profileMemberSince: 'Membro dal',
    profileDreams: 'Sogni',
    profileMatches: 'Corrispondenze',
    profileFavorite: 'Preferito',
    profileLastDream: 'Ultimo sogno',
    profileConnect: 'Connetti',
    profileRequestConnection: 'Richiedi connessione',
    profilePartialPrivate: 'Questo profilo e parzialmente privato',
    profilePrivate: 'Questo profilo e privato',
    profileAnonymous: 'Sognatore anonimo',
    profileDreamDetailsUnavailable: 'Dettagli del sogno non disponibili',
    profileShowProfile: 'Mostra profilo',
  },
  pl: {
    title: 'Mapa Snow',
    subtitle: 'Kto mial ten sam sen?',
    activedreamers: 'aktywnych sniacych',
    similarToday: 'podobnych dzisiaj',
    matchestoday: 'dopasowania dzisiaj',
    newmatch: 'Nowe dopasowanie!',
    from: 'z',
    similarDream: 'mial podobny sen',
    connect: 'Polacz',
    matchScore: 'Wynik dopasowania',
    dreamSummary: 'Streszczenie snu',
    category: 'Kategoria',
    mood: 'Nastroj',
    close: 'Zamknij',
    filterAll: 'Wszystkie',
    worldwide: 'na calym swiecie',
    dreamersSimilar: '% sniacych mialo podobne sny',
    loading: 'Skanowanie sniacych...',
    tapMarker: 'Dotknij znacznika, aby zobaczyc szczegoly',
    trendTitle: 'Najpopularniejsze tematy snow',
    trendDreamers: 'sniacych',
    showTrends: 'Pokaz trendy',
    hideTrends: 'Ukryj trendy',
    searchPlaceholder: 'Szukaj snow, slow kluczowych, miast...',
    matchThreshold: 'Prog dopasowania',
    matchedDreamers: 'Dopasowani sniacy',
    noDreamsFound: 'Nie znaleziono snow',
    profileBack: 'Wstecz',
    profileReport: 'Zglos',
    profileMemberSince: 'Czlonek od',
    profileDreams: 'Sny',
    profileMatches: 'Dopasowania',
    profileFavorite: 'Ulubione',
    profileLastDream: 'Ostatni sen',
    profileConnect: 'Polacz',
    profileRequestConnection: 'Popros o polaczenie',
    profilePartialPrivate: 'Ten profil jest czesciowo prywatny',
    profilePrivate: 'Ten profil jest prywatny',
    profileAnonymous: 'Anonimowy sniacy',
    profileDreamDetailsUnavailable: 'Szczegoly snu niedostepne',
    profileShowProfile: 'Pokaz profil',
  },
  bn: {
    title: 'স্বপ্নের মানচিত্র',
    subtitle: 'কে একই স্বপ্ন দেখেছে?',
    activedreamers: 'সক্রিয় স্বপ্নদ্রষ্টা',
    similarToday: 'আজ সদৃশ',
    matchestoday: 'আজকের মিল',
    newmatch: 'নতুন মিল!',
    from: 'থেকে',
    similarDream: 'একই রকম স্বপ্ন দেখেছে',
    connect: 'সংযুক্ত হন',
    matchScore: 'মিলের স্কোর',
    dreamSummary: 'স্বপ্নের সারাংশ',
    category: 'বিভাগ',
    mood: 'মেজাজ',
    close: 'বন্ধ করুন',
    filterAll: 'সব',
    worldwide: 'বিশ্বজুড়ে',
    dreamersSimilar: '% স্বপ্নদ্রষ্টা একই রকম স্বপ্ন দেখেছে',
    loading: 'স্বপ্নদ্রষ্টা স্ক্যান হচ্ছে...',
    tapMarker: 'বিস্তারিত দেখতে মার্কারে ট্যাপ করুন',
    trendTitle: 'সর্বাধিক জনপ্রিয় স্বপ্নের বিষয়',
    trendDreamers: 'স্বপ্নদ্রষ্টা',
    showTrends: 'ট্রেন্ড দেখান',
    hideTrends: 'ট্রেন্ড লুকান',
    searchPlaceholder: 'স্বপ্ন, কীওয়ার্ড, শহর খুঁজুন...',
    matchThreshold: 'মিলের সীমা',
    matchedDreamers: 'মিলিত স্বপ্নদ্রষ্টা',
    noDreamsFound: 'কোনো স্বপ্ন পাওয়া যায়নি',
    profileBack: 'ফিরে যান',
    profileReport: 'রিপোর্ট',
    profileMemberSince: 'সদস্য হয়েছেন',
    profileDreams: 'স্বপ্ন',
    profileMatches: 'মিল',
    profileFavorite: 'পছন্দের',
    profileLastDream: 'শেষ স্বপ্ন',
    profileConnect: 'সংযুক্ত হন',
    profileRequestConnection: 'সংযোগ অনুরোধ',
    profilePartialPrivate: 'এই প্রোফাইল আংশিক ব্যক্তিগত',
    profilePrivate: 'এই প্রোফাইল ব্যক্তিগত',
    profileAnonymous: 'বেনামী স্বপ্নদ্রষ্টা',
    profileDreamDetailsUnavailable: 'স্বপ্নের বিবরণ পাওয়া যায়নি',
    profileShowProfile: 'প্রোফাইল দেখুন',
  },
  ur: {
    title: 'خوابوں کا نقشہ',
    subtitle: 'کس نے وہی خواب دیکھا؟',
    activedreamers: 'فعال خواب دیکھنے والے',
    similarToday: 'آج مشابہ',
    matchestoday: 'آج کے میچ',
    newmatch: 'نیا میچ!',
    from: 'سے',
    similarDream: 'نے ایک جیسا خواب دیکھا',
    connect: 'جڑیں',
    matchScore: 'میچ سکور',
    dreamSummary: 'خواب کا خلاصہ',
    category: 'زمرہ',
    mood: 'مزاج',
    close: 'بند کریں',
    filterAll: 'سب',
    worldwide: 'دنیا بھر میں',
    dreamersSimilar: '% خواب دیکھنے والوں نے ملتے جلتے خواب دیکھے',
    loading: 'خواب دیکھنے والوں کو سکین کر رہا ہے...',
    tapMarker: 'تفصیلات کے لیے مارکر پر ٹیپ کریں',
    trendTitle: 'سب سے مقبول خوابوں کے موضوعات',
    trendDreamers: 'خواب دیکھنے والے',
    showTrends: 'رجحانات دکھائیں',
    hideTrends: 'رجحانات چھپائیں',
    searchPlaceholder: 'خواب، الفاظ، شہر تلاش کریں...',
    matchThreshold: 'میچ کی حد',
    matchedDreamers: 'میچ ہونے والے',
    noDreamsFound: 'کوئی خواب نہیں ملا',
    profileBack: 'واپس',
    profileReport: 'رپورٹ',
    profileMemberSince: 'رکن بنے',
    profileDreams: 'خواب',
    profileMatches: 'میچ',
    profileFavorite: 'پسندیدہ',
    profileLastDream: 'آخری خواب',
    profileConnect: 'جڑیں',
    profileRequestConnection: 'کنکشن کی درخواست',
    profilePartialPrivate: 'یہ پروفائل جزوی طور پر نجی ہے',
    profilePrivate: 'یہ پروفائل نجی ہے',
    profileAnonymous: 'گمنام خواب دیکھنے والا',
    profileDreamDetailsUnavailable: 'خواب کی تفصیلات دستیاب نہیں',
    profileShowProfile: 'پروفائل دیکھیں',
  },
  vi: {
    title: 'Ban do Giac mo',
    subtitle: 'Ai da mo giong vay?',
    activedreamers: 'nguoi mo dang hoat dong',
    similarToday: 'tuong tu hom nay',
    matchestoday: 'ket qua hom nay',
    newmatch: 'Ket qua moi!',
    from: 'tu',
    similarDream: 'da co giac mo tuong tu',
    connect: 'Ket noi',
    matchScore: 'Diem phu hop',
    dreamSummary: 'Tom tat giac mo',
    category: 'Danh muc',
    mood: 'Tam trang',
    close: 'Dong',
    filterAll: 'Tat ca',
    worldwide: 'toan cau',
    dreamersSimilar: '% nguoi mo co giac mo tuong tu',
    loading: 'Dang quet nguoi mo...',
    tapMarker: 'Nhan vao diem danh dau de xem chi tiet',
    trendTitle: 'Chu de giac mo pho bien nhat',
    trendDreamers: 'nguoi mo',
    showTrends: 'Hien xu huong',
    hideTrends: 'An xu huong',
    searchPlaceholder: 'Tim kiem giac mo, tu khoa, thanh pho...',
    matchThreshold: 'Nguong phu hop',
    matchedDreamers: 'Nguoi mo phu hop',
    noDreamsFound: 'Khong tim thay giac mo',
    profileBack: 'Quay lai',
    profileReport: 'Bao cao',
    profileMemberSince: 'Thanh vien tu',
    profileDreams: 'Giac mo',
    profileMatches: 'Ket qua',
    profileFavorite: 'Yeu thich',
    profileLastDream: 'Giac mo gan nhat',
    profileConnect: 'Ket noi',
    profileRequestConnection: 'Yeu cau ket noi',
    profilePartialPrivate: 'Ho so nay mot phan la rieng tu',
    profilePrivate: 'Ho so nay la rieng tu',
    profileAnonymous: 'Nguoi mo an danh',
    profileDreamDetailsUnavailable: 'Chi tiet giac mo khong kha dung',
    profileShowProfile: 'Xem ho so',
  },
  th: {
    title: 'แผนที่ความฝัน',
    subtitle: 'ใครฝันเหมือนกัน?',
    activedreamers: 'นักฝันที่กำลังใช้งาน',
    similarToday: 'คล้ายกันวันนี้',
    matchestoday: 'การจับคู่วันนี้',
    newmatch: 'การจับคู่ใหม่!',
    from: 'จาก',
    similarDream: 'ฝันคล้ายกัน',
    connect: 'เชื่อมต่อ',
    matchScore: 'คะแนนจับคู่',
    dreamSummary: 'สรุปความฝัน',
    category: 'หมวดหมู่',
    mood: 'อารมณ์',
    close: 'ปิด',
    filterAll: 'ทั้งหมด',
    worldwide: 'ทั่วโลก',
    dreamersSimilar: '% ของนักฝันมีความฝันคล้ายกัน',
    loading: 'กำลังสแกนนักฝัน...',
    tapMarker: 'แตะเครื่องหมายเพื่อดูรายละเอียด',
    trendTitle: 'หัวข้อความฝันยอดนิยม',
    trendDreamers: 'นักฝัน',
    showTrends: 'แสดงเทรนด์',
    hideTrends: 'ซ่อนเทรนด์',
    searchPlaceholder: 'ค้นหาความฝัน คำสำคัญ เมือง...',
    matchThreshold: 'เกณฑ์การจับคู่',
    matchedDreamers: 'นักฝันที่จับคู่ได้',
    noDreamsFound: 'ไม่พบความฝัน',
    profileBack: 'กลับ',
    profileReport: 'รายงาน',
    profileMemberSince: 'สมาชิกตั้งแต่',
    profileDreams: 'ความฝัน',
    profileMatches: 'การจับคู่',
    profileFavorite: 'รายการโปรด',
    profileLastDream: 'ความฝันล่าสุด',
    profileConnect: 'เชื่อมต่อ',
    profileRequestConnection: 'ขอเชื่อมต่อ',
    profilePartialPrivate: 'โปรไฟล์นี้เป็นส่วนตัวบางส่วน',
    profilePrivate: 'โปรไฟล์นี้เป็นส่วนตัว',
    profileAnonymous: 'นักฝันนิรนาม',
    profileDreamDetailsUnavailable: 'ไม่มีรายละเอียดความฝัน',
    profileShowProfile: 'ดูโปรไฟล์',
  },
  sw: {
    title: 'Ramani ya Ndoto',
    subtitle: 'Nani aliota sawa?',
    activedreamers: 'waotaji hai',
    similarToday: 'zinazofanana leo',
    matchestoday: 'mechi leo',
    newmatch: 'Mechi Mpya!',
    from: 'kutoka',
    similarDream: 'aliota ndoto kama hiyo',
    connect: 'Ungana',
    matchScore: 'Alama ya Mechi',
    dreamSummary: 'Muhtasari wa Ndoto',
    category: 'Jamii',
    mood: 'Hali',
    close: 'Funga',
    filterAll: 'Zote',
    worldwide: 'ulimwenguni',
    dreamersSimilar: '% ya waotaji waliota ndoto zinazofanana',
    loading: 'Inatafuta waotaji...',
    tapMarker: 'Gusa alama kuona maelezo',
    trendTitle: 'Mada Maarufu za Ndoto',
    trendDreamers: 'waotaji',
    showTrends: 'Onyesha Mitindo',
    hideTrends: 'Ficha Mitindo',
    searchPlaceholder: 'Tafuta ndoto, maneno, miji...',
    matchThreshold: 'Kiwango cha Mechi',
    matchedDreamers: 'Waotaji Wanaofanana',
    noDreamsFound: 'Hakuna ndoto zilizopatikana',
    profileBack: 'Rudi',
    profileReport: 'Ripoti',
    profileMemberSince: 'Mwanachama tangu',
    profileDreams: 'Ndoto',
    profileMatches: 'Mechi',
    profileFavorite: 'Pendwa',
    profileLastDream: 'Ndoto ya Mwisho',
    profileConnect: 'Ungana',
    profileRequestConnection: 'Omba Muunganisho',
    profilePartialPrivate: 'Wasifu huu ni faragha kwa sehemu',
    profilePrivate: 'Wasifu huu ni faragha',
    profileAnonymous: 'Mwotaji Asiyejulikana',
    profileDreamDetailsUnavailable: 'Maelezo ya ndoto hayapatikani',
    profileShowProfile: 'Onyesha Wasifu',
  },
  hu: {
    title: 'Alomterkep',
    subtitle: 'Ki almodta ugyanazt?',
    activedreamers: 'aktiv almodok',
    similarToday: 'hasonlo ma',
    matchestoday: 'talalatok ma',
    newmatch: 'Uj Talalat!',
    from: 'innen',
    similarDream: 'hasonlot almodott',
    connect: 'Kapcsolodas',
    matchScore: 'Talalati pontszam',
    dreamSummary: 'Alom osszefoglalo',
    category: 'Kategoria',
    mood: 'Hangulat',
    close: 'Bezaras',
    filterAll: 'Osszes',
    worldwide: 'vilagszerte',
    dreamersSimilar: '% almodonak hasonlo almuk volt',
    loading: 'Almodok keresese...',
    tapMarker: 'Koppints a jelolore a reszletekhez',
    trendTitle: 'Legnepszerubb alom temak',
    trendDreamers: 'almodo',
    showTrends: 'Trendek mutatasa',
    hideTrends: 'Trendek elrejtese',
    searchPlaceholder: 'Almok, kulcsszavak, varosok keresese...',
    matchThreshold: 'Talalati kuszobertek',
    matchedDreamers: 'Egyezo almodok',
    noDreamsFound: 'Nem talalhato alom',
    profileBack: 'Vissza',
    profileReport: 'Jelentes',
    profileMemberSince: 'Tag ota',
    profileDreams: 'Almok',
    profileMatches: 'Talalatok',
    profileFavorite: 'Kedvenc',
    profileLastDream: 'Utolso alom',
    profileConnect: 'Kapcsolodas',
    profileRequestConnection: 'Kapcsolat keres',
    profilePartialPrivate: 'Ez a profil reszben privat',
    profilePrivate: 'Ez a profil privat',
    profileAnonymous: 'Nev nelkuli almodo',
    profileDreamDetailsUnavailable: 'Alom reszletek nem elerhetoek',
    profileShowProfile: 'Profil megtekintese',
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
  { id: 'horror',    label: { en:'Horror', de:'Gruselig', tr:'Korku', es:'Terror', fr:'Horreur', ar:'رعب', pt:'Horror', ru:'Ужас', zh:'恐怖', hi:'डरावना', ja:'ホラー', ko:'공포', id:'Horor', fa:'وحشت', it:'Orrore', pl:'Horror', bn:'ভয়ংকর', ur:'خوفناک', vi:'Kinh dị', th:'สยองขวัญ', sw:'Kutisha', hu:'Horror' },         icon: '👻', color: '#8b5cf6' },
  { id: 'funny',     label: { en:'Funny', de:'Lustig', tr:'Komik', es:'Gracioso', fr:'Drôle', ar:'مضحك', pt:'Engraçado', ru:'Смешной', zh:'搞笑', hi:'मज़ेदार', ja:'面白い', ko:'웃긴', id:'Lucu', fa:'خنده‌دار', it:'Divertente', pl:'Śmieszny', bn:'মজার', ur:'مزاحیہ', vi:'Hài hước', th:'ตลก', sw:'Kuchekesha', hu:'Vicces' },    icon: '😂', color: '#f59e0b' },
  { id: 'ufo',       label: { en:'UFO/Alien', de:'UFO', tr:'UFO', es:'OVNI', fr:'OVNI', ar:'مركبة فضائية', pt:'OVNI', ru:'НЛО', zh:'UFO/外星人', hi:'UFO/एलियन', ja:'UFO/宇宙人', ko:'UFO/외계인', id:'UFO/Alien', fa:'بشقاب‌پرنده', it:'UFO/Alieni', pl:'UFO/Obcy', bn:'UFO/এলিয়েন', ur:'UFO/ایلین', vi:'UFO/Người ngoài hành tinh', th:'UFO/มนุษย์ต่างดาว', sw:'UFO/Wageni', hu:'UFO/Földönkívüli' },             icon: '🛸', color: '#06b6d4' },
  { id: 'love',      label: { en:'Love', de:'Liebe', tr:'Aşk', es:'Amor', fr:'Amour', ar:'حب', pt:'Amor', ru:'Любовь', zh:'爱情', hi:'प्रेम', ja:'恋愛', ko:'사랑', id:'Cinta', fa:'عشق', it:'Amore', pl:'Miłość', bn:'প্রেম', ur:'محبت', vi:'Tình yêu', th:'ความรัก', sw:'Upendo', hu:'Szerelem' },                    icon: '❤️', color: '#ec4899' },
  { id: 'erotic',    label: { en:'Erotic', de:'Erotik', tr:'Erotik', es:'Erótico', fr:'Érotique', ar:'إثارة', pt:'Erótico', ru:'Эротика', zh:'情色', hi:'कामुक', ja:'エロティック', ko:'에로틱', id:'Erotis', fa:'شهوانی', it:'Erotico', pl:'Erotyczny', bn:'কামোদ্দীপক', ur:'شہوانی', vi:'Gợi cảm', th:'อีโรติก', sw:'Mapenzi', hu:'Erotikus' },  icon: '🔥', color: '#ef4444' },
  { id: 'flying',    label: { en:'Flying', de:'Fliegen', tr:'Uçmak', es:'Volar', fr:'Voler', ar:'طيران', pt:'Voar', ru:'Полёт', zh:'飞行', hi:'उड़ान', ja:'飛行', ko:'비행', id:'Terbang', fa:'پرواز', it:'Volare', pl:'Latanie', bn:'উড়ন্ত', ur:'پرواز', vi:'Bay', th:'บิน', sw:'Kuruka', hu:'Repülés' },            icon: '✈️', color: '#3b82f6' },
  { id: 'falling',   label: { en:'Falling', de:'Fallen', tr:'Düşmek', es:'Caer', fr:'Chuter', ar:'سقوط', pt:'Cair', ru:'Падение', zh:'坠落', hi:'गिरना', ja:'落下', ko:'추락', id:'Jatuh', fa:'سقوط', it:'Cadere', pl:'Spadanie', bn:'পতন', ur:'گرنا', vi:'Rơi', th:'ตกหล่น', sw:'Kuanguka', hu:'Zuhanás' },          icon: '📉', color: '#64748b' },
  { id: 'water',     label: { en:'Water', de:'Wasser', tr:'Su', es:'Agua', fr:'Eau', ar:'ماء', pt:'Água', ru:'Вода', zh:'水', hi:'पानी', ja:'水', ko:'물', id:'Air', fa:'آب', it:'Acqua', pl:'Woda', bn:'জল', ur:'پانی', vi:'Nước', th:'น้ำ', sw:'Maji', hu:'Víz' },                      icon: '🌊', color: '#0ea5e9' },
  { id: 'animals',   label: { en:'Animals', de:'Tiere', tr:'Hayvanlar', es:'Animales', fr:'Animaux', ar:'حيوانات', pt:'Animais', ru:'Животные', zh:'动物', hi:'जानवर', ja:'動物', ko:'동물', id:'Hewan', fa:'حیوانات', it:'Animali', pl:'Zwierzęta', bn:'প্রাণী', ur:'جانور', vi:'Động vật', th:'สัตว์', sw:'Wanyama', hu:'Állatok' }, icon: '🐾', color: '#84cc16' },
  { id: 'death',     label: { en:'Death', de:'Tod', tr:'Ölüm', es:'Muerte', fr:'Mort', ar:'موت', pt:'Morte', ru:'Смерть', zh:'死亡', hi:'मृत्यु', ja:'死', ko:'죽음', id:'Kematian', fa:'مرگ', it:'Morte', pl:'Śmierć', bn:'মৃত্যু', ur:'موت', vi:'Cái chết', th:'ความตาย', sw:'Kifo', hu:'Halál' },                  icon: '💀', color: '#1e293b' },
  { id: 'chase',     label: { en:'Chase', de:'Verfolgung', tr:'Takip', es:'Persecución', fr:'Poursuite', ar:'مطاردة', pt:'Perseguição', ru:'Погоня', zh:'追逐', hi:'पीछा', ja:'追跡', ko:'추격', id:'Pengejaran', fa:'تعقیب', it:'Inseguimento', pl:'Pościg', bn:'তাড়া', ur:'تعاقب', vi:'Rượt đuổi', th:'ไล่ล่า', sw:'Kufuatilia', hu:'Üldözés' }, icon: '🏃', color: '#f97316' },
  { id: 'family',    label: { en:'Family', de:'Familie', tr:'Aile', es:'Familia', fr:'Famille', ar:'عائلة', pt:'Família', ru:'Семья', zh:'家庭', hi:'परिवार', ja:'家族', ko:'가족', id:'Keluarga', fa:'خانواده', it:'Famiglia', pl:'Rodzina', bn:'পরিবার', ur:'خاندان', vi:'Gia đình', th:'ครอบครัว', sw:'Familia', hu:'Család' },      icon: '👨‍👩‍👧', color: '#10b981' },
  { id: 'money',     label: { en:'Money', de:'Geld', tr:'Para', es:'Dinero', fr:'Argent', ar:'مال', pt:'Dinheiro', ru:'Деньги', zh:'金钱', hi:'पैसा', ja:'お金', ko:'돈', id:'Uang', fa:'پول', it:'Denaro', pl:'Pieniądze', bn:'টাকা', ur:'پیسہ', vi:'Tiền', th:'เงิน', sw:'Pesa', hu:'Pénz' },            icon: '💰', color: '#eab308' },
  { id: 'school',    label: { en:'School', de:'Schule', tr:'Okul', es:'Escuela', fr:'École', ar:'مدرسة', pt:'Escola', ru:'Школа', zh:'学校', hi:'स्कूल', ja:'学校', ko:'학교', id:'Sekolah', fa:'مدرسه', it:'Scuola', pl:'Szkoła', bn:'স্কুল', ur:'اسکول', vi:'Trường học', th:'โรงเรียน', sw:'Shule', hu:'Iskola' },          icon: '🏫', color: '#6366f1' },
  { id: 'spiritual', label: { en:'Spiritual', de:'Spirituell', tr:'Ruhsal', es:'Espiritual', fr:'Spirituel', ar:'روحاني', pt:'Espiritual', ru:'Духовный', zh:'心灵', hi:'आध्यात्मिक', ja:'スピリチュアル', ko:'영적', id:'Spiritual', fa:'معنوی', it:'Spirituale', pl:'Duchowy', bn:'আধ্যাত্মিক', ur:'روحانی', vi:'Tâm linh', th:'จิตวิญญาณ', sw:'Kiroho', hu:'Spirituális' }, icon: '🧘', color: '#a855f7' },
  { id: 'nature',    label: { en:'Nature', de:'Natur', tr:'Doğa', es:'Naturaleza', fr:'Nature', ar:'طبيعة', pt:'Natureza', ru:'Природа', zh:'自然', hi:'प्रकृति', ja:'自然', ko:'자연', id:'Alam', fa:'طبیعت', it:'Natura', pl:'Natura', bn:'প্রকৃতি', ur:'فطرت', vi:'Thiên nhiên', th:'ธรรมชาติ', sw:'Asili', hu:'Természet' },   icon: '🌿', color: '#22c55e' },
  { id: 'timetravel',label: { en:'Time Travel', de:'Zeitreise', tr:'Zaman Yolculuğu', es:'Viaje en tiempo', fr:'Voyage temporel', ar:'سفر عبر الزمن', pt:'Viagem no tempo', ru:'Путешествие во времени', zh:'时间旅行', hi:'समय यात्रा', ja:'タイムトラベル', ko:'시간 여행', id:'Perjalanan Waktu', fa:'سفر در زمان', it:'Viaggio nel tempo', pl:'Podróż w czasie', bn:'সময় ভ্রমণ', ur:'وقت کا سفر', vi:'Du hành thời gian', th:'ท่องเวลา', sw:'Safari ya Wakati', hu:'Időutazás' }, icon: '⏳', color: '#8b5cf6' },
  { id: 'celebrity', label: { en:'Celebrity', de:'Prominente', tr:'Ünlüler', es:'Famosos', fr:'Célébrités', ar:'مشاهير', pt:'Celebridades', ru:'Знаменитости', zh:'名人', hi:'मशहूर', ja:'有名人', ko:'유명인', id:'Selebriti', fa:'مشهور', it:'Celebrità', pl:'Celebryci', bn:'বিখ্যাত', ur:'مشہور', vi:'Người nổi tiếng', th:'คนดัง', sw:'Mashuhuri', hu:'Híresség' }, icon: '⭐', color: '#f59e0b' },
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
  gender?: string;
  memberSince: string;
  bio?: string;
  dreamCount: number;
  totalWords: number;
  matchCount: number;
  favCategory: string;
  interpretation?: string;
}

// Country center coordinates for participants with missing/zero lat/lng
const COUNTRY_COORDS: Record<string, [number, number]> = {
  'USA': [39.8, -98.5], 'United States': [39.8, -98.5],
  'Germany': [51.2, 10.4], 'Deutschland': [51.2, 10.4],
  'UK': [53.5, -2.5], 'United Kingdom': [53.5, -2.5],
  'France': [46.6, 2.2], 'Japan': [36.2, 138.3],
  'Turkey': [39.9, 32.9], 'Türkiye': [39.9, 32.9],
  'Brazil': [-14.2, -51.9], 'China': [35.9, 104.2],
  'India': [20.6, 78.9], 'Australia': [-25.3, 133.8],
  'Canada': [56.1, -106.3], 'Spain': [40.5, -3.7],
  'Italy': [41.9, 12.6], 'Russia': [61.5, 105.3],
  'Netherlands': [52.1, 5.3], 'Mexico': [23.6, -102.5],
  'South Korea': [35.9, 127.8], 'Argentina': [-38.4, -63.6],
  'South Africa': [-30.6, 22.9], 'Egypt': [26.8, 30.8],
  'Nigeria': [9.1, 8.7], 'Kenya': [-0.02, 37.9],
  'Iran': [32.4, 53.7], 'Saudi Arabia': [23.9, 45.1],
  'Indonesia': [-0.8, 113.9], 'Philippines': [12.9, 121.8],
  'Pakistan': [30.4, 69.3], 'Austria': [47.5, 14.6],
  'Switzerland': [46.8, 8.2], 'Sweden': [60.1, 18.6],
  'Norway': [60.5, 8.5], 'Poland': [51.9, 19.1],
  'Portugal': [39.4, -8.2], 'Greece': [39.1, 21.8],
  'Colombia': [4.6, -74.3], 'Chile': [-35.7, -71.5],
};

// Resolve valid lat/lng — fallback to country center with jitter
const resolveCoords = (lat: number | null, lng: number | null, country?: string): { lat: number; lng: number } => {
  if (lat && lng && !(lat === 0 && lng === 0)) {
    const jitter = () => (Math.random() - 0.5) * 1.5;
    return { lat: lat + jitter(), lng: lng + jitter() };
  }
  const base = COUNTRY_COORDS[country || ''] || [39.8, -98.5];
  const jitter = () => (Math.random() - 0.5) * 4;
  return { lat: base[0] + jitter(), lng: base[1] + jitter() };
};

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
  onSelectParticipant,
  onNavigateToResearch,
}) => {
  const lang = (typeof language === 'string' ? language : String(language)).toLowerCase();
  const t: Translations = TRANSLATIONS[lang] ?? TRANSLATIONS['en'];
  const tLang = (cat: DreamCategory) => cat.label[lang] ?? cat.label['en'];

  const MAP_LABELS: Record<string, {dreams_total: string, words: string, dream_s: string, dream_p: string, words_label: string, research_map: string, tap_research_map: string}> = {
    en: {dreams_total:'dreams total', words:'words', dream_s:'dream', dream_p:'dreams', words_label:'words', research_map:'Research Map', tap_research_map:'Tap for research map'},
    de: {dreams_total:'Träume gesamt', words:'Wörter', dream_s:'Traum', dream_p:'Träume', words_label:'Wörter', research_map:'Forschungskarte', tap_research_map:'Tippen für Forschungskarte'},
    tr: {dreams_total:'toplam rüya', words:'kelime', dream_s:'rüya', dream_p:'rüya', words_label:'kelime', research_map:'Araştırma Haritası', tap_research_map:'Araştırma haritası için dokun'},
    es: {dreams_total:'sueños en total', words:'palabras', dream_s:'sueño', dream_p:'sueños', words_label:'palabras', research_map:'Mapa de Investigación', tap_research_map:'Toca para mapa de investigación'},
    fr: {dreams_total:'rêves au total', words:'mots', dream_s:'rêve', dream_p:'rêves', words_label:'mots', research_map:'Carte de Recherche', tap_research_map:'Appuyez pour la carte de recherche'},
    ar: {dreams_total:'أحلام إجمالاً', words:'كلمة', dream_s:'حلم', dream_p:'أحلام', words_label:'كلمة', research_map:'خريطة البحث', tap_research_map:'انقر لخريطة البحث'},
    pt: {dreams_total:'sonhos no total', words:'palavras', dream_s:'sonho', dream_p:'sonhos', words_label:'palavras', research_map:'Mapa de Pesquisa', tap_research_map:'Toque para mapa de pesquisa'},
    ru: {dreams_total:'снов всего', words:'слов', dream_s:'сон', dream_p:'снов', words_label:'слов', research_map:'Карта исследований', tap_research_map:'Нажмите для карты исследований'},
    zh: {dreams_total:'个梦境', words:'字', dream_s:'个梦', dream_p:'个梦', words_label:'字', research_map:'研究地图', tap_research_map:'点击查看研究地图'},
    hi: {dreams_total:'कुल सपने', words:'शब्द', dream_s:'सपना', dream_p:'सपने', words_label:'शब्द', research_map:'अनुसंधान मानचित्र', tap_research_map:'अनुसंधान मानचित्र के लिए टैप करें'},
    ja: {dreams_total:'件の夢', words:'語', dream_s:'件の夢', dream_p:'件の夢', words_label:'語', research_map:'研究マップ', tap_research_map:'研究マップをタップ'},
    ko: {dreams_total:'개의 꿈', words:'단어', dream_s:'개의 꿈', dream_p:'개의 꿈', words_label:'단어', research_map:'연구 지도', tap_research_map:'연구 지도를 탭하세요'},
    id: {dreams_total:'mimpi total', words:'kata', dream_s:'mimpi', dream_p:'mimpi', words_label:'kata', research_map:'Peta Penelitian', tap_research_map:'Ketuk untuk peta penelitian'},
    fa: {dreams_total:'رویا در کل', words:'کلمه', dream_s:'رویا', dream_p:'رویا', words_label:'کلمه', research_map:'نقشه تحقیقات', tap_research_map:'برای نقشه تحقیقات ضربه بزنید'},
    it: {dreams_total:'sogni in totale', words:'parole', dream_s:'sogno', dream_p:'sogni', words_label:'parole', research_map:'Mappa di Ricerca', tap_research_map:'Tocca per la mappa di ricerca'},
    pl: {dreams_total:'snów łącznie', words:'słów', dream_s:'sen', dream_p:'snów', words_label:'słów', research_map:'Mapa Badań', tap_research_map:'Dotknij mapy badań'},
    bn: {dreams_total:'মোট স্বপ্ন', words:'শব্দ', dream_s:'স্বপ্ন', dream_p:'স্বপ্ন', words_label:'শব্দ', research_map:'গবেষণা মানচিত্র', tap_research_map:'গবেষণা মানচিত্রের জন্য ট্যাপ করুন'},
    ur: {dreams_total:'کل خواب', words:'الفاظ', dream_s:'خواب', dream_p:'خواب', words_label:'الفاظ', research_map:'تحقیقی نقشہ', tap_research_map:'تحقیقی نقشے کے لیے ٹیپ کریں'},
    vi: {dreams_total:'giấc mơ', words:'từ', dream_s:'giấc mơ', dream_p:'giấc mơ', words_label:'từ', research_map:'Bản đồ nghiên cứu', tap_research_map:'Nhấn để xem bản đồ nghiên cứu'},
    th: {dreams_total:'ความฝันทั้งหมด', words:'คำ', dream_s:'ความฝัน', dream_p:'ความฝัน', words_label:'คำ', research_map:'แผนที่วิจัย', tap_research_map:'แตะเพื่อดูแผนที่วิจัย'},
    sw: {dreams_total:'ndoto jumla', words:'maneno', dream_s:'ndoto', dream_p:'ndoto', words_label:'maneno', research_map:'Ramani ya Utafiti', tap_research_map:'Gonga kwa ramani ya utafiti'},
    hu: {dreams_total:'álom összesen', words:'szó', dream_s:'álom', dream_p:'álom', words_label:'szó', research_map:'Kutatási térkép', tap_research_map:'Koppintson a kutatási térképhez'},
  };
  const ml = MAP_LABELS[lang.toLowerCase()] || MAP_LABELS.en;

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

  // ── Global stats ──
  const [globalStats, setGlobalStats] = useState<{ dreams: number; words: string } | null>(null);
  useEffect(() => {
    (async () => {
      const { count } = await supabase
        .from('research_dreams')
        .select('*', { count: 'exact', head: true });
      if (count != null) {
        const words = count * 80;
        const wordStr = words >= 1_000_000
          ? `${(words / 1_000_000).toFixed(1)} Mio`
          : words.toLocaleString();
        setGlobalStats({ dreams: count, words: wordStr });
      }
    })();
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
        .select('id, participant_id, country, lat, lng, dream_count, gender, age')
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .order('dream_count', { ascending: false })
        .limit(500);

      if (data && data.length > 0) {
        // Lade Traeume + Deutungen pro Teilnehmer (Batch)
        const pids = data.map((p: any) => p.participant_id);
        const [dreamsRes, interpRes] = await Promise.all([
          supabase
            .from('research_dreams')
            .select('participant_id, dream_text')
            .in('participant_id', pids)
            .limit(5000),
          supabase
            .from('research_interpretations')
            .select('participant_id, content')
            .in('participant_id', pids)
            .limit(500),
        ]);

        const dreamMap = new Map<string, string>();
        const wordCountMap = new Map<string, number>();
        if (dreamsRes.data) {
          for (const d of dreamsRes.data as any[]) {
            if (!dreamMap.has(d.participant_id)) {
              dreamMap.set(d.participant_id, d.dream_text || '');
            }
            const words = d.dream_text ? d.dream_text.trim().split(/\s+/).length : 0;
            wordCountMap.set(d.participant_id, (wordCountMap.get(d.participant_id) || 0) + words);
          }
        }

        const interpMap = new Map<string, string>();
        if (interpRes.data) {
          for (const i of interpRes.data as any[]) {
            if (!interpMap.has(i.participant_id)) {
              interpMap.set(i.participant_id, i.content || '');
            }
          }
        }

        const mapped: SimUser[] = data.map((p: any) => {
          const rc = resolveCoords(p.lat, p.lng, p.country);
          return {
          id: p.id,
          name: p.participant_id,
          avatar: '🔬',
          city: p.country || '',
          country: p.country || '',
          lat: rc.lat,
          lng: rc.lng,
          dreamSummary: dreamMap.get(p.participant_id) || '',
          interpretation: interpMap.get(p.participant_id) || '',
          category: 'nature',
          mood: 'calm',
          matchPct: Math.floor(Math.random() * 30) + 70,
          privacy: 'public' as const,
          memberSince: '2024-01',
          dreamCount: p.dream_count || 0,
          totalWords: wordCountMap.get(p.participant_id) || 0,
          gender: p.gender || undefined,
          age: p.age || undefined,
          matchCount: 0,
          favCategory: 'nature'
        };});
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

  // Sorted for result list (descending by dream count)
  const sortedFilteredUsers = useMemo(
    () => [...filteredUsers].sort((a, b) => b.dreamCount - a.dreamCount),
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

  // Select user from result list → open ParticipantProfile
  const handleResultClick = useCallback((user: SimUser) => {
    if (onSelectParticipant) {
      onSelectParticipant(user.name);
    } else {
      openProfile(user);
    }
  }, [onSelectParticipant, openProfile]);

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
          className="relative overflow-hidden"
          style={{
            background: isLight ? '#e8e0f0' : '#0a0318',
            transform: `scale(${mapScale}) translate(${mapOffset.x / mapScale}px, ${mapOffset.y / mapScale}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            cursor: mapScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            touchAction: 'none',
            borderRadius: '50%',
            width: 'min(90vw, 400px)',
            height: 'min(90vw, 400px)',
            margin: '0 auto',
            boxShadow: isLight
              ? '0 0 40px rgba(139,92,246,0.2), inset 0 0 30px rgba(139,92,246,0.05)'
              : '0 0 40px rgba(139,92,246,0.3), inset 0 0 30px rgba(139,92,246,0.1)',
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
          {/* Globe 3D depth overlay — click opens research map */}
          <div
            className="absolute inset-0"
            style={{
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, transparent 40%, rgba(0,0,0,0.3) 100%)',
              zIndex: 5,
              cursor: onNavigateToResearch ? 'pointer' : 'default',
            }}
            onClick={(e) => {
              if (onNavigateToResearch && mapScale <= 1) {
                e.stopPropagation();
                onNavigateToResearch();
              }
            }}
          />
          {/* Hint: tap globe to open research map */}
          {onNavigateToResearch && (
            <div className="absolute pointer-events-none" style={{
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 10,
              color: 'rgba(196,181,253,0.5)',
              zIndex: 6,
              whiteSpace: 'nowrap',
            }}>
              {ml.tap_research_map}
            </div>
          )}

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
            <div className="flex items-center gap-2">
              {onNavigateToResearch && (
                <button
                  onClick={onNavigateToResearch}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 backdrop-blur-sm transition-colors"
                >
                  <span className="material-icons text-sm">science</span>
                  {ml.research_map}
                </button>
              )}
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

      {/* ── Global Stats ── */}
      {globalStats && (
        <div className="flex items-center justify-center gap-5 px-4 py-2 mx-4 my-1 rounded-lg" style={{
          background: 'rgba(139,92,246,0.1)',
          fontSize: 13,
          fontWeight: 500,
          color: isLight ? '#7c3aed' : '#c4b5fd',
        }}>
          <span>🌙 {globalStats.dreams.toLocaleString()} {ml.dreams_total}</span>
          <span>📝 {globalStats.words} {ml.words_label}</span>
        </div>
      )}

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
                    <div className={`text-[11px] ${textSub}`}>
                      {u.name} · {u.country}
                      {u.gender && <> · {u.gender === 'Female' ? '♀' : u.gender === 'Male' ? '♂' : '⚧'} {u.gender}</>}
                      {u.age && <> · 👤 {u.age}</>}
                    </div>
                    <div className={`text-[11px] ${textSub}`}>
                      {u.dreamCount > 0 && (
                        <span style={{ color: '#a78bfa' }}>🌙 {u.dreamCount} {u.dreamCount === 1 ? ml.dream_s : ml.dream_p}</span>
                      )}
                      {u.totalWords > 0 && (
                        <span style={{ color: '#94a3b8' }}> · 📝 {u.totalWords.toLocaleString()} {ml.words_label}</span>
                      )}
                    </div>
                    <p className={`text-xs italic mt-0.5 line-clamp-2 ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'}`}>
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

          <div className={`rounded-2xl p-4 mb-4 border ${isLight ? 'bg-purple-50/80 border-purple-100' : 'bg-white/5 border-white/8'}`}>
            <div className={`text-xs font-semibold mb-2 flex items-center gap-1.5 ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
              <span className="material-icons text-sm">auto_stories</span>
              {t.dreamSummary}
            </div>
            <div className={`text-[13px] leading-[1.75] whitespace-pre-wrap ${textMain}`}>
              {selectedUser.dreamSummary.split(/\.\s+/).map((sentence, i, arr) => (
                <span key={i}>{sentence}{i < arr.length - 1 ? '. ' : ''}{i > 0 && i % 3 === 0 && i < arr.length - 1 ? '\n\n' : ''}</span>
              ))}
            </div>
          </div>

          {selectedUser.interpretation && (
            <div className={`rounded-2xl p-4 mb-4 border ${isLight ? 'bg-amber-50/80 border-amber-200' : 'bg-amber-500/5 border-amber-500/15'}`}>
              <div className={`text-xs font-semibold mb-2 flex items-center gap-1.5 ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                <span className="material-icons text-sm">psychology</span>
                Deutung
              </div>
              <div className={`text-[13px] leading-[1.75] whitespace-pre-wrap ${textMain}`}>
                {selectedUser.interpretation.split(/\.\s+/).map((sentence, i, arr) => (
                  <span key={i}>{sentence}{i < arr.length - 1 ? '. ' : ''}{i > 0 && i % 2 === 0 && i < arr.length - 1 ? '\n\n' : ''}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleClosePanel}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-colors ${isLight ? 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50' : 'bg-white/8 border-white/10 text-white hover:bg-white/15'}`}
            >
              {t.close}
            </button>
            <button
              onClick={() => { handleClosePanel(); if (onSelectParticipant && selectedUser) { onSelectParticipant(selectedUser.name); } else if (selectedUser) { openProfile(selectedUser); } }}
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
                    <div className={`rounded-xl p-3.5 border ${
                      isLight ? 'bg-purple-50/80 border-purple-100' : 'bg-white/3 border-white/5'
                    }`}>
                      <div className={`text-[13px] leading-[1.75] whitespace-pre-wrap ${textMain}`}>
                        {pu.dreamSummary.split(/\.\s+/).map((sentence: string, i: number, arr: string[]) => (
                          <span key={i}>{sentence}{i < arr.length - 1 ? '. ' : ''}{i > 0 && i % 3 === 0 && i < arr.length - 1 ? '\n\n' : ''}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
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
                    {pu.interpretation && (
                      <div className={`rounded-xl p-3.5 mt-3 border ${
                        isLight ? 'bg-amber-50/80 border-amber-200' : 'bg-amber-500/5 border-amber-500/15'
                      }`}>
                        <div className={`text-xs font-semibold mb-2 flex items-center gap-1.5 ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                          <span className="material-icons text-sm">psychology</span>
                          Deutung
                        </div>
                        <div className={`text-[13px] leading-[1.75] whitespace-pre-wrap ${textMain}`}>
                          {pu.interpretation.split(/\.\s+/).map((sentence: string, i: number, arr: string[]) => (
                            <span key={i}>{sentence}{i < arr.length - 1 ? '. ' : ''}{i > 0 && i % 2 === 0 && i < arr.length - 1 ? '\n\n' : ''}</span>
                          ))}
                        </div>
                      </div>
                    )}
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
