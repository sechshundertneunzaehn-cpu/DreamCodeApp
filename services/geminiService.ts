import { Language, UserProfile, SubscriptionTier, ReligiousCategory, ReligiousSource } from '../types';
import {
  getTextRoutes,
  getImageRoutes,
  isPremiumTextTier,
  isOllamaAvailable,
  getOpenRouterLocalRoutes,
} from '../config/providerRouting';
import {
  generateSpeechElevenLabs,
  isElevenLabsConfigured,
  ELEVENLABS_VOICES,
  type EmotionStyle,
} from './elevenlabsService';
import { apiFetch } from './apiConfig';

const POLLINATIONS_API_BASE = 'https://image.pollinations.ai/prompt';
const DEFAULT_DEEPGRAM_MODEL = 'aura-asteria-en';

type ImageStyle = 'cartoon' | 'anime' | 'real' | 'fantasy' | 'surreal' | 'watercolor' | 'dreamlike' | 'cinematic';
type ImageQuality = 'normal' | 'high';

type TextProvider = 'gemini' | 'deepseek' | 'ollama' | 'openrouter';

type DreamAnalysisResult = {
  interpretation: string;
  provider: TextProvider | 'unavailable';
  model?: string;
};

interface StorySegment {
  text: string;
  imagePrompt: string;
  imageUrl?: string;
  startTime: number;
  endTime: number;
}

export interface StoryVideoResult {
  segments: StorySegment[];
  audioBase64: string;
  totalDuration: number;
  videoDataUrl: string;
}

const LANGUAGE_NAMES: Record<Language, string> = {
  [Language.DE]: 'German',
  [Language.EN]: 'English',
  [Language.TR]: 'Turkish',
  [Language.ES]: 'Spanish',
  [Language.FR]: 'French',
  [Language.AR]: 'Arabic',
  [Language.AR_GULF]: 'Gulf Arabic',
  [Language.AR_EG]: 'Egyptian Arabic',
  [Language.AR_LEV]: 'Levantine Arabic',
  [Language.AR_MAG]: 'Maghrebi Arabic',
  [Language.AR_IQ]: 'Iraqi Arabic',
  [Language.PT]: 'Portuguese',
  [Language.RU]: 'Russian',
  [Language.ZH]: 'Chinese',
  [Language.HI]: 'Hindi',
  [Language.JA]: 'Japanese',
  [Language.KO]: 'Korean',
  [Language.ID]: 'Indonesian',
  [Language.FA]: 'Persian',
  [Language.IT]: 'Italian',
  [Language.PL]: 'Polish',
  [Language.BN]: 'Bengali',
  [Language.UR]: 'Urdu',
  [Language.VI]: 'Vietnamese',
  [Language.TH]: 'Thai',
  [Language.SW]: 'Swahili',
  [Language.HU]: 'Hungarian',
  [Language.TA]: 'Tamil',
  [Language.TE]: 'Telugu',
  [Language.TL]: 'Filipino',
  [Language.ML]: 'Malayalam',
  [Language.MR]: 'Marathi',
  [Language.KN]: 'Kannada',
  [Language.GU]: 'Gujarati',
  [Language.HE]: 'Hebrew',
  [Language.NE]: 'Nepali',
  [Language.PRS]: 'Dari',
};

const STYLE_PROMPTS: Record<ImageStyle, { prefix: string; negative: string }> = {
  cartoon: {
    prefix:
      'Pixar inspired 3D animated dream scene, vibrant colors, rounded shapes, expressive characters, cinematic lighting',
    negative: 'realistic photo, horror, gore, text, letters',
  },
  anime: {
    prefix:
      'anime dream sequence, detailed background, celestial glow, cinematic framing, emotional atmosphere',
    negative: 'photo, 3d render, ugly, deformed, text',
  },
  real: {
    prefix:
      'ultra realistic cinematic dream photography, dramatic light, atmospheric depth, sharp details',
    negative: 'cartoon, anime, illustration, blurry, text',
  },
  fantasy: {
    prefix:
      'epic fantasy dreamscape, mystical fog, divine light rays, enchanted atmosphere, detailed concept art',
    negative: 'modern office, mundane scene, text, logo',
  },
  surreal: {
    prefix:
      'surreal dream world, impossible architecture, floating objects, psychedelic colors, symbolic composition',
    negative: 'ordinary scene, realistic documentary, text',
  },
  watercolor: {
    prefix:
      'delicate watercolor dream illustration, soft edges, flowing pigments, poetic atmosphere',
    negative: 'hard edges, 3d render, text, logo',
  },
  dreamlike: {
    prefix:
      'ethereal dreamlike vision, soft luminous glow, otherworldly mist, dream imagery, fluid transitions',
    negative: 'sharp realistic photo, mundane, text, logo',
  },
  cinematic: {
    prefix:
      'cinematic dream scene, dramatic lighting, wide-angle composition, film grain, atmospheric depth',
    negative: 'flat illustration, cartoon, amateur photo, text',
  },
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isUserProfile = (value: unknown): value is UserProfile => {
  return Boolean(value && typeof value === 'object' && 'subscriptionTier' in (value as Record<string, unknown>));
};

const normalizeImageArgs = (
  arg2?: unknown,
  arg3?: unknown,
  arg4?: unknown,
  arg5?: unknown,
): {
  userProfile: UserProfile | null;
  quality: ImageQuality;
  style: ImageStyle;
} => {
  let userProfile: UserProfile | null = null;
  let quality: ImageQuality = 'normal';
  let style: ImageStyle = 'fantasy';

  if (Array.isArray(arg2)) {
    userProfile = isUserProfile(arg3) ? arg3 : null;
    quality = arg4 === true ? 'high' : 'normal';
    if (typeof arg5 === 'string') {
      style = arg5 as ImageStyle;
    }
  } else {
    userProfile = isUserProfile(arg2) ? arg2 : null;
    if (arg3 === 'normal' || arg3 === 'high') {
      quality = arg3;
    }
    if (typeof arg4 === 'string') {
      style = arg4 as ImageStyle;
    }
  }

  return { userProfile, quality, style };
};

const normalizeVideoStyle = (value?: unknown): ImageStyle => {
  if (typeof value === 'string' && value in STYLE_PROMPTS) {
    return value as ImageStyle;
  }
  return 'fantasy';
};

const buildDreamPrompt = (dreamText: string, language: Language, userProfile: UserProfile | null, categories?: ReligiousCategory[], sources?: ReligiousSource[]): string => {
  const languageName = LANGUAGE_NAMES[language] || 'English';
  const contextBits = [
    userProfile?.age ? `Age: ${userProfile.age}` : '',
    userProfile?.gender ? `Gender: ${userProfile.gender}` : '',
    userProfile?.location ? `Location: ${userProfile.location}` : '',
    userProfile?.workType ? `Work type: ${userProfile.workType}` : '',
    userProfile?.remarks ? `Remarks: ${userProfile.remarks}` : '',
  ].filter(Boolean);

  let traditionInstruction = '';
  if (sources && sources.length > 0) {
    const sourceNames = sources.map(s => s.replace(/_/g, ' ')).join(', ');
    traditionInstruction = `Interpret this dream specifically through these traditions/sources: ${sourceNames}. Include a dedicated section for each selected tradition's perspective.`;
  } else if (categories && categories.length > 0) {
    traditionInstruction = `Interpret this dream specifically through these traditions: ${categories.join(', ')}. Include a dedicated section for each selected tradition's perspective.`;
  }

  return [
    'You are an empathetic dream interpreter.',
    `Respond in ${languageName}.`,
    'Analyze the dream with symbolism, emotional meaning, and practical guidance.',
    'Use clear sections and a warm, grounded tone.',
    traditionInstruction,
    contextBits.length > 0 ? `Dreamer context: ${contextBits.join(' | ')}` : '',
    `Dream: "${dreamText}"`,
  ]
    .filter(Boolean)
    .join('\n\n');
};

const callGeminiText = async (
  model: string,
  prompt: string,
  options?: { temperature?: number; maxOutputTokens?: number },
): Promise<string> => {
  const r = await apiFetch('/api/generate-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'gemini', model, prompt, options }),
  });
  if (!r.ok) throw new Error(`Gemini API-Fehler: ${r.status}`);
  const data = await r.json() as { text?: string };
  if (!data.text) throw new Error('Gemini lieferte keinen Text');
  return data.text;
};

