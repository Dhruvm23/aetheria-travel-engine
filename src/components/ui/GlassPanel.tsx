'use client';

// ============================================================================
// GlassPanel — Reusable glassmorphism container
// ============================================================================

import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassPanelProps extends HTMLMotionProps<'div'> {
  /** Use the stronger backdrop-blur variant */
  strong?: boolean;
  /** Additional CSS class names */
  className?: string;
}

export function GlassPanel({
  strong = false,
  className = '',
  children,
  ...motionProps
}: GlassPanelProps) {
  return (
    <motion.div
      className={`${strong ? 'glass-panel-strong' : 'glass-panel'} ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
