import { VARIANTS } from '../data/catalogue';
import { IDEAS_AR } from '../data/content';
import { compute } from '../data/measure';
import { renderBlueprint } from './blueprintSvg';

const V500 = VARIANTS.find((v) => v.key === 'pet-water-500ml')!;
const VFAT = VARIANTS.find((v) => v.key === 'pet-water-5000ml')!;

function seq(idea: (typeof IDEAS_AR)[number], variant = V500) {
  const ops = idea.steps.map((s) => s.op);
  const fracs = idea.steps.map((s) =>
    s.measure ? compute(s.measure, variant).frac ?? null : null,
  );
  return { ops, fracs };
}

describe('renderBlueprint (stateful)', () => {
  it('draws every step of every project as a titled sheet', () => {
    for (const idea of IDEAS_AR) {
      const { ops, fracs } = seq(idea);
      idea.steps.forEach((s, index) => {
        const m = s.measure ? compute(s.measure, V500) : null;
        const svg = renderBlueprint({
          ops,
          fracs,
          index,
          title: s.title,
          project: idea.title,
          variant: V500,
          instruction: s.instruction,
          measureSentence: m?.sentence,
          measureShort: m?.short,
          tip: s.tip,
          warning: s.warning,
        });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('viewBox="0 0 640 384"');
        expect(svg).toContain(`خطوة ${toAr(index + 1)}`);
        expect(svg).toContain(s.title);
      });
    }
  });

  it('shows the "after this step" inset only when the shape changes', () => {
    const planter = IDEAS_AR.find((i) => i.slug === 'self-watering-planter')!;
    const { ops, fracs } = seq(planter);
    const at = (index: number) =>
      renderBlueprint({
        ops,
        fracs,
        index,
        title: planter.steps[index]!.title,
        project: planter.title,
        variant: V500,
        instruction: planter.steps[index]!.instruction,
      });
    // step 1 (clean) changes nothing -> no inset
    expect(at(0)).not.toContain('الشكل بعد هالخطوة');
    // step 3 (cut) severs the bottle -> inset present
    expect(at(2)).toContain('الشكل بعد هالخطوة');
  });

  it('accumulates: a later step is drawn on the already-cut workpiece', () => {
    const planter = IDEAS_AR.find((i) => i.slug === 'self-watering-planter')!;
    const { ops, fracs } = seq(planter);
    // "nest" step: the cup + funnel must already be there before the action
    const nestIdx = ops.indexOf('nest');
    const svg = renderBlueprint({
      ops,
      fracs,
      index: nestIdx,
      title: planter.steps[nestIdx]!.title,
      project: planter.title,
      variant: V500,
      instruction: planter.steps[nestIdx]!.instruction,
    });
    // marker used by the "drop it in" arrow
    expect(svg).toContain('url(#bh)');
    expect(svg).toContain('مخطط عمل');
  });

  it('renders a short-and-wide bottle (shrink-to-width branch)', () => {
    const feeder = IDEAS_AR.find((i) => i.slug === 'bird-feeder')!;
    const { ops, fracs } = seq(feeder, VFAT);
    const svg = renderBlueprint({
      ops,
      fracs,
      index: 3,
      title: feeder.steps[3]!.title,
      project: feeder.title,
      variant: VFAT,
      instruction: feeder.steps[3]!.instruction,
      measureSentence: 'جملة قياس.',
      measureShort: '٦ سم',
    });
    expect(svg).toContain('خطوة ٤');
    expect(svg).toContain('جملة قياس');
  });

  it('tolerates ops with no positions (fallback fracs, empty windows, skipped rod)', () => {
    const ops = ['cut', 'cut-bottom', 'fill-water', 'rod', 'window', 'base-hole'];
    const fracs = [null, null, null, null, null, null];
    ops.forEach((_, index) => {
      const svg = renderBlueprint({
        ops,
        fracs,
        index,
        title: `خطوة ${index}`,
        project: 'اختبار',
        variant: V500,
        instruction: 'تعليمة.',
      });
      expect(svg.startsWith('<svg')).toBe(true);
    });
  });

  it('places a window when there is a bare frac but no rods', () => {
    const svg = renderBlueprint({
      ops: ['window'],
      fracs: [0.5],
      index: 0,
      title: 'فتحة',
      project: 'اختبار',
      variant: V500,
      instruction: 'وسّع الفتحة.',
      measureShort: '٢ سم',
    });
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('draws position-less actions (seal / wick / mark-slot / fill-water on a whole bottle)', () => {
    for (const op of ['seal-edge', 'wick', 'mark-slot', 'fill-water']) {
      const svg = renderBlueprint({
        ops: [op],
        fracs: [null],
        index: 0,
        title: `خطوة ${op}`,
        project: 'اختبار',
        variant: V500,
        instruction: 'تعليمة بلا مقاس.',
      });
      expect(svg.startsWith('<svg')).toBe(true);
    }
  });
});

const AR = '٠١٢٣٤٥٦٧٨٩';
function toAr(n: number): string {
  return String(n).replace(/\d/g, (d) => AR[Number(d)]!);
}
