import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

// Mapping: tier/package name -> env var with Stripe Price ID
const SUBSCRIPTION_PRICE_MAP: Record<string, string> = {
  SILVER: 'STRIPE_PRICE_SILVER',
  GOLD: 'STRIPE_PRICE_GOLD',
  DELUXE: 'STRIPE_PRICE_DELUXE',
  VIP: 'STRIPE_PRICE_VIP',
  SMART: 'STRIPE_PRICE_SMART',
};

const COIN_PRICE_MAP: Record<string, { envKey: string; coins: number }> = {
  MICRO: { envKey: 'STRIPE_PRICE_MICRO', coins: 50 },
  STARTER: { envKey: 'STRIPE_PRICE_STARTER', coins: 100 },
  BESTSELLER: { envKey: 'STRIPE_PRICE_BESTSELLER', coins: 550 },
  VORRAT: { envKey: 'STRIPE_PRICE_VORRAT', coins: 1500 },
  MEGA: { envKey: 'STRIPE_PRICE_MEGA', coins: 3500 },
  MEGA_PLUS: { envKey: 'STRIPE_PRICE_MEGA_PLUS', coins: 7000 },
};

// Subscription tier -> interval mapping
const SUBSCRIPTION_INTERVAL: Record<string, string> = {
  SILVER: 'month',
  GOLD: 'month',
  DELUXE: 'month',
  VIP: 'month',
  SMART: 'year',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, tier, package: coinPackage, successUrl, cancelUrl } = req.body;

    if (!type || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required fields: type, successUrl, cancelUrl' });
    }

    let priceId: string | undefined;
    let mode: 'subscription' | 'payment';
    let metadata: Record<string, string> = {};

    if (type === 'subscription') {
      if (!tier || !SUBSCRIPTION_PRICE_MAP[tier]) {
        return res.status(400).json({ error: `Invalid subscription tier: ${tier}` });
      }

      const envKey = SUBSCRIPTION_PRICE_MAP[tier];
      priceId = process.env[envKey];

      if (!priceId) {
        return res.status(500).json({ error: `Stripe Price ID not configured for tier: ${tier}` });
      }

      mode = 'subscription';
      metadata = {
        type: 'subscription',
        tier,
        interval: SUBSCRIPTION_INTERVAL[tier] || 'month',
      };
    } else if (type === 'coins') {
      if (!coinPackage || !COIN_PRICE_MAP[coinPackage]) {
        return res.status(400).json({ error: `Invalid coin package: ${coinPackage}` });
      }

      const packageInfo = COIN_PRICE_MAP[coinPackage];
      priceId = process.env[packageInfo.envKey];

      if (!priceId) {
        return res.status(500).json({ error: `Stripe Price ID not configured for package: ${coinPackage}` });
      }

      mode = 'payment';
      metadata = {
        type: 'coins',
        package: coinPackage,
        coins: String(packageInfo.coins),
      };
    } else {
      return res.status(400).json({ error: 'Invalid type. Must be "subscription" or "coins".' });
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
