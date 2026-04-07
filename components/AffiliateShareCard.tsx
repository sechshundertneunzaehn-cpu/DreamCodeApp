import React, { useState } from 'react';
import { ThemeMode, Language } from '../types';
import { getTheme } from '../theme';

interface AffiliateShareCardProps {
  themeMode: ThemeMode;
  language: Language;
  code: string;
  influencerName: string;
  stats: { clicks: number; conversions: number; earned: number };
}

export const AffiliateShareCard: React.FC<AffiliateShareCardProps> = ({
  themeMode, language, code, influencerName, stats,
}) => {
  const th = getTheme(themeMode);
  const [copied, setCopied] = useState(false);
  const isDE = language === 'de';
  const link = `https://dream-code.app/?ref=${code}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl p-4 ${th.cardBg} border ${th.border}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-bold ${th.textPrimary}`}>
          {isDE ? 'Dein Affiliate-Link' : 'Your Affiliate Link'}
        </h3>
        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          {influencerName}
        </span>
      </div>

      {/* Link Display */}
      <div className={`flex items-center gap-2 p-3 rounded-lg ${th.surfaceBg} border ${th.borderLight} mb-4`}>
        <span className={`text-xs ${th.textSecondary} flex-1 truncate font-mono`}>{link}</span>
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            copied ? 'bg-emerald-500/20 text-emerald-400' : th.btnPrimary
          }`}
        >
          {copied ? '\u2713' : isDE ? 'KOPIEREN' : 'COPY'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className={`rounded-lg p-3 ${th.surfaceBg} text-center`}>
          <div className={`text-lg font-bold ${th.textPrimary}`}>{stats.clicks}</div>
          <div className={`text-[9px] ${th.textMuted}`}>Clicks</div>
        </div>
        <div className={`rounded-lg p-3 ${th.surfaceBg} text-center`}>
          <div className={`text-lg font-bold text-emerald-500`}>{stats.conversions}</div>
          <div className={`text-[9px] ${th.textMuted}`}>Conversions</div>
        </div>
        <div className={`rounded-lg p-3 ${th.surfaceBg} text-center`}>
          <div className={`text-lg font-bold text-amber-500`}>{stats.earned.toFixed(2)}\u20AC</div>
          <div className={`text-[9px] ${th.textMuted}`}>Earned</div>
        </div>
      </div>

      {/* QR Placeholder */}
      <div className={`rounded-lg p-4 ${th.surfaceBg} border ${th.borderLight} text-center`}>
        <div className={`text-4xl mb-2`}>
          <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto opacity-50">
            <rect x="10" y="10" width="30" height="30" fill="currentColor" className={th.textSecondary}/>
            <rect x="60" y="10" width="30" height="30" fill="currentColor" className={th.textSecondary}/>
            <rect x="10" y="60" width="30" height="30" fill="currentColor" className={th.textSecondary}/>
            <rect x="50" y="50" width="10" height="10" fill="currentColor" className={th.textSecondary}/>
            <rect x="70" y="70" width="20" height="20" fill="currentColor" className={th.textSecondary}/>
          </svg>
        </div>
        <p className={`text-[10px] ${th.textMuted}`}>QR-Code (wird bei Bedarf generiert)</p>
      </div>
    </div>
  );
};

export default AffiliateShareCard;