const callDeepSeekText = async (
  model: string,
  prompt: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> => {
  const r = await apiFetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'deepseek',
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    }),
  });
  if (!r.ok) throw new Error(`DeepSeek API-Fehler: ${r.status}`);
  const data = await r.json() as { text?: string };
  if (!data.text) throw new Error('DeepSeek lieferte keinen Text');
  return data.text;
};


const callOllamaText = async (
  model: string,
  prompt: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> => {
  const baseUrl = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API-Fehler: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Ollama lieferte keinen Text');
  return text.trim();
};

const callOpenRouterText = async (
  model: string,
  prompt: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> => {
  const r = await apiFetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'openrouter',
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    }),
  });
  if (!r.ok) throw new Error(`OpenRouter API-Fehler: ${r.status}`);
  const data = await r.json() as { text?: string };
  if (!data.text) throw new Error('OpenRouter lieferte keinen Text');
  return data.text;
};

const callGroqDirect = async (
  model: string,
  prompt: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> => {
  const r = await apiFetch('/api/generate-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'groq', model, prompt, options }),
  });
  if (!r.ok) throw new Error(`Groq API-Fehler: ${r.status}`);
  const data = await r.json() as { text?: string };
  if (!data.text) throw new Error('Groq lieferte keinen Text');
  return data.text;
};

const callGroqFallback = async (prompt: string, language: Language): Promise<string> => {
  // Direkt via Browser (kostenlos, kein GPU noetig) - Gemma2 zuerst
  const models = [
    import.meta.env.VITE_GROQ_MODEL_FAST || 'gemma2-9b-it',
    import.meta.env.VITE_GROQ_MODEL_DEFAULT || 'llama-3.3-70b-versatile',
  ];
  for (const model of models) {
    try {
      return await callGroqDirect(model, prompt);
    } catch (err) {
      console.warn('[GROQ] Modell fehlgeschlagen:', model, err);
    }
  }

  // Server-Fallback wenn alle direkten Keys erschoepft
  const LANG_NAMES: Record<string, string> = {
    de: 'Deutsch', tr: 'Tuerkisch', en: 'English', es: 'Spanisch',
    fr: 'Franzoesisch', ar: 'Arabisch', pt: 'Portugiesisch', ru: 'Russisch',
    zh: 'Chinesisch', hi: 'Hindi', ja: 'Japanisch', ko: 'Koreanisch',
    id: 'Indonesisch', fa: 'Persisch', it: 'Italienisch', pl: 'Polnisch',
    bn: 'Bengalisch', ur: 'Urdu', vi: 'Vietnamesisch', th: 'Thailaendisch',
    sw: 'Swahili', hu: 'Ungarisch',
    ta: 'Tamil', te: 'Telugu', tl: 'Tagalog', ml: 'Malayalam',
    mr: 'Marathi', kn: 'Kannada', gu: 'Gujarati', he: 'Hebraeisch',
    ne: 'Nepali', prs: 'Dari',
    'ar-gulf': 'Golfarbisch', 'ar-eg': 'Aegyptisch-Arabisch',
    'ar-lev': 'Levantinisch-Arabisch', 'ar-mag': 'Maghrebinisch-Arabisch', 'ar-iq': 'Irakisch-Arabisch',
  };
  const langName = LANG_NAMES[language] || 'Deutsch';
  const res = await apiFetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      language,
      systemPrompt: `Du bist ein einfuehlsamer Traumdeuter. Antworte NUR in ${langName}.`,
    }),
  });
  if (!res.ok) throw new Error(`Groq server fallback error: ${res.status}`);
  const data = await res.json();
  if (!data.reply) throw new Error('Server-Fallback lieferte keine Antwort');
  return data.reply;
};

const analyzeDreamInternal = async (
  dreamText: string,
  language: Language,
  userProfile: UserProfile | null,
  preferredTier: 'default' | 'premium' = 'default',
  categories?: ReligiousCategory[],
  sources?: ReligiousSource[],
): Promise<DreamAnalysisResult> => {
  const prompt = buildDreamPrompt(dreamText, language, userProfile, categories, sources);
  const textRoutes = getTextRoutes();

  // --- Schritt 1: Gemini (Primary) ---
  const geminiRoute = preferredTier === 'premium'
    ? textRoutes.find(r => r.tier === 'premium' && r.provider === 'gemini')
    : textRoutes.find(r => r.tier === 'default' && r.provider === 'gemini');
  if (geminiRoute) {
    try {
      const interpretation = await callGeminiText(geminiRoute.model, prompt, { temperature: 0.75, maxOutputTokens: 2200 });
      return { interpretation, provider: 'gemini', model: geminiRoute.model };
    } catch (error) {
      console.warn(`[TEXT] Gemini fehlgeschlagen (${geminiRoute.model})`, error);
    }
  }

  // --- Schritt 2: DeepSeek (via /api/llm) ---
  const deepseekRoute = textRoutes.find(r => r.provider === 'deepseek');
  if (deepseekRoute) {
    try {
      const interpretation = await callDeepSeekText(deepseekRoute.model, prompt, { temperature: 0.75, maxTokens: 2200 });
      return { interpretation, provider: 'deepseek', model: deepseekRoute.model };
    } catch (error) {
      console.warn(`[TEXT] DeepSeek fehlgeschlagen (${deepseekRoute.model})`, error);
    }
  }

  // --- Schritt 3: GROQ + Mistral Fallback (via /api/generate-text + /api/chat) ---
  try {
    const interpretation = await callGroqFallback(prompt, language);
    return { interpretation, provider: 'gemini' as TextProvider, model: 'groq-mistral-fallback' };
  } catch (error) {
    console.warn('[TEXT] Groq/Mistral-Fallback fehlgeschlagen', error);
  }

  // --- Schritt 4: OpenRouter Free Models ---
  try {
    const orRoutes = getOpenRouterLocalRoutes();
    for (const orRoute of orRoutes) {
      try {
        const interpretation = await callOpenRouterText(orRoute.model, prompt, { temperature: 0.75, maxTokens: 2200 });
        return { interpretation, provider: 'openrouter', model: orRoute.model };
      } catch (orErr) {
        console.warn(`[TEXT] OpenRouter fehlgeschlagen (${orRoute.model})`, orErr);
      }
    }
  } catch (orSetupErr) {
    console.warn('[TEXT] OpenRouter Fallback Setup fehlgeschlagen', orSetupErr);
  }

  // --- Schritt 5: Lokale Modelle via Ollama ---
  try {
    const ollamaOnline = await isOllamaAvailable();
    if (ollamaOnline) {
      const localRoutes = textRoutes.filter(r => r.tier === 'local');
      for (const route of localRoutes) {
        try {
          const interpretation = await callOllamaText(route.model, prompt, { temperature: 0.75, maxTokens: 2200 });
          return { interpretation, provider: 'ollama', model: route.model };
        } catch (localErr) {
          console.warn('[TEXT] Lokales Modell fehlgeschlagen', route.model, localErr);
        }
      }
    }
  } catch (localSetupErr) {
    console.warn('[TEXT] Lokaler Fallback Setup fehlgeschlagen', localSetupErr);
  }

  return {
    interpretation: 'Die Traumanalyse ist momentan nicht verfuegbar. Bitte versuche es spaeter erneut.',
    provider: 'unavailable',
  };
};

