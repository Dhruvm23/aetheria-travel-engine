// ============================================================================
// POST /api/terrain — Terrain Risk Assessment via Google Elevation API
// ============================================================================

import { NextRequest } from "next/server";
import { validateTerrainRequest } from "@/lib/validators";
import { ELEVATION_SAMPLE_COUNT, SLOPE_THRESHOLDS } from "@/lib/constants";
import type {
  LatLng,
  AccessibilityNeeds,
  TerrainAssessment,
  ElevationPoint,
  TerrainRiskLevel,
  SurfaceType,
  TerrainRequestBody,
  ApiErrorResponse,
} from "@/types/itinerary";

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    // 1. Parse & validate
    const body: unknown = await request.json();
    const validation = validateTerrainRequest(body);
    if (!validation.valid) {
      return Response.json(
        { error: "Validation failed", details: validation.errors.join(" ") } satisfies ApiErrorResponse,
        { status: 400 }
      );
    }

    if (!MAPS_API_KEY) {
      return Response.json(
        { error: "Google Maps API key is not configured." } satisfies ApiErrorResponse,
        { status: 500 }
      );
    }

    const { from, to, accessibilityNeeds } = body as TerrainRequestBody;

    // 2. Get route path from Google Directions API
    const routePath = await getRoutePath(from, to);

    // 3. Sample points along the route
    const samplePoints = sampleAlongPath(routePath, ELEVATION_SAMPLE_COUNT);

    // 4. Get elevation data for sampled points
    const elevationProfile = await getElevations(samplePoints);

    // 5. Compute slope analysis
    const { maxSlopePercent, averageSlopePercent } =
      computeSlopes(elevationProfile);

    // 6. Determine risk level
    const riskLevel = assessRisk(maxSlopePercent, accessibilityNeeds);

    // 7. Generate warnings
    const warnings = generateWarnings(
      maxSlopePercent,
      averageSlopePercent,
      riskLevel,
      accessibilityNeeds
    );

    // 8. Build response
    const assessment: TerrainAssessment = {
      fromActivity: "",
      toActivity: "",
      elevationProfile,
      maxSlopePercent: Math.round(maxSlopePercent * 10) / 10,
      averageSlopePercent: Math.round(averageSlopePercent * 10) / 10,
      surfaceType: "unknown" as SurfaceType,
      riskLevel,
      warnings,
    };

    // 9. If challenging or worse, suggest a flatter alternative
    if (riskLevel === "challenging" || riskLevel === "inaccessible") {
      assessment.alternativeRoute = {
        description:
          "Consider using public transit or a taxi for this segment to avoid steep terrain.",
        maxSlopePercent: Math.round(maxSlopePercent * 0.3 * 10) / 10,
        riskLevel: "safe",
        additionalMinutes: 5,
      };
    }

    return Response.json(assessment, { status: 200 });
  } catch (error) {
    console.error("[/api/terrain] Error:", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    return Response.json(
      { error: message } satisfies ApiErrorResponse,
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Google Directions API — get route polyline points
// ---------------------------------------------------------------------------

async function getRoutePath(from: LatLng, to: LatLng): Promise<LatLng[]> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/directions/json"
  );
  url.searchParams.set("origin", `${from.lat},${from.lng}`);
  url.searchParams.set("destination", `${to.lat},${to.lng}`);
  url.searchParams.set("mode", "walking");
  url.searchParams.set("key", MAPS_API_KEY!);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Directions API returned ${res.status}`);
  }

  const data = await res.json();

  if (!data.routes || data.routes.length === 0) {
    // Fallback: straight line between two points
    return [from, to];
  }

  // Decode the overview polyline
  const encoded: string = data.routes[0].overview_polyline.points;
  return decodePolyline(encoded);
}

// ---------------------------------------------------------------------------
// Google Elevation API — get elevation for points
// ---------------------------------------------------------------------------

async function getElevations(
  points: LatLng[]
): Promise<ElevationPoint[]> {
  // Batch all points into a single request (pipe-separated)
  const locations = points
    .map((p) => `${p.lat},${p.lng}`)
    .join("|");

  const url = new URL(
    "https://maps.googleapis.com/maps/api/elevation/json"
  );
  url.searchParams.set("locations", locations);
  url.searchParams.set("key", MAPS_API_KEY!);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Elevation API returned ${res.status}`);
  }

  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("Elevation API returned no results.");
  }

  // Compute cumulative distance
  let cumulativeDistance = 0;
  const elevationProfile: ElevationPoint[] = data.results.map(
    (
      result: { elevation: number; location: { lat: number; lng: number } },
      index: number
    ) => {
      if (index > 0) {
        cumulativeDistance += haversineDistance(
          points[index - 1],
          points[index]
        );
      }

      return {
        location: {
          lat: result.location.lat,
          lng: result.location.lng,
        },
        elevation: result.elevation,
        distanceFromStart: Math.round(cumulativeDistance),
      };
    }
  );

  return elevationProfile;
}

