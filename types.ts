
export enum View {
    HOME = 'HOME',
    LIVE_SESSION = 'LIVE_SESSION',
    DREAM_HUB = 'DREAM_HUB',
    PROFILE = 'PROFILE',
    ONBOARDING = 'ONBOARDING',
    DREAM_MAP = 'DREAM_MAP',
    VIDEO_STUDIO = 'VIDEO_STUDIO',
    DREAM_NETWORK = 'DREAM_NETWORK',
    SCIENCE = 'SCIENCE',
}

export enum Language {
    EN = 'en',
    DE = 'de',
    TR = 'tr',
    ES = 'es',
    FR = 'fr',
    AR = 'ar',
    PT = 'pt',
    RU = 'ru',
}

export enum ThemeMode {
    DARK = 'DARK',
    LIGHT = 'LIGHT',
}

export enum DesignTheme {
    DEFAULT = 'DEFAULT',
    FEMININE = 'FEMININE',
    MASCULINE = 'MASCULINE',
    NATURE = 'NATURE',
}

export enum SubscriptionTier {
    FREE = 'FREE',
    PLUS = 'PLUS',
    PRO = 'PRO',
    DELUXE = 'DELUXE',
    VIP = 'VIP',
    SMART = 'SMART', // BYOK Tier
}

export enum ReligiousCategory {
    ISLAMIC = 'ISLAMIC',
    CHRISTIAN = 'CHRISTIAN',
    BUDDHIST = 'BUDDHIST',
    PSYCHOLOGICAL = 'PSYCHOLOGICAL',
    ASTROLOGY = 'ASTROLOGY',
    NUMEROLOGY = 'NUMEROLOGY',
}

export enum ReligiousSource {
    // Islamic
    IBN_SIRIN = 'IBN_SIRIN',
    NABULSI = 'NABULSI',
    AL_ISKHAFI = 'AL_ISKHAFI',
    // Christian
    MEDIEVAL = 'MEDIEVAL',
    MODERN_THEOLOGY = 'MODERN_THEOLOGY',
    CHURCH_FATHERS = 'CHURCH_FATHERS',
    // Buddhist
    ZEN = 'ZEN',
    TIBETAN = 'TIBETAN',
    THERAVADA = 'THERAVADA',
    // Psychological
    FREUDIAN = 'FREUDIAN',
    JUNGIAN = 'JUNGIAN',
    GESTALT = 'GESTALT',
    // Astrology
    WESTERN_ZODIAC = 'WESTERN_ZODIAC',
    VEDIC_ASTROLOGY = 'VEDIC_ASTROLOGY',
    CHINESE_ZODIAC = 'CHINESE_ZODIAC',
    // Numerology
    PYTHAGOREAN = 'PYTHAGOREAN',
    CHALDEAN = 'CHALDEAN',
    KABBALAH_NUMEROLOGY = 'KABBALAH_NUMEROLOGY',
    ISLAMIC_NUMEROLOGY = 'ISLAMIC_NUMEROLOGY',
    VEDIC_NUMEROLOGY = 'VEDIC_NUMEROLOGY',
}

export enum FontSize {
    SMALL = 'SMALL',
    MEDIUM = 'MEDIUM',
    LARGE = 'LARGE',
}

export interface UserProfile {
    name: string;
    bio?: string; // NEU: Titel / Rolle (z.B. Traumforscher)
    avatarUrl?: string; 
    birthDate?: string;
    zodiacSign?: string;
    lifePathNumber?: number;
    religion?: ReligiousCategory;
    interests: ReligiousCategory[];
    preferredVoice?: string;
    fontSize?: FontSize;
    remarks?: string; 
    activeCategories?: string[]; 
    
    // Preferences
    themeMode?: ThemeMode;
    designTheme?: DesignTheme;

    // Subscription & Economy
    subscriptionTier: SubscriptionTier;
    credits: number; // For FREE users to track ad rewards
    coins?: number;
    saveCount?: number;
    shareCount?: number;

    // Smart Tier Features
    customApiKeys?: string[]; // Array of user provided keys

    // Social & Stats
    socialLinks?: {
        website?: string;
        instagram?: string;
        twitter?: string;
        tiktok?: string;
        youtube?: string;
        linkedin?: string;
        snapchat?: string;
        telegram?: string;
    };
    stats?: {
        followers: number;
        following: number;
    };
    // Expanded fields for onboarding
    age?: string;
    gender?: string;
    location?: string;
    negativeFeelingFreq?: string;
    recurringDreamsFreq?: string;
    psychSymptoms?: string[];
    diagnoses?: string[];
    lifeStressors?: string[];
    workType?: string;
    stressLevel?: number;
    sleepQuality?: string;
    medication?: string;
    substances?: string;
    isComplete?: boolean;
    profileVisibility?: ProfileVisibility;
    communicationPreference?: CommunicationPreference;
}

export enum WorkType {
    MENTAL = 'Mental',
    PHYSICAL = 'Physical',
    MIXED = 'Mixed'
}

export enum SleepQuality {
    GOOD = 'Good',
    FAIR = 'Fair',
    POOR = 'Poor'
}

export enum Frequency {
    ALMOST_ALWAYS = 'Almost Always',
    OFTEN = 'Often',
    SOMETIMES = 'Sometimes',
    RARELY = 'Rarely',
    NEVER = 'Never'
}


export enum ProfileVisibility {
    PUBLIC = 'PUBLIC',
    FRIENDS = 'FRIENDS',
    MINIMAL = 'MINIMAL',
    ANONYMOUS = 'ANONYMOUS'
}

export enum CommunicationPreference {
    OPEN = 'OPEN',
    SELECTIVE = 'SELECTIVE',
    CLOSED = 'CLOSED'
}

export enum AudioVisibility {
    PRIVATE = 'PRIVATE',
    FRIENDS = 'FRIENDS',
    PUBLIC = 'PUBLIC'
}

export interface Dream {
    id: string;
    title: string;
    description: string;
    interpretation: string;
    date: string;
    userAvatar: string;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    audioTranscript?: string;
    audioSource?: 'dictation' | 'livechat';
    audioVisibility?: AudioVisibility; // Default: PRIVATE
    tags: ReligiousCategory[];
    moods?: string[];
    likes: number;
    comments: number;
    matchPercentage: number;
}

export interface BotContribution {
    id: string;
    type: 'dream' | 'interpretation' | 'audio';
    title: string;
    date: string;
}

export interface BotSimUser {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    city: string;
    country: string;
    lat: number;
    lng: number;
    category: string;
    mood: string;
    dreamSummary: string;
    matchPct: number;
    zodiacSign: string;
    gender: string;
    age: number;
    joinedDate: string;
    isBot: true;
    privacyLevel: ProfileVisibility | `${ProfileVisibility}`;
    communicationPreference: CommunicationPreference | `${CommunicationPreference}`;
    isAnonymous: boolean;
    canMessage: false;
    contributionsCount: number;
    contributions?: BotContribution[];
    dreamStyle?: string;
    languages?: string[];
}
