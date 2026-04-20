import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ResearchStudiesProps {
  language: string;
  isLight: boolean;
  onClose: () => void;
  onSelectStudy?: (studyCode: string) => void;
  onShowOnMap?: (studyCode: string) => void;
  onSelectParticipant?: (participantId: string) => void;
  initialStudyCode?: string;
}

interface Study {
  id: string;
  study_code: string;
  study_name: string;
  principal_investigator: string;
  institution: string;
  year_start: number | null;
  year_end: number | null;
  participant_count: number | null;
  total_dreams: number | null;
  country: string | null;
  doi: string | null;
  license: string | null;
  map_color: string | null;
  publication: string | null;
  description: string | null;
}

interface Participant {
  participant_id: string;
  study_id: string;
  age: number | null;
  gender: string | null;
}

type SortKey = 'year' | 'dreams' | 'alpha';

type StudyTypeKey = 'single' | 'journal' | 'survey';

function getStudyType(study: Study): { key: StudyTypeKey; color: string; icon: string } {
  const pc = study.participant_count ?? 0;
  const dc = study.total_dreams ?? 0;
  if (pc > 0 && pc <= 3) return { key: 'single', color: '#8B5CF6', icon: '\u{1F464}' };
  const avg = pc > 0 ? dc / pc : 0;
  if (avg > 5) return { key: 'journal', color: '#22c55e', icon: '\u{1F4D3}' };
  return { key: 'survey', color: '#3b82f6', icon: '\u{1F4CB}' };
}

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const T = {
  de: {
    title: 'Wissenschaftliche Studien',
    search: 'Studien durchsuchen...',
    sortYear: 'Nach Jahr',
    sortDreams: 'Nach Berichten',
    sortAlpha: 'Alphabetisch',
    studies: 'Studien',
    participants: 'Teilnehmer',
    dreams: 'Träume',
    countries: 'Länder',
    principal_investigator: 'Forscher',
    institution: 'Institution',
    period: 'Zeitraum',
    doi: 'DOI',
    license: 'Lizenz',
    showOnMap: 'Auf Karte anzeigen',
    showParticipants: 'Teilnehmer',
    hideParticipants: 'Teilnehmer ausblenden',
    back: 'Zurück',
    loading: 'Lade Studien...',
    empty: 'Keine Daten gefunden',
    noParticipants: 'Keine Teilnehmer gefunden',
  },
  en: {
    title: 'Scientific Studies',
    search: 'Search studies...',
    sortYear: 'By Year',
    sortDreams: 'By Reports',
    sortAlpha: 'Alphabetical',
    studies: 'Studies',
    participants: 'Participants',
    dreams: 'Dreams',
    countries: 'Countries',
    principal_investigator: 'Researcher',
    institution: 'Institution',
    period: 'Period',
    doi: 'DOI',
    license: 'License',
    showOnMap: 'Show on Map',
    showParticipants: 'Participants',
    hideParticipants: 'Hide Participants',
    back: 'Back',
    loading: 'Loading studies...',
    empty: 'No data found',
    noParticipants: 'No participants found',
  },
  tr: {
    title: 'Bilimsel Calismalar',
    search: 'Calisma ara...',
    sortYear: 'Yila gore',
    sortDreams: 'Raporlara gore',
    sortAlpha: 'Alfabetik',
    studies: 'Calismalar',
    participants: 'Katilimcilar',
    dreams: 'Ruyalar',
    countries: 'Ulkeler',
    principal_investigator: 'Arastirmaci',
    institution: 'Kurum',
    period: 'Donem',
    doi: 'DOI',
    license: 'Lisans',
    showOnMap: 'Haritada goster',
    showParticipants: 'Katilimcilar',
    hideParticipants: 'Katilimcilari gizle',
    back: 'Geri',
    loading: 'Calismalar yukleniyor...',
    empty: 'Veri bulunamadi',
    noParticipants: 'Katilimci bulunamadi',
  },
  es: {
    title: 'Estudios Cientificos',
    search: 'Buscar estudios...',
    sortYear: 'Por ano',
    sortDreams: 'Por informes',
    sortAlpha: 'Alfabetico',
    studies: 'Estudios',
    participants: 'Participantes',
    dreams: 'Suenos',
    countries: 'Paises',
    principal_investigator: 'Investigador',
    institution: 'Institucion',
    period: 'Periodo',
    doi: 'DOI',
    license: 'Licencia',
    showOnMap: 'Ver en mapa',
    showParticipants: 'Participantes',
    hideParticipants: 'Ocultar participantes',
    back: 'Volver',
    loading: 'Cargando estudios...',
    empty: 'No se encontraron datos',
    noParticipants: 'No se encontraron participantes',
  },
  fr: {
    title: 'Etudes Scientifiques',
    search: 'Rechercher des etudes...',
    sortYear: 'Par annee',
    sortDreams: 'Par rapports',
    sortAlpha: 'Alphabetique',
    studies: 'Etudes',
    participants: 'Participants',
    dreams: 'Reves',
    countries: 'Pays',
    principal_investigator: 'Chercheur',
    institution: 'Institution',
    period: 'Periode',
    doi: 'DOI',
    license: 'Licence',
    showOnMap: 'Voir sur la carte',
    showParticipants: 'Participants',
    hideParticipants: 'Masquer les participants',
    back: 'Retour',
    loading: 'Chargement des etudes...',
    empty: 'Aucune donnee trouvee',
    noParticipants: 'Aucun participant trouve',
  },
  ar: {
    title: 'الدراسات العلمية',
    search: 'البحث في الدراسات...',
    sortYear: 'حسب السنة',
    sortDreams: 'حسب التقارير',
    sortAlpha: 'أبجدي',
    studies: 'دراسات',
    participants: 'مشاركون',
    dreams: 'أحلام',
    countries: 'دول',
    principal_investigator: 'باحث',
    institution: 'مؤسسة',
    period: 'الفترة',
    doi: 'DOI',
    license: 'الترخيص',
    showOnMap: 'عرض على الخريطة',
    showParticipants: 'المشاركون',
    hideParticipants: 'إخفاء المشاركين',
    back: 'رجوع',
    loading: 'جاري تحميل الدراسات...',
    empty: 'لم يتم العثور على بيانات',
    noParticipants: 'لم يتم العثور على مشاركين',
  },
  pt: {
    title: 'Estudos Cientificos',
    search: 'Pesquisar estudos...',
    sortYear: 'Por ano',
    sortDreams: 'Por relatorios',
    sortAlpha: 'Alfabetico',
    studies: 'Estudos',
    participants: 'Participantes',
    dreams: 'Sonhos',
    countries: 'Paises',
    principal_investigator: 'Pesquisador',
    institution: 'Instituicao',
    period: 'Periodo',
    doi: 'DOI',
    license: 'Licenca',
    showOnMap: 'Ver no mapa',
    showParticipants: 'Participantes',
    hideParticipants: 'Ocultar participantes',
    back: 'Voltar',
    loading: 'Carregando estudos...',
    empty: 'Nenhum dado encontrado',
    noParticipants: 'Nenhum participante encontrado',
  },
  ru: {
    title: 'Научные Исследования',
    search: 'Поиск исследований...',
    sortYear: 'По году',
    sortDreams: 'По отчётам',
    sortAlpha: 'По алфавиту',
    studies: 'Исследования',
    participants: 'Участники',
    dreams: 'Сны',
    countries: 'Страны',
    principal_investigator: 'Исследователь',
    institution: 'Учреждение',
    period: 'Период',
    doi: 'DOI',
    license: 'Лицензия',
    showOnMap: 'Показать на карте',
    showParticipants: 'Участники',
    hideParticipants: 'Скрыть участников',
    back: 'Назад',
    loading: 'Загрузка исследований...',
    empty: 'Данные не найдены',
    noParticipants: 'Участники не найдены',
  },
  zh: {
    title: '科学研究',
    search: '搜索研究...',
    sortYear: '按年份',
    sortDreams: '按报告',
    sortAlpha: '按字母',
    studies: '研究',
    participants: '参与者',
    dreams: '梦境',
    countries: '国家',
    principal_investigator: '研究员',
    institution: '机构',
    period: '时间段',
    doi: 'DOI',
    license: '许可证',
    showOnMap: '在地图上显示',
    showParticipants: '参与者',
    hideParticipants: '隐藏参与者',
    back: '返回',
    loading: '正在加载研究...',
    empty: '未找到数据',
    noParticipants: '未找到参与者',
  },
  hi: {
    title: 'वैज्ञानिक अध्ययन',
    search: 'अध्ययन खोजें...',
    sortYear: 'वर्ष के अनुसार',
    sortDreams: 'रिपोर्ट के अनुसार',
    sortAlpha: 'वर्णानुक्रम',
    studies: 'अध्ययन',
    participants: 'प्रतिभागी',
    dreams: 'सपने',
    countries: 'देश',
    principal_investigator: 'शोधकर्ता',
    institution: 'संस्था',
    period: 'अवधि',
    doi: 'DOI',
    license: 'लाइसेंस',
    showOnMap: 'मानचित्र पर दिखाएं',
    showParticipants: 'प्रतिभागी',
    hideParticipants: 'प्रतिभागी छुपाएं',
    back: 'वापस',
    loading: 'अध्ययन लोड हो रहे हैं...',
    empty: 'कोई डेटा नहीं मिला',
    noParticipants: 'कोई प्रतिभागी नहीं मिला',
  },
  ja: {
    title: '科学的研究',
    search: '研究を検索...',
    sortYear: '年別',
    sortDreams: 'レポート別',
    sortAlpha: 'アルファベット順',
    studies: '研究',
    participants: '参加者',
    dreams: '夢',
    countries: '国',
    principal_investigator: '研究者',
    institution: '機関',
    period: '期間',
    doi: 'DOI',
    license: 'ライセンス',
    showOnMap: '地図で表示',
    showParticipants: '参加者',
    hideParticipants: '参加者を非表示',
    back: '戻る',
    loading: '研究を読み込み中...',
    empty: 'データが見つかりません',
    noParticipants: '参加者が見つかりません',
  },
  ko: {
    title: '과학적 연구',
    search: '연구 검색...',
    sortYear: '연도별',
    sortDreams: '보고서별',
    sortAlpha: '알파벳순',
    studies: '연구',
    participants: '참여자',
    dreams: '꿈',
    countries: '국가',
    principal_investigator: '연구원',
    institution: '기관',
    period: '기간',
    doi: 'DOI',
    license: '라이선스',
    showOnMap: '지도에서 보기',
    showParticipants: '참여자',
    hideParticipants: '참여자 숨기기',
    back: '뒤로',
    loading: '연구 로딩 중...',
    empty: '데이터를 찾을 수 없습니다',
    noParticipants: '참여자를 찾을 수 없습니다',
  },
  id: {
    title: 'Studi Ilmiah',
    search: 'Cari studi...',
    sortYear: 'Berdasarkan tahun',
    sortDreams: 'Berdasarkan laporan',
    sortAlpha: 'Abjad',
    studies: 'Studi',
    participants: 'Peserta',
    dreams: 'Mimpi',
    countries: 'Negara',
    principal_investigator: 'Peneliti',
    institution: 'Institusi',
    period: 'Periode',
    doi: 'DOI',
    license: 'Lisensi',
    showOnMap: 'Tampilkan di peta',
    showParticipants: 'Peserta',
    hideParticipants: 'Sembunyikan peserta',
    back: 'Kembali',
    loading: 'Memuat studi...',
    empty: 'Data tidak ditemukan',
    noParticipants: 'Tidak ada peserta ditemukan',
  },
  fa: {
    title: 'مطالعات علمی',
    search: 'جستجوی مطالعات...',
    sortYear: 'بر اساس سال',
    sortDreams: 'بر اساس گزارش',
    sortAlpha: 'الفبایی',
    studies: 'مطالعات',
    participants: 'شرکت‌کنندگان',
    dreams: 'رویاها',
    countries: 'کشورها',
    principal_investigator: 'پژوهشگر',
    institution: 'موسسه',
    period: 'دوره',
    doi: 'DOI',
    license: 'مجوز',
    showOnMap: 'نمایش روی نقشه',
    showParticipants: 'شرکت‌کنندگان',
    hideParticipants: 'پنهان کردن شرکت‌کنندگان',
    back: 'بازگشت',
    loading: 'در حال بارگذاری مطالعات...',
    empty: 'داده‌ای یافت نشد',
    noParticipants: 'شرکت‌کننده‌ای یافت نشد',
  },
  it: {
    title: 'Studi Scientifici',
    search: 'Cerca studi...',
    sortYear: 'Per anno',
    sortDreams: 'Per rapporti',
    sortAlpha: 'Alfabetico',
    studies: 'Studi',
    participants: 'Partecipanti',
    dreams: 'Sogni',
    countries: 'Paesi',
    principal_investigator: 'Ricercatore',
    institution: 'Istituzione',
    period: 'Periodo',
    doi: 'DOI',
    license: 'Licenza',
    showOnMap: 'Mostra sulla mappa',
    showParticipants: 'Partecipanti',
    hideParticipants: 'Nascondi partecipanti',
    back: 'Indietro',
    loading: 'Caricamento studi...',
    empty: 'Nessun dato trovato',
    noParticipants: 'Nessun partecipante trovato',
  },
  pl: {
    title: 'Badania Naukowe',
    search: 'Szukaj badan...',
    sortYear: 'Wedlug roku',
    sortDreams: 'Wedlug raportow',
    sortAlpha: 'Alfabetycznie',
    studies: 'Badania',
    participants: 'Uczestnicy',
    dreams: 'Sny',
    countries: 'Kraje',
    principal_investigator: 'Badacz',
    institution: 'Instytucja',
    period: 'Okres',
    doi: 'DOI',
    license: 'Licencja',
    showOnMap: 'Pokaz na mapie',
    showParticipants: 'Uczestnicy',
    hideParticipants: 'Ukryj uczestnikow',
    back: 'Wstecz',
    loading: 'Ladowanie badan...',
    empty: 'Nie znaleziono danych',
    noParticipants: 'Nie znaleziono uczestnikow',
  },
  bn: {
    title: 'বৈজ্ঞানিক গবেষণা',
    search: 'গবেষণা খুঁজুন...',
    sortYear: 'বছর অনুযায়ী',
    sortDreams: 'প্রতিবেদন অনুযায়ী',
    sortAlpha: 'বর্ণানুক্রমিক',
    studies: 'গবেষণা',
    participants: 'অংশগ্রহণকারী',
    dreams: 'স্বপ্ন',
    countries: 'দেশ',
    principal_investigator: 'গবেষক',
    institution: 'প্রতিষ্ঠান',
    period: 'সময়কাল',
    doi: 'DOI',
    license: 'লাইসেন্স',
    showOnMap: 'মানচিত্রে দেখান',
    showParticipants: 'অংশগ্রহণকারী',
    hideParticipants: 'অংশগ্রহণকারী লুকান',
    back: 'ফিরে যান',
    loading: 'গবেষণা লোড হচ্ছে...',
    empty: 'কোনো ডেটা পাওয়া যায়নি',
    noParticipants: 'কোনো অংশগ্রহণকারী পাওয়া যায়নি',
  },
  ur: {
    title: 'سائنسی مطالعات',
    search: 'مطالعات تلاش کریں...',
    sortYear: 'سال کے مطابق',
    sortDreams: 'رپورٹس کے مطابق',
    sortAlpha: 'حروف تہجی',
    studies: 'مطالعات',
    participants: 'شرکاء',
    dreams: 'خواب',
    countries: 'ممالک',
    principal_investigator: 'محقق',
    institution: 'ادارہ',
    period: 'مدت',
    doi: 'DOI',
    license: 'لائسنس',
    showOnMap: 'نقشے پر دکھائیں',
    showParticipants: 'شرکاء',
    hideParticipants: 'شرکاء چھپائیں',
    back: 'واپس',
    loading: 'مطالعات لوڈ ہو رہی ہیں...',
    empty: 'کوئی ڈیٹا نہیں ملا',
    noParticipants: 'کوئی شرکاء نہیں ملے',
  },
  vi: {
    title: 'Nghien cuu Khoa hoc',
    search: 'Tim kiem nghien cuu...',
    sortYear: 'Theo nam',
    sortDreams: 'Theo bao cao',
    sortAlpha: 'Theo bang chu cai',
    studies: 'Nghien cuu',
    participants: 'Nguoi tham gia',
    dreams: 'Giac mo',
    countries: 'Quoc gia',
    principal_investigator: 'Nha nghien cuu',
    institution: 'To chuc',
    period: 'Giai doan',
    doi: 'DOI',
    license: 'Giay phep',
    showOnMap: 'Hien tren ban do',
    showParticipants: 'Nguoi tham gia',
    hideParticipants: 'An nguoi tham gia',
    back: 'Quay lai',
    loading: 'Dang tai nghien cuu...',
    empty: 'Khong tim thay du lieu',
    noParticipants: 'Khong tim thay nguoi tham gia',
  },
  th: {
    title: 'การศึกษาทางวิทยาศาสตร์',
    search: 'ค้นหาการศึกษา...',
    sortYear: 'ตามปี',
    sortDreams: 'ตามรายงาน',
    sortAlpha: 'ตามตัวอักษร',
    studies: 'การศึกษา',
    participants: 'ผู้เข้าร่วม',
    dreams: 'ความฝัน',
    countries: 'ประเทศ',
    principal_investigator: 'นักวิจัย',
    institution: 'สถาบัน',
    period: 'ช่วงเวลา',
    doi: 'DOI',
    license: 'สัญญาอนุญาต',
    showOnMap: 'แสดงบนแผนที่',
    showParticipants: 'ผู้เข้าร่วม',
    hideParticipants: 'ซ่อนผู้เข้าร่วม',
    back: 'กลับ',
    loading: 'กำลังโหลดการศึกษา...',
    empty: 'ไม่พบข้อมูล',
    noParticipants: 'ไม่พบผู้เข้าร่วม',
  },
  sw: {
    title: 'Tafiti za Kisayansi',
    search: 'Tafuta tafiti...',
    sortYear: 'Kwa mwaka',
    sortDreams: 'Kwa ripoti',
    sortAlpha: 'Kialfabeti',
    studies: 'Tafiti',
    participants: 'Washiriki',
    dreams: 'Ndoto',
    countries: 'Nchi',
    principal_investigator: 'Mtafiti',
    institution: 'Taasisi',
    period: 'Kipindi',
    doi: 'DOI',
    license: 'Leseni',
    showOnMap: 'Onyesha kwenye ramani',
    showParticipants: 'Washiriki',
    hideParticipants: 'Ficha washiriki',
    back: 'Rudi',
    loading: 'Inapakia tafiti...',
    empty: 'Hakuna data iliyopatikana',
    noParticipants: 'Hakuna washiriki waliopatikana',
  },
  hu: {
    title: 'Tudomanyos Tanulmanyok',
    search: 'Tanulmanyok keresese...',
    sortYear: 'Ev szerint',
    sortDreams: 'Jelentesek szerint',
    sortAlpha: 'ABC sorrendben',
    studies: 'Tanulmanyok',
    participants: 'Resztvevok',
    dreams: 'Almok',
    countries: 'Orszagok',
    principal_investigator: 'Kutato',
    institution: 'Intezmeny',
    period: 'Idoszak',
    doi: 'DOI',
    license: 'Licenc',
    showOnMap: 'Megjelenites a terkepen',
    showParticipants: 'Resztvevok',
    hideParticipants: 'Resztvevok elrejtese',
    back: 'Vissza',
    loading: 'Tanulmanyok betoltese...',
    empty: 'Nincs talalat',
    noParticipants: 'Nem talalhato resztvevo',
  },
} as Record<string, Record<string, string>>;

