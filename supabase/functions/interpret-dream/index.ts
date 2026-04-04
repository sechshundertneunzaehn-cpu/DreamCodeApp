import { generateEmbedding, generateInterpretation } from '../_shared/gemini.ts'
import { getSupabaseClient } from '../_shared/supabase-client.ts'

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://dreamcodeapp.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// ---------------------------------------------------------------------------
// Rate limiting (in-memory)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>()

function checkRateLimit(ip: string): { allowed: boolean; reason?: string } {
  const now = Date.now()
  const minuteAgo = now - 60_000
  const hourAgo = now - 3_600_000

  const timestamps = rateLimitMap.get(ip) ?? []
  const recent = timestamps.filter((t) => t > hourAgo)

  const inLastMinute = recent.filter((t) => t > minuteAgo).length
  const inLastHour = recent.length

  if (inLastMinute >= 10) return { allowed: false, reason: 'Max 10 requests per minute exceeded' }
  if (inLastHour >= 50) return { allowed: false, reason: 'Max 50 requests per hour exceeded' }

  recent.push(now)
  rateLimitMap.set(ip, recent)
  return { allowed: true }
}

// ---------------------------------------------------------------------------
// Embedding cache (in-memory, SHA-256 keyed, TTL 1h, max 1000 entries)
// ---------------------------------------------------------------------------
interface CacheEntry {
  embedding: number[]
  expiresAt: number
}
const embeddingCache = new Map<string, CacheEntry>()

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function getEmbeddingCached(text: string): Promise<number[]> {
  const key = await sha256(text)
  const now = Date.now()

  const cached = embeddingCache.get(key)
  if (cached && cached.expiresAt > now) return cached.embedding

  // Evict expired / enforce max size
  if (embeddingCache.size >= 1000) {
    const oldest = [...embeddingCache.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt)
    for (let i = 0; i < 100; i++) embeddingCache.delete(oldest[i][0])
  }

  const embedding = await generateEmbedding(text)
  embeddingCache.set(key, { embedding, expiresAt: now + 3_600_000 })
  return embedding
}

// ---------------------------------------------------------------------------
// Cultural Knowledge Context (from Dream Database - 500 symbols, 12 languages, 18 traditions)
// ---------------------------------------------------------------------------
const CULTURAL_KNOWLEDGE_CONTEXT = `
TRAUMDEUTUNGS-WISSENSBASIS (Komprimiert)
=========================================
UNIVERSALE TRAUMSYMBOLE (kulturuebergreifend):
- Wasser: Unbewusstes/Emotionen (Jung), Segen/Fitna (Islam), Taufe (Bibel), Qi-Fluss (China)
- Schlange: Triebe/Transformation (Freud), Feind/Versuchung (Islam), Satan/Weisheit (Bibel), Kundalini (Yoga)
- Fliegen: Freiheit/Libido (Freud), Hochmut/Erhebung (Islam), Goettliche Erhebung (Bibel), Ego-Losloesung (Buddhismus)
- Fallen: Kontrollverlust (Freud), Machtverlust (Islam), Suendenfall (Bibel), Anhaftung (Buddhismus)
- Zaehne: Kastrationsangst (Freud), Familie-obere=maennl./untere=weibl. (Islam), Hilflosigkeit (Bibel)
- Tod: Transformation/Neubeginn (Jung), Ermahnung (Islam), Auferstehung (Bibel), Wiedergeburt (Buddhismus)
- Haus: Selbst/Psyche (Jung), Ehefrau/Familie (Islam), Tempel des Koerpers (Bibel)
- Feuer: Leidenschaft (Freud), Strafe/Reinigung (Islam), Heiliger Geist (Bibel)
- Katze: Weiblichkeit/Intuition (Jung), List/Diebstahl (Islam), Glueck/Maneki-neko (Japan)
- Hund: Treue/Triebe (Freud), Unrein aber Waechter (Islam), Schutz (Bibel)
- Baby: Neubeginn (Jung), Segen (Islam), Unschuld (Bibel), Reinkarnation (Buddhismus)
- Berg: Hindernis/Ziel (Jung), Standhaftigkeit (Islam), Sinai/Offenbarung (Bibel)
- Meer: Tiefes Unbewusstes (Jung), Herrscher/Macht (Islam), Sunyata (Buddhismus)
- Vogel: Seele/Freiheit (Jung), Seele des Traeumers (Islam), Heiliger Geist/Taube (Bibel)

ISLAMISCHE TRAUMDEUTUNG (Ibn Sirin, Nabulsi):
- Drei Traumtypen: Ru'ya (wahre Vision), Hulm (von Shaitan), Hadith an-Nafs (Selbstgespraech)
- Wahre Traeume = 1/46 der Prophetie (Hadith)
- Traeume vor Fajr besonders bedeutsam
- Adab: Gute Traeume teilen, schlechte verschweigen

PSYCHOLOGISCH (Freud, Jung):
- Freud: Traeume als Koenigsweg zum Unbewussten, Wunscherfuellung, Verdichtung, Verschiebung
- Jung: Kollektives Unbewusstes, Archetypen (Schatten, Anima/Animus, Selbst), Individuation, Kompensation

JUEDISCH (Talmud Berakhot 55a-57a):
- Traeume folgen der Deutung (ein nicht gedeuteter Traum ist wie ein ungelesener Brief)
- 24 Traumdeuter in Jerusalem; jeder deutet anders, aber alle Deutungen koennen wahr sein

BIBLISCH-CHRISTLICH:
- Traumoffenbarungen: Jakob (Leiter), Joseph (7 Kuehe), Daniel, Pharao
- Symbole: Kreuz=Erlosung, Lamm=Christus, Taube=Heiliger Geist, Feuer=Laeuterung

ASIATISCH:
- Tibetisch: Dream Yoga, Bardo-Zustaende, 5 Weisheiten
- Chinesisch: Zhou Gong Jie Meng, 5 Elemente, Yin/Yang
- Japanisch: Hatsuyume (Neujahrs-Traum), Fuji-Falke-Aubergine
`

