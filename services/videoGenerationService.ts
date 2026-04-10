// videoGenerationService.ts - AI Video-Generierung
// Provider: Replicate (WAN 2.2 + Luma Ray) + Slideshow-Fallback

import { Language, SubscriptionTier } from '../types';

// API keys are server-side only — video generation goes through /api/generate-video

// ============================================
// TYPES
// ============================================
export type VideoProvider = 'replicate_wan' | 'replicate_luma' | 'slideshow';

export interface VideoGenerationResult {
    videoUrl: string;
    provider: VideoProvider;
    duration: number;
    thumbnailUrl?: string;
    generationTime?: number;
    cost?: number;
}

export interface VideoGenerationOptions {
    prompt: string;
    duration?: number;
    aspectRatio?: '16:9' | '9:16' | '1:1';
    style?: 'cinematic' | 'dreamlike' | 'surreal' | 'fantasy' | 'cartoon' | 'anime' | 'real';
    imageUrl?: string;
    language?: Language;
}

// ============================================
// PROMPT OPTIMIERUNG
// ============================================
const optimizePromptForVideo = (
    dreamDescription: string,
    style: string = 'dreamlike'
): string => {
    const stylePrefix: Record<string, string> = {
        cinematic: 'Cinematic film quality, dramatic lighting, slow motion, movie-like atmosphere,',
        dreamlike: 'Dreamlike ethereal atmosphere, soft glow, floating particles, mystical fog, otherworldly,',
        surreal: 'Surrealist art style, impossible geometry, melting objects, Salvador Dali inspired,',
        fantasy: 'Epic fantasy, magical particles, enchanted forest, glowing elements, mystical creatures,',
        cartoon: 'Vibrant cartoon style, colorful, animated look, playful,',
        anime: 'Japanese anime style, cinematic, detailed, Studio Ghibli inspired,',
        real: 'Photorealistic, cinematic 4K, natural lighting, ultra detailed,'
    };
    const prefix = stylePrefix[style] || stylePrefix.dreamlike;
    return `${prefix} ${dreamDescription}. Smooth camera movement, ambient lighting, atmospheric. High quality.`;
};

// ============================================
// REPLICATE - WAN via /api/generate-video Proxy
// ============================================
const generateVideoWAN = async (
    options: VideoGenerationOptions
): Promise<VideoGenerationResult> => {
    const startTime = Date.now();

    try {
        const createRes = await fetch('/api/generate-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: options.prompt,
                style: options.style || 'dreamlike',
                aspectRatio: options.aspectRatio || '16:9',
            })
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            throw new Error(`generate-video Fehler: ${createRes.status} - ${err}`);
        }

        const createData = await createRes.json();
        return await pollViaProxy(createData, startTime, 'replicate_wan');

    } catch (error) {
        console.error('[WAN] Fehler:', error);
        throw error;
    }
};

// ============================================
// POLLING via /api/generate-video?id=xxx
// ============================================
const pollViaProxy = async (
    prediction: any,
    startTime: number,
    provider: VideoProvider
): Promise<VideoGenerationResult> => {
    const predictionId = prediction.id;
    if (!predictionId) {
        throw new Error('Keine Prediction-ID in der Antwort');
    }

    let attempts = 0;
    const maxAttempts = 120; // 10 Minuten max (5s * 120)

    while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000));

        const statusRes = await fetch(`/api/generate-video?id=${predictionId}`);

        if (!statusRes.ok) {
            attempts++;
            continue;
        }

        const statusData = await statusRes.json();

        if (statusData.status === 'succeeded') {
            const output = statusData.output;
            const videoUrl = typeof output === 'string' ? output
                : Array.isArray(output) ? output[0]
                : output?.url || output?.video || null;

            if (!videoUrl) {
                throw new Error('Kein Video-URL in der Antwort');
            }

            return {
                videoUrl,
                provider,
                duration: 5,
                generationTime: Date.now() - startTime,
                cost: 0.09
            };
        }

        if (statusData.status === 'failed' || statusData.status === 'canceled') {
            throw new Error(`Video-Generierung fehlgeschlagen: ${statusData.error || 'Unbekannter Fehler'}`);
        }

        attempts++;
    }

    throw new Error('Video-Generierung Timeout (10 Minuten ueberschritten)');
};

// ============================================
// SZENEN-ANALYSE (fuer kontext-basierte Timeline)
// ============================================
export interface VideoScene {
    text: string;
    keywords: string[];
    startTime: number;  // in Sekunden
    endTime: number;
    imagePrompt: string;
    imageUrl?: string;
}

export const analyzeTextForScenes = (text: string, totalDuration: number = 30): VideoScene[] => {
    // Teile den Text in Saetze
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 3);
    if (sentences.length === 0) return [];

    const sceneDuration = totalDuration / sentences.length;

    return sentences.map((sentence, i) => {
        // Extrahiere Schluesselwoerter fuer Bildgenerierung
        const keywords = extractKeywords(sentence);
        const imagePrompt = `${sentence}. Dreamlike, mystical atmosphere, high quality illustration.`;

        return {
            text: sentence,
            keywords,
            startTime: i * sceneDuration,
            endTime: (i + 1) * sceneDuration,
            imagePrompt
        };
    });
};

const extractKeywords = (text: string): string[] => {
    // Einfache Keyword-Extraktion -- entferne Stoppwoerter
    const stopwords = ['ich', 'bin', 'war', 'und', 'der', 'die', 'das', 'ein', 'eine', 'in', 'auf', 'an', 'am', 'zu', 'mit', 'von', 'aus', 'nach', 'bei', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'i', 'was', 'were', 'is', 'are', 'and', 'but', 'or'];
    return text.toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopwords.includes(w))
        .slice(0, 5);
};

// ============================================
// HAUPTFUNKTION
// ============================================
export const generateDreamVideo = async (
    options: VideoGenerationOptions,
    subscriptionTier: SubscriptionTier,
    slideshowFallback?: () => Promise<VideoGenerationResult>
): Promise<VideoGenerationResult> => {
    // WAN via server-side proxy (key lives in Vercel env)
    try {
        return await generateVideoWAN(options);
    } catch (error) {
        console.warn('[VIDEO] WAN fehlgeschlagen, Fallback auf Slideshow...', error);
    }

    if (slideshowFallback) {
        return await slideshowFallback();
    }

    throw new Error('Video-Generierung nicht verfuegbar.');
};

// ============================================
// HILFSFUNKTIONEN
// ============================================
// Server-side keys — assume configured in production
export const isReplicateConfigured = (): boolean => true;

export const getAvailableProviders = (tier: SubscriptionTier): VideoProvider[] => {
    const providers: VideoProvider[] = ['slideshow', 'replicate_wan'];
    if (tier === SubscriptionTier.PRO || tier === SubscriptionTier.SMART) {
        providers.push('replicate_luma');
    }
    return providers;
};

export const getProviderInfo = (provider: VideoProvider) => {
    const config: Record<VideoProvider, { name: string; quality: string; maxDuration: number; costPerVideo: number }> = {
        replicate_wan: { name: 'WAN 2.2 (480p)', quality: 'Gut', maxDuration: 5, costPerVideo: 0.09 },
        replicate_luma: { name: 'Luma Ray Flash', quality: 'Exzellent', maxDuration: 5, costPerVideo: 0.24 },
        slideshow: { name: 'Slideshow (Bilder + Audio)', quality: 'Gut', maxDuration: 60, costPerVideo: 0.05 }
    };
    return config[provider];
};
