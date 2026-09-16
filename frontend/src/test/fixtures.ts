import type { IdeaDetail, Variant } from '../lib/types';

export function makeVariant(over: Partial<Variant> & { key: string }): Variant {
  return {
    id: `var-${over.key}`,
    categoryKey: 'bottle',
    label: `Bottle ${over.volumeMl ?? 500} ml`,
    materialType: 'PET',
    volumeMl: 500,
    heightMm: 210,
    diameterMm: 66,
    region: 'GLOBAL',
    typicalContents: 'water',
    isCommon: true,
    sortOrder: 0,
    notes: '',
    ...over,
  };
}

export const VARIANTS: Variant[] = [
  makeVariant({ key: 'v250', volumeMl: 250, sortOrder: 1 }),
  makeVariant({ key: 'v330', volumeMl: 330, sortOrder: 2 }),
  makeVariant({ key: 'v500', volumeMl: 500, sortOrder: 3, label: 'Standard water bottle (500 ml)' }),
  makeVariant({ key: 'v600', volumeMl: 600, sortOrder: 4 }),
  makeVariant({ key: 'v750', volumeMl: 750, sortOrder: 5 }),
  makeVariant({ key: 'v1000', volumeMl: 1000, sortOrder: 6 }),
  makeVariant({ key: 'v1500', volumeMl: 1500, sortOrder: 7 }),
  makeVariant({
    key: 'v2000',
    volumeMl: 2000,
    sortOrder: 8,
    isCommon: false,
    materialType: 'TIN',
  }),
  makeVariant({
    key: 'vcan330',
    categoryKey: 'can',
    volumeMl: 330,
    heightMm: 115,
    diameterMm: 66,
    sortOrder: 9,
    label: 'Soda can (330 ml)',
    materialType: 'ALUMINIUM',
  }),
];

interface SeedIdea {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  variantKeys: string[];
  detail: IdeaDetail;
}

function ideaDetail(over: Partial<IdeaDetail> & { id: string; slug: string; title: string }): IdeaDetail {
  return {
    summary: 'A test idea.',
    difficulty: 'easy',
    estimatedMinutes: 20,
    minAge: 6,
    thumbnailUrl: `/static/images/ideas/${over.slug}-thumb.svg`,
    finalImageUrl: `/static/images/ideas/${over.slug}-final.svg`,
    safetyNotes: 'An adult should do the cutting.',
    source: 'test source',
    model3dUrl: `/static/models/${over.slug}.glb`,
    model3dPreviewUrl: `/static/images/ideas/${over.slug}-3d.svg`,
    variantKeys: ['v500'],
    tools: [
      {
        id: 't1',
        kind: 'tool',
        name: 'Scissors',
        imageUrl: '/static/images/tools/scissors.svg',
        quantity: '1',
        optional: false,
        note: '',
      },
      {
        id: 't2',
        kind: 'material',
        name: 'String',
        imageUrl: '/static/images/tools/string.svg',
        quantity: '20 cm',
        optional: true,
        note: 'Any cotton string.',
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Clean it',
        instruction: 'Wash the bottle.',
        op: 'clean',
        // a measure whose position is undefined -> exercises the frac fallback
        measure: 'planter-wick',
        tip: 'Warm water helps.',
        warning: '',
      },
      {
        stepNumber: 2,
        title: 'Cut it',
        instruction: 'An adult cuts the bottle.',
        op: 'cut',
        measure: 'planter-cut',
        tip: '',
        warning: 'Adults only.',
      },
      {
        stepNumber: 3,
        title: 'Seal the rim',
        instruction: 'Tape the cut edge.',
        op: 'seal-edge',
        measure: '',
        tip: '',
        warning: '',
      },
    ],
    ...over,
  };
}

export const IDEAS: SeedIdea[] = [
  {
    id: 'idea-planter',
    slug: 'planter',
    title: 'Self-watering planter',
    published: true,
    variantKeys: ['v500'],
    detail: ideaDetail({ id: 'idea-planter', slug: 'planter', title: 'Self-watering planter' }),
  },
  {
    id: 'idea-feeder',
    slug: 'feeder',
    title: 'Bird feeder',
    published: true,
    variantKeys: ['v500', 'v1000'],
    detail: ideaDetail({
      id: 'idea-feeder',
      slug: 'feeder',
      title: 'Bird feeder',
      difficulty: 'medium',
      variantKeys: ['v500', 'v1000'],
    }),
  },
  {
    id: 'idea-lamp',
    slug: 'lamp',
    title: 'Hanging lamp',
    published: true,
    variantKeys: ['v1000'],
    detail: ideaDetail({
      id: 'idea-lamp',
      slug: 'lamp',
      title: 'Hanging lamp',
      difficulty: 'hard',
      safetyNotes: '',
      model3dPreviewUrl: '',
      variantKeys: ['v1000'],
    }),
  },
  {
    id: 'idea-hidden',
    slug: 'hidden',
    title: 'Unpublished idea',
    published: false,
    variantKeys: ['v500'],
    detail: ideaDetail({ id: 'idea-hidden', slug: 'hidden', title: 'Unpublished idea' }),
  },
  {
    id: 'idea-can-organizer',
    slug: 'can-organizer',
    title: 'Can organizer',
    published: true,
    variantKeys: ['vcan330'],
    detail: ideaDetail({
      id: 'idea-can-organizer',
      slug: 'can-organizer',
      title: 'Can organizer',
      variantKeys: ['vcan330'],
      steps: [
        {
          stepNumber: 1,
          title: 'Clean it',
          instruction: 'Wash the can.',
          op: 'clean',
          measure: '',
          tip: '',
          warning: '',
        },
        {
          stepNumber: 2,
          title: 'Open the top',
          instruction: 'An adult opens the lid all the way.',
          op: 'open-top',
          measure: 'can-planter-drain',
          tip: '',
          warning: 'Adults only.',
        },
      ],
    }),
  },
];
