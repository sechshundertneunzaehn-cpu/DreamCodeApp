import { supabase } from './supabaseClient';
import { apiUrl } from './apiConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TranslationItem {
  text: string;
  sourceId: string;
  sourceTable: string;
  sourceField: string;
}

// ─── Language name mapping ────────────────────────────────────────────────────

const LANGUAGE_NAMES: Record<string, string> = {
  de: 'German',
  en: 'English',
  tr: 'Turkish',
  es: 'Spanish',
  fr: 'French',
  ar: 'Arabic',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese',
  hi: 'Hindi',
  ja: 'Japanese',
  ko: 'Korean',
  id: 'Indonesian',
  fa: 'Persian',
  it: 'Italian',
  pl: 'Polish',
  bn: 'Bengali',
  ur: 'Urdu',
  vi: 'Vietnamese',
  th: 'Thai',
  sw: 'Swahili',
  hu: 'Hungarian',
};

// ─── Semaphore (max 10 concurrent translations) ───────────────────────────────

class Semaphore {
  private permits: number;
  private queue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      next();
    } else {
      this.permits++;
    }
  }
}

const globalSemaphore = new Semaphore(10);

// ─── Translation queue ────────────────────────────────────────────────────────

interface QueueEntry {
  item: TranslationItem;
  targetLang: string;
  resolve: (text: string) => void;
  reject: (err: unknown) => void;
}

class TranslationQueue {
  private pending: QueueEntry[] = [];

  enqueue(item: TranslationItem, targetLang: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.pending.push({ item, targetLang, resolve, reject });
    });
  }

  getPending(): QueueEntry[] {
    return [...this.pending];
  }

  clear(): void {
    this.pending = [];
  }

  size(): number {
    return this.pending.length;
  }
}

export const translationQueue = new TranslationQueue();

// ─── Build translation prompt ─────────────────────────────────────────────────

function buildPrompt(text: string, targetLang: string): string {
  const langName = LANGUAGE_NAMES[targetLang] ?? targetLang;
  return (
    `Translate the following user-generated dream/comment text to ${langName}. ` +
    `Keep the emotional tone and imagery intact. ` +
    `Return ONLY the translated text, nothing else. ` +
    `Text: ${text}`
  );
}

// ─── Gemini (key rotation) ────────────────────────────────────────────────────

async function translateWithGemini(text: string, targetLang: string): Promise<string | null> {
  const prompt = buildPrompt(text, targetLang);
  try {
    const res = await fetch(apiUrl('/api/generate-text'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'gemini',
        model: 'gemini-2.0-flash-lite',
        prompt,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { text?: string };
    return data.text?.trim() || null;
  } catch {
    return null;
  }
}

// ─── DeepSeek fallback ────────────────────────────────────────────────────────

async function translateWithDeepSeek(text: string, targetLang: string): Promise<string | null> {
  const prompt = buildPrompt(text, targetLang);

  try {
    const res = await fetch(apiUrl('/api/llm'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'deepseek',
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json() as { text?: string };
    return data.text?.trim() || null;
  } catch {
    return null;
  }
}

// ─── GROQ fallback ────────────────────────────────────────────────────────────

async function translateWithGroq(text: string, targetLang: string): Promise<string | null> {
  const prompt = buildPrompt(text, targetLang);

  try {
    const res = await fetch(apiUrl('/api/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        language: targetLang,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json() as { reply?: string };
    return data.reply?.trim() || null;
  } catch {
    return null;
  }
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

async function getCached(
  sourceTable: string,
  sourceId: string,
  sourceField: string,
  targetLang: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('get_translation', {
      p_table: sourceTable,
      p_id: sourceId,
      p_field: sourceField,
      p_lang: targetLang,
    });

    if (error || !data) return null;
    return typeof data === 'string' && data.length > 0 ? data : null;
  } catch {
    return null;
  }
}

async function saveToCache(
  sourceTable: string,
  sourceId: string,
  sourceField: string,
  targetLang: string,
  translatedText: string
): Promise<void> {
  try {
    await supabase.from('translations_cache').upsert(
      {
        source_table: sourceTable,
        source_id: sourceId,
        source_field: sourceField,
        target_lang: targetLang,
        translated: translatedText,
        translated_at: new Date().toISOString(),
      },
      { onConflict: 'source_table,source_id,source_field,target_lang' }
    );
  } catch {
    // Cache write failure is non-fatal
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Translate a single text string.
 * Order: cache → Gemini (key rotation) → DeepSeek → GROQ → original text
 */
export async function translateText(
  text: string,
  targetLang: string,
  sourceId: string,
  sourceTable: string,
  sourceField: string
): Promise<string> {
  if (!text || !text.trim()) return text;

  await globalSemaphore.acquire();

  try {
    // 1. Check cache
    const cached = await getCached(sourceTable, sourceId, sourceField, targetLang);
    if (cached) return cached;

    // 2. Gemini with key rotation
    let result = await translateWithGemini(text, targetLang);

    // 3. DeepSeek fallback
    if (!result) {
      result = await translateWithDeepSeek(text, targetLang);
    }

    // 4. GROQ fallback
    if (!result) {
      result = await translateWithGroq(text, targetLang);
    }

    // 5. Google Translate (unofficial API, kein Key nötig) — greift wenn alle AI-Provider versagen
    if (!result) {
      try {
        const chunk = text.slice(0, 4800);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(chunk)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json() as any[][];
          const translated = data[0]?.map((item: any[]) => item[0]).filter(Boolean).join('') ?? '';
          if (translated) result = translated + (text.length > 4800 ? ' …' : '');
        }
      } catch {
        // ignore
      }
    }

    // 6. Originaltext als letzter Ausweg
    if (!result) return text;

    // Persist to cache (fire-and-forget)
    saveToCache(sourceTable, sourceId, sourceField, targetLang, result);

    return result;
  } catch {
    return text;
  } finally {
    globalSemaphore.release();
  }
}

/**
 * Translate multiple items concurrently (max 5 at a time).
 * Returns a Map of sourceId → translatedText.
 */
export async function translateBatch(
  items: TranslationItem[],
  targetLang: string
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const BATCH_SIZE = 5;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE);

    const settled = await Promise.allSettled(
      chunk.map((item) =>
        translateText(item.text, targetLang, item.sourceId, item.sourceTable, item.sourceField)
      )
    );

    settled.forEach((outcome, idx) => {
      const item = chunk[idx];
      if (outcome.status === 'fulfilled') {
        result.set(item.sourceId, outcome.value);
      } else {
        // Fallback to original on rejection
        result.set(item.sourceId, item.text);
      }
    });
  }

  return result;
}
