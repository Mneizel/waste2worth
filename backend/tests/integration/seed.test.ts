import { prisma } from '../../src/db/prisma';
import { BOTTLE_VARIANTS } from '../../src/seed/bottleSizes';
import { IDEAS } from '../../src/seed/ideas';
import { seed } from '../../src/seed/run';

describe('seed()', () => {
  it('populates the catalogue and ideas and is idempotent', async () => {
    await seed();
    await seed();

    expect(await prisma.itemCategory.count()).toBe(1);
    expect(await prisma.itemVariant.count()).toBe(BOTTLE_VARIANTS.length);
    expect(await prisma.idea.count()).toBe(IDEAS.length);

    const planter = await prisma.idea.findUnique({
      where: { slug: 'self-watering-planter' },
      include: { tools: true, steps: true, variantLinks: true },
    });
    expect(planter).not.toBeNull();
    expect(planter!.steps.length).toBeGreaterThan(3);
    expect(planter!.tools.length).toBeGreaterThan(2);
    expect(planter!.variantLinks.length).toBeGreaterThan(0);
  });
});
