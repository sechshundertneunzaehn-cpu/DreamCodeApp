import { useState, useEffect, useCallback, useRef } from 'react';
import { translateText } from '../services/translationService';

const LANG_STORAGE_KEY = 'dreamcode_language';
const DEFAULT_LANG = 'de';

function getCurrentLanguage(): string {
    try {
        return localStorage.getItem(LANG_STORAGE_KEY) || DEFAULT_LANG;
    } catch {
        return DEFAULT_LANG;
    }
}

// ---------------------------------------------------------------------------
// useAutoTranslate
// ---------------------------------------------------------------------------

interface AutoTranslateResult {
    translatedText: string;
    isTranslating: boolean;
    isOriginal: boolean;
}

export function useAutoTranslate(
    text: string,
    sourceId: string,
    sourceTable: string,
    sourceField: string,
    sourceLang?: string,
): AutoTranslateResult {
    const [currentLang, setCurrentLang] = useState<string>(getCurrentLanguage);
    const [translatedText, setTranslatedText] = useState<string>(text);
    const [isTranslating, setIsTranslating] = useState<boolean>(false);

    // Track the last text we actually kicked off a translation for,
    // so we skip re-translating unchanged text on language re-renders.
    const lastTranslatedRef = useRef<{ text: string; lang: string } | null>(null);

    // Prevent state updates after unmount.
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // React to language changes from other tabs / explicit setLanguage calls.
    useEffect(() => {
        function handleStorage(event: StorageEvent) {
            if (event.key === LANG_STORAGE_KEY) {
                setCurrentLang(event.newValue || DEFAULT_LANG);
            }
        }
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Main translation effect.
    useEffect(() => {
        // Empty text — return as-is.
        if (!text) {
            setTranslatedText('');
            setIsTranslating(false);
            return;
        }

        // If sourceLang is provided and matches currentLang → no translation needed.
        if (sourceLang && sourceLang === currentLang) {
            setTranslatedText(text);
            setIsTranslating(false);
            return;
        }

        // If there is no sourceId we can still translate, but skip dedupe guard.
        const cacheKey = `${text}__${currentLang}`;
        if (
            lastTranslatedRef.current &&
            lastTranslatedRef.current.text === cacheKey
        ) {
            // Already have the right translation in state — nothing to do.
            return;
        }

        // Show original while loading.
        setTranslatedText(text);
        setIsTranslating(true);

        let cancelled = false;

        translateText(text, currentLang, sourceId, sourceTable, sourceField)
            .then((result: string) => {
                if (cancelled || !mountedRef.current) return;
                lastTranslatedRef.current = { text: cacheKey, lang: currentLang };
                setTranslatedText(result);
            })
            .catch(() => {
                if (cancelled || !mountedRef.current) return;
                // On error fall back to original text silently.
                setTranslatedText(text);
            })
            .finally(() => {
                if (!cancelled && mountedRef.current) {
                    setIsTranslating(false);
                }
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, currentLang, sourceLang, sourceId, sourceTable, sourceField]);

    const isOriginal =
        translatedText === text ||
        (!!sourceLang && sourceLang === currentLang);

    return { translatedText, isTranslating, isOriginal };
}

// ---------------------------------------------------------------------------
// useUserLanguage
// ---------------------------------------------------------------------------

interface UserLanguageResult {
    language: string;
    setLanguage: (lang: string) => void;
}

export function useUserLanguage(): UserLanguageResult {
    const [language, setLanguageState] = useState<string>(getCurrentLanguage);

    // Sync when another tab changes the language.
    useEffect(() => {
        function handleStorage(event: StorageEvent) {
            if (event.key === LANG_STORAGE_KEY) {
                setLanguageState(event.newValue || DEFAULT_LANG);
            }
        }
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const setLanguage = useCallback((lang: string) => {
        try {
            localStorage.setItem(LANG_STORAGE_KEY, lang);
        } catch {
            // ignore storage errors
        }
        setLanguageState(lang);
        // Dispatch a storage event so other hook instances in the same tab react.
        // (The native 'storage' event only fires in *other* tabs.)
        window.dispatchEvent(
            new StorageEvent('storage', {
                key: LANG_STORAGE_KEY,
                newValue: lang,
                storageArea: localStorage,
            }),
        );
    }, []);

    return { language, setLanguage };
}
