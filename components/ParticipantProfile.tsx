import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import TranslatedText from './TranslatedText';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ParticipantProfileProps {
  participantId: string;
  language: string;
  isLight: boolean;
  onClose: () => void;
  onShowOnMap?: (studyCode: string) => void;
}

interface StudyRow {
  id: string;
  study_code: string;
  study_name: string;
  principal_investigator: string;
  institution: string;
  year_start: number | null;
  year_end: number | null;
  doi: string | null;
  publication: string | null;
  map_color: string | null;
  country: string | null;
  description: string | null;
  license: string | null;
  participant_count: number | null;
  total_dreams: number | null;
  created_at: string | null;
}

interface InterpretationRow {
  id: string;
  dream_id: string;
  participant_id: string;
  content: string;
  tradition: string;
  created_at: string;
}

interface ParticipantRow {
  id: string;
  participant_id: string;
  study_id: string;
  study_code: string;
  age: number | null;
  gender: string | null;
  ethnicity: string | null;
  country: string | null;
  city: string | null;
  dream_count: number | null;
  study_duration_days: number | null;
  notes: string | null;
  study: StudyRow | null;
}

interface DreamRow {
  id: string;
  dream_id: string;
  participant_id: string;
  dream_date: string | null;
  dream_night: string | null;
  dream_week: number | null;
  dream_text: string;
  original_language: string | null;
  hall_van_de_castle_codes: Record<string, string> | null;
  emotions: string[] | null;
  characters: string[] | null;
  settings: string[] | null;
  themes: string[] | null;
  interpretation: InterpretationRow | InterpretationRow[] | null;
}

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const T = {
  de: {
    title: 'Teilnehmer-Profil',
    back: 'Zurueck',
    loading: 'Lade Profil...',
    empty: 'Keine Daten gefunden',
    study: 'Studie',
    researcher: 'Forscher',
    institution: 'Institution',
    period: 'Zeitraum',
    age: 'Alter',
    gender: 'Geschlecht',
    ethnicity: 'Ethnizitaet',
    showOnMap: 'Auf Karte anzeigen',
    dreams: 'Traeume',
    dreamId: 'Traum-ID',
    date: 'Datum',
    night: 'Nacht',
    hvdc: 'HVdC-Codes',
    emotionsLabel: 'Emotionen',
    source: 'Quellenangabe',
    disclaimer: 'Keine KI-Deutungen. Nur Original-Forschungsdaten.',
    noDreams: 'Keine Traeume gefunden',
    doi: 'DOI',
    demographics: 'Demografische Daten',
    researchBannerTitle: 'Wissenschaftliches Forschungsprofil — Nur Lesen',
    researchBannerSub: 'Keine Interaktion moeglich. Originaldaten aus der Studie.',
    studyInfo: 'Studien-Info',
    aboutStudy: 'Ueber diese Studie',
    country: 'Land',
    city: 'Stadt',
    license: 'Lizenz',
    statsInterpretations: 'Deutungen',
    dreamLabel: 'Traum',
    week: 'Woche',
    words: 'Woerter',
    readMore: 'Mehr lesen',
    showLess: 'Weniger anzeigen',
    characters: 'Charaktere',
    settings: 'Schauplaetze',
    themes: 'Themen',
    showInterpretation: 'Deutung anzeigen',
    noInterpretation: 'Keine Deutung in Originalstudie',
    scientificInterpretation: 'Wissenschaftliche Deutung',
  },
  en: {
    title: 'Participant Profile',
    back: 'Back',
    loading: 'Loading profile...',
    empty: 'No data found',
    study: 'Study',
    researcher: 'Researcher',
    institution: 'Institution',
    period: 'Period',
    age: 'Age',
    gender: 'Gender',
    ethnicity: 'Ethnicity',
    showOnMap: 'Show on Map',
    dreams: 'Dreams',
    dreamId: 'Dream ID',
    date: 'Date',
    night: 'Night',
    hvdc: 'HVdC Codes',
    emotionsLabel: 'Emotions',
    source: 'Citation',
    disclaimer: 'No AI interpretations. Original research data only.',
    noDreams: 'No dreams found',
    doi: 'DOI',
    demographics: 'Demographics',
    researchBannerTitle: 'Scientific Research Profile — Read Only',
    researchBannerSub: 'No interaction possible. Original data from the study.',
    studyInfo: 'Study info',
    aboutStudy: 'About this study',
    country: 'Country',
    city: 'City',
    license: 'License',
    statsInterpretations: 'Interpretations',
    dreamLabel: 'Dream',
    week: 'Week',
    words: 'words',
    readMore: 'Read more',
    showLess: 'Show less',
    characters: 'Characters',
    settings: 'Settings',
    themes: 'Themes',
    showInterpretation: 'Show Interpretation',
    noInterpretation: 'No interpretation in original study',
    scientificInterpretation: 'Scientific Interpretation',
  },
  tr: {
    title: 'Katilimci Profili',
    back: 'Geri',
    loading: 'Profil yukleniyor...',
    empty: 'Veri bulunamadi',
    study: 'Calisma',
    researcher: 'Arastirmaci',
    institution: 'Kurum',
    period: 'Donem',
    age: 'Yas',
    gender: 'Cinsiyet',
    ethnicity: 'Etnik koken',
    showOnMap: 'Haritada goster',
    dreams: 'Ruyalar',
    dreamId: 'Ruya ID',
    date: 'Tarih',
    night: 'Gece',
    hvdc: 'HVdC Kodlari',
    emotionsLabel: 'Duygular',
    source: 'Kaynak',
    disclaimer: 'YZ yorumu yok. Yalnizca orijinal arastirma verileri.',
    noDreams: 'Ruya bulunamadi',
    doi: 'DOI',
    demographics: 'Demografik Veriler',
    researchBannerTitle: 'Bilimsel Arastirma Profili — Yalnizca Okuma',
    researchBannerSub: 'Etkilesim mumkun degil. Calismadan orijinal veriler.',
    studyInfo: 'Calisma bilgisi',
    aboutStudy: 'Bu calisma hakkinda',
    country: 'Ulke',
    city: 'Sehir',
    license: 'Lisans',
    statsInterpretations: 'Yorumlar',
    dreamLabel: 'Ruya',
    week: 'Hafta',
    words: 'kelime',
    readMore: 'Devamini oku',
    showLess: 'Daha az goster',
    characters: 'Karakterler',
    settings: 'Mekanlar',
    themes: 'Temalar',
    showInterpretation: 'Yorumu goster',
    noInterpretation: 'Orijinal calismada yorum yok',
    scientificInterpretation: 'Bilimsel Yorum',
  },
  es: {
    title: 'Perfil del Participante',
    back: 'Volver',
    loading: 'Cargando perfil...',
    empty: 'No se encontraron datos',
    study: 'Estudio',
    researcher: 'Investigador',
    institution: 'Institucion',
    period: 'Periodo',
    age: 'Edad',
    gender: 'Genero',
    ethnicity: 'Etnia',
    showOnMap: 'Ver en mapa',
    dreams: 'Suenos',
    dreamId: 'ID de Sueno',
    date: 'Fecha',
    night: 'Noche',
    hvdc: 'Codigos HVdC',
    emotionsLabel: 'Emociones',
    source: 'Cita',
    disclaimer: 'Sin interpretaciones IA. Solo datos de investigacion originales.',
    noDreams: 'No se encontraron suenos',
    doi: 'DOI',
    demographics: 'Datos Demograficos',
    researchBannerTitle: 'Perfil de Investigacion Cientifica — Solo Lectura',
    researchBannerSub: 'Sin interaccion posible. Datos originales del estudio.',
    studyInfo: 'Info del estudio',
    aboutStudy: 'Sobre este estudio',
    country: 'Pais',
    city: 'Ciudad',
    license: 'Licencia',
    statsInterpretations: 'Interpretaciones',
    dreamLabel: 'Sueno',
    week: 'Semana',
    words: 'palabras',
    readMore: 'Leer mas',
    showLess: 'Mostrar menos',
    characters: 'Personajes',
    settings: 'Escenarios',
    themes: 'Temas',
    showInterpretation: 'Ver Interpretacion',
    noInterpretation: 'Sin interpretacion en estudio original',
    scientificInterpretation: 'Interpretacion Cientifica',
  },
  fr: {
    title: 'Profil du Participant',
    back: 'Retour',
    loading: 'Chargement du profil...',
    empty: 'Aucune donnee trouvee',
    study: 'Etude',
    researcher: 'Chercheur',
    institution: 'Institution',
    period: 'Periode',
    age: 'Age',
    gender: 'Genre',
    ethnicity: 'Ethnicite',
    showOnMap: 'Voir sur la carte',
    dreams: 'Reves',
    dreamId: 'ID du Reve',
    date: 'Date',
    night: 'Nuit',
    hvdc: 'Codes HVdC',
    emotionsLabel: 'Emotions',
    source: 'Citation',
    disclaimer: 'Pas d\'interpretations IA. Donnees de recherche originales uniquement.',
    noDreams: 'Aucun reve trouve',
    doi: 'DOI',
    demographics: 'Donnees Demographiques',
    researchBannerTitle: 'Profil de Recherche Scientifique — Lecture Seule',
    researchBannerSub: 'Aucune interaction possible. Donnees originales de l\'etude.',
    studyInfo: 'Info etude',
    aboutStudy: 'A propos de cette etude',
    country: 'Pays',
    city: 'Ville',
    license: 'Licence',
    statsInterpretations: 'Interpretations',
    dreamLabel: 'Reve',
    week: 'Semaine',
    words: 'mots',
    readMore: 'Lire la suite',
    showLess: 'Afficher moins',
    characters: 'Personnages',
    settings: 'Lieux',
    themes: 'Themes',
    showInterpretation: 'Afficher l\'interpretation',
    noInterpretation: 'Pas d\'interpretation dans l\'etude originale',
    scientificInterpretation: 'Interpretation Scientifique',
  },
  ar: {
    title: 'ملف المشارك',
    back: 'رجوع',
    loading: 'جاري تحميل الملف...',
    empty: 'لم يتم العثور على بيانات',
    study: 'دراسة',
    researcher: 'باحث',
    institution: 'مؤسسة',
    period: 'الفترة',
    age: 'العمر',
    gender: 'الجنس',
    ethnicity: 'العرق',
    showOnMap: 'عرض على الخريطة',
    dreams: 'أحلام',
    dreamId: 'معرف الحلم',
    date: 'التاريخ',
    night: 'الليلة',
    hvdc: 'رموز HVdC',
    emotionsLabel: 'المشاعر',
    source: 'الاقتباس',
    disclaimer: 'بدون تفسيرات ذكاء اصطناعي. بيانات بحثية أصلية فقط.',
    noDreams: 'لم يتم العثور على أحلام',
    doi: 'DOI',
    demographics: 'البيانات الديموغرافية',
    researchBannerTitle: 'ملف بحثي علمي — للقراءة فقط',
    researchBannerSub: 'لا تفاعل ممكن. بيانات أصلية من الدراسة.',
    studyInfo: 'معلومات الدراسة',
    aboutStudy: 'حول هذه الدراسة',
    country: 'البلد',
    city: 'المدينة',
    license: 'الترخيص',
    statsInterpretations: 'تفسيرات',
    dreamLabel: 'حلم',
    week: 'أسبوع',
    words: 'كلمات',
    readMore: 'اقرأ المزيد',
    showLess: 'عرض أقل',
    characters: 'الشخصيات',
    settings: 'الأماكن',
    themes: 'المواضيع',
    showInterpretation: 'عرض التفسير',
    noInterpretation: 'لا تفسير في الدراسة الأصلية',
    scientificInterpretation: 'التفسير العلمي',
  },
  pt: {
    title: 'Perfil do Participante',
    back: 'Voltar',
    loading: 'Carregando perfil...',
    empty: 'Nenhum dado encontrado',
    study: 'Estudo',
    researcher: 'Pesquisador',
    institution: 'Instituicao',
    period: 'Periodo',
    age: 'Idade',
    gender: 'Genero',
    ethnicity: 'Etnia',
    showOnMap: 'Ver no mapa',
    dreams: 'Sonhos',
    dreamId: 'ID do Sonho',
    date: 'Data',
    night: 'Noite',
    hvdc: 'Codigos HVdC',
    emotionsLabel: 'Emocoes',
    source: 'Citacao',
    disclaimer: 'Sem interpretacoes IA. Apenas dados de pesquisa originais.',
    noDreams: 'Nenhum sonho encontrado',
    doi: 'DOI',
    demographics: 'Dados Demograficos',
    researchBannerTitle: 'Perfil de Pesquisa Cientifica — Somente Leitura',
    researchBannerSub: 'Sem interacao possivel. Dados originais do estudo.',
    studyInfo: 'Info do estudo',
    aboutStudy: 'Sobre este estudo',
    country: 'Pais',
    city: 'Cidade',
    license: 'Licenca',
    statsInterpretations: 'Interpretacoes',
    dreamLabel: 'Sonho',
    week: 'Semana',
    words: 'palavras',
    readMore: 'Ler mais',
    showLess: 'Mostrar menos',
    characters: 'Personagens',
    settings: 'Cenarios',
    themes: 'Temas',
    showInterpretation: 'Ver Interpretacao',
    noInterpretation: 'Sem interpretacao no estudo original',
    scientificInterpretation: 'Interpretacao Cientifica',
  },
  ru: {
    title: 'Профиль участника',
    back: 'Назад',
    loading: 'Загрузка профиля...',
    empty: 'Данные не найдены',
    study: 'Исследование',
    researcher: 'Исследователь',
    institution: 'Учреждение',
    period: 'Период',
    age: 'Возраст',
    gender: 'Пол',
    ethnicity: 'Этническая принадлежность',
    showOnMap: 'Показать на карте',
    dreams: 'Сны',
    dreamId: 'ID сна',
    date: 'Дата',
    night: 'Ночь',
    hvdc: 'Коды HVdC',
    emotionsLabel: 'Эмоции',
    source: 'Цитирование',
    disclaimer: 'Без ИИ-интерпретаций. Только оригинальные данные исследований.',
    noDreams: 'Сны не найдены',
    doi: 'DOI',
    demographics: 'Демографические данные',
    researchBannerTitle: 'Научный исследовательский профиль — только чтение',
    researchBannerSub: 'Взаимодействие невозможно. Оригинальные данные исследования.',
    studyInfo: 'Инфо об исследовании',
    aboutStudy: 'Об этом исследовании',
    country: 'Страна',
    city: 'Город',
    license: 'Лицензия',
    statsInterpretations: 'Интерпретации',
    dreamLabel: 'Сон',
    week: 'Неделя',
    words: 'слов',
    readMore: 'Читать далее',
    showLess: 'Свернуть',
    characters: 'Персонажи',
    settings: 'Места',
    themes: 'Темы',
    showInterpretation: 'Показать интерпретацию',
    noInterpretation: 'Нет интерпретации в оригинальном исследовании',
    scientificInterpretation: 'Научная интерпретация',
  },
  zh: {
    title: '参与者资料',
    back: '返回',
    loading: '正在加载资料...',
    empty: '未找到数据',
    study: '研究',
    researcher: '研究员',
    institution: '机构',
    period: '时间段',
    age: '年龄',
    gender: '性别',
    ethnicity: '种族',
    showOnMap: '在地图上显示',
    dreams: '梦境',
    dreamId: '梦境ID',
    date: '日期',
    night: '夜晚',
    hvdc: 'HVdC编码',
    emotionsLabel: '情绪',
    source: '引用',
    disclaimer: '无AI解读。仅原始研究数据。',
    noDreams: '未找到梦境',
    doi: 'DOI',
    demographics: '人口统计数据',
    researchBannerTitle: '科学研究档案 — 只读',
    researchBannerSub: '无法交互。来自研究的原始数据。',
    studyInfo: '研究信息',
    aboutStudy: '关于本研究',
    country: '国家',
    city: '城市',
    license: '许可证',
    statsInterpretations: '解读',
    dreamLabel: '梦境',
    week: '周',
    words: '词',
    readMore: '阅读更多',
    showLess: '收起',
    characters: '人物',
    settings: '场景',
    themes: '主题',
    showInterpretation: '显示解读',
    noInterpretation: '原始研究中无解读',
    scientificInterpretation: '科学解读',
  },
  hi: {
    title: 'प्रतिभागी प्रोफ़ाइल',
    back: 'वापस',
    loading: 'प्रोफ़ाइल लोड हो रही है...',
    empty: 'कोई डेटा नहीं मिला',
    study: 'अध्ययन',
    researcher: 'शोधकर्ता',
    institution: 'संस्था',
    period: 'अवधि',
    age: 'उम्र',
    gender: 'लिंग',
    ethnicity: 'जातीयता',
    showOnMap: 'मानचित्र पर दिखाएं',
    dreams: 'सपने',
    dreamId: 'सपना ID',
    date: 'तारीख',
    night: 'रात',
    hvdc: 'HVdC कोड',
    emotionsLabel: 'भावनाएं',
    source: 'उद्धरण',
    disclaimer: 'कोई AI व्याख्या नहीं। केवल मूल शोध डेटा।',
    noDreams: 'कोई सपने नहीं मिले',
    doi: 'DOI',
    demographics: 'जनसांख्यिकीय डेटा',
    researchBannerTitle: 'वैज्ञानिक अनुसंधान प्रोफाइल — केवल पढें',
    researchBannerSub: 'कोई इंटरेक्शन संभव नहीं। अध्ययन से मूल डेटा।',
    studyInfo: 'अध्ययन जानकारी',
    aboutStudy: 'इस अध्ययन के बारे में',
    country: 'देश',
    city: 'शहर',
    license: 'लाइसेंस',
    statsInterpretations: 'व्याख्याएं',
    dreamLabel: 'सपना',
    week: 'सप्ताह',
    words: 'शब्द',
    readMore: 'और पढें',
    showLess: 'कम दिखाएं',
    characters: 'पात्र',
    settings: 'स्थान',
    themes: 'विषय',
    showInterpretation: 'व्याख्या दिखाएं',
    noInterpretation: 'मूल अध्ययन में कोई व्याख्या नहीं',
    scientificInterpretation: 'वैज्ञानिक व्याख्या',
  },
  ja: {
    title: '参加者プロフィール',
    back: '戻る',
    loading: 'プロフィール読み込み中...',
    empty: 'データが見つかりません',
    study: '研究',
    researcher: '研究者',
    institution: '機関',
    period: '期間',
    age: '年齢',
    gender: '性別',
    ethnicity: '民族',
    showOnMap: '地図で表示',
    dreams: '夢',
    dreamId: '夢ID',
    date: '日付',
    night: '夜',
    hvdc: 'HVdCコード',
    emotionsLabel: '感情',
    source: '引用',
    disclaimer: 'AI解釈なし。オリジナルの研究データのみ。',
    noDreams: '夢が見つかりません',
    doi: 'DOI',
    demographics: '人口統計データ',
    researchBannerTitle: '科学的研究プロフィール — 読み取り専用',
    researchBannerSub: 'インタラクション不可。研究からの元データ。',
    studyInfo: '研究情報',
    aboutStudy: 'この研究について',
    country: '国',
    city: '都市',
    license: 'ライセンス',
    statsInterpretations: '解釈',
    dreamLabel: '夢',
    week: '週',
    words: '語',
    readMore: '続きを読む',
    showLess: '折りたたむ',
    characters: '登場人物',
    settings: '場所',
    themes: 'テーマ',
    showInterpretation: '解釈を表示',
    noInterpretation: '元の研究に解釈なし',
    scientificInterpretation: '科学的解釈',
  },
  ko: {
    title: '참여자 프로필',
    back: '뒤로',
    loading: '프로필 로딩 중...',
    empty: '데이터를 찾을 수 없습니다',
    study: '연구',
    researcher: '연구원',
    institution: '기관',
    period: '기간',
    age: '나이',
    gender: '성별',
    ethnicity: '민족',
    showOnMap: '지도에서 보기',
    dreams: '꿈',
    dreamId: '꿈 ID',
    date: '날짜',
    night: '밤',
    hvdc: 'HVdC 코드',
    emotionsLabel: '감정',
    source: '인용',
    disclaimer: 'AI 해석 없음. 원본 연구 데이터만.',
    noDreams: '꿈을 찾을 수 없습니다',
    doi: 'DOI',
    demographics: '인구통계 데이터',
    researchBannerTitle: '과학적 연구 프로필 — 읽기 전용',
    researchBannerSub: '상호작용 불가. 연구의 원본 데이터.',
    studyInfo: '연구 정보',
    aboutStudy: '이 연구에 대해',
    country: '국가',
    city: '도시',
    license: '라이선스',
    statsInterpretations: '해석',
    dreamLabel: '꿈',
    week: '주',
    words: '단어',
    readMore: '더 읽기',
    showLess: '접기',
    characters: '등장인물',
    settings: '장소',
    themes: '주제',
    showInterpretation: '해석 보기',
    noInterpretation: '원본 연구에 해석 없음',
    scientificInterpretation: '과학적 해석',
  },
  id: {
    title: 'Profil Peserta',
    back: 'Kembali',
    loading: 'Memuat profil...',
    empty: 'Data tidak ditemukan',
    study: 'Studi',
    researcher: 'Peneliti',
    institution: 'Institusi',
    period: 'Periode',
    age: 'Usia',
    gender: 'Jenis Kelamin',
    ethnicity: 'Etnis',
    showOnMap: 'Tampilkan di peta',
    dreams: 'Mimpi',
    dreamId: 'ID Mimpi',
    date: 'Tanggal',
    night: 'Malam',
    hvdc: 'Kode HVdC',
    emotionsLabel: 'Emosi',
    source: 'Kutipan',
    disclaimer: 'Tanpa interpretasi AI. Hanya data penelitian asli.',
    noDreams: 'Tidak ada mimpi ditemukan',
    doi: 'DOI',
    demographics: 'Data Demografis',
    researchBannerTitle: 'Profil Penelitian Ilmiah — Hanya Baca',
    researchBannerSub: 'Tidak ada interaksi. Data asli dari penelitian.',
    studyInfo: 'Info penelitian',
    aboutStudy: 'Tentang penelitian ini',
    country: 'Negara',
    city: 'Kota',
    license: 'Lisensi',
    statsInterpretations: 'Interpretasi',
    dreamLabel: 'Mimpi',
    week: 'Minggu',
    words: 'kata',
    readMore: 'Baca selengkapnya',
    showLess: 'Tampilkan lebih sedikit',
    characters: 'Karakter',
    settings: 'Lokasi',
    themes: 'Tema',
    showInterpretation: 'Lihat Interpretasi',
    noInterpretation: 'Tidak ada interpretasi dalam penelitian asli',
    scientificInterpretation: 'Interpretasi Ilmiah',
  },
  fa: {
    title: 'پروفایل شرکت‌کننده',
    back: 'بازگشت',
    loading: 'در حال بارگذاری پروفایل...',
    empty: 'داده‌ای یافت نشد',
    study: 'مطالعه',
    researcher: 'پژوهشگر',
    institution: 'موسسه',
    period: 'دوره',
    age: 'سن',
    gender: 'جنسیت',
    ethnicity: 'قومیت',
    showOnMap: 'نمایش روی نقشه',
    dreams: 'رویاها',
    dreamId: 'شناسه رویا',
    date: 'تاریخ',
    night: 'شب',
    hvdc: 'کدهای HVdC',
    emotionsLabel: 'احساسات',
    source: 'استناد',
    disclaimer: 'بدون تفسیر هوش مصنوعی. فقط داده‌های پژوهشی اصلی.',
    noDreams: 'رویایی یافت نشد',
    doi: 'DOI',
    demographics: 'داده‌های جمعیتی',
    researchBannerTitle: 'پروفایل تحقیقاتی علمی — فقط خواندنی',
    researchBannerSub: 'تعامل ممکن نیست. داده‌های اصلی از مطالعه.',
    studyInfo: 'اطلاعات مطالعه',
    aboutStudy: 'درباره این مطالعه',
    country: 'کشور',
    city: 'شهر',
    license: 'مجوز',
    statsInterpretations: 'تفسیرها',
    dreamLabel: 'رویا',
    week: 'هفته',
    words: 'کلمه',
    readMore: 'بیشتر بخوانید',
    showLess: 'نمایش کمتر',
    characters: 'شخصیت‌ها',
    settings: 'مکان‌ها',
    themes: 'موضوعات',
    showInterpretation: 'نمایش تفسیر',
    noInterpretation: 'بدون تفسیر در مطالعه اصلی',
    scientificInterpretation: 'تفسیر علمی',
  },
  it: {
    title: 'Profilo Partecipante',
    back: 'Indietro',
    loading: 'Caricamento profilo...',
    empty: 'Nessun dato trovato',
    study: 'Studio',
    researcher: 'Ricercatore',
    institution: 'Istituzione',
    period: 'Periodo',
    age: 'Eta',
    gender: 'Genere',
    ethnicity: 'Etnia',
    showOnMap: 'Mostra sulla mappa',
    dreams: 'Sogni',
    dreamId: 'ID Sogno',
    date: 'Data',
    night: 'Notte',
    hvdc: 'Codici HVdC',
    emotionsLabel: 'Emozioni',
    source: 'Citazione',
    disclaimer: 'Nessuna interpretazione IA. Solo dati di ricerca originali.',
    noDreams: 'Nessun sogno trovato',
    doi: 'DOI',
    demographics: 'Dati Demografici',
    researchBannerTitle: 'Profilo di Ricerca Scientifica — Solo Lettura',
    researchBannerSub: 'Nessuna interazione possibile. Dati originali dello studio.',
    studyInfo: 'Info studio',
    aboutStudy: 'Informazioni su questo studio',
    country: 'Paese',
    city: 'Citta',
    license: 'Licenza',
    statsInterpretations: 'Interpretazioni',
    dreamLabel: 'Sogno',
    week: 'Settimana',
    words: 'parole',
    readMore: 'Leggi di piu',
    showLess: 'Mostra meno',
    characters: 'Personaggi',
    settings: 'Luoghi',
    themes: 'Temi',
    showInterpretation: 'Mostra Interpretazione',
    noInterpretation: 'Nessuna interpretazione nello studio originale',
    scientificInterpretation: 'Interpretazione Scientifica',
  },
  pl: {
    title: 'Profil Uczestnika',
    back: 'Wstecz',
    loading: 'Ladowanie profilu...',
    empty: 'Nie znaleziono danych',
    study: 'Badanie',
    researcher: 'Badacz',
    institution: 'Instytucja',
    period: 'Okres',
    age: 'Wiek',
    gender: 'Plec',
    ethnicity: 'Pochodzenie etniczne',
    showOnMap: 'Pokaz na mapie',
    dreams: 'Sny',
    dreamId: 'ID Snu',
    date: 'Data',
    night: 'Noc',
    hvdc: 'Kody HVdC',
    emotionsLabel: 'Emocje',
    source: 'Cytat',
    disclaimer: 'Bez interpretacji AI. Tylko oryginalne dane badawcze.',
    noDreams: 'Nie znaleziono snow',
    doi: 'DOI',
    demographics: 'Dane Demograficzne',
    researchBannerTitle: 'Naukowy Profil Badawczy — Tylko Odczyt',
    researchBannerSub: 'Brak mozliwosci interakcji. Oryginalne dane z badania.',
    studyInfo: 'Info o badaniu',
    aboutStudy: 'O tym badaniu',
    country: 'Kraj',
    city: 'Miasto',
    license: 'Licencja',
    statsInterpretations: 'Interpretacje',
    dreamLabel: 'Sen',
    week: 'Tydzien',
    words: 'slow',
    readMore: 'Czytaj wiecej',
    showLess: 'Pokaz mniej',
    characters: 'Postacie',
    settings: 'Miejsca',
    themes: 'Tematy',
    showInterpretation: 'Pokaz Interpretacje',
    noInterpretation: 'Brak interpretacji w oryginalnym badaniu',
    scientificInterpretation: 'Interpretacja Naukowa',
  },
  bn: {
    title: 'অংশগ্রহণকারীর প্রোফাইল',
    back: 'ফিরে যান',
    loading: 'প্রোফাইল লোড হচ্ছে...',
    empty: 'কোনো ডেটা পাওয়া যায়নি',
    study: 'গবেষণা',
    researcher: 'গবেষক',
    institution: 'প্রতিষ্ঠান',
    period: 'সময়কাল',
    age: 'বয়স',
    gender: 'লিঙ্গ',
    ethnicity: 'জাতিগত পরিচয়',
    showOnMap: 'মানচিত্রে দেখান',
    dreams: 'স্বপ্ন',
    dreamId: 'স্বপ্ন ID',
    date: 'তারিখ',
    night: 'রাত',
    hvdc: 'HVdC কোড',
    emotionsLabel: 'আবেগ',
    source: 'উদ্ধৃতি',
    disclaimer: 'কোনো AI ব্যাখ্যা নেই। শুধুমাত্র মূল গবেষণা ডেটা।',
    noDreams: 'কোনো স্বপ্ন পাওয়া যায়নি',
    doi: 'DOI',
    demographics: 'জনমিতি তথ্য',
    researchBannerTitle: 'বৈজ্ঞানিক গবেষণা প্রোফাইল — শুধুমাত্র পড়ুন',
    researchBannerSub: 'কোনো ইন্টারঅ্যাকশন সম্ভব নয়। গবেষণার মূল ডেটা।',
    studyInfo: 'গবেষণা তথ্য',
    aboutStudy: 'এই গবেষণা সম্পর্কে',
    country: 'দেশ',
    city: 'শহর',
    license: 'লাইসেন্স',
    statsInterpretations: 'ব্যাখ্যা',
    dreamLabel: 'স্বপ্ন',
    week: 'সপ্তাহ',
    words: 'শব্দ',
    readMore: 'আরো পড়ুন',
    showLess: 'কম দেখান',
    characters: 'চরিত্র',
    settings: 'স্থান',
    themes: 'বিষয়',
    showInterpretation: 'ব্যাখ্যা দেখান',
    noInterpretation: 'মূল গবেষণায় কোনো ব্যাখ্যা নেই',
    scientificInterpretation: 'বৈজ্ঞানিক ব্যাখ্যা',
  },
  ur: {
    title: 'شرکت کنندہ کا پروفائل',
    back: 'واپس',
    loading: 'پروفائل لوڈ ہو رہا ہے...',
    empty: 'کوئی ڈیٹا نہیں ملا',
    study: 'تحقیق',
    researcher: 'محقق',
    institution: 'ادارہ',
    period: 'مدت',
    age: 'عمر',
    gender: 'جنس',
    ethnicity: 'نسل',
    showOnMap: 'نقشے پر دکھائیں',
    dreams: 'خواب',
    dreamId: 'خواب ID',
    date: 'تاریخ',
    night: 'رات',
    hvdc: 'HVdC کوڈز',
    emotionsLabel: 'جذبات',
    source: 'حوالہ',
    disclaimer: 'AI تعبیرات نہیں۔ صرف اصل تحقیقی ڈیٹا۔',
    noDreams: 'کوئی خواب نہیں ملے',
    doi: 'DOI',
    demographics: 'آبادیاتی ڈیٹا',
    researchBannerTitle: 'سائنسی تحقیقی پروفائل — صرف پڑھنے کے لیے',
    researchBannerSub: 'کوئی تعامل ممکن نہیں۔ تحقیق سے اصل ڈیٹا۔',
    studyInfo: 'تحقیق کی معلومات',
    aboutStudy: 'اس تحقیق کے بارے میں',
    country: 'ملک',
    city: 'شہر',
    license: 'لائسنس',
    statsInterpretations: 'تعبیرات',
    dreamLabel: 'خواب',
    week: 'ہفتہ',
    words: 'الفاظ',
    readMore: 'مزید پڑھیں',
    showLess: 'کم دکھائیں',
    characters: 'کردار',
    settings: 'مقامات',
    themes: 'موضوعات',
    showInterpretation: 'تعبیر دیکھیں',
    noInterpretation: 'اصل تحقیق میں کوئی تعبیر نہیں',
    scientificInterpretation: 'سائنسی تعبیر',
  },
  vi: {
    title: 'Ho so Nguoi tham gia',
    back: 'Quay lai',
    loading: 'Dang tai ho so...',
    empty: 'Khong tim thay du lieu',
    study: 'Nghien cuu',
    researcher: 'Nha nghien cuu',
    institution: 'To chuc',
    period: 'Giai doan',
    age: 'Tuoi',
    gender: 'Gioi tinh',
    ethnicity: 'Dan toc',
    showOnMap: 'Hien tren ban do',
    dreams: 'Giac mo',
    dreamId: 'ID Giac mo',
    date: 'Ngay',
    night: 'Dem',
    hvdc: 'Ma HVdC',
    emotionsLabel: 'Cam xuc',
    source: 'Trich dan',
    disclaimer: 'Khong co giai thich AI. Chi du lieu nghien cuu goc.',
    noDreams: 'Khong tim thay giac mo',
    doi: 'DOI',
    demographics: 'Du lieu Nhan khau hoc',
    researchBannerTitle: 'Ho so Nghien cuu Khoa hoc — Chi Doc',
    researchBannerSub: 'Khong co tuong tac. Du lieu goc tu nghien cuu.',
    studyInfo: 'Thong tin nghien cuu',
    aboutStudy: 'Ve nghien cuu nay',
    country: 'Quoc gia',
    city: 'Thanh pho',
    license: 'Giay phep',
    statsInterpretations: 'Giai thich',
    dreamLabel: 'Giac mo',
    week: 'Tuan',
    words: 'tu',
    readMore: 'Doc them',
    showLess: 'Hien thi it hon',
    characters: 'Nhan vat',
    settings: 'Dia diem',
    themes: 'Chu de',
    showInterpretation: 'Xem Giai thich',
    noInterpretation: 'Khong co giai thich trong nghien cuu goc',
    scientificInterpretation: 'Giai thich Khoa hoc',
  },
  th: {
    title: 'โปรไฟล์ผู้เข้าร่วม',
    back: 'กลับ',
    loading: 'กำลังโหลดโปรไฟล์...',
    empty: 'ไม่พบข้อมูล',
    study: 'การศึกษา',
    researcher: 'นักวิจัย',
    institution: 'สถาบัน',
    period: 'ช่วงเวลา',
    age: 'อายุ',
    gender: 'เพศ',
    ethnicity: 'ชาติพันธุ์',
    showOnMap: 'แสดงบนแผนที่',
    dreams: 'ความฝัน',
    dreamId: 'รหัสความฝัน',
    date: 'วันที่',
    night: 'คืน',
    hvdc: 'รหัส HVdC',
    emotionsLabel: 'อารมณ์',
    source: 'การอ้างอิง',
    disclaimer: 'ไม่มีการตีความ AI ข้อมูลวิจัยต้นฉบับเท่านั้น',
    noDreams: 'ไม่พบความฝัน',
    doi: 'DOI',
    demographics: 'ข้อมูลประชากร',
    researchBannerTitle: 'โปรไฟล์การวิจัยทางวิทยาศาสตร์ — อ่านอย่างเดียว',
    researchBannerSub: 'ไม่สามารถโต้ตอบได้ ข้อมูลต้นฉบับจากการศึกษา',
    studyInfo: 'ข้อมูลการศึกษา',
    aboutStudy: 'เกี่ยวกับการศึกษานี้',
    country: 'ประเทศ',
    city: 'เมือง',
    license: 'ใบอนุญาต',
    statsInterpretations: 'การตีความ',
    dreamLabel: 'ความฝัน',
    week: 'สัปดาห์',
    words: 'คำ',
    readMore: 'อ่านเพิ่มเติม',
    showLess: 'แสดงน้อยลง',
    characters: 'ตัวละคร',
    settings: 'สถานที่',
    themes: 'ธีม',
    showInterpretation: 'แสดงการตีความ',
    noInterpretation: 'ไม่มีการตีความในการศึกษาต้นฉบับ',
    scientificInterpretation: 'การตีความทางวิทยาศาสตร์',
  },
  sw: {
    title: 'Wasifu wa Mshiriki',
    back: 'Rudi',
    loading: 'Inapakia wasifu...',
    empty: 'Hakuna data iliyopatikana',
    study: 'Utafiti',
    researcher: 'Mtafiti',
    institution: 'Taasisi',
    period: 'Kipindi',
    age: 'Umri',
    gender: 'Jinsia',
    ethnicity: 'Kabila',
    showOnMap: 'Onyesha kwenye ramani',
    dreams: 'Ndoto',
    dreamId: 'Kitambulisho cha Ndoto',
    date: 'Tarehe',
    night: 'Usiku',
    hvdc: 'Misimbo ya HVdC',
    emotionsLabel: 'Hisia',
    source: 'Nukuu',
    disclaimer: 'Hakuna tafsiri za AI. Data ya utafiti halisi tu.',
    noDreams: 'Hakuna ndoto zilizopatikana',
    doi: 'DOI',
    demographics: 'Data ya Idadi ya Watu',
    researchBannerTitle: 'Wasifu wa Utafiti wa Kisayansi — Soma Tu',
    researchBannerSub: 'Hakuna mwingiliano unaowezekana. Data halisi kutoka utafiti.',
    studyInfo: 'Maelezo ya utafiti',
    aboutStudy: 'Kuhusu utafiti huu',
    country: 'Nchi',
    city: 'Mji',
    license: 'Leseni',
    statsInterpretations: 'Tafsiri',
    dreamLabel: 'Ndoto',
    week: 'Wiki',
    words: 'maneno',
    readMore: 'Soma zaidi',
    showLess: 'Onyesha kidogo',
    characters: 'Wahusika',
    settings: 'Maeneo',
    themes: 'Mada',
    showInterpretation: 'Onyesha Tafsiri',
    noInterpretation: 'Hakuna tafsiri katika utafiti wa asili',
    scientificInterpretation: 'Tafsiri ya Kisayansi',
  },
  hu: {
    title: 'Resztvevo Profil',
    back: 'Vissza',
    loading: 'Profil betoltese...',
    empty: 'Nincs talalat',
    study: 'Tanulmany',
    researcher: 'Kutato',
    institution: 'Intezmeny',
    period: 'Idoszak',
    age: 'Kor',
    gender: 'Nem',
    ethnicity: 'Nemzetiseg',
    showOnMap: 'Megjelenites a terkepen',
    dreams: 'Almok',
    dreamId: 'Alom ID',
    date: 'Datum',
    night: 'Ejszaka',
    hvdc: 'HVdC kodok',
    emotionsLabel: 'Erzelmek',
    source: 'Hivatkozas',
    disclaimer: 'Nincs AI ertelmez. Csak eredeti kutatasi adatok.',
    noDreams: 'Nem talalhato alom',
    doi: 'DOI',
    demographics: 'Demografiai adatok',
    researchBannerTitle: 'Tudomanyos Kutatasi Profil — Csak Olvasas',
    researchBannerSub: 'Nincs interakcio lehetseges. Eredeti adatok a tanulmanybol.',
    studyInfo: 'Tanulmany info',
    aboutStudy: 'Errol a tanulmanyrol',
    country: 'Orszag',
    city: 'Varos',
    license: 'Licenc',
    statsInterpretations: 'Ertelmezesek',
    dreamLabel: 'Alom',
    week: 'Het',
    words: 'szo',
    readMore: 'Tovabb olvasom',
    showLess: 'Kevesebbet mutat',
    characters: 'Szereplok',
    settings: 'Helyszinek',
    themes: 'Temak',
    showInterpretation: 'Ertelmezest mutat',
    noInterpretation: 'Nincs ertelmezis az eredeti tanulmanyban',
    scientificInterpretation: 'Tudomanyos Ertelmez',
  },
} as Record<string, Record<string, string>>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  // Handle JSON arrays, comma-separated, or pipe-separated
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // not JSON
  }
  return raw
    .split(/[,|;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function getInterpretation(dream: DreamRow): InterpretationRow | null {
  if (!dream.interpretation) return null;
  if (Array.isArray(dream.interpretation))
    return dream.interpretation[0] ?? null;
  return dream.interpretation;
}

function buildApa(study: StudyRow): string {
  const year = study.year_start ?? '';
  const pub = study.publication ? ` ${study.publication}.` : '';
  const doiUrl = study.doi
    ? ` ${study.doi.startsWith('http') ? study.doi : `https://doi.org/${study.doi}`}`
    : '';
  return `${study.principal_investigator} (${year}). ${study.study_name}.${pub}${doiUrl}`;
}

function flagForLang(lang: string | null): string {
  if (!lang) return '';
  const flags: Record<string, string> = {
    en: '\u{1F1EC}\u{1F1E7}', de: '\u{1F1E9}\u{1F1EA}', tr: '\u{1F1F9}\u{1F1F7}',
    fr: '\u{1F1EB}\u{1F1F7}', es: '\u{1F1EA}\u{1F1F8}', ar: '\u{1F1F8}\u{1F1E6}',
    pt: '\u{1F1E7}\u{1F1F7}', ru: '\u{1F1F7}\u{1F1FA}', it: '\u{1F1EE}\u{1F1F9}',
    nl: '\u{1F1F3}\u{1F1F1}', ja: '\u{1F1EF}\u{1F1F5}', zh: '\u{1F1E8}\u{1F1F3}',
  };
  return flags[lang] || '\u{1F310}';
}

function formatDreamText(text: string): React.ReactNode {
  if (!text) return null;
  const paragraphs = text.split(/\n+/).filter(p => p.trim());

  return (
    <>
      {paragraphs.map((para, i) => {
        const trimmed = para.trim();
        const isQuote =
          (trimmed.startsWith('"') || trimmed.startsWith('\u201E') || trimmed.startsWith('\u201C')) &&
          (trimmed.endsWith('"') || trimmed.endsWith('\u201D') || trimmed.endsWith('\u201C'));

        if (isQuote) {
          return (
            <p key={i} style={{
              margin: '0 0 12px 0', paddingLeft: 16,
              borderLeft: '2px solid rgba(139,92,246,0.3)',
              fontStyle: 'italic', opacity: 0.9,
            }}>{para}</p>
          );
        }

        if (para.length > 300) {
          const sentences = para.match(/[^.!?]+[.!?]+\s*/g) || [para];
          const chunks: string[] = [];
          let current = '';
          sentences.forEach(s => {
            current += s;
            if (current.length > 150) { chunks.push(current.trim()); current = ''; }
          });
          if (current.trim()) chunks.push(current.trim());

          return (
            <React.Fragment key={i}>
              {chunks.map((chunk, j) => (
                <p key={j} style={{
                  margin: '0 0 12px 0',
                  ...(i === 0 && j === 0 ? { fontSize: 15, fontWeight: 500 } : {}),
                }}>{chunk}</p>
              ))}
            </React.Fragment>
          );
        }

        return (
          <p key={i} style={{
            margin: '0 0 12px 0',
            ...(i === 0 ? { fontSize: 15, fontWeight: 500 } : {}),
          }}>{para}</p>
        );
      })}
    </>
  );
}

// Color palette for tags
const TAG_COLORS = [
  'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
];

const TAG_COLORS_LIGHT = [
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ParticipantProfile: React.FC<ParticipantProfileProps> = ({
  participantId,
  language,
  isLight,
  onClose,
  onShowOnMap,
}) => {
  const t = (T as Record<string, Record<string, string>>)[language] ?? T.en;

  const [participant, setParticipant] = useState<ParticipantRow | null>(null);
  const [dreams, setDreams] = useState<DreamRow[]>([]);
  const [expandedDreams, setExpandedDreams] = useState<Set<string>>(new Set());
  const [expandedDreamTexts, setExpandedDreamTexts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showStudyInfo, setShowStudyInfo] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [participantRes, dreamsRes] = await Promise.all([
        supabase
          .from('research_participants')
          .select('*, study:research_studies(*)')
          .eq('participant_id', participantId)
          .single(),
        supabase
          .from('research_dreams')
          .select('*, interpretation:research_interpretations(*)')
          .eq('participant_id', participantId)
          .order('dream_date', { ascending: true })
          .order('dream_id', { ascending: true }),
      ]);

      if (participantRes.error) {
        console.error('Error fetching participant:', participantRes.error);
        setLoading(false);
        return;
      }
      setParticipant(participantRes.data as ParticipantRow);

      if (dreamsRes.error) {
        console.error('Error fetching dreams:', dreamsRes.error);
      } else {
        setDreams((dreamsRes.data as DreamRow[]) || []);
      }

      setLoading(false);
    };
    load();
  }, [participantId]);

  // Styles
  const bg = isLight ? 'bg-white' : 'bg-gray-900/95 backdrop-blur';
  const text = isLight ? 'text-gray-900' : 'text-white';
  const cardBg = isLight
    ? 'bg-gray-50 border-gray-200'
    : 'bg-gray-800/60 border-white/10';
  const btnPrimary =
    'bg-indigo-600 hover:bg-indigo-700 text-white transition-colors';
  const btnSecondary = isLight
    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
    : 'bg-gray-700 hover:bg-gray-600 text-white';
  const tagColors = isLight ? TAG_COLORS_LIGHT : TAG_COLORS;
  const emotionTag = isLight
    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';

  return (
    <div className={`min-h-screen ${bg} ${text} p-4 md:p-8`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${btnSecondary}`}
          >
            &larr; {t.back}
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">{t.title}</h1>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            <span className="ml-3 opacity-70">{t.loading}</span>
          </div>
        )}

        {/* Empty — mit participantId fuer Debugging */}
        {!loading && !participant && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <div className="opacity-70 font-medium">{t.empty}</div>
            <div className="text-sm opacity-40 mt-2 font-mono">{participantId}</div>
          </div>
        )}

        {!loading && participant && (() => {
          const study = participant.study ?? null;
          return (
          <>
            {/* Read-Only Research Banner */}
            <div className={`rounded-xl border p-4 mb-4 flex items-center gap-3 ${isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-900/20 border-amber-700/30 text-amber-200'}`}>
              <span className="text-xl">🔬</span>
              <div>
                <div className="font-semibold text-sm">
                  {t.researchBannerTitle}
                </div>
                <div className="text-xs opacity-70">
                  {t.researchBannerSub}
                </div>
              </div>
              <span className={`ml-auto px-2 py-0.5 rounded text-xs font-mono ${isLight ? 'bg-gray-200 text-gray-600' : 'bg-gray-700 text-gray-300'}`}>
                READ ONLY
              </span>
            </div>

            {/* Participant Info Card */}
            <div className={`rounded-xl border p-6 mb-6 ${cardBg}`}>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-2 flex-1">
                  <h2 className="text-xl font-bold">
                    {participant.participant_id || `P-${participant.id?.slice(0,8)}`}
                  </h2>

                  {study && (
                    <div className="relative text-sm opacity-80">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{t.study}:</span>{' '}
                        {study.study_name}
                        {study.study_code && (
                          <span
                            className="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                            style={{
                              backgroundColor: study.map_color || '#6366f1',
                            }}
                          >
                            {study.study_code}
                          </span>
                        )}
                        <button
                          onClick={() => setShowStudyInfo(!showStudyInfo)}
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                            showStudyInfo
                              ? 'bg-indigo-500 text-white'
                              : isLight
                                ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                                : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
                          }`}
                          title={t.studyInfo}
                        >
                          i
                        </button>
                      </div>

                      {showStudyInfo && (
                        <div
                          className={`mt-2 rounded-xl border p-4 space-y-1.5 text-sm ${
                            isLight
                              ? 'bg-white border-indigo-200/60 shadow-lg'
                              : 'bg-[#1a1030] border-indigo-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                          }`}
                        >
                          <h4 className="text-xs font-bold uppercase tracking-wide opacity-60 mb-2">
                            {t.aboutStudy}
                          </h4>
                          {study.principal_investigator && (
                            <div>
                              <span className="font-medium">{t.researcher}:</span>{' '}
                              {study.principal_investigator}
                            </div>
                          )}
                          {study.institution && (
                            <div>
                              <span className="font-medium">{t.institution}:</span>{' '}
                              {study.institution}
                            </div>
                          )}
                          {study.country && (
                            <div>
                              <span className="font-medium">{t.country}:</span>{' '}
                              {study.country}
                            </div>
                          )}
                          {(study.year_start || study.year_end) && (
                            <div>
                              <span className="font-medium">{t.period}:</span>{' '}
                              {study.year_start ?? '?'} &ndash; {study.year_end ?? '?'}
                            </div>
                          )}
                          {study.doi && (
                            <div>
                              <a
                                href={
                                  study.doi.startsWith('http')
                                    ? study.doi
                                    : `https://doi.org/${study.doi}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-400 hover:underline text-xs"
                              >
                                DOI: {study.doi}
                              </a>
                            </div>
                          )}
                          {study.license && (
                            <div className="text-xs opacity-70">
                              <span className="font-medium">{t.license}:</span>{' '}
                              {study.license}
                            </div>
                          )}
                          {study.description && (
                            <div className="mt-2 text-xs opacity-70 italic leading-relaxed">
                              {study.description}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Demographics (only if data exists) */}
                  {(participant.age || participant.gender || participant.ethnicity || participant.country) && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="text-xs font-medium opacity-60 mb-1">
                        {t.demographics}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm">
                        {participant.age && (
                          <span>
                            {t.age}: {participant.age}
                          </span>
                        )}
                        {participant.gender && (
                          <span>
                            {t.gender}: {participant.gender}
                          </span>
                        )}
                        {participant.ethnicity && (
                          <span>
                            {t.ethnicity}: {participant.ethnicity}
                          </span>
                        )}
                        {participant.country && (
                          <span>
                            {t.country}: {participant.country}
                          </span>
                        )}
                        {participant.city && (
                          <span>
                            {t.city}: {participant.city}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Map Button */}
                {onShowOnMap && study && (
                  <button
                    onClick={() => onShowOnMap(study.study_code)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${btnPrimary}`}
                  >
                    {t.showOnMap}
                  </button>
                )}
              </div>
            </div>

            {/* Stats Bar */}
            <div className={`flex gap-6 mb-6 p-3 rounded-xl border ${cardBg} text-sm`}>
              <span>🌙 {dreams.length} {t.dreams}</span>
              <span>💡 {dreams.filter(d => getInterpretation(d) !== null).length} {t.statsInterpretations}</span>
            </div>

            {/* Dreams List */}
            <h2 className="text-xl font-bold mb-4">
              {t.dreams} ({dreams.length})
            </h2>

            {dreams.length === 0 ? (
              <div className={`text-center py-10 rounded-xl border ${cardBg}`}>
                <div className="text-3xl mb-3">🌙</div>
                <div className="opacity-60">{t.noDreams}</div>
                <div className="text-xs opacity-30 mt-1 font-mono">{participantId}</div>
              </div>
            ) : (
              <div className="space-y-6">
                {dreams.map((dream, idx) => {
                  const wordCount = dream.dream_text?.split(/\s+/).filter(Boolean).length || 0;
                  return (
                  <div
                    key={dream.id || idx}
                    className={`rounded-xl border p-6 ${cardBg}`}
                  >
                    {/* Dream Header — Nummerierung + Meta */}
                    <div className="flex flex-wrap gap-3 items-center mb-1 text-sm">
                      <span className={`font-bold text-base ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>
                        {t.dreamLabel} #{idx + 1}
                      </span>
                      {dream.dream_date && (
                        <span className="opacity-60">
                          {dream.dream_date}
                        </span>
                      )}
                      {dream.original_language && (
                        <span className="opacity-60" title={dream.original_language}>
                          {flagForLang(dream.original_language)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center mb-3 text-xs opacity-50">
                      <span className="font-mono">{dream.dream_id}</span>
                      {dream.dream_night && (
                        <span>· {t.night} {dream.dream_night}</span>
                      )}
                      {dream.dream_week != null && (
                        <span>· {t.week} {dream.dream_week}</span>
                      )}
                      <span>· {wordCount} {t.words}</span>
                    </div>

                    {/* Dream Text — formatiert mit Expand/Collapse */}
                    {(() => {
                      const textIsLong = (dream.dream_text?.length ?? 0) > 500;
                      const isTextExpanded = expandedDreamTexts.has(dream.id);
                      return (
                        <div style={{
                          background: isLight ? '#f8f7ff' : 'rgba(15, 10, 30, 0.6)',
                          borderRadius: 12,
                          padding: '16px 20px',
                          lineHeight: 1.8,
                          fontSize: 14,
                          fontFamily: 'Georgia, "Times New Roman", serif',
                          color: isLight ? '#1e1b4b' : '#e2e8f0',
                          letterSpacing: '0.01em',
                          maxHeight: isTextExpanded || !textIsLong ? 'none' : 300,
                          overflow: isTextExpanded || !textIsLong ? 'visible' : 'hidden',
                          position: 'relative',
                          transition: 'max-height 0.3s ease',
                        }}>
                          <TranslatedText
                            text={dream.dream_text}
                            sourceId={dream.id}
                            table="research_dreams"
                            field="dream_text"
                            showOriginalToggle
                            as="div"
                            renderContent={formatDreamText}
                          />
                          {!isTextExpanded && textIsLong && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0, left: 0, right: 0, height: 60,
                              background: `linear-gradient(transparent, ${isLight ? '#f8f7ff' : 'rgba(15,10,30,0.95)'})`,
                              display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8,
                            }}>
                              <button onClick={() => setExpandedDreamTexts(prev => new Set(prev).add(dream.id))} style={{
                                background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)',
                                borderRadius: 20, padding: '4px 16px', color: '#c4b5fd', fontSize: 12, cursor: 'pointer',
                              }}>
                                {t.readMore} \u25BC
                              </button>
                            </div>
                          )}
                          {isTextExpanded && textIsLong && (
                            <div style={{ textAlign: 'center', marginTop: 8 }}>
                              <button onClick={() => setExpandedDreamTexts(prev => {
                                const next = new Set(prev); next.delete(dream.id); return next;
                              })} style={{
                                background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)',
                                borderRadius: 20, padding: '4px 16px', color: '#c4b5fd', fontSize: 12, cursor: 'pointer',
                              }}>
                                {t.showLess} \u25B2
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* HVdC Codes */}
                    {dream.hall_van_de_castle_codes && Object.keys(dream.hall_van_de_castle_codes).length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-medium opacity-60 mr-2">
                          {t.hvdc}:
                        </span>
                        <div className="inline-flex flex-wrap gap-1">
                          {Object.entries(dream.hall_van_de_castle_codes).map(([key, val], i) => (
                            <span
                              key={i}
                              className={`rounded-full px-2 py-0.5 text-xs border ${
                                tagColors[i % tagColors.length]
                              }`}
                            >
                              {key}: {val}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Emotions */}
                    {dream.emotions && dream.emotions.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium opacity-60 mr-2">
                          {t.emotionsLabel}:
                        </span>
                        <div className="inline-flex flex-wrap gap-1">
                          {(dream.emotions || []).map((emo, i) => (
                            <span
                              key={i}
                              className={`rounded-full px-2 py-0.5 text-xs border ${emotionTag}`}
                            >
                              {emo}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Characters */}
                    {dream.characters && dream.characters.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium opacity-60 mr-2">
                          {t.characters}:
                        </span>
                        <div className="inline-flex flex-wrap gap-1">
                          {dream.characters.map((ch, i) => (
                            <span key={i} className={`rounded-full px-2 py-0.5 text-xs border ${tagColors[i % tagColors.length]}`}>
                              {ch}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Settings */}
                    {dream.settings && dream.settings.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium opacity-60 mr-2">
                          {t.settings}:
                        </span>
                        <div className="inline-flex flex-wrap gap-1">
                          {dream.settings.map((s, i) => (
                            <span key={i} className={`rounded-full px-2 py-0.5 text-xs border ${tagColors[(i + 2) % tagColors.length]}`}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Themes */}
                    {dream.themes && dream.themes.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium opacity-60 mr-2">
                          {t.themes}:
                        </span>
                        <div className="inline-flex flex-wrap gap-1">
                          {dream.themes.map((th, i) => (
                            <span key={i} className={`rounded-full px-2 py-0.5 text-xs border ${tagColors[(i + 4) % tagColors.length]}`}>
                              {th}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interpretation Button */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                      {getInterpretation(dream) ? (
                        <button
                          onClick={() => setExpandedDreams(prev => {
                            const next = new Set(prev);
                            next.has(dream.id) ? next.delete(dream.id) : next.add(dream.id);
                            return next;
                          })}
                          className={`px-3 py-1 rounded-full border cursor-pointer transition-colors font-medium ${
                            isLight
                              ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                              : 'bg-amber-900/30 border-amber-700/40 text-amber-400 hover:bg-amber-900/50'
                          }`}
                        >
                          💡 {t.showInterpretation} {expandedDreams.has(dream.id) ? '▲' : '▼'}
                        </button>
                      ) : (
                        <span className="opacity-30 text-xs">
                          🔬 {t.noInterpretation}
                        </span>
                      )}
                    </div>
                    {/* Expanded Interpretation — goldener linker Rahmen */}
                    {expandedDreams.has(dream.id) && getInterpretation(dream) && (() => {
                      const interp = getInterpretation(dream)!;
                      return (
                        <div className={`mt-3 p-4 rounded-lg border-l-4 text-sm leading-[1.7] ${
                          isLight
                            ? 'bg-amber-50/60 border-amber-400 text-amber-950'
                            : 'bg-amber-900/15 border-amber-500 text-amber-100'
                        }`}>
                          <div className={`text-xs font-semibold mb-2 ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                            💡 {t.scientificInterpretation}
                          </div>
                          <p className="whitespace-pre-wrap">{interp.content}</p>
                          <div className="mt-3 flex gap-2 text-xs opacity-60">
                            <span className={`px-1.5 py-0.5 rounded ${isLight ? 'bg-amber-100' : 'bg-amber-900/40'}`}>
                              {interp.tradition}
                            </span>
                            <span>{new Date(interp.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  );
                })}
              </div>
            )}

            {/* Citation / Source */}
            {study && (
              <div
                className={`mt-8 p-4 rounded-xl border ${cardBg} text-sm space-y-2`}
              >
                <div className="font-bold">{t.source}</div>
                <div className="opacity-80 italic">{buildApa(study)}</div>
                <div className="text-xs opacity-50 pt-2 border-t border-white/10">
                  {t.disclaimer}
                </div>
              </div>
            )}
          </>
          );
        })()}
      </div>
    </div>
  );
};

export default ParticipantProfile;
