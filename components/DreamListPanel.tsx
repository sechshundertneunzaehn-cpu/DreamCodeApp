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
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const panelBg = isLight ? 'bg-white/95 border-gray-200' : 'bg-[#111827]/95 border-white/10';
  const textPrimary = isLight ? 'text-gray-900' : 'text-white';
  const textSecondary = isLight ? 'text-gray-500' : 'text-gray-400';

  const loadDreams = useCallback(async (pageNum: number) => {
    setLoading(true);
    const userId = node.metadata?.userId;
    const useUserView = isUserView || (node.type === 'user' && !!userId);
    let results: DreamSearchResult[];
    if (useUserView && userId) {
      results = await searchDreamsByUserId(userId, PAGE_SIZE);
    } else if (node.type === 'symbol') {
      // BUG-Y: Symbol-Nodes nutzen symbol_id (dream_symbol_links) statt Fulltext.
      // id-Prefix entfernen: sym_<uuid> / exp_<uuid> → <uuid>
      const symbolId = node.id.replace(/^(sym_|exp_usr_|exp_)/, '');
      results = await searchDreamsBySymbolId(symbolId, PAGE_SIZE, demoFilters);
    } else {
      results = await searchDreamsFulltext(node.label, PAGE_SIZE, demoFilters);
    }
    setDreams(results);
    setTotal(results.length);
    setPage(pageNum);
    setLoading(false);
  }, [node.id, node.label, node.type, node.metadata?.userId, demoFilters, isUserView]);

  useEffect(() => {
    loadDreams(0);
  }, [loadDreams]);

  // Klick außerhalb schließt das Panel
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const displayDreams = dreams.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

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
                {isUserNode
                  ? `${total} Traeume`
                  : (node.metadata?.frequency ? `${node.metadata.frequency}× getr.` : `${total} Ergebn.`)}
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
          ) : displayDreams.length === 0 ? (
            <p className={`text-xs py-6 text-center ${textSecondary}`}>
              Keine Traeume gefunden.
            </p>
          ) : (
            <div className="space-y-2">
              {displayDreams.map((dream, i) => (
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
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/10 shrink-0">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className={`text-[10px] px-2 py-0.5 rounded ${page === 0 ? 'opacity-30' : 'hover:bg-white/10'} ${textSecondary}`}>‹</button>
            <span className={`text-[10px] ${textSecondary}`}>{page + 1}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className={`text-[10px] px-2 py-0.5 rounded ${page >= totalPages - 1 ? 'opacity-30' : 'hover:bg-white/10'} ${textSecondary}`}>›</button>
          </div>
        )}
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
                {node.metadata?.frequency ? `${node.metadata.frequency}x getraeumt` : `${total} Ergebnisse`}
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
          ) : displayDreams.length === 0 ? (
            <p className={`text-sm py-8 text-center ${textSecondary}`}>
              Keine Traeume fuer "{node.label}" gefunden.
            </p>
          ) : (
            <div className="space-y-3">
              {displayDreams.map((dream, i) => (
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
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/10">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className={`text-xs px-3 py-1 rounded-lg ${page === 0 ? 'opacity-30' : 'hover:bg-white/10'} ${textSecondary}`}
            >
              Zurueck
            </button>
            <span className={`text-[10px] ${textSecondary}`}>
              Seite {page + 1} von {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className={`text-xs px-3 py-1 rounded-lg ${page >= totalPages - 1 ? 'opacity-30' : 'hover:bg-white/10'} ${textSecondary}`}
            >
              Weiter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DreamListPanel;
