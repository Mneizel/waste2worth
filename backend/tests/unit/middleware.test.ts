import type { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { z } from 'zod';

import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../../src/lib/errors';
import { errorHandler } from '../../src/middleware/errorHandler';
import { notFoundHandler } from '../../src/middleware/notFound';
import { requireAdmin } from '../../src/middleware/requireAdmin';

function mockRes() {
  const res = {} as Response & { statusCode?: number; body?: unknown };
  res.status = jest.fn().mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  }) as unknown as Response['status'];
  res.json = jest.fn().mockImplementation((payload: unknown) => {
    res.body = payload;
    return res;
  }) as unknown as Response['json'];
  res.headersSent = false;
  return res;
}

describe('errorHandler', () => {
  it('delegates to next when headers are already sent', () => {
    const res = mockRes();
    res.headersSent = true;
    const next = jest.fn() as unknown as NextFunction;
    const err = new Error('late');
    errorHandler(err, {} as Request, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  it('renders an AppError with details', () => {
    const res = mockRes();
    errorHandler(
      new BadRequestError('nope', { field: 'x' }),
      {} as Request,
      res,
      jest.fn() as unknown as NextFunction,
    );
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: { code: 'BAD_REQUEST', message: 'nope', details: { field: 'x' } },
    });
  });

  it('renders an AppError without details', () => {
    const res = mockRes();
    errorHandler(
      new NotFoundError('gone'),
      {} as Request,
      res,
      jest.fn() as unknown as NextFunction,
    );
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: { code: 'NOT_FOUND', message: 'gone' } });
  });

  it('renders a ZodError as a 400', () => {
    const res = mockRes();
    const zodErr = z.object({ a: z.string() }).safeParse({});
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const err = (zodErr as { error: unknown }).error;
    errorHandler(err, {} as Request, res, jest.fn() as unknown as NextFunction);
    expect(res.statusCode).toBe(400);
    expect((res.body as { error: { code: string } }).error.code).toBe(
      'VALIDATION_ERROR',
    );
  });

  it('renders a MulterError as a 400', () => {
    const res = mockRes();
    errorHandler(
      new MulterError('LIMIT_FILE_SIZE', 'image'),
      {} as Request,
      res,
      jest.fn() as unknown as NextFunction,
    );
    expect(res.statusCode).toBe(400);
    expect((res.body as { error: { code: string } }).error.code).toBe('UPLOAD_ERROR');
  });

  it('renders an unknown error as a 500', () => {
    const res = mockRes();
    errorHandler(
      'a string failure',
      {} as Request,
      res,
      jest.fn() as unknown as NextFunction,
    );
    expect(res.statusCode).toBe(500);
    expect((res.body as { error: { code: string } }).error.code).toBe('INTERNAL_ERROR');
    expect(console.error).toHaveBeenCalled();
  });
});

describe('notFoundHandler', () => {
  it('responds 404 with the method and url', () => {
    const res = mockRes();
    notFoundHandler(
      { method: 'GET', originalUrl: '/nope' } as Request,
      res,
    );
    expect(res.statusCode).toBe(404);
    expect((res.body as { error: { message: string } }).error.message).toContain(
      'GET /nope',
    );
  });
});

describe('requireAdmin', () => {
  function reqWith(key?: string) {
    return {
      header: (name: string) =>
        name === 'x-admin-key' ? key : undefined,
    } as unknown as Request;
  }

  it('calls next when the key matches', () => {
    const next = jest.fn() as unknown as NextFunction;
    requireAdmin(reqWith('test-admin-key'), {} as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('throws when the key is missing', () => {
    expect(() =>
      requireAdmin(reqWith(undefined), {} as Response, jest.fn() as unknown as NextFunction),
    ).toThrow(UnauthorizedError);
  });

  it('throws when the key is wrong', () => {
    expect(() =>
      requireAdmin(reqWith('wrong'), {} as Response, jest.fn() as unknown as NextFunction),
    ).toThrow(UnauthorizedError);
  });
});
