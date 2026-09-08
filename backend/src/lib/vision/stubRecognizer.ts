import { createHash } from 'node:crypto';

import type { VisionInput, VisionObservation, VisionRecognizer } from './types';

/** Plausible bottle volumes the stub picks between when there is no hint. */
export const CANDIDATE_VOLUMES_ML = [250, 330, 500, 600, 750, 1000, 1500];

type ParsedHint =
  | { kind: 'none' }
  | { kind: 'unidentified' }
  | { kind: 'volume'; volumeMl: number };

export function parseHint(hint: string | undefined): ParsedHint {
  if (!hint) {
    return { kind: 'none' };
  }
  const trimmed = hint.trim().toLowerCase();
  if (trimmed === 'none' || trimmed === 'unknown') {
    return { kind: 'unidentified' };
  }
  const match = trimmed.match(/^(\d+)\s*(ml|l)?$/);
  if (match) {
    const value = Number(match[1]);
    const volumeMl = match[2] === 'l' ? value * 1000 : value;
    if (volumeMl > 0) {
      return { kind: 'volume', volumeMl };
    }
  }
  return { kind: 'none' };
}

/**
 * Deterministic, offline stand-in for a real vision model. The same image bytes
 * always produce the same observation, which keeps demos predictable and tests
 * exact. Swap this out for a real provider later without touching callers.
 */
export class StubVisionRecognizer implements VisionRecognizer {
  readonly name = 'stub';

  async recognize(input: VisionInput): Promise<VisionObservation> {
    const hint = parseHint(input.hint);
    const digest = createHash('sha256').update(input.imageBuffer).digest();

    if (hint.kind === 'unidentified') {
      return {
        categoryKey: null,
        label: 'Object could not be identified',
        estimatedVolumeMl: null,
        confidence: 0.2,
        raw: {
          provider: 'stub',
          reason: 'hint:unidentified',
          sha256: digest.toString('hex'),
          mimeType: input.mimeType,
        },
      };
    }

    const volume =
      hint.kind === 'volume'
        ? hint.volumeMl
        : CANDIDATE_VOLUMES_ML[digest[0]! % CANDIDATE_VOLUMES_ML.length]!;
    // Deterministic pseudo-confidence in [0.70, 0.95].
    const confidence = Number((0.7 + (digest[1]! % 26) / 100).toFixed(2));

    return {
      categoryKey: 'bottle',
      label: `Plastic bottle, about ${volume} ml`,
      estimatedVolumeMl: volume,
      confidence,
      raw: {
        provider: 'stub',
        sha256: digest.toString('hex'),
        mimeType: input.mimeType,
        hintApplied: hint.kind === 'volume',
      },
    };
  }
}
