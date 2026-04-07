import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'Missing code' });

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown';
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
  const ua = req.headers['user-agent'] || '';
  const device = /mobile/i.test(ua) ? 'mobile' : 'desktop';
  const country = (req.headers['x-vercel-ip-country'] as string) || 'unknown';

  try {
    // Track click
    await supabase.from('affiliate_clicks').insert({
      code, ip_hash: ipHash, country, device,
    });

    // Increment total_clicks
    await supabase.rpc('increment_affiliate_clicks', { p_code: code }).catch(() => {
      // Fallback: manual update
      supabase.from('affiliate_codes')
        .update({ total_clicks: supabase.rpc('') as any })
        .eq('code', code);
    });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
