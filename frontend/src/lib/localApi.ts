/**
 * Fully in-browser implementation of the Waste 2 Worth API. No backend of our
 * own — the bundled catalogue in `src/data/catalogue.ts` drives the ideas
 * and sizes, and real photo recognition (when configured — see
 * README.md "Real photo recognition") calls Google's Gemini API directly
 * from the browser. This is what the static prototype ships with; swap
 * `VITE_API_MODE=remote` to use `httpApi.ts`.
 */
import { IDEAS, VARIANTS } from '../data/catalogue';
import { MEDIA } from '../data/media';
import type {
  IdeaDetail,
  IdeaSummary,
  RejectResult,
  Scan,
  ScanStatus,
  Variant,
} from './types';
import { classifyImage, visionConfigured } from './visionApi';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function mediaUrl(path: string): string {
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  const key = path.replace(/^\//, '');
  return MEDIA[key] ?? `${import.meta.env.BASE_URL}${key}`;
}

const SETTLED: ScanStatus[] = ['CONFIRMED', 'VARIANT_SELECTED', 'IDEA_SELECTED'];
const STORE_PREFIX = 'w2w:scan:';

const memory = new Map<string, Scan>();
let counter = 0;
let simDelayMs = 260;

/** Tests set this to 0 to skip the cosmetic "thinking" delay. */
export function __setSimDelay(ms: number): void {
  simDelayMs = ms;
}

const wait = () => new Promise<void>((r) => setTimeout(r, simDelayMs));

function persist(scan: Scan): void {
  memory.set(scan.id, scan);
  try {
    sessionStorage.setItem(STORE_PREFIX + scan.id, JSON.stringify(scan));
  } catch {
    /* private mode / quota — memory copy still works for this session */
  }
}

function load(id: string): Scan {
  const hit = memory.get(id);
  if (hit) return hit;
  try {
    const raw = sessionStorage.getItem(STORE_PREFIX + id);
    if (raw) {
      const scan = JSON.parse(raw) as Scan;
      memory.set(id, scan);
      return scan;
    }
  } catch {
    /* ignore */
  }
  throw new ApiError(404, 'NOT_FOUND', `No scan found with id "${id}"`);
}

function fnvHash(input: string): Uint8Array {
  let h = 0x811c9dc5;
  for (const ch of input) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193);
  }
  const out = new Uint8Array(8);
  for (let i = 0; i < 8; i += 1) out[i] = (h >>> (i * 4)) & 0xff;
  return out;
}

async function digestBytes(file: File): Promise<Uint8Array> {
  const buf = await new Response(file).arrayBuffer();
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    try {
      return new Uint8Array(await subtle.digest('SHA-256', buf));
    } catch {
      /* not a secure context / unavailable — fall back */
    }
  }
  return fnvHash(`${file.name}:${file.size}`);
}

type ParsedHint =
  | { kind: 'none' }
  | { kind: 'unidentified' }
  | { kind: 'volume'; category: string; volumeMl: number };

// A manual hint always wins over the real vision call — lets you test a
// specific size/category without a photo, or without VITE_GEMINI_API_KEY
// configured at all. "<category>:<amount>" targets a non-bottle category
// explicitly, e.g. "can:330".
function parseHint(hint?: string): ParsedHint {
  if (!hint || !hint.trim()) return { kind: 'none' };
  const t = hint.trim().toLowerCase();
  if (t === 'none' || t === 'unknown') return { kind: 'unidentified' };
  const m = t.match(/^(?:(bottle|can):)?(\d+(?:\.\d+)?)\s*(ml|l)?$/);
  if (m) {
    const category = m[1] ?? 'bottle';
    const value = Number(m[2]);
    const volumeMl = m[3] === 'l' ? value * 1000 : value;
    if (volumeMl > 0) return { kind: 'volume', category, volumeMl };
  }
  return { kind: 'none' };
}

function nearestVariantInCategory(category: string, volumeMl: number): Variant {
  const pool = VARIANTS.filter((v) => v.categoryKey === category);
  return [...pool].sort(
    (a, b) => Math.abs(a.volumeMl - volumeMl) - Math.abs(b.volumeMl - volumeMl),
  )[0]!;
}

const CATEGORY_ITEM_LABEL_AR: Record<string, string> = {
  bottle: 'قنينة',
  can: 'علبة معدنية',
};

