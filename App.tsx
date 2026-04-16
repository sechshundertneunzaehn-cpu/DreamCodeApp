// !!! WICHTIG / IMPORTANT !!!
// DIESE DATEI (INSBESONDERE DIE PROCESS-LOGIC) IST FINALISIERT (FROZEN).
// KEINE ÄNDERUNGEN AN DER ABFOLGE (CONTEXT/CUSTOMER) VORNEHMEN, ES SEI DENN, ES WIRD EXPLIZIT GEFORDERT.
// STATUS: COMPLETED & LOCKED.

import React, { useState, useEffect, useRef } from 'react';
import StarryBackground from './components/StarryBackground';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy Loading: schwere Komponenten werden erst bei Bedarf geladen.
// ChunkLoadError nach Deploys wird durch den LazyFallback abgefangen (auto-reload).
import TrustBanner from './components/TrustBanner';
import VoiceSelector, { VoiceCharacter, VOICE_CHARACTERS } from './components/VoiceSelector';

const LiveSession = React.lazy(() => import('./components/LiveSession'));
const DreamHub = React.lazy(() => import('./components/DreamHub'));
const Profile = React.lazy(() => import('./components/Profile'));
const Onboarding = React.lazy(() => import('./components/Onboarding'));
const DreamCalendar = React.lazy(() => import('./components/DreamCalendar'));
const DreamMap = React.lazy(() => import('./components/DreamMap'));
const VideoStudio = React.lazy(() => import('./components/VideoStudio'));
const SpeechToVideoModal = React.lazy(() => import('./components/SpeechToVideoModal'));
const ProVideoStudio = React.lazy(() => import('./components/ProVideoStudio/ProVideoStudio'));
const DreamNetwork = React.lazy(() => import('./components/DreamNetwork'));
const SciencePage = React.lazy(() => import('./components/SciencePage'));
import CosmicDnaModal from './components/CosmicDnaModal';
const AGBPage = React.lazy(() => import('./components/AGBPage'));
const DatenschutzPage = React.lazy(() => import('./components/DatenschutzPage'));
const ImpressumPage = React.lazy(() => import('./components/ImpressumPage'));
const ForschungPage = React.lazy(() => import('./components/ForschungPage'));
const CensusPage = React.lazy(() => import('./components/CensusPage'));
const ScientificDreamMap = React.lazy(() => import('./components/ScientificDreamMap'));
const ResearchStudies = React.lazy(() => import('./components/ResearchStudies'));
const ParticipantProfile = React.lazy(() => import('./components/ParticipantProfile'));
const DreamSymbolsPage = React.lazy(() => import('./components/DreamSymbolsPage'));
const StudyPage = React.lazy(() => import('./components/StudyPage'));
import { View, ReligiousSource, Dream, Language, ReligiousCategory, UserProfile, FontSize, SubscriptionTier, ThemeMode, DesignTheme, AudioVisibility } from './types';
import { analyzeDreamText, generateDreamImage, generateImagePrompt, generateSpeechPreview, generateStoryVideo, generateDreamVideo, generateDreamNarrationVideo, generateDreamUserVoiceVideo } from './services/geminiService';
import { generateDreamVideo as generateReplicateVideo, isReplicateConfigured } from './services/videoGenerationService';
import StoryVideoPlayer from './components/StoryVideoPlayer';
import { loadDreamsSecurely, loadProfileSecurely, saveDreamsSecurely, saveProfileSecurely, exportDataToFile, importDataFromFile, syncStorageOnStartup } from './services/storage';
// Knowledge Base lazy-loaded on demand (only used in handleInfoClick)
import { FEATURE_PRICES, SUBSCRIPTION_TIERS, COIN_PACKAGES, REWARDS, coinToEur } from './config/pricing';
import { CATEGORY_ICONS, CATEGORY_ORDER, CATEGORY_SOURCE_MAP, CATEGORY_COLOR_SCHEME, CATEGORY_TIER_REQUIREMENT, CATEGORY_ACCENT, getSourcesForCategories } from './config/traditions';
import { REWARD_CONFIG } from './config/rewards';
import { detectRegion, RegionInfo } from './services/regionService';
import { createCheckoutSession } from './services/stripeService';

// --- Data & Translations (lazy-loaded per language) ---
import { TRANSLATIONS, loadTranslation } from './data/translations';


interface ProcessingStep {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'completed' | 'skipped';
    isError?: boolean;
}

// Interfaces for Extracted Components
interface SettingsModalProps {
    onClose: () => void;
    t: any;
    isLight: boolean;
    apiKeyInput: string;
    setApiKeyInput: (val: string) => void;
    handleAddApiKey: () => void;
    handleRemoveApiKey: (key: string) => void;
    userProfile: UserProfile | null;
    themeMode: ThemeMode;
    handleThemeUpdate: (mode: ThemeMode | null, theme: DesignTheme | null) => void;
    designTheme: DesignTheme;
    handleExport: () => void;
    handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    language: string;
    onLanguageChange: (lang: Language) => void;
    onVoiceChange: (character: VoiceCharacter) => void;
    currentVoiceId?: string;
}

interface SubscriptionModalProps {
    onClose: () => void;
    t: any;
    isLight: boolean;
    userProfile: UserProfile | null;
    onUpdateSubscription: (tier: SubscriptionTier) => void;
    language?: string;
    regionInfo?: RegionInfo | null;
}

