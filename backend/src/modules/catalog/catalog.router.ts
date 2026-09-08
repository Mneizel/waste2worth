import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../../db/prisma';
import { asyncHandler } from '../../lib/asyncHandler';
import { NotFoundError } from '../../lib/errors';
import { parseOrThrow } from '../../lib/validate';
import { presentCategory, presentVariant } from '../../presenters';

export const catalogRouter = Router();

const bottleSizeQuerySchema = z.object({
  region: z.string().min(1).optional(),
  materialType: z.string().min(1).optional(),
  common: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
});

catalogRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.itemCategory.findMany({
      orderBy: { key: 'asc' },
      include: { _count: { select: { variants: true } } },
    });
    res.json({ data: categories.map(presentCategory) });
  }),
);

catalogRouter.get(
  '/categories/:key',
  asyncHandler(async (req, res) => {
    const category = await prisma.itemCategory.findUnique({
      where: { key: req.params.key },
      include: { variants: { orderBy: [{ sortOrder: 'asc' }, { volumeMl: 'asc' }] } },
    });
    if (!category) {
      throw new NotFoundError(`No category with key "${req.params.key}"`);
    }
    res.json({ data: presentCategory(category) });
  }),
);

catalogRouter.get(
  '/bottle-sizes',
  asyncHandler(async (req, res) => {
    const query = parseOrThrow(bottleSizeQuerySchema, req.query);
    const category = await prisma.itemCategory.findUnique({
      where: { key: 'bottle' },
    });
    if (!category) {
      throw new NotFoundError('The "bottle" category has not been seeded');
    }
    const variants = await prisma.itemVariant.findMany({
      where: {
        categoryId: category.id,
        ...(query.region ? { region: query.region } : {}),
        ...(query.materialType ? { materialType: query.materialType } : {}),
        ...(query.common === undefined ? {} : { isCommon: query.common }),
      },
      orderBy: [{ sortOrder: 'asc' }, { volumeMl: 'asc' }],
      include: { category: true },
    });
    res.json({ data: variants.map((variant) => presentVariant(variant)) });
  }),
);
