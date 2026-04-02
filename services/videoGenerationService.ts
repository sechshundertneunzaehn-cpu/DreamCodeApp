// videoGenerationService.ts - AI Video-Generierung
// Provider: Replicate (WAN 2.2 + Luma Ray) + Slideshow-Fallback

import { Language, SubscriptionTier } from '../types';

// ============================================
// API KEY
// ============================================
const getReplicateKey = (): string => {
    const envKey = (import.meta as any).env?.VITE_REPLICATE_API_KEY
        || (import.meta as any).env?.REPLICATE_API_KEY
        || (typeof process !== 'undefined' && process.env?.REPLICATE_API_KEY)
        || '';
    return envKey;
};

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
// REPLICATE - WAN 2.2 (guenstig, ~$0.09/5s)
// ============================================
const generateVideoWAN = async (
    options: VideoGenerationOptions
): Promise<VideoGenerationResult> => {
    const apiKey = getReplicateKey();
    if (!apiKey || apiKey.length < 5) {
        throw new Error('Replicate API-Key fehlt');
    }

    const prompt = optimizePromptForVideo(options.prompt, options.style);
    console.log('[WAN] Starte Video-Generierung...');
    const startTime = Date.now();

    try {
        // Schritt 1: Prediction starten
        const createRes = await fetch('/api/replicate/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'wan-video/wan-2.2-t2v-480p',
                input: {
                    prompt: prompt,
                    negative_prompt: 'blurry, low quality, distorted, ugly, text, watermark',
                    num_frames: 81,
                    fps: 16,
                    guidance_scale: 5.0,
                    num_inference_steps: 30
                }
            })
        });

        if (!createRes.ok) {
            // Fallback: try older API format
            const createRes2 = await fetch('/api/replicate/v1/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    version: 'wan-video/wan-2.2-t2v-480p',
                    input: {
                        prompt: prompt,
                        negative_prompt: 'blurry, low quality, distorted',
                        num_frames: 81,
                        fps: 16
                    }
                })
            });
            if (!createRes2.ok) {
                const err = await createRes2.text();
                throw new Error(`Replicate API-Fehler: ${createRes2.status} - ${err}`);
            }
            const data2 = await createRes2.json();
            return await pollReplicateResult(data2, apiKey, startTime, 'replicate_wan');
        }

        const createData = await createRes.json();
        return await pollReplicateResult(createData, apiKey, startTime, 'replicate_wan');

    } catch (error) {
        console.error('[WAN] Fehler:', error);
        throw error;
    }
};

// ============================================
// REPLICATE - Luma Ray Flash 2 (Premium, ~$0.24/5s)
// ============================================
const generateVideoLuma = async (
    options: VideoGenerationOptions
): Promise<VideoGenerationResult> => {
    const apiKey = getReplicateKey();
    if (!apiKey || apiKey.length < 5) {
        throw new Error('Replicate API-Key fehlt');
    }

    const prompt = optimizePromptForVideo(options.prompt, options.style);
    console.log('[LUMA] Starte Premium Video-Generierung...');
    const startTime = Date.now();

    try {
        const createRes = await fetch('/api/replicate/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version: 'luma/ray',
                input: {
                    prompt: prompt,
                    aspect_ratio: options.aspectRatio || '16:9',
                    loop: false
                }
            })
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            throw new Error(`Luma API-Fehler: ${createRes.status} - ${err}`);
        }

        const createData = await createRes.json();
        return await pollReplicateResult(createData, apiKey, startTime, 'replicate_luma');

    } catch (error) {
        console.error('[LUMA] Fehler:', error);
        throw error;
    }
};

// ============================================
// REPLICATE POLLING
// ============================================
const pollReplicateResult = async (
    prediction: any,
    apiKey: string,
    startTime: number,
    provider: VideoProvider
): Promise<VideoGenerationResult> => {
    const predictionId = prediction.id;
    const getUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${predictionId}`;

    let attempts = 0;
    const maxAttempts = 120; // 10 Minuten max (5s * 120)

    while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000));

        const statusRes = await fetch(getUrl.replace('https://api.replicate.com', '/api/replicate'), {
            headers: { 'Authorization': `Token ${apiKey}` }
        });

        if (!statusRes.ok) {
            attempts++;
            continue;
        }

        const statusData = await statusRes.json();
        console.log(`[${provider}] Status: ${statusData.status}, Versuch ${attempts + 1}/${maxAttempts}`);

        if (statusData.status === 'succeeded') {
            const output = statusData.output;
            const videoUrl = typeof output === 'string' ? output : (Array.isArray(output) ? output[0] : output?.url || output?.video);

            if (!videoUrl) {
                throw new Error('Kein Video-URL in der Antwort');
            }

            return {
                videoUrl,
                provider,
                duration: 5,
                generationTime: Date.now() - startTime,
                cost: provider === 'replicate_luma' ? 0.24 : 0.09
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
    const apiKey = getReplicateKey();
    const hasKey = apiKey && apiKey.length > 5;

    console.log(`[VIDEO] Starte Generierung fuer Tier: ${subscriptionTier}, Key vorhanden: ${hasKey}`);

    // Premium: Luma Ray (beste Qualitaet)
    if (hasKey && (subscriptionTier === SubscriptionTier.PRO || subscriptionTier === SubscriptionTier.SMART)) {
        try {
            return await generateVideoLuma(options);
        } catch (error) {
            console.warn('[VIDEO] Luma fehlgeschlagen, versuche WAN...', error);
        }
    }

    // Standard: WAN 2.2 (guenstig)
    if (hasKey) {
        try {
            return await generateVideoWAN(options);
        } catch (error) {
            console.warn('[VIDEO] WAN fehlgeschlagen, Fallback auf Slideshow...', error);
        }
    }

    // Fallback: Slideshow
    if (slideshowFallback) {
        console.log('[VIDEO] Verwende Slideshow-Fallback');
        return await slideshowFallback();
    }

    throw new Error('Video-Generierung nicht verfuegbar. Replicate API-Key fehlt.');
};

// ============================================
// HILFSFUNKTIONEN
// ============================================
export const isReplicateConfigured = (): boolean => {
    const key = getReplicateKey();
    return key.length > 5;
};

export const getAvailableProviders = (tier: SubscriptionTier): VideoProvider[] => {
    const providers: VideoProvider[] = ['slideshow'];
    if (isReplicateConfigured()) {
        providers.push('replicate_wan');
        if (tier === SubscriptionTier.PRO || tier === SubscriptionTier.SMART) {
            providers.push('replicate_luma');
        }
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
