import { ReligiousCategory, ReligiousSource, SubscriptionTier } from '../types';

// --- Category → Source Mapping ---
export const CATEGORY_SOURCE_MAP: Record<ReligiousCategory, ReligiousSource[]> = {
    [ReligiousCategory.ISLAMIC]: [
        ReligiousSource.IBN_SIRIN, ReligiousSource.NABULSI, ReligiousSource.AL_ISKHAFI,
        ReligiousSource.IMAM_SADIQ, ReligiousSource.ISLAMSKI_SONNIK,
    ],
    [ReligiousCategory.CHRISTIAN]: [
        ReligiousSource.MEDIEVAL, ReligiousSource.MODERN_THEOLOGY, ReligiousSource.CHURCH_FATHERS,
    ],
    [ReligiousCategory.BUDDHIST]: [
        ReligiousSource.ZEN, ReligiousSource.TIBETAN, ReligiousSource.THERAVADA,
        ReligiousSource.ZHOU_GONG, ReligiousSource.HATSUYUME, ReligiousSource.SWAPNA_SHASTRA,
    ],
    [ReligiousCategory.PSYCHOLOGICAL]: [
        ReligiousSource.FREUDIAN, ReligiousSource.JUNGIAN, ReligiousSource.GESTALT,
        ReligiousSource.EDGAR_CAYCE, ReligiousSource.RUDOLF_STEINER,
    ],
    [ReligiousCategory.ASTROLOGY]: [
        ReligiousSource.WESTERN_ZODIAC, ReligiousSource.VEDIC_ASTROLOGY, ReligiousSource.CHINESE_ZODIAC,
    ],
    [ReligiousCategory.NUMEROLOGY]: [
        ReligiousSource.PYTHAGOREAN, ReligiousSource.CHALDEAN,
        ReligiousSource.KABBALAH_NUMEROLOGY, ReligiousSource.VEDIC_NUMEROLOGY, ReligiousSource.ISLAMIC_NUMEROLOGY,
    ],
    [ReligiousCategory.JEWISH]: [
        ReligiousSource.TALMUD_BERAKHOT, ReligiousSource.KABBALAH_NUMEROLOGY, ReligiousSource.ZOHAR,
    ],
    [ReligiousCategory.SONNIKS]: [
        ReligiousSource.VANGA, ReligiousSource.MILLER_RU, ReligiousSource.FREUD_RU,
        ReligiousSource.LOFF, ReligiousSource.NOSTRADAMUS_RU,
    ],
    [ReligiousCategory.ANCIENT]: [
        ReligiousSource.ARTEMIDOROS, ReligiousSource.EGYPTIAN_PAPYRUS, ReligiousSource.SOMNIALE_DANIELIS,
    ],
};

// --- Category Icons ---
export const CATEGORY_ICONS: Record<ReligiousCategory, string> = {
    [ReligiousCategory.ISLAMIC]: '☪️',
    [ReligiousCategory.CHRISTIAN]: '✝️',
    [ReligiousCategory.BUDDHIST]: '☸️',
    [ReligiousCategory.PSYCHOLOGICAL]: '🧠',
    [ReligiousCategory.ASTROLOGY]: '🪐',
    [ReligiousCategory.NUMEROLOGY]: '🔢',
    [ReligiousCategory.JEWISH]: '🕎',
    [ReligiousCategory.SONNIKS]: '📖',
    [ReligiousCategory.ANCIENT]: '🏛️',
};

// --- Category Display Order (for button grid) ---
export const CATEGORY_ORDER: ReligiousCategory[] = [
    // Row 1
    ReligiousCategory.ISLAMIC, ReligiousCategory.CHRISTIAN, ReligiousCategory.BUDDHIST,
    // Row 2
    ReligiousCategory.PSYCHOLOGICAL, ReligiousCategory.ASTROLOGY, ReligiousCategory.NUMEROLOGY,
    // Row 3 (new)
    ReligiousCategory.JEWISH, ReligiousCategory.SONNIKS, ReligiousCategory.ANCIENT,
];

// --- Tier Requirements per Category ---
export const CATEGORY_TIER_REQUIREMENT: Record<ReligiousCategory, SubscriptionTier> = {
    [ReligiousCategory.ISLAMIC]: SubscriptionTier.FREE,
    [ReligiousCategory.CHRISTIAN]: SubscriptionTier.FREE,
    [ReligiousCategory.BUDDHIST]: SubscriptionTier.FREE,
    [ReligiousCategory.PSYCHOLOGICAL]: SubscriptionTier.FREE,
    [ReligiousCategory.ASTROLOGY]: SubscriptionTier.FREE,
    [ReligiousCategory.NUMEROLOGY]: SubscriptionTier.FREE,
    [ReligiousCategory.JEWISH]: SubscriptionTier.FREE,
    [ReligiousCategory.SONNIKS]: SubscriptionTier.PRO,     // Ab Pro
    [ReligiousCategory.ANCIENT]: SubscriptionTier.PRO,     // Ab Pro
};

// --- Color Scheme per Category (for button styling) ---
export type CategoryColorScheme = 'emerald' | 'blue' | 'fuchsia' | 'amber' | 'rose' | 'stone';

export const CATEGORY_COLOR_SCHEME: Record<ReligiousCategory, CategoryColorScheme> = {
    [ReligiousCategory.ISLAMIC]: 'emerald',
    [ReligiousCategory.CHRISTIAN]: 'emerald',
    [ReligiousCategory.BUDDHIST]: 'emerald',
    [ReligiousCategory.PSYCHOLOGICAL]: 'blue',
    [ReligiousCategory.ASTROLOGY]: 'blue',
    [ReligiousCategory.NUMEROLOGY]: 'blue',
    [ReligiousCategory.JEWISH]: 'amber',
    [ReligiousCategory.SONNIKS]: 'rose',
    [ReligiousCategory.ANCIENT]: 'stone',
};

// --- Helper: Get sources for selected categories ---
export function getSourcesForCategories(selectedCategories: ReligiousCategory[]): ReligiousSource[] {
    const sources: ReligiousSource[] = [];
    for (const cat of selectedCategories) {
        const catSources = CATEGORY_SOURCE_MAP[cat];
        if (catSources) sources.push(...catSources);
    }
    return [...new Set(sources)];
}
