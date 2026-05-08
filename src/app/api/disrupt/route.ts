// ============================================================================
// POST /api/disrupt — Re-plan itinerary based on a disruption event
// ============================================================================

import { NextRequest } from "next/server";
import { generateStructuredJSON } from "@/lib/gemini";
import {
  DISRUPTION_SYSTEM_PROMPT,
  buildDisruptionPrompt,
} from "@/lib/prompts";
import {
  validateDisruptionEvent,
  isValidDisruptionResponseShape,
} from "@/lib/validators";
import type {
  Itinerary,
  DisruptionEvent,
  DisruptionResponse,
  ApiErrorResponse,
} from "@/types/itinerary";

export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    // 1. Parse request body
    const body: unknown = await request.json();

    // 2. Validate input
    const validation = validateDisruptionEvent(body);
    if (!validation.valid) {
      return Response.json(
        { error: "Validation failed", details: validation.errors.join(" ") } satisfies ApiErrorResponse,
        { status: 400 }
      );
    }

    const { itinerary, disruption } = body as {
      itinerary: Itinerary;
      disruption: DisruptionEvent;
    };

    // 3. Build prompt and call Gemini
    const userPrompt = buildDisruptionPrompt(itinerary, disruption);
    const response = await generateStructuredJSON<DisruptionResponse>(
      DISRUPTION_SYSTEM_PROMPT,
      userPrompt
    );

    // 4. Validate AI response shape
    if (!isValidDisruptionResponseShape(response)) {
      console.error("[/api/disrupt] AI returned invalid shape:", response);
      return Response.json(
        {
          error: "AI returned an unexpected response format. Please try again.",
        } satisfies ApiErrorResponse,
        { status: 502 }
      );
    }

    // 5. Ensure the original itinerary is preserved in the response
    if (!response.originalItinerary) {
      response.originalItinerary = itinerary;
    }

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("[/api/disrupt] Error:", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    return Response.json(
      { error: message } satisfies ApiErrorResponse,
      { status: 500 }
    );
  }
}
