// ─── Supabase Remote-Sync ──────────���──────────────────────────────────────────
// Zweifach-Sicherung: Lokale Daten (localStorage/IndexedDB) werden
// zusaetzlich in Supabase user_backups gesichert.
// Alle Operationen sind fire-and-forget — Supabase-Fehler blockieren nie die App.

import { supabase, ensureAuth } from './supabaseClient';
import type { Dream, UserProfile } from '../types';

// ─── Debounce ─────────────────────────────────────────────────────────────────
// Verhindert zu viele Schreibzugriffe bei schnellen aufeinanderfolgenden Saves.

let _dreamsTimer: ReturnType<typeof setTimeout> | null = null;
let _profileTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 3000;

// ─── Push: Dreams nach Supabase ───────────────────────────────────────────────

export function pushDreamsDebounced(dreams: Dream[]): void {
  if (_dreamsTimer) clearTimeout(_dreamsTimer);
  _dreamsTimer = setTimeout(() => pushDreams(dreams), DEBOUNCE_MS);
}

async function pushDreams(dreams: Dream[]): Promise<void> {
  try {
    const userId = await ensureAuth();
    if (!userId) return;

    const { error } = await supabase.from('user_backups').upsert(
      { user_id: userId, dreams, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    if (error) console.error('[SYNC] Dreams push fehlgeschlagen:', error.message);
  } catch (e) {
    console.error('[SYNC] Dreams push Fehler:', e);
  }
}

// ─── Push: Profile nach Supabase ─────���────────────────────────────────────────

export function pushProfileDebounced(profile: UserProfile): void {
  if (_profileTimer) clearTimeout(_profileTimer);
  _profileTimer = setTimeout(() => pushProfile(profile), DEBOUNCE_MS);
}

async function pushProfile(profile: UserProfile): Promise<void> {
  try {
    const userId = await ensureAuth();
    if (!userId) return;

    const { error } = await supabase.from('user_backups').upsert(
      { user_id: userId, profile, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    if (error) console.error('[SYNC] Profile push fehlgeschlagen:', error.message);
  } catch (e) {
    console.error('[SYNC] Profile push Fehler:', e);
  }
}

// ─── Pull: Daten von Supabase laden ───────────────────────────────────────────

export async function pullFromSupabase(): Promise<{ dreams: Dream[]; profile: UserProfile } | null> {
  try {
    const userId = await ensureAuth();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('user_backups')
      .select('dreams, profile, updated_at')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    return {
      dreams: (data.dreams as Dream[]) || [],
      profile: (data.profile as UserProfile) || ({} as UserProfile),
    };
  } catch (e) {
    console.error('[SYNC] Pull fehlgeschlagen:', e);
    return null;
  }
}
