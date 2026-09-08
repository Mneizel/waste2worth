import {
  CANDIDATE_VOLUMES_ML,
  StubVisionRecognizer,
  parseHint,
} from '../../src/lib/vision/stubRecognizer';
import { createVisionRecognizer, visionRecognizer } from '../../src/lib/vision';

describe('parseHint', () => {
  it('treats empty / missing input as "none"', () => {
    expect(parseHint(undefined)).toEqual({ kind: 'none' });
    expect(parseHint('')).toEqual({ kind: 'none' });
  });

  it('recognises the "unidentified" hints', () => {
    expect(parseHint('none')).toEqual({ kind: 'unidentified' });
    expect(parseHint('  UNKNOWN ')).toEqual({ kind: 'unidentified' });
  });

  it('parses millilitre and litre volumes', () => {
    expect(parseHint('500')).toEqual({ kind: 'volume', volumeMl: 500 });
    expect(parseHint('750 ml')).toEqual({ kind: 'volume', volumeMl: 750 });
    expect(parseHint('1l')).toEqual({ kind: 'volume', volumeMl: 1000 });
  });

  it('falls back to "none" for junk or zero', () => {
    expect(parseHint('banana')).toEqual({ kind: 'none' });
    expect(parseHint('0')).toEqual({ kind: 'none' });
  });
});

describe('StubVisionRecognizer', () => {
  const recognizer = new StubVisionRecognizer();
  const image = Buffer.from('a fixed test image payload');

  it('is deterministic for the same bytes', async () => {
    const a = await recognizer.recognize({ imageBuffer: image, mimeType: 'image/png' });
    const b = await recognizer.recognize({ imageBuffer: image, mimeType: 'image/png' });
    expect(a).toEqual(b);
    expect(a.categoryKey).toBe('bottle');
    expect(CANDIDATE_VOLUMES_ML).toContain(a.estimatedVolumeMl);
    expect(a.confidence).toBeGreaterThanOrEqual(0.7);
    expect(a.confidence).toBeLessThanOrEqual(0.95);
    expect(a.raw).toMatchObject({ provider: 'stub', hintApplied: false });
  });

  it('honours a volume hint', async () => {
    const result = await recognizer.recognize({
      imageBuffer: image,
      mimeType: 'image/png',
      hint: '333',
    });
    expect(result.estimatedVolumeMl).toBe(333);
    expect(result.label).toContain('333');
    expect(result.raw).toMatchObject({ hintApplied: true });
  });

  it('reports "not identified" for the unknown hint', async () => {
    const result = await recognizer.recognize({
      imageBuffer: image,
      mimeType: 'image/jpeg',
      hint: 'none',
    });
    expect(result.categoryKey).toBeNull();
    expect(result.estimatedVolumeMl).toBeNull();
    expect(result.confidence).toBe(0.2);
    expect(result.raw).toMatchObject({ reason: 'hint:unidentified' });
  });
});

describe('createVisionRecognizer', () => {
  it('builds a stub recogniser', () => {
    expect(createVisionRecognizer()).toBeInstanceOf(StubVisionRecognizer);
    expect(visionRecognizer.name).toBe('stub');
  });
});
