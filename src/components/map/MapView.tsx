'use client';

// ============================================================================
// MapView — Google Maps wrapper with Night Mode dark theme
// ============================================================================

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle } from 'lucide-react';
import { useMap } from '@/hooks/useMap';
import type { Activity } from '@/types/itinerary';

interface MapViewProps {
  activities: Activity[];
  selectedActivityId: string | null;
  onMarkerClick?: (activity: Activity) => void;
}

export function MapView({ activities, selectedActivityId, onMarkerClick }: MapViewProps) {
  const { mapRef, isLoaded, isError, updateMarkers, flyTo, highlightMarker, drawPolylines } = useMap();

  // Update markers when activities change
  useEffect(() => {
    if (!isLoaded) return;
    updateMarkers(activities);
    drawPolylines(activities);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, activities]);

  // Fly to selected activity & highlight its marker
  useEffect(() => {
    if (!isLoaded) return;
    if (selectedActivityId) {
      const activity = activities.find((a) => a.id === selectedActivityId);
      if (activity) {
        flyTo(activity.location);
        highlightMarker(selectedActivityId);
        onMarkerClick?.(activity);
      }
    } else {
      highlightMarker(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedActivityId, isLoaded]);

  if (isError) {
    return (
      <div
        role="img"
        aria-label="Map unavailable — Google Maps API key not configured"
        className="
          w-full h-full flex flex-col items-center justify-center
          bg-[#0d1117] border border-white/10 rounded-2xl
          gap-4
        "
      >
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-gold-subtle)] flex items-center justify-center">
          <MapPin size={28} className="text-[var(--accent-gold)]" aria-hidden="true" />
        </div>
        <div className="text-center max-w-xs">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Map Preview</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Set <code className="text-[var(--accent-gold)] bg-white/5 px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in{' '}
            <code className="text-[var(--accent-gold)] bg-white/5 px-1 py-0.5 rounded">.env.local</code> to enable the map
          </p>
        </div>
        {activities.length > 0 && (
          <div
            className="mt-2 text-xs text-[var(--text-muted)]"
            aria-live="polite"
          >
            {activities.length} location{activities.length !== 1 ? 's' : ''} planned
          </div>
        )}
        {/* Decorative grid overlay */}
        <div
          className="absolute inset-0 rounded-2xl opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(212,168,83,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212,168,83,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
          aria-hidden="true"
        />
        <AlertTriangle
          size={200}
          className="absolute opacity-[0.02] text-[var(--accent-gold)]"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" aria-label="Interactive map">
      {/* Loading overlay */}
      {!isLoaded && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-[#0d1117] rounded-2xl"
          role="status"
          aria-label="Loading map"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-gold-subtle)] flex items-center justify-center">
              <MapPin size={22} className="text-[var(--accent-gold)]" aria-hidden="true" />
            </div>
            <span className="text-xs text-[var(--text-muted)]">Loading map…</span>
          </motion.div>
        </div>
      )}

      {/* Google Maps mount point */}
      <div
        ref={mapRef}
        className="w-full h-full rounded-2xl"
        role="application"
        aria-label="Google Maps — Night Mode"
        tabIndex={0}
      />

      {/* Legend */}
      {isLoaded && activities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-4 left-4 glass-panel px-3 py-2 flex items-center gap-2"
          aria-label="Map legend"
        >
          <div className="w-3 h-3 rounded-full bg-[var(--accent-gold)]" aria-hidden="true" />
          <span className="text-xs text-[var(--text-muted)]">{activities.length} stops</span>
          <div className="w-px h-3 bg-white/10 mx-1" aria-hidden="true" />
          <div className="w-3 h-0.5 bg-[var(--accent-teal)] rounded-full" aria-hidden="true" />
          <span className="text-xs text-[var(--text-muted)]">Route</span>
        </motion.div>
      )}
    </div>
  );
}
