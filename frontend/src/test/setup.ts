import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';

import { __setSimDelay } from '../lib/localApi';
import { resetApiMock } from './apiMock';

// jsdom does not implement object URLs.
URL.createObjectURL = () => 'blob:mock-preview';
URL.revokeObjectURL = () => undefined;

beforeAll(() => __setSimDelay(0));

afterEach(() => {
  cleanup();
  resetApiMock();
  try {
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
});
