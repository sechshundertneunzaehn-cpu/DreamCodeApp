import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../services/apiConfig';

const SUPPORTED_LOCALES = [
  'de', 'en', 'ar', 'tr', 'ru', 'fr', 'es', 'it', 'pt', 'nl', 'pl',
  'zh', 'ja', 'ko', 'hi', 'ur', 'fa', 'id', 'vi', 'th', 'he', 'sw',
] as const;

function normalizeLocale(input?: string): string {
  const raw = (input ?? (typeof navigator !== 'undefined' ? navigator.language : 'en'))
    .split('-')[0]
    .toLowerCase();
  return (SUPPORTED_LOCALES as readonly string[]).includes(raw) ? raw : 'en';
}

export interface MatchingDreamSample {
  dream_id: string;
  study_code: string | null;
  participant_id: string | null;
  snippet_80chars: string;
}

export interface MatchingDreams {
  research_count: number;
  research_total: number;
  research_sample: MatchingDreamSample[];
}

export interface SymbolSearchResponse {
  results: any[];
  matched_via: 'direct' | 'synonym' | 'gemini_translation' | 'query_cache' | 'translations_table' | 'trigram_fallback' | string;
  translated_to?: string;
  latency_ms: number;
  matching_dreams?: MatchingDreams;
}

export interface UseSymbolSearchState {
  data: SymbolSearchResponse | null;
  loading: boolean;
  error: string | null;
}

export function useSymbolSearch(query: string, locale?: string): UseSymbolSearchState {
  const [data, setData] = useState<SymbolSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      abortRef.current?.abort();
      abortRef.current = null;
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const normalizedLocale = normalizeLocale(locale);
    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);

      apiFetch('/api/symbols/search', {
        method: 'POST',
        body: JSON.stringify({ query: trimmed, locale: normalizedLocale, limit: 20 }),
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = (await res.json()) as SymbolSearchResponse;
          if (controller.signal.aborted) return;
          setData(json);
        })
        .catch((err: any) => {
          if (err?.name === 'AbortError' || controller.signal.aborted) return;
          setError(err?.message ?? 'Search failed');
          setData(null);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, locale]);

  return { data, loading, error };
}
