'use client';

// ============================================================================
// IconButton — Accessible icon-only button
// ============================================================================

import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Mandatory accessible label */
  'aria-label': string;
  /** Icon element */
  children: ReactNode;
  /** Visual variant */
  variant?: 'ghost' | 'glass' | 'gold' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Is the button in an active/toggled state */
  active?: boolean;
}

const VARIANT_CLASSES: Record<string, string> = {
  ghost:
    'bg-transparent hover:bg-white/8 text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
  glass:
    'glass-panel hover:bg-white/8 text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
  gold: 'bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-hover)] text-[var(--text-inverse)] shadow-[var(--shadow-glow-gold)]',
  danger:
    'bg-[var(--status-danger)]/20 hover:bg-[var(--status-danger)]/30 text-[var(--status-danger)] border border-[var(--status-danger)]/30',
};

const SIZE_CLASSES: Record<string, string> = {
  sm: 'w-8 h-8 rounded-lg text-sm',
  md: 'w-10 h-10 rounded-xl text-base',
  lg: 'w-12 h-12 rounded-2xl text-lg',
};

export function IconButton({
  'aria-label': ariaLabel,
  children,
  variant = 'ghost',
  size = 'md',
  active = false,
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <motion.button
      aria-label={ariaLabel}
      tabIndex={0}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className={`
        inline-flex items-center justify-center shrink-0 cursor-pointer
        transition-all duration-200
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${active ? 'ring-2 ring-[var(--accent-gold)] ring-offset-1 ring-offset-[var(--bg-base)]' : ''}
        ${className}
      `}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
