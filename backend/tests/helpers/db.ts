import { prisma } from '../../src/db/prisma';

/** Wipe every table in FK-safe order. Called before each test. */
export async function resetDb(): Promise<void> {
  await prisma.scanEvent.deleteMany();
  await prisma.scan.deleteMany();
  await prisma.ideaStep.deleteMany();
  await prisma.ideaTool.deleteMany();
  await prisma.ideaVariant.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.itemVariant.deleteMany();
  await prisma.itemCategory.deleteMany();
}
