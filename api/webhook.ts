import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2026-02-25.clover' });
}

// Vercel serverless functions need raw body for signature verification.
// Vercel provides req.body as parsed JSON by default, but we need the raw buffer.
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return res.status(503).json({ error: 'Payments not configured yet' });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};

        if (metadata.type === 'coins') {
          console.log(
            `[webhook] Coin purchase completed. Package: ${metadata.package}, Coins: ${metadata.coins}, Session: ${session.id}`
          );
        } else if (metadata.type === 'subscription') {
          console.log(
            `[webhook] Subscription started. Tier: ${metadata.tier}, Interval: ${metadata.interval}, Session: ${session.id}`
          );
        }

        // Affiliate commission tracking
        if (metadata.affiliate_code) {
          await processAffiliateConversion(session, metadata);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(
          `[webhook] Subscription updated. ID: ${subscription.id}, Status: ${subscription.status}`
        );
        // Handle plan changes, payment failures, etc.
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(
          `[webhook] Subscription cancelled. ID: ${subscription.id}`
        );
        // TODO: Implementiere Downgrade-Logic wenn Backend existiert
        // Aktuell nur client-side localStorage — kein Server-State zum Downgraden
        break;
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[webhook] Processing error:', error.message);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function processAffiliateConversion(session: Stripe.Checkout.Session, metadata: Record<string, string>) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !supabaseKey) return;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const code = metadata.affiliate_code;

  try {
    // Get affiliate code details
    const { data: affiliate } = await supabase
      .from('affiliate_codes')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .single();

    if (!affiliate) return;

    const amountEur = (session.amount_total || 0) / 100;
    const commissionPct = affiliate.commission_pct / 100;
    const commissionEur = Math.round(amountEur * commissionPct * 100) / 100;

    // Create conversion record
    await supabase.from('affiliate_conversions').insert({
      code,
      user_id: session.client_reference_id || null,
      tier: metadata.tier || metadata.package || 'unknown',
      amount_eur: amountEur,
      commission_eur: commissionEur,
      stripe_payment_id: session.payment_intent as string || session.id,
    });

    // Update affiliate totals
    await supabase
      .from('affiliate_codes')
      .update({
        total_conversions: (affiliate.total_conversions || 0) + 1,
        total_earned_eur: (affiliate.total_earned_eur || 0) + commissionEur,
        // Tier upgrade check
        tier: getTierForConversions((affiliate.total_conversions || 0) + 1),
      })
      .eq('id', affiliate.id);

    console.log(`[webhook] Affiliate conversion: ${code} -> ${commissionEur}EUR`);
  } catch (err: any) {
    console.error('[webhook] Affiliate processing error:', err.message);
  }
}

function getTierForConversions(count: number): string {
  if (count >= 100) return 'platinum';
  if (count >= 50) return 'gold';
  if (count >= 20) return 'silver';
  return 'standard';
}
