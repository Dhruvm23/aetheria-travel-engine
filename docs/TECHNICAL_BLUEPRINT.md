# Aetheria Travel Engine: Technical Blueprint 🌌

## 1. Project Vision
Aetheria is a premium, AI-native travel concierge designed to transform natural language intent into high-fidelity, spatially-aware travel itineraries. It prioritizes **Resilience**, **Spatial Accuracy**, and **Security**.

---

## 2. Core Architecture: The Request Lifecycle

### Phase 1: NLP Prompt Parsing
When a user types a request (e.g., *"Budget 3-day trip to Tokyo"*), the frontend captures the intent alongside structured constraints (dates, budget, interests).
- **Location**: `src/components/trip-form/TripForm.tsx`
- **Logic**: Uses a conversational parser hook to pre-fill structured fields while preserving the raw natural language for the AI.

### Phase 2: Idempotency & The Performance Layer (SHA-256 Cache)
Before hitting the AI, the engine generates a unique **SHA-256 Hash** of the request parameters.
- **Location**: `src/app/api/plan/route.ts`
- **Benefit**: If an identical request is made, it is served in **<50ms** from the in-memory `itineraryCache`, bypassing LLM latency and cost.

### Phase 3: Agentic Reasoning (Gemini 3.1 Flash-Lite)
The request is dispatched to the **Gemini 3.1** engine with a high-context system prompt.
- **Location**: `src/lib/gemini.ts`
- **Output**: The AI is strictly instructed to return valid JSON matching the `Itinerary` interface.
- **Resilience**: A 45-second timeout ensures the app never hangs on stalled API calls.

### Phase 4: Validation & Spatial Mapping
The AI response is validated for schema integrity.
- **Location**: `src/lib/validators.ts`
- **Spatial Logic**: Coordinates are passed to the **Google Maps JS API** via a functional loader (`src/hooks/useMap.ts`).
- **Aesthetics**: Custom JSON styles suppress POIs to ensure a clean, "Night Mode" premium visualization.

---

## 3. Engineering "Moats"

### A. The Resilience Engine (Dual-Layer Fallback)
If the AI is unreachable (503/429) or returns invalid data:
1. The `POST /api/plan` route catches the error.
2. It triggers the **Procedural Fallback Generator**.
3. A functional, logic-based itinerary is served to the user so the experience never breaks.

### B. Security Architecture (Runtime Config API)
To prevent API key leakage:
- Keys are **not** hardcoded in the `Dockerfile` or source.
- We use `/api/config/route.ts` to serve keys at runtime.
- Keys are injected into the Google Cloud Run environment and hydrated by the client dynamically.

### C. The Disruption Engine
A dedicated logic layer (`/api/disrupt`) that allows "stress testing" an itinerary. It simulates weather or transit chaos and uses agentic reasoning to "patch" the itinerary in real-time.

---

## 4. Data Schemas (The Contract)

### Request Payload (`TripRequest`)
```typescript
{
  destination: string;
  startDate: string; // ISO 8601
  endDate: string;
  budget: "budget" | "moderate" | "luxury";
  interests: string[];
  accessibilityNeeds: AccessibilityNeeds;
  groupSize: number;
}
```

### Response Payload (`Itinerary`)
```typescript
{
  id: string;
  tripTitle: string;
  days: Array<{
    dayNumber: number;
    activities: Activity[];
    totalCost: CostEstimate;
  }>;
  totalEstimatedCost: CostEstimate;
}
```

---

## 5. Deployment Stack
- **Vertical**: Serverless Elastic Scaling.
- **Infrastructure**: Google Cloud Run (Revision-based deployments).
- **Security**: Non-root `nextjs` user inside the container (UID 1001).
- **Optimization**: Standalone Node.js output for minimal image size.
