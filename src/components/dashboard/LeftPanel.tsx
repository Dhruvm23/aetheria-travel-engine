'use client';

// ============================================================================
// LeftPanel — Scrollable left panel: TripForm → ItineraryTimeline
// ============================================================================

import { motion, AnimatePresence } from 'framer-motion';
import { TripForm } from '@/components/trip-form/TripForm';
import { ItineraryTimeline } from '@/components/itinerary/ItineraryTimeline';
import { DayCardSkeleton } from '@/components/ui/LoadingShimmer';
import type {
  Itinerary,
  TripRequest,
  Activity,
  ChangeRecord,
  AccessibilityNeeds,
} from '@/types/itinerary';

interface LeftPanelProps {
  itinerary: Itinerary | null;
  isLoading: boolean;
  error: string | null;
  selectedActivityId: string | null;
  changesApplied: ChangeRecord[];
  accessibilityNeeds: AccessibilityNeeds;
  onSubmitTrip: (request: TripRequest) => void;
  onSelectActivity: (activity: Activity) => void;
  onHoverActivity: (activityId: string | null) => void;
  onAnalyzeTerrain: (from: Activity, to: Activity) => void;
  tweakItinerary?: (prompt: string) => Promise<void>;
}

export function LeftPanel({
  itinerary,
  isLoading,
  error,
  selectedActivityId,
  changesApplied,
  accessibilityNeeds,
  onSubmitTrip,
  onSelectActivity,
  onHoverActivity,
  onAnalyzeTerrain,
  tweakItinerary,
}: LeftPanelProps) {
  return (
    <div
      className="h-full overflow-y-auto"
      role="region"
      aria-label="Trip planning and itinerary panel"
    >
      <div className="p-6 space-y-8 min-h-full">
        {/* Always show form when no itinerary */}
        <AnimatePresence mode="wait">
          {!itinerary && !isLoading && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <TripForm
                onSubmit={onSubmitTrip}
                isLoading={isLoading}
                error={error}
              />
            </motion.div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
              aria-label="Generating itinerary"
            >
              {/* Loading header */}
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 rounded-2xl bg-[var(--accent-gold-subtle)] flex items-center justify-center mx-auto mb-4"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Crafting your itinerary…</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Aetheria is planning your perfect journey</p>
              </div>

              {[1, 2].map((i) => (
                <DayCardSkeleton key={i} />
              ))}
            </motion.div>
          )}

          {/* Itinerary timeline */}
          {itinerary && !isLoading && (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Offline Banner */}
              {itinerary.id.startsWith('fallback-') && (
                <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-[var(--status-warning)]/10 border border-[var(--status-warning)]/30">
                  <span className="text-[var(--status-warning)] mt-0.5">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--status-warning)]">Offline Mode Active</p>
                    <p className="text-xs text-[var(--status-warning)]/80 mt-0.5">
                      We couldn't reach the Aetheria AI. Displaying a generic procedural itinerary.
                    </p>
                  </div>
                </div>
              )}

              {/* "Plan again" link */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs text-[var(--text-muted)]">
                  {changesApplied.length > 0 && (
                    <span className="text-[var(--status-warning)]">
                      ⚡ {changesApplied.length} disruption change{changesApplied.length !== 1 ? 's' : ''} applied
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  aria-label="Start over and plan a new trip"
                  tabIndex={0}
                  onClick={() => onSubmitTrip({
                    destination: '', startDate: '', endDate: '', budget: 'moderate',
                    interests: [], groupSize: 1,
                    accessibilityNeeds: {
                      wheelchairRequired: false, limitedMobility: false,
                      visualImpairment: false, hearingImpairment: false, elderlyTraveler: false,
                    },
                  })}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors underline underline-offset-2 cursor-pointer"
                >
                  Plan a new trip
                </button>
              </div>

              <ItineraryTimeline
                itinerary={itinerary}
                selectedActivityId={selectedActivityId}
                changesApplied={changesApplied}
                onSelectActivity={onSelectActivity}
                onHoverActivity={onHoverActivity}
                onAnalyzeTerrain={onAnalyzeTerrain}
                accessibilityNeeds={accessibilityNeeds}
                tweakItinerary={tweakItinerary}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
