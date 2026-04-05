// elevenlabsService.ts - Premium Text-to-Speech mit ElevenLabs
// Emotionale, natuerliche Stimmen fuer alle 8 Sprachen

import { Language } from '../types';

// ============================================
// API KEY MANAGEMENT
// ============================================
const getElevenLabsKey = () => {
    const envKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    // TODO: Spaeter ins Backend verschieben!
    return (envKey && envKey.length > 5) ? envKey : 'ELEVENLABS_API_KEY_HIER_EINFUEGEN';
};

// ============================================
// VOICE MAPPING - Optimale Stimmen pro Sprache
// ============================================
// ElevenLabs bietet verschiedene Stimmen, die fuer bestimmte Sprachen optimiert sind
// eleven_multilingual_v2 unterstuetzt alle 8 Sprachen

export const ELEVENLABS_VOICES: Record<Language, { id: string; name: string; description: string }> = {
    [Language.DE]: {
        id: 'EXAVITQu4vr4xnSDxMaL',  // Bella - weiche, warme deutsche Stimme
        name: 'Bella',
        description: 'Warm, einfuehlsam, ideal fuer Traumdeutung'
    },
    [Language.EN]: {
        id: '21m00Tcm4TlvDq8ikWAM',  // Rachel - professionelle englische Stimme
        name: 'Rachel',
        description: 'Klar, beruhigend, professionell'
    },
    [Language.TR]: {
        id: 'onwK4e9ZLuTAKqWW03F9',  // Daniel - multilingual mit guter tuerkischer Aussprache
        name: 'Daniel',
        description: 'Vielseitig, gute tuerkische Aussprache'
    },
    [Language.ES]: {
        id: 'AZnzlk1XvdvUeBnXmlld',  // Domi - temperamentvolle spanische Stimme
        name: 'Domi',
        description: 'Expressiv, emotionale spanische Stimme'
    },
    [Language.FR]: {
        id: 'ThT5KcBeYPX3keUQqHPh',  // Nicole - elegante franzoesische Stimme
        name: 'Nicole',
        description: 'Elegant, sanft, mystisch'
    },
    [Language.AR]: {
        id: 'pqHfZKP75CvOlQylNhV4',  // Bill - gute arabische Unterstuetzung
        name: 'Bill',
        description: 'Ruhig, respektvoll, arabisch-optimiert'
    },
    [Language.PT]: {
        id: 'TxGEqnHWrfWFTfGW9XjX',  // Josh - warme portugiesische Stimme
        name: 'Josh',
        description: 'Freundlich, warm, brasilianisch/portugiesisch'
    },
    [Language.RU]: {
        id: 'VR6AewLTigWG4xSOukaG',  // Arnold - tiefe russische Stimme
        name: 'Arnold',
        description: 'Tief, beruhigend, russisch-optimiert'
    },
    [Language.ZH]: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Multilingual fallback' },
    [Language.HI]: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Multilingual fallback' },
    [Language.JA]: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Multilingual fallback' },
    [Language.KO]: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Multilingual fallback' },
    [Language.ID]: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Multilingual fallback' },
    [Language.FA]: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Multilingual fallback' },
    [Language.IT]: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Multilingual, gute italienische Aussprache' },
    [Language.PL]: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Multilingual, gute polnische Aussprache' },
    [Language.BN]: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Multilingual fallback' },
    [Language.UR]: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Multilingual fallback' },
    [Language.VI]: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Multilingual fallback' },
    [Language.TH]: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Multilingual fallback' },
    [Language.SW]: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Multilingual fallback' },
    [Language.HU]: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Multilingual, gute ungarische Aussprache' }
};

// ============================================
// EMOTION SETTINGS - Stimmungsanpassung
// ============================================
export type EmotionStyle = 'calm' | 'dramatic' | 'mystical' | 'warm';

