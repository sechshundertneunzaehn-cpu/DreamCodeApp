import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export interface WorldMapDot {
  lat: number;
  lng: number;
}

export interface WorldMapDotsResult {
  dots: WorldMapDot[];
  participantCount: number | null;
  countryCount: number | null;
  loading: boolean;
  error: string | null;
}

const SAMPLE_SIZE = 800;

export function useWorldMapDots(): WorldMapDotsResult {
  const [state, setState] = useState<WorldMapDotsResult>({
    dots: [],
    participantCount: null,
    countryCount: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // study_map_markers ist bereits pro Ort aggregiert (~100 Eintraege weltweit),
        // research_participants clustert dagegen auf wenige Studien-Standorte.
        // Markers fuer Dots, participants nur fuer den Teilnehmer-Count im Overlay.
        const [markersRes, countRes] = await Promise.all([
          supabase
            .from('study_map_markers')
            .select('country, lat, lng')
            .not('lat', 'is', null),
          supabase
            .from('research_participants')
            .select('participant_id', { count: 'exact', head: true })
            .not('lat', 'is', null),
        ]);

        if (cancelled) return;

        type Marker = { country: string | null; lat: number; lng: number };
        const markers = (markersRes.data ?? []) as Marker[];
        const seen = new Set<string>();
        const unique: Marker[] = [];
        const countries = new Set<string>();
        for (const m of markers) {
          if (m.country) countries.add(m.country);
          const key = `${m.lat.toFixed(3)}|${m.lng.toFixed(3)}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(m);
          }
        }

        const step = Math.max(1, Math.floor(unique.length / SAMPLE_SIZE));
        const sampled = unique.filter((_, i) => i % step === 0).slice(0, SAMPLE_SIZE);

        setState({
          dots: sampled.map((m) => ({ lat: m.lat, lng: m.lng })),
          participantCount: countRes.count ?? null,
          countryCount: countries.size > 0 ? countries.size : null,
          loading: false,
          error: markersRes.error?.message ?? countRes.error?.message ?? null,
        });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'unknown error';
        setState((prev) => ({ ...prev, loading: false, error: message }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
