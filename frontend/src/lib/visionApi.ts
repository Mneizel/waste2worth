/**
 * Real image recognition — this actually looks at the photo's pixels via
 * Google's Gemini API (free tier: https://aistudio.google.com/app/apikey,
 * no credit card needed for normal use). This is the ONLY thing in the app
 * that classifies a photo; everything else (test-mode hints, the hash-based
 * fallback that used to live here) either asks the user directly or is
 * gone. See README.md "Real photo recognition" for setup + the security
 * note about restricting the key.
 */

export interface VisionGuess {
  /** one of our registered categories (see src/data/categories.ts), or null
   * when the photo isn't confidently one of them */
  categoryKey: string | null;
  approxVolumeMl: number | null;
  /** 0..1, as reported by the model */
  confidence: number;
}

// Keep in sync with the category keys in src/data/categories.ts that have
// real recognition support (i.e. 'available' ones).
const KNOWN_CATEGORIES = ['bottle', 'can'];
const MODEL = 'gemini-2.0-flash';

export function visionConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error('file read failed'));
    reader.readAsDataURL(file);
  });
}

interface GeminiAnswer {
  category: string;
  approxVolumeMl: number;
  confidence: number;
}

function buildPrompt(): string {
  return [
    'You are looking at a real photo of a single waste item someone wants to recycle.',
    `Classify it into exactly one of these categories: ${KNOWN_CATEGORIES.join(', ')}, other.`,
    '"bottle" = a plastic or glass bottle (has a neck/cap). "can" = a metal (aluminium or steel) can or tin, no neck.',
    'If it is neither, or the photo is unclear, use "other".',
    'Estimate its liquid volume in millilitres if it is a bottle or can (typical range 150-5000 ml); if "other", use 0.',
    'Give a confidence from 0 to 1 for your category choice.',
    'Answer with JSON only, matching the given schema.',
  ].join(' ');
}

/** Sends the photo to the vision model and returns a category + rough size
 * guess. Throws on any network/API error — the caller decides the fallback
 * (see localApi.ts, which reports "could not identify" rather than guessing). */
export async function classifyImage(file: File): Promise<VisionGuess> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  const base64 = await fileToBase64(file);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: buildPrompt() },
              { inline_data: { mime_type: file.type || 'image/jpeg', data: base64 } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              category: { type: 'STRING', enum: [...KNOWN_CATEGORIES, 'other'] },
              approxVolumeMl: { type: 'NUMBER' },
              confidence: { type: 'NUMBER' },
            },
            required: ['category', 'approxVolumeMl', 'confidence'],
          },
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Vision API request failed (${res.status})`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Vision API returned no answer');

  const parsed = JSON.parse(text) as GeminiAnswer;
  const categoryKey = KNOWN_CATEGORIES.includes(parsed.category) ? parsed.category : null;
  const approxVolumeMl = categoryKey && parsed.approxVolumeMl > 0 ? Math.round(parsed.approxVolumeMl) : null;

  return {
    categoryKey,
    approxVolumeMl,
    confidence: Math.max(0, Math.min(1, parsed.confidence ?? 0)),
  };
}
