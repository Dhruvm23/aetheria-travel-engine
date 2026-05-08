'use client';

// ============================================================================
// GlobalProgressBar — Top-of-map animated progress bar during AI generation
// ============================================================================

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalProgressBarProps {
  isActive: boolean;
}

export function GlobalProgressBar({ isActive }: GlobalProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setProgress(0);
      setIsVisible(true);

      // Simulate non-linear progress: fast → slow → wait for completion
      const timers: ReturnType<typeof setTimeout>[] = [];

      // Quick initial jump to 15%
      timers.push(setTimeout(() => setProgress(15), 100));
      // Settle to 35%
      timers.push(setTimeout(() => setProgress(35), 600));
      // Slow crawl to 60%
      timers.push(setTimeout(() => setProgress(60), 2000));
      // Plateau near 80%
      timers.push(setTimeout(() => setProgress(78), 4000));
      // Hold at 90%
      timers.push(setTimeout(() => setProgress(90), 8000));

      return () => timers.forEach(clearTimeout);
    } else if (!isActive && isVisible) {
      // Sprint to 100% then fade out
      setProgress(100);
      const hideTimer = setTimeout(() => setIsVisible(false), 600);
      return () => clearTimeout(hideTimer);
    }
  }, [isActive, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="progress-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-0 left-0 right-0 z-20 h-0.5 overflow-hidden rounded-t-2xl"
          role="progressbar"
          aria-label="Generating itinerary"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={progress < 100 ? 'Generating your trip…' : 'Complete'}
        >
          {/* Track */}
          <div className="w-full h-full bg-white/5" aria-hidden="true" />

          {/* Fill */}
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--accent-gold) 0%, #f0d78c 50%, var(--accent-teal) 100%)',
              boxShadow: '0 0 12px var(--accent-gold-glow)',
            }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: progress === 100 ? 0.3 : 1.2,
              ease: progress === 100 ? [0.4, 0, 0.2, 1] : [0.16, 1, 0.3, 1],
            }}
            aria-hidden="true"
          />

          {/* Shimmer overlay */}
          {isActive && (
            <motion.div
              className="absolute top-0 h-full w-16 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              }}
              animate={{ left: ['-10%', '110%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
              aria-hidden="true"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
