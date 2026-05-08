'use client';

// ============================================================================
// useTerrain — Terrain risk assessment state + /api/terrain fetch
// ============================================================================

import { useState, useCallback } from 'react';
import type {
  LatLng,
  AccessibilityNeeds,
  TerrainAssessment,
} from '@/types/itinerary';
import { API_ROUTES } from '@/lib/constants';

export interface UseTerrainReturn {
  assessment: TerrainAssessment | null;
  isLoading: boolean;
  error: string | null;
  isVisible: boolean;
  fetchTerrain: (
    from: LatLng,
    to: LatLng,
    fromId: string,
    toId: string,
    accessibilityNeeds?: AccessibilityNeeds
  ) => Promise<void>;
  dismiss: () => void;
}

const DEFAULT_ACCESSIBILITY: AccessibilityNeeds = {
  wheelchairRequired: false,
  limitedMobility: false,
  visualImpairment: false,
  hearingImpairment: false,
  elderlyTraveler: false,
};

export function useTerrain(): UseTerrainReturn {
  const [assessment, setAssessment] = useState<TerrainAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchTerrain = useCallback(
    async (
      from: LatLng,
      to: LatLng,
      fromId: string,
      toId: string,
      accessibilityNeeds: AccessibilityNeeds = DEFAULT_ACCESSIBILITY
    ) => {
      setIsLoading(true);
      setError(null);
      setIsVisible(true);

      try {
        const res = await fetch(API_ROUTES.terrain, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to, accessibilityNeeds }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? `Terrain request failed: ${res.status}`);
        }

        const data: TerrainAssessment = await res.json();
        // Attach activity IDs from the calling context
        setAssessment({ ...data, fromActivity: fromId, toActivity: toId });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load terrain data.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const dismiss = useCallback(() => {
    setIsVisible(false);
    setAssessment(null);
    setError(null);
  }, []);

  return { assessment, isLoading, error, isVisible, fetchTerrain, dismiss };
}
