import { screen } from '@testing-library/react';
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
  it('renders tools, per-bottle steps + measurements, and the 3D block', async () => {
    const { container } = await startAtGuide('idea-planter');
    expect(
      await screen.findByRole('heading', { name: 'Self-watering planter' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/An adult should do the cutting/)).toBeInTheDocument();
    expect(screen.getByText('Scissors')).toBeInTheDocument();
    expect(screen.getByText('String')).toBeInTheDocument();
    // step titles / hints appear both in the panel and on the blueprint sheet
    expect(screen.getAllByText('Clean it').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Warm water helps.').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Adults only.').length).toBeGreaterThan(0);
    expect(screen.getByText('سهل')).toBeInTheDocument();
    expect(screen.getByText('من عمر 6+')).toBeInTheDocument();

    // one runtime blueprint SVG per step (the test fixture idea has 3)
    expect(container.querySelectorAll('.step__blueprint .bp svg')).toHaveLength(3);
    // the hero + both 3D turntable faces render the same live final-art SVG
    expect(container.querySelectorAll('.gd__hero-art .bp svg')).toHaveLength(1);
    expect(container.querySelectorAll('.m3d__face .bp svg')).toHaveLength(2);
    // step 2's cut is computed from the 210 mm test bottle -> 7.6 cm
    expect(screen.getAllByText(/٧٫٦ سم/).length).toBeGreaterThan(0);
    expect(screen.getByText(/محسوبة لـقنينتك/)).toBeInTheDocument();

    expect(
      screen.getByRole('img', { name: /نموذج ثلاثي الأبعاد للمنتج/ }),
    ).toBeInTheDocument();
  });

  it('renders a can idea with the can blueprint engine and label', async () => {
    const { container } = await startAtGuide('idea-can-organizer', 'can:330');
    expect(
      await screen.findByRole('heading', { name: 'Can organizer' }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.step__blueprint .bp svg')).toHaveLength(2);
    expect(screen.getByText(/محسوبة لـعلبتك/)).toBeInTheDocument();
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

  it('falls back to the default bottle when the scan is unavailable', async () => {
    // getIdea works, but this scan id 404s -> no confirmed variant
    renderApp({ pathname: '/scan/missing/idea/idea-planter', state: {} });
    expect(
      await screen.findByRole('heading', { name: 'Self-watering planter' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/محسوبة لـقنينتك/)).toBeInTheDocument();
  });

  it('uses the confirmed variant even before it is confirmed', async () => {
    // a scan that exists but has no confirmedVariant yet
    const scan = await apiMock.createScan(imageFile(), '500');
    renderApp({
      pathname: `/scan/${scan.id}/idea/idea-planter`,
      state: { scanId: scan.id },
    });
    expect(
      await screen.findByRole('heading', { name: 'Self-watering planter' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/محسوبة لـقنينتك/)).toBeInTheDocument();
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
      await screen.findByRole('button', { name: /خلّصت! جرّب غرض تاني/ }),
    );
    expect(
      await screen.findByRole('heading', { name: /صوّر أو ارفع صورة الغرض/ }),
    ).toBeInTheDocument();
  });

  it('the back button navigates away without crashing', async () => {
    const { user } = await startAtGuide('idea-planter');
    await screen.findByRole('heading', { name: 'Self-watering planter' });
    await user.click(screen.getByRole('button', { name: 'رجوع للأفكار' }));
  });
});
