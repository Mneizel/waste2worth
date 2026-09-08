import { readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

import { saveScanImage } from '../../src/modules/scans/saveScanImage';

// .env.test sets UPLOAD_DIR=tests/.tmp/uploads
const uploadDir = resolve(process.cwd(), 'tests/.tmp/uploads');

describe('saveScanImage', () => {
  afterAll(async () => {
    await rm(uploadDir, { recursive: true, force: true });
  });

  it('writes the buffer and maps a known mime type to its extension', async () => {
    const buffer = Buffer.from('png-bytes');
    const saved = await saveScanImage(buffer, 'image/png');
    expect(saved.publicPath).toBe(`/uploads/${saved.filename}`);
    expect(saved.filename.endsWith('.png')).toBe(true);
    const written = await readFile(resolve(uploadDir, saved.filename));
    expect(written.equals(buffer)).toBe(true);
  });

  it('falls back to .bin for an unknown mime type', async () => {
    const saved = await saveScanImage(Buffer.from('x'), 'image/tiff');
    expect(saved.filename.endsWith('.bin')).toBe(true);
  });
});
