import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { renderInRouter } from '../test/render';
import { Button } from './Button';
import { Card } from './Card';
import { ErrorBanner, Loading } from './Feedback';
import { Header } from './Header';

describe('Button', () => {
  it('renders the primary variant by default and fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn).toHaveClass('btn--primary');
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports the ghost variant, block and custom class', () => {
    render(
      <Button variant="ghost" block className="x">
        Ghost
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Ghost' });
    expect(btn).toHaveClass('btn--ghost', 'btn--block', 'x');
  });

  it('shows a spinner and blocks clicks while loading', async () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    expect(container.querySelector('.btn__spin')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('respects an explicit disabled prop', () => {
    render(<Button disabled>Nope</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('Card', () => {
  it('shows the window chrome by default', () => {
    const { container } = render(<Card>body</Card>);
    expect(container.querySelectorAll('.card__chrome span')).toHaveLength(3);
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('can hide the chrome', () => {
    const { container } = render(<Card chrome={false}>body</Card>);
    expect(container.querySelector('.card__chrome')).toBeNull();
  });
});

describe('Header', () => {
  it('renders the brand and no stepper without a step', () => {
    const { container } = renderInRouter(<Header />);
    expect(screen.getByText('من نفاية لقيمة')).toBeInTheDocument();
    expect(container.querySelector('.hdr__steps')).toBeNull();
  });

  it('marks earlier steps done, the current one now, later ones todo', () => {
    const { container } = renderInRouter(<Header step={3} />);
    const steps = container.querySelectorAll('.hdr__step');
    expect(steps).toHaveLength(4);
    expect(steps[0]).toHaveClass('hdr__step--done');
    expect(steps[2]).toHaveClass('hdr__step--now');
    expect(steps[3]).toHaveClass('hdr__step--todo');
  });
});

describe('Feedback', () => {
  it('Loading uses a default and a custom label', () => {
    const { rerender } = render(<Loading />);
    expect(screen.getByText('لحظة…')).toBeInTheDocument();
    rerender(<Loading label="عم نحمّل" />);
    expect(screen.getByText('عم نحمّل')).toBeInTheDocument();
  });

  it('ErrorBanner shows the message and an optional retry', async () => {
    const onRetry = vi.fn();
    const { rerender } = render(<ErrorBanner message="فشل" />);
    expect(screen.getByRole('alert')).toHaveTextContent('فشل');
    expect(screen.queryByRole('button')).toBeNull();

    rerender(<ErrorBanner message="فشل" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
