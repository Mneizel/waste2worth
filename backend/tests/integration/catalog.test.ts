import { api } from '../helpers/api';
import { createCategory, createVariant } from '../helpers/factory';

describe('catalog endpoints', () => {
  describe('GET /api/categories', () => {
    it('lists categories with a variant count', async () => {
      const cat = await createCategory({ key: 'bottle', name: 'Bottle' });
      await createVariant(cat.id, { volumeMl: 500 });
      await createVariant(cat.id, { volumeMl: 1000 });

      const res = await api.get('/api/categories');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([
        expect.objectContaining({ key: 'bottle', variantCount: 2 }),
      ]);
    });
  });

  describe('GET /api/categories/:key', () => {
    it('returns a category and its sorted variants', async () => {
      const cat = await createCategory({ key: 'bottle' });
      await createVariant(cat.id, { key: 'big', volumeMl: 1000, sortOrder: 2 });
      await createVariant(cat.id, { key: 'small', volumeMl: 250, sortOrder: 1 });

      const res = await api.get('/api/categories/bottle');
      expect(res.status).toBe(200);
      expect(res.body.data.variants.map((v: { key: string }) => v.key)).toEqual([
        'small',
        'big',
      ]);
      expect(res.body.data.variants[0].categoryKey).toBe('bottle');
    });

    it('404s for an unknown key', async () => {
      const res = await api.get('/api/categories/ghost');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/bottle-sizes', () => {
    beforeEach(async () => {
      const cat = await createCategory({ key: 'bottle' });
      await createVariant(cat.id, {
        key: 'pet-500',
        volumeMl: 500,
        materialType: 'PET',
        region: 'GLOBAL',
        isCommon: true,
        sortOrder: 1,
      });
      await createVariant(cat.id, {
        key: 'glass-750',
        volumeMl: 750,
        materialType: 'GLASS',
        region: 'EUROPE',
        isCommon: false,
        sortOrder: 2,
      });
    });

    it('returns every bottle size with no filters', async () => {
      const res = await api.get('/api/bottle-sizes');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('filters by region, materialType and common flag', async () => {
      expect(
        (await api.get('/api/bottle-sizes?region=EUROPE')).body.data.map(
          (v: { key: string }) => v.key,
        ),
      ).toEqual(['glass-750']);
      expect(
        (await api.get('/api/bottle-sizes?materialType=PET')).body.data.map(
          (v: { key: string }) => v.key,
        ),
      ).toEqual(['pet-500']);
      expect(
        (await api.get('/api/bottle-sizes?common=true')).body.data.map(
          (v: { key: string }) => v.key,
        ),
      ).toEqual(['pet-500']);
      expect(
        (await api.get('/api/bottle-sizes?common=false')).body.data.map(
          (v: { key: string }) => v.key,
        ),
      ).toEqual(['glass-750']);
    });

    it('rejects an invalid common value', async () => {
      const res = await api.get('/api/bottle-sizes?common=maybe');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('GET /api/bottle-sizes without a seeded category', () => {
    it('404s when the bottle category is missing', async () => {
      const res = await api.get('/api/bottle-sizes');
      expect(res.status).toBe(404);
      expect(res.body.error.message).toContain('bottle');
    });
  });
});
