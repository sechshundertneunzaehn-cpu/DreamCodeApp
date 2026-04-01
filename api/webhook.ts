import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

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

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
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
          // Coin crediting happens client-side via verify-session after redirect.
          // For server-side processing (e.g., database), extend here.
        } else if (metadata.type === 'subscription') {
          console.log(
            `[webhook] Subscription started. Tier: ${metadata.tier}, Interval: ${metadata.interval}, Session: ${session.id}`
          );
          // Subscription activation happens client-side via verify-session.
          // For server-side processing (e.g., database), extend here.
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
