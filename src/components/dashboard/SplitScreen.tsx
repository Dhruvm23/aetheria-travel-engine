'use client';

// ============================================================================
// SplitScreen — Root asymmetric 45/55 split-screen dashboard layout
// ============================================================================

import { useCallback, useMemo } from 'react';
import { useItinerary } from '@/hooks/useItinerary';
import { useDisruption } from '@/hooks/useDisruption';
import { useTerrain } from '@/hooks/useTerrain';
import { usePocketGuide } from '@/hooks/usePocketGuide';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { DisruptionDrawer } from '@/components/disruption/DisruptionDrawer';
import { PocketGuideDrawer } from '@/components/pocket-guide/PocketGuideDrawer';
import type { Activity, TripRequest } from '@/types/itinerary';

export function SplitScreen() {
  // ── Core state hooks ──────────────────────────────────────────────────────
  const {
    itinerary,
    isLoading: itineraryLoading,
    error: itineraryError,
    selectedActivity,
    generateItinerary,
    tweakItinerary,
    selectActivity,
  } = useItinerary();

  const disruption = useDisruption();
  const terrain = useTerrain();
  const pocketGuide = usePocketGuide();

  // ── Active itinerary (possibly disrupted) ────────────────────────────────
  const activeItinerary = disruption.simulationResult?.adjustedItinerary ?? itinerary;
  const changesApplied = disruption.simulationResult?.changesApplied ?? [];

  // ── All activities flat list for the map ────────────────────────────────
  const allActivities = useMemo(
    () => activeItinerary?.days.flatMap((d) => d.activities) ?? [],
    [activeItinerary]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSubmitTrip = useCallback(
    (request: TripRequest) => {
      // Reset all derived state on a new plan request
      disruption.clearResult();
      terrain.dismiss();
      pocketGuide.close();
      selectActivity(null);
      generateItinerary(request);
    },
    [disruption, terrain, pocketGuide, selectActivity, generateItinerary]
  );

  const handleSelectActivity = useCallback(
    (activity: Activity) => {
      selectActivity(activity);
      if (activeItinerary) {
        pocketGuide.open(activity, activeItinerary.destination, activeItinerary.country);
      }
    },
    [selectActivity, pocketGuide, activeItinerary]
  );

  const handleHoverActivity = useCallback(
    (_activityId: string | null) => {
      // Map hover is managed inside useMap via selectedActivityId
    },
    []
  );

  const handleAnalyzeTerrain = useCallback(
    (from: Activity, to: Activity) => {
      terrain.fetchTerrain(
        from.location,
        to.location,
        from.id,
        to.id,
        activeItinerary?.travelerProfile?.accessibilityNeeds
      );
    },
    [terrain, activeItinerary]
  );

  const handleDisruptionSimulate = useCallback(() => {
    if (activeItinerary) {
      disruption.simulate(activeItinerary);
    }
  }, [disruption, activeItinerary]);

  // ── Accessibility needs for terrain threshold ────────────────────────────
  const accessibilityNeeds = activeItinerary?.travelerProfile?.accessibilityNeeds ?? {
    wheelchairRequired: false,
    limitedMobility: false,
    visualImpairment: false,
    hearingImpairment: false,
    elderlyTraveler: false,
  };

  return (
    <>
      {/*
        Dashboard grid:
        - Desktop: 45% left (scrollable) | 55% right (sticky)
        - Tablet: stacked (map collapses to 40vh)
        - Mobile: single column (map hidden, tabbed)
      */}
      <div
        className="
          flex-1 grid min-h-0
          grid-cols-1
          lg:grid-cols-[45fr_55fr]
        "
        style={{ height: 'calc(100dvh - 0px)' }}
      >
        {/* ── Left Panel (scrollable) ───────────────────────────────────── */}
        <div
          className="
            overflow-hidden
            border-r border-white/8
            lg:block
          "
          style={{ height: '100dvh' }}
        >
          <LeftPanel
            itinerary={activeItinerary}
            isLoading={itineraryLoading}
            error={itineraryError}
            selectedActivityId={selectedActivity?.id ?? null}
            changesApplied={changesApplied}
            accessibilityNeeds={accessibilityNeeds}
            onSubmitTrip={handleSubmitTrip}
            onSelectActivity={handleSelectActivity}
            onHoverActivity={handleHoverActivity}
            onAnalyzeTerrain={handleAnalyzeTerrain}
            tweakItinerary={tweakItinerary}
          />
        </div>

        {/* ── Right Panel (sticky) ─────────────────────────────────────── */}
        <div
          className="
            hidden lg:flex
            sticky top-0
            overflow-hidden
          "
          style={{ height: '100dvh' }}
          aria-label="Map panel"
        >
          <div className="flex-1 flex flex-col">
            <RightPanel
              activities={allActivities}
              selectedActivityId={selectedActivity?.id ?? null}
              hasItinerary={!!activeItinerary}
              isLoading={itineraryLoading}
              terrain={{
                assessment: terrain.assessment,
                isLoading: terrain.isLoading,
                error: terrain.error,
                isVisible: terrain.isVisible,
              }}
              onOpenDisruption={disruption.openDrawer}
              onDismissTerrain={terrain.dismiss}
            />
          </div>
        </div>
      </div>

      {/* ── Overlays (portaled to body) ──────────────────────────────────── */}
      <DisruptionDrawer
        isOpen={disruption.isDrawerOpen}
        onClose={disruption.closeDrawer}
        itinerary={activeItinerary}
        selectedPreset={disruption.selectedPreset}
        onSelectPreset={disruption.selectPreset}
        selectedDay={disruption.selectedDay}
        onSelectDay={disruption.setSelectedDay}
        customSeverity={disruption.customSeverity}
        onSetSeverity={disruption.setCustomSeverity}
        isSimulating={disruption.isSimulating}
        simulationResult={disruption.simulationResult}
        simulationError={disruption.simulationError}
        onSimulate={handleDisruptionSimulate}
        onClearResult={disruption.clearResult}
      />

      <PocketGuideDrawer
        isOpen={pocketGuide.isOpen}
        onClose={pocketGuide.close}
        activity={pocketGuide.activity}
        content={pocketGuide.content}
        isLoading={pocketGuide.isLoading}
        error={pocketGuide.error}
      />
    </>
  );
}
