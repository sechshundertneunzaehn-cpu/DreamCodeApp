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
};

const CensusPage: React.FC<CensusPageProps> = ({ language, onClose, themeMode }) => {
  const isLight = themeMode === 'light';
  const t = language === Language.DE ? T.de : T.en;
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
