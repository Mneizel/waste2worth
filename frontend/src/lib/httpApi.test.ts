import { afterEach, vi } from 'vitest';

import { imageFile } from '../test/render';
import { ApiError, api, mediaUrl } from './httpApi';

const API = 'http://localhost:4000';

interface FakeInit {
  status?: number;
  ok?: boolean;
  body?: unknown;
  throwOnJson?: boolean;
}

function fakeFetch(responses: FakeInit[]) {
  const calls: Array<{ url: string; init: RequestInit | undefined }> = [];
  let i = 0;
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    const r = responses[Math.min(i, responses.length - 1)]!;
    i += 1;
    return {
      status: r.status ?? 200,
      ok: r.ok ?? (r.status ?? 200) < 400,
      json: async () => {
        if (r.throwOnJson) throw new SyntaxError('bad json');
        return r.body;
      },
    } as Response;
  });
  vi.stubGlobal('fetch', fn);
  return { fn, calls };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('mediaUrl', () => {
  it('passes through absolute URLs', () => {
    expect(mediaUrl('https://cdn.example/a.png')).toBe('https://cdn.example/a.png');
    expect(mediaUrl('http://cdn.example/a.png')).toBe('http://cdn.example/a.png');
  });
  it('prefixes a rooted relative path', () => {
    expect(mediaUrl('/static/x.svg')).toBe(`${API}/static/x.svg`);
  });
  it('adds a missing leading slash', () => {
    expect(mediaUrl('static/x.svg')).toBe(`${API}/static/x.svg`);
  });
});

describe('api client', () => {
  it('sends multipart for createScan and appends a non-blank hint', async () => {
    const { calls } = fakeFetch([{ status: 201, body: { data: { id: 's1' } } }]);
    await api.createScan(imageFile(), '250');
    const body = calls[0]!.init!.body as FormData;
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('image')).toBeInstanceOf(File);
    expect(body.get('hint')).toBe('250');
  });

  it('omits a blank hint', async () => {
    const { calls } = fakeFetch([{ status: 201, body: { data: { id: 's1' } } }]);
    await api.createScan(imageFile(), '   ');
    expect((calls[0]!.init!.body as FormData).get('hint')).toBeNull();
    await api.createScan(imageFile());
    expect((calls[1]!.init!.body as FormData).get('hint')).toBeNull();
  });

  it('sends JSON bodies for the json endpoints', async () => {
    const { calls } = fakeFetch([{ body: { data: { id: 's1' } } }]);
    await api.selectVariant('s1', 'var-1');
    expect(calls[0]!.init!.headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect(calls[0]!.init!.body).toBe(JSON.stringify({ variantId: 'var-1' }));
  });

  it('unwraps the data envelope for plain GETs', async () => {
    fakeFetch([{ body: { data: { id: 's9', status: 'CONFIRMED' } } }]);
    await expect(api.getScan('s9')).resolves.toMatchObject({ id: 's9' });
  });

  it('builds the bottle-sizes query string', async () => {
    const { calls } = fakeFetch([{ body: { data: [] } }, { body: { data: [] } }, { body: { data: [] } }]);
    await api.bottleSizes();
    await api.bottleSizes({ common: true });
    await api.bottleSizes({ common: false });
    expect(calls[0]!.url).toBe(`${API}/api/bottle-sizes`);
    expect(calls[1]!.url).toBe(`${API}/api/bottle-sizes?common=true`);
    expect(calls[2]!.url).toBe(`${API}/api/bottle-sizes?common=false`);
  });

  it('resolves undefined on a 204', async () => {
    fakeFetch([{ status: 204 }]);
    await expect(api.selectIdea('s1', 'i1')).resolves.toBeUndefined();
  });

  it('throws ApiError with the server code and message on failure', async () => {
    fakeFetch([{ status: 404, body: { error: { code: 'NOT_FOUND', message: 'gone' } } }]);
    await expect(api.getIdea('x')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'NOT_FOUND',
      message: 'gone',
    });
  });

  it('falls back to NETWORK_ERROR when the body is not JSON', async () => {
    fakeFetch([{ status: 500, throwOnJson: true }]);
    const err = await api.getScan('x').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ code: 'NETWORK_ERROR', message: 'Request failed (500)' });
  });

  it('treats an error-shaped 200 body as an error', async () => {
    fakeFetch([{ status: 200, body: { error: { code: 'WEIRD', message: 'huh' } } }]);
    await expect(api.scanIdeas('x')).rejects.toMatchObject({ code: 'WEIRD' });
  });

  it('defaults the API base URL when the env var is unset', async () => {
    vi.stubEnv('VITE_API_BASE_URL', undefined as unknown as string);
    vi.resetModules();
    const fresh = await import('./httpApi');
    expect(fresh.mediaUrl('/x.svg')).toBe(`${API}/x.svg`);
  });

  it('surfaces the raw flow methods', async () => {
    fakeFetch([
      { body: { data: { id: 's1', status: 'CONFIRMED' } } },
      { body: { data: { scan: { id: 's1' }, alternatives: [] } } },
      { body: { data: [{ id: 'i1' }] } },
    ]);
    await expect(api.confirmScan('s1')).resolves.toMatchObject({ status: 'CONFIRMED' });
    await expect(api.rejectScan('s1')).resolves.toMatchObject({ alternatives: [] });
    await expect(api.scanIdeas('s1')).resolves.toHaveLength(1);
  });
});
