import React, { useEffect, useState, useCallback } from 'react';
import { GraphNode, DreamSearchResult, DemographicFilter, searchDreamsFulltext, searchDreamsByUserId, searchDreamsBySymbolId } from '../services/graphDataService';

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

const PAGE_SIZE = 50;

const DreamListPanel: React.FC<DreamListPanelProps> = ({ node, isLight, onClose, sidePanel = false, demoFilters, isUserView = false }) => {
  const [dreams, setDreams] = useState<DreamSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);

  const panelBg = isLight ? 'bg-white/95 border-gray-200' : 'bg-[#111827]/95 border-white/10';
  const textPrimary = isLight ? 'text-gray-900' : 'text-white';
  const textSecondary = isLight ? 'text-gray-500' : 'text-gray-400';

  // BUG 4: Initial-Load bei Node/Filter-Wechsel, getrennt vom Nachladen.
  // loadPage(offset=0) ersetzt Liste; loadMore() haengt an.
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
    loadPage(0).then(page => {
      if (cancelled) return;
      setDreams(page.results);
      setTotal(page.total);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [loadPage]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || dreams.length >= total) return;
    setLoadingMore(true);
    const page = await loadPage(dreams.length);
    setDreams(prev => [...prev, ...page.results]);
    if (page.total > 0) setTotal(page.total);
    setLoadingMore(false);
  }, [dreams.length, total, loadingMore, loadPage]);

  const hasMore = dreams.length < total;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isUserNode = isUserView || node.type === 'user';

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
                {loading
                  ? '…'
                  : total > dreams.length
                    ? `${dreams.length} von ${total} Traeumen`
                    : `${total} ${total === 1 ? 'Traum' : 'Traeume'}`}
              </span>
            </div>
          </div>
          <button onClick={onClose}
            className={`w-6 h-6 shrink-0 rounded-lg flex items-center justify-center ${isLight ? 'hover:bg-gray-100 text-gray-400' : 'hover:bg-white/10 text-white/40'}`}>
            <span className="material-icons text-sm">close</span>
          </button>
        </div>

        {/* Dream List */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
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
            <div className="space-y-2">
              {dreams.map((dream, i) => (
                <div key={dream.dream_id || i}
                  className={`rounded-lg px-2 py-1.5 border ${isLight ? 'border-gray-100 bg-gray-50/50' : 'border-white/5 bg-white/5'}`}>
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
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className={`w-full py-2 mt-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                    loadingMore
                      ? 'opacity-50 cursor-wait'
                      : 'hover:bg-violet-500/10'
                  } ${isLight ? 'border-violet-200 text-violet-600' : 'border-violet-500/30 text-violet-300'}`}
                >
                  {loadingMore
                    ? 'Lade...'
                    : `Weitere ${Math.min(PAGE_SIZE, total - dreams.length)} laden`}
                </button>
              )}
            </div>
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
                {loading
                  ? '…'
                  : total > dreams.length
                    ? `${dreams.length} von ${total}`
                    : `${total} Ergebnisse`}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${isLight ? 'hover:bg-gray-100 text-gray-400' : 'hover:bg-white/10 text-white/40'}`}
          >
            <span className="material-icons text-base">close</span>
          </button>
        </div>

        {/* Dream List */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
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
            <div className="space-y-3">
              {dreams.map((dream, i) => (
                <div
                  key={dream.dream_id || i}
                  className={`rounded-xl px-3 py-2 border ${isLight ? 'border-gray-100 bg-gray-50/50' : 'border-white/5 bg-white/5'}`}
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
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className={`w-full py-2 mt-1 rounded-xl text-xs font-semibold border transition-colors ${
                    loadingMore ? 'opacity-50 cursor-wait' : 'hover:bg-violet-500/10'
                  } ${isLight ? 'border-violet-200 text-violet-600' : 'border-violet-500/30 text-violet-300'}`}
                >
                  {loadingMore
                    ? 'Lade...'
                    : `Weitere ${Math.min(PAGE_SIZE, total - dreams.length)} laden`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DreamListPanel;
