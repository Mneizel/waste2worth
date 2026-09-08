import type { ZodTypeAny, z } from 'zod';

import { BadRequestError } from './errors';

/** Parse `data` with `schema`, or throw a 400 with the flattened Zod issues. */
export function parseOrThrow<T extends ZodTypeAny>(
  schema: T,
  data: unknown,
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new BadRequestError('Request validation failed', result.error.flatten());
  }
  return result.data;
}
