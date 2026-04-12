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
    ReligiousCategory.ANCIENT, ReligiousCategory.SONNIKS, ReligiousCategory.JEWISH,
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
export type CategoryColorScheme = 'emerald' | 'indigo' | 'fuchsia' | 'amber' | 'rose' | 'stone';

export const CATEGORY_COLOR_SCHEME: Record<ReligiousCategory, CategoryColorScheme> = {
    [ReligiousCategory.ISLAMIC]: 'emerald',
    [ReligiousCategory.CHRISTIAN]: 'emerald',
    [ReligiousCategory.BUDDHIST]: 'emerald',
    [ReligiousCategory.PSYCHOLOGICAL]: 'indigo',
    [ReligiousCategory.ASTROLOGY]: 'indigo',
    [ReligiousCategory.NUMEROLOGY]: 'indigo',
    [ReligiousCategory.JEWISH]: 'indigo',
    [ReligiousCategory.SONNIKS]: 'indigo',
    [ReligiousCategory.ANCIENT]: 'indigo',
};

// --- Subtle accent overrides for bottom-row categories ---
export const CATEGORY_ACCENT: Partial<Record<ReligiousCategory, { borderDark: string; borderLight: string; glowSelected: string; glowHoverDark: string; glowHoverLight: string }>> = {
    [ReligiousCategory.ANCIENT]: {
        borderDark: 'border-amber-700/50',
        borderLight: 'border-amber-500/60',
        glowSelected: 'shadow-[0_0_25px_rgba(180,130,60,0.45)]',
        glowHoverDark: 'hover:border-amber-600/60',
        glowHoverLight: 'hover:border-amber-500',
    },
    [ReligiousCategory.SONNIKS]: {
        borderDark: 'border-rose-700/50',
        borderLight: 'border-rose-400/60',
        glowSelected: 'shadow-[0_0_25px_rgba(150,40,60,0.45)]',
        glowHoverDark: 'hover:border-rose-600/60',
        glowHoverLight: 'hover:border-rose-400',
    },
    [ReligiousCategory.JEWISH]: {
        borderDark: 'border-yellow-600/50',
        borderLight: 'border-yellow-500/60',
        glowSelected: 'shadow-[0_0_25px_rgba(200,170,40,0.45)]',
        glowHoverDark: 'hover:border-yellow-500/60',
        glowHoverLight: 'hover:border-yellow-500',
    },
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
