import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ResearchStudiesProps {
  language: string;
  isLight: boolean;
  onClose: () => void;
  onSelectStudy?: (studyCode: string) => void;
  onShowOnMap?: (studyCode: string) => void;
  onSelectParticipant?: (participantId: string) => void;
}

interface Study {
  id: string;
  study_code: string;
  study_name: string;
  principal_investigator: string;
  institution: string;
  year_start: number | null;
  year_end: number | null;
  participant_count: number | null;
  total_dreams: number | null;
  country: string | null;
  doi: string | null;
  license: string | null;
  map_color: string | null;
  publication: string | null;
  description: string | null;
}

interface Participant {
  participant_id: string;
  study_id: string;
  age: number | null;
  gender: string | null;
}

type SortKey = 'year' | 'dreams' | 'alpha';

function getStudyType(study: Study): { label: string; color: string; icon: string } {
  const pc = study.participant_count ?? 0;
  const dc = study.total_dreams ?? 0;
  if (pc > 0 && pc <= 3) return { label: 'Einzelperson', color: '#8B5CF6', icon: '\u{1F464}' };
  const avg = pc > 0 ? dc / pc : 0;
  if (avg > 5) return { label: 'Tagebuch', color: '#22c55e', icon: '\u{1F4D3}' };
  return { label: 'Umfrage', color: '#3b82f6', icon: '\u{1F4CB}' };
}

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const T = {
  de: {
    title: 'Wissenschaftliche Studien',
    search: 'Studien durchsuchen...',
    sortYear: 'Nach Jahr',
    sortDreams: 'Nach Berichten',
    sortAlpha: 'Alphabetisch',
    studies: 'Studien',
    participants: 'Teilnehmer',
    dreams: 'Traeume',
    countries: 'Laender',
    principal_investigator: 'Forscher',
    institution: 'Institution',
    period: 'Zeitraum',
    doi: 'DOI',
    license: 'Lizenz',
    showOnMap: 'Auf Karte anzeigen',
    showParticipants: 'Teilnehmer',
    hideParticipants: 'Teilnehmer ausblenden',
    back: 'Zurueck',
    loading: 'Lade Studien...',
    empty: 'Keine Daten gefunden',
    noParticipants: 'Keine Teilnehmer gefunden',
  },
  en: {
    title: 'Scientific Studies',
    search: 'Search studies...',
    sortYear: 'By Year',
    sortDreams: 'By Reports',
    sortAlpha: 'Alphabetical',
    studies: 'Studies',
    participants: 'Participants',
    dreams: 'Dreams',
    countries: 'Countries',
    principal_investigator: 'Researcher',
    institution: 'Institution',
    period: 'Period',
    doi: 'DOI',
    license: 'License',
    showOnMap: 'Show on Map',
    showParticipants: 'Participants',
    hideParticipants: 'Hide Participants',
    back: 'Back',
    loading: 'Loading studies...',
    empty: 'No data found',
    noParticipants: 'No participants found',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ResearchStudies: React.FC<ResearchStudiesProps> = ({
  language,
  isLight,
  onClose,
  onSelectStudy,
  onShowOnMap,
  onSelectParticipant,
}) => {
  const t = language === 'de' ? T.de : T.en;

  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('year');
  const [expandedStudy, setExpandedStudy] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [dbCounts, setDbCounts] = useState<{
    participants: number;
    dreams: number;
  } | null>(null);
  const [filterWordCount, setFilterWordCount] = useState<number>(0);
  const [filterDreamsPerPart, setFilterDreamsPerPart] = useState<number>(0);
  const [filterStudyType, setFilterStudyType] = useState<string>('all');
  const [studyAvgWordCounts, setStudyAvgWordCounts] = useState<Record<string, number> | null>(null);

  // Fetch studies
  useEffect(() => {
    const fetchStudies = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('research_studies')
        .select('*');
      if (error) {
        console.error('Error fetching studies:', error);
      }
      setStudies((data as Study[]) || []);
      setLoading(false);
    };
    fetchStudies();
  }, []);

  // Fetch actual DB counts (not metadata sums)
  useEffect(() => {
    const fetchCounts = async () => {
      const [dreamsRes, participantsRes] = await Promise.all([
        supabase
          .from('research_dreams')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('research_participants')
          .select('*', { count: 'exact', head: true }),
      ]);
      setDbCounts({
        participants: participantsRes.count ?? 0,
        dreams: dreamsRes.count ?? 0,
      });
    };
    fetchCounts();
  }, []);

  // Background: avg word counts per study for filter
  useEffect(() => {
    const run = async () => {
      const PAGE = 1000;
      const stats: Record<string, { tw: number; c: number }> = {};
      let offset = 0;
      let hasMore = true;
      while (hasMore) {
        const batch = [];
        for (let i = 0; i < 5 && hasMore; i++) {
          batch.push(
            supabase.from('research_dreams')
              .select('participant_id, dream_text')
              .range(offset, offset + PAGE - 1)
              .order('id')
          );
          offset += PAGE;
        }
        const results = await Promise.all(batch);
        for (const { data } of results) {
          if (!data || data.length === 0) { hasMore = false; continue; }
          if (data.length < PAGE) hasMore = false;
          for (const d of data) {
            const code = (d.participant_id as string)?.match(/^(SDDB-\d+)/)?.[1];
            if (!code) continue;
            if (!stats[code]) stats[code] = { tw: 0, c: 0 };
            stats[code].tw += ((d.dream_text as string)?.split(/\s+/).filter(Boolean).length || 0);
            stats[code].c++;
          }
        }
      }
      const result: Record<string, number> = {};
      for (const [code, s] of Object.entries(stats)) {
        result[code] = s.c > 0 ? Math.round(s.tw / s.c) : 0;
      }
      setStudyAvgWordCounts(result);
    };
    run();
  }, []);

  // Fetch participants when a study is expanded
  useEffect(() => {
    if (!expandedStudy) {
      setParticipants([]);
      return;
    }
    const study = studies.find((s) => s.study_code === expandedStudy);
    if (!study) return;

    const fetchParticipants = async () => {
      setLoadingParticipants(true);
      const { data, error } = await supabase
        .from('research_participants')
        .select('participant_id, study_id, age, gender')
        .eq('study_id', study.id);
      if (error) console.error('Error fetching participants:', error);
      setParticipants((data as Participant[]) || []);
      setLoadingParticipants(false);
    };
    fetchParticipants();
  }, [expandedStudy, studies]);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = studies.filter(
      (s) =>
        s.study_name?.toLowerCase().includes(q) ||
        s.principal_investigator?.toLowerCase().includes(q) ||
        s.study_code?.toLowerCase().includes(q)
    );

    if (filterStudyType !== 'all') {
      list = list.filter(s => {
        const st = getStudyType(s);
        if (filterStudyType === 'survey') return st.label === 'Umfrage';
        if (filterStudyType === 'journal') return st.label === 'Tagebuch';
        if (filterStudyType === 'single') return st.label === 'Einzelperson';
        return true;
      });
    }
    if (filterDreamsPerPart > 0) {
      list = list.filter(s => {
        const pc = s.participant_count ?? 0;
        const dc = s.total_dreams ?? 0;
        return pc > 0 && (dc / pc) >= filterDreamsPerPart;
      });
    }
    if (filterWordCount > 0 && studyAvgWordCounts) {
      list = list.filter(s => (studyAvgWordCounts[s.study_code] ?? 0) >= filterWordCount);
    }

    switch (sortKey) {
      case 'year':
        list = [...list].sort(
          (a, b) => (b.year_start ?? 0) - (a.year_start ?? 0)
        );
        break;
      case 'dreams':
        list = [...list].sort(
          (a, b) => (b.total_dreams ?? 0) - (a.total_dreams ?? 0)
        );
        break;
      case 'alpha':
        list = [...list].sort((a, b) =>
          (a.study_name ?? '').localeCompare(b.study_name ?? '')
        );
        break;
    }
    return list;
  }, [studies, search, sortKey, filterStudyType, filterDreamsPerPart, filterWordCount, studyAvgWordCounts]);

  // Stats – use real DB counts when available, fall back to metadata sums
  const stats = useMemo(() => {
    const countriesSet = new Set(
      studies.map((s) => s.country).filter(Boolean)
    );
    return {
      studies: studies.length,
      participants: dbCounts?.participants ?? studies.reduce(
        (sum, s) => sum + (s.participant_count ?? 0), 0
      ),
      dreams: dbCounts?.dreams ?? studies.reduce(
        (sum, s) => sum + (s.total_dreams ?? 0), 0
      ),
      countries: countriesSet.size,
    };
  }, [studies, dbCounts]);

  // Styles
  const bg = isLight ? 'bg-white' : 'bg-gray-900/95 backdrop-blur';
  const text = isLight ? 'text-gray-900' : 'text-white';
  const cardBg = isLight
    ? 'bg-gray-50 border-gray-200'
    : 'bg-gray-800/60 border-white/10';
  const inputBg = isLight
    ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
    : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400';
  const btnPrimary =
    'bg-indigo-600 hover:bg-indigo-700 text-white transition-colors';
  const btnSecondary = isLight
    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
    : 'bg-gray-700 hover:bg-gray-600 text-white';
  const sortBtnActive = 'bg-indigo-600 text-white';
  const sortBtnInactive = isLight
    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    : 'bg-gray-800 text-gray-300 hover:bg-gray-700';

  return (
    <div className={`min-h-screen ${bg} ${text} p-4 md:p-8`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${btnSecondary}`}
          >
            &larr; {t.back}
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">{t.title}</h1>
        </div>

        {/* Stats Banner */}
        {!loading && (
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-xl border ${cardBg}`}
          >
            {[
              { label: t.studies, value: stats.studies },
              { label: t.participants, value: stats.participants.toLocaleString() },
              { label: t.dreams, value: stats.dreams.toLocaleString() },
              { label: t.countries, value: stats.countries },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-2xl font-bold text-indigo-400">
                  {item.value}
                </div>
                <div className="text-sm opacity-70">{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search + Sort */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`flex-1 px-4 py-2 rounded-lg border text-sm ${inputBg}`}
          />
          <div className="flex gap-2">
            {(
              [
                ['year', t.sortYear],
                ['dreams', t.sortDreams],
                ['alpha', t.sortAlpha],
              ] as [SortKey, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  sortKey === key ? sortBtnActive : sortBtnInactive
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Chips */}
        {!loading && (
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs opacity-50 whitespace-nowrap" style={{ minWidth: 80 }}>
                {language === 'de' ? 'Trauml\u00e4nge:' : 'Dream length:'}
              </span>
              {([
                { v: 0, l: language === 'de' ? 'Alle' : 'All' },
                { v: 50, l: language === 'de' ? 'Mind. 50 W\u00f6rter' : 'Min. 50 words' },
                { v: 100, l: language === 'de' ? 'Mind. 100 W\u00f6rter' : 'Min. 100 words' },
                { v: 200, l: language === 'de' ? 'Mind. 200 W\u00f6rter' : 'Min. 200 words' },
                { v: 500, l: language === 'de' ? 'Lange Texte (500+)' : 'Long texts (500+)' },
              ] as const).map(f => (
                <button key={f.v} onClick={() => setFilterWordCount(f.v)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  border: filterWordCount === f.v ? '1px solid #8B5CF6' : '1px solid rgba(139,92,246,0.3)',
                  background: filterWordCount === f.v ? 'rgba(139,92,246,0.2)' : 'transparent',
                  color: filterWordCount === f.v ? '#c4b5fd' : (f.v > 0 && !studyAvgWordCounts) ? '#4a5568' : '#94a3b8',
                  cursor: (f.v > 0 && !studyAvgWordCounts) ? 'wait' : 'pointer',
                  whiteSpace: 'nowrap', opacity: (f.v > 0 && !studyAvgWordCounts) ? 0.5 : 1,
                }}>{f.l}{f.v > 0 && !studyAvgWordCounts ? ' ...' : ''}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs opacity-50 whitespace-nowrap" style={{ minWidth: 80 }}>
                {language === 'de' ? 'Tr\u00e4ume/TN:' : 'Dreams/P:'}
              </span>
              {([
                { v: 0, l: language === 'de' ? 'Alle' : 'All' },
                { v: 5, l: 'Multi-Traum (5+)' },
                { v: 30, l: language === 'de' ? 'Tageb\u00fccher (30+)' : 'Diaries (30+)' },
                { v: 100, l: 'Intensiv (100+)' },
              ] as const).map(f => (
                <button key={f.v} onClick={() => setFilterDreamsPerPart(f.v)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  border: filterDreamsPerPart === f.v ? '1px solid #8B5CF6' : '1px solid rgba(139,92,246,0.3)',
                  background: filterDreamsPerPart === f.v ? 'rgba(139,92,246,0.2)' : 'transparent',
                  color: filterDreamsPerPart === f.v ? '#c4b5fd' : '#94a3b8',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}>{f.l}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs opacity-50 whitespace-nowrap" style={{ minWidth: 80 }}>
                {language === 'de' ? 'Studientyp:' : 'Study type:'}
              </span>
              {([
                { v: 'all', l: language === 'de' ? 'Alle' : 'All' },
                { v: 'survey', l: '\u{1F4CB} Umfragen' },
                { v: 'journal', l: '\u{1F4D3} Tageb\u00fccher' },
                { v: 'single', l: '\u{1F464} Einzelperson' },
              ] as const).map(f => (
                <button key={f.v} onClick={() => setFilterStudyType(f.v)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  border: filterStudyType === f.v ? '1px solid #8B5CF6' : '1px solid rgba(139,92,246,0.3)',
                  background: filterStudyType === f.v ? 'rgba(139,92,246,0.2)' : 'transparent',
                  color: filterStudyType === f.v ? '#c4b5fd' : '#94a3b8',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}>{f.l}</button>
              ))}
            </div>
            {(filterWordCount > 0 || filterDreamsPerPart > 0 || filterStudyType !== 'all') && (
              <div className="text-xs opacity-50">
                {filtered.length} {language === 'de' ? 'von' : 'of'} {studies.length} {language === 'de' ? 'Studien' : 'studies'}
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            <span className="ml-3 opacity-70">{t.loading}</span>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 opacity-50">{t.empty}</div>
        )}

        {/* Study Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((study) => (
              <div
                key={study.id}
                className={`rounded-xl border p-6 ${cardBg} flex flex-col gap-3`}
              >
                {/* Badge + Study Type */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold text-white"
                      style={{
                        backgroundColor: study.map_color || '#6366f1',
                      }}
                    >
                      {study.study_code}
                    </span>
                    {(() => { const st = getStudyType(study); return (
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{
                        backgroundColor: st.color + '20', color: st.color,
                        border: `1px solid ${st.color}40`,
                      }}>{st.icon} {st.label}</span>
                    ); })()}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold leading-snug">
                  {study.study_name}
                </h3>

                {/* Researcher + Institution */}
                <div className="text-sm opacity-70">
                  <div>
                    {t.principal_investigator}: {study.principal_investigator}
                  </div>
                  <div>
                    {t.institution}: {study.institution}
                  </div>
                  {study.country && (
                    <div>
                      {language === 'de' ? 'Land' : 'Country'}: {study.country}
                    </div>
                  )}
                </div>
                {study.description && (
                  <div className="text-xs opacity-60 italic leading-relaxed">
                    {study.description}
                  </div>
                )}

                {/* Period */}
                {(study.year_start || study.year_end) && (
                  <div className="text-sm opacity-60">
                    {t.period}: {study.year_start ?? '?'} &ndash;{' '}
                    {study.year_end ?? '?'}
                  </div>
                )}

                {/* Counts */}
                <div className="flex gap-4 text-sm">
                  {study.participant_count != null && (
                    <span>
                      {study.participant_count} {t.participants}
                    </span>
                  )}
                  {study.total_dreams != null && (
                    <span>
                      {study.total_dreams} {t.dreams}
                    </span>
                  )}
                </div>

                {/* DOI */}
                {study.doi && (
                  <a
                    href={
                      study.doi.startsWith('http')
                        ? study.doi
                        : `https://doi.org/${study.doi}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:underline truncate"
                  >
                    {t.doi}: {study.doi}
                  </a>
                )}

                {/* License */}
                {study.license && (
                  <span className="inline-block rounded-full px-2 py-0.5 text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 w-fit">
                    {t.license}: {study.license}
                  </span>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto pt-2">
                  {onShowOnMap && (
                    <button
                      onClick={() => onShowOnMap(study.study_code)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium ${btnPrimary}`}
                    >
                      {t.showOnMap}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setExpandedStudy(
                        expandedStudy === study.study_code
                          ? null
                          : study.study_code
                      )
                    }
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium ${btnSecondary}`}
                  >
                    {expandedStudy === study.study_code
                      ? t.hideParticipants
                      : t.showParticipants}
                  </button>
                </div>

                {/* Participants Expandable */}
                {expandedStudy === study.study_code && (
                  <div
                    className={`mt-2 p-3 rounded-lg border ${
                      isLight
                        ? 'bg-white border-gray-200'
                        : 'bg-gray-900/60 border-white/5'
                    }`}
                  >
                    {loadingParticipants ? (
                      <div className="flex items-center gap-2 py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500" />
                        <span className="text-xs opacity-50">...</span>
                      </div>
                    ) : participants.length === 0 && (study.total_dreams ?? 0) > 0 ? (
                      <div style={{
                        padding: '12px 16px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: 12,
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        margin: '8px 0',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 16 }}>📊</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: isLight ? '#6d28d9' : '#c4b5fd' }}>
                            {(study.total_dreams ?? 0).toLocaleString()} {language === 'de' ? 'Traumberichte in Originalstudie' : 'dream reports in original study'}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, opacity: 0.7, margin: '4px 0 0 28px' }}>
                          {language === 'de' ? 'Daten werden nach und nach importiert' : 'Data is being imported gradually'}
                        </p>
                        {study.doi && (
                          <a
                            href={study.doi.startsWith('http') ? study.doi : `https://doi.org/${study.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 12, color: '#8B5CF6', marginLeft: 28, marginTop: 4, display: 'inline-block' }}
                          >
                            {language === 'de' ? 'Studie ansehen' : 'View study'} →
                          </a>
                        )}
                      </div>
                    ) : participants.length === 0 ? (
                      <p style={{ fontSize: 13, opacity: 0.5, padding: '8px 0', margin: 0 }}>
                        {language === 'de' ? 'Noch keine Daten verfügbar' : 'No data available yet'}
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {participants.map((p) => (
                          <button
                            key={p.participant_id}
                            onClick={() =>
                              onSelectParticipant?.(p.participant_id)
                            }
                            className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                              isLight
                                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                : 'bg-indigo-900/40 text-indigo-300 hover:bg-indigo-800/60'
                            }`}
                          >
                            {p.participant_id}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchStudies;
