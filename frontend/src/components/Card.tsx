import type { ReactNode } from 'react';

import './Card.css';

interface CardProps {
  children: ReactNode;
  chrome?: boolean;
  className?: string;
}

export function Card({ children, chrome = true, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {chrome && (
        <div className="card__chrome" aria-hidden>
          <span style={{ background: 'var(--dot-a)' }} />
          <span style={{ background: 'var(--dot-b)' }} />
          <span style={{ background: 'var(--dot-c)' }} />
        </div>
      )}
      <div className="card__body">{children}</div>
    </div>
  );
}
