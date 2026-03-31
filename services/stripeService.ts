// Stripe Checkout Service
// Handles frontend interaction with Stripe via Vercel API routes

type CheckoutType = 'subscription' | 'coins';

interface CheckoutResponse {
  url: string;
  sessionId: string;
}

interface VerifyResponse {
  status: string;
  paymentStatus: string;
  type: string | null;
  tier: string | null;
  coins: number | null;
  package: string | null;
  customerEmail: string | null;
}

/**
 * Creates a Stripe Checkout session and redirects the user.
 *
 * @param type - 'subscription' or 'coins'
 * @param identifier - Tier name (SILVER, GOLD, etc.) or package name (MICRO, STARTER, etc.)
 */
export async function createCheckoutSession(
  type: CheckoutType,
  identifier: string
): Promise<void> {
  const baseUrl = window.location.origin;

  const body: Record<string, string> = {
    type,
    successUrl: `${baseUrl}/payment-success`,
    cancelUrl: `${baseUrl}/payment-cancel`,
  };

  if (type === 'subscription') {
    body.tier = identifier;
  } else {
    body.package = identifier;
  }

  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Checkout failed with status ${response.status}`);
  }

  const data: CheckoutResponse = await response.json();

  if (!data.url) {
    throw new Error('No checkout URL received from server');
  }

  // Redirect to Stripe Checkout
  window.location.href = data.url;
}

/**
 * Verifies a completed payment session.
 * Call this after the user returns from Stripe Checkout.
 *
 * @param sessionId - The Stripe session ID from the URL query params
 */
export async function verifyPayment(sessionId: string): Promise<VerifyResponse> {
  const response = await fetch('/api/verify-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Verification failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Extracts session_id from URL query parameters.
 * Use on the success page after Stripe redirect.
 */
export function getSessionIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('session_id');
}
