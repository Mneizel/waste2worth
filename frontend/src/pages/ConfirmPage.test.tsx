import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import type { Scan } from '../lib/types';
import { ApiError, apiMock, mockApiFailure } from '../test/apiMock';
import { imageFile, renderApp } from '../test/render';
import { ConfirmPage } from './ConfirmPage';

vi.mock('../lib/api', async () => {
  const m = await import('../test/apiMock');
  return { api: m.apiMock, mediaUrl: m.mediaUrl, ApiError: m.ApiError };
});

async function startAtConfirm(hint?: string) {
  const scan = await apiMock.createScan(imageFile(), hint);
  return { scan, ...renderApp({ pathname: `/scan/${scan.id}/confirm`, state: { scan } }) };
}

const ideasHeading = () =>
  screen.findByRole('heading', { name: /أفكار لإعادة التدوير/ });

describe('ConfirmPage', () => {
  it('confirms a recognised guess and goes to the ideas screen', async () => {
    const { user } = await startAtConfirm('500');
    expect(screen.getByRole('heading', { name: /هاي .*؟/ })).toBeInTheDocument();
    expect(document.querySelector('.cf__conf')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /أيوا، صح/ }));
    expect(await ideasHeading()).toBeInTheDocument();
  });

  it('rejects the guess, shows 3 alternatives, and picks one', async () => {
    const { user } = await startAtConfirm('500');
    await user.click(screen.getByRole('button', { name: /لأ، غلط/ }));
    const chips = await screen.findAllByRole('button', { name: /مل/ });
    expect(chips.length).toBeGreaterThanOrEqual(3);
    await user.click(chips[0]!);
    expect(await ideasHeading()).toBeInTheDocument();
  });

  it('can expand to the full size catalogue', async () => {
    const { user } = await startAtConfirm('500');
    await user.click(screen.getByRole('button', { name: /لأ، غلط/ }));
    await user.click(screen.getByRole('button', { name: /اعرض كل الأحجام/ }));
    const chips = await screen.findAllByRole('button', { name: /مل/ });
    expect(chips.length).toBeGreaterThanOrEqual(8);
  });

  it('goes straight to the size picker for an unidentified object', async () => {
    const { user } = await startAtConfirm('none');
    expect(
      screen.getByRole('heading', { name: /ما قدرنا نتعرّف على الجسم/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /أيوا، صح/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: /اعرض كل الأحجام/ }));
    const chips = await screen.findAllByRole('button', { name: /مل/ });
    await user.click(chips[2]!);
    expect(await ideasHeading()).toBeInTheDocument();
  });

  it('shows an action error when confirm fails', async () => {
    const { user } = await startAtConfirm('500');
    mockApiFailure('confirmScan', new ApiError(409, 'CONFLICT', 'مش وقتها'));
    await user.click(screen.getByRole('button', { name: /أيوا، صح/ }));
    expect(await screen.findByText('مش وقتها')).toBeInTheDocument();
  });

  it('shows an action error when reject fails', async () => {
    const { user } = await startAtConfirm('500');
    mockApiFailure('rejectScan', 'network');
    await user.click(screen.getByRole('button', { name: /لأ، غلط/ }));
    expect(await screen.findByText(/صار خطأ/)).toBeInTheDocument();
  });

  it('shows an action error when selecting a variant fails', async () => {
    const { user } = await startAtConfirm('none');
    mockApiFailure('selectVariant', new ApiError(404, 'NOT_FOUND', 'حجم غير موجود'));
    await user.click(screen.getByRole('button', { name: /اعرض كل الأحجام/ }));
    const chips = await screen.findAllByRole('button', { name: /مل/ });
    await user.click(chips[0]!);
    expect(await screen.findByText('حجم غير موجود')).toBeInTheDocument();
  });

  it('falls back gracefully when the full size list cannot load', async () => {
    const { user } = await startAtConfirm('500');
    mockApiFailure('bottleSizes', 'network');
    await user.click(screen.getByRole('button', { name: /لأ، غلط/ }));
    await user.click(screen.getByRole('button', { name: /اعرض كل الأحجام/ }));
    expect(await screen.findAllByRole('button', { name: /مل/ })).not.toHaveLength(0);
  });

  it('shows a loading state while the scan is fetched', async () => {
    const scan = await apiMock.createScan(imageFile(), '500');
    vi.spyOn(apiMock, 'getScan').mockImplementationOnce(
      () => new Promise((r) => setTimeout(() => r(scan), 30)),
    );
    renderApp(`/scan/${scan.id}/confirm`);
    expect(screen.getByText('عم نحلّل الصورة…')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /هاي .*؟/ })).toBeInTheDocument();
  });

  it('shows an error and routes home when the scan is missing', async () => {
    const { user } = renderApp('/scan/missing/confirm');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'رجوع للبداية' }));
    expect(
      await screen.findByRole('heading', { name: /صوّر أو ارفع صورة الغرض/ }),
    ).toBeInTheDocument();
  });

  it('shows the fallback message when no scan id is present', () => {
    render(
      <MemoryRouter initialEntries={['/stray']}>
        <Routes>
          <Route path="*" element={<ConfirmPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('الجلسة غير موجودة.');
  });

  it('renders without a confidence bar, volume or photo when data is sparse', () => {
    const sparse: Scan = {
      id: 'sparse',
      status: 'PENDING_CONFIRMATION',
      image: { url: '', mimeType: 'image/png', sizeBytes: 0, sha256: '' },
      aiGuess: {
        categoryKey: 'bottle',
        label: 'Plastic bottle',
        estimatedVolumeMl: null,
        confidence: null,
        variant: {
          id: 'var-x',
          key: 'x',
          categoryKey: 'bottle',
          label: 'Some bottle',
          materialType: 'PET',
          volumeMl: 500,
          heightMm: 200,
          diameterMm: 60,
          region: 'GLOBAL',
          typicalContents: 'water',
          isCommon: true,
          sortOrder: 0,
          notes: '',
        },
      },
      confirmedVariant: null,
      selectedIdeaId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    renderApp({ pathname: '/scan/sparse/confirm', state: { scan: sparse } });
    expect(screen.getByRole('heading', { name: /هاي Some bottle؟/ })).toBeInTheDocument();
    expect(document.querySelector('.cf__conf')).toBeNull();
    expect(document.querySelector('.cf__photo svg')).toBeInTheDocument();
  });
});
