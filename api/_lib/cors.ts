import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * CORS-Whitelist fuer DreamCode API.
 * Erlaubt nur die eigenen Domains + localhost fuer Entwicklung.
 */
const ALLOWED_ORIGINS = [
  'https://dream-code.app',
  'https://dreamcodeapp.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

export function setCors(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-lang');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
}

/**
 * Handles OPTIONS preflight + sets CORS headers.
 * Returns true if request was a preflight (caller should return early).
 */
export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
