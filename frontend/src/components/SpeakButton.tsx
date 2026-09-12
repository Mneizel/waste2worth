import { useEffect, useState } from 'react';

import { speak, speechSupported, stopSpeaking } from '../lib/speech';
import './SpeakButton.css';
import { Speaker, SpeakerStop } from './icons';

interface SpeakButtonProps {
  /** the Arabic text to read aloud */
  text: string;
  /** accessible label, e.g. "اسمع الخطوة" */
  label?: string;
  size?: 'sm' | 'md';
}

/** A tap-to-listen button, for people who can't read the text next to it. */
export function SpeakButton({ text, label = 'اسمعها', size = 'md' }: SpeakButtonProps) {
  const [playing, setPlaying] = useState(false);

  // stop mid-sentence if the screen changes while it's talking
  useEffect(() => stopSpeaking, []);

  if (!speechSupported()) return null;

  function toggle() {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    speak(text, () => setPlaying(false));
  }

  return (
    <button
      type="button"
      className={`speak-btn speak-btn--${size}${playing ? ' speak-btn--on' : ''}`}
      onClick={toggle}
      aria-pressed={playing}
      aria-label={label}
      title={label}
    >
      {playing ? <SpeakerStop size={size === 'sm' ? 16 : 20} /> : <Speaker size={size === 'sm' ? 16 : 20} />}
    </button>
  );
}
