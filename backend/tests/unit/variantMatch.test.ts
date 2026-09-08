import {
  findNearestVariant,
  pickAlternatives,
} from '../../src/modules/scans/variantMatch';

describe('findNearestVariant', () => {
  it('returns null for an empty list', () => {
    expect(findNearestVariant([], 500)).toBeNull();
  });

  it('returns the only variant when there is one', () => {
    const only = { volumeMl: 999 };
    expect(findNearestVariant([only], 100)).toBe(only);
  });

  it('picks the closest by volume', () => {
    const list = [{ volumeMl: 250 }, { volumeMl: 500 }, { volumeMl: 1000 }];
    expect(findNearestVariant(list, 480)).toEqual({ volumeMl: 500 });
    expect(findNearestVariant(list, 260)).toEqual({ volumeMl: 250 });
  });

  it('keeps the first on a tie (delta not strictly smaller)', () => {
    const list = [{ volumeMl: 400, id: 'a' }, { volumeMl: 600, id: 'b' }];
    expect(findNearestVariant(list, 500)).toEqual({ volumeMl: 400, id: 'a' });
  });
});

describe('pickAlternatives', () => {
  const candidates = [
    { id: 'a', volumeMl: 250, sortOrder: 3 },
    { id: 'b', volumeMl: 500, sortOrder: 1 },
    { id: 'c', volumeMl: 1000, sortOrder: 2 },
    { id: 'd', volumeMl: 1500, sortOrder: 4 },
  ];

  it('orders by sortOrder when no target volume is given', () => {
    expect(pickAlternatives(candidates).map((c) => c.id)).toEqual(['b', 'c', 'a']);
  });

  it('orders by closeness to the target volume', () => {
    const result = pickAlternatives(candidates, { nearVolumeMl: 900 });
    expect(result.map((c) => c.id)).toEqual(['c', 'b', 'd']);
  });

  it('excludes the rejected id and respects a custom limit', () => {
    const result = pickAlternatives(candidates, {
      excludeId: 'c',
      nearVolumeMl: 900,
      limit: 2,
    });
    expect(result.map((c) => c.id)).toEqual(['b', 'd']);
  });

  it('treats a null target volume like no target', () => {
    const result = pickAlternatives(candidates, { nearVolumeMl: null });
    expect(result.map((c) => c.id)).toEqual(['b', 'c', 'a']);
  });
});
