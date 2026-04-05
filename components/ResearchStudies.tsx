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

function getStudyType(study: Study): { label: string; color: string; icon: string } {
  const pc = study.participant_count ?? 0;
  const dc = study.total_dreams ?? 0;
  if (pc > 0 && pc <= 3) return { label: 'Einzelperson', color: '#8B5CF6', icon: '\u{1F464}' };
  const avg = pc > 0 ? dc / pc : 0;
  if (avg > 5) return { label: 'Tagebuch', color: '#22c55e', icon: '\u{1F4D3}' };
  return { label: 'Umfrage', color: '#3b82f6', icon: '\u{1F4CB}' };
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
    dreams: 'Traeume',
    countries: 'Laender',
    principal_investigator: 'Forscher',
    institution: 'Institution',
    period: 'Zeitraum',
    doi: 'DOI',
    license: 'Lizenz',
    showOnMap: 'Auf Karte anzeigen',
    showParticipants: 'Teilnehmer',
    hideParticipants: 'Teilnehmer ausblenden',
    back: 'Zurueck',
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
}) => {
  const t = (T as Record<string, Record<string, string>>)[language] ?? T.en;

  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('year');
  const [expandedStudy, setExpandedStudy] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [dbCounts, setDbCounts] = useState<{
    participants: number;
    dreams: number;
  } | null>(null);
  const [filterWordCount, setFilterWordCount] = useState<number>(0);
  const [filterDreamsPerPart, setFilterDreamsPerPart] = useState<number>(0);
  const [filterStudyType, setFilterStudyType] = useState<string>('all');
  const [studyAvgWordCounts, setStudyAvgWordCounts] = useState<Record<string, number> | null>(null);

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
        const batch = [];
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

  // Fetch participants when a study is expanded
  useEffect(() => {
    if (!expandedStudy) {
      setParticipants([]);
      return;
    }
    const study = studies.find((s) => s.study_code === expandedStudy);
    if (!study) return;

    const fetchParticipants = async () => {
      setLoadingParticipants(true);
      const { data, error } = await supabase
        .from('research_participants')
        .select('participant_id, study_id, age, gender')
        .eq('study_id', study.id);
      if (error) console.error('Error fetching participants:', error);
      setParticipants((data as Participant[]) || []);
      setLoadingParticipants(false);
    };
    fetchParticipants();
  }, [expandedStudy, studies]);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = studies.filter(
      (s) =>
        s.study_name?.toLowerCase().includes(q) ||
        s.principal_investigator?.toLowerCase().includes(q) ||
        s.study_code?.toLowerCase().includes(q)
    );

    if (filterStudyType !== 'all') {
      list = list.filter(s => {
        const st = getStudyType(s);
        if (filterStudyType === 'survey') return st.label === 'Umfrage';
        if (filterStudyType === 'journal') return st.label === 'Tagebuch';
        if (filterStudyType === 'single') return st.label === 'Einzelperson';
        return true;
      });
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
  }, [studies, search, sortKey, filterStudyType, filterDreamsPerPart, filterWordCount, studyAvgWordCounts]);

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
                {language === 'de' ? 'Trauml\u00e4nge:' : 'Dream length:'}
              </span>
              {([
                { v: 0, l: language === 'de' ? 'Alle' : 'All' },
                { v: 50, l: language === 'de' ? 'Mind. 50 W\u00f6rter' : 'Min. 50 words' },
                { v: 100, l: language === 'de' ? 'Mind. 100 W\u00f6rter' : 'Min. 100 words' },
                { v: 200, l: language === 'de' ? 'Mind. 200 W\u00f6rter' : 'Min. 200 words' },
                { v: 500, l: language === 'de' ? 'Lange Texte (500+)' : 'Long texts (500+)' },
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
                {language === 'de' ? 'Tr\u00e4ume/TN:' : 'Dreams/P:'}
              </span>
              {([
                { v: 0, l: language === 'de' ? 'Alle' : 'All' },
                { v: 5, l: 'Multi-Traum (5+)' },
                { v: 30, l: language === 'de' ? 'Tageb\u00fccher (30+)' : 'Diaries (30+)' },
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
                {language === 'de' ? 'Studientyp:' : 'Study type:'}
              </span>
              {([
                { v: 'all', l: language === 'de' ? 'Alle' : 'All' },
                { v: 'survey', l: '\u{1F4CB} Umfragen' },
                { v: 'journal', l: '\u{1F4D3} Tageb\u00fccher' },
                { v: 'single', l: '\u{1F464} Einzelperson' },
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
            {(filterWordCount > 0 || filterDreamsPerPart > 0 || filterStudyType !== 'all') && (
              <div className="text-xs opacity-50">
                {filtered.length} {language === 'de' ? 'von' : 'of'} {studies.length} {language === 'de' ? 'Studien' : 'studies'}
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
                    {(() => { const st = getStudyType(study); return (
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{
                        backgroundColor: st.color + '20', color: st.color,
                        border: `1px solid ${st.color}40`,
                      }}>{st.icon} {st.label}</span>
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
                      {language === 'de' ? 'Land' : 'Country'}: {study.country}
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
                            {(study.total_dreams ?? 0).toLocaleString()} {language === 'de' ? 'Traumberichte in Originalstudie' : 'dream reports in original study'}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, opacity: 0.7, margin: '4px 0 0 28px' }}>
                          {language === 'de' ? 'Daten werden nach und nach importiert' : 'Data is being imported gradually'}
                        </p>
                        {study.doi && (
                          <a
                            href={study.doi.startsWith('http') ? study.doi : `https://doi.org/${study.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 12, color: '#8B5CF6', marginLeft: 28, marginTop: 4, display: 'inline-block' }}
                          >
                            {language === 'de' ? 'Studie ansehen' : 'View study'} →
                          </a>
                        )}
                      </div>
                    ) : participants.length === 0 ? (
                      <p style={{ fontSize: 13, opacity: 0.5, padding: '8px 0', margin: 0 }}>
                        {language === 'de' ? 'Noch keine Daten verfügbar' : 'No data available yet'}
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {participants.map((p) => (
                          <button
                            key={p.participant_id}
                            onClick={() =>
                              onSelectParticipant?.(p.participant_id)
                            }
                            className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                              isLight
                                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                : 'bg-indigo-900/40 text-indigo-300 hover:bg-indigo-800/60'
                            }`}
                          >
                            {p.participant_id}
                          </button>
                        ))}
                      </div>
                    )}
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
