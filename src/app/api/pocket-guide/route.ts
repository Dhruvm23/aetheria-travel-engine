// ============================================================================
// POST /api/pocket-guide — Cultural context & pronunciation tips via Gemini
// ============================================================================

import { NextRequest } from "next/server";
import { generateStructuredJSON } from "@/lib/gemini";
import {
  POCKET_GUIDE_SYSTEM_PROMPT,
  buildPocketGuidePrompt,
} from "@/lib/prompts";
import {
  validatePocketGuideRequest,
  isValidPocketGuideShape,
} from "@/lib/validators";
import type {
  PocketGuideContent,
  PocketGuideRequestBody,
  ApiErrorResponse,
} from "@/types/itinerary";

export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    // 1. Parse & validate
    const body: unknown = await request.json();
    const validation = validatePocketGuideRequest(body);
    if (!validation.valid) {
      return Response.json(
        { error: "Validation failed", details: validation.errors.join(" ") } satisfies ApiErrorResponse,
        { status: 400 }
      );
    }

    const { venueName, destination, country } = body as PocketGuideRequestBody;

    // 2. Build prompt and call Gemini
    const userPrompt = buildPocketGuidePrompt(venueName, destination, country);
    const guideContent = await generateStructuredJSON<PocketGuideContent>(
      POCKET_GUIDE_SYSTEM_PROMPT,
      userPrompt
    );

    // 3. Validate AI response shape
    if (!isValidPocketGuideShape(guideContent)) {
      console.error(
        "[/api/pocket-guide] AI returned invalid shape:",
        guideContent
      );
      return Response.json(
        {
          error: "AI returned an unexpected response format. Please try again.",
        } satisfies ApiErrorResponse,
        { status: 502 }
      );
    }

    return Response.json(guideContent, { status: 200 });
  } catch (error) {
    console.error("[/api/pocket-guide] Error:", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    return Response.json(
      { error: message } satisfies ApiErrorResponse,
      { status: 500 }
    );
  }
}
