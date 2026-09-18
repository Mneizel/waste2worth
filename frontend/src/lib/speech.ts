// Text-to-speech so the app can be used by people who can't read: every
// screen and every step can be read aloud with the browser's built-in
// speech synthesiser. No server, no bundle cost, works in the offline
// standalone build too.

export function speechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.speechSynthesis !== 'undefined' &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

function pickArabicVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  return synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith('ar')) ?? null;
}

function buildUtterance(
  text: string,
  synth: SpeechSynthesis,
  onEnd?: () => void,
): SpeechSynthesisUtterance {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ar-SA';
  utter.rate = 0.95;
  const voice = pickArabicVoice(synth);
  if (voice) utter.voice = voice;
  if (onEnd) {
    utter.onend = onEnd;
    utter.onerror = onEnd;
  }
  return utter;
}

/** Reads `text` aloud in Arabic. Cancels whatever was playing first, so only
 * one thing is ever being read at a time. Calls `onEnd` when it finishes
 * (naturally or because it was stopped). */
export function speak(text: string, onEnd?: () => void): void {
  if (!speechSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = buildUtterance(text, synth, onEnd);
  synth.speak(utter);

  // Many browsers report an EMPTY voice list until the async
  // "voiceschanged" event fires once — often on the very first speak of a
  // session. Without this, that first read (and only that one) silently
  // falls back to the browser's default voice, which is usually not
  // Arabic and mispronounces everything. If the voice list arrives while
  // this same utterance is still the one playing, restart it so it picks
  // up the Arabic voice.
  if (!utter.voice) {
    const onVoicesChanged = () => {
      synth.removeEventListener('voiceschanged', onVoicesChanged);
      if (!synth.speaking) return;
      const voice = pickArabicVoice(synth);
      if (!voice) return;
      synth.cancel();
      synth.speak(buildUtterance(text, synth, onEnd));
    };
    synth.addEventListener('voiceschanged', onVoicesChanged);
  }
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel();
}
