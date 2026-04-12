import { Language } from '../../types';
import de from './de';

type TranslationEntry = typeof de;

// Cache: DE ist immer vorgeladen, alle anderen per lazy import()
const cache: Partial<Record<Language, TranslationEntry>> = {
    [Language.DE]: de,
};

// Expliziter Loader-Map (Vite braucht statische Import-Strings für Code-Splitting)
const loaders: Record<string, () => Promise<{ default: TranslationEntry }>> = {
    en: () => import('./en.ts'),
    tr: () => import('./tr.ts'),
    es: () => import('./es.ts'),
    fr: () => import('./fr.ts'),
    ar: () => import('./ar.ts'),
    pt: () => import('./pt.ts'),
    ru: () => import('./ru.ts'),
    zh: () => import('./zh.ts'),
    hi: () => import('./hi.ts'),
    ja: () => import('./ja.ts'),
    ko: () => import('./ko.ts'),
    id: () => import('./id.ts'),
    fa: () => import('./fa.ts'),
    it: () => import('./it.ts'),
    pl: () => import('./pl.ts'),
    bn: () => import('./bn.ts'),
    ur: () => import('./ur.ts'),
    vi: () => import('./vi.ts'),
    th: () => import('./th.ts'),
    sw: () => import('./sw.ts'),
    hu: () => import('./hu.ts'),
};

// Pre-load: gespeicherte Nutzersprache sofort laden (vor erstem Render)
const _saved = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('dreamcode_language') as Language | null)
    : null;
if (_saved && _saved !== Language.DE && loaders[_saved]) {
    loaders[_saved]().then(m => { cache[_saved] = m.default; });
}

export const loadTranslation = async (lang: Language): Promise<void> => {
    if (cache[lang]) return;
    const loader = loaders[lang];
    if (!loader) return;
    const mod = await loader();
    cache[lang] = mod.default;
};

export const TRANSLATIONS = new Proxy({} as Record<Language, TranslationEntry>, {
    get(_t, prop: string) {
        const entry = cache[prop as Language];
        if (entry) return entry;
        // Fallback zu DE während geladen wird
        return cache[Language.DE]!;
    },
});
