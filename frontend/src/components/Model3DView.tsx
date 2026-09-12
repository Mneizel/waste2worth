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
  /** the finished product's art (the same drawing used elsewhere, so front
   * and back genuinely show the real shape instead of a generic bottle) */
  front: ReactNode;
  title: string;
}

/** A draggable pseudo-3D turntable of the finished project (no external model). */
export function Model3DView({ front, title }: Props) {
  const [angle, setAngle] = useState(-26);
  const lastX = useRef<number | null>(null);

  function start(x: number) {
    lastX.current = x;
  }
  function drag(x: number) {
    if (lastX.current === null) return;
    const dx = x - lastX.current;
    lastX.current = x;
    setAngle((a) => a + dx * 0.7);
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
    if (e.key === 'ArrowLeft') setAngle((a) => a - 20);
    if (e.key === 'ArrowRight') setAngle((a) => a + 20);
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
          style={{ transform: `rotateX(-12deg) rotateY(${angle}deg)` }}
        >
          <div className="m3d__face m3d__face--front">{front}</div>
          <div className="m3d__face m3d__face--back" aria-hidden>
            {front}
          </div>
          <div className="m3d__face m3d__face--left" aria-hidden />
          <div className="m3d__face m3d__face--right" aria-hidden />
        </div>
        <div className="m3d__floor" aria-hidden />
      </div>
      <p className="m3d__hint">اسحب لتدوير النموذج، وقارنه مع اللي بين إيديك</p>
    </div>
  );
}
