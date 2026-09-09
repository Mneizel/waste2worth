import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { ApiError, apiMock, mockApiFailure } from '../test/apiMock';
import { imageFile, renderApp } from '../test/render';

vi.mock('../lib/api', async () => {
  const m = await import('../test/apiMock');
  return { api: m.apiMock, mediaUrl: m.mediaUrl, ApiError: m.ApiError };
});

async function startAtGuide(ideaId: string, hint = '500') {
  const scan = await apiMock.createScan(imageFile(), hint);
  await apiMock.confirmScan(scan.id);
  return {
    scan,
    ...renderApp({
      pathname: `/scan/${scan.id}/idea/${ideaId}`,
      state: { scanId: scan.id },
    }),
  };
}

describe('GuidePage', () => {
  it('renders tools, materials, steps, tips, warnings and the 3D block', async () => {
    await startAtGuide('idea-planter');
    expect(
      await screen.findByRole('heading', { name: 'Self-watering planter' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/An adult should do the cutting/)).toBeInTheDocument();
    expect(screen.getByText('Scissors')).toBeInTheDocument();
    expect(screen.getByText('String')).toBeInTheDocument();
    expect(screen.getByText('Clean it')).toBeInTheDocument();
    expect(screen.getByText('Warm water helps.')).toBeInTheDocument();
    expect(screen.getByText('Adults only.')).toBeInTheDocument();
    expect(screen.getByText('١')).toBeInTheDocument();
    expect(screen.getByText('٢')).toBeInTheDocument();
    expect(screen.getByText('سهل')).toBeInTheDocument();
    expect(screen.getByText('من عمر 6+')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /نموذج ثلاثي الأبعاد للمنتج/ }),
    ).toBeInTheDocument();
  });

  it('hides the safety banner when there are no safety notes (hard difficulty)', async () => {
    await startAtGuide('idea-lamp', '1000');
    await screen.findByRole('heading', { name: 'Hanging lamp' });
    expect(document.querySelector('.gd__safety')).toBeNull();
    expect(screen.getByText('متقدّم')).toBeInTheDocument();
    expect(document.querySelector('.m3d__stage')).toBeInTheDocument();
  });

  it('shows the medium difficulty label', async () => {
    await startAtGuide('idea-feeder');
    expect(await screen.findByText('متوسط')).toBeInTheDocument();
  });

  it('hides a broken step image', async () => {
    await startAtGuide('idea-planter');
    const img = await screen.findByAltText('رسم الخطوة 1');
    fireEvent.error(img);
    expect(img).toHaveStyle({ display: 'none' });
  });

  it('still renders when recording the choice fails', async () => {
    mockApiFailure('selectIdea', 'network');
    await startAtGuide('idea-planter');
    expect(
      await screen.findByRole('heading', { name: 'Self-watering planter' }),
    ).toBeInTheDocument();
  });

  it('shows a loading state', async () => {
    const scan = await apiMock.createScan(imageFile(), '500');
    await apiMock.confirmScan(scan.id);
    vi.spyOn(apiMock, 'getIdea').mockImplementationOnce(
      () => new Promise((_r, reject) => setTimeout(() => reject(new ApiError(404, 'X', 'x')), 30)),
    );
    renderApp({
      pathname: `/scan/${scan.id}/idea/idea-planter`,
      state: { scanId: scan.id },
    });
    expect(screen.getByText('عم نحضّر الخطوات…')).toBeInTheDocument();
  });

  it('shows an error with a retry', async () => {
    mockApiFailure('getIdea', new ApiError(404, 'NOT_FOUND', 'مش موجودة'));
    const { user } = renderApp({
      pathname: '/scan/s1/idea/ghost',
      state: { scanId: 's1' },
    });
    expect(await screen.findByText('مش موجودة')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('shows a generic message when the guide request fails outright', async () => {
    mockApiFailure('getIdea', 'network');
    renderApp({ pathname: '/scan/s1/idea/idea-planter', state: { scanId: 's1' } });
    expect(await screen.findByText('تعذّر تحميل الدليل.')).toBeInTheDocument();
  });

  it('the finish button returns to the upload screen', async () => {
    const { user } = await startAtGuide('idea-planter');
    await user.click(
      await screen.findByRole('button', { name: /خلّصت! جرّب قنينة تانية/ }),
    );
    expect(
      await screen.findByRole('heading', { name: /صوّر أو ارفع صورة القنينة/ }),
    ).toBeInTheDocument();
  });

  it('the back button navigates away without crashing', async () => {
    const { user } = await startAtGuide('idea-planter');
    await screen.findByRole('heading', { name: 'Self-watering planter' });
    await user.click(screen.getByRole('button', { name: 'رجوع للأفكار' }));
  });
});
