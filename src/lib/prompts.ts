// ============================================================================
// Aetheria Travel Engine — AI Prompt Templates
// ============================================================================

import type { TripRequest, Itinerary, DisruptionEvent } from "@/types/itinerary";

// ---------------------------------------------------------------------------
// System Prompts
// ---------------------------------------------------------------------------

export const ITINERARY_SYSTEM_PROMPT = `You are Aetheria, a world-class AI travel planning engine. You create meticulously detailed, time-blocked travel itineraries optimized for the traveler's preferences, budget, and accessibility needs.

RULES:
1. Generate realistic activities with REAL venue names, addresses, and accurate GPS coordinates (lat/lng).
2. Ensure chronological ordering — no overlapping times. Include realistic transit durations between venues.
3. Respect the budget tier: "budget" = affordable/free options; "moderate" = mid-range; "luxury" = premium/VIP.
4. If accessibility needs are specified, prioritize wheelchair-accessible venues and avoid high-mobility-rating locations.
5. Include cultural notes, local phrases, emergency contacts, and packing suggestions for the destination.
6. Generate unique IDs for each activity using the pattern "act-{dayNumber}-{index}" (e.g., "act-1-1", "act-1-2").
7. Set the itinerary ID to "itin-" followed by the destination slug (e.g., "itin-rome").
8. Each day should have 4-6 activities with realistic timing (breakfast, morning activity, lunch, afternoon, dinner, optional evening).
9. transitFromPrevious should be null for the first activity of each day.
10. Respond ONLY with valid JSON matching the Itinerary schema. No markdown, no commentary.`;

export const DISRUPTION_SYSTEM_PROMPT = `You are Aetheria's Disruption Resolution Engine. Given an existing travel itinerary and a disruption event, you must intelligently adjust the itinerary to accommodate the disruption.

RULES:
1. Analyze the disruption type, severity, affected day, and time range.
2. Make minimal but effective changes — preserve as much of the original itinerary as possible.
3. For weather disruptions: move outdoor activities indoors or reschedule to different times/days.
4. For delays: compress or shift subsequent activities, removing lower-priority ones if needed.
5. For closures: find equivalent alternative venues nearby with similar categories.
6. For medical emergencies: clear the affected time range and add rest/recovery time.
7. Track every change in the changesApplied array with clear reasons.
8. Maintain realistic transit times between rearranged activities.
9. Preserve the original itinerary's budget tier and accessibility constraints.
10. Provide a brief reasoning summary explaining your re-planning logic.
11. Respond ONLY with valid JSON matching the DisruptionResponse schema. No markdown, no commentary.`;

export const POCKET_GUIDE_SYSTEM_PROMPT = `You are Aetheria's Cultural Pocket Guide — an expert on local customs, etiquette, and language for destinations worldwide.

RULES:
1. Provide rich, authentic cultural context for the specific venue/location.
2. Include 3-5 local etiquette tips relevant to the venue type (restaurant, temple, museum, etc.).
3. Generate 3-5 useful phrases in the local language with accurate phonetic pronunciations.
4. Use BCP 47 language tags (e.g., "it-IT" for Italian, "ja-JP" for Japanese).
5. Include 2-3 fun facts about the venue or its cultural significance.
6. Add photography tips if relevant (restrictions, best angles, golden hour).
7. Add dress code information if applicable (religious sites, fine dining).
8. Respond ONLY with valid JSON matching the PocketGuideContent schema. No markdown, no commentary.`;

// ---------------------------------------------------------------------------
// User Prompt Builders
// ---------------------------------------------------------------------------

/**
 * Builds the user prompt for itinerary generation.
 * User input is parameterized — never directly concatenated into instructions.
 */
