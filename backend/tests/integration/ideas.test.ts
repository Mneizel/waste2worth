import { api } from '../helpers/api';
import { createCategory, createIdea, createVariant } from '../helpers/factory';

async function setup() {
  const cat = await createCategory({ key: 'bottle' });
  const v500 = await createVariant(cat.id, { key: 'pet-500', volumeMl: 500 });
  const v1000 = await createVariant(cat.id, { key: 'pet-1000', volumeMl: 1000 });
  return { v500, v1000 };
}

describe('idea endpoints', () => {
  describe('GET /api/ideas', () => {
    it('lists only published ideas', async () => {
      const { v500 } = await setup();
      await createIdea({ variantIds: [v500.id], title: 'Live', sortOrder: 1 });
      await createIdea({ variantIds: [v500.id], title: 'Hidden', published: false });

      const res = await api.get('/api/ideas');
      expect(res.status).toBe(200);
      expect(res.body.data.map((i: { title: string }) => i.title)).toEqual(['Live']);
    });

    it('filters by variantId and by variantKey', async () => {
      const { v500, v1000 } = await setup();
      await createIdea({ variantIds: [v500.id], slug: 'for-500' });
      await createIdea({ variantIds: [v1000.id], slug: 'for-1000' });

      const byId = await api.get(`/api/ideas?variantId=${v500.id}`);
      expect(byId.body.data.map((i: { slug: string }) => i.slug)).toEqual(['for-500']);

      const byKey = await api.get('/api/ideas?variantKey=pet-1000');
      expect(byKey.body.data.map((i: { slug: string }) => i.slug)).toEqual(['for-1000']);
    });
  });

  describe('GET /api/ideas/:idOrSlug', () => {
    it('returns full detail by slug and by id', async () => {
      const { v500 } = await setup();
      const idea = await createIdea({ variantIds: [v500.id], slug: 'planter' });

      const bySlug = await api.get('/api/ideas/planter');
      expect(bySlug.status).toBe(200);
      expect(bySlug.body.data).toMatchObject({
        slug: 'planter',
        variantKeys: ['pet-500'],
      });
      expect(bySlug.body.data.tools).toHaveLength(2);
      expect(bySlug.body.data.steps).toHaveLength(2);
      expect(bySlug.body.data.model3dUrl).toContain('http://cdn.test/');

      const byId = await api.get(`/api/ideas/${idea.id}`);
      expect(byId.status).toBe(200);
      expect(byId.body.data.slug).toBe('planter');
    });

    it('404s for unknown or unpublished ideas', async () => {
      const { v500 } = await setup();
      await createIdea({ variantIds: [v500.id], slug: 'secret', published: false });

      expect((await api.get('/api/ideas/secret')).status).toBe(404);
      expect((await api.get('/api/ideas/nope')).status).toBe(404);
    });
  });
});
