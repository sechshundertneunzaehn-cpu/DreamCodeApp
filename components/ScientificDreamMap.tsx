import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../services/supabaseClient';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScientificDreamMapProps {
  language: string;
  isLight: boolean;
  onClose: () => void;
  onSelectParticipant?: (participantId: string) => void;
  onSelectStudy?: (studyCode: string) => void;
}

interface ResearchStudy {
  study_code: string;
  study_name: string;
  map_color: string;
  country: string;
  lat: number;
  lng: number;
  total_dreams: number;
  principal_investigator: string;
}

interface StudyMapMarker {
  study_code: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  dream_count: number;
  map_color: string;
  marker_size: number;
}

interface ResearchParticipant {
  participant_id: string;
  study_code: string;
  country: string;
  lat: number;
  lng: number;
  dream_count: number;
}

// ─── i18n ────────────────────────────────────────────────────────────────────

interface Translations {
  title: string;
  subtitle: string;
  back: string;
  loading: string;
  noToken: string;
  studies: string;
  dreams: string;
  researcher: string;
  location: string;
  details: string;
  filterTitle: string;
  filterStudy: string;
  filterCountry: string;
  filterYear: string;
  allStudies: string;
  allCountries: string;
  legend: string;
  totalDreams: string;
  participants: string;
  noData: string;
  showAll: string;
  markers: string;
  reset: string;
}

const TRANSLATIONS: Record<string, Translations> = {
  de: {
    title: 'Wissenschaftliche Traumkarte',
    subtitle: 'Globale Forschungsdaten',
    back: 'Zurueck',
    loading: 'Daten werden geladen...',
    noToken: 'Mapbox-Token fehlt. Bitte VITE_MAPBOX_TOKEN in der .env setzen.',
    studies: 'Studien',
    dreams: 'Traeume',
    researcher: 'Forscher',
    location: 'Standort',
    details: 'Details',
    filterTitle: 'Filter',
    filterStudy: 'Studie',
    filterCountry: 'Land',
    filterYear: 'Jahr',
    allStudies: 'Alle Studien',
    allCountries: 'Alle Laender',
    legend: 'Legende',
    totalDreams: 'Traeume gesamt',
    participants: 'Teilnehmer',
    noData: 'Keine Daten verfuegbar',
    showAll: 'Alle anzeigen',
    markers: 'Marker',
    reset: 'Zuruecksetzen',
  },
  en: {
    title: 'Scientific Dream Map',
    subtitle: 'Global Research Data',
    back: 'Back',
    loading: 'Loading data...',
    noToken: 'Mapbox token missing. Please set VITE_MAPBOX_TOKEN in your .env file.',
    studies: 'Studies',
    dreams: 'Dreams',
    researcher: 'Researcher',
    location: 'Location',
    details: 'Details',
    filterTitle: 'Filters',
    filterStudy: 'Study',
    filterCountry: 'Country',
    filterYear: 'Year',
    allStudies: 'All Studies',
    allCountries: 'All Countries',
    legend: 'Legend',
    totalDreams: 'Total Dreams',
    participants: 'Participants',
    noData: 'No data available',
    showAll: 'Show all',
    markers: 'Markers',
    reset: 'Reset',
  },
  tr: {
    title: 'Bilimsel Rueya Haritasi',
    subtitle: 'Kuresel Arastirma Verileri',
    back: 'Geri',
    loading: 'Veriler yuekleniyor...',
    noToken: 'Mapbox token eksik. Luetfen .env dosyasinda VITE_MAPBOX_TOKEN ayarlayin.',
    studies: 'Calismalar',
    dreams: 'Rueyalar',
    researcher: 'Arastirmaci',
    location: 'Konum',
    details: 'Detaylar',
    filterTitle: 'Filtreler',
    filterStudy: 'Calisma',
    filterCountry: 'Ulke',
    filterYear: 'Yil',
    allStudies: 'Tum Calismalar',
    allCountries: 'Tum Ulkeler',
    legend: 'Lejant',
    totalDreams: 'Toplam Rueya',
    participants: 'Katilimcilar',
    noData: 'Veri bulunamadi',
    showAll: 'Tumunu goster',
    markers: 'Isaretciler',
    reset: 'Sifirla',
  },
  ar: {
    title: 'خريطة الأحلام العلمية',
    subtitle: 'بيانات البحث العالمية',
    back: 'رجوع',
    loading: 'جاري تحميل البيانات...',
    noToken: 'رمز Mapbox مفقود. يرجى تعيين VITE_MAPBOX_TOKEN في ملف .env.',
    studies: 'الدراسات',
    dreams: 'الأحلام',
    researcher: 'الباحث',
    location: 'الموقع',
    details: 'التفاصيل',
    filterTitle: 'التصفية',
    filterStudy: 'الدراسة',
    filterCountry: 'البلد',
    filterYear: 'السنة',
    allStudies: 'جميع الدراسات',
    allCountries: 'جميع البلدان',
    legend: 'مفتاح الخريطة',
    totalDreams: 'إجمالي الأحلام',
    participants: 'المشاركون',
    noData: 'لا توجد بيانات',
    showAll: 'عرض الكل',
    markers: 'العلامات',
    reset: 'إعادة تعيين',
  },
};

