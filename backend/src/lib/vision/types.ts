/** Raw input handed to a vision recogniser. */
export interface VisionInput {
  imageBuffer: Buffer;
  mimeType: string;
  /**
   * Optional caller hint, used by the stub recogniser to make demos and tests
   * deterministic. Ignored by real providers.
   *   - "none" / "unknown"  -> simulate "could not identify"
   *   - "500" / "1500ml" / "1l" -> force an estimated volume
   */
  hint?: string | undefined;
}

/**
 * What a recogniser reports back. Deliberately free of any knowledge of our
 * catalogue — turning an observation into a concrete `ItemVariant` is the
 * scan service's job.
 */
export interface VisionObservation {
  /** Category key (e.g. "bottle"), or null when nothing supported was seen. */
  categoryKey: string | null;
  /** Human-readable description of what was seen. */
  label: string;
  /** Best guess at the item's volume in millilitres, or null. */
  estimatedVolumeMl: number | null;
  /** Confidence in [0, 1]. */
  confidence: number;
  /** Provider payload, stored verbatim for debugging. */
  raw: Record<string, unknown>;
}

export interface VisionRecognizer {
  readonly name: string;
  recognize(input: VisionInput): Promise<VisionObservation>;
}
