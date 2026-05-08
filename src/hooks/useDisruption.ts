'use client';

// ============================================================================
// useDisruption — Disruption engine state + /api/disrupt fetch
// ============================================================================

import { useState, useCallback } from 'react';
import type {
  Itinerary,
  DisruptionEvent,
  DisruptionResponse,
  DisruptionType,
  DisruptionSeverity,
} from '@/types/itinerary';
import { API_ROUTES, DISRUPTION_PRESETS, type DisruptionPreset } from '@/lib/constants';

// canvas-confetti — celebrate successful disruption re-plan
async function fireDisruptionConfetti() {
  if (typeof window === 'undefined') return;
  const confetti = (await import('canvas-confetti')).default;
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#ff6b6b', '#ffd93d', '#d4a853'],
  });
}

export interface UseDisruptionReturn {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  selectedPreset: DisruptionPreset | null;
  selectPreset: (preset: DisruptionPreset) => void;
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  customSeverity: DisruptionSeverity;
  setCustomSeverity: (s: DisruptionSeverity) => void;
  isSimulating: boolean;
  simulationResult: DisruptionResponse | null;
  simulationError: string | null;
  simulate: (itinerary: Itinerary) => Promise<void>;
  clearResult: () => void;
}

export function useDisruption(): UseDisruptionReturn {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<DisruptionPreset | null>(
    DISRUPTION_PRESETS[0]
  );
  const [selectedDay, setSelectedDay] = useState(1);
  const [customSeverity, setCustomSeverity] = useState<DisruptionSeverity>('medium');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<DisruptionResponse | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const selectPreset = useCallback((preset: DisruptionPreset) => {
    setSelectedPreset(preset);
    setCustomSeverity(preset.defaultSeverity);
  }, []);
  const clearResult = useCallback(() => {
    setSimulationResult(null);
    setSimulationError(null);
  }, []);

  const simulate = useCallback(
    async (itinerary: Itinerary) => {
      if (!selectedPreset) return;

      const disruption: DisruptionEvent = {
        id: `disruption-${Date.now()}`,
        type: selectedPreset.type as DisruptionType,
        label: selectedPreset.label,
        severity: customSeverity,
        affectedDayNumber: selectedDay,
        description: selectedPreset.description,
      };

      setIsSimulating(true);
      setSimulationError(null);

      try {
        const res = await fetch(API_ROUTES.disrupt, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itinerary, disruption }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? `Request failed: ${res.status}`);
        }

        const data: DisruptionResponse = await res.json();
        setSimulationResult(data);

        // Fire confetti on successful disruption simulation
        await fireDisruptionConfetti();
      } catch (err) {
        setSimulationError(
          err instanceof Error ? err.message : 'Simulation failed.'
        );
      } finally {
        setIsSimulating(false);
      }
    },
    [selectedPreset, selectedDay, customSeverity]
  );

  return {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    selectedPreset,
    selectPreset,
    selectedDay,
    setSelectedDay,
    customSeverity,
    setCustomSeverity,
    isSimulating,
    simulationResult,
    simulationError,
    simulate,
    clearResult,
  };
}