export const analyzeDreamText = async (
  dreamText: string,
  language: Language = Language.DE,
  userProfile: UserProfile | null = null,
  categories?: ReligiousCategory[],
  sources?: ReligiousSource[],
): Promise<{ interpretation: string }> => {
  const result = await analyzeDreamInternal(dreamText, language, userProfile, 'default', categories, sources);
  return { interpretation: result.interpretation };
};

export const analyzeDreamPremium = async (
  dreamText: string,
  language: Language = Language.DE,
  userProfile: UserProfile | null = null,
  usePremium: boolean = false,
  categories?: ReligiousCategory[],
  sources?: ReligiousSource[],
): Promise<{ interpretation: string; provider: TextProvider | 'unavailable' }> => {
  const preferredTier = usePremium && isPremiumTextTier(userProfile?.subscriptionTier) ? 'premium' : 'default';
  const result = await analyzeDreamInternal(dreamText, language, userProfile, preferredTier, categories, sources);
  return {
    interpretation: result.interpretation,
    provider: result.provider,
  };
};

export const generateImagePrompt = async (
  dreamText: string,
  interpretation: string,
): Promise<string> => {
  const prompt = [
    'Create one concise English image prompt for a dream visualization.',
    'Focus on symbols, atmosphere, lighting, and composition.',
    'Return only the prompt text, no explanation.',
    `Dream: ${dreamText}`,
    `Interpretation: ${interpretation}`,
  ].join('\n\n');

  // Try Gemini first
  try {
    const cheapModel = getTextRoutes().find(route => route.tier === 'cheap')?.model || 'gemini-2.0-flash-lite';
    return await callGeminiText(cheapModel, prompt, { temperature: 0.8, maxOutputTokens: 200 });
  } catch (error) {
    console.warn('[IMAGE PROMPT] Gemini fehlgeschlagen, nutze Groq-Fallback', error);
  }

  // Groq fallback for image prompt
  try {
    const res = await apiFetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        language: 'en',
        systemPrompt: 'You create concise, vivid image prompts for AI image generators. Return ONLY the prompt text, no explanation, no quotes. Max 2 sentences. Focus on visual elements: colors, lighting, mood, symbols, composition.',
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.reply) {
        return data.reply.replace(/^["']|["']$/g, '').trim();
      }
    }
  } catch (groqErr) {
    console.warn('[IMAGE PROMPT] Groq-Fallback fehlgeschlagen', groqErr);
  }

  return `${dreamText}. ${interpretation}`.slice(0, 350);
};

const generateRunwareImage = async (
  prompt: string,
  negativePrompt: string,
  quality: ImageQuality,
): Promise<string | null> => {
  const model = getImageRoutes().find(route => route.tier === 'standard')?.model || 'runware:100@1';
  const r = await apiFetch('/api/generate-image', {
    method: 'POST',
    body: JSON.stringify({
      provider: 'runware',
      model,
      prompt,
      negativePrompt,
      width: quality === 'high' ? 1280 : 1024,
      height: quality === 'high' ? 720 : 576,
      steps: quality === 'high' ? 28 : 20,
    }),
  });
  if (!r.ok) throw new Error(`Runware API-Fehler: ${r.status}`);
  const data = await r.json() as { imageURL?: string };
  return data.imageURL || null;
};

const generateGeminiImage = async (prompt: string): Promise<string | null> => {
  const model = getImageRoutes().find(route => route.tier === 'premium')?.model || 'gemini-2.5-flash-image';
  const r = await apiFetch('/api/generate-image', {
    method: 'POST',
    body: JSON.stringify({ provider: 'gemini', model, prompt }),
  });
  if (!r.ok) return null;
  const data = await r.json() as { imageURL?: string };
  return data.imageURL || null;
};

const generatePollinationsImage = (prompt: string, quality: ImageQuality, seed?: number): string => {
  const encodedPrompt = encodeURIComponent(prompt);
  const width = quality === 'high' ? 1280 : 1024;
  const height = quality === 'high' ? 720 : 576;
  const seedQuery = typeof seed === 'number' ? `&seed=${seed}` : '';
  return `${POLLINATIONS_API_BASE}/${encodedPrompt}?width=${width}&height=${height}&nologo=true&enhance=true${seedQuery}`;
};

export const generateDreamImage = async (
  dreamDescription: string,
  arg2?: unknown,
  arg3?: unknown,
  arg4?: unknown,
  arg5?: unknown,
  interpretationText?: string,
): Promise<string | null> => {
  const { quality, style } = normalizeImageArgs(arg2, arg3, arg4, arg5);
  const styleConfig = STYLE_PROMPTS[style] || STYLE_PROMPTS.fantasy;

  let visualPrompt = dreamDescription.trim();
  try {
    const interpForPrompt = interpretationText || 'Visualize the core symbolic meaning of the dream.';
    const optimized = await generateImagePrompt(dreamDescription, interpForPrompt);
    if (optimized) {
      visualPrompt = optimized;
    }
  } catch (error) {
    console.warn('[IMAGE] Prompt-Optimierung fehlgeschlagen', error);
  }

  const fullPrompt = `${styleConfig.prefix}, ${visualPrompt}, masterpiece, best quality`;

  // NOTE: Gemini Image generation removed (model unavailable) - Runware handles all qualities
  try {
    const runwareImage = await generateRunwareImage(fullPrompt, styleConfig.negative, quality);
    if (runwareImage) {
      return runwareImage;
    }
  } catch (error) {
    console.warn('[IMAGE] Runware fehlgeschlagen', error);
  }

  return generatePollinationsImage(fullPrompt, quality);
};

