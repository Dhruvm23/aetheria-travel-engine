'use client';

// ============================================================================
// useItinerary — Itinerary state management + /api/plan fetch
// ============================================================================

import { useState, useCallback } from 'react';
import type { Itinerary, TripRequest, Activity } from '@/types/itinerary';
import { API_ROUTES } from '@/lib/constants';

// canvas-confetti — dynamically imported to avoid SSR issues
let confettiLoaded = false;
async function fireConfetti() {
  if (typeof window === 'undefined') return;
  if (!confettiLoaded) {
    confettiLoaded = true;
  }
  const confetti = (await import('canvas-confetti')).default;
  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.55 },
    colors: ['#d4a853', '#f0d78c', '#4ecdc4', '#f5f0eb'],
  });
}

export interface UseItineraryReturn {
  itinerary: Itinerary | null;
  isLoading: boolean;
  error: string | null;
  selectedActivity: Activity | null;
  generateItinerary: (request: TripRequest) => Promise<void>;
  tweakItinerary: (prompt: string) => Promise<void>;
  selectActivity: (activity: Activity | null) => void;
  clearItinerary: () => void;
}

export function useItinerary(): UseItineraryReturn {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const generateItinerary = useCallback(async (request: TripRequest) => {
    setIsLoading(true);
    setError(null);
    setItinerary(null);
    setSelectedActivity(null);

    try {
      const res = await fetch(API_ROUTES.plan, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Request failed: ${res.status}`);
      }

      const data: Itinerary = await res.json();
      setItinerary(data);

      // Fire confetti on successful itinerary load, do not block the UI
      fireConfetti().catch(console.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const tweakItinerary = useCallback(async (prompt: string) => {
    if (!itinerary) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tweak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary, tweakPrompt: prompt }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Request failed: ${res.status}`);
      }

      const data: Itinerary = await res.json();
      setItinerary(data);
      setSelectedActivity(null);
      fireConfetti().catch(console.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while tweaking.');
    } finally {
      setIsLoading(false);
    }
  }, [itinerary]);

  const selectActivity = useCallback((activity: Activity | null) => {
    setSelectedActivity(activity);
  }, []);

  const clearItinerary = useCallback(() => {
    setItinerary(null);
    setSelectedActivity(null);
    setError(null);
  }, []);

  return {
    itinerary,
    isLoading,
    error,
    selectedActivity,
    generateItinerary,
    tweakItinerary,
    selectActivity,
    clearItinerary,
  };
}
