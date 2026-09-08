import { z } from 'zod';

import { BadRequestError } from '../../src/lib/errors';
import { parseOrThrow } from '../../src/lib/validate';

const schema = z.object({ name: z.string().min(1) });

describe('parseOrThrow', () => {
  it('returns parsed data when valid', () => {
    expect(parseOrThrow(schema, { name: 'ok' })).toEqual({ name: 'ok' });
  });

  it('throws BadRequestError with flattened issues when invalid', () => {
    try {
      parseOrThrow(schema, { name: '' });
      throw new Error('unreachable');
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestError);
      expect((err as BadRequestError).details).toHaveProperty('fieldErrors');
    }
  });
});
