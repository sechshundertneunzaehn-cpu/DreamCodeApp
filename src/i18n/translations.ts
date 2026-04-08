// ─── SUPPORTED LANGUAGES (22) ─────────────────────────────────────────────────

export type Lang =
  | 'de' | 'en' | 'tr' | 'es' | 'fr' | 'ar' | 'pt' | 'ru'
  | 'zh' | 'hi' | 'ja' | 'ko' | 'id' | 'fa' | 'it' | 'pl'
  | 'bn' | 'ur' | 'vi' | 'th' | 'sw' | 'hu';

export const LANG_LABELS: Record<Lang, string> = {
  de: 'Deutsch',
  en: 'English',
  tr: 'Türkçe',
  es: 'Español',
  fr: 'Français',
  ar: 'العربية',
  pt: 'Português',
  ru: 'Русский',
  zh: '中文',
  hi: 'हिन्दी',
  ja: '日本語',
  ko: '한국어',
  id: 'Bahasa',
  fa: 'فارسی',
  it: 'Italiano',
  pl: 'Polski',
  bn: 'বাংলা',
  ur: 'اردو',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  sw: 'Kiswahili',
  hu: 'Magyar',
};

export const LANG_FLAGS: Record<Lang, string> = {
  de: '🇩🇪',
  en: '🇺🇸',
  tr: '🇹🇷',
  es: '🇪🇸',
  fr: '🇫🇷',
  ar: '🇸🇦',
  pt: '🇧🇷',
  ru: '🇷🇺',
  zh: '🇨🇳',
  hi: '🇮🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
  id: '🇮🇩',
  fa: '🇮🇷',
  it: '🇮🇹',
  pl: '🇵🇱',
  bn: '🇧🇩',
  ur: '🇵🇰',
  vi: '🇻🇳',
  th: '🇹🇭',
  sw: '🇰🇪',
  hu: '🇭🇺',
};

// ─── IMPORT ALL LOCALES ───────────────────────────────────────────────────────

import { de } from './locales/de';
import { en } from './locales/en';
import { tr } from './locales/tr';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { ar } from './locales/ar';
import { pt } from './locales/pt';
import { ru } from './locales/ru';
import { zh } from './locales/zh';
import { hi } from './locales/hi';
import { ja } from './locales/ja';
import { ko } from './locales/ko';
import { id } from './locales/id';
import { fa } from './locales/fa';
import { it } from './locales/it';
import { pl } from './locales/pl';
import { bn } from './locales/bn';
import { ur } from './locales/ur';
import { vi } from './locales/vi';
import { th } from './locales/th';
import { sw } from './locales/sw';
import { hu } from './locales/hu';

export const translations: Record<Lang, Record<string, string>> = {
  de, en, tr, es, fr, ar, pt, ru,
  zh, hi, ja, ko, id, fa, it, pl,
  bn, ur, vi, th, sw, hu,
};

// ─── UTILITIES ────────────────────────────────────────────────────────────────

export function detectLanguage(): Lang {
  const stored = localStorage.getItem('dreamcode-lang') as Lang | null;
  if (stored && translations[stored]) return stored;

  const browserLang = navigator.language.toLowerCase();
  const langMap: [string, Lang][] = [
    ['de', 'de'], ['tr', 'tr'], ['es', 'es'], ['fr', 'fr'],
    ['ar', 'ar'], ['pt', 'pt'], ['ru', 'ru'], ['zh', 'zh'],
    ['hi', 'hi'], ['ja', 'ja'], ['ko', 'ko'], ['id', 'id'],
    ['fa', 'fa'], ['it', 'it'], ['pl', 'pl'], ['bn', 'bn'],
    ['ur', 'ur'], ['vi', 'vi'], ['th', 'th'], ['sw', 'sw'],
    ['hu', 'hu'], ['en', 'en'],
  ];

  for (const [prefix, lang] of langMap) {
    if (browserLang.startsWith(prefix)) return lang;
  }
  return 'de';
}

export function isRtl(lang: Lang): boolean {
  return lang === 'ar' || lang === 'fa' || lang === 'ur';
}