const getDeepgramVoice = (language: Language, preferredVoice?: string): string => {
  if (preferredVoice && preferredVoice.trim().length > 0) {
    return preferredVoice.trim();
  }

  // Deepgram Aura: nur englische Voices verfügbar
  const voices: Record<Language, string> = {
    [Language.DE]: 'aura-luna-en',
    [Language.EN]: 'aura-asteria-en',
    [Language.TR]: 'aura-luna-en',
    [Language.ES]: 'aura-luna-en',
    [Language.FR]: 'aura-luna-en',
    [Language.AR]: 'aura-luna-en',
    [Language.AR_GULF]: 'aura-luna-en',
    [Language.AR_EG]: 'aura-luna-en',
    [Language.AR_LEV]: 'aura-luna-en',
    [Language.AR_MAG]: 'aura-luna-en',
    [Language.AR_IQ]: 'aura-luna-en',
    [Language.PT]: 'aura-luna-en',
    [Language.RU]: 'aura-luna-en',
    [Language.ZH]: 'aura-luna-en',
    [Language.HI]: 'aura-luna-en',
    [Language.JA]: 'aura-luna-en',
    [Language.KO]: 'aura-luna-en',
    [Language.ID]: 'aura-luna-en',
    [Language.FA]: 'aura-luna-en',
    [Language.IT]: 'aura-luna-en',
    [Language.PL]: 'aura-luna-en',
    [Language.BN]: 'aura-luna-en',
    [Language.UR]: 'aura-luna-en',
    [Language.VI]: 'aura-luna-en',
    [Language.TH]: 'aura-luna-en',
    [Language.SW]: 'aura-luna-en',
    [Language.HU]: 'aura-luna-en',
    [Language.TA]: 'aura-luna-en',
    [Language.TE]: 'aura-luna-en',
    [Language.TL]: 'aura-luna-en',
    [Language.ML]: 'aura-luna-en',
    [Language.MR]: 'aura-luna-en',
    [Language.KN]: 'aura-luna-en',
    [Language.GU]: 'aura-luna-en',
    [Language.HE]: 'aura-luna-en',
    [Language.NE]: 'aura-luna-en',
    [Language.PRS]: 'aura-luna-en',
  };

  return voices[language] || DEFAULT_DEEPGRAM_MODEL;
};

const blobToBase64 = async (blob: Blob): Promise<string> => {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateSpeechPreview = async (
  text: string,
  voice: string = DEFAULT_DEEPGRAM_MODEL,
  _userProfile: UserProfile | null = null,
  language?: Language,
): Promise<string | null> => {
  // Fuer Nicht-Englisch: Google Chirp3-HD bevorzugen (Deepgram hat nur EN)
  if (language && language !== Language.EN) {
    try {
      const gRes = await apiFetch('/api/deepgram-tts', {
        method: 'POST',
        body: JSON.stringify({ text, language, provider: 'google' }),
      });
      if (gRes.ok) {
        const blob = await gRes.blob();
        return await blobToBase64(blob);
      }
    } catch { /* Fallback to Deepgram below */ }
  }

  try {
    const r = await apiFetch('/api/deepgram-tts', {
      method: 'POST',
      body: JSON.stringify({ text, voice }),
    });
    if (!r.ok) throw new Error(`Deepgram API-Fehler: ${r.status}`);
    const data = await r.json() as { audioBase64?: string };
    return data.audioBase64 || null;
  } catch (error) {
    console.error('[TTS] Deepgram fehlgeschlagen', error);
    return null;
  }
};

export const generateSpeechPremium = async (
  text: string,
  language: Language,
  userProfile: UserProfile | null,
  emotion: EmotionStyle = 'mystical',
): Promise<{ audioBase64: string; provider: 'elevenlabs' | 'deepgram' | 'unavailable' }> => {
  if (isPremiumTextTier(userProfile?.subscriptionTier) && isElevenLabsConfigured()) {
    try {
      const audioBuffer = await generateSpeechElevenLabs(text, language, emotion);
      const bytes = new Uint8Array(audioBuffer);
      let binary = '';
      bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
      });
      return { audioBase64: btoa(binary), provider: 'elevenlabs' };
    } catch (error) {
      console.warn('[TTS] ElevenLabs fehlgeschlagen, Fallback auf Deepgram', error);
    }
  }

  const deepgramVoice = getDeepgramVoice(language, userProfile?.preferredVoice);
  const audioBase64 = await generateSpeechPreview(text, deepgramVoice, userProfile);
  if (audioBase64) {
    return { audioBase64, provider: 'deepgram' };
  }

  return { audioBase64: '', provider: 'unavailable' };
};

