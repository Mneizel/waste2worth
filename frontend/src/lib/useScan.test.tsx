import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { apiMock, mockApiFailure } from '../test/apiMock';
import { imageFile } from '../test/render';
import { useScan } from './useScan';

vi.mock('./api', async () => {
  const m = await import('../test/apiMock');
  return { api: m.apiMock, mediaUrl: m.mediaUrl, ApiError: m.ApiError };
});

function Harness({ id }: { id?: string }) {
  const { scan, loading, error, reload } = useScan(id);
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error ?? ''}</span>
      <span data-testid="scan">{scan?.id ?? ''}</span>
      <button onClick={() => void reload()}>reload</button>
    </div>
  );
}

function renderHook(id: string | undefined, state?: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/scan/x/confirm', state }]}>
      <Harness id={id} />
    </MemoryRouter>,
  );
}

async function seedScan(): Promise<string> {
  const scan = await apiMock.createScan(imageFile(), '500');
  return scan.id;
}

describe('useScan', () => {
  it('uses a scan seeded through router state without fetching', () => {
    const spy = vi.spyOn(apiMock, 'getScan');
    renderHook('scan-1', { scan: { id: 'scan-1' } });
    expect(screen.getByTestId('scan')).toHaveTextContent('scan-1');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(spy).not.toHaveBeenCalled();
  });

  it('fetches when the seeded scan id does not match', async () => {
    const id = await seedScan();
    renderHook(id, { scan: { id: 'different' } });
    await waitFor(() => expect(screen.getByTestId('scan')).toHaveTextContent(id));
  });

  it('fetches when there is no router state', async () => {
    const id = await seedScan();
    renderHook(id);
    await waitFor(() => expect(screen.getByTestId('scan')).toHaveTextContent(id));
  });

  it('surfaces an API load error', async () => {
    renderHook('missing');
    await waitFor(() =>
      expect(screen.getByTestId('error')).not.toHaveTextContent(''),
    );
  });

  it('surfaces a generic message when the request fails outright', async () => {
    mockApiFailure('getScan', 'network');
    renderHook('boom');
    await waitFor(() =>
      expect(screen.getByTestId('error')).toHaveTextContent(/تعذّر/),
    );
  });

  it('does nothing without a scanId, even on reload', async () => {
    renderHook(undefined);
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false'),
    );
    await userEvent.click(screen.getByText('reload'));
    expect(screen.getByTestId('scan')).toHaveTextContent('');
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  it('reload re-runs the request', async () => {
    const id = await seedScan();
    const spy = vi.spyOn(apiMock, 'getScan');
    renderHook(id);
    await waitFor(() => expect(screen.getByTestId('scan')).toHaveTextContent(id));
    await userEvent.click(screen.getByText('reload'));
    await waitFor(() => expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2));
  });
});
