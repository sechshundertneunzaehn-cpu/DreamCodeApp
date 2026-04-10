// Speech-to-Text Service — proxied via /api/transcribe (Gemini server-side)
import { Language, UserProfile } from "../types";
import { apiUrl } from './apiConfig';

export const transcribeAudio = async (
    audioBlob: Blob,
    language: Language,
    _userProfile: UserProfile | null
): Promise<string> => {
    const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
    });

    const response = await fetch(apiUrl('/api/transcribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: audioBlob.type || 'audio/webm',
            language,
        }),
    });

    if (!response.ok) {
        throw new Error('Transkription fehlgeschlagen. Bitte versuchen Sie es erneut.');
    }

    const data = await response.json() as { transcription?: string };
    if (!data.transcription) {
        throw new Error('No transcription received');
    }

    return data.transcription;
};
