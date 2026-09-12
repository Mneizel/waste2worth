import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SpeakButton } from './SpeakButton';

describe('SpeakButton', () => {
  it('renders nothing when speech is unsupported', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    const { container } = render(<SpeakButton text="مرحبا" />);
    expect(container).toBeEmptyDOMElement();
  });

  // These use fake timers + fireEvent (not userEvent) so the fake speech
  // synthesiser's "finished speaking" callback only fires when WE advance
  // the clock, instead of racing userEvent's own internal awaits.
  describe('while playing', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('reads the text aloud on tap, then flips back when it finishes', () => {
      render(<SpeakButton text="هاي تعليمة الخطوة." label="اسمع الخطوة" />);
      const btn = screen.getByRole('button', { name: 'اسمع الخطوة' });
      expect(btn).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(btn);
      expect(btn).toHaveAttribute('aria-pressed', 'true');

      act(() => vi.advanceTimersByTime(10));
      expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    it('stops speaking when tapped again while playing', () => {
      render(<SpeakButton text="نص طويل." size="sm" />);
      const btn = screen.getByRole('button', { name: 'اسمعها' });

      fireEvent.click(btn);
      expect(btn).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(btn);
      expect(btn).toHaveAttribute('aria-pressed', 'false');
    });
  });
});
