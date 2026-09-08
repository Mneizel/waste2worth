import type {
  IdeaDetail,
  IdeaSummary,
  RejectResult,
  Scan,
  ScanStatus,
  Variant,
} from '../lib/types';
import { IDEAS, VARIANTS } from './fixtures';

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
  if (/^https?:\/\//i.test(path)) return path;
  return `http://localhost:4000${path.startsWith('/') ? '' : '/'}${path}`;
}

const SETTLED: ScanStatus[] = ['CONFIRMED', 'VARIANT_SELECTED', 'IDEA_SELECTED'];

interface StoredScan extends Scan {
  guessVolumeMl: number | null;
}

type Method =
  | 'createScan'
  | 'getScan'
  | 'confirmScan'
  | 'rejectScan'
  | 'selectVariant'
  | 'scanIdeas'
  | 'selectIdea'
  | 'getIdea'
  | 'bottleSizes';

const scans = new Map<string, StoredScan>();
const failures = new Map<Method, ApiError | 'network'>();
let counter = 0;

/** Force the next call(s) to `method` to reject. Pass an ApiError or 'network'. */
export function mockApiFailure(method: Method, error: ApiError | 'network'): void {
  failures.set(method, error);
}

export function resetApiMock(): void {
  scans.clear();
  failures.clear();
  counter = 0;
}

function maybeFail(method: Method): void {
  const f = failures.get(method);
  if (!f) return;
  if (f === 'network') throw new Error('network down');
  throw f;
}

function nearest(volumeMl: number): Variant {
  return [...VARIANTS].sort(
    (a, b) => Math.abs(a.volumeMl - volumeMl) - Math.abs(b.volumeMl - volumeMl),
  )[0]!;
}

function parseHint(hint?: string): { unknown: boolean; volumeMl: number | null } {
  if (!hint || !hint.trim()) return { unknown: false, volumeMl: 500 };
  const t = hint.trim().toLowerCase();
  if (t === 'none' || t === 'unknown') return { unknown: true, volumeMl: null };
  const m = t.match(/^(\d+(?:\.\d+)?)\s*(ml|l)?$/);
  if (m) {
    const value = Number(m[1]);
    return { unknown: false, volumeMl: m[2] === 'l' ? value * 1000 : value };
  }
  return { unknown: false, volumeMl: 500 };
}

function publicScan(s: StoredScan): Scan {
  const { guessVolumeMl: _drop, ...rest } = s;
  return structuredClone(rest);
}

function getOr404(id: string): StoredScan {
  const s = scans.get(id);
  if (!s) throw new ApiError(404, 'NOT_FOUND', `No scan found with id "${id}"`);
  return s;
}

function summarise(detail: IdeaDetail): IdeaSummary {
  const { tools: _a, steps: _b, safetyNotes: _c, model3dUrl: _d, model3dPreviewUrl: _e, variantKeys: _f, ...summary } = detail;
  return summary;
}

export const apiMock = {
  async createScan(_file: File, hint?: string): Promise<Scan> {
    maybeFail('createScan');
    const { unknown, volumeMl } = parseHint(hint);
    counter += 1;
    const id = `scan-${counter}`;
    const variant = unknown || volumeMl === null ? null : nearest(volumeMl);
    const stored: StoredScan = {
      id,
      status: 'PENDING_CONFIRMATION',
      image: { url: `/uploads/${id}.png`, mimeType: 'image/png', sizeBytes: 12, sha256: 'a'.repeat(64) },
      aiGuess: {
        categoryKey: unknown ? null : 'bottle',
        label: unknown ? 'Object could not be identified' : `Plastic bottle, about ${volumeMl} ml`,
        estimatedVolumeMl: volumeMl,
        confidence: unknown ? 0.2 : 0.82,
        variant,
      },
      confirmedVariant: null,
      selectedIdeaId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      guessVolumeMl: volumeMl,
    };
    scans.set(id, stored);
    return publicScan(stored);
  },

  async getScan(id: string): Promise<Scan> {
    maybeFail('getScan');
    return publicScan(getOr404(id));
  },

  async confirmScan(id: string): Promise<Scan> {
    maybeFail('confirmScan');
    const s = getOr404(id);
    if (s.status !== 'PENDING_CONFIRMATION') throw new ApiError(409, 'CONFLICT', 'bad status');
    if (!s.aiGuess.variant) throw new ApiError(409, 'CONFLICT', 'nothing to confirm');
    s.status = 'CONFIRMED';
    s.confirmedVariant = s.aiGuess.variant;
    return publicScan(s);
  },

  async rejectScan(id: string): Promise<RejectResult> {
    maybeFail('rejectScan');
    const s = getOr404(id);
    if (s.status !== 'PENDING_CONFIRMATION') throw new ApiError(409, 'CONFLICT', 'bad status');
    s.status = 'REJECTED';
    const commons = VARIANTS.filter((v) => v.isCommon && v.id !== s.aiGuess.variant?.id);
    const ordered =
      s.guessVolumeMl != null
        ? [...commons].sort(
            (a, b) =>
              Math.abs(a.volumeMl - s.guessVolumeMl!) - Math.abs(b.volumeMl - s.guessVolumeMl!),
          )
        : [...commons].sort((a, b) => a.sortOrder - b.sortOrder);
    return { scan: publicScan(s), alternatives: ordered.slice(0, 3).map((v) => ({ ...v })) };
  },

  async selectVariant(id: string, variantId: string): Promise<Scan> {
    maybeFail('selectVariant');
    const s = getOr404(id);
    const variant = VARIANTS.find((v) => v.id === variantId);
    if (!variant) throw new ApiError(404, 'NOT_FOUND', `No variant with id "${variantId}"`);
    s.status = 'VARIANT_SELECTED';
    s.confirmedVariant = { ...variant };
    return publicScan(s);
  },

  async scanIdeas(id: string): Promise<IdeaSummary[]> {
    maybeFail('scanIdeas');
    const s = getOr404(id);
    if (!SETTLED.includes(s.status)) throw new ApiError(409, 'CONFLICT', 'not settled');
    const key = s.confirmedVariant?.key;
    return IDEAS.filter(
      (i) => i.published && key !== undefined && i.variantKeys.includes(key),
    ).map((i) => summarise(i.detail));
  },

  async selectIdea(id: string, ideaId: string): Promise<Scan> {
    maybeFail('selectIdea');
    const s = getOr404(id);
    if (!SETTLED.includes(s.status)) throw new ApiError(409, 'CONFLICT', 'not settled');
    const idea = IDEAS.find((i) => i.id === ideaId && i.published);
    if (!idea) throw new ApiError(404, 'NOT_FOUND', 'no idea');
    if (!idea.variantKeys.includes(s.confirmedVariant?.key ?? '')) {
      throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'does not apply');
    }
    s.status = 'IDEA_SELECTED';
    s.selectedIdeaId = idea.id;
    return publicScan(s);
  },

  async getIdea(idOrSlug: string): Promise<IdeaDetail> {
    maybeFail('getIdea');
    const idea = IDEAS.find((i) => i.published && (i.id === idOrSlug || i.slug === idOrSlug));
    if (!idea) throw new ApiError(404, 'NOT_FOUND', `No published idea matching "${idOrSlug}"`);
    return structuredClone(idea.detail);
  },

  async bottleSizes(params?: { common?: boolean }): Promise<Variant[]> {
    maybeFail('bottleSizes');
    const list =
      params?.common === undefined
        ? VARIANTS
        : VARIANTS.filter((v) => v.isCommon === params.common);
    return list.map((v) => ({ ...v }));
  },
};
