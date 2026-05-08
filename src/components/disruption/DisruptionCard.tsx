'use client';

// ============================================================================
// DisruptionCard — Individual preset disruption scenario card
// ============================================================================

import { motion } from 'framer-motion';
import {
  CloudRain, Plane, DoorClosed, TrainFront, Construction, HeartPulse,
} from 'lucide-react';
import type { DisruptionPreset } from '@/lib/constants';

interface DisruptionCardProps {
  preset: DisruptionPreset;
  isSelected: boolean;
  onSelect: (preset: DisruptionPreset) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  'cloud-rain': CloudRain, plane: Plane, 'door-closed': DoorClosed,
  'train-front': TrainFront, construction: Construction, 'heart-pulse': HeartPulse,
};

const SEVERITY_COLORS: Record<string, string> = {
  low: 'var(--status-success)',
  medium: 'var(--status-warning)',
  high: 'var(--status-danger)',
  critical: '#ff4466',
};

export function DisruptionCard({ preset, isSelected, onSelect }: DisruptionCardProps) {
  const Icon = ICON_MAP[preset.icon] ?? CloudRain;
  const severityColor = SEVERITY_COLORS[preset.defaultSeverity] ?? 'var(--text-muted)';

  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={`Disruption: ${preset.label}. ${preset.description}. Severity: ${preset.defaultSeverity}`}
      tabIndex={0}
      onClick={() => onSelect(preset)}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.97 }}
      className={`
        w-full text-left p-3 rounded-xl border cursor-pointer
        transition-all duration-200
        ${isSelected
          ? 'bg-[var(--status-danger)]/10 border-[var(--status-danger)]/40'
          : 'glass-panel hover:bg-white/8'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${severityColor}20` }}
          aria-hidden="true"
        >
          <Icon size={16} style={{ color: severityColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--text-primary)]">{preset.label}</span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase"
              style={{ color: severityColor, backgroundColor: `${severityColor}20` }}
              aria-hidden="true"
            >
              {preset.defaultSeverity}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed line-clamp-2">
            {preset.description}
          </p>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-4 h-4 rounded-full bg-[var(--status-danger)] flex items-center justify-center shrink-0 mt-0.5"
            aria-hidden="true"
          >
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
