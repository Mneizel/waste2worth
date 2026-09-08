import type { NextFunction, Request, Response } from 'express';

import { asyncHandler } from '../../src/lib/asyncHandler';

describe('asyncHandler', () => {
  it('forwards a rejected promise to next()', async () => {
    const boom = new Error('boom');
    const next = jest.fn() as unknown as NextFunction;
    const handler = asyncHandler(async () => {
      throw boom;
    });
    handler({} as Request, {} as Response, next);
    await new Promise((resolve) => setImmediate(resolve));
    expect(next).toHaveBeenCalledWith(boom);
  });

  it('does not call next() on success', async () => {
    const next = jest.fn() as unknown as NextFunction;
    const handler = asyncHandler(async (_req, res) => {
      (res as unknown as { sent: boolean }).sent = true;
    });
    const res = {} as Response;
    handler({} as Request, res, next);
    await new Promise((resolve) => setImmediate(resolve));
    expect(next).not.toHaveBeenCalled();
    expect((res as unknown as { sent: boolean }).sent).toBe(true);
  });
});
