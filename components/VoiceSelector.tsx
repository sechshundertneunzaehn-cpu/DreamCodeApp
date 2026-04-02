import React, { useState } from 'react';
import { Language } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VoiceCharacter {
    id: string;
    name: string;
    gender: 'female' | 'male';
    voiceSuffix: string; // e.g. 'Achernar' -> appended to lang prefix 'de-DE-Chirp3-HD-'
    icon: string;        // material icon name
    descriptions: Record<string, string>; // per language
}

interface VoiceSelectorProps {
    mode: 'firstTime' | 'settings';
    language: string;
    currentVoiceId?: string;
    onSelect: (character: VoiceCharacter) => void;
    onClose?: () => void;
    isLight?: boolean;
}

// ---------------------------------------------------------------------------
// Voice characters data
// ---------------------------------------------------------------------------

export const VOICE_CHARACTERS: VoiceCharacter[] = [
    // ---- FEMALE ----
    {
        id: 'luna',
        name: 'Luna',
        gender: 'female',
        voiceSuffix: 'Achernar',
        icon: 'auto_awesome',
        descriptions: {
            de: 'Mystisch & Sanft – warme, geheimnisvolle Orakelstimme',
            tr: 'Gizemli & Nazik – sicak, esrarengiz kahin sesi',
            en: 'Mystical & Gentle – warm, mysterious oracle voice',
            es: 'Mistica & Suave – voz oraculo calida y misteriosa',
            fr: 'Mystique & Douce – voix oracle chaude et mysterieuse',
            ar: 'Ghaamida & Latiifa \u2013 sawt kahin daafi wa ghaamiD',
            pt: 'Mistico & Suave – voz oraculo quente e misteriosa',
            ru: 'Mистична & Нежна – тёплый, загадочный голос оракула',
        },
    },
    {
        id: 'aria',
        name: 'Aria',
        gender: 'female',
        voiceSuffix: 'Aoede',
        icon: 'psychology',
        descriptions: {
            de: 'Klar & Weise – kluge, ruhige Beraterstimme',
            tr: 'Net & Bilge – akilli, sakin danisman sesi',
            en: 'Clear & Wise – intelligent, calm counselor voice',
            es: 'Clara & Sabia – voz consejera inteligente y tranquila',
            fr: 'Claire & Sage – voix de conseillere intelligente et calme',
            ar: 'WaaDiHa & Haakiima \u2013 sawt mustashaar dhakiy wa haadi',
            pt: 'Clara & Sabia – voz conselheira inteligente e calma',
            ru: 'Ясная & Мудрая – умный, спокойный голос советника',
        },
    },
    {
        id: 'nova',
        name: 'Nova',
        gender: 'female',
        voiceSuffix: 'Leda',
        icon: 'bolt',
        descriptions: {
            de: 'Energisch & Jung – lebhafte, begeisterte Stimme',
            tr: 'Enerjik & Genc – canli, heyecanli ses',
            en: 'Energetic & Youthful – lively, enthusiastic voice',
            es: 'Energica & Joven – voz vivaz y entusiasta',
            fr: 'Energique & Jeune – voix vive et enthousiaste',
            ar: 'Nashiita & Shabaabiyya – sawt hayy wa mutaHamis',
            pt: 'Energica & Jovem – voz vivaz e entusiasmada',
            ru: 'Энергичная & Юная – живой, полный энтузиазма голос',
        },
    },
    // ---- MALE ----
    {
        id: 'orion',
        name: 'Orion',
        gender: 'male',
        voiceSuffix: 'Achird',
        icon: 'nights_stay',
        descriptions: {
            de: 'Tief & Ruhig – ruhige, tiefe Orakelstimme',
            tr: 'Derin & Sakin – sakin, derin kahin sesi',
            en: 'Deep & Calm – serene, deep oracle voice',
            es: 'Profundo & Tranquilo – voz oraculo serena y profunda',
            fr: 'Profond & Calme – voix oracle sereine et profonde',
            ar: 'Amiiq & Haadi \u2013 sawt kahin haadi wa amiiq',
            pt: 'Profundo & Calmo – voz oraculo serena e profunda',
            ru: 'Глубокий & Спокойный – безмятежный, глубокий голос оракула',
        },
    },
    {
        id: 'atlas',
        name: 'Atlas',
        gender: 'male',
        voiceSuffix: 'Charon',
        icon: 'explore',
        descriptions: {
            de: 'Stark & Weise – kraftvolle, weise Stimme',
            tr: 'Guclu & Bilge – guclu, bilge ses',
            en: 'Strong & Wise – powerful, wise voice',
            es: 'Fuerte & Sabio – voz poderosa y sabia',
            fr: 'Fort & Sage – voix puissante et sage',
            ar: 'Qawiy & Haakiim – sawt qawiy wa Haakiim',
            pt: 'Forte & Sabio – voz poderosa e sabia',
            ru: 'Сильный & Мудрый – мощный, мудрый голос',
        },
    },
    {
        id: 'zephyr',
        name: 'Zephyr',
        gender: 'male',
        voiceSuffix: 'Orus',
        icon: 'air',
        descriptions: {
            de: 'Sanft & Meditativ – ruhige, meditative Stimme',
            tr: 'Nazik & Meditatif – sakin, meditatif ses',
            en: 'Gentle & Meditative – calm, meditative voice',
            es: 'Suave & Meditativo – voz tranquila y meditativa',
            fr: 'Doux & Meditatif – voix calme et meditative',
            ar: 'LaTiif & Taammuli \u2013 sawt haadi wa taammuli',
            pt: 'Suave & Meditativo – voz calma e meditativa',
            ru: 'Мягкий & Медитативный – спокойный, медитативный голос',
        },
    },
];

