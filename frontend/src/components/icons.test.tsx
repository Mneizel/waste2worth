import { render } from '@testing-library/react';
import { createElement } from 'react';

import * as Icons from './icons';
import {
  Bottle,
  Leaf,
  Marker,
  Nail,
  Scissors,
  StringIcon,
  Tape,
  Wrench,
  toolIcon,
} from './icons';

describe('icons', () => {
  it('every icon component renders', () => {
    for (const [name, Comp] of Object.entries(Icons)) {
      if (name === 'toolIcon') continue;
      const { unmount } = render(createElement(Comp as React.FC));
      unmount();
    }
  });

  it('honours a custom size and a default size', () => {
    const { container, rerender } = render(<Bottle />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '24');
    rerender(<Bottle size={12} />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '12');
  });

  it('maps tool names to icons, falling back to a wrench', () => {
    expect(toolIcon('Scissors or craft knife')).toBe(Scissors);
    expect(toolIcon('قطعة خيط')).toBe(StringIcon);
    expect(toolIcon('Marker pen')).toBe(Marker);
    expect(toolIcon('Sticky tape')).toBe(Tape);
    expect(toolIcon('A thin nail')).toBe(Nail);
    expect(toolIcon('Potting soil')).toBe(Leaf);
    expect(toolIcon('Mystery contraption')).toBe(Wrench);
  });
});
