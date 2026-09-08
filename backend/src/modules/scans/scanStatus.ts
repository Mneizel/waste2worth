import { ConflictError } from '../../lib/errors';

export const SCAN_STATUS = {
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  VARIANT_SELECTED: 'VARIANT_SELECTED',
  IDEA_SELECTED: 'IDEA_SELECTED',
} as const;

export type ScanStatus = (typeof SCAN_STATUS)[keyof typeof SCAN_STATUS];

/** Statuses from which the item spec is settled and ideas can be shown. */
export const SPEC_SETTLED_STATUSES: ScanStatus[] = [
  SCAN_STATUS.CONFIRMED,
  SCAN_STATUS.VARIANT_SELECTED,
  SCAN_STATUS.IDEA_SELECTED,
];

export function assertStatusIn(
  current: string,
  allowed: readonly string[],
  action: string,
): void {
  if (!allowed.includes(current)) {
    throw new ConflictError(
      `Cannot ${action} while scan is in status ${current}`,
      { allowedFrom: allowed },
    );
  }
}
