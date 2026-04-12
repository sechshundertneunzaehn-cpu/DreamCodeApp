import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Tier-Hierarchie: je höher der Wert, desto höher der Tier
const TIER_RANK: Record<string, number> = {
  bronze: 0,
  silver:  1,
  gold:    2,
  deluxe:  3,
  vip:     4,
};

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function getSupabaseAnon() {
  const url  = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key  = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface AuthResult {
  userId: string;
}

export interface TierAuthResult extends AuthResult {
  tier: string;
}

/**
 * Prueft ob ein gueltiger JWT-Token vorhanden ist (ohne Tier-Check).
 * Gibt { userId } zurueck bei Erfolg, oder null (Response bereits gesetzt).
 */
export async function requireAuth(
  req: VercelRequest,
  res: VercelResponse
): Promise<AuthResult | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: missing Bearer token' });
    return null;
  }
  const token = authHeader.slice(7);

  const anonClient = getSupabaseAnon();
  if (!anonClient) {
    res.status(503).json({ error: 'Auth service not configured' });
    return null;
  }

  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !user) {
    res.status(401).json({ error: 'Unauthorized: invalid token' });
    return null;
  }

  return { userId: user.id };
}

/**
 * Prüft ob der Request-User mindestens den angegebenen Tier hat.
 * Liest den Tier aus der DB (profiles.subscription) — NICHT aus localStorage.
 *
 * Gibt { userId, tier } zurück bei Erfolg, oder null (Response bereits gesetzt).
 */
export async function requireTier(
  req: VercelRequest,
  res: VercelResponse,
  minTier: string
): Promise<TierAuthResult | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: missing Bearer token' });
    return null;
  }
  const token = authHeader.slice(7);

  const anonClient = getSupabaseAnon();
  if (!anonClient) {
    res.status(503).json({ error: 'Auth service not configured' });
    return null;
  }

  // JWT validieren → User-ID ermitteln
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !user) {
    res.status(401).json({ error: 'Unauthorized: invalid token' });
    return null;
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    res.status(503).json({ error: 'Database service not configured' });
    return null;
  }

  // Tier aus DB laden — Service Role umgeht RLS
  const { data: profile, error: dbError } = await admin
    .from('profiles')
    .select('subscription, payment_failed')
    .eq('id', user.id)
    .single();

  if (dbError || !profile) {
    res.status(403).json({ error: 'Profile not found' });
    return null;
  }

  if (profile.payment_failed) {
    res.status(402).json({ error: 'Payment failed — bitte Zahlungsmethode aktualisieren' });
    return null;
  }

  const userRank = TIER_RANK[profile.subscription] ?? 0;
  const minRank  = TIER_RANK[minTier] ?? 999;

  if (userRank < minRank) {
    res.status(403).json({
      error:       `Diese Funktion erfordert ${minTier}-Abo oder höher`,
      currentTier: profile.subscription,
      requiredTier: minTier,
    });
    return null;
  }

  return { userId: user.id, tier: profile.subscription };
}
