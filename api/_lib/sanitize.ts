/**
 * Input sanitization for AI API proxies.
 * Strips HTML, detects prompt injection patterns, enforces length limit.
 */

const MAX_INPUT_LENGTH = 5000;

// Structural injection markers used to manipulate LLM context
const INJECTION_MARKERS = [
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /<\|system\|>/gi,
  /<\|user\|>/gi,
  /<\|assistant\|>/gi,
  /<\/s>/gi,
  /<<<\s*SYSTEM\s*>>>/gi,
  /<<<\s*END\s*>>>/gi,
  /```\s*system\b/gi,
];

// Natural language injection patterns
const INJECTION_PHRASES = [
  /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|context)/gi,
  /forget\s+(all\s+)?(previous|prior|above|earlier|your)\s+(instructions?|prompts?|rules?|context|training)/gi,
  /disregard\s+(all\s+)?(previous|prior|above|earlier|your)\s+(instructions?|prompts?|rules?|guidelines?)/gi,
  /override\s+(all\s+)?(previous|prior|your|system)\s+(instructions?|prompts?|rules?)/gi,
  /you\s+are\s+now\s+(a|an|no\s+longer)\b/gi,
  /pretend\s+(to\s+be|you\s+are)\b/gi,
  /act\s+as\s+(if\s+you|a|an|the)\b/gi,
  /new\s+instructions?\s*:/gi,
  /^system\s*:/gim,
  /jailbreak/gi,
  /do\s+anything\s+now/gi,
  /DAN\s+mode/gi,
  /developer\s+mode\s+(enabled|on|activate)/gi,
];

// Strip HTML/XML tags
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

// Neutralize injection markers by removing them
function neutralizeMarkers(input: string): string {
  let result = input;
  for (const pattern of INJECTION_MARKERS) {
    result = result.replace(pattern, '');
  }
  return result;
}

// Detect injection phrases — returns true if any found
function detectInjection(input: string): boolean {
  return INJECTION_PHRASES.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(input);
  });
}

export interface SanitizeResult {
  text: string;
  flagged: boolean;
  truncated: boolean;
}

/**
 * Sanitize user input before sending to AI APIs.
 * - Strips HTML tags
 * - Removes structural injection markers ([INST], <|im_start|>, etc.)
 * - Detects natural language injection attempts
 * - Truncates to MAX_INPUT_LENGTH
 */
export function sanitizeInput(raw: string): SanitizeResult {
  let text = stripHtml(raw);
  text = neutralizeMarkers(text);

  const flagged = detectInjection(text);

  const truncated = text.length > MAX_INPUT_LENGTH;
  if (truncated) {
    text = text.slice(0, MAX_INPUT_LENGTH);
  }

  // Collapse excessive whitespace
  text = text.replace(/\n{4,}/g, '\n\n\n').replace(/ {4,}/g, '   ').trim();

  return { text, flagged, truncated };
}

/**
 * Sanitize a messages array (OpenAI-style chat format).
 * Only sanitizes user-role messages; system messages are passed through.
 */
export function sanitizeMessages(
  messages: Array<{ role: string; content: string }>
): { messages: Array<{ role: string; content: string }>; flagged: boolean } {
  let anyFlagged = false;

  const sanitized = messages.map((msg) => {
    if (msg.role !== 'user') return msg;
    const result = sanitizeInput(msg.content || '');
    if (result.flagged) anyFlagged = true;
    return { ...msg, content: result.text };
  });

  return { messages: sanitized, flagged: anyFlagged };
}
