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
        const [rowsRes, countRes] = await Promise.all([
          supabase
            .from('research_participants')
            .select('participant_id, country, lat, lng')
            .not('lat', 'is', null)
            .order('participant_id', { ascending: true })
            .range(0, 999),
          supabase
            .from('research_participants')
            .select('participant_id', { count: 'exact', head: true })
            .not('lat', 'is', null),
        ]);

        if (cancelled) return;

        const rows = (rowsRes.data ?? []) as Array<{
          participant_id: string;
          country: string | null;
          lat: number;
          lng: number;
        }>;

        const step = Math.max(1, Math.floor(rows.length / SAMPLE_SIZE));
        const sampled = rows.filter((_, i) => i % step === 0).slice(0, SAMPLE_SIZE);

        const countries = new Set<string>();
        rows.forEach((r) => {
          if (r.country) countries.add(r.country);
        });

        setState({
          dots: sampled.map((r) => ({ lat: r.lat, lng: r.lng })),
          participantCount: countRes.count ?? null,
          countryCount: countries.size > 0 ? countries.size : null,
          loading: false,
          error: rowsRes.error?.message ?? countRes.error?.message ?? null,
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
