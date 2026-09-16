import type {
  ApiErrorBody,
  IdeaDetail,
  IdeaSummary,
  RejectResult,
  Scan,
  Variant,
} from './types';

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'
).replace(/\/$/, '');

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

/** Prefix a relative media path from the API with the API origin. */
export function mediaUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, headers, ...rest } = init ?? {};
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const payload = (await res.json().catch(() => null)) as
    | { data: T }
    | ApiErrorBody
    | null;

  if (!res.ok || payload === null || 'error' in payload) {
    const err = (payload as ApiErrorBody | null)?.error;
    throw new ApiError(
      res.status,
      err?.code ?? 'NETWORK_ERROR',
      err?.message ?? `Request failed (${res.status})`,
    );
  }

  return (payload as { data: T }).data;
}

export const api = {
  createScan(file: File, hint?: string): Promise<Scan> {
    const form = new FormData();
    form.append('image', file);
    if (hint && hint.trim()) form.append('hint', hint.trim());
    return request<Scan>('/api/scans', { method: 'POST', body: form });
  },

  getScan(id: string): Promise<Scan> {
    return request<Scan>(`/api/scans/${id}`);
  },

  confirmScan(id: string): Promise<Scan> {
    return request<Scan>(`/api/scans/${id}/confirm`, { method: 'POST' });
  },

  rejectScan(id: string): Promise<RejectResult> {
    return request<RejectResult>(`/api/scans/${id}/reject`, { method: 'POST' });
  },

  selectVariant(id: string, variantId: string): Promise<Scan> {
    return request<Scan>(`/api/scans/${id}/select-variant`, {
      method: 'POST',
      json: { variantId },
    });
  },

  scanIdeas(id: string): Promise<IdeaSummary[]> {
    return request<IdeaSummary[]>(`/api/scans/${id}/ideas`);
  },

  selectIdea(id: string, ideaId: string): Promise<Scan> {
    return request<Scan>(`/api/scans/${id}/select-idea`, {
      method: 'POST',
      json: { ideaId },
    });
  },

  getIdea(idOrSlug: string): Promise<IdeaDetail> {
    return request<IdeaDetail>(`/api/ideas/${idOrSlug}`);
  },

  bottleSizes(params?: { common?: boolean; category?: string }): Promise<Variant[]> {
    const q = new URLSearchParams();
    if (params?.common !== undefined) q.set('common', params.common ? 'true' : 'false');
    if (params?.category !== undefined) q.set('category', params.category);
    const qs = q.toString();
    return request<Variant[]>(`/api/bottle-sizes${qs ? `?${qs}` : ''}`);
  },
};
