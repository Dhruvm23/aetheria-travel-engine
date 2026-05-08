import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });

async function listModels() {
  try {
    console.log("Fetching available models...");
    // The SDK v2.0 uses ai.models.list()
    const response = await genAI.models.list();
    console.log("Available Models:");
    // Assuming response.models is the array based on common SDK patterns
    const models = response.models || response;
    if (Array.isArray(models)) {
      models.forEach((m) => {
        console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(", ")})`);
      });
    } else {
      console.log("Unexpected response format:", response);
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
