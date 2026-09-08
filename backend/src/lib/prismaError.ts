import { Prisma } from '@prisma/client';

import { ConflictError, NotFoundError } from './errors';

/**
 * Translate the Prisma errors we care about into `AppError`s. Anything else is
 * rethrown untouched for the generic 500 path.
 */
export function mapPrismaError(err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Record not found');
    }
    if (err.code === 'P2002') {
      throw new ConflictError(
        'A record with the same unique value already exists',
        { target: err.meta?.['target'] ?? null },
      );
    }
  }
  throw err;
}

/** Run a Prisma call, converting known Prisma errors into `AppError`s. */
export async function runPrisma<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (err) {
    return mapPrismaError(err);
  }
}
