import { afterEach, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('api entry point', () => {
  it('uses the in-browser implementation by default', async () => {
    vi.resetModules();
    const [mod, local] = await Promise.all([
      import('./api'),
      import('./localApi'),
    ]);
    expect(mod.api).toBe(local.api);
    expect(mod.mediaUrl).toBe(local.mediaUrl);
    expect(mod.ApiError).toBe(local.ApiError);
  });

  it('uses the HTTP client when VITE_API_MODE is "remote"', async () => {
    vi.stubEnv('VITE_API_MODE', 'remote');
    vi.resetModules();
    const [mod, http] = await Promise.all([
      import('./api'),
      import('./httpApi'),
    ]);
    expect(mod.api).toBe(http.api);
    expect(mod.mediaUrl).toBe(http.mediaUrl);
    expect(mod.ApiError).toBe(http.ApiError);
  });
});
