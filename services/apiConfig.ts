/**
 * API Base URL — zeigt auf Hetzner Backend Proxy in Production
 * In Development: leer (relative URLs gehen an Vite Dev Server / Vercel)
 *
 * Set VITE_API_BASE_URL=https://api.dream-code.app in production .env
 */
export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

/**
 * Baut eine vollstaendige API-URL aus einem Pfad.
 * Beispiel: apiUrl('/api/generate-text') → 'https://api.dream-code.app/api/generate-text'
 */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

// Lazy import to avoid circular deps
let _supabase: any = null;
async function getSupabase() {
  if (!_supabase) {
    const mod = await import('./supabaseClient');
    _supabase = mod.supabase;
  }
  return _supabase;
}

// Aktuelle UI-Sprache (gesetzt von der App)
let _currentLang = 'de';
export function setCurrentLanguage(lang: string): void {
  _currentLang = lang;
}
export function getCurrentLanguage(): string {
  return _currentLang;
}

/**
 * Zentraler API-Fetch mit Auth + Sprach-Header.
 * Sendet automatisch:
 *   - Authorization: Bearer <JWT>
 *   - x-user-lang: <aktuelle Sprache>
 *   - Content-Type: application/json
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('x-user-lang', _currentLang);

  try {
    const sb = await getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
  } catch (authErr) {
    console.warn('[apiFetch] Auth header skipped:', authErr);
  }

  return fetch(apiUrl(path), { ...init, headers });
}
