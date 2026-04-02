import { generateEmbedding } from '../_shared/gemini.ts'
import { getSupabaseClient } from '../_shared/supabase-client.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://dreamcodeapp.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  let body: {
    dream_text?: string
    limit?: number
    language?: string | null
    include_user_dreams?: boolean
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const {
    dream_text,
    limit = 10,
    language = null,
    include_user_dreams = false,
  } = body

  if (!dream_text || typeof dream_text !== 'string') {
    return json({ error: 'dream_text is required' }, 400)
  }
  if (dream_text.trim().length < 10) {
    return json({ error: 'dream_text must be at least 10 characters' }, 400)
  }
  if (dream_text.length > 5000) {
    return json({ error: 'dream_text must not exceed 5000 characters' }, 400)
  }

  const clampedLimit = Math.min(Math.max(1, limit ?? 10), 50)

  const startTime = Date.now()

  try {
    const embedding = await generateEmbedding(dream_text.trim())
    const supabase = getSupabaseClient()

    // Count total dream_reports for context
    const { count: totalReports } = await supabase
      .from('dream_reports')
      .select('*', { count: 'exact', head: true })

    // Match from dream_reports
    const rpcParams: Record<string, unknown> = {
      query_embedding: embedding,
      match_threshold: 0.2,
      match_count: clampedLimit,
    }
    if (language) rpcParams.filter_language = language

    const { data: reportMatches, error: rpcError } = await supabase.rpc(
      'match_dreams',
      rpcParams,
    )
    if (rpcError) throw new Error(`RPC match_dreams failed: ${rpcError.message}`)

    type ReportMatch = {
      id: string
      text: string
      source_name: string
      similarity: number
      tags: string[]
      themes: string[]
    }

    let allMatches: ReportMatch[] = (reportMatches ?? []) as ReportMatch[]

    // Optionally include public user dreams
    if (include_user_dreams) {
      const userRpcParams: Record<string, unknown> = {
        query_embedding: embedding,
        match_threshold: 0.2,
        match_count: clampedLimit,
      }
      if (language) userRpcParams.filter_language = language

      const { data: userMatches } = await supabase.rpc('match_user_dreams', userRpcParams)

      if (userMatches && Array.isArray(userMatches)) {
        const mapped: ReportMatch[] = (
          userMatches as Array<{
            id: string
            text: string
            anonymous_name: string
            similarity: number
            mood: string
            category: string
          }>
        ).map((u) => ({
          id: u.id,
          text: u.text,
          source_name: `Community Dream (${u.anonymous_name ?? 'Anonymous'})`,
          similarity: u.similarity,
          tags: u.mood ? [u.mood] : [],
          themes: u.category ? [u.category] : [],
        }))

        allMatches = [...allMatches, ...mapped]
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, clampedLimit)
      }
    }

    const processingTime = Date.now() - startTime

    const matches = allMatches.map((m) => ({
      id: m.id,
      text_preview: m.text.slice(0, 200) + (m.text.length > 200 ? '...' : ''),
      source: m.source_name,
      similarity_percent: Math.round(m.similarity * 1000) / 10,
      tags: m.tags ?? [],
      themes: m.themes ?? [],
    }))

    return json({
      matches,
      total_searched: totalReports ?? 0,
      processing_time_ms: processingTime,
    })
  } catch (err) {
    console.error('find-similar error:', err)
    return json({ error: (err as Error).message ?? 'Internal server error' }, 500)
  }
})

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