function getTranslations(language: string): Translations {
  return TRANSLATIONS[language] || TRANSLATIONS.en;
}

// ─── GeoJSON builder ─────────────────────────────────────────────────────────

function buildGeoJSON(
  items: StudyMapMarker[],
  studyLookup: Map<string, ResearchStudy>,
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: items.map((m) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [m.lng, m.lat],
      },
      properties: {
        study_code: m.study_code,
        city: m.city || '',
        country: m.country || '',
        dream_count: m.dream_count || 0,
        map_color: m.map_color || studyLookup.get(m.study_code)?.map_color || '#7c3aed',
        marker_size: m.marker_size || 8,
        study_name: studyLookup.get(m.study_code)?.study_name || m.study_code,
        investigator: studyLookup.get(m.study_code)?.principal_investigator || '',
      },
    })),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

const ScientificDreamMap: React.FC<ScientificDreamMapProps> = ({
  language,
  isLight,
  onClose,
  onSelectParticipant,
  onSelectStudy,
}) => {
  const tr = getTranslations(language);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const sourceReady = useRef(false);

  // Data state
  const [studies, setStudies] = useState<ResearchStudy[]>([]);
  const [markers, setMarkers] = useState<StudyMapMarker[]>([]);
  const [participants, setParticipants] = useState<ResearchParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedStudies, setSelectedStudies] = useState<Set<string>>(new Set());
  const [selectedCountry, setSelectedCountry] = useState('');
  const [yearRange, setYearRange] = useState<[number, number]>([2015, 2026]);
  const [filterOpen, setFilterOpen] = useState(false);

  // ── Fetch data ───────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const [studyRes, markerRes, participantRes] = await Promise.all([
          supabase.from('research_studies').select('*'),
          supabase.from('study_map_markers').select('*'),
          supabase.from('research_participants').select(
            'participant_id, study_code, country, lat, lng, dream_count',
          ),
        ]);
        if (cancelled) return;
        if (studyRes.data) setStudies(studyRes.data as ResearchStudy[]);
        if (markerRes.data) setMarkers(markerRes.data as StudyMapMarker[]);
        if (participantRes.data) setParticipants(participantRes.data as ResearchParticipant[]);
      } catch (err) {
        console.error('ScientificDreamMap: fetch error', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────

  const studyLookup = useMemo(() => {
    const m = new Map<string, ResearchStudy>();
    studies.forEach((s) => m.set(s.study_code, s));
    return m;
  }, [studies]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    markers.forEach((m) => { if (m.country) set.add(m.country); });
    return Array.from(set).sort();
  }, [markers]);

  const filteredMarkers = useMemo(() => {
    return markers.filter((m) => {
      if (selectedStudies.size > 0 && !selectedStudies.has(m.study_code)) return false;
      if (selectedCountry && m.country !== selectedCountry) return false;
      return true;
    });
  }, [markers, selectedStudies, selectedCountry]);

  const totalDreamsCount = useMemo(
    () => filteredMarkers.reduce((sum, m) => sum + (m.dream_count || 0), 0),
    [filteredMarkers],
  );

  // ── Map initialisation ──────────────────────────────────────────────────

  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isLight
        ? 'mapbox://styles/mapbox/light-v11'
        : 'mapbox://styles/mapbox/dark-v11',
      center: [10, 30],
      zoom: 2,
      maxZoom: 15,
      projection: 'globe' as any,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // GeoJSON source with clustering
      map.addSource('dream-markers', {
        type: 'geojson',
        data: buildGeoJSON(filteredMarkers, studyLookup),
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
      });

      sourceReady.current = true;

      // Cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'dream-markers',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step', ['get', 'point_count'],
            '#6366f1', 10, '#8b5cf6', 50, '#a855f7',
          ],
          'circle-radius': [
            'step', ['get', 'point_count'],
            18, 10, 24, 50, 32,
          ],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.3)',
        },
      });

      // Cluster count labels
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'dream-markers',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: { 'text-color': '#ffffff' },
      });

      // Individual markers (unclustered)
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'dream-markers',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'map_color'],
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'marker_size'],
            4, 5, 8, 8, 16, 14, 24, 18,
          ],
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.4)',
        },
      });

      // ── Click: cluster → zoom ────────────────────────────────────────────
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id;
        const src = map.getSource('dream-markers') as mapboxgl.GeoJSONSource;
        src.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          const geom = features[0].geometry;
          if (geom.type === 'Point') {
            map.easeTo({ center: geom.coordinates as [number, number], zoom: zoom ?? 5 });
          }
        });
      });

      // ── Click: single marker → popup ─────────────────────────────────────
      map.on('click', 'unclustered-point', (e) => {
        if (!e.features?.length) return;
        const props = e.features[0].properties!;
        const geom = e.features[0].geometry;
        if (geom.type !== 'Point') return;
        const coords = geom.coordinates.slice() as [number, number];

        if (popupRef.current) popupRef.current.remove();

        const bgColor = isLight ? 'rgba(255,255,255,0.97)' : 'rgba(15,15,30,0.97)';
        const textColor = isLight ? '#1e1b4b' : '#e0e7ff';
        const subColor = isLight ? '#4b5563' : '#a5b4fc';

        const html = `
          <div style="font-family:system-ui,sans-serif;min-width:200px;padding:4px 0;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="width:10px;height:10px;border-radius:50%;background:${props.map_color};flex-shrink:0;"></span>
              <strong style="font-size:14px;color:${textColor}">${props.study_name}</strong>
            </div>
            ${props.investigator ? `<div style="font-size:12px;color:${subColor};margin-bottom:3px;">${tr.researcher}: ${props.investigator}</div>` : ''}
            <div style="font-size:12px;color:${subColor};margin-bottom:3px;">
              ${tr.location}: ${[props.city, props.country].filter(Boolean).join(', ') || '-'}
            </div>
            <div style="font-size:12px;color:${subColor};margin-bottom:8px;">
              ${tr.dreams}: <strong>${props.dream_count}</strong>
            </div>
            <div style="display:flex;gap:6px;">
              <button id="sdm-btn-study" style="padding:4px 10px;border-radius:6px;border:none;background:#6366f1;color:#fff;font-size:12px;cursor:pointer;">
                ${tr.details}
              </button>
              <button id="sdm-btn-participant" style="padding:4px 10px;border-radius:6px;border:none;background:#8b5cf6;color:#fff;font-size:12px;cursor:pointer;">
                ${tr.participants}
              </button>
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          closeButton: true,
          maxWidth: '280px',
          className: isLight ? 'sdm-popup-light' : 'sdm-popup-dark',
        })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(map);

        popupRef.current = popup;

        // Attach handlers after DOM paint
        requestAnimationFrame(() => {
          document.getElementById('sdm-btn-study')?.addEventListener('click', () => {
            onSelectStudy?.(props.study_code);
          });
          document.getElementById('sdm-btn-participant')?.addEventListener('click', () => {
            const p = participants.find((px) => px.study_code === props.study_code);
            if (p) onSelectParticipant?.(p.participant_id);
          });
        });
      });

      // Cursor hints
      const setCursor = (cursor: string) => () => { map.getCanvas().style.cursor = cursor; };
      map.on('mouseenter', 'clusters', setCursor('pointer'));
      map.on('mouseleave', 'clusters', setCursor(''));
      map.on('mouseenter', 'unclustered-point', setCursor('pointer'));
      map.on('mouseleave', 'unclustered-point', setCursor(''));
    });

    return () => {
      sourceReady.current = false;
      if (popupRef.current) popupRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxToken, isLight]);

  // ── Update source on filter / data change ────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourceReady.current) return;

    const update = () => {
      const src = map.getSource('dream-markers') as mapboxgl.GeoJSONSource | undefined;
      if (src) src.setData(buildGeoJSON(filteredMarkers, studyLookup));
    };

    if (map.isStyleLoaded()) update();
    else map.once('idle', update);
  }, [filteredMarkers, studyLookup]);

  // ── Fly to filtered bounds ───────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || filteredMarkers.length === 0) return;

    // Only fly when an explicit filter is active
    if (selectedStudies.size === 0 && !selectedCountry) return;

    if (filteredMarkers.length === 1) {
      map.flyTo({ center: [filteredMarkers[0].lng, filteredMarkers[0].lat], zoom: 6, duration: 1500 });
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    filteredMarkers.forEach((m) => bounds.extend([m.lng, m.lat]));
    map.fitBounds(bounds, { padding: 60, duration: 1500, maxZoom: 10 });
  }, [filteredMarkers, selectedStudies, selectedCountry]);

  // ── Toggle helpers ───────────────────────────────────────────────────────

  const toggleStudy = useCallback((code: string) => {
    setSelectedStudies((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const flyToStudy = useCallback((study: ResearchStudy) => {
    const marker = markers.find((m) => m.study_code === study.study_code);
    if (marker && mapRef.current) {
      mapRef.current.flyTo({ center: [marker.lng, marker.lat], zoom: 5, duration: 1500 });
    }
  }, [markers]);

  const resetFilters = useCallback(() => {
    setSelectedStudies(new Set());
    setSelectedCountry('');
    setYearRange([2015, 2026]);
  }, []);

  const hasActiveFilters = selectedStudies.size > 0 || !!selectedCountry;

  // ── No-token fallback ────────────────────────────────────────────────────

  if (!mapboxToken) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
        <div className="rounded-2xl bg-black/80 border border-white/10 p-8 max-w-md text-center">
          <p className="text-white/80 text-sm mb-4">{tr.noToken}</p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition"
          >
            {tr.back}
          </button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const panelBg = isLight
    ? 'bg-white/90 border-gray-200 shadow-lg'
    : 'bg-black/80 border-white/10 shadow-2xl';

  const panelText = isLight ? 'text-gray-800' : 'text-white';
  const subText = isLight ? 'text-gray-500' : 'text-white/50';
  const mutedText = isLight ? 'text-gray-400' : 'text-white/30';

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Map */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-3 py-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back */}
          <button
            onClick={onClose}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition backdrop-blur-md border ${
              isLight
                ? 'bg-white/80 text-gray-800 hover:bg-white/90 border-gray-200'
                : 'bg-black/60 text-white/90 hover:bg-black/70 border-white/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">{tr.back}</span>
          </button>

          {/* Title */}
          <div className={`px-3 py-1.5 rounded-lg backdrop-blur-md border ${
            isLight ? 'bg-white/80 border-gray-200' : 'bg-black/60 border-white/10'
          }`}>
            <h1 className={`text-sm font-bold ${panelText}`}>{tr.title}</h1>
            <p className={`text-xs hidden sm:block ${subText}`}>{tr.subtitle}</p>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setFilterOpen((p) => !p)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition backdrop-blur-md border ${
              isLight
                ? 'bg-white/80 text-gray-700 hover:bg-white/90 border-gray-200'
                : 'bg-black/60 text-white/80 hover:bg-black/70 border-white/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {hasActiveFilters && (
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] leading-none font-bold">
                {selectedStudies.size + (selectedCountry ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Stats badge */}
        <div className={`px-3 py-1.5 rounded-lg backdrop-blur-md text-xs border ${
          isLight
            ? 'bg-white/80 border-gray-200 text-gray-700'
            : 'bg-black/60 border-white/10 text-white/70'
        }`}>
          <span className="font-semibold">{studies.length}</span> {tr.studies}
          <span className="mx-1">&middot;</span>
          <span className="font-semibold">{totalDreamsCount.toLocaleString()}</span> {tr.dreams}
        </div>
      </div>

      {/* ── Filter panel ───────────────────────────────────────────────────── */}
      {filterOpen && (
        <div className={`absolute top-16 left-3 sm:left-4 z-20 w-72 max-h-[70vh] overflow-y-auto rounded-xl backdrop-blur-xl p-4 border ${panelBg}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-semibold text-sm ${panelText}`}>{tr.filterTitle}</h3>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                {tr.reset}
              </button>
            )}
          </div>

          {/* Study multi-select */}
          <label className={`block text-xs font-medium mb-1.5 ${subText}`}>{tr.filterStudy}</label>
          <div className="max-h-36 overflow-y-auto mb-3 space-y-0.5">
            {studies.map((s) => (
              <button
                key={s.study_code}
                onClick={() => toggleStudy(s.study_code)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition ${
                  selectedStudies.size === 0 || selectedStudies.has(s.study_code)
                    ? isLight
                      ? 'text-gray-800 bg-indigo-50/60'
                      : 'text-white bg-white/10'
                    : isLight
                      ? 'text-gray-400 bg-transparent'
                      : 'text-gray-500 bg-transparent'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: s.map_color || '#7c3aed' }}
                />
                <span className="truncate flex-1">{s.study_name}</span>
                <span className={mutedText}>{s.total_dreams || '?'}</span>
              </button>
            ))}
            {studies.length === 0 && (
              <p className={`text-xs px-2 ${mutedText}`}>{tr.noData}</p>
            )}
          </div>

          {/* Country dropdown */}
          <label className={`block text-xs font-medium mb-1.5 ${subText}`}>{tr.filterCountry}</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className={`w-full mb-3 px-2 py-1.5 rounded-lg text-xs border outline-none transition ${
              isLight
                ? 'bg-white border-gray-300 text-gray-800 focus:border-indigo-400'
                : 'bg-black/50 border-white/10 text-white/90 focus:border-indigo-500'
            }`}
          >
            <option value="">{tr.allCountries}</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Year range */}
          <label className={`block text-xs font-medium mb-1 ${subText}`}>
            {tr.filterYear}: {yearRange[0]} &ndash; {yearRange[1]}
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="range" min={2010} max={2026} value={yearRange[0]}
              onChange={(e) => setYearRange([Math.min(Number(e.target.value), yearRange[1]), yearRange[1]])}
              className="flex-1 accent-indigo-500 h-1"
            />
            <input
              type="range" min={2010} max={2026} value={yearRange[1]}
              onChange={(e) => setYearRange([yearRange[0], Math.max(Number(e.target.value), yearRange[0])])}
              className="flex-1 accent-indigo-500 h-1"
            />
          </div>
        </div>
      )}

      {/* ── Legend – bottom right ──────────────────────────────────────────── */}
      <div className={`absolute bottom-6 right-4 z-10 p-3 rounded-xl backdrop-blur-md max-w-[220px] max-h-[40vh] overflow-y-auto border ${panelBg}`}>
        <h3 className={`text-xs font-bold mb-2 uppercase tracking-wide ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
          {tr.legend} ({studies.length})
        </h3>
        <div className="space-y-0.5">
          {studies.map((s) => (
            <button
              key={s.study_code}
              onClick={() => flyToStudy(s)}
              className={`w-full flex items-center gap-2 text-left text-[11px] px-1.5 py-1 rounded transition ${
                selectedStudies.size > 0 && !selectedStudies.has(s.study_code) ? 'opacity-40' : 'opacity-100'
              } ${isLight ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
                style={{ backgroundColor: s.map_color || '#7c3aed' }}
              />
              <span className="truncate flex-1">{s.study_name}</span>
              <span className={`shrink-0 tabular-nums ${mutedText}`}>{s.total_dreams || '?'}</span>
            </button>
          ))}
          {studies.length === 0 && (
            <p className={`text-[11px] ${mutedText}`}>{tr.noData}</p>
          )}
        </div>
      </div>

      {/* ── Stats bar – bottom left ───────────────────────────────────────── */}
      <div className="absolute bottom-6 left-4 z-10 flex gap-2">
        {[
          { label: tr.studies, value: studies.length, color: 'text-indigo-400' },
          { label: tr.markers, value: filteredMarkers.length, color: 'text-emerald-400' },
          { label: tr.dreams, value: totalDreamsCount.toLocaleString(), color: 'text-amber-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`backdrop-blur-md rounded-lg px-3 py-2 border ${
              isLight ? 'bg-white/80 border-gray-200' : 'bg-black/70 border-white/10'
            }`}
          >
            <div className={`text-xs ${stat.color}`}>{stat.label}</div>
            <div className={`font-bold text-sm ${panelText}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ── Loading overlay ────────────────────────────────────────────────── */}
      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-white/70 text-sm">{tr.loading}</p>
          </div>
        </div>
      )}

      {/* ── Popup styles ──────────────────────────────────────────────────── */}
      <style>{`
        .sdm-popup-dark .mapboxgl-popup-content {
          background: rgba(15,15,30,0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .sdm-popup-dark .mapboxgl-popup-tip {
          border-top-color: rgba(15,15,30,0.95);
        }
        .sdm-popup-dark .mapboxgl-popup-close-button {
          color: rgba(255,255,255,0.5);
          font-size: 16px;
          padding: 4px 8px;
        }
        .sdm-popup-light .mapboxgl-popup-content {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
        .sdm-popup-light .mapboxgl-popup-tip {
          border-top-color: rgba(255,255,255,0.95);
        }
        .sdm-popup-light .mapboxgl-popup-close-button {
          color: rgba(0,0,0,0.4);
          font-size: 16px;
          padding: 4px 8px;
        }
      `}</style>
    </div>
  );
};

export default ScientificDreamMap;
