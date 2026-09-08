import type {
  Idea,
  IdeaStep,
  IdeaTool,
  ItemCategory,
  ItemVariant,
  Scan,
} from '@prisma/client';

import {
  presentCategory,
  presentIdeaDetail,
  presentIdeaSummary,
  presentScan,
  presentStep,
  presentTool,
  presentVariant,
} from '../../src/presenters';

const category: ItemCategory = {
  id: 'cat1',
  key: 'bottle',
  name: 'Bottle',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const variant: ItemVariant = {
  id: 'var1',
  categoryId: 'cat1',
  key: 'pet-500',
  label: 'Bottle 500',
  materialType: 'PET',
  volumeMl: 500,
  heightMm: 210,
  diameterMm: 66,
  region: 'GLOBAL',
  typicalContents: 'water',
  isCommon: true,
  sortOrder: 1,
  notes: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const idea: Idea = {
  id: 'idea1',
  slug: 'planter',
  title: 'Planter',
  summary: 'A planter.',
  difficulty: 'easy',
  estimatedMinutes: 20,
  minAge: 6,
  finalImageUrl: 'images/i-final.svg',
  thumbnailUrl: 'images/i-thumb.svg',
  model3dUrl: 'models/i.glb',
  model3dPreviewUrl: 'images/i-3d.svg',
  safetyNotes: 'Careful.',
  published: true,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const tool: IdeaTool = {
  id: 't1',
  ideaId: 'idea1',
  kind: 'tool',
  name: 'Scissors',
  imageUrl: 'images/tools/scissors.svg',
  quantity: '1',
  optional: false,
  note: '',
  sortOrder: 0,
};

const step: IdeaStep = {
  id: 's1',
  ideaId: 'idea1',
  stepNumber: 1,
  title: 'Clean',
  instruction: 'Wash it.',
  imageUrl: 'images/steps/1.svg',
  tip: 'Warm water.',
  warning: '',
  icon: '🧼',
  createdAt: new Date(),
};

const scan: Scan = {
  id: 'scan1',
  status: 'PENDING_CONFIRMATION',
  imageFilename: 'a.png',
  imagePath: '/uploads/a.png',
  imageMimeType: 'image/png',
  imageSizeBytes: 10,
  imageSha256: 'deadbeef',
  aiCategoryKey: 'bottle',
  aiGuessLabel: 'Bottle 500',
  aiGuessVolumeMl: 500,
  aiConfidence: 0.8,
  aiRawJson: '{}',
  aiGuessVariantId: null,
  confirmedVariantId: null,
  selectedIdeaId: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('presenters', () => {
  it('presentVariant with and without a joined category', () => {
    expect(presentVariant({ ...variant, category })).toMatchObject({
      categoryKey: 'bottle',
      volumeMl: 500,
    });
    expect(presentVariant(variant).categoryKey).toBeUndefined();
  });

  it('presentCategory with counts, with variants, and bare', () => {
    expect(
      presentCategory({ ...category, _count: { variants: 3 } }).variantCount,
    ).toBe(3);
    const withVariants = presentCategory({ ...category, variants: [variant] });
    expect(Array.isArray(withVariants.variants)).toBe(true);
    const bare = presentCategory(category);
    expect(bare.variantCount).toBeUndefined();
    expect(bare.variants).toBeUndefined();
  });

  it('presentTool / presentStep resolve media URLs', () => {
    expect(presentTool(tool).imageUrl).toBe('http://cdn.test/images/tools/scissors.svg');
    expect(presentStep(step).imageUrl).toBe('http://cdn.test/images/steps/1.svg');
  });

  it('presentIdeaSummary maps image URLs', () => {
    const summary = presentIdeaSummary(idea);
    expect(summary.thumbnailUrl).toBe('http://cdn.test/images/i-thumb.svg');
    expect(summary.finalImageUrl).toBe('http://cdn.test/images/i-final.svg');
  });

  it('presentIdeaDetail with nested data', () => {
    const detail = presentIdeaDetail({
      ...idea,
      tools: [tool],
      steps: [step],
      variantLinks: [{ variant }],
    });
    expect(detail.tools).toHaveLength(1);
    expect(detail.steps).toHaveLength(1);
    expect(detail.variantKeys).toEqual(['pet-500']);
    expect(detail.model3dUrl).toBe('http://cdn.test/models/i.glb');
  });

  it('presentIdeaDetail with no nested data', () => {
    const detail = presentIdeaDetail(idea);
    expect(detail.tools).toEqual([]);
    expect(detail.steps).toEqual([]);
    expect(detail.variantKeys).toEqual([]);
  });

  it('presentScan without variants', () => {
    const out = presentScan(scan);
    expect(out.confirmedVariant).toBeNull();
    expect((out.aiGuess as Record<string, unknown>).variant).toBeNull();
    expect(out.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('presentScan with ai + confirmed variants', () => {
    const out = presentScan({
      ...scan,
      aiGuessVariant: { ...variant, category },
      confirmedVariant: { ...variant, category },
    });
    expect((out.aiGuess as Record<string, unknown>).variant).toMatchObject({
      key: 'pet-500',
    });
    expect(out.confirmedVariant).toMatchObject({ key: 'pet-500' });
  });
});
