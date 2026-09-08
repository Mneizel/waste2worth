import { screen } from '@testing-library/react';
import { vi } from 'vitest';

import { ApiError, apiMock, mockApiFailure } from '../test/apiMock';
import { imageFile, renderApp } from '../test/render';

vi.mock('../lib/api', async () => {
  const m = await import('../test/apiMock');
  return { api: m.apiMock, mediaUrl: m.mediaUrl, ApiError: m.ApiError };
});

async function startAtIdeas(hint = '500') {
  const scan = await apiMock.createScan(imageFile(), hint);
  await apiMock.confirmScan(scan.id);
  return { scan, ...renderApp(`/scan/${scan.id}/ideas`) };
}

describe('IdeasPage', () => {
  it('lists ideas for the chosen size and opens one', async () => {
    const { user } = await startAtIdeas('500');
    expect(
      await screen.findByRole('button', { name: /Self-watering planter/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/20 دقيقة · سهل/)).toBeInTheDocument();
    expect(screen.getByText(/متوسط/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Self-watering planter/ }));
    expect(
      await screen.findByRole('heading', { name: 'Self-watering planter' }),
    ).toBeInTheDocument();
  });

  it('shows the advanced difficulty label', async () => {
    await startAtIdeas('1000');
    expect(await screen.findByText(/متقدّم/)).toBeInTheDocument();
  });

  it('shows a loading state', async () => {
    const scan = await apiMock.createScan(imageFile(), '500');
    await apiMock.confirmScan(scan.id);
    vi.spyOn(apiMock, 'scanIdeas').mockImplementationOnce(
      () => new Promise((r) => setTimeout(() => r([]), 30)),
    );
    renderApp(`/scan/${scan.id}/ideas`);
    expect(screen.getByText('عم نجيب الأفكار…')).toBeInTheDocument();
  });

  it('shows the server error message with a working retry', async () => {
    mockApiFailure('scanIdeas', new ApiError(500, 'X', 'ما زبط'));
    const { user } = renderApp('/scan/scan-err/ideas');
    expect(await screen.findByText('ما زبط')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('shows a generic message when the ideas request fails outright', async () => {
    mockApiFailure('scanIdeas', 'network');
    renderApp('/scan/scan-err/ideas');
    expect(await screen.findByText(/تعذّر تحميل الأفكار/)).toBeInTheDocument();
  });

  it('shows an empty state that routes home', async () => {
    const { user } = await startAtIdeas('250');
    expect(
      await screen.findByText(/ما في أفكار محفوظة لهذا الحجم بعد/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ابدأ من جديد' }));
    expect(
      await screen.findByRole('heading', { name: /صوّر أو ارفع صورة القنينة/ }),
    ).toBeInTheDocument();
  });
});