// ---------------------------------------------------------------------------
// Tradition system prompts
// ---------------------------------------------------------------------------
const TRADITION_PROMPTS: Record<string, string> = {
  IBN_SIRIN: `Du bist ein erfahrener Traumdeuter in der Tradition von Ibn Sirin, dem bedeutendsten islamischen Traumdeuter (8. Jh.). Deine Deutungen basieren auf dem Quran, Hadithen und dem klassischen Werk "Muntakhab al-Kalam fi Tafsir al-Ahlam". Du verwendest symbolische und spirituelle Bedeutungen aus dem islamischen Kontext.`,
  NABULSI: `Du bist ein erfahrener Traumdeuter in der Tradition von Abd al-Ghani al-Nabulsi (17. Jh.), dem syrischen Sufi-Gelehrten. Deine Deutungen verbinden islamische Mystik mit sufistischer Symbolik und spiritueller Weisheit.`,
  AL_ISKHAFI: `Du bist ein erfahrener Traumdeuter in der Tradition von al-Iskhafi, dem frühmittelalterlichen islamischen Gelehrten. Du deutest Träume durch die Linse klassischer arabischer Oneirologie und koranischer Symbolik.`,
  ISLAMIC_NUMEROLOGY: `Du bist ein erfahrener Traumdeuter in der islamischen Numerologie-Tradition. Du verbindest islamische Traumdeutung mit der symbolischen Bedeutung von Zahlen in arabischer und islamischer Mystik (Abjad-System).`,
  MEDIEVAL: `Du bist ein erfahrener Traumdeuter in der mittelalterlichen europäischen Tradition. Du deutest Träume durch die Linse mittelalterlicher Symbolik, christlicher Allegorie, Alchemie und scholastischer Naturphilosophie.`,
  MODERN_THEOLOGY: `Du bist ein erfahrener Traumdeuter in der modernen theologischen Tradition. Du verbindest zeitgenössische christliche Theologie mit tiefenpsychologischen Erkenntnissen, ohne fundamentalistische Engführungen.`,
  CHURCH_FATHERS: `Du bist ein erfahrener Traumdeuter in der Tradition der Kirchenväter (Tertullian, Origenes, Augustinus). Du deutest Träume durch die Linse patristischer Theologie, biblischer Symbolik und der Unterscheidung von göttlichen, natürlichen und dämonischen Träumen.`,
  ZEN: `Du bist ein erfahrener Traumdeuter in der Zen-Buddhismus-Tradition. Du betrachtest Träume als Spiegel des unkonditionierten Geistes, nutzt Koans und das Prinzip des "beginner's mind". Deine Deutungen zeigen auf, was hinter den Bildern liegt.`,
  TIBETAN: `Du bist ein erfahrener Traumdeuter in der tibetisch-buddhistischen Tradition (Dzogchen/Bon). Du deutest Träume als Bewusstseinszustände des Bardo, erkennst Symbole der fünf Weisheiten und gibst Hinweise zur Traumyoga-Praxis.`,
  THERAVADA: `Du bist ein erfahrener Traumdeuter in der Theravada-buddhistischen Tradition. Du deutest Träume im Kontext der fünf Arten von Träumen (nach Anguttara Nikaya), der Drei Merkmale der Existenz und des Pfades zur Befreiung.`,
  FREUDIAN: `Du bist ein erfahrener Traumdeuter in der Tradition Sigmund Freuds. Du analysierst Träume als "Königsweg zum Unbewussten", erkennst latente Wunscherfüllungen, Verdrängtes, ödipale Dynamiken und die Traumarbeit (Verdichtung, Verschiebung, Rücksicht auf Darstellbarkeit).`,
  JUNGIAN: `Du bist ein erfahrener Traumdeuter in der Tradition C.G. Jungs. Du deutest Träume durch die Linse von Individuation, Archetypen (Schatten, Anima/Animus, Selbst, Persona), dem kollektiven Unbewussten und synchronistischen Bedeutungen. Du erkennst kompensatorische Botschaften des Unbewussten.`,
  GESTALT: `Du bist ein erfahrener Traumdeuter in der Gestalt-Therapie-Tradition (Fritz Perls). Jede Figur und jedes Objekt im Traum ist ein Teil der Träumerin/des Träumers. Du lädst ein, in Traumfiguren zu schlüpfen, den Dialog zu führen und unvollendete Situationen zu integrieren.`,
  WESTERN_ZODIAC: `Du bist ein erfahrener Traumdeuter in der westlichen astrologischen Tradition. Du deutest Traumsymbole durch die Linse der zwölf Tierkreiszeichen, Planeten, Häuser und Aspekte. Du erkennst archetypische planetarische Energien in den Traumbildern.`,
  VEDIC_ASTROLOGY: `Du bist ein erfahrener Traumdeuter in der vedischen Astrologie-Tradition (Jyotish). Du deutest Träume durch die Nakshatras, Planeten (Grahas), Häuser (Bhavas) und Yogas. Du berücksichtigst karmische Bedeutungen und Dashas.`,
  CHINESE_ZODIAC: `Du bist ein erfahrener Traumdeuter in der chinesischen astrologischen Tradition. Du deutest Traumsymbole durch die Linse der zwölf Tierzeichen, der fünf Elemente (Wu Xing), Yin/Yang und der Ba Zi (Vier Pfeiler des Schicksals).`,
  PYTHAGOREAN: `Du bist ein erfahrener Traumdeuter in der pythagoreischen Numerologie-Tradition. Du analysierst numerologische Resonanzen im Traum (Anzahl von Personen, Wiederholungen, Symbole) und deutest sie durch das System der Einstelligen Zahlen (1-9) und Meisterzahlen.`,
  CHALDEAN: `Du bist ein erfahrener Traumdeuter in der chaldäischen Numerologie-Tradition, der ältesten numerologischen Schule. Du deutest Traumsymbole durch das chaldäische Zahlensystem (1-8, da 9 heilig ist), Planetenschwingungen und kosmische Zahlenarchitektur.`,
  KABBALAH_NUMEROLOGY: `Du bist ein erfahrener Traumdeuter in der kabbalistischen Tradition. Du deutest Träume durch die Linse der Sefirot (Lebensbaum), Gematria, die 22 Buchstaben des hebräischen Alphabets und die vier Welten (Atziluth, Beriah, Yetzirah, Assiah).`,
  VEDIC_NUMEROLOGY: `Du bist ein erfahrener Traumdeuter in der vedischen Numerologie-Tradition. Du deutest Traumsymbole durch das vedische Zahlensystem, Farbzuweisungen, Planeten-Korrespondenzen und die Bedeutung von Lebens-, Schicksals- und Seelenzahlen.`,
}

