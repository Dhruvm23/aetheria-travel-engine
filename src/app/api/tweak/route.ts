// ============================================================================
// POST /api/tweak — Dynamically adjust an existing itinerary
// ============================================================================

import { NextRequest } from "next/server";
import { generateStructuredJSON } from "@/lib/gemini";
import { ITINERARY_SYSTEM_PROMPT, buildTweakPrompt } from "@/lib/prompts";
import { isValidItineraryShape } from "@/lib/validators";
import type { Itinerary, ApiErrorResponse } from "@/types/itinerary";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { itinerary, tweakPrompt } = body;

    if (!itinerary || !tweakPrompt || typeof tweakPrompt !== "string") {
      return Response.json(
        { error: "Validation failed", details: "Missing itinerary or tweakPrompt" } satisfies ApiErrorResponse,
        { status: 400 }
      );
    }

    // 1. Build prompt
    const userPrompt = buildTweakPrompt(itinerary, tweakPrompt);

    // 2. Call Gemini (reusing the main ITINERARY_SYSTEM_PROMPT since we just want a modified Itinerary)
    const tweakedItinerary = await generateStructuredJSON<Itinerary>(
      ITINERARY_SYSTEM_PROMPT,
      userPrompt
    );

    // 3. Validate shape
    if (!isValidItineraryShape(tweakedItinerary)) {
      console.error("[/api/tweak] AI returned invalid itinerary shape:", tweakedItinerary);
      return Response.json(
        { error: "AI returned an unexpected format. Please try again." } satisfies ApiErrorResponse,
        { status: 502 }
      );
    }

    return Response.json(tweakedItinerary, { status: 200 });
  } catch (error) {
    console.error("[/api/tweak] Error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return Response.json({ error: message } satisfies ApiErrorResponse, { status: 500 });
  }
}
