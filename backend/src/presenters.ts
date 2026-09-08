import type {
  Idea,
  IdeaStep,
  IdeaTool,
  ItemCategory,
  ItemVariant,
  Scan,
} from '@prisma/client';

import { toMediaUrl } from './lib/media';

export function presentVariant(
  variant: ItemVariant & { category?: ItemCategory | null },
): Record<string, unknown> {
  return {
    id: variant.id,
    key: variant.key,
    categoryKey: variant.category ? variant.category.key : undefined,
    label: variant.label,
    materialType: variant.materialType,
    volumeMl: variant.volumeMl,
    heightMm: variant.heightMm,
    diameterMm: variant.diameterMm,
    region: variant.region,
    typicalContents: variant.typicalContents,
    isCommon: variant.isCommon,
    sortOrder: variant.sortOrder,
    notes: variant.notes,
  };
}

export function presentCategory(
  category: ItemCategory & { variants?: ItemVariant[]; _count?: { variants: number } },
): Record<string, unknown> {
  return {
    id: category.id,
    key: category.key,
    name: category.name,
    variantCount: category._count ? category._count.variants : undefined,
    variants: category.variants
      ? category.variants.map((v) => presentVariant({ ...v, category }))
      : undefined,
  };
}

export function presentTool(tool: IdeaTool): Record<string, unknown> {
  return {
    id: tool.id,
    kind: tool.kind,
    name: tool.name,
    imageUrl: toMediaUrl(tool.imageUrl),
    quantity: tool.quantity,
    optional: tool.optional,
    note: tool.note,
  };
}

export function presentStep(step: IdeaStep): Record<string, unknown> {
  return {
    stepNumber: step.stepNumber,
    title: step.title,
    instruction: step.instruction,
    imageUrl: toMediaUrl(step.imageUrl),
    tip: step.tip,
    warning: step.warning,
    icon: step.icon,
  };
}

export function presentIdeaSummary(idea: Idea): Record<string, unknown> {
  return {
    id: idea.id,
    slug: idea.slug,
    title: idea.title,
    summary: idea.summary,
    difficulty: idea.difficulty,
    estimatedMinutes: idea.estimatedMinutes,
    minAge: idea.minAge,
    thumbnailUrl: toMediaUrl(idea.thumbnailUrl),
    finalImageUrl: toMediaUrl(idea.finalImageUrl),
  };
}

export function presentIdeaDetail(
  idea: Idea & {
    tools?: IdeaTool[];
    steps?: IdeaStep[];
    variantLinks?: { variant: ItemVariant }[];
  },
): Record<string, unknown> {
  return {
    ...presentIdeaSummary(idea),
    safetyNotes: idea.safetyNotes,
    model3dUrl: toMediaUrl(idea.model3dUrl),
    model3dPreviewUrl: toMediaUrl(idea.model3dPreviewUrl),
    tools: (idea.tools ?? []).map(presentTool),
    steps: (idea.steps ?? []).map(presentStep),
    variantKeys: (idea.variantLinks ?? []).map((link) => link.variant.key),
  };
}

export function presentScan(
  scan: Scan & {
    aiGuessVariant?: (ItemVariant & { category?: ItemCategory | null }) | null;
    confirmedVariant?: (ItemVariant & { category?: ItemCategory | null }) | null;
  },
): Record<string, unknown> {
  return {
    id: scan.id,
    status: scan.status,
    image: {
      url: toMediaUrl(scan.imagePath),
      mimeType: scan.imageMimeType,
      sizeBytes: scan.imageSizeBytes,
      sha256: scan.imageSha256,
    },
    aiGuess: {
      categoryKey: scan.aiCategoryKey,
      label: scan.aiGuessLabel,
      estimatedVolumeMl: scan.aiGuessVolumeMl,
      confidence: scan.aiConfidence,
      variant: scan.aiGuessVariant ? presentVariant(scan.aiGuessVariant) : null,
    },
    confirmedVariant: scan.confirmedVariant
      ? presentVariant(scan.confirmedVariant)
      : null,
    selectedIdeaId: scan.selectedIdeaId,
    createdAt: scan.createdAt.toISOString(),
  };
}
