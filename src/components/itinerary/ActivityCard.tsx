'use client';

// ============================================================================
// ActivityCard — Single activity card with luxury styling
// ============================================================================

import { motion } from 'framer-motion';
import {
  Clock, Coins, Accessibility, ChevronRight,
  Landmark, Building2, Utensils, Coffee, Trees, ShoppingBag,
  Music, Palette, Mountain, Heart, Bus,
} from 'lucide-react';
import type { Activity } from '@/types/itinerary';

interface ActivityCardProps {
  activity: Activity;
  index: number;
  isSelected: boolean;
  isDisrupted?: boolean;
  onSelect: (activity: Activity) => void;
  onHover: (activityId: string | null) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  landmark: Landmark, museum: Building2, restaurant: Utensils, cafe: Coffee,
  nature: Trees, shopping: ShoppingBag, nightlife: Music, cultural: Palette,
  adventure: Mountain, wellness: Heart, transit: Bus,
};

const CATEGORY_COLORS: Record<string, string> = {
  landmark: '#d4a853', museum: '#b8a9c9', restaurant: '#ff8a65', cafe: '#a1887f',
  nature: '#6bcb77', shopping: '#f48fb1', nightlife: '#ce93d8', cultural: '#4ecdc4',
  adventure: '#ff7043', wellness: '#81d4fa', transit: '#a39e97',
};

const COST_TIER_DISPLAY: Record<string, { label: string; symbols: string; color: string }> = {
  free: { label: 'Free', symbols: '–', color: 'var(--status-success)' },
  budget: { label: 'Budget', symbols: '$', color: '#a1887f' },
  moderate: { label: 'Moderate', symbols: '$$', color: 'var(--accent-gold)' },
  premium: { label: 'Premium', symbols: '$$$', color: '#ce93d8' },
};

const MOBILITY_RATING_LABEL: Record<number, string> = {
  1: 'Easy', 2: 'Gentle', 3: 'Moderate', 4: 'Challenging', 5: 'Strenuous',
};

export function ActivityCard({
  activity,
  index,
  isSelected,
  isDisrupted = false,
  onSelect,
  onHover,
}: ActivityCardProps) {
  const Icon = CATEGORY_ICONS[activity.category] ?? Landmark;
  const categoryColor = CATEGORY_COLORS[activity.category] ?? '#d4a853';
  const costInfo = COST_TIER_DISPLAY[activity.estimatedCost.tier];
  const mobilityLabel = MOBILITY_RATING_LABEL[activity.accessibilityInfo.mobilityRating];

  const cardLabel = `${activity.name}, ${activity.category}, from ${activity.startTime} to ${activity.endTime}, cost ${activity.estimatedCost.amount} ${activity.estimatedCost.currency}, mobility: ${mobilityLabel}`;

  return (
    <motion.article
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      role="button"
      tabIndex={0}
      aria-label={cardLabel}
      aria-pressed={isSelected}
      onClick={() => onSelect(activity)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(activity);
        }
      }}
      onMouseEnter={() => onHover(activity.id)}
      onMouseLeave={() => onHover(null)}
      className={`
        relative overflow-hidden cursor-pointer
        rounded-2xl border p-4
        transition-all duration-300
        ${isDisrupted
          ? 'animate-danger-pulse border-[var(--status-danger)]/40 bg-[var(--status-danger)]/5'
          : isSelected
            ? 'border-[var(--accent-gold)]/50 bg-[var(--accent-gold-subtle)] glow-gold'
            : 'glass-panel hover:bg-white/8'
        }
      `}
    >
      {/* Category left-border accent */}
      <div
        className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
        style={{ backgroundColor: isDisrupted ? 'var(--status-danger)' : categoryColor }}
        aria-hidden="true"
      />

      <div className="pl-3">
        {/* Top row: icon + name + time */}
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: `${categoryColor}20` }}
            aria-hidden="true"
          >
            <Icon size={16} style={{ color: categoryColor }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`
                  text-sm font-semibold leading-tight truncate
                  ${isDisrupted ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}
                `}
              >
                {activity.name}
              </h3>
              {isDisrupted && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--status-danger)]/20 text-[var(--status-danger)] font-semibold shrink-0"
                  aria-label="This activity has been disrupted"
                >
                  DISRUPTED
                </span>
              )}
            </div>

            {/* Time chip */}
            <div className="flex items-center gap-1 mt-1">
              <Clock size={11} className="text-[var(--text-muted)]" aria-hidden="true" />
              <span className="text-xs text-[var(--text-muted)]">
                {activity.startTime} – {activity.endTime}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                ({activity.durationMinutes} min)
              </span>
            </div>
          </div>

          {/* Arrow hint */}
          <ChevronRight
            size={14}
            className={`text-[var(--text-muted)] shrink-0 mt-1 transition-transform duration-200 ${isSelected ? 'translate-x-1' : ''}`}
            aria-hidden="true"
          />
        </div>

        {/* Description */}
        <p className="mt-2 text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {activity.description}
        </p>

        {/* Badges row */}
        <div
          className="flex flex-wrap items-center gap-2 mt-3"
          aria-label="Activity badges"
        >
          {/* Cost indicator */}
          <span
            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg"
            style={{ color: costInfo.color, backgroundColor: `${costInfo.color}18` }}
            aria-label={`Cost: ${costInfo.label}, approximately ${activity.estimatedCost.amount} ${activity.estimatedCost.currency}`}
          >
            <Coins size={10} aria-hidden="true" />
            {costInfo.symbols}
          </span>

          {/* Accessibility badge */}
          {activity.accessibilityInfo.wheelchairAccessible && (
            <span
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-[var(--accent-teal)]/15 text-[var(--accent-teal)]"
              aria-label="Wheelchair accessible"
            >
              <Accessibility size={10} aria-hidden="true" />
              Accessible
            </span>
          )}

          {/* Mobility rating */}
          <span
            className={`
              text-[10px] font-semibold px-2 py-1 rounded-lg
              ${activity.accessibilityInfo.mobilityRating <= 2
                ? 'bg-[var(--status-success)]/15 text-[var(--status-success)]'
                : activity.accessibilityInfo.mobilityRating <= 3
                  ? 'bg-[var(--status-warning)]/15 text-[var(--status-warning)]'
                  : 'bg-[var(--status-danger)]/15 text-[var(--status-danger)]'
              }
            `}
            aria-label={`Terrain difficulty: ${mobilityLabel}`}
          >
            {mobilityLabel}
          </span>

          {/* Category tag */}
          <span
            className="text-[10px] px-2 py-1 rounded-lg capitalize"
            style={{ color: categoryColor, backgroundColor: `${categoryColor}15` }}
            aria-label={`Category: ${activity.category}`}
          >
            {activity.category}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
