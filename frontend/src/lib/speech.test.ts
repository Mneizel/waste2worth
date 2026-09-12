import { afterEach, describe, expect, it, vi } from 'vitest';

import { speak, speechSupported, stopSpeaking } from './speech';

describe('speech', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports support when the browser has the APIs', () => {
    expect(speechSupported()).toBe(true);
  });

  it('reports no support when speechSynthesis is missing', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    expect(speechSupported()).toBe(false);
  });

  it('reports no support when SpeechSynthesisUtterance is missing', () => {
    vi.stubGlobal('SpeechSynthesisUtterance', undefined);
    expect(speechSupported()).toBe(false);
  });

  it('does nothing when unsupported', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    const onEnd = vi.fn();
    expect(() => speak('مرحبا', onEnd)).not.toThrow();
    expect(onEnd).not.toHaveBeenCalled();
    expect(() => stopSpeaking()).not.toThrow();
  });

  it('speaks with an Arabic voice when one is available, and calls onEnd', async () => {
    const cancelSpy = vi.spyOn(window.speechSynthesis, 'cancel');
    const onEnd = vi.fn();
    speak('هاي جملة تجريبية.', onEnd);
    expect(cancelSpy).toHaveBeenCalled();
    await new Promise((r) => setTimeout(r, 5));
    expect(onEnd).toHaveBeenCalled();
  });

  it('still speaks without crashing when no Arabic voice is installed', () => {
    vi.spyOn(window.speechSynthesis, 'getVoices').mockReturnValue([]);
    expect(() => speak('بدون صوت عربي متاح.')).not.toThrow();
  });

  it('speaks with no onEnd callback given', () => {
    expect(() => speak('بدون رد نداء.')).not.toThrow();
  });

  it('stopSpeaking cancels the current utterance', () => {
    const cancelSpy = vi.spyOn(window.speechSynthesis, 'cancel');
    stopSpeaking();
    expect(cancelSpy).toHaveBeenCalled();
  });
});
