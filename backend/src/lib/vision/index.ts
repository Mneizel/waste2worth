import { StubVisionRecognizer } from './stubRecognizer';
import type { VisionRecognizer } from './types';

/**
 * Build the vision recogniser for the configured provider. Only "stub" exists
 * today; real providers get their own branch here when wired up.
 */
export function createVisionRecognizer(): VisionRecognizer {
  return new StubVisionRecognizer();
}

/** Shared singleton used by the request handlers. */
export const visionRecognizer: VisionRecognizer = createVisionRecognizer();
