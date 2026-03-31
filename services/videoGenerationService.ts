// videoGenerationService.ts - AI Video-Generierung fuer Premium-User
// Unterstuetzt: Runway Gen-3, Pika Labs, Kling AI

import { Language, SubscriptionTier } from '../types';

// ============================================
// API KEY MANAGEMENT
// ============================================
const getRunwayKey = () => {
    const envKey = import.meta.env.VITE_RUNWAY_API_KEY;
    return (envKey && envKey.length > 5) ? envKey : 'RUNWAY_API_KEY_HIER_EINFUEGEN';
};

const getPikaKey = () => {
    const envKey = import.meta.env.VITE_PIKA_API_KEY;
    return (envKey && envKey.length > 5) ? envKey : 'PIKA_API_KEY_HIER_EINFUEGEN';
};

const getKlingKey = () => {
    const envKey = import.meta.env.VITE_KLING_API_KEY;
    return (envKey && envKey.length > 5) ? envKey : 'KLING_API_KEY_HIER_EINFUEGEN';
};

// ============================================
// VIDEO PROVIDER TYPEN
// ============================================
export type VideoProvider = 'runway' | 'pika' | 'kling' | 'slideshow';

export interface VideoGenerationResult {
    videoUrl: string;
    provider: VideoProvider;
    duration: number;       // in Sekunden
    thumbnailUrl?: string;
    generationTime?: number; // in Millisekunden
    cost?: number;          // geschaetzte Kosten in EUR
}

export interface VideoGenerationOptions {
    prompt: string;
    duration?: number;      // gewuenschte Dauer in Sekunden
    aspectRatio?: '16:9' | '9:16' | '1:1';
    style?: 'cinematic' | 'dreamlike' | 'surreal' | 'fantasy';
    imageUrl?: string;      // Optional: Startbild
    language?: Language;
}

// ============================================
// PROVIDER-KONFIGURATION
// ============================================
const PROVIDER_CONFIG = {
    runway: {
        name: 'Runway Gen-3 Alpha',
        quality: 'Exzellent',
        maxDuration: 10,
        costPerVideo: 0.75,   // EUR (geschaetzt)
        requiredTier: SubscriptionTier.VIP
    },
    pika: {
        name: 'Pika Labs',
        quality: 'Sehr gut',
        maxDuration: 4,
        costPerVideo: 0.20,
        requiredTier: SubscriptionTier.PRO
    },
    kling: {
        name: 'Kling AI',
        quality: 'Sehr gut',
        maxDuration: 5,
        costPerVideo: 0.25,
        requiredTier: SubscriptionTier.PRO
    },
    slideshow: {
        name: 'Slideshow (Bilder + TTS)',
        quality: 'Gut',
        maxDuration: 30,
        costPerVideo: 0.10,
        requiredTier: SubscriptionTier.FREE
    }
};

// ============================================
// TRAUM-PROMPT OPTIMIERUNG
// ============================================
const optimizePromptForVideo = (
    dreamDescription: string,
    style: string = 'dreamlike'
): string => {
    const stylePrefix: Record<string, string> = {
        cinematic: 'Cinematic film quality, dramatic lighting, slow motion, movie-like atmosphere,',
        dreamlike: 'Dreamlike ethereal atmosphere, soft glow, floating particles, mystical fog, otherworldly,',
        surreal: 'Surrealist art style, impossible geometry, melting objects, Salvador Dali inspired,',
        fantasy: 'Epic fantasy, magical particles, enchanted forest, glowing elements, mystical creatures,'
    };

    const prefix = stylePrefix[style] || stylePrefix.dreamlike;

    return `${prefix} ${dreamDescription}. Smooth camera movement, ambient lighting, atmospheric. High quality, 4K resolution.`;
};

