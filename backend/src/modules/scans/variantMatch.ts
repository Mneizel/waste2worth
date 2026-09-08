/** Pure helpers for turning a volume guess into catalogue variants. */

export interface VolumeLike {
  volumeMl: number;
}

export interface AlternativeCandidate {
  id: string;
  volumeMl: number;
  sortOrder: number;
}

/** The variant whose volume is closest to `targetVolumeMl`. */
export function findNearestVariant<T extends VolumeLike>(
  variants: readonly T[],
  targetVolumeMl: number,
): T | null {
  if (variants.length === 0) {
    return null;
  }
  let best = variants[0]!;
  let bestDelta = Math.abs(best.volumeMl - targetVolumeMl);
  for (let i = 1; i < variants.length; i += 1) {
    const candidate = variants[i]!;
    const delta = Math.abs(candidate.volumeMl - targetVolumeMl);
    if (delta < bestDelta) {
      best = candidate;
      bestDelta = delta;
    }
  }
  return best;
}

/**
 * Up to `limit` suggestions to offer after the user rejects a guess. When a
 * volume is known they are ordered by closeness to it, otherwise by `sortOrder`.
 */
export function pickAlternatives<T extends AlternativeCandidate>(
  candidates: readonly T[],
  opts: { excludeId?: string; nearVolumeMl?: number | null; limit?: number } = {},
): T[] {
  const limit = opts.limit ?? 3;
  const pool = candidates.filter((candidate) => candidate.id !== opts.excludeId);
  const near = opts.nearVolumeMl;
  const sorted =
    near != null
      ? [...pool].sort(
          (a, b) => Math.abs(a.volumeMl - near) - Math.abs(b.volumeMl - near),
        )
      : [...pool].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted.slice(0, limit);
}