const videoI18n: Record<string, { preparing: string; prompts: string; audio: string; scene: (i: number, t: number) => string; done: string; narration_prep: string; narration_done: string; voice_prep: string; voice_done: string }> = {
  de: { preparing: 'Story wird vorbereitet...', prompts: 'Bild-Prompts werden erstellt...', audio: 'Audio wird generiert...', scene: (i, t) => `Szene ${i}/${t} wird generiert...`, done: 'Story-Video fertig', narration_prep: 'Traum-Erzählung wird vorbereitet...', narration_done: 'Traum-Erzählung fertig', voice_prep: 'Video mit deiner Stimme wird vorbereitet...', voice_done: 'Video mit deiner Stimme fertig' },
  en: { preparing: 'Preparing story...', prompts: 'Creating image prompts...', audio: 'Generating audio...', scene: (i, t) => `Generating scene ${i}/${t}...`, done: 'Story video ready', narration_prep: 'Preparing dream narration...', narration_done: 'Dream narration ready', voice_prep: 'Preparing video with your voice...', voice_done: 'Video with your voice ready' },
  tr: { preparing: 'Hikaye hazırlanıyor...', prompts: 'Görsel açıklamaları oluşturuluyor...', audio: 'Ses oluşturuluyor...', scene: (i, t) => `Sahne ${i}/${t} oluşturuluyor...`, done: 'Hikaye videosu hazır', narration_prep: 'Rüya anlatımı hazırlanıyor...', narration_done: 'Rüya anlatımı hazır', voice_prep: 'Sesinle video hazırlanıyor...', voice_done: 'Sesinle video hazır' },
  es: { preparing: 'Preparando historia...', prompts: 'Creando descripciones...', audio: 'Generando audio...', scene: (i, t) => `Generando escena ${i}/${t}...`, done: 'Video listo', narration_prep: 'Preparando narración...', narration_done: 'Narración lista', voice_prep: 'Preparando video con tu voz...', voice_done: 'Video con tu voz listo' },
  fr: { preparing: 'Préparation...', prompts: 'Création des descriptions...', audio: 'Génération audio...', scene: (i, t) => `Scène ${i}/${t}...`, done: 'Vidéo prête', narration_prep: 'Préparation narration...', narration_done: 'Narration prête', voice_prep: 'Préparation vidéo avec votre voix...', voice_done: 'Vidéo avec votre voix prête' },
  ar: { preparing: '...جاري التحضير', prompts: '...إنشاء الأوصاف', audio: '...إنشاء الصوت', scene: (i, t) => `...${t}/${i} إنشاء المشهد`, done: 'الفيديو جاهز', narration_prep: '...تحضير سرد الحلم', narration_done: 'سرد الحلم جاهز', voice_prep: '...تحضير الفيديو بصوتك', voice_done: 'الفيديو بصوتك جاهز' },
  pt: { preparing: 'Preparando...', prompts: 'Criando descrições...', audio: 'Gerando áudio...', scene: (i, t) => `Cena ${i}/${t}...`, done: 'Vídeo pronto', narration_prep: 'Preparando narração...', narration_done: 'Narração pronta', voice_prep: 'Preparando vídeo com sua voz...', voice_done: 'Vídeo com sua voz pronto' },
  ru: { preparing: 'Подготовка...', prompts: 'Создание описаний...', audio: 'Генерация аудио...', scene: (i, t) => `Сцена ${i}/${t}...`, done: 'Видео готово', narration_prep: 'Подготовка рассказа...', narration_done: 'Рассказ готов', voice_prep: 'Подготовка видео с вашим голосом...', voice_done: 'Видео с вашим голосом готово' },
  zh: { preparing: '正在准备...', prompts: '正在创建描述...', audio: '正在生成音频...', scene: (i, t) => `正在生成场景 ${i}/${t}...`, done: '视频已就绪', narration_prep: '正在准备梦境叙述...', narration_done: '梦境叙述已就绪', voice_prep: '正在用您的声音准备视频...', voice_done: '您的声音视频已就绪' },
  hi: { preparing: 'तैयारी हो रही है...', prompts: 'विवरण बनाए जा रहे हैं...', audio: 'ऑडियो बना रहे हैं...', scene: (i, t) => `दृश्य ${i}/${t} बना रहे हैं...`, done: 'वीडियो तैयार है', narration_prep: 'सपने की कहानी तैयार हो रही है...', narration_done: 'सपने की कहानी तैयार है', voice_prep: 'आपकी आवाज़ से वीडियो तैयार हो रही है...', voice_done: 'आपकी आवाज़ का वीडियो तैयार है' },
  ja: { preparing: '準備中...', prompts: '説明を作成中...', audio: '音声を生成中...', scene: (i, t) => `シーン ${i}/${t} を生成中...`, done: '動画が完成しました', narration_prep: '夢のナレーションを準備中...', narration_done: '夢のナレーション完成', voice_prep: 'あなたの声で動画を準備中...', voice_done: 'あなたの声の動画が完成しました' },
  ko: { preparing: '준비 중...', prompts: '설명 생성 중...', audio: '오디오 생성 중...', scene: (i, t) => `장면 ${i}/${t} 생성 중...`, done: '비디오 준비 완료', narration_prep: '꿈 나레이션 준비 중...', narration_done: '꿈 나레이션 완료', voice_prep: '목소리로 비디오 준비 중...', voice_done: '목소리 비디오 완료' },
  id: { preparing: 'Mempersiapkan...', prompts: 'Membuat deskripsi...', audio: 'Membuat audio...', scene: (i, t) => `Membuat adegan ${i}/${t}...`, done: 'Video siap', narration_prep: 'Mempersiapkan narasi mimpi...', narration_done: 'Narasi mimpi siap', voice_prep: 'Mempersiapkan video dengan suara Anda...', voice_done: 'Video dengan suara Anda siap' },
  it: { preparing: 'Preparazione...', prompts: 'Creazione descrizioni...', audio: 'Generazione audio...', scene: (i, t) => `Scena ${i}/${t}...`, done: 'Video pronto', narration_prep: 'Preparazione narrazione...', narration_done: 'Narrazione pronta', voice_prep: 'Preparazione video con la tua voce...', voice_done: 'Video con la tua voce pronto' },
  pl: { preparing: 'Przygotowanie...', prompts: 'Tworzenie opisów...', audio: 'Generowanie dźwięku...', scene: (i, t) => `Scena ${i}/${t}...`, done: 'Film gotowy', narration_prep: 'Przygotowanie narracji...', narration_done: 'Narracja gotowa', voice_prep: 'Przygotowanie wideo z Twoim głosem...', voice_done: 'Wideo z Twoim głosem gotowe' },
  fa: { preparing: '...در حال آماده‌سازی', prompts: '...ایجاد توضیحات', audio: '...تولید صدا', scene: (i, t) => `...${t}/${i} صحنه`, done: 'ویدیو آماده است', narration_prep: '...آماده‌سازی روایت رویا', narration_done: 'روایت رویا آماده است', voice_prep: '...آماده‌سازی ویدیو با صدای شما', voice_done: 'ویدیو با صدای شما آماده است' },
  ur: { preparing: '...تیاری ہو رہی ہے', prompts: '...تفصیلات بنائی جا رہی ہیں', audio: '...آڈیو بنایا جا رہا ہے', scene: (i, t) => `...${t}/${i} منظر`, done: 'ویڈیو تیار ہے', narration_prep: '...خواب کا بیان تیار ہو رہا ہے', narration_done: 'خواب کا بیان تیار ہے', voice_prep: '...آپ کی آواز سے ویڈیو تیار ہو رہی ہے', voice_done: 'آپ کی آواز کی ویڈیو تیار ہے' },
  bn: { preparing: 'প্রস্তুতি চলছে...', prompts: 'বিবরণ তৈরি হচ্ছে...', audio: 'অডিও তৈরি হচ্ছে...', scene: (i, t) => `দৃশ্য ${i}/${t} তৈরি হচ্ছে...`, done: 'ভিডিও প্রস্তুত', narration_prep: 'স্বপ্নের বিবরণ প্রস্তুত হচ্ছে...', narration_done: 'স্বপ্নের বিবরণ প্রস্তুত', voice_prep: 'আপনার কণ্ঠে ভিডিও প্রস্তুত হচ্ছে...', voice_done: 'আপনার কণ্ঠের ভিডিও প্রস্তুত' },
  vi: { preparing: 'Đang chuẩn bị...', prompts: 'Tạo mô tả...', audio: 'Tạo âm thanh...', scene: (i, t) => `Tạo cảnh ${i}/${t}...`, done: 'Video đã sẵn sàng', narration_prep: 'Chuẩn bị lời kể giấc mơ...', narration_done: 'Lời kể giấc mơ đã sẵn sàng', voice_prep: 'Chuẩn bị video bằng giọng của bạn...', voice_done: 'Video bằng giọng của bạn đã sẵn sàng' },
  th: { preparing: 'กำลังเตรียม...', prompts: 'กำลังสร้างคำอธิบาย...', audio: 'กำลังสร้างเสียง...', scene: (i, t) => `กำลังสร้างฉาก ${i}/${t}...`, done: 'วิดีโอพร้อมแล้ว', narration_prep: 'กำลังเตรียมคำบรรยายความฝัน...', narration_done: 'คำบรรยายความฝันพร้อมแล้ว', voice_prep: 'กำลังเตรียมวิดีโอด้วยเสียงของคุณ...', voice_done: 'วิดีโอด้วยเสียงของคุณพร้อมแล้ว' },
  sw: { preparing: 'Inaandaa...', prompts: 'Inaunda maelezo...', audio: 'Inazalisha sauti...', scene: (i, t) => `Eneo ${i}/${t} linazalishwa...`, done: 'Video iko tayari', narration_prep: 'Inaandaa masimulizi ya ndoto...', narration_done: 'Masimulizi ya ndoto yako tayari', voice_prep: 'Inaandaa video na sauti yako...', voice_done: 'Video na sauti yako iko tayari' },
  hu: { preparing: 'Előkészítés...', prompts: 'Leírások készítése...', audio: 'Hang generálása...', scene: (i, t) => `${i}/${t}. jelenet generálása...`, done: 'Videó kész', narration_prep: 'Álom narráció előkészítése...', narration_done: 'Álom narráció kész', voice_prep: 'Videó előkészítése a hangoddal...', voice_done: 'Videó a hangoddal kész' },
  ta: { preparing: 'தயாரிக்கப்படுகிறது...', prompts: 'படங்கள் உருவாக்கப்படுகின்றன...', audio: 'ஒலி உருவாக்கப்படுகிறது...', scene: (i, t) => `காட்சி ${i}/${t} உருவாக்கப்படுகிறது...`, done: 'வீடியோ தயார்', narration_prep: 'கனவு கதை தயாரிக்கப்படுகிறது...', narration_done: 'கனவு கதை தயார்', voice_prep: 'உங்கள் குரலில் வீடியோ தயாரிக்கப்படுகிறது...', voice_done: 'உங்கள் குரலில் வீடியோ தயார்' },
  te: { preparing: 'సిద్ధమవుతోంది...', prompts: 'చిత్రాలు రూపొందిస్తున్నాయి...', audio: 'ఆడియో రూపొందిస్తున్నది...', scene: (i, t) => `దృశ్యం ${i}/${t} రూపొందిస్తున్నది...`, done: 'వీడియో సిద్ధం', narration_prep: 'కల కథ సిద్ధమవుతోంది...', narration_done: 'కల కథ సిద్ధం', voice_prep: 'మీ గళంతో వీడియో సిద్ధమవుతోంది...', voice_done: 'మీ గళంతో వీడియో సిద్ధం' },
  tl: { preparing: 'Naghahanda...', prompts: 'Lumilikha ng mga larawan...', audio: 'Gumagawa ng audio...', scene: (i, t) => `Tagpo ${i}/${t} ginagawa...`, done: 'Handa na ang video', narration_prep: 'Inihahanda ang salaysay ng panaginip...', narration_done: 'Handa na ang salaysay', voice_prep: 'Inihahanda ang video sa inyong boses...', voice_done: 'Handa na ang video sa inyong boses' },
  ml: { preparing: 'തയ്യാറാകുന്നു...', prompts: 'ചിത്രങ്ങൾ ഉണ്ടാക്കുന്നു...', audio: 'ശബ്ദം ഉണ്ടാക്കുന്നു...', scene: (i, t) => `രംഗം ${i}/${t} ഉണ്ടാക്കുന്നു...`, done: 'വീഡിയോ തയ്യാർ', narration_prep: 'സ്വപ്‌ന കഥ തയ്യാറാകുന്നു...', narration_done: 'സ്വപ്‌ന കഥ തയ്യാർ', voice_prep: 'നിങ്ങളുടെ ശബ്ദത്തിൽ വീഡിയോ തയ്യാറാകുന്നു...', voice_done: 'നിങ്ങളുടെ ശബ്ദത്തിൽ വീഡിയോ തയ്യാർ' },
  mr: { preparing: 'तयारी होत आहे...', prompts: 'चित्रे तयार होत आहेत...', audio: 'ऑडिओ तयार होत आहे...', scene: (i, t) => `दृश्य ${i}/${t} तयार होत आहे...`, done: 'व्हिडिओ तयार', narration_prep: 'स्वप्न कथा तयार होत आहे...', narration_done: 'स्वप्न कथा तयार', voice_prep: 'तुमच्या आवाजाने व्हिडिओ तयार होत आहे...', voice_done: 'तुमच्या आवाजाने व्हिडिओ तयार' },
  kn: { preparing: 'ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...', prompts: 'ಚಿತ್ರಗಳನ್ನು ರಚಿಸಲಾಗುತ್ತಿದೆ...', audio: 'ಆಡಿಯೋ ರಚಿಸಲಾಗುತ್ತಿದೆ...', scene: (i, t) => `ದೃಶ್ಯ ${i}/${t} ರಚಿಸಲಾಗುತ್ತಿದೆ...`, done: 'ವೀಡಿಯೊ ಸಿದ್ಧ', narration_prep: 'ಕನಸಿನ ಕಥೆ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...', narration_done: 'ಕನಸಿನ ಕಥೆ ಸಿದ್ಧ', voice_prep: 'ನಿಮ್ಮ ಧ್ವನಿಯಲ್ಲಿ ವೀಡಿಯೊ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...', voice_done: 'ನಿಮ್ಮ ಧ್ವನಿಯಲ್ಲಿ ವೀಡಿಯೊ ಸಿದ್ಧ' },
  gu: { preparing: 'તૈयार थઈ रही छे...', prompts: 'ચित્रો बनावाई रह्या छे...', audio: 'ઓडियो बनावाई रह्यो छे...', scene: (i, t) => `दृश्य ${i}/${t} बनावाई रह्यो छे...`, done: 'विडियो तैयार छे', narration_prep: 'स्वप्न कथा तैयार थઈ रही छे...', narration_done: 'स्वप्न कथा तैयार छे', voice_prep: 'तमारा अवाजथी विडियो तैयार थઈ रही छे...', voice_done: 'तमारा अवाजनो विडियो तैयार छे' },
  he: { preparing: '...מתכונן', prompts: '...יוצר תיאורים', audio: '...מייצר שמע', scene: (i, t) => `...${t}/${i} יוצר סצנה`, done: 'הסרטון מוכן', narration_prep: '...מכין סיפור חלום', narration_done: 'סיפור החלום מוכן', voice_prep: '...מכין סרטון בקולך', voice_done: 'הסרטון בקולך מוכן' },
  ne: { preparing: 'तयारी भइरहेको छ...', prompts: 'चित्रहरू बनाइँदैछ...', audio: 'अडियो बनाइँदैछ...', scene: (i, t) => `दृश्य ${i}/${t} बनाइँदैछ...`, done: 'भिडियो तयार', narration_prep: 'सपनाको कथा तयार भइरहेको छ...', narration_done: 'सपनाको कथा तयार', voice_prep: 'तपाईंको आवाजमा भिडियो तयार भइरहेको छ...', voice_done: 'तपाईंको आवाजको भिडियो तयार' },
  prs: { preparing: '...در حال آماده‌سازی', prompts: '...ایجاد توضیحات', audio: '...تولید صدا', scene: (i, t) => `...${t}/${i} صحنه`, done: 'ویدیو آماده است', narration_prep: '...آماده‌سازی روایت خواب', narration_done: 'روایت خواب آماده است', voice_prep: '...آماده‌سازی ویدیو با صدای شما', voice_done: 'ویدیو با صدای شما آماده است' },
  'ar-gulf': { preparing: '...جاري التحضير', prompts: '...إنشاء الأوصاف', audio: '...إنشاء الصوت', scene: (i, t) => `...${t}/${i} إنشاء المشهد`, done: 'الفيديو جاهز', narration_prep: '...تحضير سرد الحلم', narration_done: 'سرد الحلم جاهز', voice_prep: '...تحضير الفيديو بصوتك', voice_done: 'الفيديو بصوتك جاهز' },
  'ar-eg': { preparing: '...جاري التحضير', prompts: '...إنشاء الأوصاف', audio: '...إنشاء الصوت', scene: (i, t) => `...${t}/${i} إنشاء المشهد`, done: 'الفيديو جاهز', narration_prep: '...تحضير سرد الحلم', narration_done: 'سرد الحلم جاهز', voice_prep: '...تحضير الفيديو بصوتك', voice_done: 'الفيديو بصوتك جاهز' },
  'ar-lev': { preparing: '...جاري التحضير', prompts: '...إنشاء الأوصاف', audio: '...إنشاء الصوت', scene: (i, t) => `...${t}/${i} إنشاء المشهد`, done: 'الفيديو جاهز', narration_prep: '...تحضير سرد الحلم', narration_done: 'سرد الحلم جاهز', voice_prep: '...تحضير الفيديو بصوتك', voice_done: 'الفيديو بصوتك جاهز' },
  'ar-mag': { preparing: '...جاري التحضير', prompts: '...إنشاء الأوصاف', audio: '...إنشاء الصوت', scene: (i, t) => `...${t}/${i} إنشاء المشهد`, done: 'الفيديو جاهز', narration_prep: '...تحضير سرد الحلم', narration_done: 'سرد الحلم جاهز', voice_prep: '...تحضير الفيديو بصوتك', voice_done: 'الفيديو بصوتك جاهز' },
  'ar-iq': { preparing: '...جاري التحضير', prompts: '...إنشاء الأوصاف', audio: '...إنشاء الصوت', scene: (i, t) => `...${t}/${i} إنشاء المشهد`, done: 'الفيديو جاهز', narration_prep: '...تحضير سرد الحلم', narration_done: 'سرد الحلم جاهز', voice_prep: '...تحضير الفيديو بصوتك', voice_done: 'الفيديو بصوتك جاهز' },
};
const getVideoT = (lang: Language) => videoI18n[lang] || videoI18n.de;

