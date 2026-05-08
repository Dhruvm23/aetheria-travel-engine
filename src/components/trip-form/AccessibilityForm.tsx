'use client';

// ============================================================================
// AccessibilityForm — Accessibility needs toggle panel
// ============================================================================

import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { AccessibilityNeeds } from '@/types/itinerary';

interface AccessibilityFormProps {
  value: AccessibilityNeeds;
  onChange: (value: AccessibilityNeeds) => void;
}

const TOGGLES: { key: keyof Omit<AccessibilityNeeds, 'notes'>; label: string; description: string }[] = [
  { key: 'wheelchairRequired', label: 'Wheelchair Required', description: 'Routes must be fully wheelchair accessible' },
  { key: 'limitedMobility', label: 'Limited Mobility', description: 'Prefer flat routes, minimal stairs' },
  { key: 'visualImpairment', label: 'Visual Impairment', description: 'Include audio and tactile guidance info' },
  { key: 'hearingImpairment', label: 'Hearing Impairment', description: 'Highlight visual communication options' },
  { key: 'elderlyTraveler', label: 'Elderly Traveler', description: 'Prioritize rest stops and gentle pacing' },
];

export function AccessibilityForm({ value, onChange }: AccessibilityFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggle = (key: keyof Omit<AccessibilityNeeds, 'notes'>) => {
    onChange({ ...value, [key]: !value[key] });
  };

  const hasAny = TOGGLES.some((t) => value[t.key]);

  return (
    <div className="glass-panel overflow-hidden">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls="accessibility-panel"
        aria-label="Expand accessibility needs options"
        tabIndex={0}
        onClick={() => setIsExpanded((p) => !p)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Accessibility size={18} className="text-[var(--accent-teal)]" aria-hidden="true" />
          <div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Accessibility Needs
            </span>
            {hasAny && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[var(--accent-teal)]/20 text-[var(--accent-teal)]">
                {TOGGLES.filter((t) => value[t.key]).length} selected
              </span>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <ChevronDown size={16} className="text-[var(--text-muted)]" aria-hidden="true" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id="accessibility-panel"
            role="group"
            aria-label="Accessibility needs checkboxes"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-white/8">
              {TOGGLES.map((t) => (
                <label
                  key={t.key}
                  className="flex items-start gap-3 py-3 cursor-pointer group"
                  aria-label={`${t.label}: ${t.description}`}
                >
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={value[t.key]}
                      onChange={() => toggle(t.key)}
                      className="sr-only"
                      tabIndex={0}
                      aria-label={t.label}
                    />
                    <div
                      className={`
                        w-5 h-5 rounded-md border-2 flex items-center justify-center
                        transition-all duration-200
                        ${value[t.key]
                          ? 'bg-[var(--accent-teal)] border-[var(--accent-teal)]'
                          : 'border-white/20 group-hover:border-white/40'
                        }
                      `}
                      aria-hidden="true"
                    >
                      {value[t.key] && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#0d0f12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{t.label}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{t.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