export function buildItineraryPrompt(request: TripRequest): string {
  const accessibilityDetails = [
    request.accessibilityNeeds.wheelchairRequired && "wheelchair access required",
    request.accessibilityNeeds.limitedMobility && "limited mobility",
    request.accessibilityNeeds.visualImpairment && "visual impairment accommodations",
    request.accessibilityNeeds.hearingImpairment && "hearing impairment accommodations",
    request.accessibilityNeeds.elderlyTraveler && "elderly-friendly venues preferred",
    request.accessibilityNeeds.notes,
  ]
    .filter(Boolean)
    .join("; ");

  return `Generate a complete travel itinerary with the following parameters:

DESTINATION: ${sanitizeInput(request.destination)}
DATES: ${sanitizeInput(request.startDate)} to ${sanitizeInput(request.endDate)}
BUDGET TIER: ${sanitizeInput(request.budget)}
GROUP SIZE: ${request.groupSize}
INTERESTS: ${request.interests.map(sanitizeInput).join(", ")}
ACCESSIBILITY NEEDS: ${accessibilityDetails || "None specified"}
${request.specialRequirements ? `SPECIAL REQUIREMENTS: ${sanitizeInput(request.specialRequirements)}` : ""}

Generate the itinerary as a JSON object matching this TypeScript interface:

interface Itinerary {
  id: string;
  destination: string;
  country: string;
  tripTitle: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  travelerProfile: { groupSize: number; budget: string; interests: string[]; accessibilityNeeds: object };
  days: Array<{
    dayNumber: number;
    date: string;
    theme: string;
    activities: Array<{
      id: string;
      name: string;
      category: string;
      location: { lat: number; lng: number };
      address: string;
      startTime: string;
      endTime: string;
      durationMinutes: number;
      description: string;
      estimatedCost: { amount: number; currency: string; tier: string };
      transitFromPrevious: { mode: string; durationMinutes: number; distanceKm: number } | null;
      accessibilityInfo: { wheelchairAccessible: boolean; mobilityRating: number; notes: string };
      culturalNotes: string[];
      imageQuery: string;
      tags: string[];
    }>;
    totalCost: { amount: number; currency: string; tier: string };
    weatherForecast: { condition: string; tempCelsius: number; humidity: number; icon: string };
  }>;
  totalEstimatedCost: { amount: number; currency: string; tier: string };
  emergencyContacts: Array<{ name: string; number: string; type: string }>;
  packingSuggestions: string[];
  localPhrases: Array<{ phrase: string; meaning: string; phoneticGuide: string; context: string }>;
}`;
}

/**
 * Builds the user prompt for disruption re-planning.
 */
export function buildDisruptionPrompt(
  itinerary: Itinerary,
  disruption: DisruptionEvent
): string {
  return `An existing travel itinerary needs to be adjusted due to a disruption.

DISRUPTION DETAILS:
- Type: ${sanitizeInput(disruption.type)}
- Label: ${sanitizeInput(disruption.label)}
- Severity: ${sanitizeInput(disruption.severity)}
- Affected Day: Day ${disruption.affectedDayNumber}
${disruption.affectedTimeRange ? `- Affected Time: ${sanitizeInput(disruption.affectedTimeRange.start)} to ${sanitizeInput(disruption.affectedTimeRange.end)}` : "- Affected Time: Entire day"}
- Description: ${sanitizeInput(disruption.description)}

CURRENT ITINERARY:
${JSON.stringify(itinerary, null, 2)}

Adjust the itinerary to handle this disruption. Return a JSON object matching this interface:

interface DisruptionResponse {
  originalItinerary: Itinerary;  // the original, unchanged
  adjustedItinerary: Itinerary;  // the modified version
  changesApplied: Array<{
    dayNumber: number;
    activityId: string;
    changeType: "rescheduled" | "replaced" | "removed" | "added";
    before: object | null;
    after: object | null;
    reason: string;
  }>;
  reasoning: string;  // brief summary of re-planning logic
}`;
}

/**
 * Builds the user prompt for pocket guide content.
 */
export function buildPocketGuidePrompt(
  venueName: string,
  destination: string,
  country: string
): string {
  return `Generate cultural pocket guide content for:

VENUE: ${sanitizeInput(venueName)}
DESTINATION: ${sanitizeInput(destination)}
COUNTRY: ${sanitizeInput(country)}

Return a JSON object matching this interface:

interface PocketGuideContent {
  venueName: string;
  culturalContext: string;
  localEtiquette: string[];
  pronunciationTips: Array<{
    phrase: string;
    meaning: string;
    phoneticGuide: string;
    language: string;  // BCP 47 tag
  }>;
  funFacts: string[];
  photographyTips?: string;
  dressCode?: string;
}`;
}

/**
 * Builds the user prompt for dynamic itinerary tweaks.
 */
export function buildTweakPrompt(
  itinerary: Itinerary,
  tweakPrompt: string
): string {
  return `The user has requested an adjustment to their existing travel itinerary.

EXISTING ITINERARY:
${JSON.stringify(itinerary, null, 2)}

USER REQUESTED ADJUSTMENT:
"${sanitizeInput(tweakPrompt)}"

Instructions:
1. Apply the user's requested adjustment to the itinerary.
2. If they ask to replace an activity, swap it out with a realistic alternative that matches their request.
3. If they ask to remove an activity, remove it and adjust the timing of the remaining activities if necessary.
4. If they ask to add something, add it and adjust the timing.
5. If they want to change the budget, re-evaluate all costs.
6. Make sure the chronological order and realistic transit times are preserved.
7. Return the ENTIRE modified itinerary as a JSON object matching the standard Itinerary interface.
`;
}

// ---------------------------------------------------------------------------
// Input Sanitization
// ---------------------------------------------------------------------------

/**
 * Sanitizes user input to prevent prompt injection.
 * Removes control characters and trims excessive length.
 */
function sanitizeInput(input: string): string {
  return input
    .replace(/[\x00-\x1f\x7f]/g, "") // remove control characters
    .replace(/```/g, "")              // remove code fence markers
    .replace(/\\/g, "")               // remove backslashes
    .slice(0, 500)                    // limit length
    .trim();
}