export const generateStoryVideo = async (
  dreamDescription: string,
  dreamInterpretation: string,
  style: ImageStyle,
  language: Language,
  onProgress?: (status: string, percent: number) => void,
): Promise<StoryVideoResult> => {
  const vt = getVideoT(language);
  onProgress?.(vt.preparing, 5);

  const cleanText = dreamInterpretation.replace(/[#*_`]/g, '').trim();

  // KI-basierte Szenen-Analyse: Text in visuelle Szenen aufteilen
  let segmentsText: string[] = [];
  try {
    const scenePrompt = `Analyze this dream text and split it into 4-8 visual scenes. Each scene should represent a distinct visual moment that can be illustrated as a single image.

Dream: "${dreamDescription}"
Text: "${cleanText.slice(0, 2000)}"

Return ONLY a JSON array of scene descriptions (no markdown, no explanation). Each element should be a short sentence describing the visual scene.
Example: ["A person standing in front of an old house at night","Walking through a dark garage","Driving a car on an empty highway"]`;

    const sceneResult = await callGeminiText('gemini-2.0-flash', scenePrompt, { temperature: 0.5, maxOutputTokens: 1000 });
    if (sceneResult) {
      const jsonMatch = sceneResult.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          segmentsText = parsed.map((s: any) => String(s).trim()).filter((s: string) => s.length > 3);
        }
      }
    }
  } catch (e) {
    console.warn('[VIDEO] KI-Szenen-Analyse fehlgeschlagen, verwende Fallback:', e);
  }

  // Fallback: einfache Wort-basierte Aufteilung
  if (segmentsText.length < 2) {
    const words = cleanText.split(/\s+/).filter(Boolean);
    const targetSegments = Math.min(8, Math.max(4, Math.ceil(words.length / 18)));
    const wordsPerSegment = Math.max(8, Math.ceil(words.length / targetSegments));
    segmentsText = [];
    for (let i = 0; i < words.length; i += wordsPerSegment) {
      const chunk = words.slice(i, i + wordsPerSegment).join(' ').trim();
      if (chunk) segmentsText.push(chunk);
    }
  }

  if (segmentsText.length === 0) {
    segmentsText.push(cleanText || dreamDescription);
  }

  onProgress?.(vt.prompts, 15);

  const prompts = await Promise.all(
    segmentsText.map(async segment => {
      try {
        return await generateImagePrompt(dreamDescription, segment);
      } catch {
        return `${segment}. dreamlike symbolic visual scene`;
      }
    }),
  );

  onProgress?.(vt.audio, 30);

  // Google Cloud TTS via /api/deepgram-tts?provider=google (multilingual Chirp3-HD)
  let speech: string | null = null;
  try {
    const ttsRes = await apiFetch('/api/deepgram-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText.slice(0, 4500), language, provider: 'google' }),
    });
    if (ttsRes.ok) {
      const blob = await ttsRes.blob();
      speech = await blobToBase64(blob);
    }
  } catch (e) {
    console.warn('[VIDEO] Google TTS fehlgeschlagen, Fallback auf Deepgram', e);
  }

  // Fallback: Deepgram Aura
  if (!speech) {
    const voice = getDeepgramVoice(language);
    speech = await generateSpeechPreview(cleanText.slice(0, 4500), voice, null, language);
  }

  if (!speech) {
    throw new Error('Audio konnte nicht generiert werden');
  }

  const timing: Array<{ start: number; end: number }> = [];
  let currentTime = 0;
  for (const segment of segmentsText) {
    const duration = Math.max(2, segment.split(/\s+/).filter(Boolean).length / 2.5);
    timing.push({ start: currentTime, end: currentTime + duration });
    currentTime += duration;
  }

  const segments: StorySegment[] = [];
  for (let index = 0; index < segmentsText.length; index += 1) {
    onProgress?.(vt.scene(index + 1, segmentsText.length), 35 + Math.round((index / segmentsText.length) * 55));
    const imageUrl = await generateDreamImage(prompts[index], null, 'normal', style);
    segments.push({
      text: segmentsText[index],
      imagePrompt: prompts[index],
      imageUrl: imageUrl || undefined,
      startTime: timing[index].start,
      endTime: timing[index].end,
    });
    if (index < segmentsText.length - 1) {
      await sleep(200);
    }
  }

  const videoPayload = {
    type: 'story-video',
    segments,
    audioBase64: speech,
    totalDuration: currentTime,
  };

  const json = JSON.stringify(videoPayload);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  onProgress?.(vt.done, 100);

  return {
    segments,
    audioBase64: speech,
    totalDuration: currentTime,
    videoDataUrl: `data:application/json;base64,${base64}`,
  };
};