// ---------------------------------------------------------------------------
// UI translations
// ---------------------------------------------------------------------------

const UI_TRANSLATIONS: Record<string, {
    title: string;
    male: string;
    female: string;
    confirm: string;
}> = {
    de: { title: 'Waehle die Stimme deines Orakels', male: 'Maennlich', female: 'Weiblich', confirm: 'Bestaetigen' },
    tr: { title: 'Kahininin Sesini Sec', male: 'Erkek', female: 'Kadin', confirm: 'Onayla' },
    en: { title: 'Choose your Oracle\'s voice', male: 'Male', female: 'Female', confirm: 'Confirm' },
    es: { title: 'Elige la voz de tu Oraculo', male: 'Masculino', female: 'Femenino', confirm: 'Confirmar' },
    fr: { title: 'Choisissez la voix de votre Oracle', male: 'Masculin', female: 'Feminin', confirm: 'Confirmer' },
    ar: { title: 'Ikhtaar Sawt Kahinak', male: 'Dhakar', female: 'Untha', confirm: 'Takiid' },
    pt: { title: 'Escolha a voz do seu Oraculo', male: 'Masculino', female: 'Feminino', confirm: 'Confirmar' },
    ru: { title: 'Выберите голос своего Оракула', male: 'Мужской', female: 'Женский', confirm: 'Подтвердить' },
};

function getUiText(language: string) {
    return UI_TRANSLATIONS[language] ?? UI_TRANSLATIONS['en'];
}

// ---------------------------------------------------------------------------
// Helper: get description for a character in current language
// ---------------------------------------------------------------------------

function getDesc(character: VoiceCharacter, language: string): string {
    return character.descriptions[language] ?? character.descriptions['en'] ?? '';
}

// ---------------------------------------------------------------------------
// VoiceCard – shared between both modes
// ---------------------------------------------------------------------------

interface VoiceCardProps {
    character: VoiceCharacter;
    isSelected: boolean;
    language: string;
    compact?: boolean;
    isLight?: boolean;
    onClick: () => void;
}

