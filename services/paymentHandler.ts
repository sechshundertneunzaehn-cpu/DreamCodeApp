// Payment Handler
// Processes successful payments and updates user profile accordingly

import { SubscriptionTier, UserProfile } from '../types';
import { loadProfileSecurely, saveProfileSecurely } from './storage';
import { verifyPayment, getSessionIdFromUrl } from './stripeService';

// Maps Stripe/pricing tier names to the app's SubscriptionTier enum
const TIER_MAP: Record<string, SubscriptionTier> = {
  PRO: SubscriptionTier.PRO,
  PREMIUM: SubscriptionTier.PREMIUM,
  VIP: SubscriptionTier.VIP,
  SMART: SubscriptionTier.SMART,
  // Legacy-Mappings (30 Tage nach Deploy entfernen)
  SILVER: SubscriptionTier.PRO,
  GOLD: SubscriptionTier.PREMIUM,
  DELUXE: SubscriptionTier.PREMIUM,
};

export interface PaymentResult {
  success: boolean;
  type: 'subscription' | 'coins' | null;
  tier?: SubscriptionTier;
  coinsAdded?: number;
  error?: string;
}

/**
 * Handles payment success flow.
 * Verifies the session with Stripe and updates the user profile.
 *
 * @param sessionId - Optional. If not provided, reads from URL query params.
 * @returns PaymentResult with details about what was applied.
 */
export async function handlePaymentSuccess(sessionId?: string): Promise<PaymentResult> {
  const sid = sessionId || getSessionIdFromUrl();

  if (!sid) {
    return { success: false, type: null, error: 'No session ID found' };
  }

  try {
    const verification = await verifyPayment(sid);

    if (verification.paymentStatus !== 'paid') {
      return {
        success: false,
        type: null,
        error: `Payment not completed. Status: ${verification.paymentStatus}`,
      };
    }

    const profile = await loadProfileSecurely();

    if (!profile) {
      return {
        success: false,
        type: null,
        error: 'User profile not found. Please log in again.',
      };
    }

    if (verification.type === 'subscription' && verification.tier) {
      return await applySubscription(profile, verification.tier);
    }

    if (verification.type === 'coins' && verification.coins) {
      return await applyCoins(profile, verification.coins);
    }

    return { success: false, type: null, error: 'Unknown payment type' };
  } catch (error: any) {
    console.error('[paymentHandler] Error:', error.message);
    return { success: false, type: null, error: error.message };
  }
}

/**
 * Applies a subscription upgrade to the user profile.
 */
async function applySubscription(
  profile: UserProfile,
  tierName: string
): Promise<PaymentResult> {
  const newTier = TIER_MAP[tierName];

  if (!newTier) {
    return {
      success: false,
      type: 'subscription',
      error: `Unknown tier: ${tierName}`,
    };
  }

  const updatedProfile: UserProfile = {
    ...profile,
    subscriptionTier: newTier,
  };

  await saveProfileSecurely(updatedProfile);

  console.log(`[paymentHandler] Subscription upgraded to ${newTier}`);

  return {
    success: true,
    type: 'subscription',
    tier: newTier,
  };
}

/**
 * Adds purchased coins to the user profile.
 */
async function applyCoins(
  profile: UserProfile,
  coins: number
): Promise<PaymentResult> {
  const currentCoins = profile.coins ?? 0;

  const updatedProfile: UserProfile = {
    ...profile,
    coins: currentCoins + coins,
  };

  await saveProfileSecurely(updatedProfile);

  console.log(`[paymentHandler] Added ${coins} coins. Total: ${updatedProfile.coins}`);

  return {
    success: true,
    type: 'coins',
    coinsAdded: coins,
  };
}
