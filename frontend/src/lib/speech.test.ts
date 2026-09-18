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

  // Many browsers report zero voices until "voiceschanged" fires once,
  // often on the very first speak of a session -- these cover the retry.
  describe('when the voice list is not ready yet', () => {
    const arabicVoice = { lang: 'ar-SA', name: 'Late Arabic Voice' } as SpeechSynthesisVoice;

    it('restarts with the Arabic voice once it becomes available mid-speech', () => {
      vi.spyOn(window.speechSynthesis, 'getVoices').mockReturnValueOnce([]).mockReturnValue([arabicVoice]);
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');
      speak('نص بلا صوت جاهز بعد.');
      expect(speakSpy).toHaveBeenCalledTimes(1);

      window.speechSynthesis.dispatchEvent(new Event('voiceschanged'));

      expect(speakSpy).toHaveBeenCalledTimes(2);
      expect(speakSpy.mock.calls[1]![0]).toHaveProperty('voice', arabicVoice);
    });

    it('does not restart once playback already stopped', async () => {
      vi.spyOn(window.speechSynthesis, 'getVoices').mockReturnValueOnce([]).mockReturnValue([arabicVoice]);
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');
      speak('نص قصير.');
      await new Promise((r) => setTimeout(r, 5)); // let it finish (fake resolves onend)

      window.speechSynthesis.dispatchEvent(new Event('voiceschanged'));

      expect(speakSpy).toHaveBeenCalledTimes(1);
    });

    it('does not restart when the voice list changed but still has no Arabic voice', () => {
      vi.spyOn(window.speechSynthesis, 'getVoices').mockReturnValue([]);
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');
      speak('لسا ما في صوت عربي.');

      window.speechSynthesis.dispatchEvent(new Event('voiceschanged'));

      expect(speakSpy).toHaveBeenCalledTimes(1);
    });
  });
});
