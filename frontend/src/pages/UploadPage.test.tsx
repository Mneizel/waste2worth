import { fireEvent, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { ApiError, mockApiFailure } from '../test/apiMock';
import { renderApp, renderInRouter } from '../test/render';
import { UploadPage } from './UploadPage';

vi.mock('../lib/api', async () => {
  const m = await import('../test/apiMock');
  return { api: m.apiMock, mediaUrl: m.mediaUrl, ApiError: m.ApiError };
});

function fileInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}
function dropZone(container: HTMLElement): HTMLElement {
  return container.querySelector('.drop') as HTMLElement;
}
function bigImage(): File {
  return new File([new ArrayBuffer(9 * 1024 * 1024)], 'huge.png', { type: 'image/png' });
}
function goodImage(): File {
  return new File([new Uint8Array([1, 2, 3])], 'bottle.png', { type: 'image/png' });
}

describe('UploadPage', () => {
  it('rejects a non-image file', () => {
    const { container } = renderInRouter(<UploadPage />);
    fireEvent.change(fileInput(container), {
      target: { files: [new File(['x'], 'note.txt', { type: 'text/plain' })] },
    });
    expect(screen.getByText(/لازم تكون صورة/)).toBeInTheDocument();
  });

  it('rejects an oversized image', () => {
    const { container } = renderInRouter(<UploadPage />);
    fireEvent.change(fileInput(container), { target: { files: [bigImage()] } });
    expect(screen.getByText(/كبيرة كتير/)).toBeInTheDocument();
  });

  it('ignores an empty file selection', () => {
    const { container } = renderInRouter(<UploadPage />);
    fireEvent.change(fileInput(container), { target: { files: [] } });
    expect(screen.queryByText(/لازم تكون صورة/)).toBeNull();
  });

  it('asks for an image when analyse is pressed with nothing chosen', () => {
    renderInRouter(<UploadPage />);
    fireEvent.click(screen.getByRole('button', { name: /حلّل الصورة/ }));
    expect(screen.getByText('اختَر صورة أول.')).toBeInTheDocument();
  });

  it('previews a valid image and can clear it', () => {
    const { container } = renderInRouter(<UploadPage />);
    fireEvent.change(fileInput(container), { target: { files: [goodImage()] } });
    expect(screen.getByAltText('الصورة المختارة')).toHaveAttribute(
      'src',
      'blob:mock-preview',
    );
    expect(screen.getByText('bottle.png')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'تغيير' }));
    expect(screen.queryByText('bottle.png')).toBeNull();
  });

  it('handles drag-over, drag-leave and drop', () => {
    const { container } = renderInRouter(<UploadPage />);
    const zone = dropZone(container);
    fireEvent.dragOver(zone);
    expect(zone).toHaveClass('drop--over');
    fireEvent.dragLeave(zone);
    expect(zone).not.toHaveClass('drop--over');
    fireEvent.drop(zone, { dataTransfer: { files: [goodImage()] } });
    expect(screen.getByText('bottle.png')).toBeInTheDocument();
    // dropping a second file replaces the first (revokes the old preview URL)
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    fireEvent.drop(zone, {
      dataTransfer: { files: [new File([new Uint8Array([9])], 'second.png', { type: 'image/png' })] },
    });
    expect(screen.getByText('second.png')).toBeInTheDocument();
    expect(revoke).toHaveBeenCalledWith('blob:mock-preview');
  });

  it('drop with no files does nothing', () => {
    const { container } = renderInRouter(<UploadPage />);
    fireEvent.drop(dropZone(container), { dataTransfer: { files: [] } });
    expect(screen.queryByText(/لازم تكون صورة/)).toBeNull();
  });

  it('opens the file dialog on click and on Enter/Space only', () => {
    const { container } = renderInRouter(<UploadPage />);
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const zone = dropZone(container);
    fireEvent.click(zone);
    fireEvent.keyDown(zone, { key: 'Enter' });
    fireEvent.keyDown(zone, { key: ' ' });
    fireEvent.keyDown(zone, { key: 'a' });
    expect(clickSpy).toHaveBeenCalledTimes(3);
  });

  it('toggles the testing-hint field', () => {
    renderInRouter(<UploadPage />);
    expect(screen.queryByPlaceholderText('مثال: 500')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /وضع الاختبار/ }));
    fireEvent.change(screen.getByPlaceholderText('مثال: 500'), {
      target: { value: '750' },
    });
    expect(screen.getByPlaceholderText('مثال: 500')).toHaveValue('750');
    fireEvent.click(screen.getByRole('button', { name: /وضع الاختبار/ }));
    expect(screen.queryByPlaceholderText('مثال: 500')).toBeNull();
  });

  it('uploads and moves to the confirm screen', async () => {
    const { container, user } = renderApp('/');
    fireEvent.change(fileInput(container), { target: { files: [goodImage()] } });
    await user.click(screen.getByRole('button', { name: /حلّل الصورة/ }));
    expect(
      await screen.findByRole('heading', { name: /هاي .*؟/ }),
    ).toBeInTheDocument();
  });

  it('shows a generic error when the upload fails outright', async () => {
    mockApiFailure('createScan', 'network');
    const { container } = renderInRouter(<UploadPage />);
    fireEvent.change(fileInput(container), { target: { files: [goodImage()] } });
    fireEvent.click(screen.getByRole('button', { name: /حلّل الصورة/ }));
    expect(await screen.findByText(/ما قدرنا نرفع الصورة/)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /حلّل الصورة/ })).not.toBeDisabled(),
    );
  });

  it('shows the API message when the upload is rejected', async () => {
    mockApiFailure('createScan', new ApiError(400, 'BAD_REQUEST', 'صورة غير مقبولة'));
    const { container } = renderInRouter(<UploadPage />);
    fireEvent.change(fileInput(container), { target: { files: [goodImage()] } });
    fireEvent.click(screen.getByRole('button', { name: /حلّل الصورة/ }));
    expect(await screen.findByText('صورة غير مقبولة')).toBeInTheDocument();
  });
});
