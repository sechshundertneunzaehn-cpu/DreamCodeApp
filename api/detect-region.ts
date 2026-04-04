import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel setzt automatisch x-vercel-ip-country Header
  const countryCode = (req.headers['x-vercel-ip-country'] as string) || '';

  res.setHeader('Cache-Control', 'public, max-age=86400'); // 24h
  return res.status(200).json({
    countryCode: countryCode.toUpperCase() || null,
  });
}
