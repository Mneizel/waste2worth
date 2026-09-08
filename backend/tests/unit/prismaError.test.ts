import { Prisma } from '@prisma/client';

import {
  ConflictError,
  NotFoundError,
} from '../../src/lib/errors';
import { mapPrismaError, runPrisma } from '../../src/lib/prismaError';

function knownError(code: string, meta?: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError('boom', {
    code,
    clientVersion: 'test',
    meta,
  });
}

describe('mapPrismaError', () => {
  it('maps P2025 to NotFoundError', () => {
    expect(() => mapPrismaError(knownError('P2025'))).toThrow(NotFoundError);
  });

  it('maps P2002 to ConflictError with the target', () => {
    try {
      mapPrismaError(knownError('P2002', { target: ['slug'] }));
      throw new Error('unreachable');
    } catch (err) {
      expect(err).toBeInstanceOf(ConflictError);
      expect((err as ConflictError).details).toEqual({ target: ['slug'] });
    }
  });

  it('maps P2002 without meta to a null target', () => {
    try {
      mapPrismaError(knownError('P2002'));
      throw new Error('unreachable');
    } catch (err) {
      expect((err as ConflictError).details).toEqual({ target: null });
    }
  });

  it('rethrows other known Prisma error codes', () => {
    const err = knownError('P2003');
    expect(() => mapPrismaError(err)).toThrow(err);
  });

  it('rethrows non-Prisma errors untouched', () => {
    const err = new Error('plain');
    expect(() => mapPrismaError(err)).toThrow(err);
  });
});

describe('runPrisma', () => {
  it('returns the operation result on success', async () => {
    await expect(runPrisma(async () => 42)).resolves.toBe(42);
  });

  it('translates a thrown Prisma error', async () => {
    await expect(
      runPrisma(async () => {
        throw knownError('P2025');
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
