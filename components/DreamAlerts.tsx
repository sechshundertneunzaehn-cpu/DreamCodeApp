import React, { useState, useEffect, useCallback } from 'react';
import { ThemeMode, Language, ReligiousCategory } from '../types';
import { getTheme } from '../theme';
import {
  DreamAlert, AlertMatch,
  getUserAlerts, getPublicAlerts, createAlert, toggleAlert, deleteAlert,
  getAlertMatches, subscribeToAlert, unsubscribeFromAlert,
} from '../services/alertService';

interface DreamAlertsProps {
  themeMode: ThemeMode;
  language: Language;
  userId: string;
  userTier: string;
  onClose: () => void;
}

type Tab = 'my' | 'public' | 'matches';

const TRADITIONS = Object.values(ReligiousCategory);

export const DreamAlerts: React.FC<DreamAlertsProps> = ({
  themeMode, language, userId, userTier, onClose,
}) => {
  const th = getTheme(themeMode);
  const isDE = language === 'de';
  const [tab, setTab] = useState<Tab>('my');
  const [myAlerts, setMyAlerts] = useState<DreamAlert[]>([]);
  const [publicAlerts, setPublicAlerts] = useState<DreamAlert[]>([]);
  const [matches, setMatches] = useState<AlertMatch[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState('');
  const [traditions, setTraditions] = useState<string[]>([]);
  const [triggerSamedream, setTriggerSamedream] = useState(false);
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [infoText, setInfoText] = useState('');

  const canCreate = ['pro', 'premium', 'vip', 'smart'].includes(userTier.toLowerCase());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [my, pub] = await Promise.all([getUserAlerts(userId), getPublicAlerts()]);
      setMyAlerts(my);
      setPublicAlerts(pub);
    } catch { /* silent */ }
    setLoading(false);
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  const loadMatches = async (alertId: string) => {
    const m = await getAlertMatches(alertId);
    setMatches(m);
    setExpandedAlert(alertId);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createAlert({
      user_id: userId, name, keywords, traditions,
      trigger_samedream: triggerSamedream, visibility, info_text: infoText || null,
    });
    setShowCreate(false);
    setName(''); setKeywords([]); setTraditions([]); setInfoText('');
    loadData();
  };

  const handleKeywordAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && kwInput.trim()) {
      e.preventDefault();
      setKeywords([...keywords, kwInput.trim()]);
      setKwInput('');
    }
  };

  const toggleTradition = (t: string) => {
    setTraditions(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'my', label: isDE ? 'Meine Alerts' : 'My Alerts' },
    { id: 'public', label: isDE ? 'Oeffentlich' : 'Public' },
    { id: 'matches', label: 'Matches' },
  ];

  return (
    <div className={`fixed inset-0 z-[110] ${th.modalOverlay} flex items-end sm:items-center justify-center`}>
      <div className={`w-full max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl ${th.modalBg} border ${th.border} flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${th.borderLight}`}>
          <h2 className={`text-lg font-bold ${th.textPrimary}`}>
            {isDE ? 'Traum-Alerts' : 'Dream Alerts'}
          </h2>
          <button onClick={onClose} className={`p-1 rounded-lg ${th.btnGhost}`}>
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${th.borderLight}`}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                tab === t.id
                  ? `${th.textPrimary} border-b-2 border-violet-500`
                  : `${th.textMuted}`
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className={`text-center py-8 ${th.textMuted}`}>
              <span className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin inline-block" />
            </div>
          ) : tab === 'my' ? (
            <>
              {!canCreate && (
                <div className={`p-4 rounded-xl ${th.surfaceBg} border ${th.border} text-center`}>
                  <p className={`text-sm ${th.textSecondary} mb-2`}>
                    {isDE ? 'Alerts sind ab Pro verfuegbar' : 'Alerts available from Pro tier'}
                  </p>
                  <button className={`px-4 py-2 rounded-lg text-xs font-bold ${th.btnPrimary}`}>
                    Upgrade
                  </button>
                </div>
              )}
              {canCreate && (
                <button
                  onClick={() => setShowCreate(!showCreate)}
                  className={`w-full py-3 rounded-xl text-sm font-bold ${th.btnPrimary}`}
                >
                  + {isDE ? 'Alert erstellen' : 'Create Alert'}
                </button>
              )}
              {showCreate && (
                <div className={`p-4 rounded-xl ${th.surfaceBg} border ${th.border} space-y-3`}>
                  <input
                    value={name} onChange={e => setName(e.target.value)}
                    placeholder={isDE ? 'Alert-Name' : 'Alert Name'}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${th.inputBg} ${th.inputText} border ${th.inputFocus}`}
                  />
                  {/* Keywords */}
                  <div>
                    <label className={`text-[10px] ${th.textMuted} uppercase`}>Keywords</label>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-400 flex items-center gap-1">
                          {kw}
                          <button onClick={() => setKeywords(keywords.filter((_, j) => j !== i))} className="text-violet-300 hover:text-white">&times;</button>
                        </span>
                      ))}
                    </div>
                    <input
                      value={kwInput} onChange={e => setKwInput(e.target.value)}
                      onKeyDown={handleKeywordAdd}
                      placeholder="Enter zum Hinzufuegen"
                      className={`w-full px-3 py-2 rounded-lg text-sm ${th.inputBg} ${th.inputText} border ${th.inputFocus}`}
                    />
                  </div>
                  {/* Traditions */}
                  <div>
                    <label className={`text-[10px] ${th.textMuted} uppercase`}>Traditionen</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {TRADITIONS.map(t => (
                        <button
                          key={t} onClick={() => toggleTradition(t)}
                          className={`px-2 py-1 rounded-full text-[10px] transition-all ${
                            traditions.includes(t)
                              ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                              : `${th.surfaceBg} ${th.textMuted} border ${th.borderLight}`
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Toggles */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={triggerSamedream} onChange={e => setTriggerSamedream(e.target.checked)} className="accent-violet-500" />
                      <span className={th.textSecondary}>SameDream</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={visibility === 'public'} onChange={e => setVisibility(e.target.checked ? 'public' : 'private')} className="accent-violet-500" />
                      <span className={th.textSecondary}>{isDE ? 'Oeffentlich' : 'Public'}</span>
                    </label>
                  </div>
                  {/* Info */}
                  <textarea
                    value={infoText} onChange={e => setInfoText(e.target.value)}
                    placeholder={isDE ? 'Info-Text fuer den Finder (optional)' : 'Info for the finder (optional)'}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${th.inputBg} ${th.inputText} border ${th.inputFocus} resize-none`}
                  />
                  <button onClick={handleCreate} className={`w-full py-2.5 rounded-lg text-sm font-bold ${th.btnPrimary}`}>
                    {isDE ? 'Alert speichern' : 'Save Alert'}
                  </button>
                </div>
              )}
              {/* Alert List */}
              {myAlerts.map(a => (
                <div key={a.id} className={`p-3 rounded-xl ${th.surfaceBg} border ${th.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        a.match_count > 0 ? 'bg-orange-500 animate-pulse' : a.active ? 'bg-emerald-500' : 'bg-slate-500'
                      }`} />
                      <span className={`text-sm font-medium ${th.textPrimary}`}>{a.name}</span>
                      {a.match_count > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/20 text-orange-400">
                          {a.match_count} Matches
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toggleAlert(a.id, !a.active).then(loadData)} className={`p-1 rounded ${th.btnGhost} text-xs`}>
                        {a.active ? 'Pause' : 'Start'}
                      </button>
                      <button onClick={() => deleteAlert(a.id).then(loadData)} className="p-1 rounded text-red-400 hover:bg-red-500/10 text-xs">
                        X
                      </button>
                    </div>
                  </div>
                  {a.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {a.keywords.map((kw, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-violet-500/10 text-violet-400">{kw}</span>
                      ))}
                    </div>
                  )}
                  {a.match_count > 0 && (
                    <button onClick={() => loadMatches(a.id)} className={`text-xs ${th.btnGhost} mt-1`}>
                      Matches anzeigen \u2192
                    </button>
                  )}
                  {expandedAlert === a.id && matches.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {matches.map(m => (
                        <div key={m.id} className={`p-2 rounded-lg ${th.elevatedBg} border ${th.borderLight}`}>
                          <div className={`text-[10px] ${th.textMuted} mb-1`}>
                            {new Date(m.matched_at).toLocaleDateString()}
                          </div>
                          <p className={`text-xs ${th.textSecondary} line-clamp-3`}>{m.dream_text}</p>
                          {m.matched_keywords.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {m.matched_keywords.map((kw, i) => (
                                <span key={i} className="px-1 py-0.5 rounded text-[8px] bg-orange-500/20 text-orange-400">{kw}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : tab === 'public' ? (
            publicAlerts.map(a => (
              <div key={a.id} className={`p-3 rounded-xl ${th.surfaceBg} border ${th.border}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${th.textPrimary}`}>{a.name}</span>
                  <button
                    onClick={() => subscribeToAlert(a.id, userId)}
                    className="px-3 py-1 rounded-lg text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  >
                    + ABO
                  </button>
                </div>
                {a.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {a.keywords.map((kw, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-violet-500/10 text-violet-400">{kw}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className={`text-center py-8 text-sm ${th.textMuted}`}>
              {isDE ? 'Waehle einen Alert um Matches zu sehen' : 'Select an alert to view matches'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DreamAlerts;
