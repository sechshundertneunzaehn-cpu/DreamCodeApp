-- Dream Alerts
CREATE TABLE IF NOT EXISTS dream_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  traditions TEXT[] DEFAULT '{}',
  trigger_samedream BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  info_text TEXT,
  notify_push BOOLEAN DEFAULT true,
  notify_badge BOOLEAN DEFAULT true,
  notify_email BOOLEAN DEFAULT false,
  notify_digest BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  match_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert Matches
CREATE TABLE IF NOT EXISTS alert_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID REFERENCES dream_alerts(id) ON DELETE CASCADE,
  alert_owner_id UUID REFERENCES auth.users(id),
  matched_user_id UUID REFERENCES auth.users(id),
  dream_text TEXT,
  matched_keywords TEXT[] DEFAULT '{}',
  matched_tradition TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'seen', 'contacted')),
  matched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert Subscriptions (public alerts)
CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID REFERENCES dream_alerts(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alert_id, subscriber_id)
);

-- RLS
ALTER TABLE dream_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users see own alerts" ON dream_alerts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public alerts readable" ON dream_alerts
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users see own matches" ON alert_matches
  FOR SELECT USING (auth.uid() = alert_owner_id);

CREATE POLICY "Users manage own subscriptions" ON alert_subscriptions
  FOR ALL USING (auth.uid() = subscriber_id);

-- Tier-Check Function
CREATE OR REPLACE FUNCTION can_create_alert(user_tier TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_tier IN ('pro', 'premium', 'vip', 'smart');
END;
$$ LANGUAGE plpgsql;
