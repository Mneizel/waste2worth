import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../../db/prisma';
import { asyncHandler } from '../../lib/asyncHandler';
import { NotFoundError } from '../../lib/errors';
import { parseOrThrow } from '../../lib/validate';
import { presentIdeaDetail, presentIdeaSummary } from '../../presenters';

export const ideasRouter = Router();

const listQuerySchema = z.object({
  variantId: z.string().min(1).optional(),
  variantKey: z.string().min(1).optional(),
});

const ideaDetailInclude = {
  tools: { orderBy: [{ sortOrder: 'asc' as const }, { name: 'asc' as const }] },
  steps: { orderBy: { stepNumber: 'asc' as const } },
  variantLinks: { include: { variant: true } },
};

ideasRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = parseOrThrow(listQuerySchema, req.query);
    const variantFilter =
      query.variantId || query.variantKey
        ? {
            variantLinks: {
              some: {
                variant: {
                  ...(query.variantId ? { id: query.variantId } : {}),
                  ...(query.variantKey ? { key: query.variantKey } : {}),
                },
              },
            },
          }
        : {};
    const ideas = await prisma.idea.findMany({
      where: { published: true, ...variantFilter },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
    res.json({ data: ideas.map(presentIdeaSummary) });
  }),
);

ideasRouter.get(
  '/:idOrSlug',
  asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;
    const idea = await prisma.idea.findFirst({
      where: {
        published: true,
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: ideaDetailInclude,
    });
    if (!idea) {
      throw new NotFoundError(`No published idea matching "${idOrSlug}"`);
    }
    res.json({ data: presentIdeaDetail(idea) });
  }),
);
