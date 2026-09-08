import { resolveGuessVariantId } from '../../src/modules/scans/scans.router';
import { createCategory, createVariant } from '../helpers/factory';

describe('resolveGuessVariantId', () => {
  it('returns null when there is no category key', async () => {
    expect(await resolveGuessVariantId(null, 500)).toBeNull();
  });

  it('returns null when there is no estimated volume', async () => {
    await createCategory({ key: 'bottle' });
    expect(await resolveGuessVariantId('bottle', null)).toBeNull();
  });

  it('returns null when the category has no variants', async () => {
    await createCategory({ key: 'bottle' });
    expect(await resolveGuessVariantId('bottle', 500)).toBeNull();
  });

  it('returns the nearest variant id by volume', async () => {
    const cat = await createCategory({ key: 'bottle' });
    await createVariant(cat.id, { key: 'v250', volumeMl: 250 });
    const v500 = await createVariant(cat.id, { key: 'v500', volumeMl: 500 });
    expect(await resolveGuessVariantId('bottle', 460)).toBe(v500.id);
  });
});
