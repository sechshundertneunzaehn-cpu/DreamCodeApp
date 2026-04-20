/**
 * KI-Bildbearbeitungs-Service.
 * Inpainting und Text-basierte Bildeditierung via Replicate flux-fill.
 */

export interface EditResult {
  imageUrl: string;
  editPrompt: string;
  timestamp: number;
}

export interface EditOptions {
  sourceImageUrl: string;
  prompt: string;
  maskBase64?: string;
}

import { apiFetch } from './apiConfig';

/**
 * Bearbeitet ein Bild per Text-Prompt (und optionaler Maske).
 */
export async function editImage(options: EditOptions): Promise<EditResult> {
  const { sourceImageUrl, prompt, maskBase64 } = options;

  if (!sourceImageUrl || !prompt) {
    throw new Error('Bild-URL und Bearbeitungswunsch erforderlich');
  }

  const body: Record<string, string> = {
    imageUrl: sourceImageUrl,
    prompt,
  };

  if (maskBase64) {
    body.maskBase64 = maskBase64;
  }

  const res = await apiFetch('/api/replicate/inpaint', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Bildbearbeitung fehlgeschlagen (${res.status})`);
  }

  const data = await res.json();
  const imageUrl = Array.isArray(data.output) ? data.output[0] : data.output;

  return {
    imageUrl,
    editPrompt: prompt,
    timestamp: Date.now(),
  };
}
