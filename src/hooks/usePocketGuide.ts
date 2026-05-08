'use client';

// ============================================================================
// usePocketGuide — Pocket guide state + /api/pocket-guide fetch
// ============================================================================

import { useState, useCallback } from 'react';
import type { Activity, PocketGuideContent } from '@/types/itinerary';
import { API_ROUTES } from '@/lib/constants';

export interface UsePocketGuideReturn {
  isOpen: boolean;
  activity: Activity | null;
  content: PocketGuideContent | null;
  isLoading: boolean;
  error: string | null;
  open: (activity: Activity, destination: string, country: string) => Promise<void>;
  close: () => void;
}

export function usePocketGuide(): UsePocketGuideReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [content, setContent] = useState<PocketGuideContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback(
    async (act: Activity, destination: string, country: string) => {
      setIsOpen(true);
      setActivity(act);
      setContent(null);
      setError(null);
      setIsLoading(true);

      try {
        const res = await fetch(API_ROUTES.pocketGuide, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            venueName: act.name,
            destination,
            country,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? `Request failed: ${res.status}`);
        }

        const data: PocketGuideContent = await res.json();
        setContent(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load pocket guide.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const close = useCallback(() => {
    setIsOpen(false);
    // Slight delay to allow exit animation before clearing content
    setTimeout(() => {
      setActivity(null);
      setContent(null);
      setError(null);
    }, 400);
  }, []);

  return { isOpen, activity, content, isLoading, error, open, close };
}
