import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { env } from '../../config/env';

const MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'image/heif': '.heif',
};

export interface SavedImage {
  filename: string;
  /** Path the API exposes; served by the `/uploads` static mount. */
  publicPath: string;
}

/** Persist an uploaded scan photo to `UPLOAD_DIR` under a unique name. */
export async function saveScanImage(
  buffer: Buffer,
  mimeType: string,
): Promise<SavedImage> {
  const extension = MIME_EXTENSION[mimeType] ?? '.bin';
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  const directory = resolve(process.cwd(), env.UPLOAD_DIR);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, filename), buffer);
  return { filename, publicPath: `/uploads/${filename}` };
}
