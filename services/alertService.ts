import { supabase } from './supabaseClient';

export interface DreamAlert {
  id: string;
  user_id: string;
  name: string;
  keywords: string[];
  traditions: string[];
  trigger_samedream: boolean;
  visibility: 'private' | 'public';
  info_text: string | null;
  notify_push: boolean;
  notify_badge: boolean;
  notify_email: boolean;
  notify_digest: boolean;
  active: boolean;
  match_count: number;
  created_at: string;
}

export interface AlertMatch {
  id: string;
  alert_id: string;
  alert_owner_id: string;
  matched_user_id: string;
  dream_text: string;
  matched_keywords: string[];
  matched_tradition: string | null;
  status: 'new' | 'seen' | 'contacted';
  matched_at: string;
}

// Fetch user's alerts
export async function getUserAlerts(userId: string): Promise<DreamAlert[]> {
  const { data, error } = await supabase
    .from('dream_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Fetch public alerts
export async function getPublicAlerts(): Promise<DreamAlert[]> {
  const { data, error } = await supabase
    .from('dream_alerts')
    .select('*')
    .eq('visibility', 'public')
    .eq('active', true)
    .order('match_count', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

// Create alert
export async function createAlert(alert: Partial<DreamAlert>): Promise<DreamAlert> {
  const { data, error } = await supabase
    .from('dream_alerts')
    .insert(alert)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Toggle alert active state
export async function toggleAlert(alertId: string, active: boolean): Promise<void> {
  const { error } = await supabase
    .from('dream_alerts')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', alertId);
  if (error) throw error;
}

// Delete alert
export async function deleteAlert(alertId: string): Promise<void> {
  const { error } = await supabase
    .from('dream_alerts')
    .delete()
    .eq('id', alertId);
  if (error) throw error;
}

// Get matches for an alert
export async function getAlertMatches(alertId: string): Promise<AlertMatch[]> {
  const { data, error } = await supabase
    .from('alert_matches')
    .select('*')
    .eq('alert_id', alertId)
    .order('matched_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Get unread match count for user
export async function getUnreadMatchCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('alert_matches')
    .select('*', { count: 'exact', head: true })
    .eq('alert_owner_id', userId)
    .eq('status', 'new');
  if (error) return 0;
  return count || 0;
}

// Check dream text against all active alerts (called after saving a dream)
export async function checkAlertMatches(
  dreamText: string,
  dreamUserId: string,
  tradition?: string
): Promise<number> {
  let matchCount = 0;
  const textLower = dreamText.toLowerCase();

  // Fetch all active alerts (own + public from others)
  const { data: alerts } = await supabase
    .from('dream_alerts')
    .select('*')
    .eq('active', true)
    .neq('user_id', dreamUserId);

  if (!alerts || alerts.length === 0) return 0;

  for (const alert of alerts) {
    const matchedKeywords: string[] = [];
    let matched = false;

    // Keyword matching
    if (alert.keywords && alert.keywords.length > 0) {
      for (const kw of alert.keywords) {
        if (textLower.includes(kw.toLowerCase())) {
          matchedKeywords.push(kw);
          matched = true;
        }
      }
    }

    // Tradition matching
    let matchedTradition: string | null = null;
    if (tradition && alert.traditions && alert.traditions.length > 0) {
      if (alert.traditions.includes(tradition)) {
        matchedTradition = tradition;
        matched = true;
      }
    }

    if (matched) {
      // Create match entry
      await supabase.from('alert_matches').insert({
        alert_id: alert.id,
        alert_owner_id: alert.user_id,
        matched_user_id: dreamUserId,
        dream_text: dreamText.substring(0, 500),
        matched_keywords: matchedKeywords,
        matched_tradition: matchedTradition,
      });

      // Increment match count
      await supabase
        .from('dream_alerts')
        .update({ match_count: (alert.match_count || 0) + 1 })
        .eq('id', alert.id);

      matchCount++;
    }
  }

  return matchCount;
}

// Subscribe to public alert
export async function subscribeToAlert(alertId: string, userId: string): Promise<void> {
  await supabase.from('alert_subscriptions').upsert({
    alert_id: alertId,
    subscriber_id: userId,
  });
}

// Unsubscribe
export async function unsubscribeFromAlert(alertId: string, userId: string): Promise<void> {
  await supabase
    .from('alert_subscriptions')
    .delete()
    .eq('alert_id', alertId)
    .eq('subscriber_id', userId);
}
