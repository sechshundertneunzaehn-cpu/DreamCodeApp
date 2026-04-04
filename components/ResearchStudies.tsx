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
  }, [studies, search, sortKey]);

  // Stats
  const stats = useMemo(() => {
    const totalParticipants = studies.reduce(
      (sum, s) => sum + (s.participant_count ?? 0),
      0
    );
    const totalDreams = studies.reduce(
      (sum, s) => sum + (s.total_dreams ?? 0),
      0
    );
    const countriesSet = new Set(
      studies.map((s) => s.country).filter(Boolean)
    );
    return {
      studies: studies.length,
      participants: totalParticipants,
      dreams: totalDreams,
      countries: countriesSet.size,
    };
  }, [studies]);

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
                {/* Badge */}
                <div className="flex items-start justify-between">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{
                      backgroundColor: study.map_color || '#6366f1',
                    }}
                  >
                    {study.study_code}
                  </span>
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
                    ) : participants.length === 0 ? (
                      <div className="text-xs opacity-50 py-2">
                        {t.noParticipants}
                      </div>
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
