import { createHash } from 'node:crypto';

import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../../db/prisma';
import { asyncHandler } from '../../lib/asyncHandler';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../lib/errors';
import { parseOrThrow } from '../../lib/validate';
import { visionRecognizer } from '../../lib/vision';
import { presentIdeaSummary, presentScan, presentVariant } from '../../presenters';
import { scanImageUpload } from './imageUpload';
import { saveScanImage } from './saveScanImage';
import {
  SCAN_STATUS,
  SPEC_SETTLED_STATUSES,
  assertStatusIn,
} from './scanStatus';
import { findNearestVariant, pickAlternatives } from './variantMatch';

export const scansRouter = Router();

const SCAN_INCLUDE = {
  aiGuessVariant: { include: { category: true } },
  confirmedVariant: { include: { category: true } },
} satisfies Prisma.ScanInclude;

const createBodySchema = z.object({ hint: z.string().optional() });
const selectVariantSchema = z.object({ variantId: z.string().min(1) });
const selectIdeaSchema = z.object({ ideaId: z.string().min(1) });

async function loadScan(id: string) {
  const scan = await prisma.scan.findUnique({
    where: { id },
    include: SCAN_INCLUDE,
  });
  if (!scan) {
    throw new NotFoundError(`No scan found with id "${id}"`);
  }
  return scan;
}

async function recordEvent(
  scanId: string,
  type: string,
  data: Record<string, unknown>,
): Promise<void> {
  await prisma.scanEvent.create({
    data: { scanId, type, dataJson: JSON.stringify(data) },
  });
}

/** Map a raw vision observation onto a catalogue variant id, if we can. */
export async function resolveGuessVariantId(
  categoryKey: string | null,
  estimatedVolumeMl: number | null,
): Promise<string | null> {
  if (!categoryKey || estimatedVolumeMl == null) {
    return null;
  }
  const variants = await prisma.itemVariant.findMany({
    where: { category: { key: categoryKey } },
  });
  const nearest = findNearestVariant(variants, estimatedVolumeMl);
  return nearest ? nearest.id : null;
}

// POST /api/scans — upload a photo and get the first guess.
scansRouter.post(
  '/',
  scanImageUpload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new BadRequestError('An "image" file field is required');
    }
    const { hint } = parseOrThrow(createBodySchema, req.body);
    const buffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    const sha256 = createHash('sha256').update(buffer).digest('hex');

    const observation = await visionRecognizer.recognize({
      imageBuffer: buffer,
      mimeType,
      hint,
    });
    const saved = await saveScanImage(buffer, mimeType);
    const aiGuessVariantId = await resolveGuessVariantId(
      observation.categoryKey,
      observation.estimatedVolumeMl,
    );

    const created = await prisma.scan.create({
      data: {
        status: SCAN_STATUS.PENDING_CONFIRMATION,
        imageFilename: saved.filename,
        imagePath: saved.publicPath,
        imageMimeType: mimeType,
        imageSizeBytes: buffer.length,
        imageSha256: sha256,
        aiCategoryKey: observation.categoryKey,
        aiGuessLabel: observation.label,
        aiGuessVolumeMl: observation.estimatedVolumeMl,
        aiConfidence: observation.confidence,
        aiRawJson: JSON.stringify(observation.raw),
        aiGuessVariantId,
      },
    });
    await recordEvent(created.id, 'CREATED', {
      hintProvided: hint !== undefined,
      matchedVariant: aiGuessVariantId !== null,
    });

    const scan = await loadScan(created.id);
    res.status(201).json({ data: presentScan(scan) });
  }),
);

// GET /api/scans/:id
scansRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const scan = await loadScan(req.params.id as string);
    res.json({ data: presentScan(scan) });
  }),
);

// POST /api/scans/:id/confirm — accept the AI guess as-is.
scansRouter.post(
  '/:id/confirm',
  asyncHandler(async (req, res) => {
    const scan = await loadScan(req.params.id as string);
    assertStatusIn(scan.status, [SCAN_STATUS.PENDING_CONFIRMATION], 'confirm');
    if (!scan.aiGuessVariantId) {
      throw new ConflictError(
        'There is no recognised item to confirm; use select-variant instead',
      );
    }
    await prisma.scan.update({
      where: { id: scan.id },
      data: {
        confirmedVariantId: scan.aiGuessVariantId,
        status: SCAN_STATUS.CONFIRMED,
      },
    });
    await recordEvent(scan.id, 'CONFIRMED', { variantId: scan.aiGuessVariantId });
    res.json({ data: presentScan(await loadScan(scan.id)) });
  }),
);

