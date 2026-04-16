import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Anonymous Auth ───────────────────────────────────────────────────────────
// Stellt sicher, dass ein anonymer Supabase-User existiert.
// Session wird automatisch in localStorage persistiert.

let _authPromise: Promise<string | null> | null = null;

export function ensureAuth(): Promise<string | null> {
  if (_authPromise) return _authPromise;
  _authPromise = (async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) return session.user.id;
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error || !data.session) {
        console.error('[SUPABASE] Anonymous auth fehlgeschlagen:', error);
        _authPromise = null;
        return null;
      }
      return data.session.user.id;
    } catch (e) {
      console.error('[SUPABASE] Auth Fehler:', e);
      _authPromise = null;
      return null;
    }
  })();
  return _authPromise;
}
