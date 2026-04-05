// Coin Economy Service
// Manages coins, save counts, and share counts

import { Language, UserProfile } from '../types';

const COINS_PER_MILESTONE = 1;
const MILESTONE_COUNT = 99;

const coinMessages: Record<Language, { earned: (n: number) => string; earned_share: (n: number) => string }> = {
    [Language.DE]: { earned: (n) => `${n} Münze${n > 1 ? 'n' : ''} verdient!`, earned_share: (n) => `${n} Münze${n > 1 ? 'n' : ''} durch Teilen verdient!` },
    [Language.EN]: { earned: (n) => `${n} coin${n > 1 ? 's' : ''} earned!`, earned_share: (n) => `${n} coin${n > 1 ? 's' : ''} earned by sharing!` },
    [Language.TR]: { earned: (n) => `${n} jeton kazanıldı!`, earned_share: (n) => `Paylaşarak ${n} jeton kazanıldı!` },
    [Language.ES]: { earned: (n) => `¡${n} moneda${n > 1 ? 's' : ''} ganada${n > 1 ? 's' : ''}!`, earned_share: (n) => `¡${n} moneda${n > 1 ? 's' : ''} ganada${n > 1 ? 's' : ''} al compartir!` },
    [Language.FR]: { earned: (n) => `${n} pièce${n > 1 ? 's' : ''} gagnée${n > 1 ? 's' : ''} !`, earned_share: (n) => `${n} pièce${n > 1 ? 's' : ''} gagnée${n > 1 ? 's' : ''} en partageant !` },
    [Language.AR]: { earned: (n) => `تم كسب ${n} عملة!`, earned_share: (n) => `تم كسب ${n} عملة من المشاركة!` },
    [Language.PT]: { earned: (n) => `${n} moeda${n > 1 ? 's' : ''} ganha${n > 1 ? 's' : ''}!`, earned_share: (n) => `${n} moeda${n > 1 ? 's' : ''} ganha${n > 1 ? 's' : ''} ao compartilhar!` },
    [Language.RU]: { earned: (n) => `${n} монет${n > 1 ? 'ы' : 'а'} заработано!`, earned_share: (n) => `${n} монет${n > 1 ? 'ы' : 'а'} заработано за пересылку!` },
    [Language.ZH]: { earned: (n) => `获得了${n}枚硬币！`, earned_share: (n) => `通过分享获得了${n}枚硬币！` },
    [Language.HI]: { earned: (n) => `${n} सिक्क${n > 1 ? 'े' : 'ा'} कमाया!`, earned_share: (n) => `शेयर करके ${n} सिक्क${n > 1 ? 'े' : 'ा'} कमाया!` },
    [Language.JA]: { earned: (n) => `${n}コインを獲得！`, earned_share: (n) => `共有で${n}コインを獲得！` },
    [Language.KO]: { earned: (n) => `${n}코인 획득!`, earned_share: (n) => `공유로 ${n}코인 획득!` },
    [Language.ID]: { earned: (n) => `${n} koin diperoleh!`, earned_share: (n) => `${n} koin diperoleh dari berbagi!` },
    [Language.FA]: { earned: (n) => `${n} سکه کسب شد!`, earned_share: (n) => `${n} سکه از اشتراک‌گذاری کسب شد!` },
    [Language.IT]: { earned: (n) => `${n} moneta${n > 1 ? 'e' : ''} guadagnata${n > 1 ? 'e' : ''}!`, earned_share: (n) => `${n} moneta${n > 1 ? 'e' : ''} guadagnata${n > 1 ? 'e' : ''} condividendo!` },
    [Language.PL]: { earned: (n) => `Zdobyto ${n} monet${n > 1 ? 'y' : 'ę'}!`, earned_share: (n) => `Zdobyto ${n} monet${n > 1 ? 'y' : 'ę'} za udostępnienie!` },
    [Language.BN]: { earned: (n) => `${n}টি মুদ্রা অর্জিত!`, earned_share: (n) => `শেয়ার করে ${n}টি মুদ্রা অর্জিত!` },
    [Language.UR]: { earned: (n) => `${n} سکہ کمایا!`, earned_share: (n) => `شیئر کرکے ${n} سکہ کمایا!` },
    [Language.VI]: { earned: (n) => `Đã nhận ${n} xu!`, earned_share: (n) => `Đã nhận ${n} xu từ chia sẻ!` },
    [Language.TH]: { earned: (n) => `ได้รับ ${n} เหรียญ!`, earned_share: (n) => `ได้รับ ${n} เหรียญจากการแชร์!` },
    [Language.SW]: { earned: (n) => `Sarafu ${n} zimepatikana!`, earned_share: (n) => `Sarafu ${n} zimepatikana kwa kushiriki!` },
    [Language.HU]: { earned: (n) => `${n} érme szerzve!`, earned_share: (n) => `${n} érme szerzve megosztásból!` },
};

