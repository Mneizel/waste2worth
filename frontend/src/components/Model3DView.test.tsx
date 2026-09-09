import { fireEvent, render, screen } from '@testing-library/react';

import { Model3DView } from './Model3DView';

function box(container: HTMLElement) {
  return container.querySelector('.m3d__box') as HTMLElement;
}
const angleOf = (el: HTMLElement) =>
  Number(/rotateY\((-?\d+(?:\.\d+)?)deg\)/.exec(el.style.transform)?.[1] ?? 'NaN');

describe('Model3DView', () => {
  it('renders the product image inside a labelled 3D stage', () => {
    const { container } = render(
      <Model3DView image="data:image/svg+xml,abc" title="مزهرية" />,
    );
    expect(
      screen.getByRole('img', { name: 'نموذج ثلاثي الأبعاد للمنتج: مزهرية' }),
    ).toBeInTheDocument();
    expect(container.querySelector('.m3d__face--front img')).toHaveAttribute(
      'src',
      'data:image/svg+xml,abc',
    );
    expect(angleOf(box(container))).toBe(-26);
  });

  it('rotates on mouse drag and ignores a stray mousemove', () => {
    const { container } = render(<Model3DView image="x" title="t" />);
    const stage = container.querySelector('.m3d__stage') as HTMLElement;

    fireEvent.mouseMove(stage, { clientX: 200 }); // no preceding mousedown
    expect(angleOf(box(container))).toBe(-26);

    fireEvent.mouseDown(stage, { clientX: 100 });
    fireEvent.mouseMove(stage, { clientX: 150 });
    expect(angleOf(box(container))).toBeCloseTo(-26 + 50 * 0.7);

    fireEvent.mouseUp(stage);
    fireEvent.mouseMove(stage, { clientX: 500 });
    expect(angleOf(box(container))).toBeCloseTo(9);

    fireEvent.mouseDown(stage, { clientX: 0 });
    fireEvent.mouseLeave(stage);
    fireEvent.mouseMove(stage, { clientX: 999 });
    expect(angleOf(box(container))).toBeCloseTo(9);
  });

  it('rotates on touch drag', () => {
    const { container } = render(<Model3DView image="x" title="t" />);
    const stage = container.querySelector('.m3d__stage') as HTMLElement;

    fireEvent.touchStart(stage, { touches: [{ clientX: 40 }] });
    fireEvent.touchMove(stage, { touches: [{ clientX: 60 }] });
    expect(angleOf(box(container))).toBeCloseTo(-26 + 20 * 0.7);

    fireEvent.touchEnd(stage, { touches: [] });
    // a touch event with no active touch is ignored
    fireEvent.touchStart(stage, { touches: [] });
    fireEvent.touchMove(stage, { touches: [] });
    expect(angleOf(box(container))).toBeCloseTo(-12);
  });

  it('rotates with the arrow keys and ignores other keys', () => {
    const { container } = render(<Model3DView image="x" title="t" />);
    const stage = container.querySelector('.m3d__stage') as HTMLElement;
    fireEvent.keyDown(stage, { key: 'ArrowRight' });
    expect(angleOf(box(container))).toBe(-6);
    fireEvent.keyDown(stage, { key: 'ArrowLeft' });
    expect(angleOf(box(container))).toBe(-26);
    fireEvent.keyDown(stage, { key: 'Enter' });
    expect(angleOf(box(container))).toBe(-26);
  });
});
