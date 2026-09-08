import { Link } from 'react-router-dom';

import { Leaf } from './icons';
import './Header.css';

const STEPS = ['رفع الصورة', 'التأكيد', 'الأفكار', 'الدليل'];

export function Header({ step }: { step?: 1 | 2 | 3 | 4 }) {
  return (
    <header className="hdr">
      <Link to="/" className="hdr__brand">
        <span className="hdr__badge">
          <Leaf size={20} />
        </span>
        <span className="hdr__title">
          Waste&nbsp;2&nbsp;Worth
          <span className="hdr__sub">من نفاية لقيمة</span>
        </span>
      </Link>

      {step && (
        <ol className="hdr__steps" aria-label={`الخطوة ${step} من 4`}>
          {STEPS.map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3 | 4;
            const state = n < step ? 'done' : n === step ? 'now' : 'todo';
            return (
              <li key={label} className={`hdr__step hdr__step--${state}`}>
                <span className="hdr__dot">{n}</span>
                <span className="hdr__step-label">{label}</span>
              </li>
            );
          })}
        </ol>
      )}
    </header>
  );
}
