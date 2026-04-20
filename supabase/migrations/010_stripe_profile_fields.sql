-- =============================================================
-- Migration 010: Stripe-Felder für Profile + Coin-RPC
-- =============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id    TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_start    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_end      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_failed        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_failed_at     TIMESTAMPTZ;

-- Schneller Lookup für Webhook-Events
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription
  ON profiles(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Atomares Coin-Increment (verhindert Race Conditions bei gleichzeitigen Webhook-Calls)
CREATE OR REPLACE FUNCTION increment_coins(target_user_id UUID, amount INTEGER)
RETURNS void AS $$
  UPDATE profiles
  SET coin_balance = coin_balance + amount,
      updated_at   = NOW()
  WHERE id = target_user_id;
$$ LANGUAGE SQL SECURITY DEFINER;
