'use client';

// ============================================================================
// DayCard — Single day container with collapsible activities
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sun, Cloud, CloudRain, Thermometer, Coins } from 'lucide-react';
import { ActivityCard } from './ActivityCard';
import { TransitConnector } from './TransitConnector';
import type { ItineraryDay, Activity, AccessibilityNeeds } from '@/types/itinerary';

interface DayCardProps {
  day: ItineraryDay;
  isDefaultOpen?: boolean;
  selectedActivityId: string | null;
  disruptedActivityIds?: Set<string>;
  onSelectActivity: (activity: Activity) => void;
  onHoverActivity: (activityId: string | null) => void;
  onAnalyzeTerrain: (from: Activity, to: Activity) => void;
  accessibilityNeeds?: AccessibilityNeeds;
}

const WEATHER_ICONS: Record<string, React.ElementType> = {
  Sunny: Sun, Cloudy: Cloud, Rainy: CloudRain,
  'Partly Cloudy': Cloud, default: Sun,
};

function getWeatherIcon(condition: string): React.ElementType {
  return WEATHER_ICONS[condition] ?? WEATHER_ICONS.default;
}

export function DayCard({
  day,
  isDefaultOpen = false,
  selectedActivityId,
  disruptedActivityIds = new Set(),
  onSelectActivity,
  onHoverActivity,
  onAnalyzeTerrain,
  accessibilityNeeds,
}: DayCardProps) {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);

  const formattedDate = new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const WeatherIcon = day.weatherForecast
    ? getWeatherIcon(day.weatherForecast.condition)
    : null;

  return (
    <section
      aria-label={`Day ${day.dayNumber}: ${day.theme}`}
      className="glass-panel overflow-hidden"
    >
      {/* Day Header */}
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`day-${day.dayNumber}-activities`}
        aria-label={`Day ${day.dayNumber}: ${day.theme}. Click to ${isOpen ? 'collapse' : 'expand'}`}
        tabIndex={0}
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
      >
        {/* Day number badge */}
        <div
          className="w-10 h-10 rounded-2xl bg-[var(--accent-gold-subtle)] border border-[var(--accent-gold)]/30 flex flex-col items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <span className="text-[10px] font-bold text-[var(--accent-gold)] uppercase leading-none">Day</span>
          <span className="text-sm font-bold text-[var(--accent-gold)] leading-none">{day.dayNumber}</span>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-[var(--text-primary)] truncate">{day.theme}</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{formattedDate}</p>
        </div>

        {/* Weather chip */}
        {day.weatherForecast && WeatherIcon && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-panel shrink-0"
            aria-label={`Weather: ${day.weatherForecast.condition}, ${day.weatherForecast.tempCelsius}°C`}
          >
            <WeatherIcon size={12} className="text-[var(--accent-teal)]" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
              {day.weatherForecast.tempCelsius}°C
            </span>
          </div>
        )}

        {/* Cost chip */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-panel shrink-0"
          aria-label={`Estimated total cost: ${day.totalCost.amount} ${day.totalCost.currency}`}
        >
          <Thermometer size={12} className="text-[var(--accent-gold)]" aria-hidden="true" />
          <span className="text-[10px] font-semibold text-[var(--accent-gold)]">
            {day.totalCost?.currency ?? 'USD'} {(day.totalCost?.amount ?? 0).toLocaleString()}
          </span>
        </div>

        {/* Cost pill — also hidden, use it for screen readers */}
        <span className="sr-only">
          {day.activities.length} activities planned
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          aria-hidden="true"
        >
          <ChevronDown size={16} className="text-[var(--text-muted)]" />
        </motion.div>
      </button>

      {/* Activities list */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`day-${day.dayNumber}-activities`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1 border-t border-white/8">
              {day.activities.map((activity, i) => (
                <div key={activity.id}>
                  {/* Transit connector before activity (except first) */}
                  {i > 0 && activity.transitFromPrevious && (
                    <TransitConnector
                      transit={activity.transitFromPrevious}
                      fromActivity={day.activities[i - 1]}
                      toActivity={activity}
                      accessibilityNeeds={accessibilityNeeds}
                      onAnalyzeTerrain={onAnalyzeTerrain}
                    />
                  )}
                  <div className="pt-1">
                    <ActivityCard
                      activity={activity}
                      index={i}
                      isSelected={selectedActivityId === activity.id}
                      isDisrupted={disruptedActivityIds.has(activity.id)}
                      onSelect={onSelectActivity}
                      onHover={onHoverActivity}
                    />
                  </div>
                </div>
              ))}

              {/* Day total */}
              <div
                className="flex items-center justify-between px-4 py-3 mt-2 rounded-xl bg-white/3 border border-white/8"
                aria-label={`Day total: ${day.totalCost.amount} ${day.totalCost.currency}`}
              >
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <Coins size={11} aria-hidden="true" />
                  Day Total
                </span>
                <span className="text-xs font-bold text-[var(--accent-gold)]">
                  {day.totalCost?.currency ?? 'USD'} {(day.totalCost?.amount ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
