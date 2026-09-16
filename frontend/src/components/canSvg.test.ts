import { VARIANTS } from '../data/catalogue';
import { CAN_IDEAS_AR } from '../data/canContent';
import { compute } from '../data/canMeasure';
import { renderBlueprint, renderFinalArt } from './canSvg';

const V330 = VARIANTS.find((v) => v.key === 'can-soda-330ml')!;
const VWIDE = VARIANTS.find((v) => v.key === 'can-food-large-850ml')!;
const VCOFFEE = VARIANTS.find((v) => v.key === 'can-coffee-tin-500ml')!; // exact 100 mm diameter

function seq(idea: (typeof CAN_IDEAS_AR)[number], variant = V330) {
  const ops = idea.steps.map((s) => s.op);
  const fracs = idea.steps.map((s) =>
    s.measure ? compute(s.measure, variant).frac ?? null : null,
  );
  return { ops, fracs };
}

describe('renderBlueprint (can, stateful)', () => {
  it('draws every step of every can project as a titled sheet', () => {
    for (const idea of CAN_IDEAS_AR) {
      const { ops, fracs } = seq(idea);
      idea.steps.forEach((s, index) => {
        const m = s.measure ? compute(s.measure, V330) : null;
        const svg = renderBlueprint({
          ops,
          fracs,
          index,
          title: s.title,
          project: idea.title,
          variant: V330,
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
    const organizer = CAN_IDEAS_AR.find((i) => i.slug === 'can-pencil-organizer')!;
    const { ops, fracs } = seq(organizer);
    const at = (index: number) =>
      renderBlueprint({
        ops,
        fracs,
        index,
        title: organizer.steps[index]!.title,
        project: organizer.title,
        variant: V330,
        instruction: organizer.steps[index]!.instruction,
      });
    // step 1 (clean) changes nothing -> no inset
    expect(at(0)).not.toContain('الشكل بعد هالخطوة');
    // step 2 (open the top) changes the shape -> inset present
    expect(at(1)).toContain('الشكل بعد هالخطوة');
  });

  it('renders a short-and-wide can (shrink-to-width branch)', () => {
    const bank = CAN_IDEAS_AR.find((i) => i.slug === 'can-coin-bank')!;
    const { ops, fracs } = seq(bank, VWIDE);
    const svg = renderBlueprint({
      ops,
      fracs,
      index: 1,
      title: bank.steps[1]!.title,
      project: bank.title,
      variant: VWIDE,
      instruction: bank.steps[1]!.instruction,
      measureSentence: 'جملة قياس.',
      measureShort: '٣ سم',
    });
    expect(svg).toContain('خطوة ٢');
    expect(svg).toContain('جملة قياس');
  });

  it('shows a whole-cm dimension when the size divides evenly (coffee tin, 100 mm diameter)', () => {
    const bank = CAN_IDEAS_AR.find((i) => i.slug === 'can-coin-bank')!;
    const { ops, fracs } = seq(bank, VCOFFEE);
    const svg = renderBlueprint({
      ops,
      fracs,
      index: 0,
      title: bank.steps[0]!.title,
      project: bank.title,
      variant: VCOFFEE,
      instruction: bank.steps[0]!.instruction,
    });
    expect(svg).toContain('١٠ سم');
  });

  it('draws position-less actions with no measurement given', () => {
    for (const op of ['punch-holes', 'mark-holes', 'mark-slot']) {
      const svg = renderBlueprint({
        ops: [op],
        fracs: [null],
        index: 0,
        title: `خطوة ${op}`,
        project: 'اختبار',
        variant: V330,
        instruction: 'تعليمة بلا مقاس.',
      });
      expect(svg.startsWith('<svg')).toBe(true);
    }
  });
});

describe('renderFinalArt (can)', () => {
  it('draws the final state for every can project', () => {
    for (const idea of CAN_IDEAS_AR) {
      const { ops, fracs } = seq(idea);
      const svg = renderFinalArt({ ops, fracs, variant: V330, title: idea.title });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain(idea.title);
    }
  });

  it('handles a short-and-wide can', () => {
    const bank = CAN_IDEAS_AR.find((i) => i.slug === 'can-coin-bank')!;
    const { ops, fracs } = seq(bank, VWIDE);
    const svg = renderFinalArt({ ops, fracs, variant: VWIDE, title: bank.title });
    expect(svg.startsWith('<svg')).toBe(true);
  });
});

const AR = '٠١٢٣٤٥٦٧٨٩';
function toAr(n: number): string {
  return String(n).replace(/\d/g, (d) => AR[Number(d)]!);
}
