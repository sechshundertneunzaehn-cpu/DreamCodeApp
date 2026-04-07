import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2026-02-25.clover' });
}

// Mapping: tier name -> env var with Stripe Price ID
// Region-spezifische Env-Vars: STRIPE_PRICE_{TIER}_{REGION}
// Fallback: STRIPE_PRICE_{TIER} (ohne Region)
const SUBSCRIPTION_TIERS = ['PRO', 'PREMIUM', 'VIP', 'SMART'] as const;
// Legacy-Tier-Mapping fuer In-Flight Sessions
const LEGACY_TIER_MAP: Record<string, string> = {
  SILVER: 'PRO',
  GOLD: 'PREMIUM',
  DELUXE: 'PREMIUM',
};

const COIN_PACKAGES: Record<string, { coins: number }> = {
  STARTER: { coins: 50 },
  POPULAR: { coins: 150 },
  VALUE: { coins: 400 },
  PREMIUM: { coins: 900 },
  MEGA: { coins: 2500 },
  ROYAL: { coins: 7000 },
  // Legacy
  MICRO: { coins: 50 },
  BESTSELLER: { coins: 550 },
  VORRAT: { coins: 1500 },
  MEGA_PLUS: { coins: 7000 },
};

// Subscription tier -> interval
const SUBSCRIPTION_INTERVAL: Record<string, string> = {
  PRO: 'month',
  PREMIUM: 'month',
  VIP: 'month',
  SMART: 'year',
};

function getStripePriceId(type: 'subscription' | 'coins', name: string, region?: string): string | undefined {
  const prefix = type === 'subscription' ? 'STRIPE_PRICE' : 'STRIPE_COIN_PRICE';
  // 1. Region-spezifisch: STRIPE_PRICE_PRO_SA oder STRIPE_COIN_PRICE_POPULAR_SA
  if (region) {
    const regionKey = `${prefix}_${name}_${region}`;
    if (process.env[regionKey]) return process.env[regionKey];
  }
  // 2. Fallback ohne Region: STRIPE_PRICE_PRO oder STRIPE_COIN_PRICE_POPULAR
  const baseKey = `${prefix}_${name}`;
  if (process.env[baseKey]) return process.env[baseKey];
  // 3. Legacy-Env-Vars (alte Namenskonvention)
  const legacyKey = `STRIPE_PRICE_${name}`;
  return process.env[legacyKey];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: 'Payments not configured yet' });
  }

  try {
    const { type, tier, package: coinPackage, region, successUrl, cancelUrl, affiliateCode } = req.body;

    if (!type || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required fields: type, successUrl, cancelUrl' });
    }

    let priceId: string | undefined;
    let mode: 'subscription' | 'payment';
    let metadata: Record<string, string> = {};

    if (type === 'subscription') {
      // Legacy-Tier-Mapping
      const resolvedTier = LEGACY_TIER_MAP[tier] || tier;

      if (!resolvedTier || !SUBSCRIPTION_TIERS.includes(resolvedTier as any)) {
        return res.status(400).json({ error: `Invalid subscription tier: ${tier}` });
      }

      priceId = getStripePriceId('subscription', resolvedTier, region);

      if (!priceId) {
        return res.status(500).json({ error: `Stripe Price ID not configured for tier: ${resolvedTier}${region ? ` (region: ${region})` : ''}` });
      }

      mode = 'subscription';
      metadata = {
        type: 'subscription',
        tier: resolvedTier,
        interval: SUBSCRIPTION_INTERVAL[resolvedTier] || 'month',
        ...(region && { region }),
      };
    } else if (type === 'coins') {
      if (!coinPackage || !COIN_PACKAGES[coinPackage]) {
        return res.status(400).json({ error: `Invalid coin package: ${coinPackage}` });
      }

      priceId = getStripePriceId('coins', coinPackage, region);

      if (!priceId) {
        return res.status(500).json({ error: `Stripe Price ID not configured for package: ${coinPackage}${region ? ` (region: ${region})` : ''}` });
      }

      mode = 'payment';
      metadata = {
        type: 'coins',
        package: coinPackage,
        coins: String(COIN_PACKAGES[coinPackage].coins),
        ...(region && { region }),
      };
    } else {
      return res.status(400).json({ error: 'Invalid type. Must be "subscription" or "coins".' });
    }

    // Affiliate tracking
    if (affiliateCode) {
      metadata.affiliate_code = affiliateCode;
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata,
    };

    // For subscriptions, allow promotion codes
    if (mode === 'subscription') {
      sessionParams.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('[create-checkout] Error:', error.message);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
