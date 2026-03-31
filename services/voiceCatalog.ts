// ============================================
// DREAM CODE - VOICE CATALOG
// ============================================
// Deepgram Aura Voice Definitions
// Aura 1 = Normal Quality, Aura 2 = High Quality
// ============================================

export type VoiceQuality = 'normal' | 'high';

export interface VoiceCharacter {
  id: string;
  name: string;
  gender: 'female' | 'male';
  quality: VoiceQuality;
  description: Record<string, string>;
  accent?: string;
  languages: string[];
}

// --- NORMAL QUALITY (Aura 1) ---

const NORMAL_VOICES: VoiceCharacter[] = [
  // Female - Normal
  {
    id: 'aura-asteria-en',
    name: 'Asteria',
    gender: 'female',
    quality: 'normal',
    description: { en: 'Warm & friendly', de: 'Warm & freundlich' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-luna-en',
    name: 'Luna',
    gender: 'female',
    quality: 'normal',
    description: { en: 'Professional & calm', de: 'Professionell & ruhig' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-stella-en',
    name: 'Stella',
    gender: 'female',
    quality: 'normal',
    description: { en: 'Energetic & bright', de: 'Energisch & lebendig' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-athena-en',
    name: 'Athena',
    gender: 'female',
    quality: 'normal',
    description: { en: 'Clear & articulate', de: 'Klar & deutlich' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-hera-en',
    name: 'Hera',
    gender: 'female',
    quality: 'normal',
    description: { en: 'Authoritative & strong', de: 'Autoritativ & stark' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  // Male - Normal
  {
    id: 'aura-orion-en',
    name: 'Orion',
    gender: 'male',
    quality: 'normal',
    description: { en: 'Deep & resonant', de: 'Tief & resonant' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-arcas-en',
    name: 'Arcas',
    gender: 'male',
    quality: 'normal',
    description: { en: 'Neutral & balanced', de: 'Neutral & ausgewogen' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-perseus-en',
    name: 'Perseus',
    gender: 'male',
    quality: 'normal',
    description: { en: 'Confident & steady', de: 'Selbstsicher & beständig' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-orpheus-en',
    name: 'Orpheus',
    gender: 'male',
    quality: 'normal',
    description: { en: 'Smooth & melodic', de: 'Sanft & melodisch' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-helios-en',
    name: 'Helios',
    gender: 'male',
    quality: 'normal',
    description: { en: 'Warm & inviting', de: 'Warm & einladend' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
];

// --- HIGH QUALITY (Aura 2) ---

const HQ_VOICES: VoiceCharacter[] = [
  // Female - HQ English
  {
    id: 'aura-2-asteria-en',
    name: 'Asteria HQ',
    gender: 'female',
    quality: 'high',
    description: { en: 'Warm & natural', de: 'Warm & natürlich' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-2-luna-en',
    name: 'Luna HQ',
    gender: 'female',
    quality: 'high',
    description: { en: 'Professional & refined', de: 'Professionell & verfeinert' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-2-athena-en',
    name: 'Athena HQ',
    gender: 'female',
    quality: 'high',
    description: { en: 'Clear & precise', de: 'Klar & präzise' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-2-helena-en',
    name: 'Helena HQ',
    gender: 'female',
    quality: 'high',
    description: { en: 'Elegant & soothing', de: 'Elegant & beruhigend' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-2-aurora-en',
    name: 'Aurora HQ',
    gender: 'female',
    quality: 'high',
    description: { en: 'Gentle & dreamy', de: 'Sanft & verträumt' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-2-selene-en',
    name: 'Selene HQ',
    gender: 'female',
    quality: 'high',
    description: { en: 'Mystical & soft', de: 'Mystisch & weich' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-2-thalia-en',
    name: 'Thalia HQ',
    gender: 'female',
    quality: 'high',
    description: { en: 'Lively & expressive', de: 'Lebendig & ausdrucksstark' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-2-electra-en',
    name: 'Electra HQ',
    gender: 'female',
    quality: 'high',
    description: { en: 'British & sophisticated', de: 'Britisch & kultiviert' },
    accent: 'UK',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  // Female - HQ Spanish
  {
    id: 'aura-2-celeste-es',
    name: 'Celeste HQ',
    gender: 'female',
    quality: 'high',
    description: { en: 'Warm Spanish voice', de: 'Warme spanische Stimme' },
    accent: 'ES',
    languages: ['es'],
  },
  {
    id: 'aura-2-diana-es',
    name: 'Diana HQ',
    gender: 'female',
    quality: 'high',
    description: { en: 'Clear Spanish voice', de: 'Klare spanische Stimme' },
    accent: 'ES',
    languages: ['es'],
  },
  {
    id: 'aura-2-selena-es',
    name: 'Selena HQ',
    gender: 'female',
    quality: 'high',
    description: { en: 'Elegant Spanish voice', de: 'Elegante spanische Stimme' },
    accent: 'ES',
    languages: ['es'],
  },
  // Male - HQ English
  {
    id: 'aura-2-orion-en',
    name: 'Orion HQ',
    gender: 'male',
    quality: 'high',
    description: { en: 'Deep & powerful', de: 'Tief & kraftvoll' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-2-orpheus-en',
    name: 'Orpheus HQ',
    gender: 'male',
    quality: 'high',
    description: { en: 'Smooth & premium', de: 'Sanft & Premium' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-2-apollo-en',
    name: 'Apollo HQ',
    gender: 'male',
    quality: 'high',
    description: { en: 'Charismatic & clear', de: 'Charismatisch & klar' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-2-hermes-en',
    name: 'Hermes HQ',
    gender: 'male',
    quality: 'high',
    description: { en: 'Swift & articulate', de: 'Schnell & artikuliert' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-2-perseus-en',
    name: 'Perseus HQ',
    gender: 'male',
    quality: 'high',
    description: { en: 'Confident & premium', de: 'Selbstsicher & Premium' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-2-atlas-en',
    name: 'Atlas HQ',
    gender: 'male',
    quality: 'high',
    description: { en: 'Strong & commanding', de: 'Stark & bestimmend' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-2-draco-en',
    name: 'Draco HQ',
    gender: 'male',
    quality: 'high',
    description: { en: 'British & distinguished', de: 'Britisch & distinguiert' },
    accent: 'UK',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  {
    id: 'aura-2-zeus-en',
    name: 'Zeus HQ',
    gender: 'male',
    quality: 'high',
    description: { en: 'Majestic & powerful', de: 'Majestätisch & kraftvoll' },
    accent: 'US',
    languages: ['en', 'de', 'fr', 'pt', 'ru'],
  },
  // Male - HQ Spanish
  {
    id: 'aura-2-javier-es',
    name: 'Javier HQ',
    gender: 'male',
    quality: 'high',
    description: { en: 'Warm Spanish voice', de: 'Warme spanische Stimme' },
    accent: 'ES',
    languages: ['es'],
  },
  {
    id: 'aura-2-nestor-es',
    name: 'Nestor HQ',
    gender: 'male',
    quality: 'high',
    description: { en: 'Deep Spanish voice', de: 'Tiefe spanische Stimme' },
    accent: 'ES',
    languages: ['es'],
  },
];

// --- COMBINED CATALOG ---
export const VOICE_CATALOG: VoiceCharacter[] = [...NORMAL_VOICES, ...HQ_VOICES];

// Languages without Deepgram TTS support (will use Azure later)
export const UNSUPPORTED_TTS_LANGUAGES = ['ar', 'tr'];

// --- HELPER FUNCTIONS ---

export const getVoicesForLanguage = (lang: string, quality?: VoiceQuality): VoiceCharacter[] => {
  // AR and TR have no Deepgram voices - show EN voices as fallback
  const effectiveLang = UNSUPPORTED_TTS_LANGUAGES.includes(lang) ? 'en' : lang;

  return VOICE_CATALOG.filter(v => {
    const langMatch = v.languages.includes(effectiveLang);
    const qualityMatch = quality ? v.quality === quality : true;
    return langMatch && qualityMatch;
  });
};

export const getDefaultVoice = (lang: string, quality: VoiceQuality = 'normal'): VoiceCharacter => {
  const voices = getVoicesForLanguage(lang, quality);
  // Prefer female voices as default for a dream app
  const femaleVoice = voices.find(v => v.gender === 'female');
  return femaleVoice || voices[0] || NORMAL_VOICES[0];
};

export const findVoiceById = (id: string): VoiceCharacter | undefined => {
  return VOICE_CATALOG.find(v => v.id === id);
};

export const getVoiceQuality = (voiceId: string): VoiceQuality => {
  const voice = findVoiceById(voiceId);
  return voice?.quality || 'normal';
};
