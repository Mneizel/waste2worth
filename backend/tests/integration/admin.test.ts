import { api, ADMIN_HEADERS } from '../helpers/api';
import { createCategory, createVariant } from '../helpers/factory';

describe('admin auth', () => {
  it('rejects requests without the admin key', async () => {
    const res = await api.post('/api/admin/categories').send({ key: 'x', name: 'X' });
    expect(res.status).toBe(401);
  });

  it('rejects requests with a wrong admin key', async () => {
    const res = await api
      .post('/api/admin/categories')
      .set('x-admin-key', 'nope')
      .send({ key: 'x', name: 'X' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/admin/categories', () => {
  it('creates a category', async () => {
    const res = await api
      .post('/api/admin/categories')
      .set(ADMIN_HEADERS)
      .send({ key: 'bottle', name: 'Bottle' });
    expect(res.status).toBe(201);
    expect(res.body.data.key).toBe('bottle');
  });

  it('400s on invalid input', async () => {
    const res = await api
      .post('/api/admin/categories')
      .set(ADMIN_HEADERS)
      .send({ key: '' });
    expect(res.status).toBe(400);
  });

  it('409s on a duplicate key', async () => {
    await createCategory({ key: 'bottle' });
    const res = await api
      .post('/api/admin/categories')
      .set(ADMIN_HEADERS)
      .send({ key: 'bottle', name: 'Bottle' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });
});

describe('admin variants', () => {
  const validVariant = {
    categoryKey: 'bottle',
    key: 'pet-500',
    label: 'Bottle 500',
    materialType: 'PET',
    volumeMl: 500,
    heightMm: 210,
    diameterMm: 66,
  };

  it('creates a variant under an existing category', async () => {
    await createCategory({ key: 'bottle' });
    const res = await api
      .post('/api/admin/variants')
      .set(ADMIN_HEADERS)
      .send(validVariant);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ key: 'pet-500', categoryKey: 'bottle' });
  });

  it('404s when the category does not exist', async () => {
    const res = await api
      .post('/api/admin/variants')
      .set(ADMIN_HEADERS)
      .send(validVariant);
    expect(res.status).toBe(404);
  });

  it('409s on a duplicate variant key', async () => {
    const cat = await createCategory({ key: 'bottle' });
    await createVariant(cat.id, { key: 'pet-500' });
    const res = await api
      .post('/api/admin/variants')
      .set(ADMIN_HEADERS)
      .send(validVariant);
    expect(res.status).toBe(409);
  });

  it('updates a variant', async () => {
    const cat = await createCategory({ key: 'bottle' });
    const variant = await createVariant(cat.id, { key: 'pet-500', volumeMl: 500 });
    const res = await api
      .patch(`/api/admin/variants/${variant.id}`)
      .set(ADMIN_HEADERS)
      .send({ volumeMl: 550, notes: 'updated' });
    expect(res.status).toBe(200);
    expect(res.body.data.volumeMl).toBe(550);
  });

  it('400s on an empty update', async () => {
    const cat = await createCategory({ key: 'bottle' });
    const variant = await createVariant(cat.id);
    const res = await api
      .patch(`/api/admin/variants/${variant.id}`)
      .set(ADMIN_HEADERS)
      .send({});
    expect(res.status).toBe(400);
  });

  it('404s updating a missing variant', async () => {
    const res = await api
      .patch('/api/admin/variants/ghost')
      .set(ADMIN_HEADERS)
      .send({ volumeMl: 1 });
    expect(res.status).toBe(404);
  });

  it('deletes a variant', async () => {
    const cat = await createCategory({ key: 'bottle' });
    const variant = await createVariant(cat.id);
    const res = await api
      .delete(`/api/admin/variants/${variant.id}`)
      .set(ADMIN_HEADERS);
    expect(res.status).toBe(204);
  });

  it('404s deleting a missing variant', async () => {
    const res = await api.delete('/api/admin/variants/ghost').set(ADMIN_HEADERS);
    expect(res.status).toBe(404);
  });
});

describe('admin ideas', () => {
  async function seedVariants() {
    const cat = await createCategory({ key: 'bottle' });
    await createVariant(cat.id, { key: 'v500', volumeMl: 500 });
    await createVariant(cat.id, { key: 'v1000', volumeMl: 1000 });
  }

  const ideaBody = {
    slug: 'planter',
    title: 'Planter',
    summary: 'A planter.',
    finalImageUrl: 'images/x-final.svg',
    thumbnailUrl: 'images/x-thumb.svg',
    model3dUrl: 'models/x.glb',
    model3dPreviewUrl: 'images/x-3d.svg',
    variantKeys: ['v500'],
  };

  it('creates an idea with nested tools and steps', async () => {
    await seedVariants();
    const res = await api
      .post('/api/admin/ideas')
      .set(ADMIN_HEADERS)
      .send({
        ...ideaBody,
        variantKeys: ['v500', 'v1000'],
        tools: [{ kind: 'tool', name: 'Scissors', imageUrl: 'images/t.svg' }],
        steps: [
          {
            stepNumber: 1,
            title: 'Clean',
            instruction: 'Wash it.',
            imageUrl: 'images/s1.svg',
          },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.variantKeys.sort()).toEqual(['v1000', 'v500']);
    expect(res.body.data.tools).toHaveLength(1);
    expect(res.body.data.steps).toHaveLength(1);
  });

  it('creates an idea without tools or steps', async () => {
    await seedVariants();
    const res = await api
      .post('/api/admin/ideas')
      .set(ADMIN_HEADERS)
      .send(ideaBody);
    expect(res.status).toBe(201);
    expect(res.body.data.tools).toEqual([]);
    expect(res.body.data.steps).toEqual([]);
  });

  it('404s when a variant key is unknown', async () => {
    await seedVariants();
    const res = await api
      .post('/api/admin/ideas')
      .set(ADMIN_HEADERS)
      .send({ ...ideaBody, variantKeys: ['v500', 'ghost'] });
    expect(res.status).toBe(404);
    expect(res.body.error.message).toContain('ghost');
  });

  it('400s on invalid idea input', async () => {
    await seedVariants();
    const res = await api
      .post('/api/admin/ideas')
      .set(ADMIN_HEADERS)
      .send({ ...ideaBody, variantKeys: [] });
    expect(res.status).toBe(400);
  });

  it('409s on a duplicate slug', async () => {
    await seedVariants();
    await api.post('/api/admin/ideas').set(ADMIN_HEADERS).send(ideaBody);
    const res = await api
      .post('/api/admin/ideas')
      .set(ADMIN_HEADERS)
      .send(ideaBody);
    expect(res.status).toBe(409);
  });

  it('updates an idea', async () => {
    await seedVariants();
    const created = await api
      .post('/api/admin/ideas')
      .set(ADMIN_HEADERS)
      .send(ideaBody);
    const res = await api
      .patch(`/api/admin/ideas/${created.body.data.id}`)
      .set(ADMIN_HEADERS)
      .send({ title: 'New title', published: false });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('New title');
  });

  it('400s on an empty idea update', async () => {
    await seedVariants();
    const created = await api
      .post('/api/admin/ideas')
      .set(ADMIN_HEADERS)
      .send(ideaBody);
    const res = await api
      .patch(`/api/admin/ideas/${created.body.data.id}`)
      .set(ADMIN_HEADERS)
      .send({});
    expect(res.status).toBe(400);
  });

  it('404s updating a missing idea', async () => {
    const res = await api
      .patch('/api/admin/ideas/ghost')
      .set(ADMIN_HEADERS)
      .send({ title: 'x' });
    expect(res.status).toBe(404);
  });

  it('deletes an idea', async () => {
    await seedVariants();
    const created = await api
      .post('/api/admin/ideas')
      .set(ADMIN_HEADERS)
      .send(ideaBody);
    const res = await api
      .delete(`/api/admin/ideas/${created.body.data.id}`)
      .set(ADMIN_HEADERS);
    expect(res.status).toBe(204);
  });

  it('404s deleting a missing idea', async () => {
    const res = await api.delete('/api/admin/ideas/ghost').set(ADMIN_HEADERS);
    expect(res.status).toBe(404);
  });
});
