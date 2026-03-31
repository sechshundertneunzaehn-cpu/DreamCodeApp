// Speech-to-Text Service using Gemini
import { GoogleGenAI } from "@google/genai";
import { Language, UserProfile, SubscriptionTier } from "../types";
import { getProviderSecret } from '../config/providerRouting';

const createGeminiClient = (apiKey?: string): GoogleGenAI => {
    if (!apiKey) {
        throw new Error('Gemini API-Key fehlt. Bitte VITE_GEMINI_API_KEY setzen.');
    }
    return new GoogleGenAI({ apiKey });
};

const executeWithClient = async <T>(
    userProfile: UserProfile | null,
    operation: (client: GoogleGenAI) => Promise<T>
): Promise<T> => {
    const defaultKey = getProviderSecret('gemini');
    const isSmart = userProfile?.subscriptionTier === SubscriptionTier.SMART;
    const customKeys = userProfile?.customApiKeys || [];

    if (!isSmart || customKeys.length === 0) {
        return await operation(createGeminiClient(defaultKey));
    }

    let lastError: unknown = null;

    for (const key of customKeys) {
        try {
            return await operation(createGeminiClient(key));
        } catch (error) {
            console.warn(`[Smart Tier] Key failed: ${key.substring(0, 5)}...`, error);
            lastError = error;
        }
    }

    console.warn('[Smart Tier] All custom keys failed. Falling back to system key.');
    try {
        return await operation(createGeminiClient(defaultKey));
    } catch (error) {
        throw lastError || error;
    }
};

export const transcribeAudio = async (
    audioBlob: Blob,
    language: Language,
    userProfile: UserProfile | null
): Promise<string> => {
    return executeWithClient(userProfile, async (ai) => {
        try {
            const base64Audio = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(audioBlob);
            });

            const languageNames = {
                [Language.EN]: 'English',
                [Language.DE]: 'German (Deutsch)',
                [Language.TR]: 'Turkish (Turkce)',
                [Language.ES]: 'Spanish (Espanol)',
                [Language.FR]: 'French (Francais)',
                [Language.AR]: 'Arabic',
                [Language.PT]: 'Portuguese (Portugues)',
                [Language.RU]: 'Russian',
            };

            const langName = languageNames[language] || 'English';

            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash-002',
                contents: {
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'audio/webm',
                                data: base64Audio,
                            },
                        },
                        {
                            text: `Transcribe this audio recording accurately. The speaker is describing a dream in ${langName}. Return ONLY the transcribed text exactly as spoken, nothing else. Preserve all details and maintain the original language.`,
                        },
                    ],
                },
                config: {
                    temperature: 0.1,
                },
            });

            const transcription = response.text?.trim() || '';
            if (!transcription) {
                throw new Error('No transcription received');
            }

            return transcription;
        } catch (error) {
            console.error('Audio transcription error:', error);
            throw new Error('Transkription fehlgeschlagen. Bitte versuchen Sie es erneut.');
        }
    });
};
