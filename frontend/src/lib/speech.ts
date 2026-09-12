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

/** Reads `text` aloud in Arabic. Cancels whatever was playing first, so only
 * one thing is ever being read at a time. Calls `onEnd` when it finishes
 * (naturally or because it was stopped). */
export function speak(text: string, onEnd?: () => void): void {
  if (!speechSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ar-SA';
  utter.rate = 0.95;
  const voice = pickArabicVoice(synth);
  if (voice) utter.voice = voice;
  if (onEnd) {
    utter.onend = onEnd;
    utter.onerror = onEnd;
  }
  synth.speak(utter);
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel();
}
