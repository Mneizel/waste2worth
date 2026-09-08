import { prisma } from '../../src/db/prisma';

let counter = 0;
const uniq = (prefix: string): string => {
  counter += 1;
  return `${prefix}-${counter}`;
};

export async function createCategory(
  overrides: Partial<{ key: string; name: string }> = {},
) {
  return prisma.itemCategory.create({
    data: {
      key: overrides.key ?? 'bottle',
      name: overrides.name ?? 'Bottle',
    },
  });
}

interface VariantOverrides {
  key: string;
  label: string;
  materialType: string;
  volumeMl: number;
  heightMm: number;
  diameterMm: number;
  region: string;
  typicalContents: string;
  isCommon: boolean;
  sortOrder: number;
  notes: string;
}

export async function createVariant(
  categoryId: string,
  overrides: Partial<VariantOverrides> = {},
) {
  const volumeMl = overrides.volumeMl ?? 500;
  return prisma.itemVariant.create({
    data: {
      categoryId,
      key: overrides.key ?? uniq('variant'),
      label: overrides.label ?? `Bottle (${volumeMl} ml)`,
      materialType: overrides.materialType ?? 'PET',
      volumeMl,
      heightMm: overrides.heightMm ?? 210,
      diameterMm: overrides.diameterMm ?? 66,
      region: overrides.region ?? 'GLOBAL',
      typicalContents: overrides.typicalContents ?? 'water',
      isCommon: overrides.isCommon ?? true,
      sortOrder: overrides.sortOrder ?? 0,
      notes: overrides.notes ?? '',
    },
  });
}

interface IdeaOptions {
  variantIds: string[];
  slug?: string;
  title?: string;
  published?: boolean;
  sortOrder?: number;
  withTools?: boolean;
  withSteps?: boolean;
}

export async function createIdea(options: IdeaOptions) {
  const slug = options.slug ?? uniq('idea');
  return prisma.idea.create({
    data: {
      slug,
      title: options.title ?? `Idea ${slug}`,
      summary: 'A test idea.',
      difficulty: 'easy',
      estimatedMinutes: 20,
      minAge: 6,
      safetyNotes: 'Be careful.',
      sortOrder: options.sortOrder ?? 0,
      published: options.published ?? true,
      finalImageUrl: `images/ideas/${slug}-final.svg`,
      thumbnailUrl: `images/ideas/${slug}-thumb.svg`,
      model3dUrl: `models/${slug}.glb`,
      model3dPreviewUrl: `images/ideas/${slug}-3d.svg`,
      variantLinks: {
        create: options.variantIds.map((variantId) => ({ variantId })),
      },
      tools:
        options.withTools === false
          ? undefined
          : {
              create: [
                {
                  kind: 'tool',
                  name: 'Scissors',
                  imageUrl: 'images/tools/scissors.svg',
                  quantity: '1',
                  optional: false,
                  note: '',
                  sortOrder: 0,
                },
                {
                  kind: 'material',
                  name: 'String',
                  imageUrl: 'images/tools/string.svg',
                  quantity: '20 cm',
                  optional: true,
                  note: 'Any cotton string.',
                  sortOrder: 1,
                },
              ],
            },
      steps:
        options.withSteps === false
          ? undefined
          : {
              create: [
                {
                  stepNumber: 1,
                  title: 'Clean it',
                  instruction: 'Wash the bottle.',
                  imageUrl: `images/steps/${slug}-1.svg`,
                  tip: 'Warm water helps.',
                  warning: '',
                  icon: '🧼',
                },
                {
                  stepNumber: 2,
                  title: 'Cut it',
                  instruction: 'An adult cuts the bottle.',
                  imageUrl: `images/steps/${slug}-2.svg`,
                  tip: '',
                  warning: 'Adults only.',
                  icon: '✂️',
                },
              ],
            },
    },
    include: {
      tools: true,
      steps: true,
      variantLinks: { include: { variant: true } },
    },
  });
}

/** A minimal but valid PNG byte sequence for upload tests. */
export function pngBytes(seed = 1): Buffer {
  const header = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  const body = Buffer.alloc(32, seed & 0xff);
  return Buffer.concat([header, body]);
}