// Extra filter/card translations not in T
const RST: Record<string, {
  dreamLength: string;
  all: string;
  min50: string;
  min100: string;
  min200: string;
  long500: string;
  dreamsPerPart: string;
  diaries30: string;
  studyType: string;
  of: string;
  studies2: string;
  country: string;
  dreamReportsInStudy: string;
  importingGradually: string;
  viewStudy: string;
  noDataYet: string;
  typeSingle: string;
  typeJournal: string;
  typeSurvey: string;
  contentLabel?: string;
  withInterpretations?: string;
}> = {
  de: {
    dreamLength: 'Trauml\u00e4nge:',
    all: 'Alle',
    min50: 'Mind. 50 W\u00f6rter',
    min100: 'Mind. 100 W\u00f6rter',
    min200: 'Mind. 200 W\u00f6rter',
    long500: 'Lange Texte (500+)',
    dreamsPerPart: 'Tr\u00e4ume/TN:',
    diaries30: 'Tageb\u00fccher (30+)',
    studyType: 'Studientyp:',
    of: 'von',
    studies2: 'Studien',
    country: 'Land',
    dreamReportsInStudy: 'Traumberichte in Originalstudie',
    importingGradually: 'Daten werden nach und nach importiert',
    viewStudy: 'Studie ansehen',
    noDataYet: 'Noch keine Daten verf\u00fcgbar',
    typeSingle: 'Einzelperson',
    typeJournal: 'Tageb\u00fccher',
    typeSurvey: 'Umfragen',
    contentLabel: 'Inhalt:',
    withInterpretations: 'Mit Deutungen',
  },
  en: {
    dreamLength: 'Dream length:',
    all: 'All',
    min50: 'Min. 50 words',
    min100: 'Min. 100 words',
    min200: 'Min. 200 words',
    long500: 'Long texts (500+)',
    dreamsPerPart: 'Dreams/P:',
    diaries30: 'Diaries (30+)',
    studyType: 'Study type:',
    of: 'of',
    studies2: 'studies',
    country: 'Country',
    dreamReportsInStudy: 'dream reports in original study',
    importingGradually: 'Data is being imported gradually',
    viewStudy: 'View study',
    noDataYet: 'No data available yet',
    typeSingle: 'Single person',
    typeJournal: 'Diaries',
    typeSurvey: 'Surveys',
    contentLabel: 'Content:',
    withInterpretations: 'With interpretations',
  },
  tr: {
    dreamLength: 'Ruya uzunlugu:',
    all: 'Hepsi',
    min50: 'Min. 50 kelime',
    min100: 'Min. 100 kelime',
    min200: 'Min. 200 kelime',
    long500: 'Uzun metinler (500+)',
    dreamsPerPart: 'Ruya/Katilimci:',
    diaries30: 'Gunlukler (30+)',
    studyType: 'Calisma turu:',
    of: '/',
    studies2: 'calisma',
    country: 'Ulke',
    dreamReportsInStudy: 'orijinal calismadaki ruya raporlari',
    importingGradually: 'Veriler kademeli olarak iceri aktariliyor',
    viewStudy: 'Calismaya goz at',
    noDataYet: 'Henuz veri yok',
    typeSingle: 'Tek kisi',
    typeJournal: 'Gunlukler',
    typeSurvey: 'Anketler',
  },
  es: {
    dreamLength: 'Longitud del sueno:',
    all: 'Todos',
    min50: 'Min. 50 palabras',
    min100: 'Min. 100 palabras',
    min200: 'Min. 200 palabras',
    long500: 'Textos largos (500+)',
    dreamsPerPart: 'Suenos/P:',
    diaries30: 'Diarios (30+)',
    studyType: 'Tipo de estudio:',
    of: 'de',
    studies2: 'estudios',
    country: 'Pais',
    dreamReportsInStudy: 'informes de suenos en el estudio original',
    importingGradually: 'Los datos se importan gradualmente',
    viewStudy: 'Ver estudio',
    noDataYet: 'Aun no hay datos disponibles',
    typeSingle: 'Persona individual',
    typeJournal: 'Diarios',
    typeSurvey: 'Encuestas',
  },
  fr: {
    dreamLength: 'Longueur du reve:',
    all: 'Tous',
    min50: 'Min. 50 mots',
    min100: 'Min. 100 mots',
    min200: 'Min. 200 mots',
    long500: 'Textes longs (500+)',
    dreamsPerPart: 'Reves/P:',
    diaries30: 'Journaux (30+)',
    studyType: 'Type d\'etude:',
    of: 'sur',
    studies2: 'etudes',
    country: 'Pays',
    dreamReportsInStudy: 'rapports de reves dans l\'etude originale',
    importingGradually: 'Les donnees sont importees progressivement',
    viewStudy: 'Voir l\'etude',
    noDataYet: 'Pas encore de donnees disponibles',
    typeSingle: 'Personne seule',
    typeJournal: 'Journaux',
    typeSurvey: 'Enquetes',
  },
  ar: {
    dreamLength: 'طول الحلم:',
    all: 'الكل',
    min50: 'الحد الأدنى 50 كلمة',
    min100: 'الحد الأدنى 100 كلمة',
    min200: 'الحد الأدنى 200 كلمة',
    long500: 'نصوص طويلة (500+)',
    dreamsPerPart: 'أحلام/م:',
    diaries30: 'يوميات (30+)',
    studyType: 'نوع الدراسة:',
    of: 'من',
    studies2: 'دراسات',
    country: 'البلد',
    dreamReportsInStudy: 'تقارير الأحلام في الدراسة الأصلية',
    importingGradually: 'يتم استيراد البيانات تدريجياً',
    viewStudy: 'عرض الدراسة',
    noDataYet: 'لا توجد بيانات حتى الآن',
    typeSingle: 'شخص واحد',
    typeJournal: 'يوميات',
    typeSurvey: 'استطلاعات',
  },
  pt: {
    dreamLength: 'Comprimento do sonho:',
    all: 'Todos',
    min50: 'Min. 50 palavras',
    min100: 'Min. 100 palavras',
    min200: 'Min. 200 palavras',
    long500: 'Textos longos (500+)',
    dreamsPerPart: 'Sonhos/P:',
    diaries30: 'Diarios (30+)',
    studyType: 'Tipo de estudo:',
    of: 'de',
    studies2: 'estudos',
    country: 'Pais',
    dreamReportsInStudy: 'relatorios de sonhos no estudo original',
    importingGradually: 'Os dados estao sendo importados gradualmente',
    viewStudy: 'Ver estudo',
    noDataYet: 'Nenhum dado disponivel ainda',
    typeSingle: 'Pessoa individual',
    typeJournal: 'Diarios',
    typeSurvey: 'Pesquisas',
  },
  ru: {
    dreamLength: 'Длина сна:',
    all: 'Все',
    min50: 'Мин. 50 слов',
    min100: 'Мин. 100 слов',
    min200: 'Мин. 200 слов',
    long500: 'Длинные тексты (500+)',
    dreamsPerPart: 'Снов/уч:',
    diaries30: 'Дневники (30+)',
    studyType: 'Тип исследования:',
    of: 'из',
    studies2: 'исследований',
    country: 'Страна',
    dreamReportsInStudy: 'отчётов о снах в оригинальном исследовании',
    importingGradually: 'Данные импортируются постепенно',
    viewStudy: 'Просмотр исследования',
    noDataYet: 'Данных пока нет',
    typeSingle: 'Один человек',
    typeJournal: 'Дневники',
    typeSurvey: 'Опросы',
  },
  zh: {
    dreamLength: '梦境长度:',
    all: '全部',
    min50: '最少50字',
    min100: '最少100字',
    min200: '最少200字',
    long500: '长文本 (500+)',
    dreamsPerPart: '梦/人:',
    diaries30: '日记 (30+)',
    studyType: '研究类型:',
    of: '/',
    studies2: '项研究',
    country: '国家',
    dreamReportsInStudy: '原始研究中的梦境报告',
    importingGradually: '数据正在逐步导入',
    viewStudy: '查看研究',
    noDataYet: '暂无数据',
    typeSingle: '单人',
    typeJournal: '日记',
    typeSurvey: '调查',
  },
  hi: {
    dreamLength: 'सपने की लंबाई:',
    all: 'सभी',
    min50: 'न्यूनतम 50 शब्द',
    min100: 'न्यूनतम 100 शब्द',
    min200: 'न्यूनतम 200 शब्द',
    long500: 'लंबे पाठ (500+)',
    dreamsPerPart: 'सपने/प्र:',
    diaries30: 'डायरी (30+)',
    studyType: 'अध्ययन प्रकार:',
    of: 'में से',
    studies2: 'अध्ययन',
    country: 'देश',
    dreamReportsInStudy: 'मूल अध्ययन में सपने की रिपोर्ट',
    importingGradually: 'डेटा धीरे-धीरे आयात किया जा रहा है',
    viewStudy: 'अध्ययन देखें',
    noDataYet: 'अभी तक कोई डेटा उपलब्ध नहीं',
    typeSingle: 'एकल व्यक्ति',
    typeJournal: 'डायरी',
    typeSurvey: 'सर्वेक्षण',
  },
  ja: {
    dreamLength: '夢の長さ:',
    all: 'すべて',
    min50: '最低50語',
    min100: '最低100語',
    min200: '最低200語',
    long500: '長いテキスト (500+)',
    dreamsPerPart: '夢/参:',
    diaries30: '日記 (30+)',
    studyType: '研究タイプ:',
    of: '/',
    studies2: '件の研究',
    country: '国',
    dreamReportsInStudy: '元の研究の夢レポート',
    importingGradually: 'データは徐々にインポートされています',
    viewStudy: '研究を見る',
    noDataYet: 'データがまだありません',
    typeSingle: '個人',
    typeJournal: '日記',
    typeSurvey: '調査',
  },
  ko: {
    dreamLength: '꿈 길이:',
    all: '전체',
    min50: '최소 50단어',
    min100: '최소 100단어',
    min200: '최소 200단어',
    long500: '긴 텍스트 (500+)',
    dreamsPerPart: '꿈/참:',
    diaries30: '일기 (30+)',
    studyType: '연구 유형:',
    of: '/',
    studies2: '개 연구',
    country: '국가',
    dreamReportsInStudy: '원본 연구의 꿈 보고서',
    importingGradually: '데이터가 점진적으로 가져오기 중입니다',
    viewStudy: '연구 보기',
    noDataYet: '아직 데이터 없음',
    typeSingle: '개인',
    typeJournal: '일기',
    typeSurvey: '설문',
  },
  id: {
    dreamLength: 'Panjang mimpi:',
    all: 'Semua',
    min50: 'Min. 50 kata',
    min100: 'Min. 100 kata',
    min200: 'Min. 200 kata',
    long500: 'Teks panjang (500+)',
    dreamsPerPart: 'Mimpi/P:',
    diaries30: 'Diari (30+)',
    studyType: 'Jenis studi:',
    of: 'dari',
    studies2: 'studi',
    country: 'Negara',
    dreamReportsInStudy: 'laporan mimpi dalam studi asli',
    importingGradually: 'Data sedang diimpor secara bertahap',
    viewStudy: 'Lihat studi',
    noDataYet: 'Belum ada data tersedia',
    typeSingle: 'Perorangan',
    typeJournal: 'Diari',
    typeSurvey: 'Survei',
  },
  fa: {
    dreamLength: 'طول رویا:',
    all: 'همه',
    min50: 'حداقل ۵۰ کلمه',
    min100: 'حداقل ۱۰۰ کلمه',
    min200: 'حداقل ۲۰۰ کلمه',
    long500: 'متون طولانی (۵۰۰+)',
    dreamsPerPart: 'رویا/ش:',
    diaries30: 'دفترچه‌ها (۳۰+)',
    studyType: 'نوع مطالعه:',
    of: 'از',
    studies2: 'مطالعه',
    country: 'کشور',
    dreamReportsInStudy: 'گزارش‌های رویا در مطالعه اصلی',
    importingGradually: 'داده‌ها به تدریج وارد می‌شوند',
    viewStudy: 'مشاهده مطالعه',
    noDataYet: 'هنوز داده‌ای موجود نیست',
    typeSingle: 'تک نفره',
    typeJournal: 'دفترچه‌ها',
    typeSurvey: 'نظرسنجی‌ها',
  },
  it: {
    dreamLength: 'Lunghezza del sogno:',
    all: 'Tutti',
    min50: 'Min. 50 parole',
    min100: 'Min. 100 parole',
    min200: 'Min. 200 parole',
    long500: 'Testi lunghi (500+)',
    dreamsPerPart: 'Sogni/P:',
    diaries30: 'Diari (30+)',
    studyType: 'Tipo di studio:',
    of: 'di',
    studies2: 'studi',
    country: 'Paese',
    dreamReportsInStudy: 'resoconti di sogni nello studio originale',
    importingGradually: 'I dati vengono importati gradualmente',
    viewStudy: 'Visualizza studio',
    noDataYet: 'Nessun dato ancora disponibile',
    typeSingle: 'Singola persona',
    typeJournal: 'Diari',
    typeSurvey: 'Sondaggi',
  },
  pl: {
    dreamLength: 'Dlugosc snu:',
    all: 'Wszystkie',
    min50: 'Min. 50 slow',
    min100: 'Min. 100 slow',
    min200: 'Min. 200 slow',
    long500: 'Dlugie teksty (500+)',
    dreamsPerPart: 'Sny/ucz:',
    diaries30: 'Dzienniki (30+)',
    studyType: 'Typ badania:',
    of: 'z',
    studies2: 'badan',
    country: 'Kraj',
    dreamReportsInStudy: 'raportow snow w oryginalnym badaniu',
    importingGradually: 'Dane sa stopniowo importowane',
    viewStudy: 'Zobacz badanie',
    noDataYet: 'Brak danych',
    typeSingle: 'Jedna osoba',
    typeJournal: 'Dzienniki',
    typeSurvey: 'Ankiety',
  },
  bn: {
    dreamLength: 'স্বপ্নের দৈর্ঘ্য:',
    all: 'সব',
    min50: 'ন্যূনতম ৫০ শব্দ',
    min100: 'ন্যূনতম ১০০ শব্দ',
    min200: 'ন্যূনতম ২০০ শব্দ',
    long500: 'দীর্ঘ পাঠ (৫০০+)',
    dreamsPerPart: 'স্বপ্ন/প্র:',
    diaries30: 'ডায়েরি (৩০+)',
    studyType: 'গবেষণার ধরন:',
    of: 'এর মধ্যে',
    studies2: 'গবেষণা',
    country: 'দেশ',
    dreamReportsInStudy: 'মূল গবেষণায় স্বপ্নের প্রতিবেদন',
    importingGradually: 'তথ্য ধীরে ধীরে আমদানি হচ্ছে',
    viewStudy: 'গবেষণা দেখুন',
    noDataYet: 'এখনো কোনো ডেটা নেই',
    typeSingle: 'একক ব্যক্তি',
    typeJournal: 'ডায়েরি',
    typeSurvey: 'জরিপ',
  },
  ur: {
    dreamLength: 'خواب کی لمبائی:',
    all: 'سب',
    min50: 'کم از کم 50 الفاظ',
    min100: 'کم از کم 100 الفاظ',
    min200: 'کم از کم 200 الفاظ',
    long500: 'طویل متن (500+)',
    dreamsPerPart: 'خواب/ش:',
    diaries30: 'ڈائریاں (30+)',
    studyType: 'مطالعہ کی قسم:',
    of: 'میں سے',
    studies2: 'مطالعات',
    country: 'ملک',
    dreamReportsInStudy: 'اصل مطالعے میں خواب کی رپورٹیں',
    importingGradually: 'ڈیٹا آہستہ آہستہ درآمد ہو رہا ہے',
    viewStudy: 'مطالعہ دیکھیں',
    noDataYet: 'ابھی کوئی ڈیٹا دستیاب نہیں',
    typeSingle: 'واحد شخص',
    typeJournal: 'ڈائریاں',
    typeSurvey: 'سروے',
  },
  vi: {
    dreamLength: 'Do dai giac mo:',
    all: 'Tat ca',
    min50: 'Min. 50 tu',
    min100: 'Min. 100 tu',
    min200: 'Min. 200 tu',
    long500: 'Van ban dai (500+)',
    dreamsPerPart: 'Giac mo/N:',
    diaries30: 'Nhat ky (30+)',
    studyType: 'Loai nghien cuu:',
    of: 'trong so',
    studies2: 'nghien cuu',
    country: 'Quoc gia',
    dreamReportsInStudy: 'bao cao giac mo trong nghien cuu goc',
    importingGradually: 'Du lieu dang duoc nhap dan',
    viewStudy: 'Xem nghien cuu',
    noDataYet: 'Chua co du lieu',
    typeSingle: 'Ca nhan',
    typeJournal: 'Nhat ky',
    typeSurvey: 'Khao sat',
  },
  th: {
    dreamLength: 'ความยาวของความฝัน:',
    all: 'ทั้งหมด',
    min50: 'ขั้นต่ำ 50 คำ',
    min100: 'ขั้นต่ำ 100 คำ',
    min200: 'ขั้นต่ำ 200 คำ',
    long500: 'ข้อความยาว (500+)',
    dreamsPerPart: 'ฝัน/ผู้:',
    diaries30: 'บันทึก (30+)',
    studyType: 'ประเภทการศึกษา:',
    of: 'จาก',
    studies2: 'การศึกษา',
    country: 'ประเทศ',
    dreamReportsInStudy: 'รายงานความฝันในการศึกษาต้นฉบับ',
    importingGradually: 'ข้อมูลกำลังถูกนำเข้าทีละน้อย',
    viewStudy: 'ดูการศึกษา',
    noDataYet: 'ยังไม่มีข้อมูล',
    typeSingle: 'บุคคลเดียว',
    typeJournal: 'บันทึก',
    typeSurvey: 'แบบสำรวจ',
  },
  sw: {
    dreamLength: 'Urefu wa ndoto:',
    all: 'Zote',
    min50: 'Kima cha 50 maneno',
    min100: 'Kima cha 100 maneno',
    min200: 'Kima cha 200 maneno',
    long500: 'Maandishi marefu (500+)',
    dreamsPerPart: 'Ndoto/M:',
    diaries30: 'Daftari (30+)',
    studyType: 'Aina ya utafiti:',
    of: 'kati ya',
    studies2: 'tafiti',
    country: 'Nchi',
    dreamReportsInStudy: 'ripoti za ndoto katika utafiti wa asili',
    importingGradually: 'Data inaingizwa polepole',
    viewStudy: 'Tazama utafiti',
    noDataYet: 'Bado hakuna data',
    typeSingle: 'Mtu mmoja',
    typeJournal: 'Daftari',
    typeSurvey: 'Tafiti',
  },
  hu: {
    dreamLength: 'Alom hossza:',
    all: 'Osszes',
    min50: 'Min. 50 szo',
    min100: 'Min. 100 szo',
    min200: 'Min. 200 szo',
    long500: 'Hosszu szovegek (500+)',
    dreamsPerPart: 'Almok/R:',
    diaries30: 'Naplok (30+)',
    studyType: 'Tanulmany tipusa:',
    of: '/',
    studies2: 'tanulmany',
    country: 'Orszag',
    dreamReportsInStudy: 'alom-jelentesek az eredeti tanulmanyban',
    importingGradually: 'Az adatok fokozatosan importalodnak',
    viewStudy: 'Tanulmany megtekintese',
    noDataYet: 'Meg nincsenek adatok',
    typeSingle: 'Egyetlen szemely',
    typeJournal: 'Naplok',
    typeSurvey: 'Felmeresek',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ResearchStudies: React.FC<ResearchStudiesProps> = ({
  language,
  isLight,
  onClose,
  onSelectStudy,
  onShowOnMap,
  onSelectParticipant,
  initialStudyCode,
}) => {
  const t = (T as Record<string, Record<string, string>>)[language] ?? T.en;
  const r = RST[language] ?? RST.en;

  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('year');
  const [expandedStudy, setExpandedStudy] = useState<string | null>(initialStudyCode ?? null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [dbCounts, setDbCounts] = useState<{
    participants: number;
    dreams: number;
  } | null>(null);
  const [filterWordCount, setFilterWordCount] = useState<number>(0);
  const [filterDreamsPerPart, setFilterDreamsPerPart] = useState<number>(0);
  const [filterStudyType, setFilterStudyType] = useState<string>('all');
  const [filterHasInterpretations, setFilterHasInterpretations] = useState<boolean>(false);
  const [studiesWithInterpretations, setStudiesWithInterpretations] = useState<Set<string>>(new Set());
  const [studyAvgWordCounts, setStudyAvgWordCounts] = useState<Record<string, number> | null>(null);
  const [participantPage, setParticipantPage] = useState(0);

  // Fetch studies
  useEffect(() => {
    const fetchStudies = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('research_studies')
        .select('*');
      if (error) {
        console.error('Error fetching studies:', error);
      }
      setStudies((data as Study[]) || []);
      setLoading(false);
    };
    fetchStudies();
  }, []);

  // Fetch actual DB counts (not metadata sums)
  useEffect(() => {
    const fetchCounts = async () => {
      const [dreamsRes, participantsRes] = await Promise.all([
        supabase
          .from('research_dreams')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('research_participants')
          .select('*', { count: 'exact', head: true }),
      ]);
      setDbCounts({
        participants: participantsRes.count ?? 0,
        dreams: dreamsRes.count ?? 0,
      });
    };
    fetchCounts();
  }, []);

  // Background: avg word counts per study for filter
  useEffect(() => {
    const run = async () => {
      const PAGE = 1000;
      const stats: Record<string, { tw: number; c: number }> = {};
      let offset = 0;
      let hasMore = true;
      while (hasMore) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const batch: any[] = [];
        for (let i = 0; i < 5 && hasMore; i++) {
          batch.push(
            supabase.from('research_dreams')
              .select('participant_id, dream_text')
              .range(offset, offset + PAGE - 1)
              .order('id')
          );
          offset += PAGE;
        }
        const results = await Promise.all(batch);
        for (const { data } of results) {
          if (!data || data.length === 0) { hasMore = false; continue; }
          if (data.length < PAGE) hasMore = false;
          for (const d of data) {
            const code = (d.participant_id as string)?.match(/^(SDDB-\d+)/)?.[1];
            if (!code) continue;
            if (!stats[code]) stats[code] = { tw: 0, c: 0 };
            stats[code].tw += ((d.dream_text as string)?.split(/\s+/).filter(Boolean).length || 0);
            stats[code].c++;
          }
        }
      }
      const result: Record<string, number> = {};
      for (const [code, s] of Object.entries(stats)) {
        result[code] = s.c > 0 ? Math.round(s.tw / s.c) : 0;
      }
      setStudyAvgWordCounts(result);
    };
    run();
  }, []);

  // Fetch welche Studien Deutungen (interpretations) haben
  useEffect(() => {
    const fetchInterpretationStudies = async () => {
      try {
        const { data } = await supabase
          .from('research_dreams')
          .select('participant_id')
          .not('scientific_interpretation', 'is', null)
          .limit(5000);
        if (data) {
          const codes = new Set<string>();
          for (const d of data) {
            const code = (d.participant_id as string)?.match(/^(SDDB-\d+)/)?.[1];
            if (code) codes.add(code);
          }
          setStudiesWithInterpretations(codes);
        }
      } catch { /* ignore */ }
    };
    fetchInterpretationStudies();
  }, []);

  // Fetch ALL participants when a study is expanded (paginate DB in batches of 1000)
  useEffect(() => {
    if (!expandedStudy) {
      setParticipants([]);
      setParticipantPage(0);
      return;
    }
    const study = studies.find((s) => s.study_code === expandedStudy);
    if (!study) return;
    setParticipantPage(0);

    const fetchParticipants = async () => {
      setLoadingParticipants(true);
      let all: Participant[] = [];
      let offset = 0;
      const PAGE = 1000;
      while (true) {
        const { data, error } = await supabase
          .from('research_participants')
          .select('participant_id, study_id, age, gender')
          .eq('study_id', study.id)
          .range(offset, offset + PAGE - 1);
        if (error) { console.error('Error fetching participants:', error); break; }
        if (!data || data.length === 0) break;
        all = [...all, ...(data as Participant[])];
        if (data.length < PAGE) break;
        offset += PAGE;
      }
      setParticipants(all);
      setLoadingParticipants(false);
    };
    fetchParticipants();
  }, [expandedStudy, studies]);

  // Filter + sort
  const filtered = useMemo(() => {
    // When navigated from map with a specific study code → show only that study
    if (initialStudyCode) {
      return studies.filter(s => s.study_code === initialStudyCode);
    }

    const q = search.toLowerCase();
    let list = studies.filter(
      (s) =>
        s.study_name?.toLowerCase().includes(q) ||
        s.principal_investigator?.toLowerCase().includes(q) ||
        s.study_code?.toLowerCase().includes(q)
    );

    if (filterStudyType !== 'all') {
      list = list.filter(s => getStudyType(s).key === filterStudyType);
    }
    if (filterDreamsPerPart > 0) {
      list = list.filter(s => {
        const pc = s.participant_count ?? 0;
        const dc = s.total_dreams ?? 0;
        return pc > 0 && (dc / pc) >= filterDreamsPerPart;
      });
    }
    if (filterWordCount > 0 && studyAvgWordCounts) {
      list = list.filter(s => (studyAvgWordCounts[s.study_code] ?? 0) >= filterWordCount);
    }
    if (filterHasInterpretations && studiesWithInterpretations.size > 0) {
      list = list.filter(s => studiesWithInterpretations.has(s.study_code));
    }

    switch (sortKey) {
      case 'year':
        list = [...list].sort(
          (a, b) => (b.year_start ?? 0) - (a.year_start ?? 0)
        );
        break;
      case 'dreams':
        list = [...list].sort(
          (a, b) => (b.total_dreams ?? 0) - (a.total_dreams ?? 0)
        );
        break;
      case 'alpha':
        list = [...list].sort((a, b) =>
          (a.study_name ?? '').localeCompare(b.study_name ?? '')
        );
        break;
    }
    return list;
  }, [studies, search, sortKey, filterStudyType, filterDreamsPerPart, filterWordCount, studyAvgWordCounts, filterHasInterpretations, studiesWithInterpretations, initialStudyCode]);

  // Stats – use real DB counts when available, fall back to metadata sums
  const stats = useMemo(() => {
    const countriesSet = new Set(
      studies.map((s) => s.country).filter(Boolean)
    );
    return {
      studies: studies.length,
      participants: dbCounts?.participants ?? studies.reduce(
        (sum, s) => sum + (s.participant_count ?? 0), 0
      ),
      dreams: dbCounts?.dreams ?? studies.reduce(
        (sum, s) => sum + (s.total_dreams ?? 0), 0
      ),
      countries: countriesSet.size,
    };
  }, [studies, dbCounts]);

  // Styles
  const bg = isLight ? 'bg-white' : 'bg-gray-900/95 backdrop-blur';
  const text = isLight ? 'text-gray-900' : 'text-white';
  const cardBg = isLight
    ? 'bg-gray-50 border-gray-200'
    : 'bg-gray-800/60 border-white/10';
  const inputBg = isLight
    ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
    : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400';
  const btnPrimary =
    'bg-indigo-600 hover:bg-indigo-700 text-white transition-colors';
  const btnSecondary = isLight
    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
    : 'bg-gray-700 hover:bg-gray-600 text-white';
  const sortBtnActive = 'bg-indigo-600 text-white';
  const sortBtnInactive = isLight
    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    : 'bg-gray-800 text-gray-300 hover:bg-gray-700';

  return (
    <div className={`min-h-screen ${bg} ${text} p-4 md:p-8`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${btnSecondary}`}
          >
            &larr; {t.back}
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">{t.title}</h1>
        </div>

        {/* Stats Banner */}
        {!loading && (
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-xl border ${cardBg}`}
          >
            {[
              { label: t.studies, value: stats.studies },
              { label: t.participants, value: stats.participants.toLocaleString() },
              { label: t.dreams, value: stats.dreams.toLocaleString() },
              { label: t.countries, value: stats.countries },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-2xl font-bold text-indigo-400">
                  {item.value}
                </div>
                <div className="text-sm opacity-70">{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search + Sort */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`flex-1 px-4 py-2 rounded-lg border text-sm ${inputBg}`}
          />
          <div className="flex gap-2">
            {(
              [
                ['year', t.sortYear],
                ['dreams', t.sortDreams],
                ['alpha', t.sortAlpha],
              ] as [SortKey, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  sortKey === key ? sortBtnActive : sortBtnInactive
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Chips */}
        {!loading && (
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs opacity-50 whitespace-nowrap" style={{ minWidth: 80 }}>
                {r.dreamLength}
              </span>
              {([
                { v: 0, l: r.all },
                { v: 50, l: r.min50 },
                { v: 100, l: r.min100 },
                { v: 200, l: r.min200 },
                { v: 500, l: r.long500 },
              ] as const).map(f => (
                <button key={f.v} onClick={() => setFilterWordCount(f.v)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  border: filterWordCount === f.v ? '1px solid #8B5CF6' : '1px solid rgba(139,92,246,0.3)',
                  background: filterWordCount === f.v ? 'rgba(139,92,246,0.2)' : 'transparent',
                  color: filterWordCount === f.v ? '#c4b5fd' : (f.v > 0 && !studyAvgWordCounts) ? '#4a5568' : '#94a3b8',
                  cursor: (f.v > 0 && !studyAvgWordCounts) ? 'wait' : 'pointer',
                  whiteSpace: 'nowrap', opacity: (f.v > 0 && !studyAvgWordCounts) ? 0.5 : 1,
                }}>{f.l}{f.v > 0 && !studyAvgWordCounts ? ' ...' : ''}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs opacity-50 whitespace-nowrap" style={{ minWidth: 80 }}>
                {r.dreamsPerPart}
              </span>
              {([
                { v: 0, l: r.all },
                { v: 5, l: 'Multi-Traum (5+)' },
                { v: 30, l: r.diaries30 },
                { v: 100, l: 'Intensiv (100+)' },
              ] as const).map(f => (
                <button key={f.v} onClick={() => setFilterDreamsPerPart(f.v)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  border: filterDreamsPerPart === f.v ? '1px solid #8B5CF6' : '1px solid rgba(139,92,246,0.3)',
                  background: filterDreamsPerPart === f.v ? 'rgba(139,92,246,0.2)' : 'transparent',
                  color: filterDreamsPerPart === f.v ? '#c4b5fd' : '#94a3b8',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}>{f.l}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs opacity-50 whitespace-nowrap" style={{ minWidth: 80 }}>
                {r.studyType}
              </span>
              {([
                { v: 'all', l: r.all },
                { v: 'survey', l: `\u{1F4CB} ${r.typeSurvey}` },
                { v: 'journal', l: `\u{1F4D3} ${r.typeJournal}` },
                { v: 'single', l: `\u{1F464} ${r.typeSingle}` },
              ] as const).map(f => (
                <button key={f.v} onClick={() => setFilterStudyType(f.v)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  border: filterStudyType === f.v ? '1px solid #8B5CF6' : '1px solid rgba(139,92,246,0.3)',
                  background: filterStudyType === f.v ? 'rgba(139,92,246,0.2)' : 'transparent',
                  color: filterStudyType === f.v ? '#c4b5fd' : '#94a3b8',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}>{f.l}</button>
              ))}
            </div>
            {/* Filter Row 4: Inhalt / Deutungen */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs opacity-50 whitespace-nowrap" style={{ minWidth: 80 }}>
                {r.contentLabel ?? 'Inhalt:'}
              </span>
              <button onClick={() => setFilterHasInterpretations(false)} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: !filterHasInterpretations ? '1px solid #8B5CF6' : '1px solid rgba(139,92,246,0.3)',
                background: !filterHasInterpretations ? 'rgba(139,92,246,0.2)' : 'transparent',
                color: !filterHasInterpretations ? '#c4b5fd' : '#94a3b8',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>{r.all}</button>
              <button onClick={() => setFilterHasInterpretations(true)} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: filterHasInterpretations ? '1px solid #8B5CF6' : '1px solid rgba(139,92,246,0.3)',
                background: filterHasInterpretations ? 'rgba(139,92,246,0.2)' : 'transparent',
                color: filterHasInterpretations ? '#c4b5fd' : '#94a3b8',
                cursor: studiesWithInterpretations.size === 0 ? 'wait' : 'pointer',
                whiteSpace: 'nowrap',
                opacity: studiesWithInterpretations.size === 0 ? 0.5 : 1,
              }}>📖 {r.withInterpretations ?? 'Mit Deutungen'}{studiesWithInterpretations.size === 0 ? ' ...' : ''}</button>
            </div>
            {(filterWordCount > 0 || filterDreamsPerPart > 0 || filterStudyType !== 'all' || filterHasInterpretations) && (
              <div className="text-xs opacity-50">
                {filtered.length} {r.of} {studies.length} {r.studies2}
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            <span className="ml-3 opacity-70">{t.loading}</span>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 opacity-50">{t.empty}</div>
        )}

        {/* Study Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((study) => (
              <div
                key={study.id}
                className={`rounded-xl border p-6 ${cardBg} flex flex-col gap-3`}
              >
                {/* Badge + Study Type */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold text-white"
                      style={{
                        backgroundColor: study.map_color || '#6366f1',
                      }}
                    >
                      {study.study_code}
                    </span>
                    {(() => { const st = getStudyType(study); const stLabel = st.key === 'single' ? r.typeSingle : st.key === 'journal' ? r.typeJournal : r.typeSurvey; return (
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{
                        backgroundColor: st.color + '20', color: st.color,
                        border: `1px solid ${st.color}40`,
                      }}>{st.icon} {stLabel}</span>
                    ); })()}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold leading-snug">
                  {study.study_name}
                </h3>

                {/* Researcher + Institution */}
                <div className="text-sm opacity-70">
                  <div>
                    {t.principal_investigator}: {study.principal_investigator}
                  </div>
                  <div>
                    {t.institution}: {study.institution}
                  </div>
                  {study.country && (
                    <div>
                      {r.country}: {study.country}
                    </div>
                  )}
                </div>
                {study.description && (
                  <div className="text-xs opacity-60 italic leading-relaxed">
                    {study.description}
                  </div>
                )}

                {/* Period */}
                {(study.year_start || study.year_end) && (
                  <div className="text-sm opacity-60">
                    {t.period}: {study.year_start ?? '?'} &ndash;{' '}
                    {study.year_end ?? '?'}
                  </div>
                )}

                {/* Counts */}
                <div className="flex gap-4 text-sm">
                  {study.participant_count != null && (
                    <span>
                      {study.participant_count} {t.participants}
                    </span>
                  )}
                  {study.total_dreams != null && (
                    <span>
                      {study.total_dreams} {t.dreams}
                    </span>
                  )}
                </div>

                {/* DOI */}
                {study.doi && (
                  <a
                    href={
                      study.doi.startsWith('http')
                        ? study.doi
                        : `https://doi.org/${study.doi}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:underline truncate"
                  >
                    {t.doi}: {study.doi}
                  </a>
                )}

                {/* License */}
                {study.license && (
                  <span className="inline-block rounded-full px-2 py-0.5 text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 w-fit">
                    {t.license}: {study.license}
                  </span>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto pt-2">
                  {onShowOnMap && (
                    <button
                      onClick={() => onShowOnMap(study.study_code)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium ${btnPrimary}`}
                    >
                      {t.showOnMap}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setExpandedStudy(
                        expandedStudy === study.study_code
                          ? null
                          : study.study_code
                      )
                    }
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium ${btnSecondary}`}
                  >
                    {expandedStudy === study.study_code
                      ? t.hideParticipants
                      : t.showParticipants}
                  </button>
                </div>

                {/* Participants Expandable */}
                {expandedStudy === study.study_code && (
                  <div
                    className={`mt-2 p-3 rounded-lg border ${
                      isLight
                        ? 'bg-white border-gray-200'
                        : 'bg-gray-900/60 border-white/5'
                    }`}
                  >
                    {loadingParticipants ? (
                      <div className="flex items-center gap-2 py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500" />
                        <span className="text-xs opacity-50">...</span>
                      </div>
                    ) : participants.length === 0 && (study.total_dreams ?? 0) > 0 ? (
                      <div style={{
                        padding: '12px 16px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: 12,
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        margin: '8px 0',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 16 }}>📊</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: isLight ? '#6d28d9' : '#c4b5fd' }}>
                            {(study.total_dreams ?? 0).toLocaleString()} {r.dreamReportsInStudy}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, opacity: 0.7, margin: '4px 0 0 28px' }}>
                          {r.importingGradually}
                        </p>
                        {study.doi && (
                          <a
                            href={study.doi.startsWith('http') ? study.doi : `https://doi.org/${study.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 12, color: '#8B5CF6', marginLeft: 28, marginTop: 4, display: 'inline-block' }}
                          >
                            {r.viewStudy} →
                          </a>
                        )}
                      </div>
                    ) : participants.length === 0 ? (
                      <p style={{ fontSize: 13, opacity: 0.5, padding: '8px 0', margin: 0 }}>
                        {r.noDataYet}
                      </p>
                    ) : (() => {
                        const studyObj = studies.find(s => s.study_code === expandedStudy);
                        const studyColor = studyObj?.map_color || '#6366f1';
                        const PPAGE = 50;
                        const visible = participants.slice(0, (participantPage + 1) * PPAGE);
                        return (
                          <>
                            {/* Participant count header */}
                            <div className="flex items-center gap-2 mb-2 px-1">
                              <span
                                className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: studyColor }}
                              />
                              <span className="text-xs font-semibold opacity-80">
                                {language === 'de'
                                  ? `${participants.length} Teilnehmer — je Profil alle Träume`
                                  : `${participants.length} participants — each profile shows all dreams`}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {visible.map((p) => (
                                <button
                                  key={p.participant_id}
                                  onClick={() => onSelectParticipant?.(p.participant_id)}
                                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors border"
                                  style={{
                                    background: `${studyColor}15`,
                                    borderColor: `${studyColor}35`,
                                    color: isLight ? '#1f2937' : '#f0eeff',
                                  }}
                                >
                                  <span
                                    className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: studyColor }}
                                  />
                                  <span className="font-mono tracking-tight">{p.participant_id}</span>
                                  {(p.gender || p.age) && (
                                    <span className="opacity-50 ml-0.5">
                                      {[p.gender, p.age != null ? p.age : null].filter(Boolean).join(', ')}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                            {participants.length > visible.length && (
                              <button
                                onClick={() => setParticipantPage(prev => prev + 1)}
                                className={`mt-3 w-full py-1.5 rounded-lg text-xs font-medium border ${btnSecondary}`}
                                style={{ borderColor: `${studyColor}30` }}
                              >
                                {visible.length} / {participants.length} —{' '}
                                {language === 'de' ? 'weitere laden' : 'load more'}
                              </button>
                            )}
                          </>
                        );
                      })()
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchStudies;
