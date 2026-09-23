import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, vi } from 'vitest';

import { __setSimDelay } from '../lib/localApi';
import { resetApiMock } from './apiMock';

// jsdom does not implement object URLs.
URL.createObjectURL = () => 'blob:mock-preview';
URL.revokeObjectURL = () => undefined;

// jsdom has no speech synthesiser either. Install a working fake so the app's
// "read this aloud" buttons render and behave in every test by default;
// individual specs can `vi.stubGlobal(...)` to test the unsupported/no-voice
// branches, which `vi.unstubAllGlobals()` below undoes afterwards.
class FakeUtterance {
  lang = '';
  rate = 1;
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public text: string) {}
}
class FakeSpeechSynthesis extends EventTarget {
  speaking = false;
  getVoices(): SpeechSynthesisVoice[] {
    return [{ lang: 'ar-SA', name: 'Arabic Test Voice' } as SpeechSynthesisVoice];
  }
  speak(u: FakeUtterance) {
    this.speaking = true;
    setTimeout(() => {
      this.speaking = false;
      u.onend?.();
    }, 0);
  }
  cancel() {
    this.speaking = false;
  }
}
if (!('speechSynthesis' in window)) {
  Object.defineProperty(window, 'speechSynthesis', {
    value: new FakeSpeechSynthesis(),
    configurable: true,
  });
}
if (typeof window.SpeechSynthesisUtterance === 'undefined') {
  // @ts-expect-error -- test fake, not a full SpeechSynthesisUtterance
  window.SpeechSynthesisUtterance = FakeUtterance;
}

beforeAll(() => __setSimDelay(0));

// A fresh instance each test, so a 'voiceschanged' listener left registered
// by one test (e.g. one that never dispatches the event) can't leak into
// and fire during a later, unrelated test. Also force "no vision key"
// as the default so tests are hermetic — a real VITE_GEMINI_API_KEY in the
// developer's local .env (needed to actually run the app) must never change
// which code path a test exercises; tests that want it configured stub it
// explicitly with vi.stubEnv(...).
beforeEach(() => {
  Object.defineProperty(window, 'speechSynthesis', {
    value: new FakeSpeechSynthesis(),
    configurable: true,
  });
  vi.stubEnv('VITE_GEMINI_API_KEY', '');
});

afterEach(() => {
  cleanup();
  resetApiMock();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  try {
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
});
