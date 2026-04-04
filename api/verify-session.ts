import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2026-02-25.clover' });
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
    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid sessionId' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const metadata = session.metadata || {};

    const result: {
      status: string;
      paymentStatus: string;
      type: string | null;
      tier: string | null;
      coins: number | null;
      package: string | null;
      customerEmail: string | null;
    } = {
      status: session.status || 'unknown',
      paymentStatus: session.payment_status,
      type: metadata.type || null,
      tier: null,
      coins: null,
      package: null,
      customerEmail: session.customer_details?.email || null,
    };

    if (metadata.type === 'subscription') {
      result.tier = metadata.tier || null;
    } else if (metadata.type === 'coins') {
      result.coins = metadata.coins ? parseInt(metadata.coins, 10) : null;
      result.package = metadata.package || null;
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[verify-session] Error:', error.message);

    if (error.type === 'StripeInvalidRequestError') {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.status(500).json({ error: 'Failed to verify session' });
  }
}
