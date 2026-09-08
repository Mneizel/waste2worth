import type { Test } from 'supertest';

import { api } from '../helpers/api';
import {
  createCategory,
  createIdea,
  createVariant,
  pngBytes,
} from '../helpers/factory';

interface Fixture {
  v250: string;
  v500: string;
  v1000: string;
  v1500: string;
  v2000: string;
  ideaFor500: string;
  ideaFor1000: string;
}

async function seedFixture(): Promise<Fixture> {
  const cat = await createCategory({ key: 'bottle' });
  const v250 = await createVariant(cat.id, { key: 'v250', volumeMl: 250, sortOrder: 1 });
  const v500 = await createVariant(cat.id, { key: 'v500', volumeMl: 500, sortOrder: 2 });
  const v1000 = await createVariant(cat.id, { key: 'v1000', volumeMl: 1000, sortOrder: 3 });
  const v1500 = await createVariant(cat.id, { key: 'v1500', volumeMl: 1500, sortOrder: 4 });
  const v2000 = await createVariant(cat.id, {
    key: 'v2000',
    volumeMl: 2000,
    sortOrder: 5,
    isCommon: false,
  });
  const ideaFor500 = await createIdea({
    variantIds: [v500.id],
    slug: 'planter',
    title: 'Planter',
    sortOrder: 1,
  });
  const ideaFor1000 = await createIdea({
    variantIds: [v1000.id],
    slug: 'lamp',
    title: 'Lamp',
    sortOrder: 2,
  });
  await createIdea({ variantIds: [v500.id], slug: 'hidden', published: false });
  return {
    v250: v250.id,
    v500: v500.id,
    v1000: v1000.id,
    v1500: v1500.id,
    v2000: v2000.id,
    ideaFor500: ideaFor500.id,
    ideaFor1000: ideaFor1000.id,
  };
}

function upload(opts: { hint?: string; seed?: number } = {}): Test {
  const req = api.post('/api/scans').attach('image', pngBytes(opts.seed ?? 1), {
    filename: 'bottle.png',
    contentType: 'image/png',
  });
  return opts.hint === undefined ? req : req.field('hint', opts.hint);
}

async function createScan(hint: string): Promise<string> {
  const res = await upload({ hint });
  expect(res.status).toBe(201);
  return res.body.data.id as string;
}

let fx: Fixture;
beforeEach(async () => {
  fx = await seedFixture();
});

