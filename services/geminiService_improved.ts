// geminiService.ts - Version 3.0 mit CORS-Fix & verbesserter Slideshow
import { Language, UserProfile, SubscriptionTier } from '../types';

// ============================================
// DREAM ANALYSIS (Triple Failover)
// ============================================

export const analyzeDreamText = async (
    dreamText: string,
    religiousCategories: string[],
    userProfile: UserProfile | null,
    language: Language = Language.DE
): Promise<string> => {
    console.log('[ANALYSIS] Starting dream analysis...');

    const langNames: Record<Language, string> = {
        [Language.DE]: 'German', [Language.EN]: 'English', [Language.TR]: 'Turkish',
        [Language.ES]: 'Spanish', [Language.FR]: 'French', [Language.AR]: 'Arabic',
        [Language.PT]: 'Portuguese', [Language.RU]: 'Russian'
    };

    const systemPrompt = `You are a dream interpreter. Analyze dreams based on: ${religiousCategories.join(', ')}.
Respond in ${langNames[language]}. Be insightful and personal.`;

    const userPrompt = `Analyze this dream: "${dreamText}"
${userProfile ? `Context: ${userProfile.age} years old, ${userProfile.gender}, ${userProfile.occupation}` : ''}`;

    // Try Gemini first (via Proxy)
    try {
        const response = await fetch(
            `/api/gemini/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
                    generationConfig: { temperature: 0.8, maxOutputTokens: 2000 }
                })
            }
        );
        if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                console.log('[ANALYSIS] ✅ Gemini succeeded');
                return text;
            }
        }
        throw new Error(`Gemini failed: ${response.status}`);
    } catch (e) {
        console.log('[FAILOVER] Gemini failed, trying GROQ...', e);
    }

    // Try GROQ (via Proxy)
    try {
        const response = await fetch('/api/groq/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8,
                max_tokens: 2000
            })
        });
        if (response.ok) {
            const data = await response.json();
            console.log('[FAILOVER] ✅ GROQ succeeded');
            return data.choices[0].message.content;
        }
    } catch (e) {
        console.log('[FAILOVER] GROQ failed, trying Mistral...', e);
    }

    // Try Mistral (via Proxy)
    try {
        const response = await fetch('/api/mistral/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: 'mistral-small-latest',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8,
                max_tokens: 2000
            })
        });
        if (response.ok) {
            const data = await response.json();
            console.log('[FAILOVER] ✅ Mistral succeeded');
            return data.choices[0].message.content;
        }
    } catch (e) {
        console.log('[FAILOVER] Mistral failed');
    }

    return 'Dream analysis temporarily unavailable. Please try again.';
};

// ============================================
// IMAGE GENERATION - Verbesserte Stile!
// ============================================

const STYLE_PROMPTS = {
    cartoon: {
        prefix: "Pixar Disney 3D animated movie style, vibrant saturated colors, smooth rounded shapes, expressive characters, cheerful lighting, CGI render, adorable cute aesthetic, Dreamworks animation quality",
        negative: "realistic, photo, dark, scary, horror, anime, 2D"
    },
    anime: {
        prefix: "Studio Ghibli anime style, Makoto Shinkai, beautiful detailed anime art, cel shading, dramatic sky, vibrant colors, manga illustration, Japanese animation, detailed backgrounds, sparkles and light effects",
        negative: "3D, CGI, realistic, photo, western cartoon, ugly, deformed"
    },
    real: {
        prefix: "Ultra photorealistic, professional DSLR photography, 8K UHD, cinematic lighting, shallow depth of field, sharp focus, hyperrealistic details, award-winning photo, National Geographic style",
        negative: "cartoon, anime, illustration, drawing, painting, CGI, 3D render, artificial"
    },
    fantasy: {
        prefix: "Epic fantasy digital art, magical glowing particles, ethereal atmosphere, mystical fog, enchanted lighting, Lord of the Rings style, concept art, dramatic clouds, divine rays, otherworldly beauty, artstation trending",
        negative: "modern, urban, technology, cartoon, anime, realistic photo"
    },
    surreal: {
        prefix: "Salvador Dali surrealism, dreamlike impossible architecture, melting objects, floating elements, cosmic background, mind-bending perspective, psychedelic colors, ethereal glow",
        negative: "realistic, mundane, ordinary, cartoon"
    },
    watercolor: {
        prefix: "Beautiful watercolor painting, soft bleeding edges, artistic brush strokes, delicate color washes, dreamy aesthetic, fine art illustration, traditional media look",
        negative: "digital, photo, sharp edges, 3D"
    }
};

export const generateDreamImage = async (
    dreamDescription: string,
    userProfile: UserProfile | null,
    quality: 'normal' | 'high' = 'normal',
    style: 'cartoon' | 'anime' | 'real' | 'fantasy' | 'surreal' | 'watercolor' = 'fantasy'
): Promise<string | null> => {
    console.log(`[IMAGE] Generating ${quality} quality, ${style} style`);

    const styleConfig = STYLE_PROMPTS[style] || STYLE_PROMPTS.fantasy;

    // Optimize prompt via GROQ
    let visualPrompt = dreamDescription;
    try {
        const response = await fetch('/api/groq/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{
                    role: 'user',
                    content: `Convert this dream to a visual image prompt (max 80 words, no text/letters):
"${dreamDescription}"
Focus on: visual elements, colors, mood, scenery. Output ONLY the prompt.`
                }],
                temperature: 0.7,
                max_tokens: 150
            })
        });
        if (response.ok) {
            const data = await response.json();
            visualPrompt = data.choices[0].message.content.trim();
            console.log('[IMAGE] Optimized prompt:', visualPrompt.substring(0, 50) + '...');
        }
    } catch (e) {
        console.log('[IMAGE] Prompt optimization failed, using original');
    }

    // Full prompt with style
    const fullPrompt = `${styleConfig.prefix}, ${visualPrompt}, masterpiece, best quality`;
    console.log('[IMAGE] Full prompt length:', fullPrompt.length);

    // Generate with Runware (via Proxy)
    try {
        const response = await fetch('/api/runware/v1', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RUNWARE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{
                taskType: 'imageInference',
                taskUUID: crypto.randomUUID(),
                model: quality === 'high' ? 'runware:101@1' : 'runware:100@1',
                positivePrompt: fullPrompt,
                negativePrompt: styleConfig.negative,
                width: quality === 'high' ? 1280 : 1024,
                height: quality === 'high' ? 720 : 576,
                numberResults: 1,
                CFGScale: 7.5,
                scheduler: 'DPM++ 2M Karras',
                steps: quality === 'high' ? 30 : 20
            }])
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[IMAGE] Runware error:', errText);
            throw new Error(`Runware failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('[IMAGE] Runware response:', JSON.stringify(data).substring(0, 200));

        if (data.data?.[0]?.imageURL) {
            console.log('[IMAGE] ✅ Success!');
            return data.data[0].imageURL;
        }
    } catch (e) {
        console.error('[IMAGE] Generation failed:', e);
    }

    return null;
};

// ============================================
// VIDEO GENERATION - REMOVED (Bad Quality)
// Quick Video with Replicate has been removed
// Only Story Video (slideshow) is kept
// ============================================

// ============================================
// STORY VIDEO - Slideshow mit Voiceover
// Alle 2-4 Sekunden neues Bild passend zum Text
// ============================================

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
}

