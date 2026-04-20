import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  GraphNode,
  DreamSearchResult,
  DemographicFilter,
  searchDreamsFulltext,
  searchDreamsByUserId,
  searchDreamsBySymbolId,
  buildDreamsExportUrl,
} from '../services/graphDataService';

interface DreamListPanelProps {
  node: GraphNode;
  isLight: boolean;
  onClose: () => void;
  /** Side-Panel-Modus: kein Overlay, stattdessen rechte Seitenleiste */
  sidePanel?: boolean;
  /** Demografische Filter fuer die Traumsuche */
  demoFilters?: DemographicFilter;
  /** User-View: statt Fulltext-Suche alle Traeume dieses Users anzeigen */
  isUserView?: boolean;
}

const PAGE_SIZE = 100;
// Geschaetzte Item-Hoehe in px (line-clamp-3 + Padding). Used fuer Virtualisierung.
const ITEM_HEIGHT_SIDE = 90;
const ITEM_HEIGHT_MODAL = 110;
const VIRTUAL_BUFFER = 6;
// Threshold ab dem Virtualisierung greift (darunter normales Rendering)
const VIRTUAL_THRESHOLD = 60;

const DreamListPanel: React.FC<DreamListPanelProps> = ({ node, isLight, onClose, sidePanel = false, demoFilters, isUserView = false }) => {
  const [dreams, setDreams] = useState<DreamSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [frequencyHint, setFrequencyHint] = useState<number | undefined>();
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportH, setViewportH] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const panelBg = isLight ? 'bg-white/95 border-gray-200' : 'bg-[#111827]/95 border-white/10';
  const textPrimary = isLight ? 'text-gray-900' : 'text-white';
  const textSecondary = isLight ? 'text-gray-500' : 'text-gray-400';

  // Initial-Load bei Node/Filter-Wechsel; loadPage(offset=0) ersetzt Liste, loadMore haengt an.
  const loadPage = useCallback(async (offset: number) => {
    const userId = node.metadata?.userId;
    const useUserView = isUserView || (node.type === 'user' && !!userId);
    if (useUserView && userId) {
      return searchDreamsByUserId(userId, PAGE_SIZE, offset);
    }
    if (node.type === 'symbol') {
      const symbolId = node.id.replace(/^(sym_|exp_usr_|exp_)/, '');
      return searchDreamsBySymbolId(symbolId, PAGE_SIZE, demoFilters, offset);
    }
    const results = await searchDreamsFulltext(node.label, PAGE_SIZE, demoFilters);
    return { results, total: results.length };
  }, [node.id, node.label, node.type, node.metadata?.userId, demoFilters, isUserView]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDreams([]);
    setTotal(0);
    setFrequencyHint(undefined);
    setScrollTop(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    loadPage(0).then(page => {
      if (cancelled) return;
      setDreams(page.results);
      setTotal(page.total);
      setFrequencyHint(page.frequencyHint);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [loadPage]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || dreams.length >= total) return;
    setLoadingMore(true);
    try {
      const page = await loadPage(dreams.length);
      setDreams(prev => [...prev, ...page.results]);
      if (page.total > 0) setTotal(page.total);
    } finally {
      setLoadingMore(false);
    }
  }, [dreams.length, total, loadingMore, loadPage]);

  const hasMore = dreams.length < total;

  // IntersectionObserver fuer Infinite-Scroll: laedt automatisch beim Scroll ans Ende.
  useEffect(() => {
    if (!sentinelRef.current || !scrollRef.current || !hasMore || loading || loadingMore) return;
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) handleLoadMore(); },
      { root: scrollRef.current, rootMargin: '300px' },
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading, loadingMore, handleLoadMore, dreams.length]);

  // Viewport-Hoehe initial messen + bei Resize
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setViewportH(el.clientHeight);
    const ro = new ResizeObserver(() => setViewportH(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Export-Handler: triggert direkten Browser-Download via Backend-Endpoint.
  const exportDownload = useCallback((format: 'csv' | 'json') => {
    setExportOpen(false);
    const userId = node.metadata?.userId;
    const useUserView = isUserView || (node.type === 'user' && !!userId);
    let url: string | null = null;
    if (useUserView && userId) {
      url = buildDreamsExportUrl({ mode: 'user', userId, format });
    } else if (node.type === 'symbol') {
      const symbolId = node.id.replace(/^(sym_|exp_usr_|exp_)/, '');
      url = buildDreamsExportUrl({ mode: 'symbol', symbolId, format, filters: demoFilters });
    }
    if (!url) return;
    // Direktdownload (Browser folgt Content-Disposition)
    const a = document.createElement('a');
    a.href = url;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [node, isUserView, demoFilters]);

  const exportEnabled = useMemo(() => {
    const userId = node.metadata?.userId;
    const useUserView = isUserView || (node.type === 'user' && !!userId);
    return (useUserView && !!userId) || node.type === 'symbol';
  }, [node, isUserView]);

  const isUserNode = isUserView || node.type === 'user';
  const itemHeight = sidePanel ? ITEM_HEIGHT_SIDE : ITEM_HEIGHT_MODAL;
  const useVirtual = dreams.length > VIRTUAL_THRESHOLD;

  // Window berechnen (nur wenn Virtualisierung aktiv)
  const { startIdx, endIdx, padTop, padBottom } = useMemo(() => {
    if (!useVirtual || viewportH <= 0) {
      return { startIdx: 0, endIdx: dreams.length, padTop: 0, padBottom: 0 };
    }
    const s = Math.max(0, Math.floor(scrollTop / itemHeight) - VIRTUAL_BUFFER);
    const e = Math.min(dreams.length, Math.ceil((scrollTop + viewportH) / itemHeight) + VIRTUAL_BUFFER);
    return {
      startIdx: s,
      endIdx: e,
      padTop: s * itemHeight,
      padBottom: Math.max(0, (dreams.length - e) * itemHeight),
    };
  }, [useVirtual, viewportH, scrollTop, itemHeight, dreams.length]);

  const visibleDreams = useVirtual ? dreams.slice(startIdx, endIdx) : dreams;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const renderHeaderCounter = () => {
    if (loading) return '…';
    if (total === 0) return 'Keine Treffer';
    const hintFreq = frequencyHint && frequencyHint > total ? frequencyHint : node.metadata?.frequency;
    const showHint = !isUserNode && hintFreq && hintFreq > total;
    const main = `${dreams.length} von ${total} Traum${total === 1 ? '' : 'en'}`;
    return showHint
      ? `${main} · ${hintFreq}× NLP`
      : main;
  };

  const ExportMenu = () => (
    <div className="relative">
      <button
        onClick={() => setExportOpen(o => !o)}
        title="Daten exportieren"
        className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ${isLight ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-white/10 text-white/60'}`}
      >
        <span className="material-icons text-sm">file_download</span>
      </button>
      {exportOpen && (
        <div className={`absolute right-0 top-8 z-30 min-w-[110px] rounded-lg border shadow-lg overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-[#1f2937] border-white/10'}`}>
          <button
            onClick={() => exportDownload('csv')}
            className={`block w-full text-left px-3 py-1.5 text-[11px] ${isLight ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-gray-200'}`}
          >
            CSV
          </button>
          <button
            onClick={() => exportDownload('json')}
            className={`block w-full text-left px-3 py-1.5 text-[11px] ${isLight ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-gray-200'}`}
          >
            JSON
          </button>
        </div>
      )}
    </div>
  );

  if (sidePanel) {
    return (
      <div className={`absolute top-0 right-0 bottom-0 z-20 w-72 flex flex-col overflow-hidden border-l backdrop-blur-md ${panelBg}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            {isUserNode
              ? <span className="text-base shrink-0">👤</span>
              : node.metadata?.emoji && <span className="text-base shrink-0">{node.metadata.emoji}</span>}
            <div className="min-w-0">
              <h3 className={`text-xs font-bold ${textPrimary} truncate`}>{node.label}</h3>
              <span className={`text-[10px] ${textSecondary}`}>
                {renderHeaderCounter()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {exportEnabled && total > 0 && <ExportMenu />}
            <button onClick={onClose}
              className={`w-6 h-6 shrink-0 rounded-lg flex items-center justify-center ${isLight ? 'hover:bg-gray-100 text-gray-400' : 'hover:bg-white/10 text-white/40'}`}>
              <span className="material-icons text-sm">close</span>
            </button>
          </div>
        </div>

        {/* Dream List */}
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-3 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className={`text-xs ml-2 ${textSecondary}`}>Lade...</span>
            </div>
          ) : dreams.length === 0 ? (
            <p className={`text-xs py-6 text-center ${textSecondary}`}>
              Keine Traeume gefunden.
            </p>
          ) : (
            <>
              {padTop > 0 && <div style={{ height: padTop }} aria-hidden />}
              <div className="space-y-2">
                {visibleDreams.map((dream, i) => (
                  <div key={dream.dream_id || (startIdx + i)}
                    className={`rounded-lg px-2 py-1.5 border ${isLight ? 'border-gray-100 bg-gray-50/50' : 'border-white/5 bg-white/5'}`}
                    style={useVirtual ? { minHeight: itemHeight - 8 } : undefined}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {dream.study_code && (
                        <span className="text-[9px] px-1 py-0.5 rounded-full bg-violet-500/10 text-violet-400">{dream.study_code}</span>
                      )}
                      <span className={`text-[9px] ${textSecondary}`}>{dream.original_language?.toUpperCase()}</span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${textPrimary} line-clamp-3`}>
                      {dream.dream_snippet || '(Kein Text)'}
                    </p>
                  </div>
                ))}
              </div>
              {padBottom > 0 && <div style={{ height: padBottom }} aria-hidden />}
              {hasMore && (
                <div ref={sentinelRef} className="py-3 flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <span className={`text-[10px] ml-2 ${textSecondary}`}>
                    Lade weitere ({dreams.length} / {total})
                  </span>
                </div>
              )}
              {!hasMore && dreams.length > 0 && (
                <p className={`text-[10px] text-center py-2 ${textSecondary}`}>
                  Alle {total} Traeume geladen.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-20 flex items-end sm:items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className={`relative w-full max-w-md max-h-[80%] overflow-hidden rounded-2xl border backdrop-blur-md ${panelBg} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            {node.metadata?.emoji && <span className="text-xl">{node.metadata.emoji}</span>}
            <div>
              <h3 className={`text-sm font-bold ${textPrimary}`}>{node.label}</h3>
              <span className={`text-[10px] ${textSecondary}`}>
                {renderHeaderCounter()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {exportEnabled && total > 0 && <ExportMenu />}
            <button
              onClick={onClose}
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${isLight ? 'hover:bg-gray-100 text-gray-400' : 'hover:bg-white/10 text-white/40'}`}
            >
              <span className="material-icons text-base">close</span>
            </button>
          </div>
        </div>

        {/* Dream List */}
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className={`text-sm ml-2 ${textSecondary}`}>Traeume laden...</span>
            </div>
          ) : dreams.length === 0 ? (
            <p className={`text-sm py-8 text-center ${textSecondary}`}>
              Keine Traeume fuer "{node.label}" gefunden.
            </p>
          ) : (
            <>
              {padTop > 0 && <div style={{ height: padTop }} aria-hidden />}
              <div className="space-y-3">
                {visibleDreams.map((dream, i) => (
                  <div
                    key={dream.dream_id || (startIdx + i)}
                    className={`rounded-xl px-3 py-2 border ${isLight ? 'border-gray-100 bg-gray-50/50' : 'border-white/5 bg-white/5'}`}
                    style={useVirtual ? { minHeight: itemHeight - 12 } : undefined}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-medium ${textSecondary}`}>
                        {dream.participant_id ? `Teilnehmer ${dream.participant_id.slice(0, 8)}` : 'Anonym'}
                      </span>
                      {dream.study_code && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400">
                          {dream.study_code}
                        </span>
                      )}
                      {dream.original_language && (
                        <span className={`text-[9px] ${textSecondary}`}>{dream.original_language.toUpperCase()}</span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${textPrimary}`}>
                      {dream.dream_snippet || '(Kein Textausschnitt verfuegbar)'}
                    </p>
                  </div>
                ))}
              </div>
              {padBottom > 0 && <div style={{ height: padBottom }} aria-hidden />}
              {hasMore && (
                <div ref={sentinelRef} className="py-3 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <span className={`text-[11px] ml-2 ${textSecondary}`}>
                    Lade weitere ({dreams.length} / {total})
                  </span>
                </div>
              )}
              {!hasMore && dreams.length > 0 && (
                <p className={`text-[11px] text-center py-2 ${textSecondary}`}>
                  Alle {total} Traeume geladen.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DreamListPanel;
