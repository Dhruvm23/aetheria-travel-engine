'use client';

// ============================================================================
// InterestGrid — Multi-select interest tag grid
// ============================================================================

import { motion } from 'framer-motion';
import { INTEREST_OPTIONS } from '@/lib/constants';
import {
  ScrollText, Building2, Utensils, Palette, Trees, Mountain,
  Music, ShoppingBag, Heart, Camera, Users, Church,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  scroll: ScrollText, 'building-2': Building2, utensils: Utensils,
  palette: Palette, trees: Trees, mountain: Mountain, music: Music,
  'shopping-bag': ShoppingBag, heart: Heart, camera: Camera,
  users: Users, church: Church,
};

interface InterestGridProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function InterestGrid({ selected, onChange }: InterestGridProps) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );
  };

  return (
    <fieldset>
      <legend className="sr-only">Select your travel interests</legend>
      <div
        className="grid grid-cols-3 gap-2"
        role="group"
        aria-label="Travel interests selection"
      >
        {INTEREST_OPTIONS.map((opt, i) => {
          const Icon = ICON_MAP[opt.icon] ?? Palette;
          const isSelected = selected.includes(opt.id);
          return (
            <motion.button
              key={opt.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              aria-label={`Interest: ${opt.label}`}
              tabIndex={0}
              onClick={() => toggle(opt.id)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex flex-col items-center gap-1.5 p-3 rounded-xl
                border text-center cursor-pointer
                transition-all duration-200
                ${isSelected
                  ? 'bg-[var(--accent-gold-subtle)] border-[var(--accent-gold)] text-[var(--accent-gold)]'
                  : 'glass-panel border-white/10 text-[var(--text-secondary)] hover:border-white/20 hover:text-[var(--text-primary)]'
                }
              `}
            >
              <Icon size={16} aria-hidden="true" />
              <span className="text-xs font-medium leading-tight">{opt.label}</span>
            </motion.button>
          );
        })}
      </div>
    </fieldset>
  );
}
