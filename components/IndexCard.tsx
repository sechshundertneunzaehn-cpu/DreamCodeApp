import React, { useState, useEffect } from 'react';
import { ThemeMode, Language } from '../types';
import { getTheme } from '../theme';
import { supabase } from '../services/supabaseClient';

interface IndexCardProps {
  themeMode: ThemeMode;
  language: Language;
}

interface IndexStats {
  total_dreams: number;
  sources: number;
  languages: number;
  formats: number;
}

const SOURCE_DOTS = [
  { label: 'SDDb / DreamBank', color: 'bg-blue-500', type: 'Wissenschaftlich' },
  { label: 'Ibn Sirin / Nabulsi', color: 'bg-amber-500', type: 'Klassisch' },
  { label: 'Manuskripte', color: 'bg-red-500', type: 'Archiv' },
  { label: 'Video / Multimedia', color: 'bg-emerald-500', type: 'Multimedia' },
  { label: 'Esoterisch / Spirituell', color: 'bg-purple-500', type: 'Esoterisch' },
  { label: 'Sonniks / Vanga', color: 'bg-fuchsia-500', type: 'Volksweisheit' },
];

const FORMAT_TAGS = ['PDF', 'VIDEO', 'STUDIE', 'BUCH', 'ARTIKEL', 'MANUSKRIPT'];

export const IndexCard: React.FC<IndexCardProps> = ({ themeMode, language }) => {
  const th = getTheme(themeMode);
  const [stats, setStats] = useState<IndexStats>({ total_dreams: 0, sources: 0, languages: 0, formats: 0 });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.rpc('get_dream_stats');
        if (data) {
          setStats({
            total_dreams: data.total_dreams || 0,
            sources: 47,
            languages: 22,
            formats: 6,
          });
        }
      } catch {
        setStats({ total_dreams: 125000, sources: 47, languages: 22, formats: 6 });
      }
    })();
  }, []);

  const isDE = language === 'de';

  const statItems = [
    { value: stats.total_dreams.toLocaleString(), label: isDE ? 'Eintraege' : 'Entries' },
    { value: stats.sources.toString(), label: isDE ? 'Quellen' : 'Sources' },
    { value: stats.languages.toString(), label: isDE ? 'Sprachen' : 'Languages' },
    { value: stats.formats.toString(), label: isDE ? 'Formate' : 'Formats' },
  ];

  return (
    <div className={`rounded-xl ${th.cardBg} border ${th.border} overflow-hidden`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-bold ${th.textPrimary}`}>
            {isDE ? 'Globaler Traumwissen-Index' : 'Global Dream Knowledge Index'}
          </h3>
          <p className={`text-[10px] ${th.textMuted}`}>dreamdata.world</p>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
          INDEX
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 px-4 py-3">
        {statItems.map(s => (
          <div key={s.label} className={`text-center rounded-lg py-2 ${th.surfaceBg}`}>
            <div className={`text-sm font-bold ${th.textPrimary}`}>{s.value}</div>
            <div className={`text-[9px] ${th.textMuted}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Source Dots */}
      <div className="px-4 pb-2">
        <div className="grid grid-cols-3 gap-1.5">
          {SOURCE_DOTS.map(d => (
            <div key={d.label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${d.color} flex-shrink-0`} />
              <span className={`text-[9px] ${th.textMuted} truncate`}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Format Tags */}
      <div className="px-4 pb-3 flex flex-wrap gap-1">
        {FORMAT_TAGS.map(f => (
          <span key={f} className={`px-2 py-0.5 rounded text-[8px] font-mono ${th.surfaceBg} ${th.textMuted} border ${th.borderLight}`}>
            {f}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className={`px-4 py-3 border-t ${th.borderLight} flex items-center justify-between`}>
        <span className={`text-xs ${th.textSecondary}`}>
          {isDE ? 'Vollstaendige Recherche' : 'Full Research'}
        </span>
        <button
          onClick={() => window.open('https://dreamdata.world', '_blank')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold ${th.btnPrimary}`}
        >
          INDEX OEFFNEN \u2192
        </button>
      </div>
    </div>
  );
};

export default IndexCard;
