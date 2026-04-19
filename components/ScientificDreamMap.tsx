import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../services/supabaseClient';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScientificDreamMapProps {
  language: string;
  isLight: boolean;
  onClose: () => void;
  onSelectParticipant?: (participantId: string) => void;
  onSelectStudy?: (studyCode: string) => void;
}

interface ResearchStudy {
  study_code: string;
  study_name: string;
  map_color: string;
  country: string;
  lat: number;
  lng: number;
  total_dreams: number;
  principal_investigator: string;
  institution?: string | null;
}

interface StudyMapMarker {
  study_code: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  dream_count: number;
  map_color: string;
  marker_size: number;
}

interface ResearchParticipant {
  participant_id: string;
  study_code: string;
  country: string | null;
  lat: number;
  lng: number;
  dream_count: number;
  age: number | null;
  gender: string | null;
  ethnicity: string | null;
}

// ─── i18n ────────────────────────────────────────────────────────────────────

interface Translations {
  title: string;
  subtitle: string;
  back: string;
  loading: string;
  noToken: string;
  studies: string;
  dreams: string;
  researcher: string;
  location: string;
  details: string;
  filterTitle: string;
  filterStudy: string;
  filterCountry: string;
  filterYear: string;
  allStudies: string;
  allCountries: string;
  legend: string;
  totalDreams: string;
  participants: string;
  noData: string;
  showAll: string;
  markers: string;
  reset: string;
}

