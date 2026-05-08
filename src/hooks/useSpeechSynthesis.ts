'use client';

// ============================================================================
// useSpeechSynthesis — Web Speech Synthesis API wrapper
// ============================================================================

import { useState, useCallback, useRef } from 'react';

export interface SpeechOptions {
  lang?: string;   // BCP 47, e.g. "it-IT"
  rate?: number;   // 0.1 – 10
  pitch?: number;  // 0 – 2
  volume?: number; // 0 – 1
}

export interface UseSpeechSynthesisReturn {
  speak: (text: string, options?: SpeechOptions) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback(
    (text: string, options: SpeechOptions = {}) => {
      if (!isSupported) return;

      // Cancel any in-progress speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang ?? 'en-US';
      utterance.rate = options.rate ?? 0.9;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, cancel, isSpeaking, isSupported };
}
