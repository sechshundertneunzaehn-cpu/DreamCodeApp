import { getSupabaseClient } from '../_shared/supabase-client.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://dreamcodeapp.vercel.app',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// 5-minute in-memory cache
interface StatsCache {
  data: unknown
  expiresAt: number
}
let statsCache: StatsCache | null = null

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const now = Date.now()

  // Return cached response if fresh
  if (statsCache && statsCache.expiresAt > now) {
    return json(statsCache.data)
  }

  try {
    const supabase = getSupabaseClient()

    // Fetch base stats via RPC
    const { data: rpcStats, error: rpcError } = await supabase.rpc('get_dream_stats')
    if (rpcError) throw new Error(`get_dream_stats RPC failed: ${rpcError.message}`)

    // Fetch trending themes (top 10, last 7 days)
    const { data: trendingData, error: trendError } = await supabase.rpc('get_trending_themes', {
      days_back: 7,
      top_n: 10,
    })
    if (trendError) throw new Error(`get_trending_themes RPC failed: ${trendError.message}`)

    // Fetch per-source counts
    const { data: sourcesData, error: sourcesError } = await supabase
      .from('dream_reports')
      .select('source_name')

    if (sourcesError) throw new Error(`Source count query failed: ${sourcesError.message}`)

    // Aggregate source counts
    const sourceCounts: Record<string, number> = {}
    for (const row of sourcesData ?? []) {
      const key = (row as { source_name: string }).source_name
      sourceCounts[key] = (sourceCounts[key] ?? 0) + 1
    }

    // Group by top-level source (everything before first " - ")
    const topLevelCounts: Record<string, number> = {}
    for (const [name, count] of Object.entries(sourceCounts)) {
      const topLevel = name.split(' - ')[0].trim()
      topLevelCounts[topLevel] = (topLevelCounts[topLevel] ?? 0) + count
    }

    const sources = Object.entries(topLevelCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))

    // Count today's interpretations as a proxy for today_matches
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

    const { count: todayMatches } = await supabase
      .from('interpretations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())

    const stats = {
      total_reports: (rpcStats as { total_dream_reports?: number })?.total_dream_reports ?? 0,
      total_user_dreams: (rpcStats as { total_user_dreams?: number })?.total_user_dreams ?? 0,
      today_matches: todayMatches ?? 0,
      trending_themes: (trendingData ?? []) as Array<{ theme: string; count: number }>,
      sources,
    }

    // Cache for 5 minutes
    statsCache = { data: stats, expiresAt: now + 300_000 }

    return json(stats)
  } catch (err) {
    console.error('get-stats error:', err)
    return json({ error: (err as Error).message ?? 'Internal server error' }, 500)
  }
})

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