export const generateStoryVideo = async (
    dreamDescription: string,
    dreamInterpretation: string,
    style: 'cartoon' | 'anime' | 'real' | 'fantasy' | 'surreal' | 'watercolor',
    language: Language,
    onProgress?: (status: string, percent: number) => void
): Promise<StoryVideoResult> => {
    console.log('[STORY] Starting story video generation');
    console.log('[STORY] Style:', style);
    console.log('[STORY] Language:', language);
    onProgress?.('Text analysieren...', 5);

    // 1. Estimate speech duration (average 2.5 words per second)
    const cleanText = dreamInterpretation.replace(/[#*_`]/g, '').trim();
    const fullText = cleanText;
    const wordCount = fullText.split(/\s+/).length;
    const estimatedDuration = wordCount / 2.5;
    const totalDuration = Math.max(5, estimatedDuration); // Minimum 5 seconds

    console.log(`[STORY] Estimated duration: ${totalDuration}s for ${wordCount} words`);

    // 2. Calculate optimal segments based on duration
    let targetSegments: number;
    let secondsPerSegment: number;

    if (totalDuration <= 5) {
        // 5 sec → 1 sec per image (5 images)
        targetSegments = 5;
        secondsPerSegment = 1;
    } else if (totalDuration <= 10) {
        // 10 sec → 2 sec per image (5 images)
        targetSegments = 5;
        secondsPerSegment = 2;
    } else if (totalDuration <= 15) {
        // 15 sec → 3 sec per image + fade (5 images)
        targetSegments = 5;
        secondsPerSegment = 3;
    } else if (totalDuration <= 20) {
        // 20 sec → 4 sec per image + fade (5 images)
        targetSegments = 5;
        secondsPerSegment = 4;
    } else {
        // 25+ sec → 4 sec per image (6+ images)
        secondsPerSegment = 4;
        targetSegments = Math.ceil(totalDuration / 4);
    }

    console.log(`[STORY] Calculated ${targetSegments} segments at ${secondsPerSegment}s each`);

    // 3. Split text into segments
    const allWords = fullText.split(/\s+/);
    const textSegments: string[] = [];
    const wordsPerChunk = Math.ceil(allWords.length / targetSegments);

    for (let i = 0; i < allWords.length; i += wordsPerChunk) {
        const chunk = allWords.slice(i, i + wordsPerChunk).join(' ');
        if (chunk.trim()) textSegments.push(chunk.trim());
    }

    console.log(`[STORY] Created ${textSegments.length} segments (${wordsPerChunk} words each)`);
    onProgress?.('Bild-Prompts erstellen...', 10);

    // 4. Generate image prompts for each segment
    const styleConfig = STYLE_PROMPTS[style] || STYLE_PROMPTS.fantasy;
    let imagePrompts: string[] = [];

    try {
        const response = await fetch('/api/groq/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{
                    role: 'user',
                    content: `Create ${targetSegments} UNIQUE image prompts for a dream story slideshow.

DREAM CONTEXT: ${dreamDescription}

INTERPRETATION TEXT (to be segmented):
${dreamInterpretation}

SEGMENTS TO VISUALIZE (${targetSegments} parts, ${secondsPerSegment}s each):
${textSegments.map((s, i) => `${i + 1}. "${s}"`).join('\n')}

REQUIREMENTS:
- Each prompt should DIRECTLY visualize the specific segment text
- Max 30 words per prompt, focus on KEY visual elements
- Make each scene DISTINCT to show story progression
- NO text, letters, or words in images
- Include atmosphere, mood, and dream-like quality
- Use vivid, specific descriptions

OUTPUT FORMAT: JSON array only
["visual description 1", "visual description 2", ...]`
                }],
                max_tokens: 1000,
                temperature: 0.9
            })
        });

        if (response.ok) {
            const data = await response.json();
            const content = data.choices[0].message.content.trim();
            console.log('[STORY] Prompts response:', content.substring(0, 200));
            const match = content.match(/\[[\s\S]*\]/);
            if (match) {
                imagePrompts = JSON.parse(match[0]);
                console.log('[STORY] Parsed prompts:', imagePrompts.length);
            }
        }
    } catch (e) {
        console.log('[STORY] Prompt generation failed:', e);
    }

    // Fallback prompts if generation failed
    if (imagePrompts.length !== textSegments.length) {
        console.log('[STORY] Using fallback prompts');
        imagePrompts = textSegments.map((seg, i) =>
            `dream scene ${i + 1}, ${seg.substring(0, 40)}, ethereal atmosphere`
        );
    }

    // Add style prefix to all prompts
    imagePrompts = imagePrompts.map(p => `${styleConfig.prefix}, ${p}, masterpiece, best quality`);

    onProgress?.('Audio generieren...', 20);

    // 5. Generate audio (TTS)
    let audioBase64 = '';

    try {
        const voiceMap: Record<Language, string> = {
            [Language.DE]: 'aura-athena-de',
            [Language.EN]: 'aura-asteria-en',
            [Language.TR]: 'aura-asteria-en', // Fallback to English
            [Language.ES]: 'aura-stella-es',
            [Language.FR]: 'aura-stella-fr',
            [Language.AR]: 'aura-asteria-en', // Fallback
            [Language.PT]: 'aura-asteria-en', // Fallback
            [Language.RU]: 'aura-asteria-en'  // Fallback
        };

        console.log('[STORY] Generating audio with voice:', voiceMap[language]);

        // Via Proxy
        const response = await fetch(`/api/deepgram/v1/speak?model=${voiceMap[language]}`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: fullText })
        });

        if (response.ok) {
            const blob = await response.blob();
            console.log('[STORY] Audio blob size:', blob.size);
            audioBase64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(blob);
            });
            console.log('[STORY] Audio base64 length:', audioBase64.length);
        } else {
            console.error('[STORY] Deepgram failed:', response.status, await response.text());
        }
    } catch (e) {
        console.error('[STORY] Audio generation failed:', e);
    }

    if (!audioBase64) {
        throw new Error('Audio generation failed - check Deepgram API key');
    }

    // 6. Calculate timing based on dynamic segments
    let currentTime = 0;
    const segmentTimings: { start: number; end: number }[] = [];

    for (let i = 0; i < targetSegments; i++) {
        segmentTimings.push({
            start: currentTime,
            end: currentTime + secondsPerSegment
        });
        currentTime += secondsPerSegment;
    }

    console.log('[STORY] Total duration:', currentTime, 'seconds');

    // 7. Generate images for each segment
    const segments: StorySegment[] = [];

    for (let i = 0; i < textSegments.length; i++) {
        const percent = 25 + (i / textSegments.length) * 70;
        onProgress?.(`Bild ${i + 1}/${textSegments.length} generieren...`, percent);

        let imageUrl: string | undefined;

        try {
            console.log(`[STORY] Generating image ${i + 1}...`);
            const response = await fetch('/api/runware/v1', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RUNWARE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{
                    taskType: 'imageInference',
                    taskUUID: crypto.randomUUID(),
                    model: 'runware:100@1',
                    positivePrompt: imagePrompts[i],
                    negativePrompt: styleConfig.negative,
                    width: 1280,
                    height: 720,
                    numberResults: 1,
                    CFGScale: 7.5,
                    scheduler: 'DPM++ 2M Karras',
                    steps: 20
                }])
            });

            if (response.ok) {
                const data = await response.json();
                imageUrl = data.data?.[0]?.imageURL;
                if (imageUrl) {
                    console.log(`[STORY] ✅ Image ${i + 1} generated`);
                }
            } else {
                console.error(`[STORY] Image ${i + 1} failed:`, response.status);
            }
        } catch (e) {
            console.error(`[STORY] Image ${i + 1} error:`, e);
        }

        segments.push({
            text: textSegments[i],
            imagePrompt: imagePrompts[i],
            imageUrl,
            startTime: segmentTimings[i].start,
            endTime: segmentTimings[i].end
        });

        // Small delay between requests to avoid rate limiting
        if (i < textSegments.length - 1) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    const successCount = segments.filter(s => s.imageUrl).length;
    console.log(`[STORY] ✅ Complete! ${successCount}/${segments.length} images generated`);
    onProgress?.('Fertig!', 100);

    return { segments, audioBase64, totalDuration: currentTime };
};

// ============================================
// TEXT-TO-SPEECH Preview (Deepgram)
// ============================================

export const generateSpeechPreview = async (
    text: string,
    voice: string = 'aura-asteria-en',
    userProfile: UserProfile | null
): Promise<string | null> => {
    try {
        // Via Proxy
        const response = await fetch(`/api/deepgram/v1/speak?model=${voice}`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            console.error('[TTS] Deepgram error:', response.status);
            return null;
        }

        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error('[TTS] Failed:', e);
        return null;
    }
};
