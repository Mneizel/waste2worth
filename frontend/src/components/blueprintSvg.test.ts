import { VARIANTS } from '../data/catalogue';
import { renderBlueprint, type BlueprintKind } from './blueprintSvg';

const V500 = VARIANTS.find((v) => v.key === 'pet-water-500ml')!;
const VFAT = VARIANTS.find((v) => v.key === 'pet-water-5000ml')!;

const ALL: BlueprintKind[] = [
  'clean',
  'measure-mark',
  'cut-around',
  'cut-window',
  'edge',
  'holes-body',
  'holes-cap',
  'thread',
  'insert-rod',
  'invert',
  'nest',
  'fill-soil',
  'fill-water',
  'decorate',
  'hang',
  'stand',
  'generic',
];

describe('renderBlueprint', () => {
  it('draws a titled SVG sheet for every blueprint kind', () => {
    for (const kind of ALL) {
      const svg = renderBlueprint({
        kind,
        stepNumber: 3,
        title: `عنوان ${kind}`,
        project: 'مشروع',
        variant: V500,
        instruction: 'تعليمة قصيرة.',
      });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('خطوة ٣');
      expect(svg).toContain(`عنوان ${kind}`);
      expect(svg).toContain('viewBox="0 0 520 340"');
    }
  });

  it('renders the measurement, tip and warning notes plus a positioned feature', () => {
    const svg = renderBlueprint({
      kind: 'cut-around',
      stepNumber: 2,
      title: 'اقصّ',
      project: 'مزهرية',
      variant: V500,
      instruction:
        'هاي تعليمة طويلة كفاية لتتلفّ على أكثر من سطر داخل عمود الملاحظات بالمخطّط.',
      measureSentence: 'علّم على ٧٫٦ سم من الغطا لهاي القنينة.',
      measureShort: '٧٫٦ سم',
      frac: 0.36,
      tip: 'نصيحة مفيدة.',
      warning: 'انتبه، القصّ للكبار.',
    });
    expect(svg).toContain('٧٫٦ سم من الغطا');
    expect(svg).toContain('نصيحة مفيدة');
    expect(svg).toContain('انتبه');
    expect(svg).toContain('على أكثر من سطر');
  });

  it('handles the cap detail kind and a short-and-wide bottle', () => {
    const cap = renderBlueprint({
      kind: 'holes-cap',
      stepNumber: 1,
      title: 'اثقب الغطا',
      project: 'رشّاشة',
      variant: V500,
      instruction: 'اثقب الغطا.',
    });
    expect(cap.startsWith('<svg')).toBe(true);

    const fat = renderBlueprint({
      kind: 'fill-water',
      stepNumber: 4,
      title: 'عبّي',
      project: 'مزهرية',
      variant: VFAT,
      instruction: 'عبّي الماء.',
      measureShort: '٦ سم',
      frac: 0.7,
    });
    expect(fat).toContain('خطوة ٤');
  });
});
