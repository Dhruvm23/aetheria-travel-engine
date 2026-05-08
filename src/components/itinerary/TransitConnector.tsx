'use client';

// ============================================================================
// TransitConnector — Visual connector between activities showing transit info
// ============================================================================

import { motion } from 'framer-motion';
import {
  Footprints, Car, Train, Bike, CarTaxiFront, ChevronDown
} from 'lucide-react';
import type { TransitSegment, Activity, AccessibilityNeeds } from '@/types/itinerary';

interface TransitConnectorProps {
  transit: TransitSegment;
  fromActivity: Activity;
  toActivity: Activity;
  accessibilityNeeds?: AccessibilityNeeds;
  onAnalyzeTerrain: (from: Activity, to: Activity) => void;
}

const MODE_CONFIG: Record<
  TransitSegment['mode'],
  { icon: React.ElementType; label: string; color: string }
> = {
  walk: { icon: Footprints, label: 'Walk', color: 'var(--accent-teal)' },
  drive: { icon: Car, label: 'Drive', color: 'var(--accent-gold)' },
  transit: { icon: Train, label: 'Transit', color: '#b8a9c9' },
  cycle: { icon: Bike, label: 'Cycle', color: 'var(--status-success)' },
  taxi: { icon: CarTaxiFront, label: 'Taxi', color: 'var(--status-warning)' },
};

export function TransitConnector({
  transit,
  fromActivity,
  toActivity,
  onAnalyzeTerrain,
}: TransitConnectorProps) {
  // Normalize AI output (e.g., 'WALK' -> 'walk') and fallback to 'walk' if missing
  const normalizedMode = (transit.mode || 'walk').toLowerCase() as keyof typeof MODE_CONFIG;
  const config = MODE_CONFIG[normalizedMode] || MODE_CONFIG.walk;
  const Icon = config.icon;

  return (
    <div
      className="flex items-center gap-3 py-1 px-2"
      role="region"
      aria-label={`Transit from ${fromActivity.name} to ${toActivity.name}: ${transit.durationMinutes} minutes by ${config.label}`}
    >
      {/* Vertical line */}
      <div className="flex flex-col items-center gap-0 ml-3.5">
        <div className="w-px h-3 bg-white/10" aria-hidden="true" />
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center border"
          style={{
            backgroundColor: `${config.color}18`,
            borderColor: `${config.color}40`,
          }}
          aria-hidden="true"
        >
          <Icon size={11} style={{ color: config.color }} />
        </div>
        <div className="w-px h-3 bg-white/10" aria-hidden="true" />
      </div>

      {/* Info */}
      <div className="flex items-center gap-2 flex-1">
        <span className="text-xs text-[var(--text-muted)]">
          {transit.durationMinutes} min · {transit.distanceKm.toFixed(1)} km
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${config.color}18`, color: config.color }}
        >
          {config.label}
        </span>
      </div>

      {/* Terrain analysis trigger — only for walk mode */}
      {transit.mode === 'walk' && (
        <motion.button
          type="button"
          aria-label={`Analyze terrain slope between ${fromActivity.name} and ${toActivity.name}`}
          tabIndex={0}
          onClick={() => onAnalyzeTerrain(fromActivity, toActivity)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="
            flex items-center gap-1 text-[10px] font-semibold
            px-2 py-1 rounded-lg
            bg-[var(--accent-gold-subtle)] text-[var(--accent-gold)]
            hover:bg-[var(--accent-gold)]/20
            transition-colors duration-150 cursor-pointer
          "
        >
          <ChevronDown size={10} aria-hidden="true" />
          Terrain
        </motion.button>
      )}
    </div>
  );
}
