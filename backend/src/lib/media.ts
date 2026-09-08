import { env } from '../config/env';

/**
 * Turn a stored media path into a URL the client can fetch.
 * Absolute URLs are returned untouched; relative paths get `baseUrl`
 * prepended (when one is configured).
 */
export function toMediaUrl(
  path: string,
  baseUrl: string = env.MEDIA_BASE_URL,
): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalised = path.startsWith('/') ? path : `/${path}`;
  if (!baseUrl) {
    return normalised;
  }
  return `${baseUrl.replace(/\/$/, '')}${normalised}`;
}