describe('POST /api/scans', () => {
  it('creates a scan and matches the guess to a variant', async () => {
    const res = await upload({ hint: '520' });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      status: 'PENDING_CONFIRMATION',
      aiGuess: {
        categoryKey: 'bottle',
        estimatedVolumeMl: 520,
        variant: expect.objectContaining({ key: 'v500' }),
      },
    });
    expect(res.body.data.image.url).toContain('http://cdn.test/uploads/');
    expect(res.body.data.image.sha256).toHaveLength(64);
  });

  it('creates a scan with no match when the object is unidentified', async () => {
    const res = await upload({ hint: 'none' });
    expect(res.status).toBe(201);
    expect(res.body.data.aiGuess.categoryKey).toBeNull();
    expect(res.body.data.aiGuess.variant).toBeNull();
  });

  it('works without a hint', async () => {
    const res = await upload();
    expect(res.status).toBe(201);
    expect(res.body.data.aiGuess.categoryKey).toBe('bottle');
  });

  it('rejects a request with no image', async () => {
    const res = await api.post('/api/scans');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('rejects a non-image upload', async () => {
    const res = await api.post('/api/scans').attach('image', Buffer.from('hello'), {
      filename: 'note.txt',
      contentType: 'text/plain',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('UPLOAD_ERROR');
  });

  it('rejects an oversized upload', async () => {
    const big = Buffer.alloc(1_200_000, 7);
    const res = await api
      .post('/api/scans')
      .attach('image', big, { filename: 'big.png', contentType: 'image/png' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('UPLOAD_ERROR');
  });
});

describe('GET /api/scans/:id', () => {
  it('returns a scan', async () => {
    const id = await createScan('500');
    const res = await api.get(`/api/scans/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it('404s for an unknown id', async () => {
    const res = await api.get('/api/scans/missing');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/scans/:id/confirm', () => {
  it('confirms the AI guess', async () => {
    const id = await createScan('500');
    const res = await api.post(`/api/scans/${id}/confirm`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CONFIRMED');
    expect(res.body.data.confirmedVariant.key).toBe('v500');
  });

  it('409s when there is nothing recognised to confirm', async () => {
    const id = await createScan('none');
    const res = await api.post(`/api/scans/${id}/confirm`);
    expect(res.status).toBe(409);
  });

  it('409s when the scan is not pending', async () => {
    const id = await createScan('500');
    await api.post(`/api/scans/${id}/confirm`);
    const res = await api.post(`/api/scans/${id}/confirm`);
    expect(res.status).toBe(409);
  });

  it('404s for an unknown scan', async () => {
    const res = await api.post('/api/scans/nope/confirm');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/scans/:id/reject', () => {
  it('rejects the guess and returns 3 alternatives ordered by nearness', async () => {
    const id = await createScan('520');
    const res = await api.post(`/api/scans/${id}/reject`);
    expect(res.status).toBe(200);
    expect(res.body.data.scan.status).toBe('REJECTED');
    const keys = res.body.data.alternatives.map((v: { key: string }) => v.key);
    expect(keys).toHaveLength(3);
    expect(keys).not.toContain('v500');
    expect(keys[0]).toBe('v250');
  });

  it('returns alternatives by sort order when nothing was recognised', async () => {
    const id = await createScan('none');
    const res = await api.post(`/api/scans/${id}/reject`);
    expect(res.status).toBe(200);
    const keys = res.body.data.alternatives.map((v: { key: string }) => v.key);
    expect(keys).toEqual(['v250', 'v500', 'v1000']);
  });

  it('409s when the scan is not pending', async () => {
    const id = await createScan('500');
    await api.post(`/api/scans/${id}/reject`);
    const res = await api.post(`/api/scans/${id}/reject`);
    expect(res.status).toBe(409);
  });

  it('404s for an unknown scan', async () => {
    const res = await api.post('/api/scans/nope/reject');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/scans/:id/select-variant', () => {
  it('sets the confirmed variant', async () => {
    const id = await createScan('500');
    await api.post(`/api/scans/${id}/reject`);
    const res = await api
      .post(`/api/scans/${id}/select-variant`)
      .send({ variantId: fx.v1000 });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('VARIANT_SELECTED');
    expect(res.body.data.confirmedVariant.key).toBe('v1000');
  });

  it('400s without a variantId', async () => {
    const id = await createScan('500');
    const res = await api.post(`/api/scans/${id}/select-variant`).send({});
    expect(res.status).toBe(400);
  });

  it('404s for an unknown scan', async () => {
    const res = await api
      .post('/api/scans/nope/select-variant')
      .send({ variantId: 'x' });
    expect(res.status).toBe(404);
  });

  it('404s for an unknown variant', async () => {
    const id = await createScan('500');
    const res = await api
      .post(`/api/scans/${id}/select-variant`)
      .send({ variantId: 'ghost' });
    expect(res.status).toBe(404);
  });

  it('409s once an idea has been selected', async () => {
    const id = await createScan('500');
    await api.post(`/api/scans/${id}/confirm`);
    await api.post(`/api/scans/${id}/select-idea`).send({ ideaId: fx.ideaFor500 });
    const res = await api
      .post(`/api/scans/${id}/select-variant`)
      .send({ variantId: fx.v1000 });
    expect(res.status).toBe(409);
  });
});

describe('GET /api/scans/:id/ideas', () => {
  it('lists published ideas for the confirmed variant', async () => {
    const id = await createScan('500');
    await api.post(`/api/scans/${id}/confirm`);
    const res = await api.get(`/api/scans/${id}/ideas`);
    expect(res.status).toBe(200);
    expect(res.body.data.map((i: { slug: string }) => i.slug)).toEqual(['planter']);
  });

  it('409s while the scan is still pending', async () => {
    const id = await createScan('500');
    const res = await api.get(`/api/scans/${id}/ideas`);
    expect(res.status).toBe(409);
  });

  it('404s for an unknown scan', async () => {
    const res = await api.get('/api/scans/nope/ideas');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/scans/:id/select-idea', () => {
  it('records the chosen idea', async () => {
    const id = await createScan('500');
    await api.post(`/api/scans/${id}/confirm`);
    const res = await api
      .post(`/api/scans/${id}/select-idea`)
      .send({ ideaId: fx.ideaFor500 });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IDEA_SELECTED');
    expect(res.body.data.selectedIdeaId).toBe(fx.ideaFor500);
  });

  it('400s without an ideaId', async () => {
    const id = await createScan('500');
    await api.post(`/api/scans/${id}/confirm`);
    const res = await api.post(`/api/scans/${id}/select-idea`).send({});
    expect(res.status).toBe(400);
  });

  it('404s for an unknown scan', async () => {
    const res = await api.post('/api/scans/nope/select-idea').send({ ideaId: 'x' });
    expect(res.status).toBe(404);
  });

  it('409s while the scan is still pending', async () => {
    const id = await createScan('500');
    const res = await api.post(`/api/scans/${id}/select-idea`).send({ ideaId: 'x' });
    expect(res.status).toBe(409);
  });

  it('404s for an unpublished or unknown idea', async () => {
    const id = await createScan('500');
    await api.post(`/api/scans/${id}/confirm`);
    const res = await api
      .post(`/api/scans/${id}/select-idea`)
      .send({ ideaId: 'ghost' });
    expect(res.status).toBe(404);
  });

  it('422s when the idea does not apply to the confirmed variant', async () => {
    const id = await createScan('500');
    await api.post(`/api/scans/${id}/confirm`);
    const res = await api
      .post(`/api/scans/${id}/select-idea`)
      .send({ ideaId: fx.ideaFor1000 });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('UNPROCESSABLE_ENTITY');
  });
});

describe('full flow', () => {
  it('scan -> reject -> select-variant -> ideas -> select-idea', async () => {
    const id = await createScan('900');
    const rejectRes = await api.post(`/api/scans/${id}/reject`);
    expect(rejectRes.body.data.alternatives.length).toBe(3);

    const selRes = await api
      .post(`/api/scans/${id}/select-variant`)
      .send({ variantId: fx.v1000 });
    expect(selRes.body.data.status).toBe('VARIANT_SELECTED');

    const ideasRes = await api.get(`/api/scans/${id}/ideas`);
    expect(ideasRes.body.data.map((i: { slug: string }) => i.slug)).toEqual(['lamp']);

    const chooseRes = await api
      .post(`/api/scans/${id}/select-idea`)
      .send({ ideaId: fx.ideaFor1000 });
    expect(chooseRes.body.data.status).toBe('IDEA_SELECTED');
    expect(chooseRes.body.data.selectedIdeaId).toBe(fx.ideaFor1000);
  });
});