const VoiceCard: React.FC<VoiceCardProps> = ({ character, isSelected, language, compact, isLight, onClick }) => {
    const baseRing = isSelected
        ? isLight
            ? 'ring-2 ring-accent-primary shadow-mystic'
            : 'ring-2 ring-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.55)]'
        : isLight
            ? 'ring-1 ring-mystic-border hover:ring-accent-primary/50'
            : 'ring-1 ring-white/10 hover:ring-purple-400/50';

    const cardBg = isLight ? 'bg-white/70 hover:bg-white/90' : 'bg-white/5';
    const iconColor = isLight ? 'text-accent-primary' : 'text-purple-300';
    const nameColor = isLight ? 'text-mystic-text' : 'text-white';
    const descColor = isLight ? 'text-mystic-text-secondary' : 'text-white/60';

    if (compact) {
        return (
            <button
                onClick={onClick}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-3 rounded-xl min-w-[60px] min-h-[64px]
                    ${cardBg} transition-all duration-200 cursor-pointer active:scale-95 ${baseRing}`}
            >
                <span className={`material-icons text-2xl ${iconColor}`}>{character.icon}</span>
                <span className={`text-xs font-medium ${nameColor} whitespace-nowrap`}>{character.name}</span>
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl w-full text-center
                ${cardBg} transition-all duration-200 cursor-pointer ${baseRing}`}
        >
            <span className={`material-icons text-4xl ${iconColor}`}>{character.icon}</span>
            <span className={`text-base font-semibold ${nameColor}`}>{character.name}</span>
            <span className={`text-xs ${descColor} leading-snug line-clamp-2`}>
                {getDesc(character, language)}
            </span>
        </button>
    );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
    mode,
    language,
    currentVoiceId,
    onSelect,
    onClose,
    isLight,
}) => {
    const [selected, setSelected] = useState<string>(
        currentVoiceId ?? VOICE_CHARACTERS[0].id
    );

    const ui = getUiText(language);

    const females = VOICE_CHARACTERS.filter(v => v.gender === 'female');
    const males   = VOICE_CHARACTERS.filter(v => v.gender === 'male');

    const handleConfirm = () => {
        const character = VOICE_CHARACTERS.find(v => v.id === selected);
        if (character) {
            onSelect(character);
            onClose?.();
        }
    };

    // -----------------------------------------------------------------------
    // SETTINGS mode – two rows: female + male
    // -----------------------------------------------------------------------
    if (mode === 'settings') {
        return (
            <div className="space-y-3">
                <div>
                    <span className={`text-[10px] uppercase tracking-widest font-medium mb-1.5 block ${isLight ? 'text-fuchsia-600' : 'text-fuchsia-400'}`}>
                        {ui.female}
                    </span>
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                        {females.map(character => (
                            <VoiceCard
                                key={character.id}
                                character={character}
                                isSelected={selected === character.id}
                                language={language}
                                isLight={isLight}
                                compact
                                onClick={() => {
                                    setSelected(character.id);
                                    onSelect(character);
                                }}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <span className={`text-[10px] uppercase tracking-widest font-medium mb-1.5 block ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                        {ui.male}
                    </span>
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                        {males.map(character => (
                            <VoiceCard
                                key={character.id}
                                character={character}
                                isSelected={selected === character.id}
                                language={language}
                                isLight={isLight}
                                compact
                                onClick={() => {
                                    setSelected(character.id);
                                    onSelect(character);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // -----------------------------------------------------------------------
    // FIRST TIME mode – full-screen modal
    // -----------------------------------------------------------------------
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4 ${isLight ? 'bg-black/40' : 'bg-black/90'}`}>
            {/* Modal container */}
            <div className={`relative w-full max-w-lg rounded-3xl border p-6 flex flex-col gap-6 ${isLight ? 'bg-mystic-card border-mystic-border shadow-mystic-lg' : 'border-white/10 bg-black/80 shadow-[0_0_60px_rgba(168,85,247,0.25)]'}`}>

                {/* Close button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`absolute top-3 end-3 w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isLight ? 'bg-mystic-border/40 hover:bg-mystic-border/70 text-mystic-text-secondary hover:text-mystic-text' : 'bg-white/5 hover:bg-white/15 text-white/40 hover:text-white/80'}`}
                        aria-label="Close"
                    >
                        <span className="material-icons">close</span>
                    </button>
                )}

                {/* Title */}
                <div className="text-center">
                    <span className={`material-icons text-4xl mb-2 block ${isLight ? 'text-accent-primary' : 'text-purple-400'}`}>record_voice_over</span>
                    <h2 className={`text-lg font-semibold leading-snug ${isLight ? 'text-mystic-text' : 'text-white'}`}>{ui.title}</h2>
                </div>

                {/* Two-column grid: Female | Male */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Female column */}
                    <div className="flex flex-col gap-2">
                        <span className={`text-xs uppercase tracking-widest font-medium text-center mb-1 ${isLight ? 'text-fuchsia-600' : 'text-fuchsia-400'}`}>
                            {ui.female}
                        </span>
                        {females.map(character => (
                            <VoiceCard
                                key={character.id}
                                character={character}
                                isSelected={selected === character.id}
                                language={language}
                                isLight={isLight}
                                onClick={() => setSelected(character.id)}
                            />
                        ))}
                    </div>

                    {/* Male column */}
                    <div className="flex flex-col gap-2">
                        <span className={`text-xs uppercase tracking-widest font-medium text-center mb-1 ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                            {ui.male}
                        </span>
                        {males.map(character => (
                            <VoiceCard
                                key={character.id}
                                character={character}
                                isSelected={selected === character.id}
                                language={language}
                                isLight={isLight}
                                onClick={() => setSelected(character.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Confirm button */}
                <button
                    onClick={handleConfirm}
                    className="w-full py-4 rounded-2xl font-semibold text-white text-base min-h-[52px]
                        bg-gradient-to-r from-purple-600 to-fuchsia-600
                        hover:from-purple-500 hover:to-fuchsia-500
                        shadow-[0_0_20px_rgba(168,85,247,0.4)]
                        transition-all duration-200 active:scale-95"
                >
                    {ui.confirm}
                </button>
            </div>
        </div>
    );
};

export default VoiceSelector;