// ============================================
// RUNWAY GEN-3 ALPHA
// ============================================
const generateVideoRunway = async (
    options: VideoGenerationOptions
): Promise<VideoGenerationResult> => {
    const apiKey = getRunwayKey();

    if (apiKey === 'RUNWAY_API_KEY_HIER_EINFUEGEN') {
        throw new Error('Runway API-Key nicht konfiguriert. Bitte in .env.local eintragen: VITE_RUNWAY_API_KEY=...');
    }

    const prompt = optimizePromptForVideo(options.prompt, options.style);
    const duration = Math.min(options.duration || 5, 10);

    console.log(`[RUNWAY] Generiere Video: ${duration}s`);
    console.log(`[RUNWAY] Prompt: ${prompt.substring(0, 100)}...`);

    const startTime = Date.now();

    try {
        // Schritt 1: Video-Generierung starten
        const createResponse = await fetch('https://api.runwayml.com/v1/text_to_video', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gen-3-alpha',
                prompt: prompt,
                duration: duration,
                aspect_ratio: options.aspectRatio || '16:9',
                ...(options.imageUrl && { image_url: options.imageUrl })
            })
        });

        if (!createResponse.ok) {
            const error = await createResponse.json().catch(() => ({}));
            throw new Error(`Runway API-Fehler: ${createResponse.status} - ${error.message || 'Unbekannt'}`);
        }

        const createData = await createResponse.json();
        const taskId = createData.id;

        // Schritt 2: Auf Fertigstellung warten (Polling)
        let videoUrl = '';
        let attempts = 0;
        const maxAttempts = 60; // 5 Minuten max

        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5 Sekunden warten

            const statusResponse = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });

            const statusData = await statusResponse.json();

            if (statusData.status === 'completed') {
                videoUrl = statusData.output_url;
                break;
            } else if (statusData.status === 'failed') {
                throw new Error(`Runway Generierung fehlgeschlagen: ${statusData.error}`);
            }

            attempts++;
            console.log(`[RUNWAY] Status: ${statusData.status}, Versuch ${attempts}/${maxAttempts}`);
        }

        if (!videoUrl) {
            throw new Error('Runway Timeout: Video-Generierung hat zu lange gedauert');
        }

        const generationTime = Date.now() - startTime;

        return {
            videoUrl,
            provider: 'runway',
            duration,
            generationTime,
            cost: PROVIDER_CONFIG.runway.costPerVideo
        };

    } catch (error) {
        console.error('[RUNWAY] Fehler:', error);
        throw error;
    }
};

// ============================================
// PIKA LABS
// ============================================
const generateVideoPika = async (
    options: VideoGenerationOptions
): Promise<VideoGenerationResult> => {
    const apiKey = getPikaKey();

    if (apiKey === 'PIKA_API_KEY_HIER_EINFUEGEN') {
        throw new Error('Pika Labs API-Key nicht konfiguriert. Bitte in .env.local eintragen: VITE_PIKA_API_KEY=...');
    }

    const prompt = optimizePromptForVideo(options.prompt, options.style);

    console.log(`[PIKA] Generiere Video...`);

    const startTime = Date.now();

    try {
        const response = await fetch('https://api.pika.art/v1/generate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                style: 'cinematic',
                duration: 4,
                aspect_ratio: options.aspectRatio || '16:9',
                ...(options.imageUrl && { image: options.imageUrl })
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Pika API-Fehler: ${response.status} - ${error.message || 'Unbekannt'}`);
        }

        const data = await response.json();

        return {
            videoUrl: data.video_url || data.url,
            provider: 'pika',
            duration: 4,
            thumbnailUrl: data.thumbnail_url,
            generationTime: Date.now() - startTime,
            cost: PROVIDER_CONFIG.pika.costPerVideo
        };

    } catch (error) {
        console.error('[PIKA] Fehler:', error);
        throw error;
    }
};

// ============================================
// KLING AI
// ============================================
const generateVideoKling = async (
    options: VideoGenerationOptions
): Promise<VideoGenerationResult> => {
    const apiKey = getKlingKey();

    if (apiKey === 'KLING_API_KEY_HIER_EINFUEGEN') {
        throw new Error('Kling AI API-Key nicht konfiguriert. Bitte in .env.local eintragen: VITE_KLING_API_KEY=...');
    }

    const prompt = optimizePromptForVideo(options.prompt, options.style);

    console.log(`[KLING] Generiere Video...`);

    const startTime = Date.now();

    try {
        const response = await fetch('https://api.klingai.com/v1/generate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                duration: 5,
                aspect_ratio: options.aspectRatio || '16:9',
                quality: 'high'
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Kling API-Fehler: ${response.status} - ${error.message || 'Unbekannt'}`);
        }

        const data = await response.json();

        return {
            videoUrl: data.video_url,
            provider: 'kling',
            duration: 5,
            generationTime: Date.now() - startTime,
            cost: PROVIDER_CONFIG.kling.costPerVideo
        };

    } catch (error) {
        console.error('[KLING] Fehler:', error);
        throw error;
    }
};