const TRANSLATIONS: Record<string, Translations> = {
  de: {
    title: 'Wissenschaftliche Traumkarte',
    subtitle: 'Globale Forschungsdaten',
    back: 'Zurück',
    loading: 'Daten werden geladen...',
    noToken: 'Mapbox-Token fehlt. Bitte VITE_MAPBOX_TOKEN in der .env setzen.',
    studies: 'Studien',
    dreams: 'Träume',
    researcher: 'Forscher',
    location: 'Standort',
    details: 'Details',
    filterTitle: 'Filter',
    filterStudy: 'Studie',
    filterCountry: 'Land',
    filterYear: 'Jahr',
    allStudies: 'Alle Studien',
    allCountries: 'Alle Länder',
    legend: 'Legende',
    totalDreams: 'Träume gesamt',
    participants: 'Teilnehmer',
    noData: 'Keine Daten verfügbar',
    showAll: 'Alle anzeigen',
    markers: 'Marker',
    reset: 'Zurücksetzen',
  },
  en: {
    title: 'Scientific Dream Map',
    subtitle: 'Global Research Data',
    back: 'Back',
    loading: 'Loading data...',
    noToken: 'Mapbox token missing. Please set VITE_MAPBOX_TOKEN in your .env file.',
    studies: 'Studies',
    dreams: 'Dreams',
    researcher: 'Researcher',
    location: 'Location',
    details: 'Details',
    filterTitle: 'Filters',
    filterStudy: 'Study',
    filterCountry: 'Country',
    filterYear: 'Year',
    allStudies: 'All Studies',
    allCountries: 'All Countries',
    legend: 'Legend',
    totalDreams: 'Total Dreams',
    participants: 'Participants',
    noData: 'No data available',
    showAll: 'Show all',
    markers: 'Markers',
    reset: 'Reset',
  },
  tr: {
    title: 'Bilimsel Rüya Haritası',
    subtitle: 'Küresel Araştırma Verileri',
    back: 'Geri',
    loading: 'Veriler yükleniyor...',
    noToken: 'Mapbox token eksik. Lütfen .env dosyasında VITE_MAPBOX_TOKEN ayarlayın.',
    studies: 'Çalışmalar',
    dreams: 'Rüyalar',
    researcher: 'Araştırmacı',
    location: 'Konum',
    details: 'Detaylar',
    filterTitle: 'Filtreler',
    filterStudy: 'Çalışma',
    filterCountry: 'Ülke',
    filterYear: 'Yıl',
    allStudies: 'Tüm Çalışmalar',
    allCountries: 'Tüm Ülkeler',
    legend: 'Lejant',
    totalDreams: 'Toplam Rüya',
    participants: 'Katılımcılar',
    noData: 'Veri bulunamadı',
    showAll: 'Tümünü göster',
    markers: 'İşaretçiler',
    reset: 'Sıfırla',
  },
  ar: {
    title: 'خريطة الأحلام العلمية',
    subtitle: 'بيانات البحث العالمية',
    back: 'رجوع',
    loading: 'جاري تحميل البيانات...',
    noToken: 'رمز Mapbox مفقود. يرجى تعيين VITE_MAPBOX_TOKEN في ملف .env.',
    studies: 'الدراسات',
    dreams: 'الأحلام',
    researcher: 'الباحث',
    location: 'الموقع',
    details: 'التفاصيل',
    filterTitle: 'التصفية',
    filterStudy: 'الدراسة',
    filterCountry: 'البلد',
    filterYear: 'السنة',
    allStudies: 'جميع الدراسات',
    allCountries: 'جميع البلدان',
    legend: 'مفتاح الخريطة',
    totalDreams: 'إجمالي الأحلام',
    participants: 'المشاركون',
    noData: 'لا توجد بيانات',
    showAll: 'عرض الكل',
    markers: 'العلامات',
    reset: 'إعادة تعيين',
  },
  zh: {
    title: '科学梦境地图',
    subtitle: '全球研究数据',
    back: '返回',
    loading: '数据加载中...',
    noToken: '缺少Mapbox令牌。请在.env文件中设置VITE_MAPBOX_TOKEN。',
    studies: '研究',
    dreams: '梦境',
    researcher: '研究员',
    location: '位置',
    details: '详情',
    filterTitle: '筛选',
    filterStudy: '研究',
    filterCountry: '国家',
    filterYear: '年份',
    allStudies: '所有研究',
    allCountries: '所有国家',
    legend: '图例',
    totalDreams: '梦境总数',
    participants: '参与者',
    noData: '无可用数据',
    showAll: '显示全部',
    markers: '标记',
    reset: '重置',
  },
  hi: {
    title: 'वैज्ञानिक स्वप्न मानचित्र',
    subtitle: 'वैश्विक अनुसंधान डेटा',
    back: 'वापस',
    loading: 'डेटा लोड हो रहा है...',
    noToken: 'Mapbox टोकन गायब है। कृपया .env फ़ाइल में VITE_MAPBOX_TOKEN सेट करें।',
    studies: 'अध्ययन',
    dreams: 'सपने',
    researcher: 'शोधकर्ता',
    location: 'स्थान',
    details: 'विवरण',
    filterTitle: 'फ़िल्टर',
    filterStudy: 'अध्ययन',
    filterCountry: 'देश',
    filterYear: 'वर्ष',
    allStudies: 'सभी अध्ययन',
    allCountries: 'सभी देश',
    legend: 'लेजेंड',
    totalDreams: 'कुल सपने',
    participants: 'प्रतिभागी',
    noData: 'कोई डेटा उपलब्ध नहीं',
    showAll: 'सभी दिखाएँ',
    markers: 'मार्कर',
    reset: 'रीसेट',
  },
  ja: {
    title: '科学的ドリームマップ',
    subtitle: 'グローバル研究データ',
    back: '戻る',
    loading: 'データを読み込み中...',
    noToken: 'Mapboxトークンがありません。.envファイルでVITE_MAPBOX_TOKENを設定してください。',
    studies: '研究',
    dreams: '夢',
    researcher: '研究者',
    location: '場所',
    details: '詳細',
    filterTitle: 'フィルター',
    filterStudy: '研究',
    filterCountry: '国',
    filterYear: '年',
    allStudies: 'すべての研究',
    allCountries: 'すべての国',
    legend: '凡例',
    totalDreams: '夢の合計',
    participants: '参加者',
    noData: 'データがありません',
    showAll: 'すべて表示',
    markers: 'マーカー',
    reset: 'リセット',
  },
  ko: {
    title: '과학적 꿈 지도',
    subtitle: '글로벌 연구 데이터',
    back: '뒤로',
    loading: '데이터 로드 중...',
    noToken: 'Mapbox 토큰이 없습니다. .env 파일에서 VITE_MAPBOX_TOKEN을 설정하세요.',
    studies: '연구',
    dreams: '꿈',
    researcher: '연구자',
    location: '위치',
    details: '세부정보',
    filterTitle: '필터',
    filterStudy: '연구',
    filterCountry: '국가',
    filterYear: '연도',
    allStudies: '모든 연구',
    allCountries: '모든 국가',
    legend: '범례',
    totalDreams: '총 꿈',
    participants: '참가자',
    noData: '사용 가능한 데이터 없음',
    showAll: '모두 보기',
    markers: '마커',
    reset: '초기화',
  },
  id: {
    title: 'Peta Mimpi Ilmiah',
    subtitle: 'Data Penelitian Global',
    back: 'Kembali',
    loading: 'Memuat data...',
    noToken: 'Token Mapbox tidak ditemukan. Silakan atur VITE_MAPBOX_TOKEN di file .env.',
    studies: 'Studi',
    dreams: 'Mimpi',
    researcher: 'Peneliti',
    location: 'Lokasi',
    details: 'Detail',
    filterTitle: 'Filter',
    filterStudy: 'Studi',
    filterCountry: 'Negara',
    filterYear: 'Tahun',
    allStudies: 'Semua Studi',
    allCountries: 'Semua Negara',
    legend: 'Legenda',
    totalDreams: 'Total Mimpi',
    participants: 'Peserta',
    noData: 'Tidak ada data tersedia',
    showAll: 'Tampilkan semua',
    markers: 'Penanda',
    reset: 'Atur ulang',
  },
  fa: {
    title: 'نقشه علمی رؤیاها',
    subtitle: 'داده‌های تحقیقاتی جهانی',
    back: 'بازگشت',
    loading: 'در حال بارگذاری داده‌ها...',
    noToken: 'توکن Mapbox یافت نشد. لطفاً VITE_MAPBOX_TOKEN را در فایل .env تنظیم کنید.',
    studies: 'مطالعات',
    dreams: 'رؤیاها',
    researcher: 'محقق',
    location: 'مکان',
    details: 'جزئیات',
    filterTitle: 'فیلترها',
    filterStudy: 'مطالعه',
    filterCountry: 'کشور',
    filterYear: 'سال',
    allStudies: 'همه مطالعات',
    allCountries: 'همه کشورها',
    legend: 'راهنما',
    totalDreams: 'مجموع رؤیاها',
    participants: 'شرکت‌کنندگان',
    noData: 'داده‌ای موجود نیست',
    showAll: 'نمایش همه',
    markers: 'نشانگرها',
    reset: 'بازنشانی',
  },
  it: {
    title: 'Mappa Scientifica dei Sogni',
    subtitle: 'Dati di Ricerca Globali',
    back: 'Indietro',
    loading: 'Caricamento dati...',
    noToken: 'Token Mapbox mancante. Imposta VITE_MAPBOX_TOKEN nel file .env.',
    studies: 'Studi',
    dreams: 'Sogni',
    researcher: 'Ricercatore',
    location: 'Posizione',
    details: 'Dettagli',
    filterTitle: 'Filtri',
    filterStudy: 'Studio',
    filterCountry: 'Paese',
    filterYear: 'Anno',
    allStudies: 'Tutti gli Studi',
    allCountries: 'Tutti i Paesi',
    legend: 'Legenda',
    totalDreams: 'Sogni Totali',
    participants: 'Partecipanti',
    noData: 'Nessun dato disponibile',
    showAll: 'Mostra tutto',
    markers: 'Marcatori',
    reset: 'Ripristina',
  },
  pl: {
    title: 'Naukowa Mapa Snów',
    subtitle: 'Globalne Dane Badawcze',
    back: 'Wstecz',
    loading: 'Ładowanie danych...',
    noToken: 'Brak tokenu Mapbox. Ustaw VITE_MAPBOX_TOKEN w pliku .env.',
    studies: 'Badania',
    dreams: 'Sny',
    researcher: 'Badacz',
    location: 'Lokalizacja',
    details: 'Szczegóły',
    filterTitle: 'Filtry',
    filterStudy: 'Badanie',
    filterCountry: 'Kraj',
    filterYear: 'Rok',
    allStudies: 'Wszystkie Badania',
    allCountries: 'Wszystkie Kraje',
    legend: 'Legenda',
    totalDreams: 'Łączna liczba snów',
    participants: 'Uczestnicy',
    noData: 'Brak dostępnych danych',
    showAll: 'Pokaż wszystko',
    markers: 'Znaczniki',
    reset: 'Resetuj',
  },
  bn: {
    title: 'বৈজ্ঞানিক স্বপ্ন মানচিত্র',
    subtitle: 'বৈশ্বিক গবেষণা ডেটা',
    back: 'পেছনে',
    loading: 'ডেটা লোড হচ্ছে...',
    noToken: 'Mapbox টোকেন নেই। অনুগ্রহ করে .env ফাইলে VITE_MAPBOX_TOKEN সেট করুন।',
    studies: 'গবেষণা',
    dreams: 'স্বপ্ন',
    researcher: 'গবেষক',
    location: 'অবস্থান',
    details: 'বিবরণ',
    filterTitle: 'ফিল্টার',
    filterStudy: 'গবেষণা',
    filterCountry: 'দেশ',
    filterYear: 'বছর',
    allStudies: 'সমস্ত গবেষণা',
    allCountries: 'সমস্ত দেশ',
    legend: 'কিংবদন্তি',
    totalDreams: 'মোট স্বপ্ন',
    participants: 'অংশগ্রহণকারী',
    noData: 'কোনো ডেটা নেই',
    showAll: 'সব দেখান',
    markers: 'চিহ্নিতকারী',
    reset: 'রিসেট',
  },
  ur: {
    title: 'سائنسی خواب نقشہ',
    subtitle: 'عالمی تحقیقی ڈیٹا',
    back: 'واپس',
    loading: 'ڈیٹا لوڈ ہو رہا ہے...',
    noToken: 'Mapbox ٹوکن غائب ہے۔ براہ کرم .env فائل میں VITE_MAPBOX_TOKEN سیٹ کریں۔',
    studies: 'مطالعات',
    dreams: 'خواب',
    researcher: 'محقق',
    location: 'مقام',
    details: 'تفصیلات',
    filterTitle: 'فلٹرز',
    filterStudy: 'مطالعہ',
    filterCountry: 'ملک',
    filterYear: 'سال',
    allStudies: 'تمام مطالعات',
    allCountries: 'تمام ممالک',
    legend: 'علامات',
    totalDreams: 'کل خواب',
    participants: 'شرکاء',
    noData: 'کوئی ڈیٹا دستیاب نہیں',
    showAll: 'سب دکھائیں',
    markers: 'نشانیاں',
    reset: 'دوبارہ ترتیب دیں',
  },
  vi: {
    title: 'Bản đồ Giấc mơ Khoa học',
    subtitle: 'Dữ liệu Nghiên cứu Toàn cầu',
    back: 'Quay lại',
    loading: 'Đang tải dữ liệu...',
    noToken: 'Thiếu token Mapbox. Vui lòng đặt VITE_MAPBOX_TOKEN trong file .env.',
    studies: 'Nghiên cứu',
    dreams: 'Giấc mơ',
    researcher: 'Nhà nghiên cứu',
    location: 'Vị trí',
    details: 'Chi tiết',
    filterTitle: 'Bộ lọc',
    filterStudy: 'Nghiên cứu',
    filterCountry: 'Quốc gia',
    filterYear: 'Năm',
    allStudies: 'Tất cả Nghiên cứu',
    allCountries: 'Tất cả Quốc gia',
    legend: 'Chú giải',
    totalDreams: 'Tổng Giấc mơ',
    participants: 'Người tham gia',
    noData: 'Không có dữ liệu',
    showAll: 'Hiện tất cả',
    markers: 'Đánh dấu',
    reset: 'Đặt lại',
  },
  th: {
    title: 'แผนที่ความฝันทางวิทยาศาสตร์',
    subtitle: 'ข้อมูลวิจัยระดับโลก',
    back: 'ย้อนกลับ',
    loading: 'กำลังโหลดข้อมูล...',
    noToken: 'ไม่พบโทเค็น Mapbox กรุณาตั้งค่า VITE_MAPBOX_TOKEN ในไฟล์ .env',
    studies: 'การศึกษา',
    dreams: 'ความฝัน',
    researcher: 'นักวิจัย',
    location: 'ตำแหน่ง',
    details: 'รายละเอียด',
    filterTitle: 'ตัวกรอง',
    filterStudy: 'การศึกษา',
    filterCountry: 'ประเทศ',
    filterYear: 'ปี',
    allStudies: 'การศึกษาทั้งหมด',
    allCountries: 'ทุกประเทศ',
    legend: 'คำอธิบาย',
    totalDreams: 'ความฝันทั้งหมด',
    participants: 'ผู้เข้าร่วม',
    noData: 'ไม่มีข้อมูล',
    showAll: 'แสดงทั้งหมด',
    markers: 'เครื่องหมาย',
    reset: 'รีเซ็ต',
  },
  sw: {
    title: 'Ramani ya Ndoto ya Kisayansi',
    subtitle: 'Data ya Utafiti wa Kimataifa',
    back: 'Rudi',
    loading: 'Inapakia data...',
    noToken: 'Tokeni ya Mapbox haipo. Tafadhali weka VITE_MAPBOX_TOKEN kwenye faili ya .env.',
    studies: 'Masomo',
    dreams: 'Ndoto',
    researcher: 'Mtafiti',
    location: 'Mahali',
    details: 'Maelezo',
    filterTitle: 'Vichujio',
    filterStudy: 'Somo',
    filterCountry: 'Nchi',
    filterYear: 'Mwaka',
    allStudies: 'Masomo Yote',
    allCountries: 'Nchi Zote',
    legend: 'Ufafanuzi',
    totalDreams: 'Jumla ya Ndoto',
    participants: 'Washiriki',
    noData: 'Hakuna data inayopatikana',
    showAll: 'Onyesha yote',
    markers: 'Alama',
    reset: 'Weka upya',
  },
  hu: {
    title: 'Tudományos Álomtérkép',
    subtitle: 'Globális Kutatási Adatok',
    back: 'Vissza',
    loading: 'Adatok betöltése...',
    noToken: 'Mapbox token hiányzik. Kérjük, állítsa be a VITE_MAPBOX_TOKEN-t a .env fájlban.',
    studies: 'Tanulmányok',
    dreams: 'Álmok',
    researcher: 'Kutató',
    location: 'Helyszín',
    details: 'Részletek',
    filterTitle: 'Szűrők',
    filterStudy: 'Tanulmány',
    filterCountry: 'Ország',
    filterYear: 'Év',
    allStudies: 'Összes tanulmány',
    allCountries: 'Összes ország',
    legend: 'Jelmagyarázat',
    totalDreams: 'Összes álom',
    participants: 'Résztvevők',
    noData: 'Nincs elérhető adat',
    showAll: 'Összes megjelenítése',
    markers: 'Jelölők',
    reset: 'Visszaállítás',
  },
};

