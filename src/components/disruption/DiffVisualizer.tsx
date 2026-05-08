'use client';

// ============================================================================
// DiffVisualizer — Before/after change record animation
// ============================================================================

import { motion } from 'framer-motion';
import { ArrowRight, Plus, Minus, RefreshCw, Clock } from 'lucide-react';
import type { ChangeRecord } from '@/types/itinerary';

interface DiffVisualizerProps {
  changes: ChangeRecord[];
  reasoning: string;
}

const CHANGE_CONFIG: Record<
  ChangeRecord['changeType'],
  { icon: React.ElementType; label: string; color: string }
> = {
  rescheduled: { icon: Clock, label: 'Rescheduled', color: 'var(--status-warning)' },
  replaced: { icon: RefreshCw, label: 'Replaced', color: 'var(--accent-gold)' },
  removed: { icon: Minus, label: 'Removed', color: 'var(--status-danger)' },
  added: { icon: Plus, label: 'Added', color: 'var(--status-success)' },
};

export function DiffVisualizer({ changes, reasoning }: DiffVisualizerProps) {
  if (changes.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-3"
      role="region"
      aria-label="Disruption simulation results"
      aria-live="polite"
    >
      {/* Reasoning */}
      <div className="p-3 rounded-xl bg-[var(--accent-gold-subtle)] border border-[var(--accent-gold)]/20">
        <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
          <span className="font-semibold text-[var(--accent-gold)] not-italic">AI reasoning: </span>
          {reasoning}
        </p>
      </div>

      {/* Change records */}
      <div className="space-y-2" role="list" aria-label="Changes applied to itinerary">
        {changes.map((change, i) => {
          const config = CHANGE_CONFIG[change.changeType];
          const Icon = config.icon;

          return (
            <motion.div
              key={`${change.activityId}-${i}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              role="listitem"
              aria-label={`Day ${change.dayNumber}: ${change.changeType} — ${change.reason}`}
              className="flex items-start gap-3 p-3 rounded-xl glass-panel"
            >
              {/* Change type icon */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${config.color}20` }}
                aria-hidden="true"
              >
                <Icon size={13} style={{ color: config.color }} />
              </div>

              <div className="flex-1 min-w-0">
                {/* Day + change type */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Day {change.dayNumber}</span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                    style={{ color: config.color, backgroundColor: `${config.color}15` }}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Before → after */}
                {(change.before || change.after) && (
                  <div className="flex items-center gap-2 flex-wrap text-xs mb-1">
                    {change.before?.name && (
                      <span className="text-[var(--status-danger)] line-through opacity-70">
                        {change.before.name}
                      </span>
                    )}
                    {change.before?.name && change.after?.name && (
                      <ArrowRight size={10} className="text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                    )}
                    {change.after?.name && (
                      <span className="text-[var(--status-success)] font-semibold">
                        {change.after.name}
                      </span>
                    )}
                  </div>
                )}

                {/* Reason */}
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">{change.reason}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
