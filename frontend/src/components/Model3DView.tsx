import {
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type TouchEvent,
} from 'react';

import './Model3DView.css';

interface Props {
  /** the finished product's art (the same drawing used elsewhere, so it
   * genuinely shows the real shape instead of a generic bottle) */
  front: ReactNode;
  title: string;
}

const MAX_TILT = 42;
const clamp = (a: number) => Math.max(-MAX_TILT, Math.min(MAX_TILT, a));

/**
 * A draggable tilt card of the finished project (no external model).
 *
 * This deliberately does NOT build a spinning cube out of backface-visibility
 * faces — that combination (hidden backfaces + a clipped, rounded, embedded
 * SVG on each face) is a known source of blank/glitchy rendering on some
 * mobile GPUs. Constraining the rotation to a tilt range means the content
 * never needs a "back" state at all, so there is nothing that can render
 * broken: what you see is always the real front art, just angled.
 */
export function Model3DView({ front, title }: Props) {
  const [angle, setAngle] = useState(-18);
  const lastX = useRef<number | null>(null);

  function start(x: number) {
    lastX.current = x;
  }
  function drag(x: number) {
    if (lastX.current === null) return;
    const dx = x - lastX.current;
    lastX.current = x;
    setAngle((a) => clamp(a + dx * 0.5));
  }
  function end() {
    lastX.current = null;
  }

  function onMouseDown(e: MouseEvent<HTMLDivElement>) {
    start(e.clientX);
  }
  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    drag(e.clientX);
  }
  function onTouchStart(e: TouchEvent<HTMLDivElement>) {
    const t = e.touches[0];
    if (t) start(t.clientX);
  }
  function onTouchMove(e: TouchEvent<HTMLDivElement>) {
    const t = e.touches[0];
    if (t) drag(t.clientX);
  }
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft') setAngle((a) => clamp(a - 14));
    if (e.key === 'ArrowRight') setAngle((a) => clamp(a + 14));
  }

  return (
    <div className="m3d">
      <div
        className="m3d__stage"
        role="img"
        aria-label={`نموذج ثلاثي الأبعاد للمنتج: ${title}`}
        tabIndex={0}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={end}
        onKeyDown={onKey}
      >
        <div
          className="m3d__box"
          style={{ transform: `rotateX(8deg) rotateY(${angle}deg)` }}
        >
          <div className="m3d__face">{front}</div>
        </div>
        <div className="m3d__floor" aria-hidden />
      </div>
      <p className="m3d__hint">اسحب لتميل النموذج، وقارنه مع اللي بين إيديك</p>
    </div>
  );
}
