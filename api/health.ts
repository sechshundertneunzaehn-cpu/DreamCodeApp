import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from './_lib/rateLimit';

/**
 * Vercel Serverless Function: Health Check
 * GET /api/health → JSON with status, timestamp, Supabase ping, Stripe ping.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const timestamp = new Date().toISOString();
  const checks: Record<string, { ok: boolean; latencyMs: number; error?: string }> = {};

  // Supabase ping — lightweight query against profiles table
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const start = Date.now();
    try {
      const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
      const { error } = await sb.from('profiles').select('id').limit(1);
      checks.supabase = {
        ok: !error,
        latencyMs: Date.now() - start,
        ...(error && { error: error.message }),
      };
    } catch (e: any) {
      checks.supabase = { ok: false, latencyMs: Date.now() - start, error: e.message };
    }
  } else {
    checks.supabase = { ok: false, latencyMs: 0, error: 'Not configured' };
  }

  // Stripe ping — balance endpoint (minimal, read-only)
  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').trim();

  if (stripeKey) {
    const start = Date.now();
    try {
      const r = await fetch('https://api.stripe.com/v1/balance', {
        headers: { Authorization: `Bearer ${stripeKey}` },
      });
      checks.stripe = {
        ok: r.ok,
        latencyMs: Date.now() - start,
        ...(!r.ok && { error: `HTTP ${r.status}` }),
      };
    } catch (e: any) {
      checks.stripe = { ok: false, latencyMs: Date.now() - start, error: e.message };
    }
  } else {
    checks.stripe = { ok: false, latencyMs: 0, error: 'Not configured' };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return res.status(allOk ? 200 : 503).json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp,
    checks,
  });
}
