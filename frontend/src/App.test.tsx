import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { imageFile, renderApp } from './test/render';

vi.mock('./lib/api', async () => {
  const m = await import('./test/apiMock');
  return { api: m.apiMock, mediaUrl: m.mediaUrl, ApiError: m.ApiError };
});

describe('App routing', () => {
  it('redirects unknown routes to the upload screen', async () => {
    renderApp('/totally/unknown/path');
    expect(
      await screen.findByRole('heading', { name: /صوّر أو ارفع صورة القنينة/ }),
    ).toBeInTheDocument();
  });

  it('walks the full happy path and supports going back', async () => {
    const { user, container } = renderApp('/');

    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [imageFile()] },
    });
    await user.click(screen.getByRole('button', { name: /حلّل الصورة/ }));

    await user.click(await screen.findByRole('button', { name: /أيوا، صح/ }));

    await user.click(
      await screen.findByRole('button', { name: /Self-watering planter/ }),
    );

    await screen.findByRole('heading', { name: 'Self-watering planter' });
    await user.click(screen.getByRole('button', { name: 'رجوع للأفكار' }));

    expect(
      await screen.findByRole('heading', { name: /أفكار لإعادة التدوير/ }),
    ).toBeInTheDocument();
  });
});
