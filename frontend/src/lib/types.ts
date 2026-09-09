// Response shapes returned by the Waste 2 Worth backend.

export type ScanStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'VARIANT_SELECTED'
  | 'IDEA_SELECTED';

export interface Variant {
  id: string;
  key: string;
  categoryKey?: string;
  label: string;
  materialType: string;
  volumeMl: number;
  heightMm: number;
  diameterMm: number;
  region: string;
  typicalContents: string;
  isCommon: boolean;
  sortOrder: number;
  notes: string;
}

export interface ScanImage {
  url: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
}

export interface AiGuess {
  categoryKey: string | null;
  label: string | null;
  estimatedVolumeMl: number | null;
  confidence: number | null;
  variant: Variant | null;
}

export interface Scan {
  id: string;
  status: ScanStatus;
  image: ScanImage;
  aiGuess: AiGuess;
  confirmedVariant: Variant | null;
  selectedIdeaId: string | null;
  createdAt: string;
}

export interface RejectResult {
  scan: Scan;
  alternatives: Variant[];
}

export interface IdeaSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  minAge: number;
  thumbnailUrl: string;
  finalImageUrl: string;
}

export interface IdeaTool {
  id: string;
  kind: 'tool' | 'material';
  name: string;
  imageUrl: string;
  quantity: string;
  optional: boolean;
  note: string;
}

export interface IdeaStep {
  stepNumber: number;
  title: string;
  instruction: string;
  /** blueprint kind, drawn at runtime */
  blueprint: string;
  /** MeasureId ('' if the step has no computed measurement) */
  measure: string;
  tip: string;
  warning: string;
}

export interface IdeaDetail extends IdeaSummary {
  safetyNotes: string;
  source: string;
  model3dUrl: string;
  model3dPreviewUrl: string;
  tools: IdeaTool[];
  steps: IdeaStep[];
  variantKeys: string[];
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
}
