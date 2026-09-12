import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

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
class FakeSpeechSynthesis {
  getVoices(): SpeechSynthesisVoice[] {
    return [{ lang: 'ar-SA', name: 'Arabic Test Voice' } as SpeechSynthesisVoice];
  }
  speak(u: FakeUtterance) {
    setTimeout(() => u.onend?.(), 0);
  }
  cancel() {
    /* no queue to clear in the fake */
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

afterEach(() => {
  cleanup();
  resetApiMock();
  vi.unstubAllGlobals();
  try {
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
});
