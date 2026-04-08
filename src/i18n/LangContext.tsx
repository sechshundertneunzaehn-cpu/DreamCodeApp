import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Lang, translations, detectLanguage, isRtl } from './translations';

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLanguage);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('dreamcode-lang', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = isRtl(newLang) ? 'rtl' : 'ltr';
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr';
  }, [lang]);

  const t = useCallback((key: string): string => {
    return translations[lang]?.[key] ?? translations['de']?.[key] ?? key;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t, isRtl: isRtl(lang) }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLangContext(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLangContext must be used within LangProvider');
  return ctx;
}
