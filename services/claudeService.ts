// claudeService.ts - Premium LLM mit Claude 3.5 Sonnet
// Tiefgehende psychologische und spirituelle Traumanalyse

import { Language, UserProfile, ReligiousCategory, ReligiousSource, SubscriptionTier } from '../types';
import { apiFetch } from './apiConfig';

// API key is kept server-side — calls go through /api/dream-analysis

// ============================================
// SPRACH-KONFIGURATION
// ============================================
const LANGUAGE_NAMES: Record<Language, { native: string; english: string }> = {
    [Language.DE]: { native: 'Deutsch', english: 'German' },
    [Language.EN]: { native: 'English', english: 'English' },
    [Language.TR]: { native: 'Tuerkce', english: 'Turkish' },
    [Language.ES]: { native: 'Espanol', english: 'Spanish' },
    [Language.FR]: { native: 'Francais', english: 'French' },
    [Language.AR]: { native: 'العربية', english: 'Arabic' },
    [Language.PT]: { native: 'Portugues', english: 'Portuguese' },
    [Language.RU]: { native: 'Русский', english: 'Russian' },
    [Language.ZH]: { native: '中文', english: 'Chinese' },
    [Language.HI]: { native: 'हिन्दी', english: 'Hindi' },
    [Language.JA]: { native: '日本語', english: 'Japanese' },
    [Language.KO]: { native: '한국어', english: 'Korean' },
    [Language.ID]: { native: 'Bahasa Indonesia', english: 'Indonesian' },
    [Language.FA]: { native: 'فارسی', english: 'Persian' },
    [Language.IT]: { native: 'Italiano', english: 'Italian' },
    [Language.PL]: { native: 'Polski', english: 'Polish' },
    [Language.BN]: { native: 'বাংলা', english: 'Bengali' },
    [Language.UR]: { native: 'اردو', english: 'Urdu' },
    [Language.VI]: { native: 'Tiếng Việt', english: 'Vietnamese' },
    [Language.TH]: { native: 'ภาษาไทย', english: 'Thai' },
    [Language.SW]: { native: 'Kiswahili', english: 'Swahili' },
    [Language.HU]: { native: 'Magyar', english: 'Hungarian' }
};

// ============================================
// ANALYSE-STILE (basierend auf ReligiousCategory)
// ============================================
const getAnalysisStyle = (category?: ReligiousCategory): string => {
    switch (category) {
        case ReligiousCategory.ISLAMIC:
            return `Du analysierst Traeume aus islamischer Perspektive, mit Bezug auf klassische
            Traumdeuter wie Ibn Sirin, An-Nabulsi und Al-Iskhafi. Beruecksichtige die spirituelle
            Bedeutung und moegliche prophetische Aspekte.`;

        case ReligiousCategory.CHRISTIAN:
            return `Du analysierst Traeume aus christlicher Perspektive, mit Bezug auf biblische
            Symbolik und kirchliche Traditionen der Traumdeutung. Beruecksichtige spirituelle
            Botschaften und goettliche Fuehrung.`;

        case ReligiousCategory.BUDDHIST:
            return `Du analysierst Traeume aus buddhistischer Perspektive, mit Fokus auf Karma,
            Anhaftung, Illusion (Maya) und den Weg zur Erleuchtung. Beruecksichtige Zen-,
            tibetische und Theravada-Traditionen.`;

        case ReligiousCategory.PSYCHOLOGICAL:
            return `Du analysierst Traeume aus psychologischer Perspektive, mit Bezug auf
            Sigmund Freud (Wunscherfuellung, Triebe), Carl Jung (Archetypen, Schatten, Anima/Animus)
            und Gestalttherapie (alle Traum-Elemente als Aspekte des Selbst).`;

        case ReligiousCategory.ASTROLOGY:
            return `Du analysierst Traeume aus astrologischer Perspektive, mit Bezug auf
            Planeteneinfluesse, Tierkreiszeichen und kosmische Energien. Beruecksichtige
            westliche, vedische und chinesische Astrologie.`;

        case ReligiousCategory.NUMEROLOGY:
            return `Du analysierst Traeume aus numerologischer Perspektive, mit Bezug auf
            Zahlensymbolik (pythagoraeisch, chaldaeisch, kabbalistisch). Beruecksichtige
            Lebenspfadnummern und die spirituelle Bedeutung von Zahlen im Traum.`;

        default:
            return `Du bist ein erfahrener Traumdeuter mit Expertise in verschiedenen Traditionen:
            - Psychologie (Jung, Freud, Gestalt)
            - Spirituelle Traditionen (Islam, Christentum, Buddhismus)
            - Esoterische Systeme (Astrologie, Numerologie)
            Waehle den passendsten Ansatz basierend auf dem Trauminhalt.`;
    }
};

