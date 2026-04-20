// ═══ DreamQuality Agent — Frontend Client ═══

export interface Scene {
  sceneIndex: number;
  text: string;
  imagePrompt: string;
  keywords: string[];
  duration: number;
  mood: string;
}

export interface EnhancePromptResult {
  enhancedPrompt: string;
  scenes: Scene[];
  estimatedImages: number;
  totalDuration: number;
}

export async function enhanceDreamPrompt(
  dreamText: string,
  language: string,
  category: string,
  tier: string,
): Promise<EnhancePromptResult> {
  const res = await fetch('/api/video/enhance-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dreamText, language, category, tier }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unbekannter Fehler' }));
    throw new Error(err.error || err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}
