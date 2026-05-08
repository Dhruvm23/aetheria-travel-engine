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
export const GEMINI_MODEL = "gemini-3.1-flash-lite";

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

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error("Gemini API Request Timeout (45s)"));
    }, 45000);
  });

  const response = await Promise.race([
    ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 8192,
      },
    }),
    timeoutPromise
  ]);

  const text = response.text;
  if (!text) {
    throw new Error("[Aetheria] Gemini returned an empty response.");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `[Aetheria] Failed to parse Gemini JSON response: ${text.slice(0, 200)}`
    );
  }
}
