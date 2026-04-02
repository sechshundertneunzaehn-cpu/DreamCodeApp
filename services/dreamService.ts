const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('dreamService: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set')
}

const FUNCTIONS_BASE = `${SUPABASE_URL}/functions/v1`

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Citation {
  source: string
  text: string
  similarity: number
}

export interface InterpretationResult {
  interpretation: string
  citations: Citation[]
  tradition: string
  similar_count: number
  model: string
  tokens_used: number
  cost_estimate: number
}

export interface SimilarDream {
  id: string
  text_preview: string
  source: string
  similarity_percent: number
  tags: string[]
  themes: string[]
}

export interface SimilarDreamsResult {
  matches: SimilarDream[]
  total_searched: number
  processing_time_ms: number
}

export interface TrendingTheme {
  theme: string
  count: number
}

export interface DreamSource {
  name: string
  count: number
}

export interface DreamStats {
  total_reports: number
  total_user_dreams: number
  today_matches: number
  trending_themes: TrendingTheme[]
  sources: DreamSource[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const err = await res.json()
      message = err?.error ?? message
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/**
 * Sends a dream to the interpret-dream Edge Function and returns the interpretation.
 */
export async function interpretDream(
  dreamText: string,
  tradition: string,
  language: string,
  userId?: string,
): Promise<InterpretationResult> {
  const res = await fetch(`${FUNCTIONS_BASE}/interpret-dream`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({
      dream_text: dreamText,
      tradition,
      language,
      ...(userId ? { user_id: userId } : {}),
    }),
  })
  return handleResponse<InterpretationResult>(res)
}

/**
 * Finds semantically similar dreams in the research database.
 */
export async function findSimilarDreams(
  dreamText: string,
  options?: {
    limit?: number
    language?: string | null
    includeUserDreams?: boolean
  },
): Promise<SimilarDreamsResult> {
  const res = await fetch(`${FUNCTIONS_BASE}/find-similar`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({
      dream_text: dreamText,
      limit: options?.limit ?? 10,
      language: options?.language ?? null,
      include_user_dreams: options?.includeUserDreams ?? false,
    }),
  })
  return handleResponse<SimilarDreamsResult>(res)
}

/**
 * Fetches platform statistics (cached 5 min server-side).
 */
export async function getDreamStats(): Promise<DreamStats> {
  const res = await fetch(`${FUNCTIONS_BASE}/get-stats`, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
  })
  return handleResponse<DreamStats>(res)
}