// ---------------------------------------------------------------------------
// Slope Computation
// ---------------------------------------------------------------------------

function computeSlopes(profile: ElevationPoint[]): {
  maxSlopePercent: number;
  averageSlopePercent: number;
} {
  if (profile.length < 2) {
    return { maxSlopePercent: 0, averageSlopePercent: 0 };
  }

  let maxSlope = 0;
  let totalSlope = 0;
  let segments = 0;

  for (let i = 1; i < profile.length; i++) {
    const dx = profile[i].distanceFromStart - profile[i - 1].distanceFromStart;
    if (dx <= 0) continue;

    const dy = Math.abs(profile[i].elevation - profile[i - 1].elevation);
    const slopePercent = (dy / dx) * 100;

    maxSlope = Math.max(maxSlope, slopePercent);
    totalSlope += slopePercent;
    segments++;
  }

  return {
    maxSlopePercent: maxSlope,
    averageSlopePercent: segments > 0 ? totalSlope / segments : 0,
  };
}

// ---------------------------------------------------------------------------
// Risk Assessment
// ---------------------------------------------------------------------------

function assessRisk(
  maxSlopePercent: number,
  accessibilityNeeds?: AccessibilityNeeds
): TerrainRiskLevel {
  // Adjust thresholds for accessibility-constrained users
  const multiplier =
    accessibilityNeeds?.wheelchairRequired ||
    accessibilityNeeds?.limitedMobility ||
    accessibilityNeeds?.elderlyTraveler
      ? 0.6 // stricter thresholds
      : 1.0;

  const thresholds = {
    safe: SLOPE_THRESHOLDS.safe * multiplier,
    moderate: SLOPE_THRESHOLDS.moderate * multiplier,
    challenging: SLOPE_THRESHOLDS.challenging * multiplier,
  };

  if (maxSlopePercent <= thresholds.safe) return "safe";
  if (maxSlopePercent <= thresholds.moderate) return "moderate";
  if (maxSlopePercent <= thresholds.challenging) return "challenging";
  return "inaccessible";
}

// ---------------------------------------------------------------------------
// Warnings Generator
// ---------------------------------------------------------------------------

function generateWarnings(
  maxSlope: number,
  avgSlope: number,
  riskLevel: TerrainRiskLevel,
  accessibilityNeeds?: AccessibilityNeeds
): string[] {
  const warnings: string[] = [];

  if (riskLevel === "inaccessible") {
    warnings.push(
      `Maximum slope of ${maxSlope.toFixed(1)}% exceeds safe limits. This route is not recommended.`
    );
  }
  if (riskLevel === "challenging") {
    warnings.push(
      `Challenging terrain detected with slopes up to ${maxSlope.toFixed(1)}%. Proceed with caution.`
    );
  }
  if (accessibilityNeeds?.wheelchairRequired && riskLevel !== "safe") {
    warnings.push(
      "This route may not be suitable for wheelchair users. Consider an alternative."
    );
  }
  if (accessibilityNeeds?.elderlyTraveler && avgSlope > 5) {
    warnings.push(
      `Average slope of ${avgSlope.toFixed(1)}% may be tiring for elderly travelers.`
    );
  }
  if (accessibilityNeeds?.limitedMobility && maxSlope > 8) {
    warnings.push(
      "Steep sections detected. A mobility aid or assistance may be needed."
    );
  }

  return warnings;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Samples N evenly-spaced points along a polyline path.
 */
function sampleAlongPath(path: LatLng[], count: number): LatLng[] {
  if (path.length <= count) return path;

  const sampled: LatLng[] = [];
  const step = (path.length - 1) / (count - 1);

  for (let i = 0; i < count; i++) {
    const index = Math.round(i * step);
    sampled.push(path[Math.min(index, path.length - 1)]);
  }

  return sampled;
}

/**
 * Decodes a Google encoded polyline string into LatLng points.
 * Reference: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let b: number;

    // Decode latitude
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    // Decode longitude
    result = 0;
    shift = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

/**
 * Haversine distance between two coordinates in meters.
 */
function haversineDistance(a: LatLng, b: LatLng): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;

  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
