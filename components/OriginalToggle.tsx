import React, { useState } from 'react';
import { ThemeMode } from '../types';
import { getTheme } from '../theme';

export interface OriginalToggleProps {
  translatedText: string;
  originalText: string;
  originalLanguage: string;
  originalFlag: string;
  translationEngine?: string;
  source?: string;
  themeMode: ThemeMode;
  className?: string;
}

const RTL_LANGS = ['ar', 'fa', 'ur', 'he', 'yi'];

function isRTL(lang: string): boolean {
  return RTL_LANGS.includes(lang);
}

function getLangLabel(lang: string): string {
  const map: Record<string, string> = {
    de: 'DE', en: 'EN', tr: 'TR', ar: 'AR', ru: 'RU', fr: 'FR', es: 'ES',
    pt: 'PT', zh: 'ZH', ja: 'JA', ko: 'KO', fa: 'FA', ur: 'UR', he: 'HE',
    hi: 'HI', bn: 'BN', id: 'ID', it: 'IT', pl: 'PL', vi: 'VI', th: 'TH',
    sw: 'SW', hu: 'HU',
  };
  return map[lang] || lang.toUpperCase();
}

export const OriginalToggle: React.FC<OriginalToggleProps> = ({
  translatedText,
  originalText,
  originalLanguage,
  originalFlag,
  translationEngine,
  source,
  themeMode,
  className = '',
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const th = getTheme(themeMode);
  const rtl = isRTL(originalLanguage);
  const displayText = showOriginal ? originalText : translatedText;

  return (
    <div className={`relative ${className}`}>
      {/* Badge */}
      <div className="absolute top-2 right-2 z-10">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all duration-250 ${
          showOriginal
            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
            : `${th.surfaceBg} ${th.textMuted} border ${th.borderLight}`
        }`}>
          {showOriginal ? `\u25CE ${originalFlag} ORIGINAL` : `\u27F3 DE`}
        </span>
      </div>

      {/* Text */}
      <div
        className={`transition-opacity duration-250 ease-in-out ${th.textSecondary}`}
        dir={showOriginal && rtl ? 'rtl' : 'ltr'}
        style={{ opacity: 1 }}
        key={showOriginal ? 'original' : 'translated'}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap pr-20">
          {displayText}
        </p>
        {/* Watermark */}
        <span className={`absolute bottom-2 right-2 text-[8px] font-mono ${th.textMuted} opacity-30 select-none`}>
          {showOriginal ? getLangLabel(originalLanguage) : 'DE'}
        </span>
      </div>

      {/* Source + Engine info */}
      {(source || translationEngine) && (
        <div className={`flex items-center gap-2 mt-1 text-[9px] ${th.textMuted}`}>
          {source && <span>Quelle: {source}</span>}
          {translationEngine && <span>\u00B7 {translationEngine}</span>}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setShowOriginal(!showOriginal)}
        className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          showOriginal
            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20'
            : `${th.btnSecondary} border`
        }`}
      >
        {showOriginal ? '\u27F3 UEBERSETZUNG ANZEIGEN' : `\u25CE ${originalFlag} ORIGINAL ANZEIGEN`}
      </button>
    </div>
  );
};

export default OriginalToggle;