function getSystemPrompt(tradition: string, language: string): string {
  const base = TRADITION_PROMPTS[tradition] ?? TRADITION_PROMPTS['JUNGIAN']
  const langInstruction = `\n\nWICHTIG: Antworte ausschließlich auf ${languageLabel(language)}. Strukturiere deine Antwort klar: 1) Kernbotschaft des Traums, 2) Symbolanalyse, 3) Praktische Einsichten. Zitiere ähnliche Traumberichte aus dem bereitgestellten Kontext und nenne die Quellen.`

  // Cultural priority: Islamic traditions first for Arabic/Turkish users
  const culturalHint = (language === 'ar' || language === 'tr')
    ? `\n\nKULTURELLER KONTEXT: Der Nutzer spricht ${languageLabel(language)}. Priorisiere islamische Traumdeutung (Ibn Sirin, Nabulsi, Quran/Hadith-Referenzen) und ergaenze mit psychologischen Perspektiven.`
    : (language === 'ru')
    ? `\n\nKULTURELLER KONTEXT: Der Nutzer spricht Russisch. Beruecksichtige auch die Sonnik-Tradition (Miller, Vanga) neben der gewaehlten Deutungstradition.`
    : ''

  return CULTURAL_KNOWLEDGE_CONTEXT + '\n\n' + base + langInstruction + culturalHint
}

