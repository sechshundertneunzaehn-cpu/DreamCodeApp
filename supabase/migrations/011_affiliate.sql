-- Affiliate Codes
CREATE TABLE IF NOT EXISTS affiliate_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  influencer_name TEXT NOT NULL,
  influencer_email TEXT,
  commission_pct DECIMAL DEFAULT 20.0,
  region TEXT DEFAULT 'ALL',
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard', 'silver', 'gold', 'platinum')),
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_earned_eur DECIMAL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate Conversions
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT REFERENCES affiliate_codes(code),
  user_id UUID REFERENCES auth.users(id),
  tier TEXT NOT NULL,
  amount_eur DECIMAL NOT NULL,
  commission_eur DECIMAL NOT NULL,
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  converted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate Clicks
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT,
  ip_hash TEXT,
  country TEXT,
  device TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE affiliate_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Public read for affiliate codes (needed for validation)
CREATE POLICY "Anyone can validate codes" ON affiliate_codes
  FOR SELECT USING (active = true);

-- Only system can write conversions (via service role)
CREATE POLICY "Service role manages conversions" ON affiliate_conversions
  FOR ALL USING (true);
