import { Language, UserProfile, SubscriptionTier } from '../types';
import {
  getProviderSecret,
  getTextRoutes,
  getImageRoutes,
  getGeminiKeys,
  maskSecret,
  isPremiumTextTier,
} from '../config/providerRouting';
import {
  generateSpeechElevenLabs,
  isElevenLabsConfigured,
  ELEVENLABS_VOICES,
  type EmotionStyle,
} from './elevenlabsService';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const RUNWARE_API_BASE = 'https://api.runware.ai/v1';
const POLLINATIONS_API_BASE = 'https://image.pollinations.ai/prompt';
const DEFAULT_DEEPGRAM_MODEL = 'aura-asteria-en';

type ImageStyle = 'cartoon' | 'anime' | 'real' | 'fantasy' | 'surreal' | 'watercolor';
type ImageQuality = 'normal' | 'high';

type TextProvider = 'gemini' | 'deepseek';

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

const buildDreamPrompt = (dreamText: string, language: Language, userProfile: UserProfile | null): string => {
  const languageName = LANGUAGE_NAMES[language] || 'English';
  const contextBits = [
    userProfile?.age ? `Age: ${userProfile.age}` : '',
    userProfile?.gender ? `Gender: ${userProfile.gender}` : '',
    userProfile?.location ? `Location: ${userProfile.location}` : '',
    userProfile?.workType ? `Work type: ${userProfile.workType}` : '',
    userProfile?.remarks ? `Remarks: ${userProfile.remarks}` : '',
  ].filter(Boolean);

  return [
    'You are an empathetic dream interpreter.',
    `Respond in ${languageName}.`,
    'Analyze the dream with symbolism, emotional meaning, and practical guidance.',
    'Use clear sections and a warm, grounded tone.',
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
  const keys = getGeminiKeys();
  if (keys.length === 0) {
    throw new Error('Kein Gemini API-Key konfiguriert');
  }

  let lastError: Error = new Error('Unbekannter Fehler');

  for (const apiKey of keys) {
    try {
      const response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options?.temperature ?? 0.7,
            maxOutputTokens: options?.maxOutputTokens ?? 1800,
          },
        }),
      });

      if (response.status === 429 || response.status === 403) {
        console.warn(`[GEMINI] Key erschöpft (${response.status}), nächster Key...`);
        lastError = new Error(`Gemini Key ${response.status}`);
        continue;
      }

      if (!response.ok) {
        throw new Error(`Gemini API-Fehler: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Gemini lieferte keinen Text');
      }

      return text.trim();
    } catch (err) {
      if (err instanceof Error && (err.message.includes('429') || err.message.includes('403'))) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  throw lastError;
};

const callDeepSeekText = async (
  model: string,
  prompt: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> => {
  const apiKey = getProviderSecret('deepseek');
  if (!apiKey) {
    throw new Error('DeepSeek API-Key fehlt');
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API-Fehler: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('DeepSeek lieferte keinen Text');
  }

  return text.trim();
};

const callGroqFallback = async (prompt: string, language: Language): Promise<string> => {
  const LANG_NAMES: Record<string, string> = {
    de: 'Deutsch', tr: 'Tuerkisch', en: 'English', es: 'Spanisch',
    fr: 'Franzoesisch', ar: 'Arabisch', pt: 'Portugiesisch', ru: 'Russisch',
    zh: 'Chinesisch', hi: 'Hindi', ja: 'Japanisch', ko: 'Koreanisch',
    id: 'Indonesisch', fa: 'Persisch', it: 'Italienisch', pl: 'Polnisch',
    bn: 'Bengalisch', ur: 'Urdu', vi: 'Vietnamesisch', th: 'Thailaendisch',
    sw: 'Swahili',
  };
  const langName = LANG_NAMES[language] || 'Deutsch';

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      language,
      systemPrompt: `Du bist ein einfuehlsamer Traumdeuter. Antworte NUR in ${langName}. Analysiere den Traum mit Symbolik, emotionaler Bedeutung und praktischer Orientierung. Nutze klare Abschnitte und einen warmen, fundierten Ton.`,
    }),
  });

  if (!res.ok) throw new Error(`Groq fallback error: ${res.status}`);
  const data = await res.json();
  if (!data.reply) throw new Error('Groq lieferte keine Antwort');
  return data.reply;
};

const analyzeDreamInternal = async (
  dreamText: string,
  language: Language,
  userProfile: UserProfile | null,
  preferredTier: 'default' | 'premium' = 'default',
): Promise<DreamAnalysisResult> => {
  const prompt = buildDreamPrompt(dreamText, language, userProfile);
  const textRoutes = getTextRoutes();
  const routes = preferredTier === 'premium'
    ? [textRoutes.find(route => route.tier === 'premium'), textRoutes.find(route => route.tier === 'default'), textRoutes.find(route => route.tier === 'fallback')]
    : [textRoutes.find(route => route.tier === 'default'), textRoutes.find(route => route.tier === 'fallback')];

  for (const route of routes.filter(Boolean)) {
    try {
      if (route!.provider === 'gemini') {
        const interpretation = await callGeminiText(route!.model, prompt, { temperature: 0.75, maxOutputTokens: 2200 });
        return { interpretation, provider: 'gemini', model: route!.model };
      }

      const interpretation = await callDeepSeekText(route!.model, prompt, { temperature: 0.75, maxTokens: 2200 });
      return { interpretation, provider: 'deepseek', model: route!.model };
    } catch (error) {
      console.warn(`[TEXT] ${route!.provider} fehlgeschlagen (${route!.model})`, error);
    }
  }

  // Groq/Mistral server-side fallback via /api/chat
  try {
    console.log('[TEXT] Alle Gemini-Keys fehlgeschlagen, nutze Groq-Fallback...');
    const interpretation = await callGroqFallback(prompt, language);
    return { interpretation, provider: 'gemini' as any, model: 'groq-fallback' };
  } catch (error) {
    console.warn('[TEXT] Groq-Fallback fehlgeschlagen', error);
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
): Promise<{ interpretation: string }> => {
  const result = await analyzeDreamInternal(dreamText, language, userProfile, 'default');
  return { interpretation: result.interpretation };
};

export const analyzeDreamPremium = async (
  dreamText: string,
  language: Language = Language.DE,
  userProfile: UserProfile | null = null,
  usePremium: boolean = false,
): Promise<{ interpretation: string; provider: 'gemini' | 'deepseek' | 'unavailable' }> => {
  const preferredTier = usePremium && isPremiumTextTier(userProfile?.subscriptionTier) ? 'premium' : 'default';
  const result = await analyzeDreamInternal(dreamText, language, userProfile, preferredTier);
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
    const res = await fetch('/api/chat', {
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
        console.log('[IMAGE PROMPT] Groq-Fallback OK');
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
  const apiKey = getProviderSecret('runware');
  if (!apiKey) {
    return null;
  }

  const standardModel = getImageRoutes().find(route => route.tier === 'standard')?.model || 'runware:100@1';

  const response = await fetch(RUNWARE_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify([
      {
        taskType: 'imageInference',
        taskUUID: crypto.randomUUID(),
        model: standardModel,
        positivePrompt: prompt,
        negativePrompt,
        width: quality === 'high' ? 1280 : 1024,
        height: quality === 'high' ? 720 : 576,
        numberResults: 1,
        CFGScale: 7,
        steps: quality === 'high' ? 28 : 20,
      },
    ]),
  });

  if (!response.ok) {
    throw new Error(`Runware API-Fehler: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.[0]?.imageURL || null;
};

const generateGeminiImage = async (prompt: string): Promise<string | null> => {
  const apiKey = getProviderSecret('gemini');
  if (!apiKey) {
    return null;
  }

  const premiumModel = getImageRoutes().find(route => route.tier === 'premium')?.model || 'gemini-2.5-flash-image';
  const response = await fetch(`${GEMINI_API_BASE}/${premiumModel}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini Image API-Fehler: ${response.status}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const inlineImage = parts.find((part: { inlineData?: { data?: string; mimeType?: string } }) => part.inlineData?.data);
  if (!inlineImage?.inlineData?.data) {
    return null;
  }

  return `data:${inlineImage.inlineData.mimeType || 'image/png'};base64,${inlineImage.inlineData.data}`;
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
): Promise<string | null> => {
  const { quality, style } = normalizeImageArgs(arg2, arg3, arg4, arg5);
  const styleConfig = STYLE_PROMPTS[style] || STYLE_PROMPTS.fantasy;

  let visualPrompt = dreamDescription.trim();
  try {
    const optimized = await generateImagePrompt(dreamDescription, 'Visualize the core symbolic meaning of the dream.');
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
): Promise<string | null> => {
  const apiKey = getProviderSecret('deepgram');
  if (!apiKey) {
    console.warn('[TTS] Deepgram API-Key fehlt');
    return null;
  }

  try {
    const response = await fetch(`https://api.deepgram.com/v1/speak?model=${encodeURIComponent(voice)}`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Deepgram API-Fehler: ${response.status}`);
    }

    return await blobToBase64(await response.blob());
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

  // Google Cloud TTS via /api/tts (multilingual Chirp3-HD)
  let speech: string | null = null;
  try {
    const ttsRes = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText.slice(0, 4500), language }),
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
    speech = await generateSpeechPreview(cleanText.slice(0, 4500), voice, null);
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
    const ttsRes = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText.slice(0, 4500), language }),
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
    speech = await generateSpeechPreview(cleanText.slice(0, 4500), voice, null);
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
): Promise<string | null> => {
  const style = normalizeVideoStyle(typeof arg4 === 'string' ? arg4 : undefined);
  const language = Language.DE;

  const premiumRequested = arg3 === true || arg3 === 'high';
  const analysis = await analyzeDreamPremium(prompt, language, userProfile, premiumRequested);
  if (!analysis.interpretation) {
    return null;
  }

  const storyVideo = await generateStoryVideo(prompt, analysis.interpretation, style, language);
  return storyVideo.videoDataUrl;
};

export const getActiveProviderSummary = () => {
  return {
    text: getTextRoutes().map(route => ({
      tier: route.tier,
      provider: route.provider,
      model: route.model,
      configured: Boolean(getProviderSecret(route.provider === 'gemini' ? 'gemini' : 'deepseek')),
    })),
    image: getImageRoutes().map(route => ({
      tier: route.tier,
      provider: route.provider,
      model: route.model,
      configured:
        route.provider === 'runware'
          ? Boolean(getProviderSecret('runware'))
          : route.provider === 'gemini'
            ? Boolean(getProviderSecret('gemini'))
            : true,
    })),
    audio: {
      deepgram: Boolean(getProviderSecret('deepgram')),
      elevenlabs: Boolean(getProviderSecret('elevenlabs')),
      deepgramMask: maskSecret(getProviderSecret('deepgram')),
      elevenlabsMask: maskSecret(getProviderSecret('elevenlabs')),
    },
  };
};

export { ELEVENLABS_VOICES, isElevenLabsConfigured, type EmotionStyle };