export interface CoinUpdate {
    coins: number;
    saveCount: number;
    shareCount: number;
    earnedCoins?: number;
    message?: string;
}

// Initialize coin system in profile
export function initializeCoinSystem(profile: UserProfile): UserProfile {
    return {
        ...profile,
        coins: profile.coins ?? 0,
        saveCount: profile.saveCount ?? 0,
        shareCount: profile.shareCount ?? 0,
    };
}

// Process dream save and award coins if milestone reached
export function processDreamSave(profile: UserProfile, language: Language = Language.DE): CoinUpdate {
    const currentSaveCount = (profile.saveCount ?? 0) + 1;
    const currentCoins = profile.coins ?? 0;

    // Check if milestone reached
    if (currentSaveCount >= MILESTONE_COUNT) {
        const earnedCoins = Math.floor(currentSaveCount / MILESTONE_COUNT);
        const remainingSaves = currentSaveCount % MILESTONE_COUNT;

        return {
            coins: currentCoins + earnedCoins,
            saveCount: remainingSaves,
            shareCount: profile.shareCount ?? 0,
            earnedCoins,
            message: coinMessages[language].earned(earnedCoins)
        };
    }

    return {
        coins: currentCoins,
        saveCount: currentSaveCount,
        shareCount: profile.shareCount ?? 0,
    };
}

// Process dream share and award coins if milestone reached
export function processDreamShare(profile: UserProfile, language: Language = Language.DE): CoinUpdate {
    const currentShareCount = (profile.shareCount ?? 0) + 1;
    const currentCoins = profile.coins ?? 0;

    // Check if milestone reached
    if (currentShareCount >= MILESTONE_COUNT) {
        const earnedCoins = Math.floor(currentShareCount / MILESTONE_COUNT);
        const remainingShares = currentShareCount % MILESTONE_COUNT;

        return {
            coins: currentCoins + earnedCoins,
            saveCount: profile.saveCount ?? 0,
            shareCount: remainingShares,
            earnedCoins,
            message: coinMessages[language].earned_share(earnedCoins)
        };
    }

    return {
        coins: currentCoins,
        saveCount: profile.saveCount ?? 0,
        shareCount: currentShareCount,
    };
}

// Check if user has enough coins for a purchase
export function hasEnoughCoins(profile: UserProfile, cost: number): boolean {
    const currentCoins = profile.coins ?? 0;
    return currentCoins >= cost;
}

// Spend coins
export function spendCoins(profile: UserProfile, cost: number): CoinUpdate | null {
    const currentCoins = profile.coins ?? 0;

    if (currentCoins < cost) {
        return null; // Not enough coins
    }

    return {
        coins: currentCoins - cost,
        saveCount: profile.saveCount ?? 0,
        shareCount: profile.shareCount ?? 0,
    };
}

// Get progress to next coin
export function getProgressToNextCoin(profile: UserProfile): {
    savesProgress: number;
    savesRemaining: number;
    sharesProgress: number;
    sharesRemaining: number;
} {
    const saveCount = profile.saveCount ?? 0;
    const shareCount = profile.shareCount ?? 0;

    return {
        savesProgress: (saveCount / MILESTONE_COUNT) * 100,
        savesRemaining: MILESTONE_COUNT - saveCount,
        sharesProgress: (shareCount / MILESTONE_COUNT) * 100,
        sharesRemaining: MILESTONE_COUNT - shareCount,
    };
}
