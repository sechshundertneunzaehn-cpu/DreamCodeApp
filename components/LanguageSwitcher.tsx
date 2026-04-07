import React, { useState } from 'react';
import { ThemeMode, Language } from '../types';
import { getTheme } from '../theme';

interface LanguageSwitcherProps {
  themeMode: ThemeMode;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onTranslateAll?: (engine: TranslationEngine) => void;
}

export type TranslationEngine = 'deepl' | 'google' | 'claude';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: Language.DE, label: 'Deutsch', flag: '\uD83C\uDDE9\uD83C\uDDEA' },
  { code: Language.EN, label: 'English', flag: '\uD83C\uDDEC\uD83C\uDDE7' },
  { code: Language.TR, label: 'Tuerkce', flag: '\uD83C\uDDF9\uD83C\uDDF7' },
  { code: Language.AR, label: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', flag: '\uD83C\uDDF8\uD83C\uDDE6' },
  { code: Language.RU, label: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439', flag: '\uD83C\uDDF7\uD83C\uDDFA' },
  { code: Language.FR, label: 'Francais', flag: '\uD83C\uDDEB\uD83C\uDDF7' },
  { code: Language.ES, label: 'Espanol', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
  { code: Language.PT, label: 'Portugues', flag: '\uD83C\uDDE7\uD83C\uDDF7' },
  { code: Language.ZH, label: '\u4E2D\u6587', flag: '\uD83C\uDDE8\uD83C\uDDF3' },
  { code: Language.JA, label: '\u65E5\u672C\u8A9E', flag: '\uD83C\uDDEF\uD83C\uDDF5' },
  { code: Language.KO, label: '\uD55C\uAD6D\uC5B4', flag: '\uD83C\uDDF0\uD83C\uDDF7' },
  { code: Language.FA, label: '\u0641\u0627\u0631\u0633\u06CC', flag: '\uD83C\uDDEE\uD83C\uDDF7' },
];

const ENGINES: { id: TranslationEngine; label: string; badge?: string }[] = [
  { id: 'google', label: 'Google', badge: 'FREE' },
  { id: 'deepl', label: 'DeepL', badge: 'PRO' },
  { id: 'claude', label: 'Claude', badge: 'AI' },
];

const SCOPES = [
  { id: 'dreams', label: { de: 'Traeume', en: 'Dreams' } },
  { id: 'search', label: { de: 'Suchergebnisse', en: 'Search Results' } },
  { id: 'classics', label: { de: 'Klassische Quellen', en: 'Classic Sources' } },
  { id: 'ai', label: { de: 'AI-Output', en: 'AI Output' } },
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  themeMode,
  currentLanguage,
  onLanguageChange,
  onTranslateAll,
}) => {
  const th = getTheme(themeMode);
  const [selectedEngine, setSelectedEngine] = useState<TranslationEngine>(() => {
    return (localStorage.getItem('translation_engine') as TranslationEngine) || 'google';
  });
  const [activeScopes, setActiveScopes] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('translation_scopes');
    return saved ? new Set(JSON.parse(saved)) : new Set(['dreams', 'search', 'classics', 'ai']);
  });
  const [translating, setTranslating] = useState(false);

  const handleEngineChange = (engine: TranslationEngine) => {
    setSelectedEngine(engine);
    localStorage.setItem('translation_engine', engine);
  };

  const toggleScope = (scope: string) => {
    const next = new Set(activeScopes);
    if (next.has(scope)) next.delete(scope); else next.add(scope);
    setActiveScopes(next);
    localStorage.setItem('translation_scopes', JSON.stringify([...next]));
  };

  const handleTranslateAll = async () => {
    if (!onTranslateAll) return;
    setTranslating(true);
    try { await onTranslateAll(selectedEngine); } finally { setTranslating(false); }
  };

  const isDE = currentLanguage === Language.DE || currentLanguage === Language.DE;

  return (
    <div className={`rounded-xl p-4 ${th.cardBg} border ${th.border} space-y-4`}>
      {/* Language Grid */}
      <div>
        <h4 className={`text-xs font-bold ${th.textMuted} uppercase mb-2`}>
          {isDE ? 'Sprache' : 'Language'}
        </h4>
        <div className="grid grid-cols-4 gap-1.5">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => onLanguageChange(l.code)}
              className={`px-2 py-1.5 rounded-lg text-xs transition-all ${
                currentLanguage === l.code
                  ? `${th.btnPrimary} text-white`
                  : `${th.surfaceBg} ${th.textSecondary} border ${th.borderLight} hover:${th.border}`
              }`}
            >
              {l.flag} {l.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Engine Selection */}
      <div>
        <h4 className={`text-xs font-bold ${th.textMuted} uppercase mb-2`}>
          {isDE ? 'Uebersetzungs-Engine' : 'Translation Engine'}
        </h4>
        <div className="flex gap-2">
          {ENGINES.map(e => (
            <button
              key={e.id}
              onClick={() => handleEngineChange(e.id)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedEngine === e.id
                  ? `${th.btnPrimary}`
                  : `${th.surfaceBg} ${th.textSecondary} border ${th.borderLight}`
              }`}
            >
              {e.label}
              {e.badge && (
                <span className={`ml-1 text-[8px] px-1 py-0.5 rounded ${
                  selectedEngine === e.id ? 'bg-white/20' : 'bg-violet-500/20 text-violet-400'
                }`}>
                  {e.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scope Toggles */}
      <div>
        <h4 className={`text-xs font-bold ${th.textMuted} uppercase mb-2`}>
          {isDE ? 'Bereiche' : 'Scopes'}
        </h4>
        <div className="flex flex-wrap gap-2">
          {SCOPES.map(s => (
            <button
              key={s.id}
              onClick={() => toggleScope(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                activeScopes.has(s.id)
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  : `${th.surfaceBg} ${th.textMuted} border ${th.borderLight}`
              }`}
            >
              {activeScopes.has(s.id) ? '\u2713 ' : ''}{(s.label as any)[currentLanguage] || s.label.en}
            </button>
          ))}
        </div>
      </div>

      {/* Translate All */}
      {onTranslateAll && (
        <button
          onClick={handleTranslateAll}
          disabled={translating}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
            translating ? th.btnDisabled : th.btnPrimary
          }`}
        >
          {translating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isDE ? 'Uebersetze...' : 'Translating...'}
            </span>
          ) : (
            isDE ? 'ALLES UEBERSETZEN' : 'TRANSLATE ALL'
          )}
        </button>
      )}
    </div>
  );
};

export default LanguageSwitcher;