const App: React.FC = () => {
    const [view, setView] = useState<View>(View.HOME);
    const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
    const [selectedStudyCode, setSelectedStudyCode] = useState<string>('');
    const [prevParticipantView, setPrevParticipantView] = useState<View>(View.RESEARCH_STUDIES);
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('dreamcode_language');
        if (saved && Object.values(Language).includes(saved as Language)) return saved as Language;
        const dl = navigator.language?.toLowerCase() || '';
        if (dl.startsWith('tr')) return Language.TR;
        if (dl.startsWith('es')) return Language.ES;
        if (dl.startsWith('fr')) return Language.FR;
        if (dl.startsWith('ar')) return Language.AR;
        if (dl.startsWith('pt')) return Language.PT;
        if (dl.startsWith('ru')) return Language.RU;
        if (dl.startsWith('zh')) return Language.ZH;
        if (dl.startsWith('hi')) return Language.HI;
        if (dl.startsWith('ja')) return Language.JA;
        if (dl.startsWith('ko')) return Language.KO;
        if (dl.startsWith('id')) return Language.ID;
        if (dl.startsWith('fa')) return Language.FA;
        if (dl.startsWith('it')) return Language.IT;
        if (dl.startsWith('pl')) return Language.PL;
        if (dl.startsWith('bn')) return Language.BN;
        if (dl.startsWith('ur')) return Language.UR;
        if (dl.startsWith('vi')) return Language.VI;
        if (dl.startsWith('th')) return Language.TH;
        if (dl.startsWith('sw')) return Language.SW;
        if (dl.startsWith('hu')) return Language.HU;
        if (dl.startsWith('ta')) return Language.TA;
        if (dl.startsWith('te')) return Language.TE;
        if (dl.startsWith('tl') || dl.startsWith('fil')) return Language.TL;
        if (dl.startsWith('ml')) return Language.ML;
        if (dl.startsWith('mr')) return Language.MR;
        if (dl.startsWith('kn')) return Language.KN;
        if (dl.startsWith('gu')) return Language.GU;
        if (dl.startsWith('he') || dl.startsWith('iw')) return Language.HE;
        if (dl.startsWith('ne')) return Language.NE;
        if (dl.startsWith('en')) return Language.EN;
        return Language.DE;
    });
    const [, forceUpdate] = useState(0);
    const setLanguage = async (lang: Language) => {
        await loadTranslation(lang);
        setLanguageState(lang);
        localStorage.setItem('dreamcode_language', lang);
        // useAutoTranslate-Hooks über Sprachwechsel benachrichtigen
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'dreamcode_language',
            newValue: lang,
            storageArea: localStorage,
        }));
    };
    // Sicherstellen dass die initiale Sprache geladen ist (Lazy-Load Race-Fix)
    useEffect(() => {
        if (language !== Language.DE) {
            loadTranslation(language).then(() => forceUpdate(v => v + 1));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [dreamInput, setDreamInput] = useState('');
    const [videoStudioDreamId, setVideoStudioDreamId] = useState<string | null>(null);
    const [videoStudioInterpretation, setVideoStudioInterpretation] = useState<string>('');
    const [proStudioVideoUrl, setProStudioVideoUrl] = useState<string | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<ReligiousCategory[]>([]);
    const [selectedSources, setSelectedSources] = useState<ReligiousSource[]>([]);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [dreams, setDreams] = useState<Dream[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showSavedMessage, setShowSavedMessage] = useState(false);
    const [lastInterpretation, setLastInterpretation] = useState('');
    const [lastSavedDreamId, setLastSavedDreamId] = useState('');
    const [isStorageReady, setIsStorageReady] = useState(false);
    const [currentAudioData, setCurrentAudioData] = useState<string | null>(null);
    const [audioIsFromLiveChat, setAudioIsFromLiveChat] = useState(false);
    const [showAudioUploadConfirm, setShowAudioUploadConfirm] = useState(false);

    // Info Modal State
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [infoModalData, setInfoModalData] = useState<any>(null);

    // Processing Steps State
    const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
    
    // Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [themeMode, setThemeMode] = useState<ThemeMode>(ThemeMode.DARK);
    const [designTheme, setDesignTheme] = useState<DesignTheme>(DesignTheme.DEFAULT);
    const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
    
    // Settings: API Key Input State
    const [apiKeyInput, setApiKeyInput] = useState('');

    // Speech-to-Video Modal
    const [showSpeechModal, setShowSpeechModal] = useState(false);

    // Video State
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isVideoLoading, setIsVideoLoading] = useState(false);

    // Image State
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);

    // Quality/Style Selection State (for analysis flow)
    const [showStyleSelection, setShowStyleSelection] = useState(false);
    const [pendingDreamData, setPendingDreamData] = useState<any>(null);

    // Subscription, Ads & SHOP State
    const [showSubModal, setShowSubModal] = useState(false);
    const [showEarnModal, setShowEarnModal] = useState(false);
    const [showCoinShop, setShowCoinShop] = useState(false);
    const [showCosmicDna, setShowCosmicDna] = useState(false);
    const [showMoonSync, setShowMoonSync] = useState(false);
    const [isAdPlaying, setIsAdPlaying] = useState(false);
    const [adDuration, setAdDuration] = useState(0);
    const [regionInfo, setRegionInfo] = useState<RegionInfo | null>(null);
    const adTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    // Cleanup ad timer on unmount
    useEffect(() => {
        return () => {
            if (adTimerRef.current) {
                clearTimeout(adTimerRef.current);
            }
        };
    }, []);

    // Region-Detection für VIP-Tier
    useEffect(() => {
        setRegionInfo(detectRegion());
    }, []);

    // Sync body background + dark class with theme
    useEffect(() => {
        document.body.style.backgroundColor = themeMode === ThemeMode.LIGHT ? '#f0eefc' : '#0f0b1a';
        // Toggle .dark/.light on <html> for CSS variables + Tailwind dark: prefix
        if (themeMode === ThemeMode.LIGHT) {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
        }
    }, [themeMode]);

    // RTL support + lazy translation load
    useEffect(() => {
        document.documentElement.dir = (language.startsWith('ar') || [Language.FA, Language.UR, Language.HE, Language.PRS].includes(language)) ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        loadTranslation(language);
    }, [language]);

    // --- Persistence Initialization ---
    // !!! CRITICAL FIX: ASYNC LOADING TO PREVENT DATA OVERWRITE !!!
    useEffect(() => {
        const init = async () => {
            try {
                // Sync-Check: Vergleicht localStorage und IndexedDB — nimmt neueren Stand
                const { dreams: syncedDreams, profile: syncedProfile } = await syncStorageOnStartup();
                const loadedDreams = syncedDreams;
                setDreams(loadedDreams);

                let loadedProfile = syncedProfile;

                if (!loadedProfile || !loadedProfile.name) {
                     loadedProfile = {
                         name: 'Dreamer',
                         interests: [],
                         credits: 9999,
                         subscriptionTier: SubscriptionTier.SMART,
                         isComplete: false,
                         customApiKeys: []
                     } as UserProfile;
                     await saveProfileSecurely(loadedProfile);
                } else {
                }
                
                // Restore Theme Prefs
                if (loadedProfile.themeMode) setThemeMode(loadedProfile.themeMode);
                if (loadedProfile.designTheme) setDesignTheme(loadedProfile.designTheme);

                // Language is now persisted in localStorage and auto-detected on first visit
                // via the useState initializer — no need to override here

                // DEV: Immer hoechste Stufe setzen damit nichts blockiert wird
                if (import.meta.env.DEV) {
                if (loadedProfile.subscriptionTier !== SubscriptionTier.SMART) {
                    loadedProfile = { ...loadedProfile, subscriptionTier: SubscriptionTier.SMART, credits: Math.max(loadedProfile.credits ?? 0, 9999) };
                    await saveProfileSecurely(loadedProfile);
                }
                // Ensure Credits
                if ((loadedProfile.credits ?? 0) < 100) {
                     loadedProfile = { ...loadedProfile, credits: 9999 };
                     await saveProfileSecurely(loadedProfile);
                }
                } // end DEV-only

                // Load saved categories from localStorage
                try {
                    const savedCategories = localStorage.getItem('dreamcode_saved_categories');
                    const savedSources = localStorage.getItem('dreamcode_saved_sources');
                    if (savedCategories) {
                        setSelectedCategories(JSON.parse(savedCategories));
                    }
                    if (savedSources) {
                        setSelectedSources(JSON.parse(savedSources));
                    }
                } catch (e) {
                }

                setUserProfile(loadedProfile);
            } catch (e) {
                console.error("Initialization Failed:", e);
            } finally {
                setIsStorageReady(true);
            }
        };
        init();
    }, []);

    // --- Payment-Success Handler (Stripe Redirect) ---
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        if (!sessionId) return;

        fetch('/api/verify-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        })
            .then(res => res.json())
            .then(async (data) => {
                if (data.paymentStatus === 'paid') {
                    if (data.type === 'coins' && data.coins) {
                        const currentProfile = await loadProfileSecurely();
                        const base = currentProfile || userProfile;
                        if (base) {
                            const newCredits = (base.credits || 0) + data.coins;
                            const updated = { ...base, credits: newCredits };
                            setUserProfile(updated);
                            await saveProfileSecurely(updated);
                        }
                    } else if (data.type === 'subscription' && data.tier) {
                        const tierKey = data.tier.toUpperCase() as keyof typeof SubscriptionTier;
                        const newTier = SubscriptionTier[tierKey] || SubscriptionTier.FREE;
                        const currentProfile = await loadProfileSecurely();
                        const base = currentProfile || userProfile;
                        if (base) {
                            const updated = { ...base, subscriptionTier: newTier };
                            setUserProfile(updated);
                            await saveProfileSecurely(updated);
                        }
                    }
                }
                // URL bereinigen
                window.history.replaceState({}, '', '/');
            })
            .catch(console.error);
    // Einmalig beim Mount ausführen
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSaveProfile = async (profile: UserProfile) => {
        if (!isStorageReady) return;
        const updatedProfile = {
            ...(userProfile || {}),
            ...profile,
            subscriptionTier: profile.subscriptionTier || userProfile?.subscriptionTier || SubscriptionTier.FREE,
            credits: profile.credits !== undefined ? profile.credits : (userProfile?.credits !== undefined ? userProfile.credits : 100)
        } as UserProfile;

        setUserProfile(updatedProfile);
        await saveProfileSecurely(updatedProfile); 
        setShowOnboarding(false);
    };
    
    // Update theme and save to profile
    const handleThemeUpdate = async (mode: ThemeMode | null, theme: DesignTheme | null) => {
        if (!isStorageReady) return;
        if (mode) setThemeMode(mode);
        if (theme) setDesignTheme(theme);
        
        if (userProfile) {
            const updated = { 
                ...userProfile, 
                themeMode: mode || themeMode, 
                designTheme: theme || designTheme 
            };
            setUserProfile(updated);
            await saveProfileSecurely(updated);
        }
    };

    // --- API Key Management ---
    const handleAddApiKey = async () => {
        if (apiKeyInput.trim().length > 0 && userProfile) {
            const currentKeys = userProfile.customApiKeys || [];
            // Prevent duplicates
            if (!currentKeys.includes(apiKeyInput.trim())) {
                const updated = { 
                    ...userProfile, 
                    customApiKeys: [...currentKeys, apiKeyInput.trim()] 
                };
                setUserProfile(updated);
                await saveProfileSecurely(updated);
            }
            setApiKeyInput('');
        }
    };

    const handleRemoveApiKey = async (keyToRemove: string) => {
        if (userProfile) {
            const currentKeys = userProfile.customApiKeys || [];
            const updated = {
                ...userProfile,
                customApiKeys: currentKeys.filter(k => k !== keyToRemove)
            };
            setUserProfile(updated);
            await saveProfileSecurely(updated);
        }
    };

    // Save categories to localStorage for persistence
    const handleSaveCategories = () => {
        try {
            localStorage.setItem('dreamcode_saved_categories', JSON.stringify(selectedCategories));
            localStorage.setItem('dreamcode_saved_sources', JSON.stringify(selectedSources));
            setShowSavedMessage(true);
            setTimeout(() => setShowSavedMessage(false), 2000);
        } catch (e) {
            console.error('Could not save categories', e);
        }
    };

    const handleUpdateSubscription = async (tier: SubscriptionTier) => {
        // FREE Tier: direkt setzen, kein Payment noetig
        if (tier === SubscriptionTier.FREE) {
            const baseProfile = userProfile || {
                name: "Dreamer",
                interests: [],
                credits: 100,
                subscriptionTier: SubscriptionTier.FREE,
                customApiKeys: []
            } as UserProfile;
            const updated = { ...baseProfile, subscriptionTier: tier };
            setUserProfile(updated);
            await saveProfileSecurely(updated);
            setShowSubModal(false);
            return;
        }

        // Bezahlte Tiers: Stripe Checkout starten
        const tierNameMap: Record<string, string> = {
            [SubscriptionTier.PRO]: 'PRO',
            [SubscriptionTier.PREMIUM]: 'PREMIUM',
            [SubscriptionTier.SMART]: 'SMART',
            [SubscriptionTier.VIP]: 'VIP',
        };
        const tierName = tierNameMap[tier];
        if (!tierName) return;

        try {
            await createCheckoutSession('subscription', tierName, regionInfo?.region);
            // Redirect passiert in createCheckoutSession (window.location.href)
        } catch (err) {
            console.error('Stripe Checkout fehlgeschlagen:', err);
            // Fallback: Smart Tier kann auch lokal aktiviert werden (BYOK)
            if (tier === SubscriptionTier.SMART) {
                const baseProfile = userProfile || {
                    name: "Dreamer",
                    interests: [],
                    credits: 100,
                    subscriptionTier: SubscriptionTier.FREE,
                    customApiKeys: []
                } as UserProfile;
                const updated = { ...baseProfile, subscriptionTier: tier };
                setUserProfile(updated);
                await saveProfileSecurely(updated);
                setShowSubModal(false);
                setShowSettings(true);
            } else {
                // Payment noch nicht live — User informieren
                const t = TRANSLATIONS[language];
                const msg = t?.sub?.coming_soon_msg || 'Zahlung wird bald aktiviert. Schreib uns: support@dream-code.app';
                alert(msg);
            }
        }
    };

    const triggerAd = (duration: number, reward: number) => {
        setShowEarnModal(false);
        setIsAdPlaying(true);
        setAdDuration(duration);

        // Cleanup vorherigen Timer falls noch aktiv
        if (adTimerRef.current) {
            clearTimeout(adTimerRef.current);
        }

        adTimerRef.current = setTimeout(async () => {
            adTimerRef.current = null;
            setIsAdPlaying(false);
            // Re-load to ensure we have latest before writing
            const currentProfile = await loadProfileSecurely();
            if (currentProfile) {
                const newCredits = (currentProfile.credits || 0) + reward;
                const updated = { ...currentProfile, credits: newCredits };
                setUserProfile(updated);
                await saveProfileSecurely(updated);
            } else if (userProfile) {
                 const updated = { ...userProfile, credits: (userProfile.credits || 0) + reward };
                 setUserProfile(updated);
                 await saveProfileSecurely(updated);
            }
        }, duration);
    };

    const handleCoinPurchase = async (amount: number) => {
        // Mock Purchase
        const currentProfile = await loadProfileSecurely();
        if (currentProfile) {
            const newCredits = (currentProfile.credits || 0) + amount;
            const updated = { ...currentProfile, credits: newCredits };
            setUserProfile(updated);
            await saveProfileSecurely(updated);
        }
        // Close shop after purchase
        setShowCoinShop(false);
    };

    const handleSaveDream = async (newDream: Dream) => {
        if (!isStorageReady) return;
        const updated = [newDream, ...dreams];
        setDreams(updated);
        await saveDreamsSecurely(updated);
    };

    const handleUpdateDream = async (updatedDream: Dream) => {
        if (!isStorageReady) return;
        const updated = dreams.map(d => d.id === updatedDream.id ? updatedDream : d);
        setDreams(updated);
        await saveDreamsSecurely(updated);
    };

    // --- BACKUP HANDLERS ---
    const handleExportData = () => {
        if (userProfile && dreams) {
            exportDataToFile(userProfile, dreams);
        }
    };

    const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const { profile, dreams: importedDreams } = await importDataFromFile(e.target.files[0]);
                setUserProfile(profile);
                setDreams(importedDreams);
                await saveProfileSecurely(profile);
                await saveDreamsSecurely(importedDreams);
                alert(TRANSLATIONS[language].ui.backup_restored);
            } catch (err) {
                alert(TRANSLATIONS[language].ui.backup_error);
            }
        }
    };

    const t = TRANSLATIONS[language];

    const toggleCategory = (category: ReligiousCategory) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(prev => prev.filter(c => c !== category));
        } else {
            setSelectedCategories(prev => [...prev, category]);
        }
    };

    const toggleSource = (source: ReligiousSource) => {
        if (selectedSources.includes(source)) {
            setSelectedSources(prev => prev.filter(s => s !== source));
        } else {
            setSelectedSources(prev => [...prev, source]);
        }
    };

    // INFO HANDLER
    const handleInfoClick = async (itemKey: string) => {
        const { KNOWLEDGE_BASE } = await import('./data/knowledgeBase');
        const langData = KNOWLEDGE_BASE[language] || KNOWLEDGE_BASE[Language.DE];
        const data = (langData as any)[itemKey];
        if (data) {
            setInfoModalData(data);
            setShowInfoModal(true);
        }
    };

    // --- LIVE CHAT: Convert raw transcript to narrative story ---
    const convertTranscriptToStory = async (transcript: string, lang: Language): Promise<string> => {
        const userLines = transcript
            .split('\n')
            .filter(line => line.startsWith('[User]:'))
            .map(line => line.replace(/^\[User\]:\s*/, '').trim())
            .filter(Boolean);

        if (userLines.length === 0) return transcript;

        const userContent = userLines.join(' ');

        const LANG_NAMES: Record<string, string> = {
            de: 'Deutsch', tr: 'Türkisch', en: 'English', es: 'Spanisch',
            fr: 'Französisch', ar: 'Arabisch', pt: 'Portugiesisch', ru: 'Russisch',
            zh: 'Chinesisch', hi: 'Hindi', ja: 'Japanisch', ko: 'Koreanisch',
            id: 'Indonesisch', fa: 'Persisch', it: 'Italienisch', pl: 'Polnisch',
            bn: 'Bengalisch', ur: 'Urdu', vi: 'Vietnamesisch', th: 'Thailändisch',
            sw: 'Suaheli', hu: 'Ungarisch', ta: 'Tamil', te: 'Telugu',
            tl: 'Filipino', ml: 'Malayalam', mr: 'Marathi', kn: 'Kannada',
            gu: 'Gujarati', he: 'Hebräisch', ne: 'Nepali', prs: 'Dari',
        };
        const langName = LANG_NAMES[lang] || 'Deutsch';

        const systemPrompt = `You are a dream scribe. Convert the following dream fragments (spoken by the dreamer) into a single coherent dream narrative in ${langName}.
Rules:
- Use ONLY what the dreamer said. Do not add, invent or embellish anything.
- Write in first person ("Ich...").
- Use flowing prose with natural paragraph breaks.
- Do not include any meta-text, introductions or explanations – only the dream narrative itself.
- Respond in ${langName} only.`;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: userContent }],
                    language: lang,
                    systemPrompt,
                }),
            });
            if (!res.ok) return userContent;
            const data = await res.json();
            return data.reply || userContent;
        } catch {
            return userContent;
        }
    };

    // --- ENHANCED ANALYSIS HANDLER (FROZEN LOGIC) ---
    const handleAnalyze = async (directInput?: string) => {
        if (!isStorageReady) {
            alert(t.ui.storage_init);
            return;
        }
        const inputText = directInput || dreamInput;
        if (!inputText.trim()) return;

        let currentProfile = userProfile;
        // Ensure we have the absolute latest
        const freshProfile = await loadProfileSecurely();
        if (freshProfile) currentProfile = freshProfile;

        if (!currentProfile) {
            currentProfile = { name: 'Dreamer', interests: [], credits: 100, subscriptionTier: SubscriptionTier.FREE } as UserProfile;
        }

        const credits = currentProfile.credits ?? 0;
        const tier = currentProfile.subscriptionTier || SubscriptionTier.FREE;

        // Check Credits ONLY if not Smart Tier
        if (tier !== SubscriptionTier.SMART && credits < 1) {
             setShowCoinShop(true); // OPEN SHOP INSTEAD OF EARN
             return;
        }
        
        // Start Processing
        setLoading(true);
        setShowSavedMessage(false);
        
        // Deduct Credit (Only if not Smart)
        if (tier !== SubscriptionTier.SMART) {
            const updatedProfile = { ...currentProfile, credits: credits - 1 };
            setUserProfile(updatedProfile);
            await saveProfileSecurely(updatedProfile);
            currentProfile = updatedProfile; // Update local ref
        }

        // --- INITIALIZE STEPS (FROZEN ORDER) ---
        // 1. Analyze -> 2. Context (Tradition) -> 3. Customer -> 4. Image -> 5. Save
        const initialSteps: ProcessingStep[] = [
            { id: 'analyze', label: t.processing.step_analyze, status: 'active' },
            { id: 'context', label: t.processing.step_context, status: 'pending' }, 
            { id: 'customer', label: t.processing.step_customer, status: 'pending' }, 
            { id: 'image', label: t.processing.step_image, status: 'pending' },
            { id: 'save', label: t.processing.step_save, status: 'pending' }
        ];
        setProcessingSteps(initialSteps);

        const updateStep = (id: string, status: ProcessingStep['status'], label?: string, isError?: boolean) => {
            setProcessingSteps(prev => prev.map(s => s.id === id ? { ...s, status, label: label || s.label, isError } : s));
        };

        try {
            // STEP 1: ANALYSIS
            const result = await analyzeDreamText(inputText, language, currentProfile, selectedCategories, selectedSources);
            updateStep('analyze', 'completed');

            // STEP 2: CATEGORIES & TRADITIONS
            if (selectedCategories.length > 0 || selectedSources.length > 0) {
                updateStep('context', 'active');
                await new Promise(r => setTimeout(r, 150));
                updateStep('context', 'completed');
            } else {
                updateStep('context', 'skipped', t.processing.step_no_context);
                await new Promise(r => setTimeout(r, 100));
            }

            // STEP 3: CUSTOMER CONTEXT
            const hasCustomerData = currentProfile && (
                (currentProfile.age && currentProfile.age.toString().trim() !== '') || 
                (currentProfile.gender && currentProfile.gender !== '') ||
                (currentProfile.lifeStressors && currentProfile.lifeStressors.length > 0) ||
                (currentProfile.psychSymptoms && currentProfile.psychSymptoms.length > 0) ||
                (currentProfile.remarks && currentProfile.remarks.trim().length > 0)
            );

            if (hasCustomerData) {
                updateStep('customer', 'active');
                await new Promise(r => setTimeout(r, 150));
                updateStep('customer', 'completed');
            } else {
                updateStep('customer', 'skipped', t.processing.step_no_customer);
                await new Promise(r => setTimeout(r, 100));
            }

            // PAUSE HERE: Show quality/style selection
            // Save all data needed to continue later
            setPendingDreamData({
                inputText,
                result,
                currentProfile,
                selectedCategories
            });
            setLoading(false);
            setShowStyleSelection(true);

        } catch (e) {
            console.error("Analysis failed", e);
            alert(t.ui.analysis_error || 'Traumanalyse fehlgeschlagen. Bitte versuche es erneut.');
            setLoading(false);
        }
    };

    const handleGenerateVideo = async (dreamDescription?: string, dreamId?: string) => {
        const prompt = dreamDescription || dreamInput;
        if (!prompt.trim()) return;

        setIsVideoLoading(true);
        try {
            // If user has recorded audio (dictation), use their voice instead of AI TTS
            const dreamObj = dreamId ? dreams.find(d => d.id === dreamId) : null;
            const userAudio = dreamObj ? dreamObj.audioUrl : currentAudioData;
            const isFromLiveChat = dreamObj ? dreamObj.audioSource === 'livechat' : audioIsFromLiveChat;
            const isUserVoice = !!userAudio && !isFromLiveChat;

            let result;
            if (isUserVoice && userAudio) {
                // User voice video: user's own recording as soundtrack
                result = await generateDreamUserVoiceVideo(
                    prompt,
                    userAudio,
                    'fantasy',
                    language,
                    (message, percent) => {
                    }
                );
                // Coin reward for using own voice
                const currentProfile = await loadProfileSecurely();
                if (currentProfile) {
                    const newCredits = (currentProfile.credits || 0) + 5;
                    const updated = { ...currentProfile, credits: newCredits };
                    setUserProfile(updated);
                    await saveProfileSecurely(updated);
                }
            } else {
                // AI voice video: analyze dream first, then TTS
                const analysis = await analyzeDreamText(prompt, language, userProfile, selectedCategories, selectedSources);
                if (!analysis?.interpretation) {
                    throw new Error('Dream analysis failed');
                }
                result = await generateStoryVideo(
                    prompt,
                    analysis.interpretation,
                    'fantasy',
                    language,
                    (message, percent) => {
                    }
                );
            }

            if (result) {
                setVideoUrl(result.videoDataUrl);
                setShowVideoModal(true);
                // Persist video in dream
                if (dreamId) {
                    const dream = dreams.find(d => d.id === dreamId);
                    if (dream) {
                        await handleUpdateDream({ ...dream, videoUrl: result.videoDataUrl });
                    }
                }
            }
        } catch (e) {
            console.error('[VIDEO] Generation failed:', e);
            alert(t.ui.video_error);
        } finally {
            setIsVideoLoading(false);
        }
    };

    // Traum-Video: Roher Traum-Text + KI-Stimme (keine Deutung)
    const handleGenerateNarrationVideo = async (dreamDescription: string, dreamId?: string) => {
        if (!dreamDescription.trim()) return;
        setIsVideoLoading(true);
        try {
            const result = await generateDreamNarrationVideo(
                dreamDescription,
                'fantasy',
                language,
                (message, percent) => {
                }
            );
            if (result) {
                setVideoUrl(result.videoDataUrl);
                setShowVideoModal(true);
                // Persist video in dream
                if (dreamId) {
                    const dream = dreams.find(d => d.id === dreamId);
                    if (dream) {
                        await handleUpdateDream({ ...dream, videoUrl: result.videoDataUrl });
                    }
                }
            }
        } catch (e) {
            console.error('[VIDEO-NARRATION] Generation failed:', e);
            alert(t.ui.video_error);
        } finally {
            setIsVideoLoading(false);
        }
    };

    // Traum-Video: Roher Traum-Text + User-eigene Stimme + Coin-Belohnung
    const handleGenerateUserVoiceVideo = async (dreamDescription: string, userAudioBase64: string, dreamId?: string) => {
        if (!dreamDescription.trim() || !userAudioBase64) return;
        setIsVideoLoading(true);
        try {
            const result = await generateDreamUserVoiceVideo(
                dreamDescription,
                userAudioBase64,
                'fantasy',
                language,
                (message, percent) => {
                }
            );
            if (result) {
                setVideoUrl(result.videoDataUrl);
                setShowVideoModal(true);
                // Persist video in dream
                if (dreamId) {
                    const dream = dreams.find(d => d.id === dreamId);
                    if (dream) {
                        await handleUpdateDream({ ...dream, videoUrl: result.videoDataUrl });
                    }
                }

                // Coin-Belohnung fuer User-Voice Video
                const VOICE_VIDEO_REWARD = 5;
                const currentProfile = await loadProfileSecurely();
                if (currentProfile) {
                    const newCredits = (currentProfile.credits || 0) + VOICE_VIDEO_REWARD;
                    const updated = { ...currentProfile, credits: newCredits };
                    setUserProfile(updated);
                    await saveProfileSecurely(updated);
                }
            }
        } catch (e) {
            console.error('[VIDEO-USER-VOICE] Generation failed:', e);
            alert(t.ui.video_error);
        } finally {
            setIsVideoLoading(false);
        }
    };

    const handleOpenVideoStudio = (dreamText: string, interpretation: string, dreamId: string, audioUrl?: string) => {
        setDreamInput(dreamText);
        setVideoStudioDreamId(dreamId);
        setVideoStudioInterpretation(interpretation);
        setLastInterpretation('');
        setLastSavedDreamId('');
        setView(View.VIDEO_STUDIO);
    };

    const handleGenerateImageWithStyle = async (
        quality: 'normal' | 'high',
        style: 'cartoon' | 'anime' | 'real' | 'fantasy',
        dreamDescription: string
    ) => {
        if (!dreamDescription.trim()) return;

        // Check subscription tier
        const tier = userProfile?.subscriptionTier || SubscriptionTier.FREE;
        const isPremium = quality === 'high' && (tier === SubscriptionTier.PRO || tier === SubscriptionTier.SMART);

        if (quality === 'high' && tier !== SubscriptionTier.PRO && tier !== SubscriptionTier.SMART) {
            setShowSubModal(true);
            return;
        }

        setIsImageLoading(true);
        try {
            const imageUrl = await generateDreamImage(dreamDescription, selectedCategories, userProfile, isPremium, style);
            if (imageUrl) {
                setImageUrl(imageUrl);
                setShowImageModal(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsImageLoading(false);
        }
    };

    const handleGenerateVideoWithStyle = async (
        quality: 'normal' | 'high',
        style: 'cartoon' | 'anime' | 'real' | 'fantasy',
        dreamDescription: string
    ) => {
        if (!dreamDescription.trim()) return;

        setIsVideoLoading(true);
        try {
            const url = await generateDreamVideo(dreamDescription, userProfile, quality, style);
            if (url) {
                setVideoUrl(url);
                setShowVideoModal(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsVideoLoading(false);
        }
    };

    const continueWithImageGeneration = async (quality: 'normal' | 'high', style: 'cartoon' | 'anime' | 'real' | 'fantasy' | null) => {
        if (!pendingDreamData) return;

        const { inputText, result, currentProfile, selectedCategories } = pendingDreamData;

        setShowStyleSelection(false);
        setLoading(true);

        try {
            // IMAGE GENERATION
            let imageUrl: string | undefined = undefined;

            // Skip image generation if style is null
            if (style !== null) {
                const generatedUrl = await generateDreamImage(inputText, currentProfile, quality, style, undefined, result.interpretation);
                if (generatedUrl) {
                    imageUrl = generatedUrl;
                }
            }

            // SAVE
            const now = new Date();
            const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

            const newDream: Dream = {
                id: Date.now().toString(),
                title: inputText.split(' ').slice(0, 5).join(' ') + "...",
                description: inputText,
                interpretation: result.interpretation,
                date: dateStr,
                tags: selectedCategories,
                matchPercentage: Math.floor(Math.random() * 30) + 70,
                likes: 0,
                comments: 0,
                userAvatar: currentProfile?.avatarUrl || '',
                imageUrl: imageUrl,
                ...(currentAudioData && {
                    audioUrl: currentAudioData,
                    audioTranscript: inputText,
                    audioSource: audioIsFromLiveChat ? 'livechat' as const : 'dictation' as const,
                    audioVisibility: AudioVisibility.PRIVATE // Default: nicht sichtbar
                })
            };


            await handleSaveDream(newDream);
            setLastInterpretation(result.interpretation || '');
            setLastSavedDreamId(newDream.id);
            await new Promise(r => setTimeout(r, 200));

            // Finish
            await new Promise(r => setTimeout(r, 300));
            setLoading(false);
            setDreamInput('');

            // Show upload confirmation if audio was recorded
            if (currentAudioData) {
                setShowAudioUploadConfirm(true);
            } else {
                setCurrentAudioData(null);
                setShowSavedMessage(true);
                setTimeout(() => setShowSavedMessage(false), 4000);
            }

            setPendingDreamData(null);

        } catch (e) {
            console.error("Image generation/save failed", e);
            setLoading(false);
        }
    };

    const handleLiveClick = () => {
        // Live Chat für alle Nutzer geöffnet
        setView(View.LIVE_SESSION);
    };




    // State for dictation recording
    const [dictationRecorder, setDictationRecorder] = useState<MediaRecorder | null>(null);
    const [dictationChunks, setDictationChunks] = useState<Blob[]>([]);

    const startDictation = async () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert(t.ui.dictation_error);
            return;
        }

        try {
            // Start audio recording
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = async () => {
                // Convert recorded audio to base64
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setCurrentAudioData(base64String);
                    setAudioIsFromLiveChat(false);
                };
                reader.readAsDataURL(audioBlob);

                // Cleanup
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setDictationRecorder(recorder);
            setDictationChunks(chunks);

            // Start speech recognition
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.lang = language === Language.DE ? 'de-DE' :
                              language === Language.TR ? 'tr-TR' :
                              language === Language.ES ? 'es-ES' :
                              language === Language.FR ? 'fr-FR' :
                              language === Language.AR ? 'ar-SA' :
                              language === Language.PT ? 'pt-PT' :
                              language === Language.RU ? 'ru-RU' : 'en-US';
            recognition.continuous = true;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);

            recognition.onend = () => {
                setIsListening(false);
                // Stop audio recording when speech recognition ends
                if (recorder.state === 'recording') {
                    recorder.stop();
                }
            };

            recognition.onerror = () => {
                setIsListening(false);
                if (recorder.state === 'recording') {
                    recorder.stop();
                }
                alert(t.ui.dictation_perm);
            };

            recognition.onresult = (event: any) => {
                // Get ONLY the latest result to avoid repetition
                const lastResultIndex = event.results.length - 1;
                const transcript = event.results[lastResultIndex][0].transcript;
                setDreamInput(prev => {
                    const newText = prev.trim() + ' ' + transcript.trim();
                    return newText.trim();
                });
            };

            recognition.start();

            // Auto-stop after 60 seconds
            setTimeout(() => {
                if (recognition) {
                    recognition.stop();
                }
            }, 60000);

        } catch (error) {
            console.error('Diktat error:', error);
            alert(t.ui.mic_denied_alert);
        }
    };

    const stopDictation = () => {
        if (dictationRecorder && dictationRecorder.state === 'recording') {
            dictationRecorder.stop();
        }
        setIsListening(false);
    };
    
    const getAvailableSources = () => getSourcesForCategories(selectedCategories);

    const isLight = themeMode === ThemeMode.LIGHT;
    
    const appBgInput = isLight
        ? 'bg-white/80 backdrop-blur-md border-mystic-border shadow-md shadow-accent-primary/10 focus-within:border-accent-primary/50 focus-within:shadow-mystic'
        : 'bg-dream-surface/80 border-white/10 focus-within:border-accent-primary/40';

    // Render a simple loader if not ready
    if (!isStorageReady) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <div className="w-16 h-16 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="font-mystic text-xl">Opening Oracle Vault...</h2>
            </div>
        );
    }

    // --- Render Content ---
    const renderHome = () => {
        const tier = userProfile?.subscriptionTier || SubscriptionTier.FREE;
        const credits = userProfile?.credits || 0;
        const noCredits = tier === SubscriptionTier.FREE && credits < 1;

        // HELPER FOR TIER DISPLAY
        const getTierDisplay = () => {
            const currentTier = userProfile?.subscriptionTier || SubscriptionTier.FREE;
            const nextMonth = new Date();
            nextMonth.setDate(nextMonth.getDate() + 30);
            const localeMap: Record<Language, string> = {
                [Language.DE]: 'de-DE', [Language.EN]: 'en-US', [Language.TR]: 'tr-TR',
                [Language.ES]: 'es-ES', [Language.FR]: 'fr-FR', [Language.AR]: 'ar-SA',
                [Language.PT]: 'pt-BR', [Language.RU]: 'ru-RU',
                [Language.ZH]: 'zh-CN', [Language.HI]: 'hi-IN', [Language.JA]: 'ja-JP',
                [Language.KO]: 'ko-KR', [Language.ID]: 'id-ID', [Language.FA]: 'fa-IR',
                [Language.IT]: 'it-IT', [Language.PL]: 'pl-PL', [Language.BN]: 'bn-BD',
                [Language.UR]: 'ur-PK', [Language.VI]: 'vi-VN', [Language.TH]: 'th-TH',
                [Language.SW]: 'sw-KE', [Language.HU]: 'hu-HU',
                [Language.TA]: 'ta-IN', [Language.TE]: 'te-IN', [Language.TL]: 'fil-PH',
                [Language.ML]: 'ml-IN', [Language.MR]: 'mr-IN', [Language.KN]: 'kn-IN',
                [Language.GU]: 'gu-IN', [Language.HE]: 'he-IL', [Language.NE]: 'ne-NP',
                [Language.PRS]: 'fa-AF',
                [Language.AR_GULF]: 'ar-AE', [Language.AR_EG]: 'ar-EG',
                [Language.AR_LEV]: 'ar-JO', [Language.AR_MAG]: 'ar-MA', [Language.AR_IQ]: 'ar-IQ',
            };
            const dateStr = nextMonth.toLocaleDateString(localeMap[language] || 'de-DE', { day: '2-digit', month: '2-digit' });

            let label = t.ui.tier_bronze;
            let style = isLight ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-amber-900/20 text-amber-600 border-amber-700/30";
            let dateText = t.ui.base_version;

            if (currentTier === SubscriptionTier.PRO) {
                label = t.ui.tier_silver;
                style = isLight ? "bg-slate-100 text-slate-800 border-slate-300" : "bg-slate-800 text-slate-300 border-slate-500";
                dateText = `${t.ui.until_date} ${dateStr}`;
            } else if (currentTier === SubscriptionTier.PREMIUM) {
                label = t.ui.tier_gold;
                style = isLight ? "bg-yellow-100 text-yellow-800 border-yellow-300" : "bg-yellow-900/20 text-yellow-400 border-yellow-500";
                dateText = `${t.ui.until_date} ${dateStr}`;
            } else if (currentTier === SubscriptionTier.SMART) {
                label = t.ui.tier_smart;
                style = isLight ? "bg-cyan-100 text-cyan-800 border-cyan-300" : "bg-cyan-900/20 text-cyan-400 border-cyan-500";
                dateText = `${t.ui.until_date} ${dateStr}`;
            }

            return { label, style, dateText };
        };

        const tierInfo = getTierDisplay();

        return (
        <div className="max-w-4xl mx-auto px-4 duration-500 pb-20">
             {/* HEADER */}
             <div className="flex items-start justify-between mb-6 gap-3">
                 <div className="flex-1 min-w-0">
                     <h1 className={`text-3xl sm:text-4xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r ${isLight ? 'from-[#1e1035] via-[#4c1d95] to-[#7c3aed]' : 'from-violet-200 via-fuchsia-200 to-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]'}`} style={{ lineHeight: '1.15', ...(isLight ? { color: '#1a1a2e', WebkitTextFillColor: 'transparent' } : {}) }}>
                         {(() => {
                             const parts = t.app_title.split(' | ');
                             if (parts.length === 2) {
                                 return (
                                     <>
                                         <span className="block">{parts[0]}</span>
                                         <span className={`text-sm font-body font-normal mt-0.5 block ${isLight ? 'text-accent-primary' : 'text-fuchsia-300/60'}`}>| {parts[1]}</span>
                                     </>
                                 );
                             }
                             return t.app_title;
                         })()}
                     </h1>
                     <p className={`text-[11px] tracking-[0.15em] uppercase mt-1.5 leading-relaxed ${isLight ? 'text-[#4c1d95]' : 'bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 via-violet-300 to-cyan-300'}`} style={isLight ? {} : { backgroundSize: '200% auto', animation: 'gradient-shift 4s ease infinite' }}>
                         {t.app_subtitle}
                     </p>
                 </div>

                 <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as Language)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${isLight ? 'bg-white/80 border-indigo-200 text-indigo-900' : 'bg-slate-800/80 border-fuchsia-500/30 text-white'}`}
                      >
                          <option value={Language.EN}>🇬🇧 EN</option>
                          <option value={Language.DE}>🇩🇪 DE</option>
                          <option value={Language.TR}>🇹🇷 TR</option>
                          <option value={Language.ES}>🇪🇸 ES</option>
                          <option value={Language.FR}>🇫🇷 FR</option>
                          <option value={Language.AR}>🌍 AR</option>
                          <option value={Language.AR_GULF}>🇸🇦 خليجي</option>
                          <option value={Language.AR_EG}>🇪🇬 مصري</option>
                          <option value={Language.AR_LEV}>🇱🇧 شامي</option>
                          <option value={Language.AR_MAG}>🇲🇦 دارجة</option>
                          <option value={Language.AR_IQ}>🇮🇶 عراقي</option>
                          <option value={Language.PT}>🇵🇹 PT</option>
                          <option value={Language.RU}>🇷🇺 RU</option>
                          <option value={Language.ZH}>🇨🇳 ZH</option>
                          <option value={Language.HI}>🇮🇳 HI</option>
                          <option value={Language.JA}>🇯🇵 JA</option>
                          <option value={Language.KO}>🇰🇷 KO</option>
                          <option value={Language.ID}>🇮🇩 ID</option>
                          <option value={Language.FA}>🇮🇷 FA</option>
                          <option value={Language.IT}>🇮🇹 IT</option>
                          <option value={Language.PL}>🇵🇱 PL</option>
                          <option value={Language.BN}>🇧🇩 BN</option>
                          <option value={Language.UR}>🇵🇰 UR</option>
                          <option value={Language.VI}>🇻🇳 VI</option>
                          <option value={Language.TH}>🇹🇭 TH</option>
                          <option value={Language.SW}>🇰🇪 SW</option>
                          <option value={Language.HU}>🇭🇺 HU</option>
                          <option value={Language.TA}>🇮🇳 TA</option>
                          <option value={Language.TE}>🇮🇳 TE</option>
                          <option value={Language.TL}>🇵🇭 TL</option>
                          <option value={Language.ML}>🇮🇳 ML</option>
                          <option value={Language.MR}>🇮🇳 MR</option>
                          <option value={Language.KN}>🇮🇳 KN</option>
                          <option value={Language.GU}>🇮🇳 GU</option>
                          <option value={Language.HE}>🇮🇱 HE</option>
                          <option value={Language.NE}>🇳🇵 NE</option>
                          <option value={Language.PRS}>🇦🇫 PRS</option>
                      </select>

                      {/* COINS & TIER */}
                      <div className="flex items-center gap-2">
                           {tier === SubscriptionTier.FREE && (
                               <div className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-2 ${isLight ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300 shadow-sm shadow-amber-200/50' : 'bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border-amber-500/40 shadow-sm shadow-amber-500/20'}`}>
                                    <span className="text-base" style={{ filter: 'drop-shadow(0 0 3px rgba(245,158,11,0.5))' }}>🪙</span>
                                    <span className={`text-base font-extrabold tabular-nums ${isLight ? 'text-amber-700' : 'text-amber-300'}`} style={{ textShadow: isLight ? 'none' : '0 0 8px rgba(245,158,11,0.4)' }}>{credits}</span>
                                    <button onClick={() => setShowCoinShop(true)} aria-label="Buy coins" className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white transition-transform hover:scale-110 ${isLight ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-amber-500 to-amber-700'}`}>+</button>
                               </div>
                           )}
                      </div>
                      <div className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider text-center ${tierInfo.style}`}>
                          {tierInfo.label}
                      </div>
                 </div>
             </div>

             <TrustBanner language={language} onNavigateToScience={() => setView(View.SCIENCE)} />

             {/* Scientific Study Button */}
             <button onClick={() => setView(View.STUDY)}
                 className={`w-full mb-3 p-4 rounded-2xl border flex items-center gap-4 transition-all ${isLight ? 'bg-gradient-to-r from-violet-50 to-fuchsia-50 border-violet-200 hover:shadow-md hover:border-violet-300' : 'bg-gradient-to-r from-violet-900/20 to-fuchsia-900/15 border-white/10 hover:border-violet-500/40 hover:bg-violet-900/30'}`}>
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isLight ? 'bg-violet-100' : 'bg-violet-900/40'}`}>📊</div>
                 <div className="text-left flex-1">
                     <div className={`text-sm font-bold ${isLight ? 'text-violet-900' : 'text-white'}`}>{t.ui.science_study_btn}</div>
                     <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{userProfile.study_participation_level && userProfile.study_participation_level !== 'none' ? `📊 ${(userProfile.study_discount ?? 0) * 100}% ${t.ui.study_discount_active}` : t.ui.study_btn_desc}</div>
                 </div>
                 <span className={`material-icons text-lg ${isLight ? 'text-violet-400' : 'text-violet-500'}`}>chevron_right</span>
             </button>

             {/* Dream Symbol Library Button */}
             <button onClick={() => setView(View.DREAM_SYMBOLS)}
                 className={`w-full mb-5 p-4 rounded-2xl border flex items-center gap-4 transition-all ${isLight ? 'bg-gradient-to-r from-indigo-50 to-fuchsia-50 border-indigo-200 hover:shadow-md hover:border-indigo-300' : 'bg-gradient-to-r from-indigo-900/20 to-fuchsia-900/15 border-white/10 hover:border-indigo-500/40 hover:bg-indigo-900/30'}`}>
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isLight ? 'bg-indigo-100' : 'bg-indigo-900/40'}`}>📚</div>
                 <div className="text-left flex-1">
                     <div className={`text-sm font-bold ${isLight ? 'text-indigo-900' : 'text-white'}`}>{t.ui.symbols_link}</div>
                     <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>877 · Freud · Ibn Sirin</div>
                 </div>
                 <span className={`material-icons text-lg ${isLight ? 'text-indigo-400' : 'text-indigo-500'}`}>chevron_right</span>
             </button>

             <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isLight ? 'text-[#4c1d95]' : 'text-slate-500'}`}>
                 <span className={`w-6 h-[1px] ${isLight ? 'bg-[#7c3aed]' : 'bg-slate-700'}`}></span> {t.ui.choose_tradition}
             </h3>

             <div className="grid grid-cols-3 gap-2.5 mb-5">
                 {CATEGORY_ORDER.map(cat => {
                     const isSelected = selectedCategories.includes(cat);
                     const colorScheme = CATEGORY_COLOR_SCHEME[cat];
                     const tierReq = CATEGORY_TIER_REQUIREMENT[cat];
                     const isLocked = tierReq !== SubscriptionTier.FREE && (userProfile?.subscriptionTier === SubscriptionTier.FREE);
                     let buttonClass = "relative overflow-hidden p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 group ";
                     if (colorScheme === 'emerald') {
                         if (isSelected) { buttonClass += "bg-emerald-900/80 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.5)] scale-[1.02] z-10"; } else { buttonClass += isLight ? "bg-emerald-50 border-emerald-200 shadow-sm shadow-emerald-100 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md" : "bg-emerald-900/20 border-emerald-500/40 hover:bg-emerald-900/40 hover:border-emerald-400/60"; }
                     } else if (colorScheme === 'indigo') {
                         if (isSelected) { buttonClass += "bg-indigo-900/80 border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.5)] scale-[1.02] z-10"; } else { buttonClass += isLight ? "bg-indigo-50 border-indigo-200 shadow-sm shadow-indigo-100 hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-md" : "bg-indigo-900/20 border-indigo-500/40 hover:bg-indigo-900/40 hover:border-indigo-400/60"; }
                     } else if (colorScheme === 'amber') {
                         if (isSelected) { buttonClass += "bg-amber-900/80 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] scale-[1.02] z-10"; } else { buttonClass += isLight ? "bg-amber-50 border-amber-200 shadow-sm shadow-amber-100 hover:bg-amber-100 hover:border-amber-300 hover:shadow-md" : "bg-amber-900/20 border-amber-500/40 hover:bg-amber-900/40 hover:border-amber-400/60"; }
                     } else if (colorScheme === 'rose') {
                         if (isSelected) { buttonClass += "bg-rose-900/80 border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.5)] scale-[1.02] z-10"; } else { buttonClass += isLight ? "bg-rose-50 border-rose-200 shadow-sm shadow-rose-100 hover:bg-rose-100 hover:border-rose-300 hover:shadow-md" : "bg-rose-900/20 border-rose-500/40 hover:bg-rose-900/40 hover:border-rose-400/60"; }
                     } else if (colorScheme === 'stone') {
                         if (isSelected) { buttonClass += "bg-stone-800/80 border-stone-400 shadow-[0_0_25px_rgba(168,162,158,0.5)] scale-[1.02] z-10"; } else { buttonClass += isLight ? "bg-stone-50 border-stone-200 shadow-sm shadow-stone-100 hover:bg-stone-100 hover:border-stone-300 hover:shadow-md" : "bg-stone-900/20 border-stone-500/40 hover:bg-stone-900/40 hover:border-stone-400/60"; }
                     } else {
                         if (isSelected) { buttonClass += "bg-fuchsia-900/60 border-fuchsia-400 shadow-[0_0_25px_rgba(192,38,211,0.5)] scale-[1.02] z-10"; } else { buttonClass += isLight ? "bg-fuchsia-50 border-fuchsia-200 shadow-sm shadow-fuchsia-100 hover:border-fuchsia-300 hover:bg-fuchsia-100 hover:shadow-md" : "bg-slate-800/40 border-white/5 hover:bg-slate-800 hover:border-white/20"; }
                     }
                     // Subtle accent overrides for bottom-row categories (bronze/burgundy/gold border+glow)
                     const accent = CATEGORY_ACCENT[cat];
                     if (accent) {
                         if (isSelected) {
                             buttonClass = buttonClass.replace(/border-indigo-400/, isLight ? accent.borderLight : accent.borderDark).replace(/shadow-\[0_0_25px_rgba\(99,102,241,0\.5\)\]/, accent.glowSelected);
                         } else {
                             buttonClass = buttonClass.replace(/border-indigo-500\/40/, accent.borderDark).replace(/hover:border-indigo-400\/60/, accent.glowHoverDark);
                             if (isLight) { buttonClass = buttonClass.replace(/border-indigo-200/, accent.borderLight).replace(/hover:border-indigo-300/, accent.glowHoverLight); }
                         }
                     }
                     let textClass = "";
                     if (colorScheme === 'emerald') { textClass = isSelected ? 'text-emerald-100' : (isLight ? 'text-emerald-700' : 'text-emerald-400'); }
                     else if (colorScheme === 'indigo') { textClass = isSelected ? 'text-indigo-100' : (isLight ? 'text-indigo-700' : 'text-indigo-400'); }
                     else { textClass = isSelected ? 'text-white' : (isLight ? 'text-fuchsia-900' : 'text-slate-500'); }
                     return (
                         <button key={cat} onClick={() => isLocked ? undefined : toggleCategory(cat)} className={buttonClass + (isLocked ? ' opacity-60' : '')}>
                             {isSelected && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50"></div>}
                             {isLocked && <span className="absolute top-1 right-1 text-[9px] font-bold bg-black/40 text-white px-1.5 py-0.5 rounded-full">PRO</span>}
                             <span className={`text-3xl filter drop-shadow-lg transition-transform group-hover:scale-110 grayscale-0`}>
                                {CATEGORY_ICONS[cat]}
                             </span>
                             <span className={`text-[10px] font-bold uppercase tracking-wider leading-tight text-center ${textClass}`}>{t.categories[cat]}</span>
                         </button>
                     );
                 })}
             </div>

             {/* FEATURE PILLS */}
             <div className="flex justify-center gap-2 mb-5">
                 <button onClick={() => setShowCosmicDna(true)} className={`flex-1 max-w-[140px] py-2.5 px-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${isLight ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}>
                     <span className={`material-icons text-lg ${isLight ? 'text-indigo-500' : 'text-indigo-400'}`}>fingerprint</span>
                     <span className={`text-[10px] font-bold uppercase leading-tight ${isLight ? 'text-indigo-700' : 'text-slate-300'}`}>{t.ui.cosmic_dna}</span>
                 </button>
                 <button onClick={() => setShowMoonSync(true)} className={`flex-1 max-w-[140px] py-2.5 px-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${isLight ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}>
                     <span className={`material-icons text-lg ${isLight ? 'text-purple-500' : 'text-purple-400'}`}>nightlight</span>
                     <span className={`text-[10px] font-bold uppercase leading-tight ${isLight ? 'text-purple-700' : 'text-slate-300'}`}>{t.ui.moon_sync}</span>
                 </button>
                 <button onClick={handleSaveCategories} className={`flex-1 max-w-[140px] py-2.5 px-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${isLight ? 'bg-pink-50 border-pink-200 hover:bg-pink-100' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}>
                     <span className={`material-icons text-lg ${isLight ? 'text-pink-500' : 'text-pink-400'}`}>bookmark</span>
                     <span className={`text-[10px] font-bold uppercase leading-tight ${isLight ? 'text-pink-700' : 'text-slate-300'}`}>{t.ui.save_btn}</span>
                 </button>
             </div>

             {selectedCategories.length > 0 && (
                 <div className="mb-8">
                     <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${isLight ? 'text-[#4c1d95]' : 'text-slate-400'}`}>
                        <span className={`w-8 h-[1px] ${isLight ? 'bg-[#7c3aed]' : 'bg-slate-600'}`}></span> {t.ui.refine_sources}
                     </h3>
                     {selectedCategories.length >= 1 && (
                         <p className={`text-center text-[11px] mb-2 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                             {t.ui.showing_sources_only?.replace('{0}', selectedCategories.map(c => t.categories[c]).join(', ')) || `${selectedCategories.map(c => t.categories[c]).join(', ')} — filtered`}
                         </p>
                     )}
                     <div className="grid grid-cols-2 gap-2">
                         {getAvailableSources().map(src => {
                             const active = selectedSources.includes(src);
                             return (
                                 <button key={src} onClick={() => toggleSource(src)} className={`h-12 px-3 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${active ? 'bg-indigo-600/90 backdrop-blur-md border-indigo-400/60 text-white shadow-lg shadow-indigo-500/30' : (isLight ? 'bg-white/70 backdrop-blur-md border-slate-200/60 text-slate-600 hover:bg-indigo-50/80 hover:border-indigo-200/60' : 'bg-white/5 backdrop-blur-md border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20')}`}>
                                     <div className="flex flex-col min-w-0">
                                         <span className="text-[11px] font-bold leading-tight block truncate">{t.sources[src]}</span>
                                         <span className={`text-[9px] uppercase font-bold tracking-wide block leading-tight mt-0.5 truncate ${active ? 'text-indigo-200' : 'text-slate-500'}`}>{t.source_subtitles[src]}</span>
                                     </div>
                                     <div onClick={(e) => { e.stopPropagation(); handleInfoClick(src); }} className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ms-1 z-20 active:scale-95 transition-all ${active ? 'bg-white/20 hover:bg-white/40 text-white' : 'bg-black/10 hover:bg-black/20 text-slate-400'}`}>
                                         <span className="text-[10px] font-serif italic font-bold">i</span>
                                     </div>
                                 </button>
                             );
                         })}
                     </div>
                 </div>
             )}
             
             <div className={`${appBgInput} rounded-2xl p-1 mb-4 relative group border transition-all`}>
                  <textarea
                      value={dreamInput}
                      onChange={(e) => setDreamInput(e.target.value)}
                      placeholder={t.ui.placeholder}
                      className={`w-full bg-transparent p-4 text-base resize-none outline-none font-serif leading-relaxed transition-all ${isLight ? 'text-[#2a1a3a] placeholder-[#8b7aa0]' : 'text-white placeholder-slate-600'}`}
                      style={{ minHeight: '80px', maxHeight: '200px', overflowY: dreamInput.length > 200 ? 'auto' : 'hidden' }}
                      onInput={(e) => {
                          const el = e.currentTarget;
                          el.style.height = '80px';
                          el.style.height = Math.min(el.scrollHeight, 200) + 'px';
                      }}
                  />
                  <div className="flex justify-end items-center px-3 pb-3">
                      <div className={`text-[10px] font-mono ${isLight ? 'text-[#6b5a80]' : 'text-slate-600'}`}>{dreamInput.length}</div>
                  </div>
             </div>

             {/* ACTION BUTTONS — side by side */}
             <div className="flex gap-2 mb-4">
                 <button onClick={() => handleAnalyze()} disabled={loading || !dreamInput} className={`relative flex-[2] py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all ${loading || !dreamInput ? (isLight ? 'bg-[#c4bce6]/50 text-[#6b5a80] cursor-not-allowed' : 'bg-slate-800/40 text-slate-600 cursor-not-allowed') : noCredits ? 'bg-slate-800/60 backdrop-blur-md border border-slate-600/40 text-slate-400' : (isLight ? 'bg-gradient-to-r from-[#4c1d95] to-[#7c3aed] text-white shadow-lg shadow-violet-500/40 hover:shadow-xl hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98]' : 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-violet-500 text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-xl hover:shadow-fuchsia-500/50 hover:scale-[1.02] active:scale-[0.98]')}`}>
                     {loading ? (<span className="flex items-center justify-center gap-3">{t.processing.title}</span>) : noCredits ? (<span className="flex items-center justify-center gap-2"><span className="material-icons">lock</span> {t.ui.interpret} (0 {t.ui.coins || 'Credits'})</span>) : (<span className="flex items-center justify-center gap-2"><span className="material-icons">auto_awesome</span> {t.ui.interpret}</span>)}
                 </button>
                 <button onClick={() => { setView(View.VIDEO_STUDIO); }} className={`flex-1 py-4 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 border ${isLight ? 'bg-violet-50 border-violet-300 text-violet-700 hover:bg-violet-100 hover:scale-[1.02] active:scale-[0.98]' : 'bg-violet-900/20 border-violet-500/30 text-violet-300 hover:bg-violet-900/40 hover:scale-[1.02] active:scale-[0.98]'}`}>
                     <span className="material-icons text-base">movie_creation</span> {t.ui.create_dream_video}
                 </button>
             </div>

             {lastInterpretation && lastSavedDreamId && (
                  <button onClick={() => handleOpenVideoStudio(dreams.find(d => d.id === lastSavedDreamId)?.description || '', lastInterpretation, lastSavedDreamId)} className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border mb-4 ${isLight ? 'bg-gradient-to-r from-violet-100 to-fuchsia-100 border-violet-300 text-violet-700 hover:from-violet-200 hover:to-fuchsia-200' : 'bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 border-violet-500/30 text-violet-200 hover:bg-violet-800/40'}`}>
                     <span className="material-icons">movie_filter</span> {t.ui.generate_video}
                  </button>
             )}

             {/* SECONDARY ACTIONS */}
             <div className="grid grid-cols-2 gap-2.5 mb-4">
                 <button
                    onClick={() => setView(View.DREAM_MAP)}
                    className={`relative py-3 rounded-xl overflow-hidden border group transition-all ${isLight ? 'bg-gradient-to-r from-indigo-50 to-white border-indigo-200' : 'border-indigo-500/20 bg-indigo-950/30 hover:border-indigo-400/40'}`}
                 >
                     <span className={`relative z-10 flex items-center justify-center gap-2 font-bold text-xs tracking-wider uppercase ${isLight ? 'text-indigo-600' : 'text-cyan-200'}`}>
                         <span className="material-icons text-base text-yellow-400">hub</span> {t.ui.map_btn}
                     </span>
                 </button>

                 <button onClick={() => setShowCalendar(true)} className={`py-3 border rounded-xl transition-all flex items-center justify-center gap-2 group ${isLight ? 'bg-white/70 border-indigo-200/40 hover:border-fuchsia-300/60' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                     <span className={`material-icons text-base ${isLight ? 'text-fuchsia-600' : 'text-fuchsia-400'}`}>calendar_month</span>
                     <span className={`text-xs font-bold ${isLight ? 'text-indigo-900' : 'text-slate-300'}`}>{t.ui.calendar_btn}</span>
                 </button>
             </div>

             {showSavedMessage && (
                 <div className="bg-green-900/80 border border-green-500/50 text-green-200 p-4 rounded-xl text-center mb-6  slide-in-from-top-2 shadow-lg">
                     <span className="material-icons text-xl align-middle me-2">verified</span>
                     <span className="text-lg font-bold font-mystic">{t.ui.saved_msg}</span>
                 </div>
             )}

             <div className="grid grid-cols-2 gap-2.5 mb-3">
                 <button onClick={() => setShowCoinShop(true)} className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${isLight ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-amber-900/30 hover:bg-amber-800/40 text-amber-200 border-amber-500/20'}`}>
                     <span className={`material-icons text-base ${isLight ? 'text-amber-500' : 'text-amber-400'}`}>storefront</span> {t.shop.title}
                 </button>

                 <button onClick={() => setShowSubModal(true)} className={`py-3 border rounded-xl transition-all flex items-center justify-center gap-2 group ${isLight ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-yellow-200 hover:border-yellow-300' : 'bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border-amber-500/20 hover:border-amber-500/40'}`}>
                     <span className={`material-icons text-base ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>diamond</span>
                     <span className={`text-xs font-bold ${isLight ? 'text-amber-800' : 'text-amber-200'}`}>{t.ui.premium_btn}</span>
                 </button>
             </div>

             <button onClick={() => setShowOnboarding(true)} className={`w-full py-2.5 border rounded-xl flex items-center justify-center gap-2 group transition-all ${isLight ? 'bg-white/70 border-indigo-200/40 hover:border-violet-300/60' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-violet-500/30'}`}>
                 <span className={`material-icons text-base transition-colors ${isLight ? 'text-violet-500' : 'text-violet-400'}`}>assignment_ind</span>
                 <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-indigo-900' : 'text-slate-400'}`}>{t.ui.customer_file_btn}</span>
             </button>
        </div>
        );
    };

    return (
        <ErrorBoundary>
        <React.Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0b1a', color: '#7c3aed', fontFamily: 'Cinzel, serif', fontSize: '1.2rem' }}>DreamCode...</div>}>
        <div dir={(language.startsWith('ar') || [Language.FA, Language.UR, Language.HE, Language.PRS].includes(language)) ? 'rtl' : 'ltr'} style={{ backgroundColor: isLight ? '#f0eefc' : '#0f0b1a' }} className={`min-h-screen font-sans relative overflow-x-hidden transition-colors duration-700 ${isLight ? 'text-mystic-text selection:bg-accent-primary/30' : 'text-slate-200 selection:bg-accent-primary/30'}`}>
            <StarryBackground themeMode={themeMode} designTheme={designTheme} />
            
            {loading && <ProcessingOverlay isLight={isLight} steps={processingSteps} categories={selectedCategories} sources={selectedSources} t={t} />}
            {isVideoLoading && <VideoLoadingOverlay t={t} />}
            {isAdPlaying && <AdOverlay t={t} duration={adDuration} />}
            {showSubModal && <SubscriptionModal onClose={() => setShowSubModal(false)} t={t} isLight={isLight} userProfile={userProfile} onUpdateSubscription={handleUpdateSubscription} language={language} regionInfo={regionInfo} />}
            {showEarnModal && <EarnCoinsModal onClose={() => setShowEarnModal(false)} t={t} isLight={isLight} onWatch={triggerAd} />}
            {showCoinShop && <CoinShopModal onClose={() => setShowCoinShop(false)} t={t} isLight={isLight} onPurchase={handleCoinPurchase} onEarnFree={() => { setShowCoinShop(false); setShowEarnModal(true); }} />}
            {showSettings && (
                <SettingsModal 
                    onClose={() => setShowSettings(false)}
                    t={t}
                    isLight={isLight}
                    apiKeyInput={apiKeyInput}
                    setApiKeyInput={setApiKeyInput}
                    handleAddApiKey={handleAddApiKey}
                    handleRemoveApiKey={handleRemoveApiKey}
                    userProfile={userProfile}
                    themeMode={themeMode}
                    handleThemeUpdate={handleThemeUpdate}
                    designTheme={designTheme}
                    handleExport={handleExportData}
                    handleImport={handleImportData}
                    language={language}
                    onLanguageChange={setLanguage}
                    onVoiceChange={(character: VoiceCharacter) => {
                        localStorage.setItem('dreamcode_selected_voice', JSON.stringify({ id: character.id }));
                    }}
                    currentVoiceId={(() => { try { const s = localStorage.getItem('dreamcode_selected_voice'); return s ? JSON.parse(s).id : undefined; } catch { return undefined; } })()}
                />
            )}
            {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} data={infoModalData} t={t} isLight={isLight} />}

            {/* COSMIC DNA MODAL */}
            {showCosmicDna && <CosmicDnaModal isLight={isLight} onClose={() => setShowCosmicDna(false)} t={t} />}

            {/* MOON SYNC MODAL */}
            {showMoonSync && (() => {
                const now = new Date();
                const synodicMonth = 29.53059;
                const knownNewMoon = new Date('2000-01-06T18:14:00Z');
                const daysSinceNew = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
                const moonAge = ((daysSinceNew % synodicMonth) + synodicMonth) % synodicMonth;
                const moonPhaseIdx = Math.floor((moonAge / synodicMonth) * 8) % 8;
                const moonEmojis = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
                const moonPhaseNames: Record<string, string[]> = {
                    [Language.DE]: ['Neumond', 'Zunehmender Sichelmond', 'Erstes Viertel', 'Zunehmender Mond', 'Vollmond', 'Abnehmender Mond', 'Letztes Viertel', 'Abnehmender Sichelmond'],
                    [Language.EN]: ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'],
                    [Language.TR]: ['Yeni Ay', 'Hilal', 'İlk Dördün', 'Şişkin Ay', 'Dolunay', 'Küçülen Ay', 'Son Dördün', 'Küçülen Hilal'],
                    [Language.ES]: ['Luna Nueva', 'Creciente', 'Cuarto Creciente', 'Gibosa Creciente', 'Luna Llena', 'Gibosa Menguante', 'Cuarto Menguante', 'Menguante'],
                    [Language.FR]: ['Nouvelle Lune', 'Croissant', 'Premier Quartier', 'Gibbeuse Croissante', 'Pleine Lune', 'Gibbeuse Décroissante', 'Dernier Quartier', 'Décroissant'],
                    [Language.AR]: ['محاق', 'هلال متزايد', 'تربيع أول', 'أحدب متزايد', 'بدر', 'أحدب متناقص', 'تربيع أخير', 'هلال متناقص'],
                    [Language.PT]: ['Lua Nova', 'Crescente', 'Quarto Crescente', 'Gibosa Crescente', 'Lua Cheia', 'Gibosa Minguante', 'Quarto Minguante', 'Minguante'],
                    [Language.RU]: ['Новолуние', 'Растущий серп', 'Первая четверть', 'Растущая луна', 'Полнолуние', 'Убывающая луна', 'Последняя четверть', 'Убывающий серп'],
                    [Language.ZH]: ['新月', '峨眉月', '上弦月', '盈凸月', '满月', '亏凸月', '下弦月', '残月'],
                    [Language.HI]: ['अमावस्या', 'बढ़ता चाँद', 'प्रथम तिमाही', 'पूर्ण बढ़ता', 'पूर्णिमा', 'घटता पूर्ण', 'अंतिम तिमाही', 'घटता चाँद'],
                    [Language.JA]: ['新月', '三日月', '上弦の月', '十三夜月', '満月', '寝待月', '下弦の月', '二十六夜月'],
                    [Language.KO]: ['삭', '초승달', '상현달', '상현망간', '보름달', '하현망간', '하현달', '그믐달'],
                    [Language.ID]: ['Bulan Baru', 'Bulan Sabit Muda', 'Kuartal Pertama', 'Cembung Muda', 'Bulan Purnama', 'Cembung Tua', 'Kuartal Terakhir', 'Bulan Sabit Tua'],
                    [Language.FA]: ['ماه نو', 'هلال در حال رشد', 'ربع اول', 'محدب در حال رشد', 'ماه کامل', 'محدب در حال کاهش', 'ربع آخر', 'هلال در حال کاهش'],
                    [Language.IT]: ['Luna Nuova', 'Crescente', 'Primo Quarto', 'Gibbosa Crescente', 'Luna Piena', 'Gibbosa Calante', 'Ultimo Quarto', 'Calante'],
                    [Language.PL]: ['Nów', 'Przybywający Sierp', 'Pierwsza Kwadra', 'Przybywający Garb', 'Pełnia', 'Ubywający Garb', 'Ostatnia Kwadra', 'Ubywający Sierp'],
                    [Language.BN]: ['অমাবস্যা', 'বাড়ন্ত চাঁদ', 'প্রথম ত্রৈমাসিক', 'পূর্ণ বাড়ন্ত', 'পূর্ণিমা', 'কমন্ত পূর্ণ', 'শেষ ত্রৈমাসিক', 'কমন্ত চাঁদ'],
                    [Language.UR]: ['نیا چاند', 'بڑھتا ہلال', 'پہلی سہ ماہی', 'بڑھتا پورا', 'پورا چاند', 'گھٹتا پورا', 'آخری سہ ماہی', 'گھٹتا ہلال'],
                    [Language.VI]: ['Trăng Mới', 'Trăng Lưỡi Liềm Tăng', 'Trăng Bán Nguyệt Đầu', 'Trăng Khuyết Tăng', 'Trăng Tròn', 'Trăng Khuyết Giảm', 'Trăng Bán Nguyệt Cuối', 'Trăng Lưỡi Liềm Giảm'],
                    [Language.TH]: ['ดับ', 'ขึ้น 3 ค่ำ', 'ขึ้น 8 ค่ำ', 'ขึ้น 13 ค่ำ', 'เพ็ญ', 'แรม 3 ค่ำ', 'แรม 8 ค่ำ', 'แรม 13 ค่ำ'],
                    [Language.SW]: ['Mwezi Mpya', 'Mwandamo', 'Robo ya Kwanza', 'Mwezi Mkubwa Unaokua', 'Mwezi Mzima', 'Mwezi Mkubwa Unaopungua', 'Robo ya Mwisho', 'Mwandamo Unaopungua'],
                    [Language.HU]: ['Újhold', 'Növekvő Sarló', 'Első Negyed', 'Növekvő Púpos', 'Telihold', 'Fogyó Púpos', 'Utolsó Negyed', 'Fogyó Sarló'],
                };
                const phaseName = (moonPhaseNames[language] || moonPhaseNames[Language.EN])[moonPhaseIdx];
                const dreamMeaningMap: Record<string, string[]> = {
                    [Language.DE]: ['Neuanfänge. Ideale Nacht für Intention-Setting.', 'Wachstum. Träume zeigen aufkeimende Ideen.', 'Entscheidungen. Träume konfrontieren mit Wahlmöglichkeiten.', 'Klarheit. Träume werden lebhafter und detailreicher.', 'Höhepunkt. Intensivste Traumphase — starke Symbole und Emotionen.', 'Loslassen. Träume verarbeiten Vergangenes.', 'Reflexion. Träume zeigen innere Konflikte.', 'Stille. Träume werden leiser — Zeit für Integration.'],
                    [Language.EN]: ['New beginnings. Ideal night for intention-setting.', 'Growth. Dreams reveal emerging ideas.', 'Decisions. Dreams confront you with choices.', 'Clarity. Dreams become more vivid and detailed.', 'Peak. Most intense dream phase — strong symbols and emotions.', 'Release. Dreams process the past.', 'Reflection. Dreams reveal inner conflicts.', 'Stillness. Dreams grow quieter — time for integration.'],
                    [Language.TR]: ['Yeni başlangıçlar. Niyet belirleme için ideal gece.', 'Büyüme. Rüyalar filizlenen fikirleri ortaya çıkarır.', 'Kararlar. Rüyalar sizi seçimlerle yüzleştirir.', 'Netlik. Rüyalar daha canlı ve ayrıntılı hale gelir.', 'Zirve. En yoğun rüya evresi — güçlü semboller ve duygular.', 'Bırakma. Rüyalar geçmişi işler.', 'Yansıma. Rüyalar iç çatışmaları ortaya çıkarır.', 'Sessizlik. Rüyalar sakinleşir — entegrasyon zamanı.'],
                    [Language.ES]: ['Nuevos comienzos. Noche ideal para establecer intenciones.', 'Crecimiento. Los sueños revelan ideas emergentes.', 'Decisiones. Los sueños te confrontan con elecciones.', 'Claridad. Los sueños se vuelven más vívidos y detallados.', 'Apogeo. Fase de sueños más intensa — fuertes símbolos y emociones.', 'Liberación. Los sueños procesan el pasado.', 'Reflexión. Los sueños revelan conflictos internos.', 'Quietud. Los sueños se calman — tiempo de integración.'],
                    [Language.FR]: ['Nouveaux départs. Nuit idéale pour définir des intentions.', 'Croissance. Les rêves révèlent des idées émergentes.', 'Décisions. Les rêves vous confrontent à des choix.', 'Clarté. Les rêves deviennent plus vifs et détaillés.', 'Sommet. Phase de rêves la plus intense — forts symboles et émotions.', 'Libération. Les rêves traitent le passé.', 'Réflexion. Les rêves révèlent des conflits intérieurs.', 'Silence. Les rêves s\'apaisent — temps d\'intégration.'],
                    [Language.AR]: ['بدايات جديدة. ليلة مثالية لتحديد النوايا.', 'النمو. تكشف الأحلام عن أفكار ناشئة.', 'القرارات. تواجهك الأحلام بالخيارات.', 'الوضوح. تصبح الأحلام أكثر حيوية وتفصيلاً.', 'الذروة. أكثر مراحل الأحلام كثافة — رموز وعواطف قوية.', 'التحرر. تعالج الأحلام الماضي.', 'التأمل. تكشف الأحلام عن الصراعات الداخلية.', 'الهدوء. تهدأ الأحلام — وقت للتكامل.'],
                    [Language.PT]: ['Novos começos. Noite ideal para definir intenções.', 'Crescimento. Os sonhos revelam ideias emergentes.', 'Decisões. Os sonhos confrontam você com escolhas.', 'Clareza. Os sonhos ficam mais vívidos e detalhados.', 'Auge. Fase de sonhos mais intensa — símbolos e emoções fortes.', 'Liberação. Os sonhos processam o passado.', 'Reflexão. Os sonhos revelam conflitos internos.', 'Quietude. Os sonhos ficam mais silenciosos — tempo de integração.'],
                    [Language.RU]: ['Новые начала. Идеальная ночь для постановки намерений.', 'Рост. Сны раскрывают зарождающиеся идеи.', 'Решения. Сны сталкивают вас с выборами.', 'Ясность. Сны становятся более яркими и детальными.', 'Пик. Самая интенсивная фаза снов — сильные символы и эмоции.', 'Отпускание. Сны обрабатывают прошлое.', 'Рефлексия. Сны раскрывают внутренние конфликты.', 'Тишина. Сны становятся тише — время для интеграции.'],
                    [Language.ZH]: ['新的开始。设定意图的理想之夜。', '成长。梦境揭示新兴想法。', '决策。梦境让你面对选择。', '清晰。梦境变得更加生动详细。', '高峰。最强烈的梦境阶段——强烈的象征和情感。', '释放。梦境处理过去。', '反思。梦境揭示内心冲突。', '宁静。梦境变得平静——整合时间。'],
                    [Language.HI]: ['नई शुरुआत। इरादे तय करने की आदर्श रात।', 'विकास। सपने उभरते विचारों को प्रकट करते हैं।', 'निर्णय। सपने आपको विकल्पों का सामना कराते हैं।', 'स्पष्टता। सपने अधिक जीवंत और विस्तृत होते हैं।', 'शिखर। सबसे तीव्र स्वप्न चरण — मजबूत प्रतीक और भावनाएं।', 'मुक्ति। सपने अतीत को संसाधित करते हैं।', 'प्रतिबिंब। सपने आंतरिक संघर्षों को प्रकट करते हैं।', 'शांति। सपने शांत होते हैं — एकीकरण का समय।'],
                    [Language.JA]: ['新しい始まり。意図を設定するのに理想的な夜。', '成長。夢は芽生えるアイデアを明らかにします。', '決断。夢はあなたを選択と向き合わせます。', '明晰さ。夢はより鮮明で詳細になります。', 'ピーク。最も強烈な夢のフェーズ — 強い象徴と感情。', '解放。夢は過去を処理します。', '内省。夢は内なる葛藤を明らかにします。', '静寂。夢は静かになります — 統合の時間。'],
                    [Language.KO]: ['새로운 시작. 의도 설정에 이상적인 밤.', '성장. 꿈은 새로운 아이디어를 드러냅니다.', '결정. 꿈은 선택과 대면하게 합니다.', '명료함. 꿈이 더 생생하고 상세해집니다.', '절정. 가장 강렬한 꿈의 단계 — 강한 상징과 감정.', '해방. 꿈은 과거를 처리합니다.', '성찰. 꿈은 내면의 갈등을 드러냅니다.', '고요. 꿈이 조용해집니다 — 통합의 시간.'],
                    [Language.ID]: ['Awal baru. Malam ideal untuk menetapkan niat.', 'Pertumbuhan. Mimpi mengungkapkan ide-ide baru.', 'Keputusan. Mimpi menghadapkan Anda dengan pilihan.', 'Kejelasan. Mimpi menjadi lebih jelas dan terperinci.', 'Puncak. Fase mimpi paling intens — simbol dan emosi yang kuat.', 'Pelepasan. Mimpi memproses masa lalu.', 'Refleksi. Mimpi mengungkapkan konflik internal.', 'Ketenangan. Mimpi menjadi lebih tenang — waktu integrasi.'],
                    [Language.FA]: ['آغازهای جدید. شب ایده‌آل برای تعیین نیت.', 'رشد. رویاها ایده‌های نوپدید را آشکار می‌کنند.', 'تصمیم‌ها. رویاها شما را با انتخاب‌ها مواجه می‌کنند.', 'وضوح. رویاها زنده‌تر و مفصل‌تر می‌شوند.', 'اوج. شدیدترین مرحله رویا — نمادها و احساسات قوی.', 'رهایی. رویاها گذشته را پردازش می‌کنند.', 'بازتاب. رویاها تعارضات درونی را آشکار می‌کنند.', 'آرامش. رویاها آرام‌تر می‌شوند — زمان یکپارچه‌سازی.'],
                    [Language.IT]: ['Nuovi inizi. Notte ideale per fissare intenzioni.', 'Crescita. I sogni rivelano idee emergenti.', 'Decisioni. I sogni ti confrontano con le scelte.', 'Chiarezza. I sogni diventano più vividi e dettagliati.', 'Apice. La fase onirica più intensa — forti simboli ed emozioni.', 'Liberazione. I sogni elaborano il passato.', 'Riflessione. I sogni rivelano conflitti interiori.', 'Quiete. I sogni si calmano — tempo di integrazione.'],
                    [Language.PL]: ['Nowe początki. Idealna noc do ustalania intencji.', 'Wzrost. Sny ujawniają kiełkujące pomysły.', 'Decyzje. Sny konfrontują cię z wyborami.', 'Jasność. Sny stają się bardziej żywe i szczegółowe.', 'Szczyt. Najbardziej intensywna faza snów — silne symbole i emocje.', 'Uwolnienie. Sny przetwarzają przeszłość.', 'Refleksja. Sny ujawniają wewnętrzne konflikty.', 'Cisza. Sny stają się cichsze — czas integracji.'],
                    [Language.BN]: ['নতুন শুরু। উদ্দেশ্য নির্ধারণের আদর্শ রাত।', 'বিকাশ। স্বপ্ন উদীয়মান ধারণা প্রকাশ করে।', 'সিদ্ধান্ত। স্বপ্ন আপনাকে পছন্দের মুখোমুখি করে।', 'স্পষ্টতা। স্বপ্ন আরও জীবন্ত ও বিস্তারিত হয়।', 'শীর্ষ। সবচেয়ে তীব্র স্বপ্ন পর্যায় — শক্তিশালী প্রতীক ও আবেগ।', 'মুক্তি। স্বপ্ন অতীত প্রক্রিয়া করে।', 'প্রতিফলন। স্বপ্ন অভ্যন্তরীণ দ্বন্দ্ব প্রকাশ করে।', 'নিস্তব্ধতা। স্বপ্ন শান্ত হয় — একীভূতকরণের সময়।'],
                    [Language.UR]: ['نئی شروعات۔ نیت طے کرنے کی مثالی رات۔', 'ترقی۔ خواب ابھرتے خیالات ظاہر کرتے ہیں۔', 'فیصلے۔ خواب آپ کو انتخاب کا سامنا کراتے ہیں۔', 'وضاحت۔ خواب زیادہ واضح اور تفصیلی ہو جاتے ہیں۔', 'عروج۔ سب سے شدید خواب کا مرحلہ — مضبوط علامات اور جذبات۔', 'آزادی۔ خواب ماضی کو پروسیس کرتے ہیں۔', 'عکاسی۔ خواب اندرونی تنازعات ظاہر کرتے ہیں۔', 'خاموشی۔ خواب پرسکون ہو جاتے ہیں — انضمام کا وقت۔'],
                    [Language.VI]: ['Khởi đầu mới. Đêm lý tưởng để đặt ý định.', 'Tăng trưởng. Giấc mơ tiết lộ ý tưởng mới nảy sinh.', 'Quyết định. Giấc mơ đối mặt bạn với những lựa chọn.', 'Rõ ràng. Giấc mơ trở nên sống động và chi tiết hơn.', 'Đỉnh cao. Giai đoạn giấc mơ mãnh liệt nhất — biểu tượng và cảm xúc mạnh mẽ.', 'Giải phóng. Giấc mơ xử lý quá khứ.', 'Phản ánh. Giấc mơ tiết lộ xung đột nội tâm.', 'Tĩnh lặng. Giấc mơ trở nên yên tĩnh hơn — thời gian tích hợp.'],
                    [Language.TH]: ['การเริ่มต้นใหม่ คืนที่เหมาะสำหรับการตั้งเจตนา', 'การเติบโต ความฝันเผยให้เห็นแนวคิดใหม่', 'การตัดสินใจ ความฝันเผชิญหน้าคุณกับทางเลือก', 'ความชัดเจน ความฝันกลายเป็นสิ่งที่ชัดเจนและละเอียดมากขึ้น', 'จุดสูงสุด ช่วงความฝันที่เข้มข้นที่สุด — สัญลักษณ์และอารมณ์ที่แข็งแกร่ง', 'การปลดปล่อย ความฝันประมวลผลอดีต', 'การสะท้อน ความฝันเผยให้เห็นความขัดแย้งภายใน', 'ความสงบ ความฝันเงียบลง — เวลาแห่งการบูรณาการ'],
                    [Language.SW]: ['Mwanzo mpya. Usiku mzuri wa kuweka nia.', 'Ukuaji. Ndoto zinafunua mawazo yanayoibuka.', 'Maamuzi. Ndoto zinakukabili na chaguo.', 'Uwazi. Ndoto zinakuwa za kina na za kina zaidi.', 'Kilele. Awamu ya ndoto yenye nguvu zaidi — ishara na hisia kali.', 'Kutolewa. Ndoto zinashughulikia yaliyopita.', 'Kutafakari. Ndoto zinafunua migogoro ya ndani.', 'Utulivu. Ndoto zinatulia — wakati wa muunganiko.'],
                    [Language.HU]: ['Új kezdetek. Ideális éjszaka szándékok kitűzéséhez.', 'Növekedés. Az álmok felszínre hozzák az újonnan születő ötleteket.', 'Döntések. Az álmok szembesítenek a választásokkal.', 'Tisztánlátás. Az álmok élénkebbek és részletesebbek lesznek.', 'Csúcspont. A legalapvetőbb álomfázis — erős szimbólumok és érzelmek.', 'Elengedés. Az álmok feldolgozzák a múltat.', 'Reflexió. Az álmok belső konfliktusokat tárnak fel.', 'Csend. Az álmok elcsendesednek — az integráció ideje.'],
                };
                const dreamMeaning = (dreamMeaningMap[language] || dreamMeaningMap[Language.EN])[moonPhaseIdx];
                return (
                    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowMoonSync(false)}>
                        <div className={`w-[95%] max-w-md ${isLight ? 'bg-white/95 border-purple-100/60' : 'bg-dream-surface/95 border-fuchsia-500/20'} backdrop-blur-md border rounded-2xl shadow-2xl overflow-hidden`} onClick={e => e.stopPropagation()}>
                            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 p-6 text-center">
                                <span className="text-5xl">{moonEmojis[moonPhaseIdx]}</span>
                                <h2 className="text-xl font-bold text-white mt-2">{t.ui.moon_sync}</h2>
                                <p className="text-purple-200 text-sm mt-1">{phaseName}</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className={`p-4 rounded-xl border ${isLight ? 'bg-purple-50 border-purple-200' : 'bg-purple-900/20 border-purple-500/30'}`}>
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>
                                        {t.ui.dream_meaning_today}
                                    </p>
                                    <p className={`text-sm leading-relaxed ${isLight ? 'text-purple-800' : 'text-purple-200'}`}>{dreamMeaning}</p>
                                </div>
                                <p className={`text-xs text-center ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {t.ui.moon_phase_label}: {Math.floor(moonAge)} / {Math.floor(synodicMonth)}
                                </p>
                            </div>
                            <div className="p-4 pt-0">
                                <button onClick={() => setShowMoonSync(false)} className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-bold text-sm shadow-lg">{t.ui.close}</button>
                            </div>
                        </div>
                    </div>
                );
            })()}
            <SpeechToVideoModal
                open={showSpeechModal}
                initialText={dreamInput}
                language={language}
                themeMode={themeMode}
                onClose={() => setShowSpeechModal(false)}
                onContinue={(finalText) => {
                    setDreamInput(finalText);
                    setShowSpeechModal(false);
                    setView(View.VIDEO_STUDIO);
                }}
            />
            {showVideoModal && <VideoResultModal onClose={() => setShowVideoModal(false)} url={videoUrl} t={t} isLight={isLight} />}
            {showImageModal && <ImageResultModal onClose={() => setShowImageModal(false)} url={imageUrl} t={t} isLight={isLight} />}
            {showStyleSelection && <StyleSelectionModal onSelect={continueWithImageGeneration} t={t} isLight={isLight} />}

                {view === View.VIDEO_STUDIO && (
                    <VideoStudio
                        language={language}
                        themeMode={themeMode}
                        dreamText={dreamInput}
                        interpretationText={videoStudioInterpretation}
                        dreamId={videoStudioDreamId}
                        initialMode={videoStudioInterpretation ? 'choose' : undefined}
                        onClose={() => { setVideoStudioDreamId(null); setVideoStudioInterpretation(''); setView(View.HOME); }}
                        onGenerate={async (text, options) => {
                            const log = (_msg: string, _pct: number) => {};
                            try {
                                let result;
                                let audioBase64ForSave: string | undefined;

                                // ── Helper: Blob → Base64 ──
                                const blobToB64 = (blob: Blob): Promise<string> =>
                                    new Promise((resolve, reject) => {
                                        const r = new FileReader();
                                        r.onloadend = () => resolve(r.result as string);
                                        r.onerror = reject;
                                        r.readAsDataURL(blob);
                                    });

                                const cm = options.contentMode;
                                const isUserVoice = options.voiceMode === 'user_voice' && !!options.voiceBlob;
                                const videoStyle = (options.style || 'dreamlike') as any;

                                // Analyse einmal ausfuehren und cachen (Skip wenn bereits vorhanden)
                                let interpretationText = '';
                                if (cm !== 'dream_only') {
                                    if (videoStudioInterpretation) {
                                        interpretationText = videoStudioInterpretation;
                                    } else {
                                        const analysis = await analyzeDreamText(text, language, userProfile, selectedCategories, selectedSources);
                                        if (!analysis?.interpretation) { console.error('[VideoStudio] Analyse fehlgeschlagen'); return null; }
                                        interpretationText = analysis.interpretation;
                                    }
                                }

                                // ── KI-Video Tab: Echtes Video via Replicate ──
                                if (options.tab === 'ai' && isReplicateConfigured()) {
                                    log('Starte echtes KI-Video via Replicate...', 10);
                                    const rawText = cm === 'dream_only' ? text
                                        : cm === 'interpretation' ? interpretationText
                                        : `${text}. ${interpretationText}`;
                                    // Strikte Kontext-Treue: Prompt muss EXAKT den Traum abbilden
                                    const promptText = `Scene description (show EXACTLY this, no additions): ${rawText}`;
                                    try {
                                        const replicateResult = await generateReplicateVideo(
                                            { prompt: promptText, style: videoStyle, aspectRatio: '16:9' },
                                            userProfile?.subscriptionTier || SubscriptionTier.FREE
                                        );
                                        log('KI-Video fertig!', 100);
                                        const videoUrl = replicateResult.videoUrl;

                                        // Persist
                                        if (videoUrl) {
                                            const dreamId = videoStudioDreamId || `dream-${Date.now()}`;
                                            const existing = (videoStudioDreamId && dreams.find(d => d.id === videoStudioDreamId)) || dreams.find(d => d.description === text);
                                            if (existing) {
                                                await handleUpdateDream({ ...existing, videoUrl });
                                            } else {
                                                await handleSaveDream({
                                                    id: dreamId, title: text.slice(0, 60).trim() + (text.length > 60 ? '...' : ''),
                                                    description: text, interpretation: interpretationText,
                                                    date: new Date().toISOString().split('T')[0], userAvatar: '',
                                                    videoUrl, tags: [], likes: 0, comments: 0, matchPercentage: 0,
                                                });
                                            }
                                        }
                                        return videoUrl;
                                    } catch (replicateErr) {
                                        console.warn('[VIDEO-STUDIO] Replicate fehlgeschlagen, Fallback auf Slideshow...', replicateErr);
                                    }
                                }

                                // ── Slideshow-Fallback (oder Slideshow-Tab) ──
                                if (cm === 'dream_only') {
                                    if (isUserVoice) {
                                        audioBase64ForSave = await blobToB64(options.voiceBlob!);
                                        result = await generateDreamUserVoiceVideo(text, audioBase64ForSave, videoStyle, language, log);
                                    } else {
                                        result = await generateDreamNarrationVideo(text, videoStyle, language, log);
                                    }
                                } else if (cm === 'interpretation') {
                                    result = await generateStoryVideo(text, interpretationText, videoStyle, language, log);
                                } else {
                                    const combinedText = `${text}\n\n---\n\n${interpretationText}`;
                                    if (isUserVoice) {
                                        audioBase64ForSave = await blobToB64(options.voiceBlob!);
                                        result = await generateDreamUserVoiceVideo(combinedText, audioBase64ForSave, videoStyle, language, log);
                                    } else {
                                        result = await generateStoryVideo(text, combinedText, videoStyle, language, log);
                                    }
                                }

                                const videoUrl = result?.videoDataUrl || null;

                                // ── Persist: Video + Audio im Dream-Objekt speichern ──
                                if (videoUrl) {
                                    const dreamId = videoStudioDreamId || `dream-${Date.now()}`;
                                    const newDream: Dream = {
                                        id: dreamId,
                                        title: text.slice(0, 60).trim() + (text.length > 60 ? '...' : ''),
                                        description: text,
                                        interpretation: interpretationText,
                                        date: new Date().toISOString().split('T')[0],
                                        userAvatar: '',
                                        videoUrl,
                                        audioUrl: audioBase64ForSave || result?.audioBase64 || undefined,
                                        audioSource: isUserVoice ? 'dictation' as const : undefined,
                                        tags: [],
                                        likes: 0,
                                        comments: 0,
                                        matchPercentage: 0,
                                    };
                                    // Check if dream already exists (by ID or text)
                                    const existing = (videoStudioDreamId && dreams.find(d => d.id === videoStudioDreamId)) || dreams.find(d => d.description === text);
                                    if (existing) {
                                        await handleUpdateDream({
                                            ...existing,
                                            videoUrl,
                                            audioUrl: audioBase64ForSave || existing.audioUrl,
                                        });
                                    } else {
                                        await handleSaveDream(newDream);
                                    }
                                }

                                return videoUrl;
                            } catch (e) {
                                console.error('[VideoStudio] Generation error', e);
                                return null;
                            }
                        }}
                        onSave={(result) => {
                            if (result.videoUrl) {
                                setVideoUrl(result.videoUrl);
                                setShowVideoModal(true);
                            }
                            setVideoStudioDreamId(null);
                            setVideoStudioInterpretation('');
                            setView(View.HOME);
                        }}
                        userCredits={userProfile?.credits || 0}
                    />
                )}
                {view === View.PRO_VIDEO_STUDIO && proStudioVideoUrl && (
                    <ProVideoStudio
                        sourceVideoUrl={proStudioVideoUrl}
                        themeMode={themeMode}
                        onClose={() => { setProStudioVideoUrl(null); setView(View.HOME); }}
                        onExport={(json) => { console.log('[ProStudio] Export:', json); }}
                    />
                )}
                {view === View.DREAM_NETWORK && (
                    <DreamNetwork
                        language={language}
                        themeMode={themeMode}
                        dreams={dreams}
                        onClose={() => setView(View.HOME)}
                    />
                )}
                {showOnboarding && <Onboarding language={language} initialData={userProfile} onComplete={handleSaveProfile} onClose={() => setShowOnboarding(false)} themeMode={themeMode} />}
                {showCalendar && <DreamCalendar dreams={dreams} language={language} onClose={() => setShowCalendar(false)} onGenerateVideo={handleGenerateVideoWithStyle} onGenerateImage={handleGenerateImageWithStyle} themeMode={themeMode} />}

            {view === View.DREAM_MAP && <DreamMap dreams={dreams} language={language} isLight={isLight} onClose={() => setView(View.HOME)} onSelectParticipant={(id) => { setPrevParticipantView(View.DREAM_MAP); setSelectedParticipantId(id); setView(View.RESEARCH_PARTICIPANT); }} onNavigateToResearch={() => setView(View.RESEARCH_MAP)} onNavigateToStudy={(code) => { setSelectedStudyCode(code); setView(View.RESEARCH_STUDIES); }} />}

            {view === View.SCIENCE && (
                <SciencePage
                    language={language}
                    onClose={() => setView(View.HOME)}
                    onNavigateHome={() => setView(View.HOME)}
                    onNavigateToStudies={() => setView(View.RESEARCH_STUDIES)}
                    themeMode={themeMode}
                />
            )}

            {view === View.AGB && <AGBPage language={language} onClose={() => setView(View.HOME)} themeMode={themeMode} />}
            {view === View.DATENSCHUTZ && <DatenschutzPage language={language} onClose={() => setView(View.HOME)} themeMode={themeMode} />}
            {view === View.IMPRESSUM && <ImpressumPage language={language} onClose={() => setView(View.HOME)} themeMode={themeMode} />}
            {view === View.FORSCHUNG && <ForschungPage language={language} onClose={() => setView(View.HOME)} themeMode={themeMode} />}
            {view === View.CENSUS && <CensusPage language={language} onClose={() => setView(View.HOME)} themeMode={themeMode} />}
            {view === View.DREAM_SYMBOLS && <DreamSymbolsPage language={language} onClose={() => setView(View.HOME)} onNavigateHome={() => setView(View.HOME)} themeMode={themeMode} />}
            {view === View.STUDY && <StudyPage language={language} onClose={() => setView(View.HOME)} themeMode={themeMode} userProfile={userProfile} onUpdateProfile={handleSaveProfile} />}

            {view === View.RESEARCH_MAP && (
                <ScientificDreamMap
                    language={language}
                    isLight={isLight}
                    onClose={() => setView(View.HOME)}
                    onSelectParticipant={(id) => { setPrevParticipantView(View.RESEARCH_MAP); setSelectedParticipantId(id); setView(View.RESEARCH_PARTICIPANT); }}
                    onSelectStudy={(code) => { setSelectedStudyCode(code); setView(View.RESEARCH_STUDIES); }}
                />
            )}

            {view === View.RESEARCH_STUDIES && (
                <ResearchStudies
                    language={language}
                    isLight={isLight}
                    onClose={() => setView(View.HOME)}
                    initialStudyCode={selectedStudyCode || undefined}
                    onSelectStudy={(code) => setSelectedStudyCode(code)}
                    onShowOnMap={(code) => { setSelectedStudyCode(code); setView(View.RESEARCH_MAP); }}
                    onSelectParticipant={(id) => { setPrevParticipantView(View.RESEARCH_STUDIES); setSelectedParticipantId(id); setView(View.RESEARCH_PARTICIPANT); }}
                />
            )}

            {view === View.RESEARCH_PARTICIPANT && selectedParticipantId && (
                <ParticipantProfile
                    participantId={selectedParticipantId}
                    language={language}
                    isLight={isLight}
                    onClose={() => setView(prevParticipantView)}
                    onShowOnMap={(code) => { setSelectedStudyCode(code); setView(View.RESEARCH_MAP); }}
                />
            )}

            <main className="relative z-10 p-4 pt-6 pb-24">
                {view === View.HOME && renderHome()}
                    {view === View.DREAM_HUB && <DreamHub dreams={dreams} language={language} themeMode={themeMode} onClose={() => setView(View.HOME)} />}
                    {view === View.PROFILE && <Profile language={language} dreams={dreams} userProfile={userProfile} onUpdateProfile={handleSaveProfile} onUpdateDream={handleUpdateDream} onOpenVideoStudio={handleOpenVideoStudio} onPlayVideo={(url) => { setVideoUrl(url); setShowVideoModal(true); }} fontSize={FontSize.MEDIUM} themeMode={themeMode} />}
            </main>

            {/* Legal Footer Links */}
            {view === View.HOME && (
              <div className="text-center py-4 pb-20 text-xs opacity-50 relative z-10">
                <a href="/impressum" className="hover:underline">Impressum</a>
                {' · '}
                <a href="/datenschutz" className="hover:underline">Datenschutz</a>
                {' · '}
                <a href="/agb" className="hover:underline">AGB</a>
                {' · '}
                <a href="/samedream" className="hover:underline">SameDream</a>
                {' · '}
                <a href="/dreamatlas" className="hover:underline">DreamAtlas</a>
              </div>
            )}

            {view === View.LIVE_SESSION ? (
                    <LiveSession
                        key="live-session"
                        onClose={() => setView(View.HOME)}
                        onSaveSession={async (text, audioData) => { if (audioData) { setCurrentAudioData(audioData); setAudioIsFromLiveChat(true); } setView(View.HOME); const story = await convertTranscriptToStory(text, language); setDreamInput(story); setTimeout(() => handleAnalyze(story), 200); }}
                        language={language}
                        voiceName={userProfile?.preferredVoice || 'Puck'}
                        selectedCategories={selectedCategories}
                        selectedSources={selectedSources}
                        themeMode={themeMode}
                    />
            ) : null}

            {view === View.HOME && (
              <footer className={`relative z-10 px-4 pb-28 pt-4 text-center text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                  <button onClick={() => setView(View.DATENSCHUTZ)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    {t.ui.privacy_link}
                  </button>
                  <button onClick={() => setView(View.AGB)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    {t.ui.terms_link}
                  </button>
                  <button onClick={() => setView(View.IMPRESSUM)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    {t.ui.imprint_link}
                  </button>
                  <button onClick={() => setView(View.FORSCHUNG)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    {t.ui.research_link}
                  </button>
                  <button onClick={() => setView(View.CENSUS)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    Census
                  </button>
                  <button onClick={() => setView(View.RESEARCH_STUDIES)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    {t.ui.studies_link}
                  </button>
                  <button onClick={() => setView(View.DREAM_SYMBOLS)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    {t.ui.symbols_link}
                  </button>
                  <button onClick={() => setView(View.RESEARCH_MAP)} className={`hover:underline ${isLight ? 'hover:text-indigo-600' : 'hover:text-slate-300'} transition-colors`}>
                    {t.ui.worldmap_link}
                  </button>
                </div>
                <p className={`mt-2 ${isLight ? 'text-slate-300' : 'text-slate-600'}`}>
                  AssetsUN LLC
                </p>
              </footer>
            )}

            <nav className={`fixed bottom-0 left-0 right-0 border-t pb-safe z-40 transition-colors duration-500 ${isLight ? 'bg-white/80 backdrop-blur-xl border-mystic-border shadow-glass' : 'bg-dream-bg/80 backdrop-blur-lg border-white/10'}`}>
                <div className="flex justify-around items-center p-2">
                    <NavBtn icon="home" label={t.ui.home_label} active={view === View.HOME} onClick={() => setView(View.HOME)} isLight={isLight} />
                    <button aria-label="Settings" onClick={() => setShowSettings(true)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${showSettings ? (isLight ? 'text-fuchsia-600' : 'text-fuchsia-500') : (isLight ? 'text-slate-400 hover:text-indigo-900' : 'text-slate-500 hover:text-slate-300')}`}>
                        <span className={`material-icons text-2xl`}>settings</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide max-w-[60px] truncate text-center">{t.ui.settings}</span>
                    </button>
                    <div className="relative -top-8">
                        <button onClick={handleLiveClick} className="w-20 h-20 rounded-full bg-gradient-to-tr from-fuchsia-600 to-violet-600 shadow-[0_0_30px_rgba(192,38,211,0.6)] flex flex-col items-center justify-center border-4 transition-transform hover:scale-110 relative gap-0" style={{ borderColor: isLight ? 'rgba(255,255,255,0.8)' : '#05020a' }}>
                            <span className="material-icons text-3xl text-white mb-1">graphic_eq</span>
                            <span className="text-[9px] font-bold text-white uppercase leading-none">{t.ui.live_chat_label}</span>
            {/* Live Chat icon - kein Lock mehr */}
                        </button>
                    </div>
                    <NavBtn icon="person" label={t.ui.profile_btn} active={view === View.PROFILE} onClick={() => setView(View.PROFILE)} isLight={isLight} />
                </div>
            </nav>

            {/* Audio Upload Confirmation Modal */}
            {showAudioUploadConfirm && (
                <AudioUploadConfirmModal
                    onClose={() => {
                        setShowAudioUploadConfirm(false);
                        setCurrentAudioData(null);
                        setShowSavedMessage(true);
                        setTimeout(() => setShowSavedMessage(false), 4000);
                    }}
                    t={t}
                    isLight={isLight}
                />
            )}
        </div>
        </React.Suspense>
        </ErrorBoundary>
    );
};

// --- Extracted Components ---

const CoinShopModal = ({ onClose, t, isLight, onPurchase, onEarnFree }: { onClose: () => void, t: any, isLight: boolean, onPurchase: (amt: number) => void, onEarnFree: () => void }) => (
    <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 zoom-in-95">
        <div className={`w-[95%] max-w-md ${isLight ? 'bg-mystic-card/95 backdrop-blur-md' : 'bg-dream-surface/95 backdrop-blur-md'} border ${isLight ? 'border-amber-500/40' : 'border-amber-500/30'} rounded-2xl overflow-hidden shadow-2xl flex flex-col relative max-h-[85vh]`}>
            <button aria-label={t.ui.close} onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <span className="material-icons text-base">close</span>
            </button>

            <div className="h-20 bg-gradient-to-r from-amber-600 to-orange-500 flex items-center justify-center shrink-0 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                 <div className="text-center relative z-10">
                     <h2 className="text-xl font-mystic font-bold text-white drop-shadow-md flex items-center justify-center gap-2">
                        <span className="material-icons text-lg">storefront</span> {t.shop.title}
                     </h2>
                     <p className="text-amber-100 text-xs font-bold uppercase tracking-wider opacity-90">{t.shop.desc}</p>
                 </div>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto custom-scrollbar">
                {/* DYNAMISCHE COIN PAKETE */}
                {Object.values(COIN_PACKAGES).map((pkg, index) => {
                    const isBestseller = 'highlight' in pkg && (pkg as any).highlight === true;
                    const isBestValue = pkg.id === 'mega_2500';
                    const isMegaPlus = false; // MEGA_PLUS entfernt
                    const pricePerCoin = (pkg.price / pkg.coins).toFixed(4);
                    const emojis = ['🪙', '💰', '💎', '🌟', '⭐', '🏆'];
                    const colors = [
                        { bg: 'bg-slate-500', border: 'border-slate-300', text: 'text-slate-800' },
                        { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-900' },
                        { bg: 'bg-emerald-600', border: 'border-emerald-500', text: 'text-emerald-900' },
                        { bg: 'bg-purple-600', border: 'border-purple-500', text: 'text-purple-900' },
                        { bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-blue-900' },
                        { bg: 'bg-pink-600', border: 'border-pink-500', text: 'text-pink-900' },
                    ];

                    return (
                        <div
                            key={pkg.id}
                            onClick={() => onPurchase(pkg.coins)}
                            className={`rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] relative ${
                                isMegaPlus
                                    ? 'p-5 border-2 border-pink-500 bg-gradient-to-r from-pink-900/20 to-purple-900/20 shadow-xl shadow-pink-500/30'
                                    : isBestseller
                                        ? 'p-5 border-2 border-amber-500 bg-amber-900/10 shadow-xl shadow-amber-500/25'
                                        : isBestValue
                                            ? `p-4 ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-900/20 border-emerald-500/30'}`
                                            : `p-4 ${isLight ? 'bg-white/60 border-slate-200 hover:bg-white/80 shadow-sm' : 'bg-white/5 border-white/10 hover:bg-white/10'}`
                            }`}
                        >
                            {isMegaPlus && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold uppercase px-4 py-1 rounded-full shadow-lg shadow-pink-500/50 animate-pulse whitespace-nowrap">
                                    {t.shop.wow_badge}
                                </div>
                            )}
                            {isBestseller && !isMegaPlus && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                                    ⭐ {t.shop.best_badge}
                                </div>
                            )}
                            {isBestValue && !isMegaPlus && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl">
                                    {t.shop.value_badge}
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-full ${colors[index % colors.length].bg} flex items-center justify-center text-white shadow-lg ${isBestseller ? 'shadow-amber-500/40' : ''} shrink-0`}>
                                    <span className={`${isBestseller ? 'text-xl' : 'text-base'}`}>{emojis[index % emojis.length]}</span>
                                </div>
                                <div>
                                    <h3 className={`font-bold text-sm ${isBestseller || isMegaPlus ? 'text-base' : ''} ${
                                        isLight
                                            ? (isMegaPlus ? 'text-pink-900' : isBestseller ? colors[index % colors.length].text : isBestValue ? 'text-emerald-900' : 'text-slate-800')
                                            : (isMegaPlus ? 'text-pink-100' : isBestValue ? 'text-emerald-100' : 'text-white')
                                    }`}>
                                        {pkg.coins} {t.shop.coins_label}
                                    </h3>
                                    <p className={`text-xs font-bold ${
                                        isMegaPlus ? 'text-pink-500 uppercase' : isBestseller ? 'text-amber-500 uppercase' : isBestValue ? 'text-emerald-500' : 'text-slate-400'
                                    }`}>
                                        {({starter_50: t.shop.pkg_starter, popular_150: t.shop.pkg_popular, value_400: t.shop.pkg_value, premium_900: t.shop.pkg_premium, mega_2500: t.shop.pkg_mega} as Record<string, string>)[pkg.id] || pkg.id}
                                    </p>
                                    <p className={`text-xs mt-0.5 ${isLight ? 'text-mystic-text-secondary' : 'text-slate-500'}`}>
                                        {pricePerCoin}€ {t.shop.per_coin}
                                    </p>
                                </div>
                            </div>
                            <button className={`px-4 py-3 rounded-xl font-bold text-sm shadow-md transition-all shrink-0 ${
                                isMegaPlus
                                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-pink-500/30'
                                    : isBestseller
                                        ? 'bg-amber-500 hover:bg-amber-400 text-white'
                                        : isBestValue
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                            : isLight
                                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}>
                                €{pkg.price.toFixed(2)}
                            </button>
                        </div>
                    );
                })}

                <div className={`pt-4 mt-2 border-t border-dashed ${isLight ? 'border-mystic-border' : 'border-white/10'} text-center`}>
                    <button onClick={onEarnFree} className={`flex items-center justify-center gap-2 mx-auto px-5 py-2.5 rounded-full border font-bold text-sm transition-all hover:scale-105 active:scale-95 ${isLight ? 'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'border-white/20 text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white'}`}>
                        <span className="material-icons text-base">card_giftcard</span>
                        {t.shop.free_link}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, t, isLight, apiKeyInput, setApiKeyInput, handleAddApiKey, handleRemoveApiKey, userProfile, themeMode, handleThemeUpdate, designTheme, handleExport, handleImport, language, onLanguageChange, onVoiceChange, currentVoiceId }) => (
    <div className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className={`w-[95%] max-w-md ${isLight ? 'bg-mystic-card/95 backdrop-blur-md' : 'bg-dream-surface/95 backdrop-blur-md'} border ${isLight ? 'border-mystic-border' : 'border-white/10'} rounded-2xl overflow-hidden flex flex-col shadow-2xl max-h-[85vh]`}>
            <div className={`px-5 py-4 border-b ${isLight ? 'border-mystic-border' : 'border-white/10'} flex justify-between items-center shrink-0`}>
                <h2 className={`text-lg font-mystic font-bold ${isLight ? 'text-mystic-text' : 'text-white'}`}>{t.ui.settings}</h2>
                <button aria-label={t.ui.close} onClick={onClose} className="w-8 h-8 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors">
                    <span className={`material-icons text-base ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'}`}>close</span>
                </button>
            </div>
            <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">

                {/* BACKUP & DATA VAULT */}
                <div className={`p-4 rounded-xl border ${isLight ? 'bg-green-50 border-green-200' : 'bg-green-900/10 border-green-500/30'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${isLight ? 'text-green-800' : 'text-green-400'}`}>
                        <span className="material-icons text-sm">cloud_sync</span> {t.ui.backup_title}
                    </h3>
                    <p className={`text-xs mb-3 leading-relaxed ${isLight ? 'text-green-700' : 'text-green-200/70'}`}>{t.ui.backup_desc}</p>
                    <div className="flex gap-2">
                        <button onClick={handleExport} className={`flex-1 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${isLight ? 'bg-white border-green-200 text-green-700 hover:bg-green-50' : 'bg-white/5 border-green-500/30 text-green-300 hover:bg-green-900/20'}`}>
                            <span className="material-icons text-sm">download</span> {t.ui.export_btn}
                        </button>
                        <label className="flex-1 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer bg-green-600 border-green-500 text-white hover:bg-green-700">
                            <span className="material-icons text-sm">upload_file</span> {t.ui.import_btn}
                            <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
                        </label>
                    </div>
                </div>

                {/* API KEY MANAGER FOR SMART TIER */}
                {userProfile?.subscriptionTier === SubscriptionTier.SMART && (
                <div className={`p-4 rounded-xl border ${isLight ? 'bg-cyan-50 border-cyan-200' : 'bg-cyan-900/10 border-cyan-500/30'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${isLight ? 'text-cyan-800' : 'text-cyan-400'}`}>
                        <span className="material-icons text-sm">vpn_key</span> {t.ui.api_manager}
                    </h3>
                    <p className={`text-xs mb-3 leading-relaxed ${isLight ? 'text-cyan-700' : 'text-cyan-200/70'}`}>{t.ui.api_desc}</p>
                    
                    <div className="flex gap-2 mb-3">
                        <input 
                            type="text" 
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder="sk-..."
                            className={`flex-1 rounded-xl px-3 py-2.5 text-xs border outline-none ${isLight ? 'bg-white border-cyan-200 text-slate-800' : 'bg-black/30 border-cyan-500/30 text-white'}`}
                        />
                        <button 
                            onClick={handleAddApiKey}
                            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl whitespace-nowrap transition-colors"
                        >
                            {t.ui.add_key}
                        </button>
                    </div>
                    
                    <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                        {(userProfile?.customApiKeys || []).length === 0 ? (
                            <p className="text-xs text-center italic opacity-50 py-2">{t.ui.no_keys}</p>
                        ) : (
                            (userProfile?.customApiKeys || []).map((key, i) => (
                                <div key={i} className={`flex justify-between items-center px-3 py-2 rounded-lg ${isLight ? 'bg-white/60' : 'bg-white/5'}`}>
                                    <span className="text-xs font-mono opacity-70">...{key.slice(-5)}</span>
                                    <button onClick={() => handleRemoveApiKey(key)} className="text-red-400 hover:text-red-300 transition-colors">
                                        <span className="material-icons text-sm">delete</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                )}

                {/* Mode Toggle */}
                <div className={`pt-5 border-t ${isLight ? 'border-mystic-border' : 'border-white/10'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'}`}>
                        <span className="material-icons text-sm">contrast</span> {t.ui.mode}
                    </h3>
                    <div className={`relative flex rounded-full p-1 border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                        <div className={`absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full shadow transition-all duration-300 ${themeMode === ThemeMode.DARK ? 'left-1 bg-slate-800' : 'left-[calc(50%+3px)] bg-white'}`}></div>
                        <button
                            onClick={() => handleThemeUpdate(ThemeMode.DARK, null)}
                            className={`relative z-10 flex-1 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${themeMode === ThemeMode.DARK ? 'text-white' : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300')}`}
                        >
                            <span className="material-icons text-sm">dark_mode</span> {t.ui.dark}
                        </button>
                        <button
                            onClick={() => handleThemeUpdate(ThemeMode.LIGHT, null)}
                            className={`relative z-10 flex-1 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${themeMode === ThemeMode.LIGHT ? 'text-indigo-900' : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300')}`}
                        >
                            <span className="material-icons text-sm">light_mode</span> {t.ui.light}
                        </button>
                    </div>
                </div>

                {/* Language Selection */}
                <div className={`pt-5 border-t ${isLight ? 'border-mystic-border' : 'border-white/10'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'}`}>
                        <span className="material-icons text-sm">translate</span>
                        {t.ui.language_label || 'Language'}
                    </h3>
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value as Language)}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${isLight ? 'bg-white border-indigo-200 text-indigo-900' : 'bg-white/5 border-white/10 text-white'}`}
                    >
                        <option value={Language.DE}>🇩🇪 Deutsch</option>
                        <option value={Language.EN}>🇬🇧 English</option>
                        <option value={Language.TR}>🇹🇷 Türkçe</option>
                        <option value={Language.ES}>🇪🇸 Español</option>
                        <option value={Language.FR}>🇫🇷 Français</option>
                        <option value={Language.AR}>🌍 العربية الفصحى</option>
                        <option value={Language.AR_GULF}>🇸🇦 خليجي</option>
                        <option value={Language.AR_EG}>🇪🇬 مصري</option>
                        <option value={Language.AR_LEV}>🇱🇧 شامي</option>
                        <option value={Language.AR_MAG}>🇲🇦 دارجة</option>
                        <option value={Language.AR_IQ}>🇮🇶 عراقي</option>
                        <option value={Language.PT}>🇵🇹 Português</option>
                        <option value={Language.RU}>🇷🇺 Русский</option>
                        <option value={Language.ZH}>🇨🇳 中文</option>
                        <option value={Language.HI}>🇮🇳 हिन्दी</option>
                        <option value={Language.JA}>🇯🇵 日本語</option>
                        <option value={Language.KO}>🇰🇷 한국어</option>
                        <option value={Language.ID}>🇮🇩 Indonesia</option>
                        <option value={Language.FA}>🇮🇷 فارسی</option>
                        <option value={Language.IT}>🇮🇹 Italiano</option>
                        <option value={Language.PL}>🇵🇱 Polski</option>
                        <option value={Language.BN}>🇧🇩 বাংলা</option>
                        <option value={Language.UR}>🇵🇰 اردو</option>
                        <option value={Language.VI}>🇻🇳 Tiếng Việt</option>
                        <option value={Language.TH}>🇹🇭 ไทย</option>
                        <option value={Language.SW}>🇰🇪 Kiswahili</option>
                        <option value={Language.HU}>🇭🇺 Magyar</option>
                        <option value={Language.TA}>🇮🇳 தமிழ்</option>
                        <option value={Language.TE}>🇮🇳 తెలుగు</option>
                        <option value={Language.TL}>🇵🇭 Filipino</option>
                        <option value={Language.ML}>🇮🇳 മലയാളം</option>
                        <option value={Language.MR}>🇮🇳 मराठी</option>
                        <option value={Language.KN}>🇮🇳 ಕನ್ನಡ</option>
                        <option value={Language.GU}>🇮🇳 ગુજરાતી</option>
                        <option value={Language.HE}>🇮🇱 עברית</option>
                        <option value={Language.NE}>🇳🇵 नेपाली</option>
                        <option value={Language.PRS}>🇦🇫 دری</option>
                    </select>
                </div>

                {/* Oracle Voice */}
                <div className={`pt-5 border-t ${isLight ? 'border-mystic-border' : 'border-white/10'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'}`}>
                        <span className="material-icons text-sm">record_voice_over</span>
                        {t.ui.oracle_voice}
                    </h3>
                    <VoiceSelector
                        mode="settings"
                        language={language}
                        currentVoiceId={currentVoiceId}
                        onSelect={onVoiceChange}
                        isLight={isLight}
                    />
                </div>

                {/* Color Theme */}
                <div className={`pt-5 border-t ${isLight ? 'border-mystic-border' : 'border-white/10'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'}`}>
                        <span className="material-icons text-sm">palette</span> {t.ui.style}
                    </h3>
                    <div className="flex flex-col gap-2">
                        {[DesignTheme.DEFAULT, DesignTheme.FEMININE, DesignTheme.MASCULINE, DesignTheme.NATURE].map(dt => {
                            let label = t.ui.style_def;
                            let colorClass = "bg-indigo-500";
                            if(dt === DesignTheme.FEMININE) { label = t.ui.style_fem; colorClass = "bg-pink-500"; }
                            if(dt === DesignTheme.MASCULINE) { label = t.ui.style_masc; colorClass = "bg-sky-500"; }
                            if(dt === DesignTheme.NATURE) { label = t.ui.style_nature; colorClass = "bg-emerald-500"; }
                            
                            const isActive = designTheme === dt;
                            const activeClass = isActive 
                                ? (isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-white/10 border-white/30 text-white') 
                                : (isLight ? 'bg-slate-50 border-transparent hover:bg-slate-100' : 'bg-white/5 border-transparent text-slate-400');
                            
                            return (
                                <button key={dt} onClick={() => handleThemeUpdate(null, dt)} className={`w-full py-3 px-4 rounded-xl border text-sm text-left flex items-center justify-between transition-all ${activeClass}`}>
                                    <span className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${colorClass}`}></div> {label}</span>
                                    {isActive && <span className={`material-icons ${isLight ? 'text-indigo-500' : 'text-white'}`}>check_circle</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, t, isLight, userProfile, onUpdateSubscription, language: lang, regionInfo }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [showSmartInfo, setShowSmartInfo] = useState(false);

    return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className={`w-[95%] max-w-md ${isLight ? 'bg-mystic-card/95 backdrop-blur-md' : 'bg-dream-surface/95 backdrop-blur-md'} border ${isLight ? 'border-mystic-border' : 'border-white/10'} rounded-2xl overflow-hidden shadow-2xl flex flex-col relative max-h-[85vh]`}>
            <button aria-label={t.ui.close} onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 text-white transition-colors">
                <span className="material-icons text-base">close</span>
            </button>
            <div className="h-20 bg-gradient-to-br from-amber-600 to-yellow-500 relative flex items-center justify-center shrink-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                <h2 className="text-2xl font-mystic font-bold text-white shadow-black drop-shadow-md">{t.sub.title}</h2>
            </div>
            
            {/* Billing Toggle */}
            <div className={`flex justify-center px-4 py-3 ${isLight ? 'bg-white/60 backdrop-blur-md border-b border-slate-100' : 'bg-white/5 backdrop-blur-md border-b border-white/5'}`}>
                <div className={`relative flex p-1 rounded-full border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/40 border-white/10'}`}>
                    <div className={`absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full shadow-md transition-all duration-300 ${billingCycle === 'monthly' ? 'left-1' : 'left-[calc(50%+3px)]'} ${isLight ? 'bg-white shadow-indigo-100' : 'bg-slate-700'}`}></div>
                    <button onClick={() => setBillingCycle('monthly')} className={`relative z-10 px-5 py-1.5 rounded-full text-xs font-bold transition-colors duration-300 ${billingCycle === 'monthly' ? (isLight ? 'text-mystic-text' : 'text-white') : (isLight ? 'text-slate-400' : 'text-slate-400')}`}>
                        {t.sub.billing_monthly}
                    </button>
                    <button onClick={() => setBillingCycle('yearly')} className={`relative z-10 px-5 py-1.5 rounded-full text-xs font-bold transition-colors duration-300 flex items-center gap-1.5 ${billingCycle === 'yearly' ? (isLight ? 'text-mystic-text' : 'text-white') : (isLight ? 'text-slate-400' : 'text-slate-400')}`}>
                        {t.sub.billing_yearly}
                        <span className="bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase">{t.sub.yearly_discount}</span>
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar relative">
                {/* SMART INFO OVERLAY - REDESIGNED */}
                {showSmartInfo && (
                    <div className="absolute inset-0 z-20 bg-cyan-900/95 backdrop-blur-md p-6 flex flex-col justify-center ">
                        <div className="bg-white/10 p-6 rounded-2xl border border-cyan-400/30">
                            <h3 className="text-cyan-300 font-bold mb-6 flex items-center gap-2 text-lg">
                                <span className="material-icons">info</span> {t.sub.smart_info_title}
                            </h3>
                            
                            <div className="space-y-6 mb-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                                        <span className="material-icons">account_circle</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">{t.smart_guide.step1_title}</h4>
                                        <p className="text-cyan-100/70 text-xs">{t.smart_guide.step1_desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                                        <span className="material-icons">vpn_key</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">{t.smart_guide.step2_title}</h4>
                                        <p className="text-cyan-100/70 text-xs">{t.smart_guide.step2_desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                                        <span className="material-icons">input</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">{t.smart_guide.step3_title}</h4>
                                        <p className="text-cyan-100/70 text-xs">{t.smart_guide.step3_desc}</p>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setShowSmartInfo(false)} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-bold text-sm shadow-lg">{t.ui.ok}</button>
                        </div>
                    </div>
                )}

                {[SubscriptionTier.FREE, SubscriptionTier.PRO, SubscriptionTier.PREMIUM, SubscriptionTier.SMART, ...(regionInfo?.vipAvailable ? [SubscriptionTier.VIP] : [])].map(tier => {
                    const isCurrent = userProfile?.subscriptionTier === tier;
                    let title = "", features: string[] = [], price = "";
                    let borderColor = "";
                    let buttonText = isCurrent ? t.sub.current : t.sub.upgrade;

                    if (tier === SubscriptionTier.FREE) {
                        title = t.sub.bronze_title;
                        features = t.sub.bronze_features;
                        price = t.sub.bronze_price;
                        borderColor = "border-slate-500/20";
                    }
                    if (tier === SubscriptionTier.PRO) {
                        title = t.sub.silver2_title;
                        features = t.sub.silver2_features;
                        price = billingCycle === 'yearly' ? t.sub.silver2_price_yearly : t.sub.silver2_price_monthly;
                        borderColor = "border-blue-400";
                    }
                    if (tier === SubscriptionTier.PREMIUM) {
                        title = t.sub.gold2_title;
                        features = t.sub.gold2_features;
                        price = billingCycle === 'yearly' ? t.sub.gold2_price_yearly : t.sub.gold2_price_monthly;
                        borderColor = "border-amber-400";
                    }
                    if (tier === SubscriptionTier.VIP) {
                        borderColor = "border-2 border-yellow-500";
                    }
                    if (tier === SubscriptionTier.VIP) {
                        title = t.sub.vip_title;
                        features = t.sub.vip_features;
                        price = billingCycle === 'yearly' ? t.sub.vip_price_yearly : t.sub.vip_price_monthly;
                        borderColor = "border-pink-500";
                    }
                    if (tier === SubscriptionTier.SMART) {
                        title = t.sub.smart_title;
                        features = t.sub.smart_features;
                        price = t.sub.smart_price;
                        borderColor = "border-cyan-400";
                    }

                    // Calculate if badge is present
                    const hasBadge = (billingCycle === 'yearly' && (tier === SubscriptionTier.PRO || tier === SubscriptionTier.PREMIUM)) || tier === SubscriptionTier.SMART;

                    return (
                        <div key={tier} onClick={() => onUpdateSubscription(tier)} className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 relative group ${isCurrent ? (isLight ? 'bg-gradient-to-br from-indigo-50 to-fuchsia-50 border-indigo-400 shadow-md shadow-indigo-100' : 'bg-gradient-to-br from-indigo-900/30 to-fuchsia-900/20 border-indigo-500/60 shadow-lg shadow-indigo-500/10') : (isLight ? `bg-white/80 backdrop-blur-md hover:bg-white shadow-sm hover:shadow-md ${borderColor}` : `bg-white/5 backdrop-blur-md hover:bg-white/10 ${borderColor}`)}`}>
                            {tier === SubscriptionTier.PRO && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-md whitespace-nowrap z-10">
                                    {t.sub.pro_badge}
                                </div>
                            )}
                            {billingCycle === 'yearly' && (tier === SubscriptionTier.PRO || tier === SubscriptionTier.PREMIUM) && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-xl rounded-tr-xl font-bold shadow-sm">
                                    {t.sub.yearly_discount}
                                </div>
                            )}
                            {tier === SubscriptionTier.VIP && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-md whitespace-nowrap z-10">
                                    {t.sub.vip_badge}
                                </div>
                            )}
                            {tier === SubscriptionTier.SMART && (
                                <div className="absolute top-0 right-0 bg-fuchsia-600 text-white text-xs px-2 py-1 rounded-bl-xl rounded-tr-xl font-bold shadow-sm animate-pulse z-10">
                                    {t.sub.smart_discount}
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-bold text-base ${isLight ? 'text-mystic-text' : 'text-white'}`}>{title}</h3>
                                    {isCurrent && <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full uppercase">{t.sub.current}</span>}
                                    {tier === SubscriptionTier.SMART && <span className="px-2 py-0.5 bg-cyan-500 text-white text-[9px] font-bold rounded-full uppercase">BYOK</span>}
                                </div>
                                <div className={`text-right ${hasBadge ? 'mt-5' : ''}`}>
                                    {tier === SubscriptionTier.PREMIUM && billingCycle === 'monthly' && (
                                        <span className={`block text-xs line-through ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{SUBSCRIPTION_TIERS.PREMIUM.strikethrough_monthly.toFixed(2).replace('.', ',')} {regionInfo?.currencySymbol || '€'}</span>
                                    )}
                                    <span className={`block font-extrabold text-xl ${isLight ? 'text-mystic-text' : 'text-white'}`}>{price}</span>
                                </div>
                            </div>

                            <ul className="space-y-1.5">
                                {features.map((feat, i) => (
                                    <li key={i} className={`text-xs flex items-start gap-2 leading-tight ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'}`}>
                                        <span className={`material-icons text-xs mt-0.5 shrink-0 ${isCurrent ? (isLight ? 'text-indigo-500' : 'text-indigo-400') : tier === SubscriptionTier.SMART ? 'text-cyan-400' : (isLight ? 'text-fuchsia-500' : 'text-fuchsia-400')}`}>check_circle</span>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex items-center justify-between mt-1 gap-2">
                                {!isCurrent ? (
                                    <span className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-center transition-all ${tier === SubscriptionTier.PRO ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30' : tier === SubscriptionTier.VIP || tier === SubscriptionTier.PREMIUM ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-500/30' : tier === SubscriptionTier.SMART ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20' : (isLight ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-white/10 text-slate-300')}`}>{buttonText}</span>
                                ) : (
                                    <span className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-center ${isLight ? 'bg-green-100 text-green-700' : 'bg-green-900/30 text-green-400'}`}>{t.sub.current}</span>
                                )}
                                {tier === SubscriptionTier.SMART && (
                                    <button
                                        aria-label="Info"
                                        onClick={(e) => { e.stopPropagation(); setShowSmartInfo(true); }}
                                        className="w-9 h-9 shrink-0 rounded-full border border-cyan-400 text-cyan-400 flex items-center justify-center hover:bg-cyan-400 hover:text-white transition-colors"
                                    >
                                        <span className="text-xs font-serif font-bold italic">i</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
    );
};

const EarnCoinsModal = ({ onClose, t, isLight, onWatch }: { onClose: () => void, t: any, isLight: boolean, onWatch: (d: number, r: number) => void }) => (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className={`w-[95%] max-w-md ${isLight ? 'bg-mystic-card' : 'bg-dream-elevated'} border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative max-h-[85vh]`}>
                <button aria-label={t.ui.close} onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors">
                <span className="material-icons text-base">close</span>
            </button>
            <div className="h-20 bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                <h2 className="text-2xl font-mystic font-bold text-white shadow-black drop-shadow-md flex items-center gap-2">
                    <span className="material-icons">monetization_on</span> {t.earn.title}
                </h2>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
                <p className={`text-sm text-center mb-2 ${isLight ? 'text-mystic-text-secondary' : 'text-slate-300'}`}>{t.earn.desc}</p>
                
                {/* Short Clip */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-amber-50 border-amber-100' : 'bg-amber-900/10 border-amber-500/20'}`}>
                    <div>
                        <h4 className={`font-bold text-sm ${isLight ? 'text-mystic-text' : 'text-white'}`}>{t.earn.short_title}</h4>
                        <p className="text-xs text-amber-500">{t.earn.short_desc}</p>
                    </div>
                    <button onClick={() => onWatch(REWARD_CONFIG.shortClip.durationMs, REWARD_CONFIG.shortClip.coins)} className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-lg transition-colors">
                        +{t.earn.short_reward} 🪙 {t.earn.watch_btn}
                    </button>
                </div>

                {/* Long Clip */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-amber-50 border-amber-100' : 'bg-amber-900/10 border-amber-500/20'}`}>
                    <div>
                        <h4 className={`font-bold text-sm ${isLight ? 'text-mystic-text' : 'text-white'}`}>{t.earn.long_title}</h4>
                        <p className="text-xs text-amber-500">{t.earn.long_desc}</p>
                    </div>
                    <button onClick={() => onWatch(REWARD_CONFIG.premiumVideo.durationMs, REWARD_CONFIG.premiumVideo.coins)} className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:to-orange-600 text-white rounded-xl font-bold text-xs shadow-lg">
                        +{t.earn.long_reward} 🪙 {t.earn.watch_btn}
                    </button>
                </div>

                {/* Offerwall (Mock) */}
                <div className={`p-4 rounded-xl border ${isLight ? 'bg-blue-50 border-blue-100' : 'bg-blue-900/10 border-blue-500/20'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h4 className={`font-bold text-sm ${isLight ? 'text-mystic-text' : 'text-white'}`}>{t.earn.offer_title}</h4>
                            <p className="text-xs text-blue-400">{t.earn.offer_desc}</p>
                        </div>
                            <span className="text-xs font-bold bg-blue-500 text-white px-2 py-0.5 rounded">+{t.earn.offer_reward} 🪙</span>
                    </div>
                    <p className={`text-xs mb-3 leading-relaxed ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'}`}>{t.earn.offer_info}</p>
                    <div className="space-y-2">
                        <div className={`flex justify-between items-center p-2 rounded border ${isLight ? 'bg-white border-blue-100' : 'bg-black/20 border-white/5'}`}>
                            <span className={`text-xs ${isLight ? 'text-mystic-text' : 'text-slate-300'}`}>{t.earn.survey_task}</span>
                            <button className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase py-1 px-2">{t.earn.start_btn}</button>
                        </div>
                            <div className={`flex justify-between items-center p-2 rounded border ${isLight ? 'bg-white border-blue-100' : 'bg-black/20 border-white/5'}`}>
                            <span className={`text-xs ${isLight ? 'text-mystic-text' : 'text-slate-300'}`}>{t.earn.app_task}</span>
                            <button className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase py-1 px-2">{t.earn.start_btn}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ProcessingOverlay = ({ isLight, steps, categories, sources, t }: { isLight: boolean, steps: ProcessingStep[], categories: ReligiousCategory[], sources: ReligiousSource[], t: any }) => (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 duration-500">
        <div className={`w-[95%] max-w-md ${isLight ? 'bg-mystic-card/95 backdrop-blur-md border-mystic-border' : 'bg-dream-surface/95 backdrop-blur-md border-white/10'} border rounded-2xl p-6 shadow-2xl flex flex-col gap-5 relative overflow-hidden max-h-[85vh] overflow-y-auto`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-violet-500 animate-pulse"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
            <div className="text-center mb-2">
                <h2 className={`text-2xl font-mystic font-bold ${isLight ? 'text-mystic-text' : 'text-white'} animate-pulse`}>{steps[0]?.label || t.processing.title}</h2>
            </div>

            <div className="space-y-4">
                {steps.map((step, idx) => (
                    <div key={step.id} className={`flex items-start gap-4 transition-all duration-500 ${step.status === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 mt-0.5
                            ${step.status === 'completed' ? 'bg-green-500 text-white' : 
                                step.status === 'active' ? 'border-2 border-fuchsia-500 border-t-transparent animate-spin' : 
                                step.status === 'skipped' ? 'bg-slate-600 text-slate-300' : 'bg-slate-800 text-slate-500'}`}>
                            {step.status === 'completed' && <span className="material-icons text-sm">check</span>}
                            {step.status === 'skipped' && <span className="material-icons text-sm">close</span>}
                            {step.status === 'pending' && <div className="w-2 h-2 rounded-full bg-current"></div>}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-bold ${step.status === 'active' ? (isLight ? 'text-indigo-600' : 'text-white') : step.status === 'skipped' ? 'text-slate-500' : (isLight ? 'text-mystic-text' : 'text-slate-300')}`}>
                                {step.label}
                            </p>
                            
                            {/* DISPLAY CATEGORIES IN CONTEXT STEP */}
                            {step.id === 'context' && step.status === 'completed' && (
                                <div className="mt-1  slide-in-from-left-2">
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {categories.map(c => (
                                            <span key={c} className={`text-xs px-2 py-0.5 rounded border ${isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                                                {t.categories[c]}
                                            </span>
                                        ))}
                                        {sources.map(s => (
                                            <span key={s} className={`text-xs px-2 py-0.5 rounded border ${isLight ? 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                                                {t.sources[s]}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const VideoLoadingOverlay = ({ t }: { t: any }) => (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 ">
        <div className="w-24 h-24 rounded-full border-4 border-fuchsia-500 border-t-transparent animate-spin mb-6"></div>
        <h2 className="text-xl font-mystic font-bold text-white animate-pulse">{t.ui.video_gen}</h2>
        <p className="text-slate-400 text-sm mt-2">Veo AI (Beta)</p>
    </div>
);

const VideoResultModal = ({ onClose, url, t, isLight }: { onClose: () => void, url: string | null, t: any, isLight: boolean }) => {
    const [storyData, setStoryData] = useState<any>(null);
    const [currentSegment, setCurrentSegment] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (url?.startsWith('data:application/json')) {
            try {
                const base64 = url.split(',')[1];
                // Unicode-safe base64 decoding
                const binaryStr = atob(base64);
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }
                const jsonStr = new TextDecoder().decode(bytes);
                const data = JSON.parse(jsonStr);
                if (data.type === 'story-video' || data.type === 'dream-narration' || data.type === 'dream-user-voice') {
                    setStoryData(data);
                }
            } catch (e) {
                console.error('Failed to parse story video data:', e);
            }
        }
    }, [url]);

    useEffect(() => {
        if (storyData && audioRef.current) {
            const audio = audioRef.current;

            const updateSegment = () => {
                const currentTime = audio.currentTime;
                const segment = storyData.segments.findIndex((s: any) =>
                    currentTime >= s.startTime && currentTime < s.endTime
                );
                if (segment !== -1) setCurrentSegment(segment);
            };

            audio.addEventListener('timeupdate', updateSegment);
            return () => audio.removeEventListener('timeupdate', updateSegment);
        }
    }, [storyData]);

    return (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-[95%] max-w-2xl ${isLight ? 'bg-mystic-card' : 'bg-dream-card'} border border-fuchsia-500/30 rounded-2xl overflow-hidden shadow-2xl relative max-h-[85vh] flex flex-col`}>
                <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center shrink-0">
                    <h2 className={`text-xl font-mystic font-bold ${isLight ? 'text-mystic-text' : 'text-white'}`}>{t.ui.video_ready}</h2>
                    <button aria-label={t.ui.close} onClick={onClose} className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center">
                        <span className="material-icons">close</span>
                    </button>
                </div>
                <div className="aspect-video bg-black relative overflow-hidden">
                    {storyData ? (
                        <>
                            {storyData.segments[currentSegment]?.imageUrl ? (
                                <img
                                    src={storyData.segments[currentSegment].imageUrl}
                                    alt={`Segment ${currentSegment + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
                                    <span className="text-4xl opacity-50">🌙</span>
                                </div>
                            )}
                            <div className="absolute bottom-12 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-white text-sm text-center">{storyData.segments[currentSegment]?.text}</p>
                            </div>
                            <audio ref={audioRef} controls autoPlay className="absolute bottom-1 left-2 right-2 h-8 opacity-80">
                                <source src={storyData.audioBase64.startsWith('data:') ? storyData.audioBase64 : `data:audio/mp3;base64,${storyData.audioBase64}`} type={storyData.type === 'dream-user-voice' ? 'audio/webm' : 'audio/mp3'} />
                            </audio>
                        </>
                    ) : url ? (
                        <video src={url} controls autoPlay className="w-full h-full" />
                    ) : null}
                </div>
                <div className="p-4 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl bg-fuchsia-600 text-white font-bold">OK</button>
                </div>
            </div>
        </div>
    );
};

const StyleSelectionModal = ({ onSelect, t, isLight }: { onSelect: (quality: 'normal' | 'high', style: 'cartoon' | 'anime' | 'real' | 'fantasy' | null) => void, t: any, isLight: boolean }) => {
    const [selectedStyle, setSelectedStyle] = useState<'cartoon' | 'anime' | 'real' | 'fantasy' | null>(null);

    const handleConfirm = () => {
        if (selectedStyle) {
            // Always use 'normal' quality since we removed quality selection
            onSelect('normal', selectedStyle);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-[95%] max-w-md ${isLight ? 'bg-mystic-card' : 'bg-dream-card'} border border-fuchsia-500/30 rounded-2xl overflow-hidden shadow-2xl relative max-h-[85vh] flex flex-col`}>
                <div className="px-5 py-4 border-b border-white/10 shrink-0">
                    <h2 className={`text-2xl font-mystic font-bold ${isLight ? 'text-mystic-text' : 'text-white'} text-center`}>
                        {t.ui.choose_image_style}
                    </h2>
                    <p className={`text-sm ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'} text-center mt-2`}>
                        {t.ui.choose_style_desc || 'Wähle einen Stil für dein Traumbild'}
                    </p>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                    {/* Style Selection */}
                    <div>
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-gray-700' : 'text-slate-300'} mb-3 text-center`}>
                            {t.ui.choose_style}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'cartoon', label: t.ui.style_cartoon || 'Cartoon', icon: '🎨', desc: t.ui.style_desc_cartoon },
                                { key: 'anime', label: t.ui.style_anime || 'Anime', icon: '⚡', desc: t.ui.style_desc_anime },
                                { key: 'real', label: t.ui.style_real || 'Real', icon: '📸', desc: t.ui.style_desc_real },
                                { key: 'fantasy', label: t.ui.style_fantasy || 'Fantasy', icon: '✨', desc: t.ui.style_desc_fantasy }
                            ].map((style) => (
                                <button
                                    key={style.key}
                                    onClick={() => setSelectedStyle(style.key as any)}
                                    className={`p-5 rounded-xl border-2 transition-all ${
                                        selectedStyle === style.key
                                            ? 'border-fuchsia-500 bg-fuchsia-500/20 scale-105'
                                            : `border-white/10 ${isLight ? 'bg-gray-100' : 'bg-white/5'} hover:border-fuchsia-500/50 hover:scale-102`
                                    }`}
                                >
                                    <div className="text-3xl mb-2">{style.icon}</div>
                                    <div className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                        {style.label}
                                    </div>
                                    <div className={`text-xs ${isLight ? 'text-mystic-text-secondary' : 'text-slate-400'} mt-1`}>
                                        {style.desc}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4 border-t border-white/10 flex justify-between items-center gap-3 shrink-0">
                    <button
                        onClick={() => onSelect('normal', null)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${
                            isLight
                                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                    >
                        {t.ui.continue_without_image}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedStyle}
                        className={`px-8 py-3 rounded-xl font-bold transition-all ${
                            selectedStyle
                                ? 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {t.ui.continue}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ImageResultModal = ({ onClose, url, t, isLight }: { onClose: () => void, url: string | null, t: any, isLight: boolean }) => (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-[95%] max-w-lg ${isLight ? 'bg-mystic-card' : 'bg-dream-card'} border border-fuchsia-500/30 rounded-2xl overflow-hidden shadow-2xl relative max-h-[85vh] flex flex-col`}>
                <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center shrink-0">
                    <h2 className={`text-xl font-mystic font-bold ${isLight ? 'text-mystic-text' : 'text-white'}`}>{t.ui.image_ready}</h2>
                    <button aria-label={t.ui.close} onClick={onClose} className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center">
                        <span className="material-icons">close</span>
                    </button>
                </div>
                <div className="bg-black overflow-y-auto flex-1">
                    {url && (
                        <img src={url} alt="Generated dream" className="w-full h-auto" />
                    )}
                </div>
                <div className="p-4 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl bg-fuchsia-600 text-white font-bold">OK</button>
                </div>
            </div>
    </div>
);

const AdOverlay = ({ t, duration }: { t: any, duration: number }) => (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center">
        <div className="w-full h-full absolute bg-gradient-to-br from-yellow-600 to-orange-600 animate-pulse opacity-20"></div>
        <span className="material-icons text-6xl text-white mb-4 animate-bounce">play_circle_filled</span>
        <h2 className="text-2xl font-bold text-white relative z-10">{t.sub.ad_loading}</h2>
        <div className="w-64 h-2 bg-gray-700 rounded mt-4 overflow-hidden relative z-10">
            <div className="h-full bg-white rounded-full transition-all" style={{animation: `width ${duration}ms linear forwards`, width: '0%'}}></div>
        </div>
    </div>
);

const AudioUploadConfirmModal = ({ onClose, t, isLight }: { onClose: () => void, t: any, isLight: boolean }) => {
    const handleConfirm = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-[95%] max-w-md ${isLight ? 'bg-mystic-card' : 'bg-dream-deep'} border ${isLight ? 'border-purple-200' : 'border-purple-500/30'} rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto`}>
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4 animate-bounce">🎤✨</div>
                    <h2 className={`text-2xl font-bold mb-3 ${isLight ? 'text-purple-900' : 'text-white'}`}>{t.ui.upload_confirm_title}</h2>
                    <p className={`text-sm leading-relaxed ${isLight ? 'text-purple-700' : 'text-purple-200'}`}>
                        {t.ui.upload_confirm_desc}
                    </p>
                </div>

                <button
                    onClick={handleConfirm}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-purple-500 hover:to-pink-500 transition-all"
                >
                    {t.ui.got_it}
                </button>
            </div>
        </div>
    );
};

const NavBtn = ({ icon, label, active, onClick, isLight }: { icon: string, label: string, active: boolean, onClick: () => void, isLight: boolean }) => (
    <button onClick={onClick} aria-current={active ? 'page' : undefined} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative ${active ? (isLight ? 'text-fuchsia-600' : 'text-white') : (isLight ? 'text-slate-400 hover:text-indigo-900' : 'text-slate-500 hover:text-slate-300')}`}>
        <span className={`material-icons transition-all duration-300 ${active ? 'text-[28px] text-fuchsia-500 drop-shadow-[0_0_8px_rgba(192,38,211,0.6)]' : 'text-2xl'}`}>{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wide max-w-[60px] truncate text-center">{label}</span>
        {active && <span className={`absolute -bottom-1 w-5 h-[3px] rounded-full ${isLight ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500' : 'bg-gradient-to-r from-fuchsia-500 to-violet-400'}`}></span>}
    </button>
);

const InfoModal = ({ onClose, data, t, isLight }: { onClose: () => void, data: any, t: any, isLight: boolean }) => {
    if (!data) return null;
    const modalBg = isLight ? 'bg-white/95 backdrop-blur-md border-indigo-100/60' : 'bg-dream-surface/95 backdrop-blur-md border-fuchsia-500/20';
    const textHead = isLight ? 'text-mystic-text' : 'text-white';
    const textBody = isLight ? 'text-mystic-text' : 'text-slate-300';
    const accentBg = isLight ? 'bg-indigo-50' : 'bg-white/5';
    const accentBorder = isLight ? 'border-indigo-200' : 'border-white/10';
    
    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 duration-300" onClick={onClose}>
            <div className={`w-[95%] max-w-md ${modalBg} border rounded-2xl p-0 shadow-2xl flex flex-col max-h-[85vh]`} onClick={e => e.stopPropagation()}>
                <div className="min-h-[6rem] bg-gradient-to-r from-indigo-900 via-fuchsia-900 to-purple-900 relative flex items-end p-5 pb-4 shrink-0 rounded-t-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                    <h2 className="text-2xl font-mystic font-bold text-white relative z-10 shadow-black drop-shadow-md pr-10 leading-tight">{data.title}</h2>
                    <button aria-label={t.ui.close} onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-black/30 rounded-full text-white flex items-center justify-center hover:bg-black/50 transition-colors z-20">
                        <span className="material-icons text-base">close</span>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <div><p className={`text-sm leading-relaxed ${textBody}`}>{data.desc}</p></div>
                    {(data.origin || data.bio) && (
                            <div className={`p-4 rounded-xl border ${accentBg} ${accentBorder}`}>
                                {data.origin && (
                                    <div className="mb-3">
                                        <h4 className={`text-xs uppercase font-bold tracking-widest mb-1 opacity-70 ${textHead}`}>{t.ui.info_origin}</h4>
                                        <p className={`text-sm ${textBody}`}>{data.origin}</p>
                                    </div>
                                )}
                                {data.bio && (
                                    <div>
                                        <h4 className={`text-xs uppercase font-bold tracking-widest mb-1 opacity-70 ${textHead}`}>{t.ui.info_bio}</h4>
                                        <p className={`text-sm leading-relaxed ${textBody}`}>{data.bio}</p>
                                    </div>
                                )}
                            </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;

