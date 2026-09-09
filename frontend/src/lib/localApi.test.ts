import { vi } from 'vitest';

import { ApiError, api, mediaUrl } from './localApi';

function img(name = 'bottle.png', type = 'image/png'): File {
  return new File([new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])], name, { type });
}

async function settledScan(hint = '500') {
  const scan = await api.createScan(img(), hint);
  return api.confirmScan(scan.id);
}

describe('localApi.mediaUrl', () => {
  it('passes through absolute / data / blob URLs', () => {
    expect(mediaUrl('https://x/a.png')).toBe('https://x/a.png');
    expect(mediaUrl('data:image/svg+xml,<svg/>')).toBe('data:image/svg+xml,<svg/>');
    expect(mediaUrl('blob:abc')).toBe('blob:abc');
  });
  it('inlines known catalogue artwork as data URIs', () => {
    expect(mediaUrl('media/ideas/self-watering-planter-final.svg')).toMatch(
      /^data:image\/svg\+xml,/,
    );
    expect(mediaUrl('/media/ideas/coin-bank-3d.svg')).toMatch(
      /^data:image\/svg\+xml,/,
    );
  });

  it('falls back to the base URL for unknown media paths', () => {
    const base = import.meta.env.BASE_URL;
    expect(mediaUrl('media/nope.svg')).toBe(`${base}media/nope.svg`);
    expect(mediaUrl('/media/nope.svg')).toBe(`${base}media/nope.svg`);
  });
});

describe('localApi.createScan', () => {
  it('recognises a bottle and picks a size deterministically', async () => {
    const a = await api.createScan(img());
    const b = await api.createScan(img());
    expect(a.aiGuess.categoryKey).toBe('bottle');
    expect(a.aiGuess.variant).not.toBeNull();
    expect(a.aiGuess.estimatedVolumeMl).toBe(b.aiGuess.estimatedVolumeMl);
    expect(a.aiGuess.confidence).toBeGreaterThanOrEqual(0.7);
    expect(a.aiGuess.confidence).toBeLessThanOrEqual(0.95);
    expect(a.image.sha256).toMatch(/^[0-9a-f]+$/);
    expect(a.status).toBe('PENDING_CONFIRMATION');
  });

  it('honours a volume hint', async () => {
    const scan = await api.createScan(img(), '1.5l');
    expect(scan.aiGuess.estimatedVolumeMl).toBe(1500);
    expect(scan.aiGuess.confidence).toBe(0.9);
    expect(scan.aiGuess.variant?.volumeMl).toBe(1500);
  });

  it('handles an unidentified hint', async () => {
    const scan = await api.createScan(img(), 'none');
    expect(scan.aiGuess.categoryKey).toBeNull();
    expect(scan.aiGuess.estimatedVolumeMl).toBeNull();
    expect(scan.aiGuess.variant).toBeNull();
    expect(scan.aiGuess.confidence).toBe(0.2);
  });

  it('ignores junk / zero / blank hints', async () => {
    for (const h of ['abc', '0', '   ', '']) {
      const scan = await api.createScan(img(), h);
      expect([250, 330, 500, 600, 750, 1000, 1500]).toContain(
        scan.aiGuess.estimatedVolumeMl,
      );
    }
  });

  it('copes with a file that has no mime type', async () => {
    const scan = await api.createScan(img('x', ''));
    expect(scan.image.mimeType).toBe('image/jpeg');
  });
});

describe('localApi digest fallback', () => {
  it('uses SubtleCrypto when available', async () => {
    const spy = vi.spyOn(crypto.subtle, 'digest');
    await api.createScan(img());
    expect(spy).toHaveBeenCalled();
  });

  it('falls back when SubtleCrypto rejects', async () => {
    vi.spyOn(crypto.subtle, 'digest').mockRejectedValueOnce(new Error('no'));
    const scan = await api.createScan(img());
    expect(scan.aiGuess.estimatedVolumeMl).not.toBeNull();
  });

  it('falls back when crypto is unavailable', async () => {
    vi.stubGlobal('crypto', undefined);
    const scan = await api.createScan(img());
    expect(scan.aiGuess.estimatedVolumeMl).not.toBeNull();
    vi.unstubAllGlobals();
  });
});

describe('localApi persistence', () => {
  it('reads a scan back from sessionStorage on a fresh load (memory miss)', async () => {
    const created = await api.createScan(img(), '500');
    const raw = sessionStorage.getItem(`w2w:scan:${created.id}`)!;
    expect(raw).toBeTruthy();
    // 'external' was never created through the in-memory map
    sessionStorage.setItem('w2w:scan:external', raw.replace(created.id, 'external'));
    const back = await api.getScan('external');
    expect(back.id).toBe('external');
    // and a genuinely unknown id still 404s
    await expect(api.getScan('does-not-exist')).rejects.toBeInstanceOf(ApiError);
  });

  it('survives sessionStorage being unavailable', async () => {
    const setSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('denied');
      });
    const scan = await api.createScan(img(), '500');
    expect(scan.id).toBeTruthy();
    setSpy.mockRestore();

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    await expect(api.getScan('anything')).rejects.toBeInstanceOf(ApiError);
  });
});

