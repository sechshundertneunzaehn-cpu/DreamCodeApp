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
