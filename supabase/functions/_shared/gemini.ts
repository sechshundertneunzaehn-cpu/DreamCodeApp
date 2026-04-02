const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

function getApiKey(): string {
  const key = Deno.env.get('GEMINI_API_KEY')
  if (!key) throw new Error('Missing GEMINI_API_KEY')
  return key
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err as Error
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)))
      }
    }
  }
  throw lastError
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = getApiKey()
  const url = `${GEMINI_API_BASE}/models/gemini-embedding-001:embedContent?key=${apiKey}`

  return withRetry(async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
        taskType: 'SEMANTIC_SIMILARITY',
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Gemini Embedding API error ${res.status}: ${body}`)
    }

    const data = await res.json()
    const values = data?.embedding?.values
    if (!Array.isArray(values) || values.length !== 768) {
      throw new Error('Unexpected embedding response shape')
    }
    return values as number[]
  })
}

export async function generateInterpretation(
  prompt: string,
  systemPrompt: string,
): Promise<{ text: string; tokens: number }> {
  const apiKey = getApiKey()
  const url = `${GEMINI_API_BASE}/models/gemini-2.5-flash:generateContent?key=${apiKey}`

  return withRetry(async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
          topP: 0.9,
        },
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Gemini Generation API error ${res.status}: ${body}`)
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const tokensIn = data?.usageMetadata?.promptTokenCount ?? 0
    const tokensOut = data?.usageMetadata?.candidatesTokenCount ?? 0

    return { text, tokens: tokensIn + tokensOut }
  })
}
