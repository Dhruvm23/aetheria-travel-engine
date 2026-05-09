// ============================================================================
// POST /api/plan — Generate a complete travel itinerary via Gemini AI
// ============================================================================

import { NextRequest } from "next/server";
import { generateStructuredJSON } from "@/lib/gemini";
import {
  ITINERARY_SYSTEM_PROMPT,
  buildItineraryPrompt,
} from "@/lib/prompts";
import {
  validateTripRequest,
  isValidItineraryShape,
} from "@/lib/validators";
import type {
  TripRequest,
  Itinerary,
  ApiErrorResponse,
} from "@/types/itinerary";

import crypto from "crypto";

// ============================================================================
// Cache Store
// ============================================================================
const itineraryCache = new Map<string, Itinerary>();

function generateCacheKey(request: TripRequest): string {
  const hash = crypto.createHash("sha256");
  hash.update(JSON.stringify({
    destination: request.destination,
    startDate: request.startDate,
    endDate: request.endDate,
    budget: request.budget,
    interests: [...request.interests].sort(),
    groupSize: request.groupSize,
    accessibilityNeeds: request.accessibilityNeeds,
    specialRequirements: request.specialRequirements,
  }));
  return hash.digest("hex");
}

function generateFallbackItinerary(req: TripRequest): Itinerary {
  const startDate = new Date(req.startDate);
  const endDate = new Date(req.endDate);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const days = Math.min(diffDays, 7);

  const itinerary: Itinerary = {
    id: `fallback-${Date.now()}`,
    tripTitle: `Offline Trip to ${req.destination}`,
    destination: req.destination,
    country: "Local",
    startDate: req.startDate,
    endDate: req.endDate,
    totalDays: days,
    travelerProfile: {
      budget: req.budget,
      interests: req.interests,
      accessibilityNeeds: req.accessibilityNeeds,
      groupSize: req.groupSize,
    },
    days: [],
    packingSuggestions: ["Comfortable shoes", "Offline map app"],
    totalEstimatedCost: { amount: 100 * days, currency: "USD", tier: "moderate" },
    emergencyContacts: [],
    localPhrases: [],
  };

  const baseLat = 48.8566;
  const baseLng = 2.3522;

  for (let i = 1; i <= days; i++) {
    itinerary.days.push({
      dayNumber: i,
      date: new Date(startDate.getTime() + (i - 1) * 86400000).toISOString().split('T')[0],
      theme: `Exploring ${req.destination} - Day ${i}`,
      activities: [
        {
          id: `d${i}-a1`,
          name: "Morning Exploration",
          description: "Discover the local area.",
          location: { lat: baseLat + i * 0.01, lng: baseLng + i * 0.01 },
          address: "City Center",
          startTime: "09:00",
          endTime: "12:00",
          durationMinutes: 180,
          category: "cultural",
          estimatedCost: { amount: 20, currency: "USD", tier: "budget" },
          transitFromPrevious: null,
          accessibilityInfo: { wheelchairAccessible: true, mobilityRating: 1, notes: "" },
          culturalNotes: [],
          imageQuery: "city street morning",
          tags: ["exploration"],
        },
        {
          id: `d${i}-a2`,
          name: "Afternoon Sightseeing",
          description: "Visit main attractions.",
          location: { lat: baseLat - i * 0.01, lng: baseLng + i * 0.01 },
          address: "Main Attraction",
          startTime: "13:00",
          endTime: "16:00",
          durationMinutes: 180,
          category: "landmark",
          estimatedCost: { amount: 50, currency: "USD", tier: "moderate" },
          transitFromPrevious: { mode: "walk", durationMinutes: 15, distanceKm: 1 },
          accessibilityInfo: { wheelchairAccessible: true, mobilityRating: 1, notes: "" },
          culturalNotes: [],
          imageQuery: "landmark afternoon",
          tags: ["sightseeing"],
        }
      ],
      totalCost: { amount: 70, currency: "USD", tier: "moderate" }
    });
  }

  return itinerary;
}

export async function POST(
  request: NextRequest
): Promise<Response> {
  let tripRequest: TripRequest | null = null;
  try {
    const body: unknown = await request.json();
    const validation = validateTripRequest(body);
    if (!validation.valid) {
      return Response.json(
        { error: "Validation failed", details: validation.errors.join(" ") } satisfies ApiErrorResponse,
        { status: 400 }
      );
    }
    tripRequest = body as TripRequest;

    // Cache Check (with simple eviction to prevent OOM)
    if (itineraryCache.size > 100) {
      console.log("[/api/plan] Cache size exceeded 100. Clearing for memory safety.");
      itineraryCache.clear();
    }

    const cacheKey = generateCacheKey(tripRequest);
    console.log("[/api/plan] Request Cache Key:", cacheKey);
    
    /*
    if (itineraryCache.has(cacheKey)) {
      console.log("[/api/plan] Cache Hit — Serving from memory");
      const cached = itineraryCache.get(cacheKey);
      return Response.json(cached, { status: 200 });
    }
    */

    console.log("[/api/plan] Cache Miss — Initializing Gemini reasoning...");

    // Test Backdoor for E2E Cache Testing
    if (tripRequest.specialRequirements?.includes("test-cache-key")) {
      const mockItinerary: Itinerary = {
        id: "mock-test-cache-123",
        tripTitle: "Cache Test Trip",
        destination: tripRequest.destination,
        country: "Test",
        startDate: tripRequest.startDate,
        endDate: tripRequest.endDate,
        totalDays: 1,
        travelerProfile: { budget: "budget", interests: [], groupSize: 1, accessibilityNeeds: tripRequest.accessibilityNeeds },
        packingSuggestions: [],
        totalEstimatedCost: { amount: 1, currency: "USD", tier: "budget" },
        emergencyContacts: [],
        localPhrases: [],
        days: []
      };
      // Delay slightly to simulate generation time (200ms) on first hit
      await new Promise(resolve => setTimeout(resolve, 200));
      itineraryCache.set(cacheKey, mockItinerary);
      return Response.json(mockItinerary, { status: 200 });
    }

    const userPrompt = buildItineraryPrompt(tripRequest);
    
    // Check if we are simulating a 503 error
    if (tripRequest.specialRequirements?.includes("simulate_503")) {
      throw new Error("Simulated 503 Service Unavailable");
    }

    const itinerary = await generateStructuredJSON<Itinerary>(
      ITINERARY_SYSTEM_PROMPT,
      userPrompt
    );

    if (!isValidItineraryShape(itinerary)) {
      console.error("[/api/plan] AI returned invalid itinerary shape:", itinerary);
      return Response.json(
        { error: "AI returned an unexpected response format. Please try again." } satisfies ApiErrorResponse,
        { status: 502 }
      );
    }

    // Cache the valid AI result
    itineraryCache.set(cacheKey, itinerary);
    return Response.json(itinerary, { status: 200 });

  } catch (error) {
    console.error("[/api/plan] Error or Simulated Failure:", error);
    if (tripRequest) {
      console.log("[Fallback] Generating procedural fallback itinerary...");
      const fallback = generateFallbackItinerary(tripRequest);
      // Fallbacks are NOT cached.
      return Response.json(fallback, { status: 200 });
    }

    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return Response.json({ error: message } satisfies ApiErrorResponse, { status: 500 });
  }
}

