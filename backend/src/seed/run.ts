import '../config/dotenv';

/* eslint-disable no-console */
import { prisma, disconnectPrisma } from '../db/prisma';
import { writePlaceholderModel, writeSvg } from './assets';
import { BOTTLE_VARIANTS } from './bottleSizes';
import { IDEAS } from './ideas';

const IDEA_BG = '#2f7d4f';
const STEP_BG = '#356fae';
const TOOL_BG = '#7a5230';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function seed(): Promise<void> {
  const category = await prisma.itemCategory.upsert({
    where: { key: 'bottle' },
    create: { key: 'bottle', name: 'Bottle' },
    update: { name: 'Bottle' },
  });

  for (const variant of BOTTLE_VARIANTS) {
    await prisma.itemVariant.upsert({
      where: { key: variant.key },
      create: { ...variant, categoryId: category.id },
      update: { ...variant, categoryId: category.id },
    });
  }
  console.log(`Seeded ${BOTTLE_VARIANTS.length} bottle variants.`);

  for (const idea of IDEAS) {
    const thumb = `images/ideas/${idea.slug}-thumb.svg`;
    const final = `images/ideas/${idea.slug}-final.svg`;
    const preview3d = `images/ideas/${idea.slug}-3d.svg`;
    const model = `models/${idea.slug}.glb`;

    await writeSvg(thumb, { title: idea.title, subtitle: 'thumbnail', bg: IDEA_BG });
    await writeSvg(final, { title: idea.title, subtitle: 'finished project', bg: IDEA_BG });
    await writeSvg(preview3d, { title: idea.title, subtitle: '3D preview', bg: '#1f5c3a' });
    await writePlaceholderModel(model);

    const variants = await prisma.itemVariant.findMany({
      where: { key: { in: idea.variantKeys } },
      select: { id: true },
    });

    await prisma.idea.upsert({
      where: { slug: idea.slug },
      update: {
        title: idea.title,
        summary: idea.summary,
        difficulty: idea.difficulty,
        estimatedMinutes: idea.estimatedMinutes,
        minAge: idea.minAge,
        safetyNotes: idea.safetyNotes ?? '',
        sortOrder: idea.sortOrder,
        finalImageUrl: `/static/${final}`,
        thumbnailUrl: `/static/${thumb}`,
        model3dUrl: `/static/${model}`,
        model3dPreviewUrl: `/static/${preview3d}`,
        published: true,
        variantLinks: {
          deleteMany: {},
          create: variants.map((v) => ({ variantId: v.id })),
        },
        tools: {
          deleteMany: {},
          create: idea.tools.map((tool, index) => ({
            kind: tool.kind,
            name: tool.name,
            imageUrl: `/static/images/tools/${slugify(tool.name)}.svg`,
            quantity: tool.quantity ?? '1',
            optional: tool.optional ?? false,
            note: tool.note ?? '',
            sortOrder: index,
          })),
        },
        steps: {
          deleteMany: {},
          create: idea.steps.map((step, index) => ({
            stepNumber: index + 1,
            title: step.title,
            instruction: step.instruction,
            imageUrl: `/static/images/steps/${idea.slug}-${index + 1}.svg`,
            tip: step.tip ?? '',
            warning: step.warning ?? '',
            icon: step.icon ?? '',
          })),
        },
      },
      create: {
        slug: idea.slug,
        title: idea.title,
        summary: idea.summary,
        difficulty: idea.difficulty,
        estimatedMinutes: idea.estimatedMinutes,
        minAge: idea.minAge,
        safetyNotes: idea.safetyNotes ?? '',
        sortOrder: idea.sortOrder,
        finalImageUrl: `/static/${final}`,
        thumbnailUrl: `/static/${thumb}`,
        model3dUrl: `/static/${model}`,
        model3dPreviewUrl: `/static/${preview3d}`,
        published: true,
        variantLinks: { create: variants.map((v) => ({ variantId: v.id })) },
        tools: {
          create: idea.tools.map((tool, index) => ({
            kind: tool.kind,
            name: tool.name,
            imageUrl: `/static/images/tools/${slugify(tool.name)}.svg`,
            quantity: tool.quantity ?? '1',
            optional: tool.optional ?? false,
            note: tool.note ?? '',
            sortOrder: index,
          })),
        },
        steps: {
          create: idea.steps.map((step, index) => ({
            stepNumber: index + 1,
            title: step.title,
            instruction: step.instruction,
            imageUrl: `/static/images/steps/${idea.slug}-${index + 1}.svg`,
            tip: step.tip ?? '',
            warning: step.warning ?? '',
            icon: step.icon ?? '',
          })),
        },
      },
    });

    for (const [index, step] of idea.steps.entries()) {
      await writeSvg(`images/steps/${idea.slug}-${index + 1}.svg`, {
        title: `${idea.title} — step ${index + 1}`,
        subtitle: step.title,
        bg: STEP_BG,
      });
    }
    const toolNames = new Set(idea.tools.map((tool) => tool.name));
    for (const name of toolNames) {
      await writeSvg(`images/tools/${slugify(name)}.svg`, {
        title: name,
        subtitle: 'tool',
        bg: TOOL_BG,
      });
    }
  }
  console.log(`Seeded ${IDEAS.length} upcycling ideas with tools and steps.`);
}

async function main(): Promise<void> {
  await seed();
  await disconnectPrisma();
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
