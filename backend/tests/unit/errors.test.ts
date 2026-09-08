import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '../../src/lib/errors';

describe('errors', () => {
  it('AppError carries status, code, message and details', () => {
    const err = new AppError(418, 'TEAPOT', 'no coffee', { a: 1 });
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe('TEAPOT');
    expect(err.message).toBe('no coffee');
    expect(err.details).toEqual({ a: 1 });
  });

  it('subclasses use their defaults', () => {
    expect(new BadRequestError()).toMatchObject({ statusCode: 400, code: 'BAD_REQUEST' });
    expect(new UnauthorizedError()).toMatchObject({ statusCode: 401 });
    expect(new NotFoundError()).toMatchObject({ statusCode: 404 });
    expect(new ConflictError()).toMatchObject({ statusCode: 409 });
    expect(new UnprocessableEntityError()).toMatchObject({ statusCode: 422 });
  });

  it('subclasses accept custom messages and details', () => {
    expect(new BadRequestError('x', { f: 1 }).details).toEqual({ f: 1 });
    expect(new UnauthorizedError('nope').message).toBe('nope');
    expect(new NotFoundError('gone').message).toBe('gone');
    expect(new ConflictError('dup', { k: 2 }).details).toEqual({ k: 2 });
    expect(new UnprocessableEntityError('bad', { z: 3 }).details).toEqual({ z: 3 });
  });
});
