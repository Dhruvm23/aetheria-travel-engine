// ============================================================================
// Aetheria Travel Engine — Google Maps Loader (Client-Side)
// ============================================================================

import { Loader, importLibrary } from "@googlemaps/js-api-loader";

let initialized = false;

/**
 * Initializes the Google Maps JS API Loader with our API key.
 * Must be called before any importLibrary() calls.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function initMapsLoader(): void {
  if (initialized) return;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "[Aetheria] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set. " +
        "Add it to .env.local for local development."
    );
  }

  // The v2 API uses a singleton Loader that is configured once
  new Loader({
    apiKey,
    version: "weekly",
  });

  initialized = true;
}

/**
 * Loads the Google Maps "maps" library and returns its namespace.
 * Automatically initializes the loader if not already done.
 */
export async function loadMapsLibrary(): Promise<google.maps.MapsLibrary> {
  initMapsLoader();
  return importLibrary("maps") as Promise<google.maps.MapsLibrary>;
}

/**
 * Loads the Google Maps "marker" library.
 */
export async function loadMarkerLibrary(): Promise<google.maps.MarkerLibrary> {
  initMapsLoader();
  return importLibrary("marker") as Promise<google.maps.MarkerLibrary>;
}

/**
 * Loads the Google Maps "geometry" library.
 */
export async function loadGeometryLibrary(): Promise<google.maps.GeometryLibrary> {
  initMapsLoader();
  return importLibrary("geometry") as Promise<google.maps.GeometryLibrary>;
}