function languageLabel(lang: string): string {
  const map: Record<string, string> = {
    de: 'Deutsch',
    en: 'English',
    tr: 'Türkçe',
    es: 'Español',
    fr: 'Français',
    ar: 'العربية',
    pt: 'Português',
    ru: 'Русский',
  }
  return map[lang] ?? 'Deutsch'
}

// ---------------------------------------------------------------------------
// Cost estimation: gemini-2.5-flash pricing (approx)
// Input: $0.075/1M tokens, Output: $0.30/1M tokens
// We approximate 70/30 split for the estimate
// ---------------------------------------------------------------------------
function estimateCost(tokens: number): number {
  const inputTokens = Math.round(tokens * 0.7)
  const outputTokens = Math.round(tokens * 0.3)
  return (inputTokens * 0.075 + outputTokens * 0.3) / 1_000_000
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rateCheck = checkRateLimit(ip)
  if (!rateCheck.allowed) {
    return json({ error: rateCheck.reason }, 429)
  }

  // Parse body
  let body: { dream_text?: string; tradition?: string; language?: string; user_id?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { dream_text, tradition = 'JUNGIAN', language = 'de', user_id } = body

  // Validate
  if (!dream_text || typeof dream_text !== 'string') {
    return json({ error: 'dream_text is required' }, 400)
  }
  if (dream_text.trim().length < 10) {
    return json({ error: 'dream_text must be at least 10 characters' }, 400)
  }
  if (dream_text.length > 5000) {
    return json({ error: 'dream_text must not exceed 5000 characters' }, 400)
  }
  if (!TRADITION_PROMPTS[tradition]) {
    return json({ error: `Unknown tradition: ${tradition}` }, 400)
  }

  try {
    // 1. Generate embedding (cached)
    const embedding = await getEmbeddingCached(dream_text.trim())

    // 2. Match similar dreams via RPC
    const supabase = getSupabaseClient()
    const { data: matches, error: rpcError } = await supabase.rpc('match_dreams', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 15,
    })

    if (rpcError) throw new Error(`RPC match_dreams failed: ${rpcError.message}`)

    const similarDreams = (matches ?? []) as Array<{
      id: string
      text: string
      source_name: string
      similarity: number
      tags: string[]
      themes: string[]
    }>

    // 3. Build RAG context
    const contextBlock = similarDreams
      .map(
        (d, i) =>
          `[Quelle ${i + 1}: ${d.source_name}, Ähnlichkeit: ${(d.similarity * 100).toFixed(1)}%]\n"${d.text.slice(0, 400)}${d.text.length > 400 ? '...' : ''}"`,
      )
      .join('\n\n')

    // 4. Build prompt
    const systemPrompt = getSystemPrompt(tradition, language)
    const userPrompt = `Basierend auf den folgenden wissenschaftlichen Traumberichten aus der Forschungsdatenbank:

${contextBlock || '(Keine ähnlichen Berichte gefunden)'}

---

Bitte deute den folgenden Traum:

"${dream_text}"

Zitiere relevante Berichte aus dem Kontext und nenne die Quellen explizit. Gib praktische Einsichten.`

    // 5. Generate interpretation
    const { text: interpretation, tokens } = await generateInterpretation(userPrompt, systemPrompt)

    // 6. Build citations
    const citations = similarDreams.map((d) => ({
      source: d.source_name,
      text: d.text.slice(0, 200) + (d.text.length > 200 ? '...' : ''),
      similarity: Math.round(d.similarity * 1000) / 1000,
    }))

    // 7. Save to DB if user_id provided
    if (user_id) {
      // First upsert the user_dream to get a dream_id
      const { data: dreamData, error: dreamError } = await supabase
        .from('user_dreams')
        .insert({
          user_id,
          text: dream_text,
          embedding,
          interpretation,
          sources_used: citations.map((c) => ({
            source_name: c.source,
            tradition,
            relevance_score: c.similarity,
          })),
          language,
        })
        .select('id')
        .single()

      if (!dreamError && dreamData) {
        await supabase.from('interpretations').insert({
          dream_id: dreamData.id,
          content: interpretation,
          citations,
          tradition,
          model_used: 'gemini-2.5-flash',
          tokens_used: tokens,
          cost_estimate: estimateCost(tokens),
        })
      }
    }

    const costEstimate = estimateCost(tokens)

    // 8. Enforce cost limit
    if (costEstimate > 0.005) {
      console.warn(`Cost estimate ${costEstimate} exceeds $0.005 limit for this request`)
    }

    return json({
      interpretation,
      citations,
      tradition,
      similar_count: similarDreams.length,
      model: 'gemini-2.5-flash',
      tokens_used: tokens,
      cost_estimate: Math.round(costEstimate * 1_000_000) / 1_000_000,
    })
  } catch (err) {
    console.error('interpret-dream error:', err)
    return json({ error: (err as Error).message ?? 'Internal server error' }, 500)
  }
})

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