describe('localApi flow', () => {
  it('confirm -> ideas -> select-idea -> getScan', async () => {
    const confirmed = await settledScan('500');
    expect(confirmed.status).toBe('CONFIRMED');
    expect(confirmed.confirmedVariant?.volumeMl).toBe(500);

    const ideas = await api.scanIdeas(confirmed.id);
    expect(ideas.length).toBeGreaterThan(0);
    expect(ideas[0]).not.toHaveProperty('steps');

    const chosen = await api.selectIdea(confirmed.id, ideas[0]!.id);
    expect(chosen.status).toBe('IDEA_SELECTED');
    expect(chosen.selectedIdeaId).toBe(ideas[0]!.id);

    const reread = await api.getScan(confirmed.id);
    expect(reread.selectedIdeaId).toBe(ideas[0]!.id);
  });

  it('reject returns three nearest common alternatives', async () => {
    const scan = await api.createScan(img(), '520');
    const { alternatives, scan: rejected } = await api.rejectScan(scan.id);
    expect(rejected.status).toBe('REJECTED');
    expect(alternatives).toHaveLength(3);
    expect(alternatives.every((v) => v.isCommon)).toBe(true);
    expect(alternatives.map((v) => v.id)).not.toContain(scan.aiGuess.variant?.id);

    const picked = await api.selectVariant(scan.id, alternatives[0]!.id);
    expect(picked.status).toBe('VARIANT_SELECTED');
    expect(picked.confirmedVariant?.id).toBe(alternatives[0]!.id);
  });

  it('reject falls back to sort order when nothing was recognised', async () => {
    const scan = await api.createScan(img(), 'none');
    const { alternatives } = await api.rejectScan(scan.id);
    expect(alternatives).toHaveLength(3);
    const orders = alternatives.map((v) => v.sortOrder);
    expect([...orders]).toEqual([...orders].sort((a, b) => a - b));
  });

  it('getIdea works by id and by slug', async () => {
    const byId = await api.getIdea('idea-self-watering-planter');
    const bySlug = await api.getIdea('self-watering-planter');
    expect(byId.slug).toBe('self-watering-planter');
    expect(bySlug.id).toBe('idea-self-watering-planter');
    expect(byId.tools.length).toBeGreaterThan(0);
    expect(byId.steps.length).toBeGreaterThan(0);
  });

  it('bottleSizes filters by the common flag', async () => {
    expect(await api.bottleSizes()).toHaveLength(24);
    const common = await api.bottleSizes({ common: true });
    const rare = await api.bottleSizes({ common: false });
    expect(common.every((v) => v.isCommon)).toBe(true);
    expect(rare.every((v) => !v.isCommon)).toBe(true);
    expect(common.length + rare.length).toBe(24);
  });
});

describe('localApi errors', () => {
  it('getScan 404s for an unknown id', async () => {
    await expect(api.getScan('nope')).rejects.toMatchObject({ status: 404 });
  });

  it('confirm 409s from the wrong state and when nothing is recognised', async () => {
    const scan = await api.createScan(img(), '500');
    await api.confirmScan(scan.id);
    await expect(api.confirmScan(scan.id)).rejects.toMatchObject({ status: 409 });

    const unknown = await api.createScan(img(), 'none');
    await expect(api.confirmScan(unknown.id)).rejects.toMatchObject({ status: 409 });
  });

  it('reject 409s from the wrong state', async () => {
    const scan = await api.createScan(img(), '500');
    await api.confirmScan(scan.id);
    await expect(api.rejectScan(scan.id)).rejects.toMatchObject({ status: 409 });
  });

  it('selectVariant 404s for an unknown variant', async () => {
    const scan = await api.createScan(img(), '500');
    await expect(api.selectVariant(scan.id, 'ghost')).rejects.toMatchObject({
      status: 404,
    });
  });

  it('scanIdeas 409s before the spec is settled', async () => {
    const scan = await api.createScan(img(), '500');
    await expect(api.scanIdeas(scan.id)).rejects.toMatchObject({ status: 409 });
  });

  it('selectIdea 409/404/422 paths', async () => {
    const pending = await api.createScan(img(), '500');
    await expect(api.selectIdea(pending.id, 'x')).rejects.toMatchObject({ status: 409 });

    const confirmed = await settledScan('500');
    await expect(api.selectIdea(confirmed.id, 'ghost')).rejects.toMatchObject({
      status: 404,
    });
    // bird-feeder exists but is only for 1 L+ bottles, not a 500 ml one
    await expect(
      api.selectIdea(confirmed.id, 'bird-feeder'),
    ).rejects.toMatchObject({ status: 422 });
  });

  it('getIdea 404s for an unknown slug', async () => {
    await expect(api.getIdea('nope')).rejects.toMatchObject({ status: 404 });
  });
});
