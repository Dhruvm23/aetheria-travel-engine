// ============================================================================
// Aetheria Travel Engine — Gemini AI Client (Server-Only)
// ============================================================================
// This file MUST only be imported from server-side code (API routes).
// It uses process.env.GEMINI_API_KEY which is never exposed to the browser.
// ============================================================================

import { GoogleGenAI } from "@google/genai";

let clientInstance: GoogleGenAI | null = null;

/**
 * Returns a singleton GoogleGenAI client instance.
 * Throws if GEMINI_API_KEY is not set.
 */
export function getGeminiClient(): GoogleGenAI {
  if (clientInstance) return clientInstance;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "[Aetheria] GEMINI_API_KEY is not set. " +
        "Add it to .env.local for local development."
    );
  }

  clientInstance = new GoogleGenAI({ apiKey });
  return clientInstance;
}

/** Default model for all Aetheria AI calls */
export const GEMINI_MODEL = "gemini-2.5-flash";

/**
 * Helper: Generate structured JSON content from Gemini.
 *
 * @param systemPrompt  - The system instruction for the AI persona
 * @param userPrompt    - The user-facing prompt with parameters
 * @returns Parsed JSON object from the AI response
 */
export async function generateStructuredJSON<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const ai = getGeminiClient();

  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Gemini API Request Timeout (90s)"));
    }, 90000);
  });

  try {
    const response = await Promise.race([
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 65536,
        },
      }),
      timeoutPromise
    ]);

    if (timeoutId!) clearTimeout(timeoutId);

    // Sanitization: Strip potential Markdown code fences
    // Using 'any' cast as some SDK type definitions lag behind the runtime property
    const rawText = (response as any).text || "";
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    if (!cleanText) {
      throw new Error("[Aetheria] Gemini returned an empty response.");
    }

    // Truncation detection: if JSON is cut off, it won't end with } or ]
    const lastChar = cleanText[cleanText.length - 1];
    if (lastChar !== "}" && lastChar !== "]") {
      console.error("[Aetheria] Truncated response detected. Last char:", lastChar, "| Length:", cleanText.length);
      throw new Error("[Aetheria] Gemini response was truncated (output token limit hit). Try a shorter request.");
    }

    try {
      return JSON.parse(cleanText) as T;
    } catch (err) {
      console.error("[Aetheria] JSON Parse Failure. Raw Text:", cleanText);
      throw new Error(
        `[Aetheria] Failed to parse Gemini JSON response. Start of text: ${cleanText.slice(0, 100)}`
      );
    }
  } catch (error) {
    if (timeoutId!) clearTimeout(timeoutId);
    throw error;
  }
}
