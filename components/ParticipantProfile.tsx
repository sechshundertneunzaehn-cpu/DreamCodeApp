import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import TranslatedText from './TranslatedText';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ParticipantProfileProps {
  participantId: string;
  language: string;
  isLight: boolean;
  onClose: () => void;
  onShowOnMap?: (studyCode: string) => void;
}

interface ParticipantRow {
  id: string;
  participant_id: string;
  study_id: string;
  age: number | null;
  gender: string | null;
  ethnicity: string | null;
}

interface StudyRow {
  id: string;
  study_code: string;
  study_name: string;
  principal_investigator: string;
  institution: string;
  year_start: number | null;
  year_end: number | null;
  doi: string | null;
  publication: string | null;
  map_color: string | null;
}

interface DreamRow {
  id: string;
  dream_id: string;
  participant_id: string;
  dream_date: string | null;
  dream_night: string | null;
  dream_text: string;
  hall_van_de_castle_codes: Record<string, string> | null;
  emotions: string[] | null;
}

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const T = {
  de: {
    title: 'Teilnehmer-Profil',
    back: 'Zurück',
    loading: 'Lade Profil...',
    empty: 'Keine Daten gefunden',
    study: 'Studie',
    researcher: 'Forscher',
    institution: 'Institution',
    period: 'Zeitraum',
    age: 'Alter',
    gender: 'Geschlecht',
    ethnicity: 'Ethnizität',
    showOnMap: 'Auf Karte anzeigen',
    dreams: 'Träume',
    dreamId: 'Traum-ID',
    date: 'Datum',
    night: 'Nacht',
    hvdc: 'HVdC-Codes',
    emotionsLabel: 'Emotionen',
    source: 'Quellenangabe',
    disclaimer: 'Keine KI-Deutungen. Nur Original-Forschungsdaten.',
    noDreams: 'Keine Träume gefunden',
    doi: 'DOI',
    demographics: 'Demografische Daten',
  },
  en: {
    title: 'Participant Profile',
    back: 'Back',
    loading: 'Loading profile...',
    empty: 'No data found',
    study: 'Study',
    researcher: 'Researcher',
    institution: 'Institution',
    period: 'Period',
    age: 'Age',
    gender: 'Gender',
    ethnicity: 'Ethnicity',
    showOnMap: 'Show on Map',
    dreams: 'Dreams',
    dreamId: 'Dream ID',
    date: 'Date',
    night: 'Night',
    hvdc: 'HVdC Codes',
    emotionsLabel: 'Emotions',
    source: 'Citation',
    disclaimer: 'No AI interpretations. Original research data only.',
    noDreams: 'No dreams found',
    doi: 'DOI',
    demographics: 'Demographics',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  // Handle JSON arrays, comma-separated, or pipe-separated
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // not JSON
  }
  return raw
    .split(/[,|;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildApa(study: StudyRow): string {
  const year = study.year_start ?? '';
  const pub = study.publication ? ` ${study.publication}.` : '';
  const doiUrl = study.doi
    ? ` ${study.doi.startsWith('http') ? study.doi : `https://doi.org/${study.doi}`}`
    : '';
  return `${study.principal_investigator} (${year}). ${study.study_name}.${pub}${doiUrl}`;
}

// Color palette for tags
const TAG_COLORS = [
  'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
];

const TAG_COLORS_LIGHT = [
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ParticipantProfile: React.FC<ParticipantProfileProps> = ({
  participantId,
  language,
  isLight,
  onClose,
  onShowOnMap,
}) => {
  const t = language === 'de' ? T.de : T.en;

  const [participant, setParticipant] = useState<ParticipantRow | null>(null);
  const [study, setStudy] = useState<StudyRow | null>(null);
  const [dreams, setDreams] = useState<DreamRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // 1. Participant
      const { data: pData, error: pErr } = await supabase
        .from('research_participants')
        .select('*')
        .eq('participant_id', participantId)
        .single();
      if (pErr) {
        console.error('Error fetching participant:', pErr);
        setLoading(false);
        return;
      }
      const p = pData as ParticipantRow;
      setParticipant(p);

      // 2. Study — erst via study_id (UUID), Fallback auf study_code (String)
      let foundStudy: StudyRow | null = null;
      if (p?.study_id) {
        const { data: sData } = await supabase
          .from('research_studies')
          .select('*')
          .eq('id', p.study_id)
          .single();
        if (sData) foundStudy = sData as StudyRow;
      }
      if (!foundStudy && p?.study_id) {
        const { data: sData } = await supabase
          .from('research_studies')
          .select('*')
          .eq('study_id', p.study_id)
          .single();
        if (sData) foundStudy = sData as StudyRow;
      }
      setStudy(foundStudy);

      // 3. Dreams
      const { data: dData, error: dErr } = await supabase
        .from('research_dreams')
        .select('*')
        .eq('participant_id', participantId)
        .order('dream_date', { ascending: true })
        .order('dream_id', { ascending: true });
      if (dErr) console.error('Error fetching dreams:', dErr);
      else setDreams((dData as DreamRow[]) || []);

      setLoading(false);
    };
    load();
  }, [participantId]);

  // Styles
  const bg = isLight ? 'bg-white' : 'bg-gray-900/95 backdrop-blur';
  const text = isLight ? 'text-gray-900' : 'text-white';
  const cardBg = isLight
    ? 'bg-gray-50 border-gray-200'
    : 'bg-gray-800/60 border-white/10';
  const btnPrimary =
    'bg-indigo-600 hover:bg-indigo-700 text-white transition-colors';
  const btnSecondary = isLight
    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
    : 'bg-gray-700 hover:bg-gray-600 text-white';
  const tagColors = isLight ? TAG_COLORS_LIGHT : TAG_COLORS;
  const emotionTag = isLight
    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';

  return (
    <div className={`min-h-screen ${bg} ${text} p-4 md:p-8`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${btnSecondary}`}
          >
            &larr; {t.back}
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">{t.title}</h1>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            <span className="ml-3 opacity-70">{t.loading}</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !participant && (
          <div className="text-center py-20 opacity-50">{t.empty}</div>
        )}

        {!loading && participant && (
          <>
            {/* Read-Only Research Banner */}
            <div className={`rounded-xl border p-4 mb-4 flex items-center gap-3 ${isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-900/20 border-amber-700/30 text-amber-200'}`}>
              <span className="text-xl">🔬</span>
              <div>
                <div className="font-semibold text-sm">
                  {language === 'de' ? 'Wissenschaftliches Forschungsprofil — Nur Lesen' : 'Scientific Research Profile — Read Only'}
                </div>
                <div className="text-xs opacity-70">
                  {language === 'de' ? 'Keine Interaktion möglich. Originaldaten aus der Studie.' : 'No interaction possible. Original data from the study.'}
                </div>
              </div>
              <span className={`ml-auto px-2 py-0.5 rounded text-xs font-mono ${isLight ? 'bg-gray-200 text-gray-600' : 'bg-gray-700 text-gray-300'}`}>
                READ ONLY
              </span>
            </div>

            {/* Participant Info Card */}
            <div className={`rounded-xl border p-6 mb-6 ${cardBg}`}>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-2 flex-1">
                  <h2 className="text-xl font-bold">
                    {participant.participant_id || `P-${participant.id?.slice(0,8)}`}
                  </h2>

                  {study && (
                    <div className="space-y-1 text-sm opacity-80">
                      <div>
                        <span className="font-medium">{t.study}:</span>{' '}
                        {study.study_name}
                        {study.study_code && (
                          <span
                            className="ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                            style={{
                              backgroundColor: study.map_color || '#6366f1',
                            }}
                          >
                            {study.study_code}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">{t.researcher}:</span>{' '}
                        {study.principal_investigator}
                      </div>
                      <div>
                        <span className="font-medium">{t.institution}:</span>{' '}
                        {study.institution}
                      </div>
                      {(study.year_start || study.year_end) && (
                        <div>
                          <span className="font-medium">{t.period}:</span>{' '}
                          {study.year_start ?? '?'} &ndash;{' '}
                          {study.year_end ?? '?'}
                        </div>
                      )}
                      {study.doi && (
                        <div>
                          <span className="font-medium">{t.doi}:</span>{' '}
                          <a
                            href={
                              study.doi.startsWith('http')
                                ? study.doi
                                : `https://doi.org/${study.doi}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:underline"
                          >
                            {study.doi}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Demographics (only if data exists) */}
                  {(participant.age || participant.gender || participant.ethnicity) && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="text-xs font-medium opacity-60 mb-1">
                        {t.demographics}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm">
                        {participant.age && (
                          <span>
                            {t.age}: {participant.age}
                          </span>
                        )}
                        {participant.gender && (
                          <span>
                            {t.gender}: {participant.gender}
                          </span>
                        )}
                        {participant.ethnicity && (
                          <span>
                            {t.ethnicity}: {participant.ethnicity}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Map Button */}
                {onShowOnMap && study && (
                  <button
                    onClick={() => onShowOnMap(study.study_code)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${btnPrimary}`}
                  >
                    {t.showOnMap}
                  </button>
                )}
              </div>
            </div>

            {/* Dreams List */}
            <h2 className="text-xl font-bold mb-4">
              {t.dreams} ({dreams.length})
            </h2>

            {dreams.length === 0 ? (
              <div className="text-center py-10 opacity-50">{t.noDreams}</div>
            ) : (
              <div className="space-y-4">
                {dreams.map((dream, idx) => (
                  <div
                    key={dream.id || idx}
                    className={`rounded-xl border p-6 ${cardBg}`}
                  >
                    {/* Dream Header */}
                    <div className="flex flex-wrap gap-3 items-center mb-3 text-sm">
                      <span className={`font-bold px-2 py-0.5 rounded ${isLight ? 'bg-indigo-100 text-indigo-800' : 'bg-indigo-900/40 text-indigo-300'}`}>
                        {dream.dream_night
                          ? `${language === 'de' ? 'Nacht' : 'Night'} ${dream.dream_night}`
                          : dream.dream_id}
                      </span>
                      {dream.dream_date && (
                        <span className="opacity-60">
                          {dream.dream_date}
                        </span>
                      )}
                      {!dream.dream_date && dream.dream_night && (
                        <span className="opacity-40 text-xs">
                          {language === 'de' ? `Nacht ${dream.dream_night} der Studie` : `Night ${dream.dream_night} of the study`}
                        </span>
                      )}
                    </div>

                    {/* Dream Text */}
                    <div
                      className={`p-4 rounded-lg border font-serif text-sm leading-relaxed whitespace-pre-wrap ${
                        isLight
                          ? 'bg-white border-gray-200 text-gray-800'
                          : 'bg-gray-900/80 border-white/5 text-gray-200'
                      }`}
                    >
                      <TranslatedText text={dream.dream_text} sourceId={dream.id} table="research_dreams" field="dream_text" showOriginalToggle />
                    </div>

                    {/* HVdC Codes */}
                    {dream.hall_van_de_castle_codes && Object.keys(dream.hall_van_de_castle_codes).length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-medium opacity-60 mr-2">
                          {t.hvdc}:
                        </span>
                        <div className="inline-flex flex-wrap gap-1">
                          {Object.entries(dream.hall_van_de_castle_codes).map(([key, val], i) => (
                            <span
                              key={i}
                              className={`rounded-full px-2 py-0.5 text-xs border ${
                                tagColors[i % tagColors.length]
                              }`}
                            >
                              {key}: {val}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Emotions */}
                    {dream.emotions && dream.emotions.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium opacity-60 mr-2">
                          {t.emotionsLabel}:
                        </span>
                        <div className="inline-flex flex-wrap gap-1">
                          {(dream.emotions || []).map((emo, i) => (
                            <span
                              key={i}
                              className={`rounded-full px-2 py-0.5 text-xs border ${emotionTag}`}
                            >
                              {emo}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No interpretation notice */}
                    <div className="mt-2 text-xs opacity-40 italic">
                      {language === 'de'
                        ? 'Keine Deutung in der Originalstudie vorhanden'
                        : 'No interpretation available in the original study'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Citation / Source */}
            {study && (
              <div
                className={`mt-8 p-4 rounded-xl border ${cardBg} text-sm space-y-2`}
              >
                <div className="font-bold">{t.source}</div>
                <div className="opacity-80 italic">{buildApa(study)}</div>
                <div className="text-xs opacity-50 pt-2 border-t border-white/10">
                  {t.disclaimer}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParticipantProfile;
