import { fireEvent, render, screen } from '@testing-library/react';

import { Model3DView } from './Model3DView';

function box(container: HTMLElement) {
  return container.querySelector('.m3d__box') as HTMLElement;
}
const angleOf = (el: HTMLElement) =>
  Number(/rotateY\((-?\d+(?:\.\d+)?)deg\)/.exec(el.style.transform)?.[1] ?? 'NaN');

describe('Model3DView', () => {
  it('renders the front content once inside a labelled, tiltable stage', () => {
    const { container } = render(
      <Model3DView front={<span data-testid="art">فن</span>} title="مزهرية" />,
    );
    expect(
      screen.getByRole('img', { name: 'نموذج ثلاثي الأبعاد للمنتج: مزهرية' }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('[data-testid="art"]')).toHaveLength(1);
    expect(angleOf(box(container))).toBe(-18);
  });

  it('tilts on mouse drag and ignores a stray mousemove', () => {
    const { container } = render(<Model3DView front={null} title="t" />);
    const stage = container.querySelector('.m3d__stage') as HTMLElement;

    fireEvent.mouseMove(stage, { clientX: 200 }); // no preceding mousedown
    expect(angleOf(box(container))).toBe(-18);

    fireEvent.mouseDown(stage, { clientX: 100 });
    fireEvent.mouseMove(stage, { clientX: 150 });
    expect(angleOf(box(container))).toBeCloseTo(-18 + 50 * 0.5);

    fireEvent.mouseUp(stage);
    fireEvent.mouseMove(stage, { clientX: 500 });
    expect(angleOf(box(container))).toBeCloseTo(7);

    fireEvent.mouseDown(stage, { clientX: 0 });
    fireEvent.mouseLeave(stage);
    fireEvent.mouseMove(stage, { clientX: 999 });
    expect(angleOf(box(container))).toBeCloseTo(7);
  });

  it('tilts on touch drag', () => {
    const { container } = render(<Model3DView front={null} title="t" />);
    const stage = container.querySelector('.m3d__stage') as HTMLElement;

    fireEvent.touchStart(stage, { touches: [{ clientX: 40 }] });
    fireEvent.touchMove(stage, { touches: [{ clientX: 60 }] });
    expect(angleOf(box(container))).toBeCloseTo(-18 + 20 * 0.5);

    fireEvent.touchEnd(stage, { touches: [] });
    // a touch event with no active touch is ignored
    fireEvent.touchStart(stage, { touches: [] });
    fireEvent.touchMove(stage, { touches: [] });
    expect(angleOf(box(container))).toBeCloseTo(-8);
  });

  it('tilts with the arrow keys and ignores other keys', () => {
    const { container } = render(<Model3DView front={null} title="t" />);
    const stage = container.querySelector('.m3d__stage') as HTMLElement;
    fireEvent.keyDown(stage, { key: 'ArrowRight' });
    expect(angleOf(box(container))).toBe(-4);
    fireEvent.keyDown(stage, { key: 'ArrowLeft' });
    expect(angleOf(box(container))).toBe(-18);
    fireEvent.keyDown(stage, { key: 'Enter' });
    expect(angleOf(box(container))).toBe(-18);
  });

  it('never flips past the tilt limits, in either direction', () => {
    const { container } = render(<Model3DView front={null} title="t" />);
    const stage = container.querySelector('.m3d__stage') as HTMLElement;

    fireEvent.mouseDown(stage, { clientX: 0 });
    fireEvent.mouseMove(stage, { clientX: 5000 }); // way past the +42 cap
    expect(angleOf(box(container))).toBe(42);
    fireEvent.mouseUp(stage);

    fireEvent.mouseDown(stage, { clientX: 0 });
    fireEvent.mouseMove(stage, { clientX: -5000 }); // way past the -42 cap
    expect(angleOf(box(container))).toBe(-42);
  });
});
