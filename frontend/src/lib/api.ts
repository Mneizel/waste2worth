/**
 * API entry point. The static prototype runs entirely in the browser
 * (`localApi`); set `VITE_API_MODE=remote` to talk to the real backend
 * (`httpApi`) for the production build.
 */
import * as httpApi from './httpApi';
import * as localApi from './localApi';

const impl = import.meta.env.VITE_API_MODE === 'remote' ? httpApi : localApi;

export const api = impl.api;
export const mediaUrl = impl.mediaUrl;
export const ApiError = impl.ApiError as typeof localApi.ApiError;
