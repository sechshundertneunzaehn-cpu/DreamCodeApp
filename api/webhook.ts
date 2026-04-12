import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Vercel: Raw Body für Stripe-Signatur-Verifizierung
export const config = {
  api: { bodyParser: false },
};

// ── Tier-Mapping ──────────────────────────────────────────────────────────────

// Stripe-Tier-Name (aus Checkout-Metadata) → DB-Subscription-Wert
const STRIPE_TIER_TO_DB: Record<string, string> = {
  PRO:     'silver',
  PREMIUM: 'gold',
  SMART:   'deluxe',
  VIP:     'vip',
};

// Coins die beim Abo-Abschluss gutgeschrieben werden (einmalig pro Abo)
const TIER_COINS: Record<string, number> = {
  silver: 500,
  gold:   1200,
  deluxe: 3000,
  vip:    10000,
};

// ── Clients ───────────────────────────────────────────────────────────────────

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── Raw Body Helper ───────────────────────────────────────────────────────────

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// ── Price-ID → DB-Tier Lookup ─────────────────────────────────────────────────

/**
 * Matcht eine Stripe-Price-ID gegen die konfigurierten Env-Vars.
 * Gibt den DB-Tier-Wert zurück oder 'bronze' als Fallback.
 */
function priceIdToDbTier(priceId: string): string {
  const tierEnvMap: Array<[string, string]> = [
    ['STRIPE_PRICE_VIP',     'vip'],
    ['STRIPE_PRICE_SMART',   'deluxe'],
    ['STRIPE_PRICE_PREMIUM', 'gold'],
    ['STRIPE_PRICE_PRO',     'silver'],
  ];

  for (const [envPrefix, dbTier] of tierEnvMap) {
    // Prüfe sowohl Basis-Env als auch region-spezifische Varianten (STRIPE_PRICE_PRO_SA etc.)
    for (const [key, val] of Object.entries(process.env)) {
      if (key.startsWith(envPrefix) && val === priceId) {
        return dbTier;
      }
    }
  }

  return 'bronze';
}

// ── Event Handler ─────────────────────────────────────────────────────────────

async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  if (!supabase) return;

  const metadata = session.metadata || {};
  const userId   = metadata.userId;

  if (!userId) {
    console.error('[webhook] checkout.session.completed: keine userId in Metadata, session:', session.id);
    return;
  }

  if (metadata.type === 'coins') {
    const coins = parseInt(metadata.coins || '0', 10);
    if (coins <= 0) return;

    const { error } = await supabase.rpc('increment_coins', {
      target_user_id: userId,
      amount: coins,
    });
    if (error) console.error('[webhook] Coin-Gutschrift fehlgeschlagen:', error.message);
    else console.log(`[webhook] +${coins} Coins für User ${userId}`);

  } else if (metadata.type === 'subscription') {
    const stripeTier = metadata.tier;
    const dbTier     = STRIPE_TIER_TO_DB[stripeTier];

    if (!dbTier) {
      console.error('[webhook] Unbekannter Tier in Metadata:', stripeTier);
      return;
    }

    // Idempotenz: Prüfen ob diese Subscription schon verarbeitet wurde
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : null;

    if (subscriptionId) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('stripe_subscription_id')
        .eq('id', userId)
        .single();

      if (existing?.stripe_subscription_id === subscriptionId) {
        console.log('[webhook] Subscription bereits verarbeitet, überspringe:', subscriptionId);
        return;
      }
    }

    // Subscription-Laufzeit aus Stripe abrufen
    let subscriptionEnd: string | null = null;
    if (subscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      } catch (e: any) {
        console.error('[webhook] Stripe-Subscription abrufen fehlgeschlagen:', e.message);
      }
    }

    const customerId = typeof session.customer === 'string'
      ? session.customer
      : (session.customer as Stripe.Customer | null)?.id ?? null;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription:           dbTier,
        subscription_start:     new Date().toISOString(),
        subscription_end:       subscriptionEnd,
        stripe_customer_id:     customerId,
        stripe_subscription_id: subscriptionId,
        payment_failed:         false,
        payment_failed_at:      null,
        updated_at:             new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[webhook] Profile-Update fehlgeschlagen:', updateError.message);
      return;
    }

    // Coins gutschreiben
    const coins = TIER_COINS[dbTier] || 0;
    if (coins > 0) {
      const { error: coinError } = await supabase.rpc('increment_coins', {
        target_user_id: userId,
        amount: coins,
      });
      if (coinError) console.error('[webhook] Abo-Coin-Gutschrift fehlgeschlagen:', coinError.message);
    }

    console.log(`[webhook] Abo aktiviert: User ${userId} → ${dbTier} bis ${subscriptionEnd}, +${coins} Coins`);
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  if (!supabase) return;

  const priceId  = subscription.items.data[0]?.price?.id;
  const newTier  = priceId ? priceIdToDbTier(priceId) : 'bronze';
  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  const isOverdue = subscription.status === 'past_due';

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription:       newTier,
      subscription_end:   periodEnd,
      payment_failed:     isOverdue,
      updated_at:         new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) console.error('[webhook] subscription.updated fehlgeschlagen:', error.message);
  else console.log(`[webhook] Abo aktualisiert: ${subscription.id} → ${newTier}, endet ${periodEnd}`);
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  if (!supabase) return;

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription:           'bronze',
      subscription_start:     null,
      subscription_end:       null,
      stripe_subscription_id: null,
      payment_failed:         false,
      payment_failed_at:      null,
      updated_at:             new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) console.error('[webhook] subscription.deleted fehlgeschlagen:', error.message);
  else console.log(`[webhook] Abo gekündigt: ${subscription.id} → bronze`);
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  if (!supabase) return;

  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : (invoice.customer as Stripe.Customer | null)?.id ?? null;

  if (!customerId) return;

  const { error } = await supabase
    .from('profiles')
    .update({
      payment_failed:    true,
      payment_failed_at: new Date().toISOString(),
      updated_at:        new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) console.error('[webhook] invoice.payment_failed fehlgeschlagen:', error.message);
  else console.log(`[webhook] Zahlung fehlgeschlagen für Customer: ${customerId}`);
}

// ── Main Handler ──────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe        = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return res.status(503).json({ error: 'Payments not configured' });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('[webhook] SUPABASE_SERVICE_ROLE_KEY oder SUPABASE_URL fehlt');
  }

  // Stripe-Signatur verifizieren
  let event: Stripe.Event;
  try {
    const rawBody  = await getRawBody(req);
    const signature = req.headers['stripe-signature'];
    if (!signature) return res.status(400).json({ error: 'Missing stripe-signature' });
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('[webhook] Signatur-Verifizierung fehlgeschlagen:', err.message);
    return res.status(400).json({ error: `Webhook signature failed: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(
          event.data.object as Stripe.Checkout.Session,
          stripe,
          supabase
        );
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
          supabase
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
          supabase
        );
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(
          event.data.object as Stripe.Invoice,
          supabase
        );
        break;

      default:
        // Unbekannte Events stillschweigend ignorieren
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[webhook] Verarbeitungsfehler:', error.message);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
