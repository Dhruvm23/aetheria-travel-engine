'use client';

// ============================================================================
// DisruptionDrawer — Slide-in side panel for disruption simulation
// ============================================================================

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Loader2, AlertCircle } from 'lucide-react';
import { DisruptionCard } from './DisruptionCard';
import { DiffVisualizer } from './DiffVisualizer';
import { DISRUPTION_PRESETS, type DisruptionPreset } from '@/lib/constants';
import type { Itinerary, DisruptionSeverity, DisruptionResponse } from '@/types/itinerary';

interface DisruptionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: Itinerary | null;
  selectedPreset: DisruptionPreset | null;
  onSelectPreset: (preset: DisruptionPreset) => void;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  customSeverity: DisruptionSeverity;
  onSetSeverity: (s: DisruptionSeverity) => void;
  isSimulating: boolean;
  simulationResult: DisruptionResponse | null;
  simulationError: string | null;
  onSimulate: () => void;
  onClearResult: () => void;
}

const SEVERITIES: DisruptionSeverity[] = ['low', 'medium', 'high', 'critical'];
const SEVERITY_COLORS: Record<string, string> = {
  low: 'var(--status-success)', medium: 'var(--status-warning)',
  high: 'var(--status-danger)', critical: '#ff4466',
};

export function DisruptionDrawer({
  isOpen,
  onClose,
  itinerary,
  selectedPreset,
  onSelectPreset,
  selectedDay,
  onSelectDay,
  customSeverity,
  onSetSeverity,
  isSimulating,
  simulationResult,
  simulationError,
  onSimulate,
  onClearResult,
}: DisruptionDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Focus management: trap focus when open
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard trap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input, [tabindex="0"]'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const dayCount = itinerary?.totalDays ?? 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Disruption Simulator"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="
              fixed right-0 top-0 bottom-0 z-50
              w-full max-w-md
              glass-panel-strong border-l border-white/10
              flex flex-col overflow-hidden
            "
            style={{ backdropFilter: 'blur(32px) saturate(1.5)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--status-danger)]/15 flex items-center justify-center">
                  <Zap size={16} className="text-[var(--status-danger)]" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">Disruption Simulator</h2>
                  <p className="text-xs text-[var(--text-muted)]">Inject a disruption and watch Aetheria re-plan</p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close disruption simulator"
                tabIndex={0}
                onClick={onClose}
                className="
                  w-8 h-8 rounded-lg flex items-center justify-center
                  hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)]
                  transition-colors duration-150 cursor-pointer
                "
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* No itinerary warning */}
              {!itinerary && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--status-warning)]/10 border border-[var(--status-warning)]/30">
                  <AlertCircle size={16} className="text-[var(--status-warning)] shrink-0" aria-hidden="true" />
                  <p className="text-xs text-[var(--status-warning)]">Generate an itinerary first to simulate disruptions.</p>
                </div>
              )}

              {/* Disruption type selection */}
              <section aria-label="Select disruption type">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">
                  Disruption Type
                </h3>
                <div
                  role="radiogroup"
                  aria-label="Disruption type options"
                  className="space-y-2"
                >
                  {DISRUPTION_PRESETS.map((preset) => (
                    <DisruptionCard
                      key={preset.type}
                      preset={preset}
                      isSelected={selectedPreset?.type === preset.type}
                      onSelect={onSelectPreset}
                    />
                  ))}
                </div>
              </section>

              {/* Day selector */}
              {itinerary && (
                <section aria-label="Select affected day">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">
                    Affected Day
                  </h3>
                  <div
                    role="radiogroup"
                    aria-label="Select which day is affected"
                    className="flex flex-wrap gap-2"
                  >
                    {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => (
                      <button
                        key={d}
                        type="button"
                        role="radio"
                        aria-checked={selectedDay === d}
                        aria-label={`Day ${d}`}
                        tabIndex={0}
                        onClick={() => onSelectDay(d)}
                        className={`
                          w-10 h-10 rounded-xl text-sm font-bold cursor-pointer
                          transition-all duration-200
                          ${selectedDay === d
                            ? 'bg-[var(--status-danger)] text-white'
                            : 'glass-panel text-[var(--text-secondary)] hover:bg-white/10'
                          }
                        `}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Severity override */}
              <section aria-label="Select severity level">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">
                  Severity
                </h3>
                <div
                  role="radiogroup"
                  aria-label="Severity level selection"
                  className="grid grid-cols-4 gap-2"
                >
                  {SEVERITIES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={customSeverity === s}
                      aria-label={`Severity: ${s}`}
                      tabIndex={0}
                      onClick={() => onSetSeverity(s)}
                      className={`
                        py-2 rounded-xl text-xs font-bold capitalize cursor-pointer
                        transition-all duration-200
                        ${customSeverity === s
                          ? 'text-white'
                          : 'glass-panel text-[var(--text-muted)] hover:bg-white/10'
                        }
                      `}
                      style={customSeverity === s ? { backgroundColor: SEVERITY_COLORS[s] } : undefined}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              {/* Error */}
              {simulationError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  aria-live="assertive"
                  className="flex items-start gap-3 p-4 rounded-xl bg-[var(--status-danger)]/10 border border-[var(--status-danger)]/30"
                >
                  <AlertCircle size={14} className="text-[var(--status-danger)] mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-xs text-[var(--status-danger)]">{simulationError}</p>
                </motion.div>
              )}

              {/* Diff result */}
              {simulationResult && (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      Changes Applied ({simulationResult.changesApplied.length})
                    </h3>
                    <button
                      type="button"
                      aria-label="Clear disruption simulation results"
                      tabIndex={0}
                      onClick={onClearResult}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <DiffVisualizer
                    changes={simulationResult.changesApplied}
                    reasoning={simulationResult.reasoning}
                  />
                </>
              )}
            </div>

            {/* CTA Footer */}
            <div className="p-5 border-t border-white/10">
              <motion.button
                type="button"
                aria-label={isSimulating ? 'Simulating disruption…' : 'Simulate disruption and re-plan itinerary'}
                tabIndex={0}
                disabled={isSimulating || !itinerary || !selectedPreset}
                onClick={onSimulate}
                whileHover={{ scale: isSimulating ? 1 : 1.02 }}
                whileTap={{ scale: isSimulating ? 1 : 0.98 }}
                className="
                  w-full flex items-center justify-center gap-2
                  py-3.5 rounded-xl font-semibold text-sm
                  bg-[var(--status-danger)] text-white
                  hover:bg-[var(--status-danger)]/90
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                  shadow-[var(--shadow-glow-danger)]
                  cursor-pointer
                "
              >
                {isSimulating ? (
                  <>
                    <Loader2 size={16} className="animate-spin-slow" aria-hidden="true" />
                    Re-planning itinerary…
                  </>
                ) : (
                  <>
                    <Zap size={16} aria-hidden="true" />
                    Simulate Disruption
                  </>
                )}
              </motion.button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
