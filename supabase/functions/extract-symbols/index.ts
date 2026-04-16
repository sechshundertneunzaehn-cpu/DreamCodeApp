import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { getSupabaseClient } from '../_shared/supabase-client.ts'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
}

// Element-Mapping
const ELEMENT_MAP: Record<string, string> = {
  wasser: 'wasser', meer: 'wasser', regen: 'wasser', fluss: 'wasser', see: 'wasser',
  schwimmen: 'wasser', eis: 'wasser', schnee: 'wasser', ozean: 'wasser',
  feuer: 'feuer', flamme: 'feuer', sonne: 'feuer', blitz: 'feuer', vulkan: 'feuer',
  erde: 'erde', berg: 'erde', wald: 'erde', baum: 'erde', garten: 'erde', stein: 'erde',
  luft: 'luft', fliegen: 'luft', wind: 'luft', himmel: 'luft', vogel: 'luft', wolke: 'luft',
}

function guessElement(name: string): string | null {
  const lower = name.toLowerCase()
  for (const [key, elem] of Object.entries(ELEMENT_MAP)) {
    if (lower.includes(key)) return elem
  }
  return null
}

async function extractWithGemini(dreamText: string): Promise<{
  symbols: Array<{ name: string; category: string }>;
  emotions: Array<{ emotion: string; intensity: number }>;
}> {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY')

  const url = `${GEMINI_API_BASE}/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`

  const prompt = `Analysiere diesen Traum und extrahiere:
1. symbols: Array von Schlüsselsymbolen (max 10), jeweils {name, category}
   Kategorien: Natur, Tiere, Orte, Objekte, Personen, Aktivitaeten, Koerper, Emotionen, Spirituelles
2. emotions: Array von Emotionen mit Intensitaet (0-1), jeweils {emotion, intensity}

Traum: "${dreamText.substring(0, 2000)}"

Antworte NUR als JSON. Kein Markdown. Beispiel:
{"symbols":[{"name":"Wasser","category":"Natur"}],"emotions":[{"emotion":"Angst","intensity":0.7}]}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Gemini error ${res.status}: ${body}`)
  }

  const data = await res.json()
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'

  // Strip markdown code fences if present
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    const parsed = JSON.parse(text)
    return {
      symbols: Array.isArray(parsed.symbols) ? parsed.symbols : [],
      emotions: Array.isArray(parsed.emotions) ? parsed.emotions : [],
    }
  } catch {
    console.error('Failed to parse Gemini response:', text)
    return { symbols: [], emotions: [] }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  try {
    const body = await req.json()
    const { dream_id, user_id, text: dreamText } = body.record || body

    if (!dream_id || !dreamText) {
      return new Response(
        JSON.stringify({ error: 'Missing dream_id or text' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[extract-symbols] Processing dream ${dream_id}`)

    // 1. Extract symbols + emotions via Gemini
    const { symbols, emotions } = await extractWithGemini(dreamText)
    console.log(`[extract-symbols] Found ${symbols.length} symbols, ${emotions.length} emotions`)

    const sb = getSupabaseClient()

    // 2. Upsert symbols into dream_symbols
    for (const sym of symbols) {
      const name = sym.name.trim()
      if (!name) continue

      // Check if symbol already exists
      const { data: existing } = await sb
        .from('dream_symbols')
        .select('id, frequency')
        .eq('name', name)
        .maybeSingle()

      let symbolId: string

      if (existing) {
        // Increment frequency
        symbolId = existing.id
        await sb
          .from('dream_symbols')
          .update({ frequency: (existing.frequency || 1) + 1, updated_at: new Date().toISOString() })
          .eq('id', symbolId)
      } else {
        // Insert new symbol
        const { data: newSym, error: insertErr } = await sb
          .from('dream_symbols')
          .insert({
            name,
            name_normalized: name.toLowerCase().trim(),
            kategorie: sym.category || null,
            element: guessElement(name),
            frequency: 1,
          })
          .select('id')
          .single()

        if (insertErr) {
          // Might be a unique constraint violation (race condition)
          const { data: retry } = await sb
            .from('dream_symbols')
            .select('id')
            .eq('name', name)
            .maybeSingle()
          symbolId = retry?.id
          if (!symbolId) continue
        } else {
          symbolId = newSym.id
        }
      }

      // 3. Create dream_symbol_link
      await sb
        .from('dream_symbol_links')
        .upsert({
          dream_id,
          symbol_id: symbolId,
          user_id: user_id || null,
          confidence: 1.0,
        }, { onConflict: 'dream_id,symbol_id' })
    }

    // 4. Insert emotions
    for (const emo of emotions) {
      if (!emo.emotion) continue
      await sb
        .from('dream_emotions')
        .insert({
          dream_id,
          user_id: user_id || null,
          emotion: emo.emotion.trim(),
          intensity: Math.min(1, Math.max(0, emo.intensity || 0.5)),
        })
    }

    return new Response(
      JSON.stringify({
        ok: true,
        symbols_extracted: symbols.length,
        emotions_extracted: emotions.length,
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[extract-symbols] Error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})
