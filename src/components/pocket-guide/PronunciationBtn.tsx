'use client';

// ============================================================================
// PronunciationBtn — Audio Assist button using Web Speech Synthesis
// ============================================================================

import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import type { PronunciationTip } from '@/types/itinerary';

interface PronunciationBtnProps {
  tip: PronunciationTip;
}

export function PronunciationBtn({ tip }: PronunciationBtnProps) {
  const { speak, cancel, isSpeaking } = useSpeechSynthesis();

  const handleClick = () => {
    if (isSpeaking) {
      cancel();
    } else {
      speak(tip.phrase, { lang: tip.language, rate: 0.8 });
    }
  };

  return (
    <motion.div
      className="p-3 rounded-xl glass-panel space-y-1.5"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      aria-label={`Pronunciation tip for: ${tip.phrase}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{tip.phrase}</p>
          <p className="text-xs text-[var(--text-muted)]">{tip.meaning}</p>
        </div>

        <motion.button
          type="button"
          aria-label={`${isSpeaking ? 'Stop speaking' : 'Speak phrase aloud'}: ${tip.phrase}`}
          tabIndex={0}
          onClick={handleClick}
          whileTap={{ scale: 0.9 }}
          className={`
            w-9 h-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer
            transition-all duration-200
            ${isSpeaking
              ? 'bg-[var(--accent-teal)]/20 text-[var(--accent-teal)] animate-speaking'
              : 'glass-panel text-[var(--text-muted)] hover:text-[var(--accent-teal)] hover:border-[var(--accent-teal)]/30'
            }
          `}
        >
          {isSpeaking
            ? <Volume2 size={15} aria-hidden="true" />
            : <Volume2 size={15} aria-hidden="true" />
          }
          {!isSpeaking && <span className="sr-only">Speak</span>}
          {isSpeaking && <span className="sr-only">Speaking…</span>}
        </motion.button>
      </div>

      <p className="text-xs font-mono text-[var(--accent-gold)] tracking-wide">
        {tip.phoneticGuide}
      </p>
    </motion.div>
  );
}
