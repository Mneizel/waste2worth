import { AppError } from '../../src/lib/errors';
import {
  SCAN_STATUS,
  SPEC_SETTLED_STATUSES,
  assertStatusIn,
} from '../../src/modules/scans/scanStatus';

describe('assertStatusIn', () => {
  it('passes when the status is allowed', () => {
    expect(() =>
      assertStatusIn(SCAN_STATUS.CONFIRMED, SPEC_SETTLED_STATUSES, 'list ideas'),
    ).not.toThrow();
  });

  it('throws a 409 when the status is not allowed', () => {
    try {
      assertStatusIn(SCAN_STATUS.PENDING_CONFIRMATION, [SCAN_STATUS.CONFIRMED], 'confirm');
      throw new Error('should not reach');
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(409);
      expect((err as AppError).details).toEqual({
        allowedFrom: [SCAN_STATUS.CONFIRMED],
      });
    }
  });
});
