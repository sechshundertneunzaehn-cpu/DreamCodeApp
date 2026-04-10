/**
 * API Base URL — zeigt auf Hetzner Backend Proxy in Production
 * In Development: leer (relative URLs gehen an Vite Dev Server / Vercel)
 *
 * Set VITE_API_BASE_URL=https://api.dream-code.app in production .env
 */
export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

/**
 * Baut eine vollständige API-URL aus einem Pfad.
 * Beispiel: apiUrl('/api/generate-text') → 'https://api.dream-code.app/api/generate-text'
 */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