const getVoiceSettings = (emotion: EmotionStyle) => {
    switch (emotion) {
        case 'calm':
            return {
                stability: 0.75,        // Hohe Stabilitaet = ruhiger
                similarity_boost: 0.80,
                style: 0.20,            // Wenig Stil-Variation
                use_speaker_boost: true
            };
        case 'dramatic':
            return {
                stability: 0.40,        // Niedrigere Stabilitaet = expressiver
                similarity_boost: 0.75,
                style: 0.80,            // Viel Stil-Variation
                use_speaker_boost: true
            };
        case 'mystical':
            return {
                stability: 0.55,
                similarity_boost: 0.85,
                style: 0.50,            // Mittlere Variation fuer mystische Atmosphaere
                use_speaker_boost: true
            };
        case 'warm':
        default:
            return {
                stability: 0.65,
                similarity_boost: 0.80,
                style: 0.35,
                use_speaker_boost: true
            };
    }
};

// ============================================
// HAUPTFUNKTION: Text-to-Speech
// ============================================
export const generateSpeechElevenLabs = async (
    text: string,
    language: Language,
    emotion: EmotionStyle = 'mystical'
): Promise<ArrayBuffer> => {
    const apiKey = getElevenLabsKey();

    if (apiKey === 'ELEVENLABS_API_KEY_HIER_EINFUEGEN') {
        throw new Error('ElevenLabs API-Key nicht konfiguriert. Bitte in .env.local eintragen: VITE_ELEVENLABS_API_KEY=...');
    }

    const voice = ELEVENLABS_VOICES[language];
    const voiceSettings = getVoiceSettings(emotion);

    console.log(`[ELEVENLABS] Generiere Sprache: ${voice.name} (${language}), Emotion: ${emotion}`);
    console.log(`[ELEVENLABS] Text-Laenge: ${text.length} Zeichen`);

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}`,
            {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg'
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_multilingual_v2',  // Bestes Modell fuer mehrsprachig
                    voice_settings: voiceSettings
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[ELEVENLABS] API-Fehler:', response.status, errorText);
            throw new Error(`ElevenLabs API-Fehler: ${response.status} - ${errorText}`);
        }

        const audioBuffer = await response.arrayBuffer();
        console.log(`[ELEVENLABS] Audio generiert: ${audioBuffer.byteLength} bytes`);

        return audioBuffer;

    } catch (error) {
        console.error('[ELEVENLABS] Fehler bei der Sprachgenerierung:', error);
        throw error;
    }
};

// ============================================
// HILFSFUNKTIONEN
// ============================================

// Konvertiert ArrayBuffer zu Base64 fuer Speicherung
export const audioBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
};

// Erstellt Audio-URL aus ArrayBuffer fuer Playback
export const createAudioUrl = (buffer: ArrayBuffer): string => {
    const blob = new Blob([buffer], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
};

// Prueft ob ElevenLabs konfiguriert ist
export const isElevenLabsConfigured = (): boolean => {
    const key = getElevenLabsKey();
    return key !== 'ELEVENLABS_API_KEY_HIER_EINFUEGEN' && key.length > 10;
};

// Schaetzt Kosten fuer Text (ca. 0.30 USD pro 1000 Zeichen bei Starter)
export const estimateCost = (text: string): { characters: number; estimatedCostUSD: number } => {
    const characters = text.length;
    const costPer1000 = 0.30; // USD, Starter-Plan
    const estimatedCostUSD = (characters / 1000) * costPer1000;
    return { characters, estimatedCostUSD };
};

// ============================================
// FALLBACK ZU DEEPGRAM (wenn ElevenLabs nicht verfuegbar)
// ============================================
export const generateSpeechWithFallback = async (
    text: string,
    language: Language,
    emotion: EmotionStyle = 'mystical',
    deepgramFallback: (text: string, language: Language) => Promise<ArrayBuffer>
): Promise<{ audio: ArrayBuffer; provider: 'elevenlabs' | 'deepgram' }> => {

    // Versuche zuerst ElevenLabs (Premium)
    if (isElevenLabsConfigured()) {
        try {
            const audio = await generateSpeechElevenLabs(text, language, emotion);
            return { audio, provider: 'elevenlabs' };
        } catch (error) {
            console.warn('[ELEVENLABS] Fallback zu Deepgram:', error);
        }
    }

    // Fallback zu Deepgram
    const audio = await deepgramFallback(text, language);
    return { audio, provider: 'deepgram' };
};
