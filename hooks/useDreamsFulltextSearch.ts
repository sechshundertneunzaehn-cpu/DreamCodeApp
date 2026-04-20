import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../services/apiConfig';

export type SearchMode = 'all_words' | 'exact_phrase' | 'exact_word';

export interface FulltextDream {
  dream_id: string;
  study_code: string | null;
  participant_id: string | null;
  snippet: string;
  matched_at_char: number;
  matched_tokens: string[];
}

export interface FulltextResponse {
  total: number;
  results: FulltextDream[];
  tokens: string[];
  mode: SearchMode;
  offset: number;
  limit: number;
  hasMore: boolean;
  note?: string;
}

interface State {
  total: number;
  results: FulltextDream[];
  tokens: string[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
}

const PAGE_SIZE = 50;
const INITIAL: State = { total: 0, results: [], tokens: [], loading: false, loadingMore: false, error: null, hasMore: false };

export function useDreamsFulltextSearch(query: string, mode: SearchMode, locale?: string) {
  const [state, setState] = useState<State>(INITIAL);
  const abortRef = useRef<AbortController | null>(null);
  const cacheKey = `${query.trim()}|${mode}|${locale || ''}`;
  const activeKeyRef = useRef<string>('');

  // Reset + initial fetch on query/mode change
  useEffect(() => {
    const trimmed = query.trim();
    abortRef.current?.abort();
    if (trimmed.length < 2) {
      activeKeyRef.current = '';
      setState(INITIAL);
      return;
    }
    activeKeyRef.current = cacheKey;
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ ...INITIAL, loading: true });
    const timer = setTimeout(() => {
      apiFetch('/api/dreams/fulltext-search', {
        method: 'POST',
        body: JSON.stringify({ query: trimmed, mode, locale, limit: PAGE_SIZE, offset: 0 }),
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = (await res.json()) as FulltextResponse;
          if (controller.signal.aborted || activeKeyRef.current !== cacheKey) return;
          setState({
            total: json.total,
            results: json.results,
            tokens: json.tokens,
            loading: false,
            loadingMore: false,
            error: null,
            hasMore: json.hasMore,
          });
        })
        .catch((err: any) => {
          if (err?.name === 'AbortError' || controller.signal.aborted) return;
          setState({ ...INITIAL, error: err?.message ?? 'Search failed' });
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [cacheKey, mode, locale, query]);

  const loadMore = useCallback(async () => {
    if (state.loading || state.loadingMore || !state.hasMore) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setState((s) => ({ ...s, loadingMore: true }));
    try {
      const res = await apiFetch('/api/dreams/fulltext-search', {
        method: 'POST',
        body: JSON.stringify({ query: trimmed, mode, locale, limit: PAGE_SIZE, offset: state.results.length }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as FulltextResponse;
      if (activeKeyRef.current !== cacheKey) return;
      setState((s) => ({
        ...s,
        results: [...s.results, ...json.results],
        total: json.total,
        hasMore: json.hasMore,
        loadingMore: false,
      }));
    } catch (err: any) {
      setState((s) => ({ ...s, loadingMore: false, error: err?.message ?? 'Load-more failed' }));
    }
  }, [cacheKey, mode, locale, query, state.hasMore, state.loading, state.loadingMore, state.results.length]);

  return { ...state, loadMore };
}