function getTranslations(language: string): Translations {
  return TRANSLATIONS[language] || TRANSLATIONS.en;
}

// ─── GeoJSON builder ─────────────────────────────────────────────────────────

function buildGeoJSON(
  items: StudyMapMarker[],
  studyLookup: Map<string, ResearchStudy>,
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: items.map((m) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [m.lng, m.lat],
      },
      properties: {
        study_code: m.study_code,
        city: m.city || '',
        country: m.country || '',
        dream_count: m.dream_count || 0,
        map_color: m.map_color || studyLookup.get(m.study_code)?.map_color || '#7c3aed',
        marker_size: m.marker_size || 8,
        study_name: studyLookup.get(m.study_code)?.study_name || m.study_code,
        investigator: studyLookup.get(m.study_code)?.principal_investigator || '',
      },
    })),
  };
}

// ─── Heatmap GeoJSON builder ─────────────────────────────────────────────────

function buildHeatmapGeoJSON(participants: ResearchParticipant[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: participants
      .filter((p) => p.lat && p.lng)
      .map((p) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
        properties: { weight: Math.min(p.dream_count || 1, 50) },
      })),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

const ScientificDreamMap: React.FC<ScientificDreamMapProps> = ({
  language,
  isLight,
  onClose,
  onSelectParticipant,
  onSelectStudy,
}) => {
  const tr = getTranslations(language);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const sourceReady = useRef(false);
  const latestMarkersRef = useRef<StudyMapMarker[]>([]);
  const latestStudyLookupRef = useRef<Map<string, ResearchStudy>>(new Map());
  const latestParticipantsRef = useRef<ResearchParticipant[]>([]);

  // Data state
  const [studies, setStudies] = useState<ResearchStudy[]>([]);
  const [markers, setMarkers] = useState<StudyMapMarker[]>([]);
  const [participants, setParticipants] = useState<ResearchParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedStudies, setSelectedStudies] = useState<Set<string>>(new Set());
  const [selectedCountry, setSelectedCountry] = useState('');
  const [yearRange, setYearRange] = useState<[number, number]>([2015, 2026]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  // Task 3 additions: participant-level filters + legend search + pin highlight
  const [selectedGenders, setSelectedGenders] = useState<Set<string>>(new Set());
  const [participantAgeRange, setParticipantAgeRange] = useState<[number, number]>([0, 99]);
  const [selectedEthnicity, setSelectedEthnicity] = useState('');
  const [selectedParticipantCountry, setSelectedParticipantCountry] = useState('');
  const [legendSearch, setLegendSearch] = useState('');
  const [highlightedStudyCode, setHighlightedStudyCode] = useState<string | null>(null);
  const [userDreamsCount, setUserDreamsCount] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // ── Snap water-based markers to land ─────────────────────────────────────

  // Some SDDb study coordinates fall in San Francisco Bay (water).
  // Snap them to UC Berkeley campus (land) so no dot appears in the ocean.
  const snapMarkersToLand = (rawMarkers: StudyMapMarker[]): StudyMapMarker[] =>
    rawMarkers.map((m) => {
      // SF Bay water zone: lat 37.72–38.05, lng -122.52 to -122.28
      if (m.lat > 37.72 && m.lat < 38.05 && m.lng < -122.28 && m.lng > -122.55) {
        return { ...m, lat: 37.8716, lng: -122.2594 }; // UC Berkeley campus
      }
      return m;
    });

  // ── Fetch data ───────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const [studyRes, markerRes] = await Promise.all([
          supabase.from('research_studies').select('*'),
          supabase.from('study_map_markers').select('*'),
        ]);
        if (cancelled) return;
        if (studyRes.data) setStudies(studyRes.data as ResearchStudy[]);
        if (markerRes.data) setMarkers(snapMarkersToLand(markerRes.data as StudyMapMarker[]));

        // Paginate participants — bypass 1000-row Supabase limit
        const BATCH = 1000;
        let allParticipants: any[] = [];
        let from = 0;
        while (true) {
          if (cancelled) return;
          const { data: pBatch, error } = await supabase
            .from('research_participants')
            .select('participant_id, study_code, country, lat, lng, dream_count, age, gender, ethnicity')
            .not('lat', 'is', null)
            .range(from, from + BATCH - 1);
          if (error || !pBatch || pBatch.length === 0) break;
          allParticipants.push(...pBatch);
          if (pBatch.length < BATCH) break;
          from += BATCH;
        }
        if (!cancelled) setParticipants(allParticipants as ResearchParticipant[]);

        // Source-Filter: check whether user_dreams has any rows (controls
        // whether the 'user' toggle is enabled or disabled in the UI).
        const uc = await supabase.from('user_dreams').select('id', { count: 'exact', head: true });
        if (!cancelled) setUserDreamsCount(uc.count ?? 0);
      } catch (err) {
        console.error('ScientificDreamMap: fetch error', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────

  const studyLookup = useMemo(() => {
    const m = new Map<string, ResearchStudy>();
    studies.forEach((s) => m.set(s.study_code, s));
    return m;
  }, [studies]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    markers.forEach((m) => { if (m.country) set.add(m.country); });
    return Array.from(set).sort();
  }, [markers]);

  const participantCountries = useMemo(() => {
    const set = new Set<string>();
    participants.forEach((p) => { if (p.country) set.add(p.country); });
    return Array.from(set).sort();
  }, [participants]);

  const ethnicities = useMemo(() => {
    const set = new Set<string>();
    participants.forEach((p) => { if (p.ethnicity) set.add(p.ethnicity); });
    return Array.from(set).sort();
  }, [participants]);

  // Teilnehmer nach Demografie-Filter (Gender/Age/Ethnicity/ParticipantCountry).
  // Daraus leiten wir ab, welche Studien überhaupt noch relevante Teilnehmer haben
  // → Studien ohne passende Teilnehmer werden ausgeblendet, wenn Demo-Filter aktiv.
  const demographicFiltered = useMemo(() => {
    const active = selectedGenders.size > 0 || selectedEthnicity !== '' || selectedParticipantCountry !== '' || participantAgeRange[0] > 0 || participantAgeRange[1] < 99;
    if (!active) return { codes: null as Set<string> | null, count: participants.length };
    const codes = new Set<string>();
    let count = 0;
    for (const p of participants) {
      if (selectedGenders.size > 0 && !(p.gender && selectedGenders.has(p.gender))) continue;
      if (selectedEthnicity && p.ethnicity !== selectedEthnicity) continue;
      if (selectedParticipantCountry && p.country !== selectedParticipantCountry) continue;
      if (p.age != null) {
        if (p.age < participantAgeRange[0] || p.age > participantAgeRange[1]) continue;
      } else if (participantAgeRange[0] > 0 || participantAgeRange[1] < 99) {
        continue; // Alter nicht hinterlegt → bei aktivem Age-Filter ausschliessen
      }
      codes.add(p.study_code);
      count++;
    }
    return { codes, count };
  }, [participants, selectedGenders, selectedEthnicity, selectedParticipantCountry, participantAgeRange]);

  const filteredMarkers = useMemo(() => {
    return markers.filter((m) => {
      if (selectedStudies.size > 0 && !selectedStudies.has(m.study_code)) return false;
      if (selectedCountry && m.country !== selectedCountry) return false;
      if (demographicFiltered.codes && !demographicFiltered.codes.has(m.study_code)) return false;
      return true;
    });
  }, [markers, selectedStudies, selectedCountry, demographicFiltered]);

  // Sichtbare Studien in Legende (nach Filter + Text-Suche)
  const visibleStudies = useMemo(() => {
    const q = legendSearch.trim().toLowerCase();
    return studies.filter((s) => {
      if (demographicFiltered.codes && !demographicFiltered.codes.has(s.study_code)) return false;
      if (selectedCountry && s.country !== selectedCountry) return false;
      if (q) {
        const haystack = `${s.study_name || ''} ${s.institution || ''} ${s.principal_investigator || ''} ${s.study_code}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [studies, legendSearch, demographicFiltered, selectedCountry]);

  // Studien ohne Map-Marker (Pin fehlt — Legende bleibt, aber Zoom nicht möglich)
  const studiesWithoutPin = useMemo(() => {
    const markerCodes = new Set(markers.map((m) => m.study_code));
    return new Set(studies.filter((s) => !markerCodes.has(s.study_code)).map((s) => s.study_code));
  }, [markers, studies]);

  // Keep refs in sync for use inside map.on('load') closure
  latestMarkersRef.current = filteredMarkers;
  latestStudyLookupRef.current = studyLookup;
  latestParticipantsRef.current = participants;

  const totalDreamsCount = useMemo(
    () => filteredMarkers.reduce((sum, m) => sum + (m.dream_count || 0), 0),
    [filteredMarkers],
  );

  // ── Map initialisation ──────────────────────────────────────────────────

  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isLight
        ? 'mapbox://styles/mapbox/light-v11'
        : 'mapbox://styles/mapbox/dark-v11',
      center: [10, 30],
      zoom: 2,
      maxZoom: 15,
      projection: 'globe' as any,
      fog: (isLight ? {
        color: '#f0eaff',
        'high-color': '#c8b4ff',
        'horizon-blend': 0.05,
        'star-intensity': 0,
      } : {
        color: '#050010',
        'high-color': '#120030',
        'horizon-blend': 0.02,
        'star-intensity': 0.15,
      }) as any,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Force correct size after mount
    requestAnimationFrame(() => { map.resize(); });

    map.on('load', () => {
      map.resize();
      // GeoJSON source with clustering
      map.addSource('dream-markers', {
        type: 'geojson',
        data: buildGeoJSON(filteredMarkers, studyLookup),
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
      });

      // Heatmap source + layer (rendered below clusters)
      map.addSource('heatmap-data', {
        type: 'geojson',
        data: buildHeatmapGeoJSON(latestParticipantsRef.current),
      });
      map.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'heatmap-data',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 50, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(99,102,241,0.3)',
            0.4, 'rgba(139,92,246,0.55)',
            0.6, 'rgba(168,85,247,0.7)',
            0.8, 'rgba(217,70,239,0.8)',
            1, 'rgba(251,191,36,0.95)',
          ] as any,
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 6, 9, 30] as any,
          'heatmap-opacity': 0.75,
        },
      }); // heatmap added first → renders below cluster layers naturally

      sourceReady.current = true;

      // Cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'dream-markers',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step', ['get', 'point_count'],
            '#6366f1', 10, '#8b5cf6', 50, '#a855f7',
          ],
          'circle-radius': [
            'step', ['get', 'point_count'],
            22, 10, 30, 50, 40,
          ],
          'circle-opacity': 0.95,
          'circle-stroke-width': 3,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
        },
      });

      // Cluster count labels
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'dream-markers',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: { 'text-color': '#ffffff' },
      });

      // Individual markers (unclustered)
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'dream-markers',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'map_color'],
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'marker_size'],
            4, 8, 8, 12, 16, 18, 24, 24,
          ],
          'circle-opacity': 0.95,
          'circle-stroke-width': 3,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
        },
      });

      // Highlighted marker layer — sitzt über unclustered-point.
      // Wird in einem separaten Effect via map.setFilter befuellt.
      map.addLayer({
        id: 'highlight-point',
        type: 'circle',
        source: 'dream-markers',
        filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'study_code'], '__none__']],
        paint: {
          'circle-color': '#fbbf24',
          'circle-radius': 28,
          'circle-opacity': 0.9,
          'circle-stroke-width': 4,
          'circle-stroke-color': '#fef3c7',
        },
      });

      // ── Click: cluster → zoom ────────────────────────────────────────────
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id;
        const src = map.getSource('dream-markers') as mapboxgl.GeoJSONSource;
        src.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          const geom = features[0].geometry;
          if (geom.type === 'Point') {
            map.easeTo({ center: geom.coordinates as [number, number], zoom: zoom ?? 5 });
          }
        });
      });

      // ── Click: single marker → popup ─────────────────────────────────────
      map.on('click', 'unclustered-point', (e) => {
        if (!e.features?.length) return;
        const props = e.features[0].properties!;
        const geom = e.features[0].geometry;
        if (geom.type !== 'Point') return;
        const coords = geom.coordinates.slice() as [number, number];

        if (popupRef.current) popupRef.current.remove();

        const bgColor = isLight ? 'rgba(255,255,255,0.97)' : 'rgba(15,15,30,0.97)';
        const textColor = isLight ? '#1e1b4b' : '#e0e7ff';
        const subColor = isLight ? '#4b5563' : '#a5b4fc';

        const studyHasParticipants = latestParticipantsRef.current.some(
          (px) => px.study_code === props.study_code
        );

        const html = `
          <div style="font-family:system-ui,sans-serif;min-width:200px;padding:4px 0;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="width:10px;height:10px;border-radius:50%;background:${props.map_color};flex-shrink:0;"></span>
              <strong style="font-size:14px;color:${textColor}">${props.study_name}</strong>
            </div>
            ${props.investigator ? `<div style="font-size:12px;color:${subColor};margin-bottom:3px;">${tr.researcher}: ${props.investigator}</div>` : ''}
            <div style="font-size:12px;color:${subColor};margin-bottom:3px;">
              ${tr.location}: ${[props.city, props.country].filter(Boolean).join(', ') || '-'}
            </div>
            <div style="font-size:12px;color:${subColor};margin-bottom:8px;">
              ${tr.dreams}: <strong>${props.dream_count}</strong>
            </div>
            <div style="display:flex;gap:6px;">
              <button id="sdm-btn-study" style="padding:4px 10px;border-radius:6px;border:none;background:#6366f1;color:#fff;font-size:12px;cursor:pointer;">
                ${tr.details}
              </button>
              ${studyHasParticipants
                ? `<button id="sdm-btn-participant" style="padding:4px 10px;border-radius:6px;border:none;background:#8b5cf6;color:#fff;font-size:12px;cursor:pointer;">
                    👤 ${tr.participants}
                  </button>`
                : `<button id="sdm-btn-dreams" style="padding:4px 10px;border-radius:6px;border:none;background:#7c3aed;color:#fff;font-size:12px;cursor:pointer;">
                    📊 ${props.dream_count} ${tr.dreams}
                  </button>`
              }
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          closeButton: true,
          maxWidth: '280px',
          className: isLight ? 'sdm-popup-light' : 'sdm-popup-dark',
        })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(map);

        popupRef.current = popup;

        // Attach handlers after DOM paint
        requestAnimationFrame(() => {
          document.getElementById('sdm-btn-study')?.addEventListener('click', () => {
            popup.remove();
            onSelectStudy?.(props.study_code);
          });
          if (studyHasParticipants) {
            document.getElementById('sdm-btn-participant')?.addEventListener('click', () => {
              const p = latestParticipantsRef.current.find((px) => px.study_code === props.study_code);
              popup.remove();
              if (p) onSelectParticipant?.(p.participant_id);
              else onSelectStudy?.(props.study_code);
            });
          } else {
            document.getElementById('sdm-btn-dreams')?.addEventListener('click', () => {
              popup.remove();
              onSelectStudy?.(props.study_code);
            });
          }
        });
      });

      // Cursor hints
      const setCursor = (cursor: string) => () => { map.getCanvas().style.cursor = cursor; };
      map.on('mouseenter', 'clusters', setCursor('pointer'));
      map.on('mouseleave', 'clusters', setCursor(''));
      map.on('mouseenter', 'unclustered-point', setCursor('pointer'));
      map.on('mouseleave', 'unclustered-point', setCursor(''));

      // Race-condition fix: refresh data once map is truly idle (avoids stale closure)
      map.once('idle', () => {
        const src = map.getSource('dream-markers') as mapboxgl.GeoJSONSource | undefined;
        if (src) src.setData(buildGeoJSON(latestMarkersRef.current, latestStudyLookupRef.current));
        const heatSrc = map.getSource('heatmap-data') as mapboxgl.GeoJSONSource | undefined;
        if (heatSrc) heatSrc.setData(buildHeatmapGeoJSON(latestParticipantsRef.current));
      });
    });

    return () => {
      sourceReady.current = false;
      if (popupRef.current) popupRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxToken, isLight]);

  // ── Update source on filter / data change ────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourceReady.current) return;

    const update = () => {
      const src = map.getSource('dream-markers') as mapboxgl.GeoJSONSource | undefined;
      if (src) src.setData(buildGeoJSON(filteredMarkers, studyLookup));
    };

    if (map.isStyleLoaded()) update();
    else map.once('idle', update);
  }, [filteredMarkers, studyLookup]);

  // ── Update heatmap source when participants change ───────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourceReady.current) return;
    const update = () => {
      const src = map.getSource('heatmap-data') as mapboxgl.GeoJSONSource | undefined;
      if (src) src.setData(buildHeatmapGeoJSON(participants));
    };
    if (map.isStyleLoaded()) update();
    else map.once('idle', update);
  }, [participants]);

  // ── Toggle heatmap layer visibility ─────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourceReady.current) return;
    const setVis = () => {
      if (map.getLayer('heatmap-layer')) {
        map.setLayoutProperty('heatmap-layer', 'visibility', showHeatmap ? 'visible' : 'none');
      }
    };
    if (map.isStyleLoaded()) setVis();
    else map.once('idle', setVis);
  }, [showHeatmap]);

  // ── Fly to filtered bounds ───────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || filteredMarkers.length === 0) return;

    // Only fly when an explicit filter is active
    if (selectedStudies.size === 0 && !selectedCountry) return;

    if (filteredMarkers.length === 1) {
      map.flyTo({ center: [filteredMarkers[0].lng, filteredMarkers[0].lat], zoom: 6, duration: 1500 });
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    filteredMarkers.forEach((m) => bounds.extend([m.lng, m.lat]));
    map.fitBounds(bounds, { padding: 60, duration: 1500, maxZoom: 10 });
  }, [filteredMarkers, selectedStudies, selectedCountry]);

  // ── Toggle helpers ───────────────────────────────────────────────────────

  const toggleStudy = useCallback((code: string) => {
    setSelectedStudies((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const flyToStudy = useCallback((study: ResearchStudy) => {
    const marker = markers.find((m) => m.study_code === study.study_code);
    if (marker && mapRef.current) {
      setHighlightedStudyCode((prev) => (prev === study.study_code ? null : study.study_code));
      mapRef.current.flyTo({ center: [marker.lng, marker.lat], zoom: 6, duration: 1500 });
    } else {
      // Kein Kartenmarker ("International" Studie wie SDDB-016): direkt zur Studiendetailseite.
      onSelectStudy?.(study.study_code);
    }
  }, [markers, onSelectStudy]);

  const resetFilters = useCallback(() => {
    setSelectedStudies(new Set());
    setSelectedCountry('');
    setYearRange([2015, 2026]);
    setSelectedGenders(new Set());
    setParticipantAgeRange([0, 99]);
    setSelectedEthnicity('');
    setSelectedParticipantCountry('');
    setLegendSearch('');
    setHighlightedStudyCode(null);
  }, []);

  const hasActiveFilters =
    selectedStudies.size > 0 ||
    !!selectedCountry ||
    selectedGenders.size > 0 ||
    !!selectedEthnicity ||
    !!selectedParticipantCountry ||
    participantAgeRange[0] > 0 ||
    participantAgeRange[1] < 99;

  // Pin-Highlight via Mapbox-Filter: zeigt einen extra Marker über dem normalen.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourceReady.current) return;
    const code = highlightedStudyCode ?? '__none__';
    try {
      map.setFilter('highlight-point', ['all', ['!', ['has', 'point_count']], ['==', ['get', 'study_code'], code]]);
    } catch {}
  }, [highlightedStudyCode]);

  // ── No-token fallback ────────────────────────────────────────────────────

  if (!mapboxToken) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
        <div className="rounded-2xl bg-black/80 border border-white/10 p-8 max-w-md text-center">
          <p className="text-white/80 text-sm mb-4">{tr.noToken}</p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition"
          >
            {tr.back}
          </button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const panelBg = isLight
    ? 'bg-white/90 border-gray-200 shadow-lg'
    : 'bg-black/80 border-white/10 shadow-2xl';

  const panelText = isLight ? 'text-gray-800' : 'text-white';
  const subText = isLight ? 'text-gray-500' : 'text-white/50';
  const mutedText = isLight ? 'text-gray-400' : 'text-white/30';

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Map */}
      <div ref={mapContainerRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-3 py-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back */}
          <button
            onClick={onClose}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition backdrop-blur-md border ${
              isLight
                ? 'bg-white/80 text-gray-800 hover:bg-white/90 border-gray-200'
                : 'bg-black/60 text-white/90 hover:bg-black/70 border-white/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">{tr.back}</span>
          </button>

          {/* Title */}
          <div className={`px-3 py-1.5 rounded-lg backdrop-blur-md border ${
            isLight ? 'bg-white/80 border-gray-200' : 'bg-black/60 border-white/10'
          }`}>
            <h1 className={`text-sm font-bold ${panelText}`}>{tr.title}</h1>
            <p className={`text-xs hidden sm:block ${subText}`}>{tr.subtitle}</p>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setFilterOpen((p) => !p)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition backdrop-blur-md border ${
              isLight
                ? 'bg-white/80 text-gray-700 hover:bg-white/90 border-gray-200'
                : 'bg-black/60 text-white/80 hover:bg-black/70 border-white/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {hasActiveFilters && (
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] leading-none font-bold">
                {selectedStudies.size + (selectedCountry ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Heatmap toggle */}
          <button
            onClick={() => setShowHeatmap((p) => !p)}
            title={showHeatmap ? 'Hide heatmap' : 'Show heatmap'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition backdrop-blur-md border ${
              showHeatmap
                ? isLight
                  ? 'bg-purple-100/90 text-purple-700 border-purple-300'
                  : 'bg-purple-900/60 text-purple-300 border-purple-500/40'
                : isLight
                  ? 'bg-white/80 text-gray-400 border-gray-200'
                  : 'bg-black/60 text-white/30 border-white/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </button>
        </div>

        {/* Stats badge */}
        <div className={`px-3 py-1.5 rounded-lg backdrop-blur-md text-xs border ${
          isLight
            ? 'bg-white/80 border-gray-200 text-gray-700'
            : 'bg-black/60 border-white/10 text-white/70'
        }`}>
          <span className="font-semibold">{studies.length}</span> {tr.studies}
          <span className="mx-1">&middot;</span>
          <span className="font-semibold">{totalDreamsCount.toLocaleString()}</span> {tr.dreams}
        </div>
      </div>

      {/* ── Filter panel ───────────────────────────────────────────────────── */}
      {filterOpen && (
        <div className={`absolute top-16 left-3 sm:left-4 z-20 w-72 max-h-[70vh] overflow-y-auto rounded-xl backdrop-blur-xl p-4 border ${panelBg}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-semibold text-sm ${panelText}`}>{tr.filterTitle}</h3>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                {tr.reset}
              </button>
            )}
          </div>

          {/* Study multi-select */}
          <label className={`block text-xs font-medium mb-1.5 ${subText}`}>{tr.filterStudy}</label>
          <div className="max-h-36 overflow-y-auto mb-3 space-y-0.5">
            {studies.map((s) => (
              <button
                key={s.study_code}
                onClick={() => toggleStudy(s.study_code)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition ${
                  selectedStudies.size === 0 || selectedStudies.has(s.study_code)
                    ? isLight
                      ? 'text-gray-800 bg-indigo-50/60'
                      : 'text-white bg-white/10'
                    : isLight
                      ? 'text-gray-400 bg-transparent'
                      : 'text-gray-500 bg-transparent'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: s.map_color || '#7c3aed' }}
                />
                <span className="truncate flex-1">{s.study_name}</span>
                <span className={mutedText}>{s.total_dreams || '?'}</span>
              </button>
            ))}
            {studies.length === 0 && (
              <p className={`text-xs px-2 ${mutedText}`}>{tr.noData}</p>
            )}
          </div>

          {/* Country dropdown */}
          <label className={`block text-xs font-medium mb-1.5 ${subText}`}>{tr.filterCountry}</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className={`w-full mb-3 px-2 py-1.5 rounded-lg text-xs border outline-none transition ${
              isLight
                ? 'bg-white border-gray-300 text-gray-800 focus:border-indigo-400'
                : 'bg-black/50 border-white/10 text-white/90 focus:border-indigo-500'
            }`}
          >
            <option value="">{tr.allCountries}</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Year range */}
          <label className={`block text-xs font-medium mb-1 ${subText}`}>
            {tr.filterYear}: {yearRange[0]} &ndash; {yearRange[1]}
          </label>
          <div className="flex gap-2 items-center mb-3">
            <input
              type="range" min={2010} max={2026} value={yearRange[0]}
              onChange={(e) => setYearRange([Math.min(Number(e.target.value), yearRange[1]), yearRange[1]])}
              className="flex-1 accent-indigo-500 h-1"
            />
            <input
              type="range" min={2010} max={2026} value={yearRange[1]}
              onChange={(e) => setYearRange([yearRange[0], Math.max(Number(e.target.value), yearRange[0])])}
              className="flex-1 accent-indigo-500 h-1"
            />
          </div>

          {/* Source filter (user/scientific) — disabled until user_dreams populated */}
          <label className={`block text-xs font-medium mb-1.5 ${subText}`}>
            {language === 'de' ? 'Quelle' : 'Source'}
          </label>
          <div
            className={`mb-3 flex rounded-lg border overflow-hidden ${isLight ? 'border-gray-300' : 'border-white/10'}`}
            title={userDreamsCount === 0 ? (language === 'de' ? 'Noch keine User-Daten' : 'No user data yet') : ''}
          >
            <button
              type="button"
              disabled
              className={`flex-1 px-2 py-1 text-[11px] font-semibold ${isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-300'}`}
            >
              {language === 'de' ? 'Wissenschaftlich' : 'Scientific'}
            </button>
            <button
              type="button"
              disabled={userDreamsCount === 0}
              className={`flex-1 px-2 py-1 text-[11px] transition ${
                userDreamsCount === 0
                  ? (isLight ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white/5 text-white/30 cursor-not-allowed')
                  : (isLight ? 'bg-white text-gray-700 hover:bg-gray-50' : 'bg-black/40 text-white/70 hover:bg-white/10')
              }`}
            >
              {language === 'de' ? 'User' : 'User'}{userDreamsCount === 0 ? ' (0)' : ` (${userDreamsCount})`}
            </button>
          </div>

          {/* Gender multi-select */}
          <label className={`block text-xs font-medium mb-1.5 ${subText}`}>
            {language === 'de' ? 'Geschlecht' : 'Gender'}
            <span className="ml-1 opacity-50" title={language === 'de' ? 'Daten unvollständig' : 'Data incomplete'}>ⓘ</span>
          </label>
          <div className="flex flex-wrap gap-1 mb-3">
            {['f', 'm', 'd', 'other'].map((g) => {
              const active = selectedGenders.has(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setSelectedGenders((prev) => {
                      const next = new Set(prev);
                      if (next.has(g)) next.delete(g); else next.add(g);
                      return next;
                    });
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] border transition ${
                    active
                      ? (isLight ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-indigo-500 text-white border-indigo-400')
                      : (isLight ? 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50' : 'bg-black/40 text-white/70 border-white/10 hover:bg-white/10')
                  }`}
                >
                  {g === 'f' ? '♀ F' : g === 'm' ? '♂ M' : g === 'd' ? '⚧ D' : '?'}
                </button>
              );
            })}
          </div>

          {/* Age range (participants) */}
          <label className={`block text-xs font-medium mb-1 ${subText}`}>
            {language === 'de' ? 'Alter' : 'Age'}: {participantAgeRange[0]} &ndash; {participantAgeRange[1]}
            <span className="ml-1 opacity-50" title={language === 'de' ? 'Daten unvollständig' : 'Data incomplete'}>ⓘ</span>
          </label>
          <div className="flex gap-2 items-center mb-3">
            <input
              type="range" min={0} max={99} value={participantAgeRange[0]}
              onChange={(e) => setParticipantAgeRange([Math.min(Number(e.target.value), participantAgeRange[1]), participantAgeRange[1]])}
              className="flex-1 accent-indigo-500 h-1"
            />
            <input
              type="range" min={0} max={99} value={participantAgeRange[1]}
              onChange={(e) => setParticipantAgeRange([participantAgeRange[0], Math.max(Number(e.target.value), participantAgeRange[0])])}
              className="flex-1 accent-indigo-500 h-1"
            />
          </div>

          {/* Ethnicity / Nationality (participants) */}
          <label className={`block text-xs font-medium mb-1.5 ${subText}`}>
            {language === 'de' ? 'Nationalität' : 'Nationality'}
            <span className="ml-1 opacity-50" title={language === 'de' ? 'Daten unvollständig' : 'Data incomplete'}>ⓘ</span>
          </label>
          <input
            type="text"
            list="sdm-ethnicity-list"
            value={selectedEthnicity}
            onChange={(e) => setSelectedEthnicity(e.target.value)}
            placeholder={language === 'de' ? 'z.B. European…' : 'e.g. European…'}
            className={`w-full mb-3 px-2 py-1.5 rounded-lg text-xs border outline-none ${
              isLight ? 'bg-white border-gray-300 text-gray-800 focus:border-indigo-400' : 'bg-black/50 border-white/10 text-white/90 focus:border-indigo-500'
            }`}
          />
          <datalist id="sdm-ethnicity-list">
            {ethnicities.map((e) => <option key={e} value={e} />)}
          </datalist>

          {/* Participant country (Wohnort) — separate from study country */}
          <label className={`block text-xs font-medium mb-1.5 ${subText}`}>
            {language === 'de' ? 'Wohnort (Teilnehmer)' : 'Residence (Participant)'}
            <span className="ml-1 opacity-50" title={language === 'de' ? 'Daten unvollständig' : 'Data incomplete'}>ⓘ</span>
          </label>
          <input
            type="text"
            list="sdm-p-country-list"
            value={selectedParticipantCountry}
            onChange={(e) => setSelectedParticipantCountry(e.target.value)}
            placeholder={language === 'de' ? 'z.B. USA…' : 'e.g. USA…'}
            className={`w-full px-2 py-1.5 rounded-lg text-xs border outline-none ${
              isLight ? 'bg-white border-gray-300 text-gray-800 focus:border-indigo-400' : 'bg-black/50 border-white/10 text-white/90 focus:border-indigo-500'
            }`}
          />
          <datalist id="sdm-p-country-list">
            {participantCountries.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
      )}

      {/* ── Legend – responsive: md+ sidebar rechts, sm bottom-sheet ─────── */}
      <div
        data-testid="research-map-legend"
        className={`z-10 rounded-xl backdrop-blur-md border ${panelBg}
          absolute right-0 left-0 bottom-0 md:left-auto md:right-4 md:top-24 md:bottom-24
          md:w-[320px] md:rounded-xl rounded-t-2xl md:rounded-t-xl
          flex flex-col overflow-hidden
          transition-[max-height,height] duration-200
          ${mobileDrawerOpen ? 'max-h-[70vh]' : 'max-h-[48vh]'}
          md:max-h-none md:h-auto`}
      >
        {/* Mobile drag handle */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen((p) => !p)}
          className="md:hidden flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing"
          aria-label={mobileDrawerOpen ? 'Liste schliessen' : 'Liste oeffnen'}
        >
          <span className={`w-10 h-1 rounded-full ${isLight ? 'bg-gray-300' : 'bg-white/30'}`} />
        </button>

        <div className="px-3 pt-1 pb-2 flex items-center justify-between">
          <h3 className={`text-xs font-bold uppercase tracking-wide ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
            {tr.legend} ({visibleStudies.length}/{studies.length})
          </h3>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="text-[10px] text-indigo-400 hover:text-indigo-300 uppercase tracking-wide">
              {tr.reset}
            </button>
          )}
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <input
            type="search"
            value={legendSearch}
            onChange={(e) => setLegendSearch(e.target.value)}
            placeholder={language === 'de' ? 'Studien durchsuchen…' : 'Search studies…'}
            className={`w-full px-2 py-1.5 text-xs rounded-lg border outline-none ${
              isLight ? 'bg-white border-gray-300 text-gray-800 focus:border-indigo-400' : 'bg-black/50 border-white/10 text-white/90 focus:border-indigo-500'
            }`}
          />
        </div>

        <div className="px-3 pb-3 overflow-y-auto space-y-0.5 flex-1">
          {visibleStudies.map((s) => {
            const isHi = highlightedStudyCode === s.study_code;
            const noPin = studiesWithoutPin.has(s.study_code);
            return (
              <button
                key={s.study_code}
                data-study-id={s.study_code}
                data-highlighted={isHi ? 'true' : 'false'}
                onClick={() => flyToStudy(s)}
                title={noPin ? (language === 'de' ? 'Kein Standort hinterlegt' : 'No location on record') : ''}
                className={`w-full min-h-[44px] md:min-h-0 md:py-1.5 flex items-center gap-2 text-left text-[12px] px-2 rounded transition
                  ${isHi ? (isLight ? 'bg-amber-100 ring-1 ring-amber-500' : 'bg-amber-500/20 ring-1 ring-amber-400') : ''}
                  ${selectedStudies.size > 0 && !selectedStudies.has(s.study_code) ? 'opacity-40' : 'opacity-100'}
                  ${isLight ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
                  style={{ backgroundColor: s.map_color || '#7c3aed' }}
                />
                <span className="truncate flex-1">{s.study_name}</span>
                {noPin ? (
                  <span className="shrink-0 text-[10px] opacity-40" aria-hidden="true">📍</span>
                ) : null}
                <span className={`shrink-0 tabular-nums text-[10px] ${mutedText}`}>{s.total_dreams || '?'}</span>
              </button>
            );
          })}
          {visibleStudies.length === 0 && (
            <p className={`text-[11px] px-2 ${mutedText}`}>{tr.noData}</p>
          )}
        </div>
      </div>

      {/* ── Stats bar – bottom left ───────────────────────────────────────── */}
      <div className="absolute bottom-6 left-4 z-10 flex gap-2">
        {[
          { label: tr.studies, value: studies.length, color: 'text-indigo-400' },
          { label: tr.markers, value: filteredMarkers.length, color: 'text-emerald-400' },
          { label: tr.dreams, value: totalDreamsCount.toLocaleString(), color: 'text-amber-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`backdrop-blur-md rounded-lg px-3 py-2 border ${
              isLight ? 'bg-white/80 border-gray-200' : 'bg-black/70 border-white/10'
            }`}
          >
            <div className={`text-xs ${stat.color}`}>{stat.label}</div>
            <div className={`font-bold text-sm ${panelText}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ── Loading overlay ────────────────────────────────────────────────── */}
      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-white/70 text-sm">{tr.loading}</p>
          </div>
        </div>
      )}

      {/* ── Popup styles ──────────────────────────────────────────────────── */}
      <style>{`
        .sdm-popup-dark .mapboxgl-popup-content {
          background: rgba(15,15,30,0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .sdm-popup-dark .mapboxgl-popup-tip {
          border-top-color: rgba(15,15,30,0.95);
        }
        .sdm-popup-dark .mapboxgl-popup-close-button {
          color: rgba(255,255,255,0.5);
          font-size: 16px;
          padding: 4px 8px;
        }
        .sdm-popup-light .mapboxgl-popup-content {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
        .sdm-popup-light .mapboxgl-popup-tip {
          border-top-color: rgba(255,255,255,0.95);
        }
        .sdm-popup-light .mapboxgl-popup-close-button {
          color: rgba(0,0,0,0.4);
          font-size: 16px;
          padding: 4px 8px;
        }
      `}</style>
    </div>
  );
};

export default ScientificDreamMap;