// POST /api/scans/:id/reject — reject the guess, get alternative sizes.
scansRouter.post(
  '/:id/reject',
  asyncHandler(async (req, res) => {
    const scan = await loadScan(req.params.id as string);
    assertStatusIn(scan.status, [SCAN_STATUS.PENDING_CONFIRMATION], 'reject');
    await prisma.scan.update({
      where: { id: scan.id },
      data: { status: SCAN_STATUS.REJECTED },
    });
    await recordEvent(scan.id, 'REJECTED', {});

    const commonVariants = await prisma.itemVariant.findMany({
      where: { category: { key: 'bottle' }, isCommon: true },
      orderBy: [{ sortOrder: 'asc' }, { volumeMl: 'asc' }],
    });
    const alternatives = pickAlternatives(commonVariants, {
      excludeId: scan.aiGuessVariantId ?? undefined,
      nearVolumeMl: scan.aiGuessVolumeMl,
    });

    res.json({
      data: {
        scan: presentScan(await loadScan(scan.id)),
        alternatives: alternatives.map((variant) => presentVariant(variant)),
      },
    });
  }),
);

// POST /api/scans/:id/select-variant — the user picks the right size.
scansRouter.post(
  '/:id/select-variant',
  asyncHandler(async (req, res) => {
    const { variantId } = parseOrThrow(selectVariantSchema, req.body);
    const scan = await loadScan(req.params.id as string);
    assertStatusIn(
      scan.status,
      [
        SCAN_STATUS.PENDING_CONFIRMATION,
        SCAN_STATUS.REJECTED,
        SCAN_STATUS.CONFIRMED,
        SCAN_STATUS.VARIANT_SELECTED,
      ],
      'select a variant',
    );
    const variant = await prisma.itemVariant.findUnique({ where: { id: variantId } });
    if (!variant) {
      throw new NotFoundError(`No variant with id "${variantId}"`);
    }
    await prisma.scan.update({
      where: { id: scan.id },
      data: {
        confirmedVariantId: variant.id,
        status: SCAN_STATUS.VARIANT_SELECTED,
      },
    });
    await recordEvent(scan.id, 'VARIANT_SELECTED', { variantId: variant.id });
    res.json({ data: presentScan(await loadScan(scan.id)) });
  }),
);

// GET /api/scans/:id/ideas — ideas for the settled item spec.
scansRouter.get(
  '/:id/ideas',
  asyncHandler(async (req, res) => {
    const scan = await loadScan(req.params.id as string);
    assertStatusIn(scan.status, SPEC_SETTLED_STATUSES, 'list ideas');
    // Settled statuses always carry a confirmed variant (see the transitions).
    const confirmedVariantId = scan.confirmedVariantId as string;
    const ideas = await prisma.idea.findMany({
      where: {
        published: true,
        variantLinks: { some: { variantId: confirmedVariantId } },
      },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
    res.json({ data: ideas.map(presentIdeaSummary) });
  }),
);

// POST /api/scans/:id/select-idea — record the chosen project.
scansRouter.post(
  '/:id/select-idea',
  asyncHandler(async (req, res) => {
    const { ideaId } = parseOrThrow(selectIdeaSchema, req.body);
    const scan = await loadScan(req.params.id as string);
    assertStatusIn(scan.status, SPEC_SETTLED_STATUSES, 'select an idea');
    const idea = await prisma.idea.findFirst({
      where: { id: ideaId, published: true },
      include: { variantLinks: true },
    });
    if (!idea) {
      throw new NotFoundError(`No published idea with id "${ideaId}"`);
    }
    const applies = idea.variantLinks.some(
      (link) => link.variantId === scan.confirmedVariantId,
    );
    if (!applies) {
      throw new UnprocessableEntityError(
        'That idea does not apply to the confirmed item',
      );
    }
    await prisma.scan.update({
      where: { id: scan.id },
      data: {
        selectedIdeaId: idea.id,
        status: SCAN_STATUS.IDEA_SELECTED,
      },
    });
    await recordEvent(scan.id, 'IDEA_SELECTED', { ideaId: idea.id });
    res.json({ data: presentScan(await loadScan(scan.id)) });
  }),
);