export const generateDreamNarrationVideo = async (
  dreamDescription: string,
  style: ImageStyle,
  language: Language,
  onProgress?: (status: string, percent: number) => void,
): Promise<StoryVideoResult> => {
  const vt = getVideoT(language);
  onProgress?.(vt.narration_prep, 5);

  const cleanText = dreamDescription.replace(/[#*_`]/g, '').trim();
  const words = cleanText.split(/\s+/).filter(Boolean);
  const targetSegments = Math.min(8, Math.max(4, Math.ceil(words.length / 18)));
  const wordsPerSegment = Math.max(8, Math.ceil(words.length / targetSegments));
  const segmentsText: string[] = [];

  for (let i = 0; i < words.length; i += wordsPerSegment) {
    const chunk = words.slice(i, i + wordsPerSegment).join(' ').trim();
    if (chunk) {
      segmentsText.push(chunk);
    }
  }

  if (segmentsText.length === 0) {
    segmentsText.push(cleanText || dreamDescription);
  }

  onProgress?.(vt.prompts, 15);

  const prompts = await Promise.all(
    segmentsText.map(async segment => {
      try {
        return await generateImagePrompt(dreamDescription, segment);
      } catch {
        return `${segment}. dreamlike symbolic visual scene`;
      }
    }),
  );

  onProgress?.(vt.audio, 30);

  let speech: string | null = null;
  try {
    const ttsRes = await apiFetch('/api/deepgram-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText.slice(0, 4500), language, provider: 'google' }),
    });
    if (ttsRes.ok) {
      const blob = await ttsRes.blob();
      speech = await blobToBase64(blob);
    }
  } catch (e) {
    console.warn('[VIDEO] Google TTS fehlgeschlagen, Fallback auf Deepgram', e);
  }

  if (!speech) {
    const voice = getDeepgramVoice(language);
    speech = await generateSpeechPreview(cleanText.slice(0, 4500), voice, null, language);
  }

  if (!speech) {
    throw new Error('Audio konnte nicht generiert werden');
  }

  const timing: Array<{ start: number; end: number }> = [];
  let currentTime = 0;
  for (const segment of segmentsText) {
    const duration = Math.max(2, segment.split(/\s+/).filter(Boolean).length / 2.5);
    timing.push({ start: currentTime, end: currentTime + duration });
    currentTime += duration;
  }

  const segments: StorySegment[] = [];
  for (let index = 0; index < segmentsText.length; index += 1) {
    onProgress?.(vt.scene(index + 1, segmentsText.length), 35 + Math.round((index / segmentsText.length) * 55));
    const imageUrl = await generateDreamImage(prompts[index], null, 'normal', style);
    segments.push({
      text: segmentsText[index],
      imagePrompt: prompts[index],
      imageUrl: imageUrl || undefined,
      startTime: timing[index].start,
      endTime: timing[index].end,
    });
    if (index < segmentsText.length - 1) {
      await sleep(200);
    }
  }

  const videoPayload = {
    type: 'dream-narration',
    segments,
    audioBase64: speech,
    totalDuration: currentTime,
  };

  const json = JSON.stringify(videoPayload);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  onProgress?.(vt.narration_done, 100);

  return {
    segments,
    audioBase64: speech,
    totalDuration: currentTime,
    videoDataUrl: `data:application/json;base64,${base64}`,
  };
};

export const generateDreamUserVoiceVideo = async (
  dreamDescription: string,
  userAudioBase64: string,
  style: ImageStyle,
  language: Language,
  onProgress?: (status: string, percent: number) => void,
): Promise<StoryVideoResult> => {
  const vt = getVideoT(language);
  onProgress?.(vt.voice_prep, 5);

  const cleanText = dreamDescription.replace(/[#*_`]/g, '').trim();
  const words = cleanText.split(/\s+/).filter(Boolean);
  const targetSegments = Math.min(8, Math.max(4, Math.ceil(words.length / 18)));
  const wordsPerSegment = Math.max(8, Math.ceil(words.length / targetSegments));
  const segmentsText: string[] = [];

  for (let i = 0; i < words.length; i += wordsPerSegment) {
    const chunk = words.slice(i, i + wordsPerSegment).join(' ').trim();
    if (chunk) {
      segmentsText.push(chunk);
    }
  }

  if (segmentsText.length === 0) {
    segmentsText.push(cleanText || dreamDescription);
  }

  // Audio-Dauer schaetzen: Base64 -> Bytes -> Sekunden (ca. 16kbit/s Sprache)
  const rawBase64 = userAudioBase64.includes(',') ? userAudioBase64.split(',')[1] : userAudioBase64;
  const audioBytes = Math.floor((rawBase64.length * 3) / 4);
  const estimatedDuration = Math.max(5, audioBytes / 2000);

  onProgress?.(vt.prompts, 15);

  const prompts = await Promise.all(
    segmentsText.map(async segment => {
      try {
        return await generateImagePrompt(dreamDescription, segment);
      } catch {
        return `${segment}. dreamlike symbolic visual scene`;
      }
    }),
  );

  // Timing gleichmaessig auf geschaetzte Gesamt-Dauer verteilen
  const timing: Array<{ start: number; end: number }> = [];
  const segmentDuration = estimatedDuration / segmentsText.length;
  for (let i = 0; i < segmentsText.length; i++) {
    timing.push({ start: i * segmentDuration, end: (i + 1) * segmentDuration });
  }
  const totalDuration = estimatedDuration;

  const segments: StorySegment[] = [];
  for (let index = 0; index < segmentsText.length; index += 1) {
    onProgress?.(vt.scene(index + 1, segmentsText.length), 25 + Math.round((index / segmentsText.length) * 65));
    const imageUrl = await generateDreamImage(prompts[index], null, 'normal', style);
    segments.push({
      text: segmentsText[index],
      imagePrompt: prompts[index],
      imageUrl: imageUrl || undefined,
      startTime: timing[index].start,
      endTime: timing[index].end,
    });
    if (index < segmentsText.length - 1) {
      await sleep(200);
    }
  }

  const videoPayload = {
    type: 'dream-user-voice',
    segments,
    audioBase64: userAudioBase64,
    totalDuration,
  };

  const json = JSON.stringify(videoPayload);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  onProgress?.(vt.voice_done, 100);

  return {
    segments,
    audioBase64: userAudioBase64,
    totalDuration,
    videoDataUrl: `data:application/json;base64,${base64}`,
  };
};

export const generateDreamVideo = async (
  prompt: string,
  userProfile: UserProfile | null,
  arg3?: unknown,
  arg4?: unknown,
  lang?: Language,
): Promise<string | null> => {
  const style = normalizeVideoStyle(typeof arg4 === 'string' ? arg4 : undefined);
  const language = lang || Language.DE;

  const premiumRequested = arg3 === true || arg3 === 'high';
  const analysis = await analyzeDreamPremium(prompt, language, userProfile, premiumRequested);
  if (!analysis.interpretation) {
    return null;
  }

  const storyVideo = await generateStoryVideo(prompt, analysis.interpretation, style, language);
  return storyVideo.videoDataUrl;
};

export const getActiveProviderSummary = () => {
  // Keys are server-side — all providers are assumed configured via /api/* endpoints
  return {
    text: getTextRoutes().map(route => ({
      tier: route.tier,
      provider: route.provider,
      model: route.model,
      configured: true,
    })),
    image: getImageRoutes().map(route => ({
      tier: route.tier,
      provider: route.provider,
      model: route.model,
      configured: true,
    })),
    audio: {
      deepgram: true,
      elevenlabs: true,
      deepgramMask: '***',
      elevenlabsMask: '***',
    },
  };
};

export { ELEVENLABS_VOICES, isElevenLabsConfigured, type EmotionStyle };

