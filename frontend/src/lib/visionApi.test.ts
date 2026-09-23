import { afterEach, describe, expect, it, vi } from 'vitest';

import { classifyImage, visionConfigured } from './visionApi';

function img(): File {
  return new File([new Uint8Array([1, 2, 3])], 'x.png', { type: 'image/png' });
}

function geminiResponse(answer: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: JSON.stringify(answer) }] } }],
    }),
  };
}

describe('visionApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('reports unconfigured without an API key', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    expect(visionConfigured()).toBe(false);
  });

  it('reports configured once a key is set', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    expect(visionConfigured()).toBe(true);
  });

  it('classifies a recognised bottle photo', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    const fetchSpy = vi.fn().mockResolvedValue(
      geminiResponse({ category: 'bottle', approxVolumeMl: 512.7, confidence: 0.83 }),
    );
    vi.stubGlobal('fetch', fetchSpy);

    const guess = await classifyImage(img());
    expect(guess).toEqual({ categoryKey: 'bottle', approxVolumeMl: 513, confidence: 0.83 });
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('generativelanguage.googleapis.com'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('maps an unrecognised category to null', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(geminiResponse({ category: 'other', approxVolumeMl: 0, confidence: 0.4 })),
    );
    const guess = await classifyImage(img());
    expect(guess.categoryKey).toBeNull();
    expect(guess.approxVolumeMl).toBeNull();
  });

  it('clamps an out-of-range confidence in both directions', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(geminiResponse({ category: 'can', approxVolumeMl: 330, confidence: 1.4 })),
    );
    expect((await classifyImage(img())).confidence).toBe(1);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(geminiResponse({ category: 'can', approxVolumeMl: 330, confidence: -0.2 })),
    );
    expect((await classifyImage(img())).confidence).toBe(0);
  });

  it('throws immediately on a non-retryable error', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    const fetchSpy = vi.fn().mockResolvedValue({ ok: false, status: 400 });
    vi.stubGlobal('fetch', fetchSpy);
    await expect(classifyImage(img())).rejects.toThrow(/400/);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('retries a transient "server busy" error and succeeds', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce(geminiResponse({ category: 'can', approxVolumeMl: 330, confidence: 0.9 }));
    vi.stubGlobal('fetch', fetchSpy);

    const guess = await classifyImage(img());
    expect(guess.categoryKey).toBe('can');
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  }, 10000);

  it('gives up after repeated transient errors', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    const fetchSpy = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    vi.stubGlobal('fetch', fetchSpy);

    await expect(classifyImage(img())).rejects.toThrow(/503/);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  }, 10000);

  it('falls back to image/jpeg when the file has no mime type, and defaults a missing confidence to 0', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    const fetchSpy = vi.fn().mockResolvedValue(
      geminiResponse({ category: 'bottle', approxVolumeMl: 500 }), // no confidence field
    );
    vi.stubGlobal('fetch', fetchSpy);

    const noType = new File([new Uint8Array([1])], 'x', { type: '' });
    const guess = await classifyImage(noType);
    expect(guess.confidence).toBe(0);
    const body = JSON.parse(fetchSpy.mock.calls[0]![1].body);
    expect(body.contents[0].parts[1].inline_data.mime_type).toBe('image/jpeg');
  });

  it('rejects when the file cannot be read', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    class FailingFileReader {
      onerror: (() => void) | null = null;
      error = new Error('denied');
      readAsDataURL() {
        this.onerror?.();
      }
    }
    vi.stubGlobal('FileReader', FailingFileReader);
    await expect(classifyImage(img())).rejects.toThrow('denied');
  });

  it('falls back to a generic error when the file reader gives no error detail', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    class SilentlyFailingFileReader {
      onerror: (() => void) | null = null;
      error = null;
      readAsDataURL() {
        this.onerror?.();
      }
    }
    vi.stubGlobal('FileReader', SilentlyFailingFileReader);
    await expect(classifyImage(img())).rejects.toThrow('file read failed');
  });

  it('throws when the model returns no answer', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ candidates: [] }) }),
    );
    await expect(classifyImage(img())).rejects.toThrow(/no answer/);
  });
});