// ============================================
// HAUPTFUNKTION: Tier-basierte Video-Generierung
// ============================================
export const generateDreamVideo = async (
    options: VideoGenerationOptions,
    subscriptionTier: SubscriptionTier,
    slideshowFallback?: () => Promise<VideoGenerationResult>
): Promise<VideoGenerationResult> => {

    console.log(`[VIDEO] Starte Generierung fuer Tier: ${subscriptionTier}`);

    // VIP: Runway Gen-3 (beste Qualitaet)
    if (subscriptionTier === SubscriptionTier.VIP) {
        if (isRunwayConfigured()) {
            try {
                return await generateVideoRunway(options);
            } catch (error) {
                console.warn('[VIDEO] Runway fehlgeschlagen, versuche Pika...', error);
            }
        }
    }

    // GOLD/VIP: Pika Labs oder Kling
    if (subscriptionTier === SubscriptionTier.PRO || subscriptionTier === SubscriptionTier.VIP) {
        if (isPikaConfigured()) {
            try {
                return await generateVideoPika(options);
            } catch (error) {
                console.warn('[VIDEO] Pika fehlgeschlagen, versuche Kling...', error);
            }
        }

        if (isKlingConfigured()) {
            try {
                return await generateVideoKling(options);
            } catch (error) {
                console.warn('[VIDEO] Kling fehlgeschlagen, Fallback auf Slideshow...', error);
            }
        }
    }

    // Fallback: Slideshow (alle Tiers)
    if (slideshowFallback) {
        console.log('[VIDEO] Verwende Slideshow-Fallback');
        return await slideshowFallback();
    }

    throw new Error('Keine Video-Generierung verfuegbar. Bitte API-Keys konfigurieren oder Abo upgraden.');
};

// ============================================
// HILFSFUNKTIONEN
// ============================================

export const isRunwayConfigured = (): boolean => {
    const key = getRunwayKey();
    return key !== 'RUNWAY_API_KEY_HIER_EINFUEGEN' && key.length > 10;
};

export const isPikaConfigured = (): boolean => {
    const key = getPikaKey();
    return key !== 'PIKA_API_KEY_HIER_EINFUEGEN' && key.length > 10;
};

export const isKlingConfigured = (): boolean => {
    const key = getKlingKey();
    return key !== 'KLING_API_KEY_HIER_EINFUEGEN' && key.length > 10;
};

export const getAvailableProviders = (tier: SubscriptionTier): VideoProvider[] => {
    const providers: VideoProvider[] = ['slideshow'];

    if (tier === SubscriptionTier.PRO || tier === SubscriptionTier.VIP || tier === SubscriptionTier.DELUXE) {
        if (isPikaConfigured()) providers.push('pika');
        if (isKlingConfigured()) providers.push('kling');
    }

    if (tier === SubscriptionTier.VIP) {
        if (isRunwayConfigured()) providers.push('runway');
    }

    return providers;
};

export const getProviderInfo = (provider: VideoProvider) => {
    return PROVIDER_CONFIG[provider];
};

// Schaetzt Gesamtkosten fuer Video-Feature
export const estimateVideoCosts = (
    videosPerMonth: number,
    tier: SubscriptionTier
): { provider: VideoProvider; totalCost: number } => {
    let provider: VideoProvider = 'slideshow';
    let costPerVideo = 0.10;

    if (tier === SubscriptionTier.VIP && isRunwayConfigured()) {
        provider = 'runway';
        costPerVideo = 0.75;
    } else if ((tier === SubscriptionTier.PRO || tier === SubscriptionTier.VIP) && isPikaConfigured()) {
        provider = 'pika';
        costPerVideo = 0.20;
    }

    return {
        provider,
        totalCost: videosPerMonth * costPerVideo
    };
};
