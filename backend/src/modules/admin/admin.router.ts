import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../../db/prisma';
import { asyncHandler } from '../../lib/asyncHandler';
import { NotFoundError } from '../../lib/errors';
import { runPrisma } from '../../lib/prismaError';
import { parseOrThrow } from '../../lib/validate';
import { requireAdmin } from '../../middleware/requireAdmin';
import {
  presentCategory,
  presentIdeaDetail,
  presentVariant,
} from '../../presenters';

export const adminRouter = Router();
adminRouter.use(requireAdmin);

const categorySchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
});

const variantSchema = z.object({
  categoryKey: z.string().min(1),
  key: z.string().min(1),
  label: z.string().min(1),
  materialType: z.string().min(1),
  volumeMl: z.number().int().positive(),
  heightMm: z.number().int().positive(),
  diameterMm: z.number().int().positive(),
  region: z.string().min(1).optional(),
  typicalContents: z.string().min(1).optional(),
  isCommon: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  notes: z.string().optional(),
});

const variantUpdateSchema = variantSchema
  .omit({ categoryKey: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

const toolSchema = z.object({
  kind: z.enum(['tool', 'material']).optional(),
  name: z.string().min(1),
  imageUrl: z.string().min(1),
  quantity: z.string().min(1).optional(),
  optional: z.boolean().optional(),
  note: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

const stepSchema = z.object({
  stepNumber: z.number().int().positive(),
  title: z.string().min(1),
  instruction: z.string().min(1),
  imageUrl: z.string().min(1),
  tip: z.string().optional(),
  warning: z.string().optional(),
  icon: z.string().optional(),
});

const ideaSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  minAge: z.number().int().positive().optional(),
  finalImageUrl: z.string().min(1),
  thumbnailUrl: z.string().min(1),
  model3dUrl: z.string().min(1),
  model3dPreviewUrl: z.string().min(1),
  safetyNotes: z.string().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  variantKeys: z.array(z.string().min(1)).min(1),
  tools: z.array(toolSchema).optional(),
  steps: z.array(stepSchema).optional(),
});

const ideaUpdateSchema = ideaSchema
  .omit({ variantKeys: true, tools: true, steps: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

const ideaDetailInclude = {
  tools: { orderBy: [{ sortOrder: 'asc' as const }, { name: 'asc' as const }] },
  steps: { orderBy: { stepNumber: 'asc' as const } },
  variantLinks: { include: { variant: true } },
};

adminRouter.post(
  '/categories',
  asyncHandler(async (req, res) => {
    const body = parseOrThrow(categorySchema, req.body);
    const category = await runPrisma(() =>
      prisma.itemCategory.create({ data: body }),
    );
    res.status(201).json({ data: presentCategory(category) });
  }),
);

adminRouter.post(
  '/variants',
  asyncHandler(async (req, res) => {
    const { categoryKey, ...rest } = parseOrThrow(variantSchema, req.body);
    const category = await prisma.itemCategory.findUnique({
      where: { key: categoryKey },
    });
    if (!category) {
      throw new NotFoundError(`No category with key "${categoryKey}"`);
    }
    const variant = await runPrisma(() =>
      prisma.itemVariant.create({
        data: { ...rest, categoryId: category.id },
        include: { category: true },
      }),
    );
    res.status(201).json({ data: presentVariant(variant) });
  }),
);

adminRouter.patch(
  '/variants/:id',
  asyncHandler(async (req, res) => {
    const body = parseOrThrow(variantUpdateSchema, req.body);
    const variant = await runPrisma(() =>
      prisma.itemVariant.update({
        where: { id: req.params.id },
        data: body,
        include: { category: true },
      }),
    );
    res.json({ data: presentVariant(variant) });
  }),
);

adminRouter.delete(
  '/variants/:id',
  asyncHandler(async (req, res) => {
    await runPrisma(() =>
      prisma.itemVariant.delete({ where: { id: req.params.id } }),
    );
    res.status(204).send();
  }),
);

adminRouter.post(
  '/ideas',
  asyncHandler(async (req, res) => {
    const body = parseOrThrow(ideaSchema, req.body);
    const { variantKeys, tools, steps, ...ideaFields } = body;

    const variants = await prisma.itemVariant.findMany({
      where: { key: { in: variantKeys } },
      select: { id: true, key: true },
    });
    if (variants.length !== variantKeys.length) {
      const found = new Set(variants.map((v) => v.key));
      const missing = variantKeys.filter((key) => !found.has(key));
      throw new NotFoundError(`Unknown variant keys: ${missing.join(', ')}`);
    }

    const idea = await runPrisma(() =>
      prisma.idea.create({
        data: {
          ...ideaFields,
          variantLinks: {
            create: variants.map((variant) => ({ variantId: variant.id })),
          },
          tools: tools ? { create: tools } : undefined,
          steps: steps ? { create: steps } : undefined,
        },
        include: ideaDetailInclude,
      }),
    );
    res.status(201).json({ data: presentIdeaDetail(idea) });
  }),
);

adminRouter.patch(
  '/ideas/:id',
  asyncHandler(async (req, res) => {
    const body = parseOrThrow(ideaUpdateSchema, req.body);
    const idea = await runPrisma(() =>
      prisma.idea.update({
        where: { id: req.params.id },
        data: body,
        include: ideaDetailInclude,
      }),
    );
    res.json({ data: presentIdeaDetail(idea) });
  }),
);

adminRouter.delete(
  '/ideas/:id',
  asyncHandler(async (req, res) => {
    await runPrisma(() => prisma.idea.delete({ where: { id: req.params.id } }));
    res.status(204).send();
  }),
);