function summarise(detail: IdeaDetail): IdeaSummary {
  return {
    id: detail.id,
    slug: detail.slug,
    title: detail.title,
    summary: detail.summary,
    difficulty: detail.difficulty,
    estimatedMinutes: detail.estimatedMinutes,
    minAge: detail.minAge,
    thumbnailUrl: detail.thumbnailUrl,
    finalImageUrl: detail.finalImageUrl,
  };
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const api = {
  async createScan(file: File, hint?: string): Promise<Scan> {
    await wait();
    const parsed = parseHint(hint);
    const digest = await digestBytes(file);

    let categoryKey: string | null;
    let estimatedVolumeMl: number | null;
    let confidence: number;

    if (parsed.kind === 'unidentified') {
      categoryKey = null;
      estimatedVolumeMl = null;
      confidence = 0.2;
    } else if (parsed.kind === 'volume') {
      categoryKey = parsed.category;
      estimatedVolumeMl = parsed.volumeMl;
      confidence = 0.9;
    } else if (visionConfigured()) {
      // real recognition: this genuinely looks at the photo
      try {
        const guess = await classifyImage(file);
        categoryKey = guess.categoryKey;
        estimatedVolumeMl = guess.approxVolumeMl;
        confidence = guess.confidence;
      } catch {
        categoryKey = null;
        estimatedVolumeMl = null;
        confidence = 0;
      }
    } else {
      // no hint, and no vision key configured -- be honest instead of
      // guessing. See README.md "Real photo recognition" to enable it.
      categoryKey = null;
      estimatedVolumeMl = null;
      confidence = 0;
    }

    const variant =
      categoryKey && estimatedVolumeMl != null
        ? nearestVariantInCategory(categoryKey, estimatedVolumeMl)
        : null;
    counter += 1;
    const id = `scan-${Date.now().toString(36)}-${counter}`;
    const scan: Scan = {
      id,
      status: 'PENDING_CONFIRMATION',
      image: {
        url: URL.createObjectURL(file),
        mimeType: file.type || 'image/jpeg',
        sizeBytes: file.size,
        sha256: [...digest].map((b) => b.toString(16).padStart(2, '0')).join(''),
      },
      aiGuess: {
        categoryKey,
        label: variant
          ? `${CATEGORY_ITEM_LABEL_AR[categoryKey!]}، حوالي ${estimatedVolumeMl} مل`
          : 'ما قدرنا نتعرّف على الجسم',
        estimatedVolumeMl,
        confidence,
        variant: variant ? clone(variant) : null,
      },
      confirmedVariant: null,
      selectedIdeaId: null,
      createdAt: new Date().toISOString(),
    };
    persist(scan);
    return clone(scan);
  },

  async getScan(id: string): Promise<Scan> {
    await wait();
    return clone(load(id));
  },

  async confirmScan(id: string): Promise<Scan> {
    await wait();
    const scan = load(id);
    if (scan.status !== 'PENDING_CONFIRMATION') {
      throw new ApiError(409, 'CONFLICT', `Cannot confirm while scan is ${scan.status}`);
    }
    if (!scan.aiGuess.variant) {
      throw new ApiError(409, 'CONFLICT', 'There is no recognised item to confirm');
    }
    const next: Scan = {
      ...scan,
      status: 'CONFIRMED',
      confirmedVariant: clone(scan.aiGuess.variant),
    };
    persist(next);
    return clone(next);
  },

  async rejectScan(id: string): Promise<RejectResult> {
    await wait();
    const scan = load(id);
    if (scan.status !== 'PENDING_CONFIRMATION') {
      throw new ApiError(409, 'CONFLICT', `Cannot reject while scan is ${scan.status}`);
    }
    const next: Scan = { ...scan, status: 'REJECTED' };
    persist(next);

    const guessId = scan.aiGuess.variant?.id;
    const near = scan.aiGuess.estimatedVolumeMl;
    const guessCategory = scan.aiGuess.categoryKey;
    // "no" here means "wrong size", not "wrong kind of item" -- stay within
    // the recognised category when we have one; offer everything otherwise.
    const pool = guessCategory
      ? VARIANTS.filter((v) => v.categoryKey === guessCategory)
      : VARIANTS;
    const commons = pool.filter((v) => v.isCommon && v.id !== guessId);
    const ordered =
      near != null
        ? [...commons].sort(
            (a, b) => Math.abs(a.volumeMl - near) - Math.abs(b.volumeMl - near),
          )
        : [...commons].sort((a, b) => a.sortOrder - b.sortOrder);

    return { scan: clone(next), alternatives: ordered.slice(0, 3).map(clone) };
  },

  async selectVariant(id: string, variantId: string): Promise<Scan> {
    await wait();
    const scan = load(id);
    const variant = VARIANTS.find((v) => v.id === variantId);
    if (!variant) {
      throw new ApiError(404, 'NOT_FOUND', `No variant with id "${variantId}"`);
    }
    const next: Scan = {
      ...scan,
      status: 'VARIANT_SELECTED',
      confirmedVariant: clone(variant),
    };
    persist(next);
    return clone(next);
  },

  async scanIdeas(id: string): Promise<IdeaSummary[]> {
    await wait();
    const scan = load(id);
    if (!SETTLED.includes(scan.status)) {
      throw new ApiError(409, 'CONFLICT', `Ideas are not available while scan is ${scan.status}`);
    }
    // A settled scan always carries a confirmed variant.
    const key = scan.confirmedVariant!.key;
    return IDEAS.filter((idea) => idea.variantKeys.includes(key)).map(summarise);
  },

  async selectIdea(id: string, ideaId: string): Promise<Scan> {
    await wait();
    const scan = load(id);
    if (!SETTLED.includes(scan.status)) {
      throw new ApiError(409, 'CONFLICT', `Cannot select an idea while scan is ${scan.status}`);
    }
    const idea = IDEAS.find((i) => i.id === ideaId || i.slug === ideaId);
    if (!idea) {
      throw new ApiError(404, 'NOT_FOUND', `No idea with id "${ideaId}"`);
    }
    if (!idea.variantKeys.includes(scan.confirmedVariant!.key)) {
      throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'That idea does not apply to this item');
    }
    const next: Scan = { ...scan, status: 'IDEA_SELECTED', selectedIdeaId: idea.id };
    persist(next);
    return clone(next);
  },

  async getIdea(idOrSlug: string): Promise<IdeaDetail> {
    await wait();
    const idea = IDEAS.find((i) => i.id === idOrSlug || i.slug === idOrSlug);
    if (!idea) {
      throw new ApiError(404, 'NOT_FOUND', `No idea matching "${idOrSlug}"`);
    }
    return clone(idea);
  },

  async bottleSizes(params?: { common?: boolean; category?: string }): Promise<Variant[]> {
    await wait();
    const category = params?.category ?? 'bottle';
    let list = VARIANTS.filter((v) => v.categoryKey === category);
    if (params?.common !== undefined) list = list.filter((v) => v.isCommon === params.common);
    return list.map(clone);
  },
};