// ============================================
// SYSTEM PROMPT - Optimiert fuer Traumdeutung
// ============================================
const buildSystemPrompt = (
    language: Language,
    userProfile?: UserProfile | null
): string => {
    const langInfo = LANGUAGE_NAMES[language];
    const analysisStyle = getAnalysisStyle(userProfile?.religion);

    return `${analysisStyle}

WICHTIGE ANWEISUNGEN:
1. Antworte IMMER auf ${langInfo.native} (${langInfo.english})
2. Sei einfuehlsam, respektvoll und nicht wertend
3. Erklaere Symbole und ihre moeglichen Bedeutungen
4. Gib praktische Hinweise, wie der Traeumer den Traum nutzen kann
5. Wenn der Traum beunruhigend ist, biete Trost und positive Perspektiven
6. Strukturiere deine Antwort klar mit Abschnitten

ANALYSE-STRUKTUR:
1. **Zusammenfassung**: Kurze Zusammenfassung des Traums (2-3 Saetze)
2. **Symbole**: Wichtige Symbole und ihre Bedeutung
3. **Emotionen**: Emotionale Aspekte und was sie zeigen
4. **Botschaft**: Die zentrale Botschaft oder Lehre des Traums
5. **Ratschlag**: Praktische Empfehlungen fuer den Alltag

${userProfile ? `
KONTEXT DES TRAEUMERS:
- Name: ${userProfile.name || 'Nicht angegeben'}
- Alter: ${userProfile.age || 'Nicht angegeben'}
- Geschlecht: ${userProfile.gender || 'Nicht angegeben'}
- Sternzeichen: ${userProfile.zodiacSign || 'Nicht angegeben'}
- Lebenspfadnummer: ${userProfile.lifePathNumber || 'Nicht angegeben'}
- Religioese Praeferenz: ${userProfile.religion || 'Keine spezifische'}
` : ''}

Sei tiefgruendig, aber verstaendlich. Verbinde alte Weisheit mit modernem Verstaendnis.`;
};

// ============================================
// RESPONSE INTERFACE
// ============================================
export interface ClaudeDreamAnalysis {
    interpretation: string;
    summary?: string;
    symbols?: Array<{ symbol: string; meaning: string }>;
    emotions?: string[];
    message?: string;
    advice?: string;
    provider: 'claude';
    model: string;
    tokensUsed?: number;
}

// ============================================
// HAUPTFUNKTION: Traumanalyse mit Claude
// ============================================
export const analyzeDreamWithClaude = async (
    dreamText: string,
    language: Language = Language.DE,
    userProfile?: UserProfile | null,
    preferredSource?: ReligiousSource
): Promise<ClaudeDreamAnalysis> => {
    const systemPrompt = buildSystemPrompt(language, userProfile);

    const response = await apiFetch('/api/dream-analysis', {
        method: 'POST',
        body: JSON.stringify({ dreamText, systemPrompt }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(`Claude API-Fehler: ${response.status} - ${err.error || 'Unbekannter Fehler'}`);
    }

    return response.json() as Promise<ClaudeDreamAnalysis>;
};

// ============================================
// HILFSFUNKTIONEN
// ============================================

// Claude laeuft serverseitig — immer verfuegbar wenn /api/dream-analysis erreichbar
export const isClaudeConfigured = (): boolean => true;

// Schaetzt Kosten fuer Analyse (ca. $0.003 pro 1K Input + $0.015 pro 1K Output)
export const estimateClaudeCost = (dreamTextLength: number): {
    estimatedInputTokens: number;
    estimatedOutputTokens: number;
    estimatedCostUSD: number
} => {
    // Grobe Schaetzung: 1 Token ~ 4 Zeichen
    const estimatedInputTokens = Math.ceil(dreamTextLength / 4) + 500; // +500 fuer System-Prompt
    const estimatedOutputTokens = 800; // Durchschnittliche Antwortlaenge

    const inputCost = (estimatedInputTokens / 1000) * 0.003;
    const outputCost = (estimatedOutputTokens / 1000) * 0.015;

    return {
        estimatedInputTokens,
        estimatedOutputTokens,
        estimatedCostUSD: inputCost + outputCost
    };
};

// ============================================
// VERGLEICHENDE ANALYSE (Optional)
// ============================================
// Analysiert den gleichen Traum aus mehreren Perspektiven
export const analyzeFromMultiplePerspectives = async (
    dreamText: string,
    language: Language,
    perspectives: ReligiousCategory[]
): Promise<Record<ReligiousCategory, string>> => {
    const results: Record<string, string> = {};

    // Hinweis: Dies ist teuer - nur fuer Premium-User!
    for (const perspective of perspectives) {
        try {
            const fakeProfile: UserProfile = {
                name: '',
                interests: [perspective],
                religion: perspective,
                age: undefined,
                gender: undefined,
                subscriptionTier: SubscriptionTier.FREE,
                credits: 0,
            };

            const analysis = await analyzeDreamWithClaude(dreamText, language, fakeProfile);
            results[perspective] = analysis.interpretation;
        } catch (error) {
            console.error(`[CLAUDE] Fehler bei Perspektive ${perspective}:`, error);
            results[perspective] = 'Analyse nicht verfuegbar';
        }
    }

    return results as Record<ReligiousCategory, string>;
};
