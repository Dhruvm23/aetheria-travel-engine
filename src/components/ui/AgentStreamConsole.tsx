'use client';

// ============================================================================
// AgentStreamConsole — Terminal-style text stream indicating AI reasoning
// ============================================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STREAM_STATES = [
  { icon: '🔍', text: 'Parsing natural language prompt constraints...' },
  { icon: '⚖️', text: 'Enforcing budget limitations & routing logic...' },
  { icon: '🗺️', text: 'Fetching Directions & Elevation vectors for path nodes...' },
  { icon: '🧠', text: 'Optimizing chronological flow and avoiding overlaps...' },
  { icon: '✅', text: 'Compiling highly-optimized JSON travel blueprint...' },
];

export function AgentStreamConsole({ isActive }: { isActive: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setCurrentIndex(0);
      return;
    }

    // Cycle through states every 2.5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, STREAM_STATES.length - 1));
    }, 2500);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="agent-stream-console"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="
            absolute top-4 left-1/2 -translate-x-1/2 z-30
            px-4 py-2.5 rounded-xl
            bg-black/60 backdrop-blur-xl border border-white/10
            shadow-[0_16px_32px_rgba(0,0,0,0.5)]
            flex items-center gap-3
            max-w-[90%] sm:max-w-md w-full
          "
        >
          {/* Pulsing indicator */}
          <div className="w-2 h-2 rounded-full bg-[var(--accent-gold)] animate-pulse shadow-[0_0_8px_var(--accent-gold)] shrink-0" />

          {/* Staggered text */}
          <div className="flex-1 overflow-hidden relative h-[18px]">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] whitespace-nowrap"
              >
                <span className="shrink-0">{STREAM_STATES[currentIndex].icon}</span>
                <span className="truncate">{STREAM_STATES[currentIndex].text}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
