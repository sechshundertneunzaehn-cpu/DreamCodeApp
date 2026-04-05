import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface CensusPageProps {
  language: Language;
  onClose: () => void;
  themeMode?: string;
}

interface DreamStats {
  total_dream_reports: number;
  total_user_dreams: number;
  dreams_today: number;
  trending_themes: { theme: string; count: number }[] | null;
  embeddings_done: number;
  embeddings_pending: number;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Accept': 'application/json',
};

async function fetchStats(): Promise<DreamStats> {
  const [reportsRes, embeddedRes, userDreamsRes, todayRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/dream_reports?select=id`, { method: 'HEAD', headers: { ...HEADERS, 'Prefer': 'count=exact' } }),
    fetch(`${SUPABASE_URL}/rest/v1/dream_reports?select=id&embedding=not.is.null`, { method: 'HEAD', headers: { ...HEADERS, 'Prefer': 'count=exact' } }),
    fetch(`${SUPABASE_URL}/rest/v1/user_dreams?select=id`, { method: 'HEAD', headers: { ...HEADERS, 'Prefer': 'count=exact' } }),
    fetch(`${SUPABASE_URL}/rest/v1/user_dreams?select=id&created_at=gte.${new Date().toISOString().split('T')[0]}`, { method: 'HEAD', headers: { ...HEADERS, 'Prefer': 'count=exact' } }),
  ]);

  const parseCount = (res: Response) => {
    const cr = res.headers.get('content-range');
    if (!cr) return 0;
    const total = parseInt(cr.split('/')[1] ?? '0', 10);
    return isNaN(total) ? 0 : total;
  };

  const totalReports = parseCount(reportsRes);
  const embeddingsDone = parseCount(embeddedRes);

  return {
    total_dream_reports: totalReports,
    total_user_dreams: parseCount(userDreamsRes),
    dreams_today: parseCount(todayRes),
    trending_themes: null,
    embeddings_done: embeddingsDone,
    embeddings_pending: totalReports - embeddingsDone,
  };
}

const T = {
  de: {
    back: 'Zurueck',
    title: 'Dream Census',
    subtitle: 'Live-Statistiken der Traumdatenbank',
    total_reports: 'Wissenschaftliche Traumprotokolle',
    user_dreams: 'Nutzer-Traeume',
    today: 'Traeume heute',
    embeddings: 'KI-Embeddings',
    pending: 'Ausstehend',
    done: 'Generiert',
    progress: 'Fortschritt',
    sources: 'Datenquellen',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'Lade Statistiken...',
    refresh: 'Aktualisieren',
    last_update: 'Zuletzt aktualisiert',
  },
  en: {
    back: 'Back',
    title: 'Dream Census',
    subtitle: 'Live database statistics',
    total_reports: 'Scientific Dream Reports',
    user_dreams: 'User Dreams',
    today: 'Dreams Today',
    embeddings: 'AI Embeddings',
    pending: 'Pending',
    done: 'Generated',
    progress: 'Progress',
    sources: 'Data Sources',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'Loading statistics...',
    refresh: 'Refresh',
    last_update: 'Last updated',
  },
  tr: {
    back: 'Geri',
    title: 'Ruya Sayimi',
    subtitle: 'Canli veritabani istatistikleri',
    total_reports: 'Bilimsel Ruya Raporlari',
    user_dreams: 'Kullanici Ruyalari',
    today: 'Bugunun Ruyalari',
    embeddings: 'YZ Gommeleri',
    pending: 'Beklemede',
    done: 'Olusturuldu',
    progress: 'Ilerleme',
    sources: 'Veri Kaynaklari',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'Istatistikler yukleniyor...',
    refresh: 'Yenile',
    last_update: 'Son guncelleme',
  },
  es: {
    back: 'Volver',
    title: 'Censo de Suenos',
    subtitle: 'Estadisticas en vivo',
    total_reports: 'Informes Cientificos',
    user_dreams: 'Suenos de Usuarios',
    today: 'Suenos Hoy',
    embeddings: 'Embeddings IA',
    pending: 'Pendiente',
    done: 'Generado',
    progress: 'Progreso',
    sources: 'Fuentes de Datos',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'Cargando estadisticas...',
    refresh: 'Actualizar',
    last_update: 'Ultima actualizacion',
  },
  fr: {
    back: 'Retour',
    title: 'Recensement des Reves',
    subtitle: 'Statistiques en direct',
    total_reports: 'Rapports Scientifiques',
    user_dreams: 'Reves Utilisateurs',
    today: 'Reves Aujourd\'hui',
    embeddings: 'Embeddings IA',
    pending: 'En attente',
    done: 'Genere',
    progress: 'Progression',
    sources: 'Sources de Donnees',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'Chargement des statistiques...',
    refresh: 'Actualiser',
    last_update: 'Derniere mise a jour',
  },
  ar: {
    back: 'رجوع',
    title: 'إحصاء الأحلام',
    subtitle: 'إحصائيات قاعدة البيانات الحية',
    total_reports: 'تقارير الأحلام العلمية',
    user_dreams: 'أحلام المستخدمين',
    today: 'أحلام اليوم',
    embeddings: 'تضمينات الذكاء الاصطناعي',
    pending: 'قيد الانتظار',
    done: 'تم التوليد',
    progress: 'التقدم',
    sources: 'مصادر البيانات',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'جاري تحميل الإحصائيات...',
    refresh: 'تحديث',
    last_update: 'آخر تحديث',
  },
  pt: {
    back: 'Voltar',
    title: 'Censo dos Sonhos',
    subtitle: 'Estatisticas ao vivo',
    total_reports: 'Relatorios Cientificos',
    user_dreams: 'Sonhos de Usuarios',
    today: 'Sonhos Hoje',
    embeddings: 'Embeddings IA',
    pending: 'Pendente',
    done: 'Gerado',
    progress: 'Progresso',
    sources: 'Fontes de Dados',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'Carregando estatisticas...',
    refresh: 'Atualizar',
    last_update: 'Ultima atualizacao',
  },
  ru: {
    back: 'Назад',
    title: 'Перепись Снов',
    subtitle: 'Статистика в реальном времени',
    total_reports: 'Научные отчёты о снах',
    user_dreams: 'Сны пользователей',
    today: 'Сны сегодня',
    embeddings: 'ИИ-эмбеддинги',
    pending: 'Ожидает',
    done: 'Сгенерировано',
    progress: 'Прогресс',
    sources: 'Источники данных',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'Загрузка статистики...',
    refresh: 'Обновить',
    last_update: 'Последнее обновление',
  },
  zh: {
    back: '返回',
    title: '梦境普查',
    subtitle: '实时数据库统计',
    total_reports: '科学梦境报告',
    user_dreams: '用户梦境',
    today: '今日梦境',
    embeddings: 'AI嵌入',
    pending: '待处理',
    done: '已生成',
    progress: '进度',
    sources: '数据来源',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: '正在加载统计...',
    refresh: '刷新',
    last_update: '最后更新',
  },
  hi: {
    back: 'वापस',
    title: 'सपनों की जनगणना',
    subtitle: 'लाइव डेटाबेस आंकड़े',
    total_reports: 'वैज्ञानिक स्वप्न रिपोर्ट',
    user_dreams: 'उपयोगकर्ता के सपने',
    today: 'आज के सपने',
    embeddings: 'AI एम्बेडिंग्स',
    pending: 'लंबित',
    done: 'उत्पन्न',
    progress: 'प्रगति',
    sources: 'डेटा स्रोत',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'आंकड़े लोड हो रहे हैं...',
    refresh: 'रिफ्रेश',
    last_update: 'अंतिम अपडेट',
  },
  ja: {
    back: '戻る',
    title: '夢の国勢調査',
    subtitle: 'ライブデータベース統計',
    total_reports: '科学的夢レポート',
    user_dreams: 'ユーザーの夢',
    today: '今日の夢',
    embeddings: 'AIエンベディング',
    pending: '保留中',
    done: '生成済み',
    progress: '進捗',
    sources: 'データソース',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: '統計を読み込み中...',
    refresh: '更新',
    last_update: '最終更新',
  },
  ko: {
    back: '뒤로',
    title: '꿈 인구조사',
    subtitle: '실시간 데이터베이스 통계',
    total_reports: '과학적 꿈 보고서',
    user_dreams: '사용자 꿈',
    today: '오늘의 꿈',
    embeddings: 'AI 임베딩',
    pending: '대기 중',
    done: '생성됨',
    progress: '진행률',
    sources: '데이터 소스',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: '통계 로딩 중...',
    refresh: '새로고침',
    last_update: '마지막 업데이트',
  },
  id: {
    back: 'Kembali',
    title: 'Sensus Mimpi',
    subtitle: 'Statistik database langsung',
    total_reports: 'Laporan Mimpi Ilmiah',
    user_dreams: 'Mimpi Pengguna',
    today: 'Mimpi Hari Ini',
    embeddings: 'Embedding AI',
    pending: 'Menunggu',
    done: 'Dihasilkan',
    progress: 'Kemajuan',
    sources: 'Sumber Data',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'Memuat statistik...',
    refresh: 'Segarkan',
    last_update: 'Terakhir diperbarui',
  },
  fa: {
    back: 'بازگشت',
    title: 'سرشماری رویاها',
    subtitle: 'آمار زنده پایگاه داده',
    total_reports: 'گزارش‌های علمی رویا',
    user_dreams: 'رویاهای کاربران',
    today: 'رویاهای امروز',
    embeddings: 'جاسازی‌های هوش مصنوعی',
    pending: 'در انتظار',
    done: 'تولید شده',
    progress: 'پیشرفت',
    sources: 'منابع داده',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'در حال بارگذاری آمار...',
    refresh: 'بازخوانی',
    last_update: 'آخرین بروزرسانی',
  },
  it: {
    back: 'Indietro',
    title: 'Censimento dei Sogni',
    subtitle: 'Statistiche database in tempo reale',
    total_reports: 'Rapporti Scientifici sui Sogni',
    user_dreams: 'Sogni degli Utenti',
    today: 'Sogni Oggi',
    embeddings: 'Embedding IA',
    pending: 'In attesa',
    done: 'Generato',
    progress: 'Progresso',
    sources: 'Fonti di Dati',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'Caricamento statistiche...',
    refresh: 'Aggiorna',
    last_update: 'Ultimo aggiornamento',
  },
  pl: {
    back: 'Wstecz',
    title: 'Spis Snow',
    subtitle: 'Statystyki bazy danych na zywo',
    total_reports: 'Naukowe Raporty Snow',
    user_dreams: 'Sny Uzytkownikow',
    today: 'Sny Dzisiaj',
    embeddings: 'Osadzenia AI',
    pending: 'Oczekujace',
    done: 'Wygenerowane',
    progress: 'Postep',
    sources: 'Zrodla Danych',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'Ladowanie statystyk...',
    refresh: 'Odswiez',
    last_update: 'Ostatnia aktualizacja',
  },
  bn: {
    back: 'ফিরে যান',
    title: 'স্বপ্নের আদমশুমারি',
    subtitle: 'লাইভ ডেটাবেস পরিসংখ্যান',
    total_reports: 'বৈজ্ঞানিক স্বপ্ন প্রতিবেদন',
    user_dreams: 'ব্যবহারকারীর স্বপ্ন',
    today: 'আজকের স্বপ্ন',
    embeddings: 'AI এম্বেডিংস',
    pending: 'মুলতুবি',
    done: 'তৈরি হয়েছে',
    progress: 'অগ্রগতি',
    sources: 'ডেটা উৎস',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'পরিসংখ্যান লোড হচ্ছে...',
    refresh: 'রিফ্রেশ',
    last_update: 'সর্বশেষ আপডেট',
  },
  ur: {
    back: 'واپس',
    title: 'خوابوں کی مردم شماری',
    subtitle: 'براہ راست ڈیٹابیس کے اعداد و شمار',
    total_reports: 'سائنسی خواب رپورٹس',
    user_dreams: 'صارفین کے خواب',
    today: 'آج کے خواب',
    embeddings: 'AI ایمبیڈنگز',
    pending: 'زیر التوا',
    done: 'تیار',
    progress: 'پیش رفت',
    sources: 'ڈیٹا ذرائع',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'اعداد و شمار لوڈ ہو رہے ہیں...',
    refresh: 'تازہ کریں',
    last_update: 'آخری تازہ کاری',
  },
  vi: {
    back: 'Quay lai',
    title: 'Dieu tra Giac mo',
    subtitle: 'Thong ke co so du lieu truc tuyen',
    total_reports: 'Bao cao Giac mo Khoa hoc',
    user_dreams: 'Giac mo Nguoi dung',
    today: 'Giac mo Hom nay',
    embeddings: 'AI Embeddings',
    pending: 'Dang cho',
    done: 'Da tao',
    progress: 'Tien do',
    sources: 'Nguon Du lieu',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'Dang tai thong ke...',
    refresh: 'Lam moi',
    last_update: 'Cap nhat lan cuoi',
  },
  th: {
    back: 'กลับ',
    title: 'สำมะโนความฝัน',
    subtitle: 'สถิติฐานข้อมูลสด',
    total_reports: 'รายงานความฝันทางวิทยาศาสตร์',
    user_dreams: 'ความฝันของผู้ใช้',
    today: 'ความฝันวันนี้',
    embeddings: 'AI Embeddings',
    pending: 'รอดำเนินการ',
    done: 'สร้างแล้ว',
    progress: 'ความคืบหน้า',
    sources: 'แหล่งข้อมูล',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'กำลังโหลดสถิติ...',
    refresh: 'รีเฟรช',
    last_update: 'อัปเดตล่าสุด',
  },
  sw: {
    back: 'Rudi',
    title: 'Sensa ya Ndoto',
    subtitle: 'Takwimu za hifadhidata moja kwa moja',
    total_reports: 'Ripoti za Kisayansi za Ndoto',
    user_dreams: 'Ndoto za Watumiaji',
    today: 'Ndoto Leo',
    embeddings: 'Ujumuishaji wa AI',
    pending: 'Inasubiri',
    done: 'Imetolewa',
    progress: 'Maendeleo',
    sources: 'Vyanzo vya Data',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'Inapakia takwimu...',
    refresh: 'Sasisha',
    last_update: 'Ilisasishwa mwisho',
  },
  hu: {
    back: 'Vissza',
    title: 'Alom Nepszamlalas',
    subtitle: 'Elo adatbazis statisztikak',
    total_reports: 'Tudomanyos Alom Jelentesek',
    user_dreams: 'Felhasznaloi Almok',
    today: 'Mai Almok',
    embeddings: 'AI Beagyazasok',
    pending: 'Fuggobe',
    done: 'Letrehozva',
    progress: 'Haladas',
    sources: 'Adatforrasok',
    sddb: 'Sleep & Dream Database (SDDb)',
    loading: 'Statisztikak betoltese...',
    refresh: 'Frissites',
    last_update: 'Utolso frissites',
  },
} as Record<string, Record<string, string>>;

const CensusPage: React.FC<CensusPageProps> = ({ language, onClose, themeMode }) => {
  const isLight = themeMode === 'light';
  const t = (T as Record<string, Record<string, string>>)[language] ?? T.en;
  const [stats, setStats] = useState<DreamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const s = await fetchStats();
      setStats(s);
      setLastUpdate(new Date());
    } catch (e) {
      console.error('Census fetch error:', e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); const iv = setInterval(load, 30_000); return () => clearInterval(iv); }, []);

  const pct = stats && stats.total_dream_reports > 0
    ? ((stats.embeddings_done / stats.total_dream_reports) * 100).toFixed(1)
    : '0';

  const cardClass = isLight
    ? 'bg-white/80 backdrop-blur-md border border-indigo-100/60 rounded-2xl p-5 shadow-sm'
    : 'bg-dream-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-5';

  const headColor = isLight ? 'text-indigo-900' : 'text-white';
  const subColor = isLight ? 'text-slate-500' : 'text-slate-400';
  const numColor = isLight ? 'text-fuchsia-600' : 'text-fuchsia-400';

  return (
    <div className={`min-h-screen ${isLight ? 'bg-mystic-bg' : 'bg-dream-bg'}`}>
      <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
        <button
          onClick={onClose}
          className={`mb-6 flex items-center gap-2 text-sm font-medium ${isLight ? 'text-fuchsia-600 hover:text-fuchsia-800' : 'text-fuchsia-400 hover:text-fuchsia-300'} transition-colors`}
        >
          <span className="material-icons text-base">arrow_back</span>
          {t.back}
        </button>

        <div className="text-center mb-8">
          <h1 className={`text-3xl font-heading font-bold ${headColor}`}>{t.title}</h1>
          <p className={`text-sm mt-1 ${subColor}`}>{t.subtitle}</p>
        </div>

        {loading && !stats ? (
          <p className={`text-center ${subColor}`}>{t.loading}</p>
        ) : stats ? (
          <div className="space-y-4">
            {/* Main stats grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className={cardClass}>
                <p className={`text-xs uppercase tracking-wider font-bold ${subColor}`}>{t.total_reports}</p>
                <p className={`text-3xl font-heading font-bold mt-1 ${numColor}`}>
                  {stats.total_dream_reports.toLocaleString()}
                </p>
              </div>
              <div className={cardClass}>
                <p className={`text-xs uppercase tracking-wider font-bold ${subColor}`}>{t.user_dreams}</p>
                <p className={`text-3xl font-heading font-bold mt-1 ${numColor}`}>
                  {stats.total_user_dreams.toLocaleString()}
                </p>
              </div>
              <div className={cardClass}>
                <p className={`text-xs uppercase tracking-wider font-bold ${subColor}`}>{t.today}</p>
                <p className={`text-3xl font-heading font-bold mt-1 ${numColor}`}>
                  {stats.dreams_today.toLocaleString()}
                </p>
              </div>
              <div className={cardClass}>
                <p className={`text-xs uppercase tracking-wider font-bold ${subColor}`}>{t.embeddings}</p>
                <p className={`text-3xl font-heading font-bold mt-1 ${numColor}`}>
                  {stats.embeddings_done.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Embedding progress bar */}
            <div className={cardClass}>
              <div className="flex justify-between items-center mb-2">
                <p className={`text-xs uppercase tracking-wider font-bold ${subColor}`}>{t.progress}</p>
                <p className={`text-sm font-bold ${numColor}`}>{pct}%</p>
              </div>
              <div className={`w-full h-3 rounded-full ${isLight ? 'bg-indigo-100' : 'bg-white/10'}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 transition-all duration-1000"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className={`text-xs ${subColor}`}>{t.done}: {stats.embeddings_done.toLocaleString()}</span>
                <span className={`text-xs ${subColor}`}>{t.pending}: {stats.embeddings_pending.toLocaleString()}</span>
              </div>
            </div>

            {/* Data sources */}
            <div className={cardClass}>
              <p className={`text-xs uppercase tracking-wider font-bold mb-3 ${subColor}`}>{t.sources}</p>
              <div className="flex items-center gap-3">
                <span className="material-icons text-violet-500">science</span>
                <div>
                  <p className={`text-sm font-bold ${headColor}`}>{t.sddb}</p>
                  <p className={`text-xs ${subColor}`}>{stats.total_dream_reports.toLocaleString()} records</p>
                </div>
              </div>
            </div>

            {/* Refresh + last update */}
            <div className="flex justify-between items-center">
              <button
                onClick={load}
                className={`text-xs flex items-center gap-1 ${isLight ? 'text-indigo-600' : 'text-fuchsia-400'} hover:underline`}
              >
                <span className="material-icons text-sm">refresh</span>
                {t.refresh}
              </button>
              {lastUpdate && (
                <span className={`text-xs ${subColor}`}>
                  {t.last_update}: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CensusPage;
