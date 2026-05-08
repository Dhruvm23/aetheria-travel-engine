'use client';

// ============================================================================
// useMap — Google Maps lifecycle using @googlemaps/js-api-loader v2 functional API
// ============================================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Activity, LatLng } from '@/types/itinerary';
import { DARK_MAP_STYLE, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/lib/constants';

export interface UseMapReturn {
  mapRef: React.RefObject<HTMLDivElement | null>;
  isLoaded: boolean;
  isError: boolean;
  updateMarkers: (activities: Activity[]) => void;
  flyTo: (location: LatLng, zoom?: number) => void;
  highlightMarker: (activityId: string | null) => void;
  drawPolylines: (activities: Activity[]) => void;
  clearPolylines: () => void;
}

export function useMap(): UseMapReturn {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    let isMounted = true;

    (async () => {
      try {
        // 1. Resolve API key (from env or runtime fetch)
        let apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          try {
            const res = await fetch('/api/config');
            const data = await res.json();
            apiKey = data.googleMapsApiKey;
          } catch (e) {
            console.error('[useMap] Failed to fetch runtime config:', e);
          }
        }

        if (!apiKey) {
          if (isMounted) setIsError(true);
          return;
        }

        // 2. Initialize Map via @googlemaps/js-api-loader v2
        const { setOptions, importLibrary } = await import('@googlemaps/js-api-loader');

        setOptions({
          key: apiKey,
          v: 'weekly',
          libraries: ['geometry'],
        });

        // Load the core maps library
        const { Map: GoogleMap } = await importLibrary('maps') as google.maps.MapsLibrary;

        if (!isMounted || !mapRef.current) return;

        const map = new GoogleMap(mapRef.current, {
          center: MAP_DEFAULT_CENTER,
          zoom: MAP_DEFAULT_ZOOM,
          styles: DARK_MAP_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          gestureHandling: 'cooperative',
          backgroundColor: '#0d0f12',
        });

        mapInstanceRef.current = map;
        setIsLoaded(true);
      } catch (err) {
        console.error('[useMap] Failed to load Google Maps:', err);
        if (isMounted) setIsError(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateMarkers = useCallback((activities: Activity[]) => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();

    activities.forEach((activity, index) => {
      const marker = new google.maps.Marker({
        position: activity.location,
        map: mapInstanceRef.current!,
        title: activity.name,
        label: {
          text: String(index + 1),
          color: '#0d0f12',
          fontWeight: '700',
          fontSize: '11px',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 18,
          fillColor: '#d4a853',
          fillOpacity: 1,
          strokeColor: '#f5f0eb',
          strokeWeight: 2,
        },
      });
      markersRef.current.set(activity.id, marker);
    });

    if (activities.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      activities.forEach((a) => bounds.extend(a.location));
      mapInstanceRef.current.fitBounds(bounds, { top: 60, right: 40, bottom: 60, left: 40 });
    } else if (activities.length === 1) {
      mapInstanceRef.current.setCenter(activities[0].location);
      mapInstanceRef.current.setZoom(15);
    }
  }, []);

  const flyTo = useCallback((location: LatLng, zoom = 16) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.panTo(location);
    mapInstanceRef.current.setZoom(zoom);
  }, []);

  const highlightMarker = useCallback((activityId: string | null) => {
    markersRef.current.forEach((marker, id) => {
      const isHighlighted = id === activityId;
      marker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: isHighlighted ? 24 : 18,
        fillColor: isHighlighted ? '#4ecdc4' : '#d4a853',
        fillOpacity: 1,
        strokeColor: '#f5f0eb',
        strokeWeight: isHighlighted ? 3 : 2,
      });
      if (isHighlighted) {
        marker.setZIndex(100);
      }
    });
  }, []);

  const drawPolylines = useCallback((activities: Activity[]) => {
    if (!mapInstanceRef.current) return;

    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    for (let i = 1; i < activities.length; i++) {
      const from = activities[i - 1].location;
      const to = activities[i].location;

      const polyline = new google.maps.Polyline({
        path: [from, to],
        geodesic: true,
        strokeColor: '#4ecdc4',
        strokeOpacity: 0.6,
        strokeWeight: 2,
        map: mapInstanceRef.current,
        icons: [
          {
            icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3 },
            offset: '50%',
          },
        ],
      });

      polylinesRef.current.push(polyline);
    }
  }, []);

  const clearPolylines = useCallback(() => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
  }, []);

  return {
    mapRef,
    isLoaded,
    isError,
    updateMarkers,
    flyTo,
    highlightMarker,
    drawPolylines,
    clearPolylines,
  };
}
