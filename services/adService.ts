// AdMob Service - Rewarded Ads, Banner, Interstitial
// Capacitor-only features mit Web-Fallback

import { REWARDS } from '../config/pricing';

// Test Ad Unit IDs (Google AdMob Test)
export const AD_UNITS = {
  REWARDED_VIDEO: 'ca-app-pub-3940256099942544/5224354917',
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
};

// Check if running in Capacitor (native)
function isNative(): boolean {
  return typeof (window as any).Capacitor !== 'undefined';
}

// Track ads watched today
function getAdsWatchedToday(): number {
  const key = `ads_watched_${new Date().toISOString().split('T')[0]}`;
  return parseInt(localStorage.getItem(key) || '0', 10);
}

function incrementAdsWatched(): void {
  const key = `ads_watched_${new Date().toISOString().split('T')[0]}`;
  const current = getAdsWatchedToday();
  localStorage.setItem(key, String(current + 1));
}

// Track interstitial counter
function getInterpretationsSinceLastAd(): number {
  return parseInt(localStorage.getItem('interpretations_since_ad') || '0', 10);
}

function resetInterpretationCounter(): void {
  localStorage.setItem('interpretations_since_ad', '0');
}

export function incrementInterpretationCounter(): void {
  const current = getInterpretationsSinceLastAd();
  localStorage.setItem('interpretations_since_ad', String(current + 1));
}

// Eligibility checks
export function isEligibleForAds(userTier: string): boolean {
  return userTier === 'free' || userTier === 'FREE';
}

export function canWatchMoreAds(userTier: string): boolean {
  const max = isEligibleForAds(userTier) ? REWARDS.MAX_ADS_DAILY : 10;
  return getAdsWatchedToday() < max;
}

export function shouldShowInterstitial(userTier: string): boolean {
  if (!isEligibleForAds(userTier)) return false;
  return getInterpretationsSinceLastAd() >= 3;
}

// Show Rewarded Ad
export async function showRewardedAd(): Promise<{ rewarded: boolean; coins: number }> {
  if (!isNative()) {
    // Web fallback - no real ad, just show explanation
    return { rewarded: false, coins: 0 };
  }

  try {
    const { AdMob, RewardAdOptions } = await import('@capacitor-community/admob');

    await AdMob.initialize({ initializeForTesting: true });

    const options: typeof RewardAdOptions = {
      adId: AD_UNITS.REWARDED_VIDEO,
    } as any;

    await AdMob.prepareRewardVideoAd(options);
    const result = await AdMob.showRewardVideoAd();

    if (result) {
      incrementAdsWatched();
      return { rewarded: true, coins: REWARDS.AD_30S };
    }
    return { rewarded: false, coins: 0 };
  } catch {
    return { rewarded: false, coins: 0 };
  }
}

// Show Banner Ad (Free users only)
export async function showBannerAd(): Promise<void> {
  if (!isNative()) return;

  try {
    const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');

    await AdMob.initialize({ initializeForTesting: true });

    await AdMob.showBanner({
      adId: AD_UNITS.BANNER,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      isTesting: true,
    });
  } catch {
    // Silent fail on web
  }
}

// Hide Banner
export async function hideBannerAd(): Promise<void> {
  if (!isNative()) return;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.hideBanner();
  } catch { /* silent */ }
}

// Show Interstitial (after every 3rd interpretation for free users)
export async function showInterstitialAd(): Promise<void> {
  if (!isNative()) return;

  try {
    const { AdMob } = await import('@capacitor-community/admob');

    await AdMob.initialize({ initializeForTesting: true });

    await AdMob.prepareInterstitial({ adId: AD_UNITS.INTERSTITIAL });
    await AdMob.showInterstitial();
    resetInterpretationCounter();
  } catch { /* silent */ }
}

// Web Fallback Component data
export function getWebAdFallbackMessage(language: string): { title: string; body: string } {
  const messages: Record<string, { title: string; body: string }> = {
    de: {
      title: 'Gratis-Coins im App',
      body: 'Lade die DreamCode App herunter und verdiene Coins durch kurze Werbevideos.',
    },
    en: {
      title: 'Free Coins in App',
      body: 'Download the DreamCode app and earn coins by watching short ad videos.',
    },
    tr: {
      title: 'Uygulamada Ucretsiz Coin',
      body: 'DreamCode uygulamasini indirin ve kisa reklam videolari izleyerek coin kazanin.',
    },
    ar: {
      title: '\u0639\u0645\u0644\u0627\u062A \u0645\u062C\u0627\u0646\u064A\u0629 \u0641\u064A \u0627\u0644\u062A\u0637\u0628\u064A\u0642',
      body: '\u062D\u0645\u0644 \u062A\u0637\u0628\u064A\u0642 DreamCode \u0648\u0627\u0643\u0633\u0628 \u0639\u0645\u0644\u0627\u062A \u0645\u0646 \u0645\u0634\u0627\u0647\u062F\u0629 \u0641\u064A\u062F\u064A\u0648\u0647\u0627\u062A \u0625\u0639\u0644\u0627\u0646\u064A\u0629 \u0642\u0635\u064A\u0631\u0629.',
    },
    ru: {
      title: '\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u044B\u0435 \u043C\u043E\u043D\u0435\u0442\u044B \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438',
      body: '\u0421\u043A\u0430\u0447\u0430\u0439\u0442\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 DreamCode \u0438 \u0437\u0430\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u0439\u0442\u0435 \u043C\u043E\u043D\u0435\u0442\u044B.',
    },
  };
  return messages[language] || messages.en;
}
