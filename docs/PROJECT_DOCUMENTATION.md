# Aetheria Travel Engine — Complete Technical Documentation

## Executive Summary

**Aetheria** is an AI-powered travel planning and experience engine built with **Next.js 16**, **React 19**, **Google Gemini AI**, and **Google Maps Platform**. It generates personalized, time-blocked travel itineraries, simulates real-time disruptions with intelligent re-planning, assesses terrain accessibility for mobility-impaired travelers, and provides cultural pocket guides with audio pronunciation assistance.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [APIs Used & Their Purposes](#apis-used--their-purposes)
4. [Application Flow](#application-flow)
5. [API Route Details](#api-route-details)
6. [Frontend Component Architecture](#frontend-component-architecture)
7. [State Management](#state-management)
8. [Edge Case Handling & Resilience](#edge-case-handling--resilience)
9. [Accessibility Features](#accessibility-features)
10. [Security Measures](#security-measures)
11. [Testing Strategy](#testing-strategy)
12. [Key Design Decisions](#key-design-decisions)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.6 |
| UI Library | React | 19.2.4 |
| AI Engine | Google Gemini (`@google/genai`) | 2.0.0 |
| Maps | Google Maps JS API (`@googlemaps/js-api-loader`) | 2.0.2 |
| Animation | Framer Motion | 12.38.0 |
| Icons | Lucide React | 1.14.0 |
| Styling | Tailwind CSS v4 | 4.x |
| Celebration Effects | canvas-confetti | 1.9.4 |
| E2E Testing | Playwright | 1.59.1 |
| Language | TypeScript | 5.x |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (CLIENT)                             │
│                                                                     │
│  ┌──────────────────┐      ┌───────────────────────────────────┐   │
│  │  TripForm         │      │  MapView (Google Maps JS API)     │   │
│  │  (NLP Prompt +    │      │  - Night Mode dark theme          │   │
│  │   Structured      │      │  - Markers + Polylines            │   │
│  │   Fields)         │      │  - Fly-to animations              │   │
│  └────────┬─────────┘      └───────────────────────────────────┘   │
│           │                                                         │
│  ┌────────▼─────────┐      ┌───────────────────────────────────┐   │
│  │ ItineraryTimeline │      │  TerrainRiskProfiler              │   │
│  │ + DayCard         │      │  (SVG Elevation Chart)            │   │
│  │ + ActivityCard    │      └───────────────────────────────────┘   │
│  │ + TransitConnect  │                                              │
│  └────────┬─────────┘      ┌───────────────────────────────────┐   │
│           │                 │  DisruptionDrawer                  │   │
│  ┌────────▼─────────┐      │  + DiffVisualizer                 │   │
│  │  PocketGuide      │      └───────────────────────────────────┘   │
│  │  Drawer           │                                              │
│  └──────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Next.js API       │
                    │   Routes (Server)   │
                    ├────────────────────┤
                    │ POST /api/plan      │──→ Gemini AI
                    │ POST /api/disrupt   │──→ Gemini AI
                    │ POST /api/tweak     │──→ Gemini AI
                    │ POST /api/pocket-guide│─→ Gemini AI
                    │ POST /api/terrain   │──→ Google Directions + Elevation API
                    │ GET  /api/config    │──→ Env variable resolver
                    └────────────────────┘
```

---

## APIs Used & Their Purposes

### 1. Google Gemini AI (Model: `gemini-3.1-flash-lite`)

| Endpoint Used | Purpose |
|---------------|---------|
| `POST /api/plan` | Generates complete multi-day travel itineraries with real venue names, GPS coordinates, costs, transit times, and cultural notes |
| `POST /api/disrupt` | Re-plans an itinerary intelligently when a disruption event occurs (weather, strikes, closures) |
| `POST /api/tweak` | Dynamically modifies an existing itinerary based on natural language instructions from the user |
| `POST /api/pocket-guide` | Generates cultural context, etiquette tips, pronunciation guides, fun facts for any venue |

**Configuration:**
- Model: `gemini-3.1-flash-lite`
- Temperature: 0.7 (creative but constrained)
- Top-P: 0.9
- Max Output Tokens: 8192
- Response MIME Type: `application/json` (forced structured output)
- Timeout: 45 seconds (custom timeout wrapper via `Promise.race`)

### 2. Google Maps Platform

| API | Purpose |
|-----|---------|
| **Maps JavaScript API** | Interactive map rendering with custom Night Mode dark theme, markers, polylines, fly-to animations |
| **Directions API** | Gets walking route polylines between two GPS coordinates for terrain analysis |
| **Elevation API** | Retrieves elevation data for sampled points along a route to compute slope and accessibility risk |

### 3. Web Speech Synthesis API (Browser Native)

| API | Purpose |
|-----|---------|
| `SpeechSynthesisUtterance` | Text-to-speech pronunciation of local phrases in the Pocket Guide, using BCP 47 language tags for authentic accents |

### 4. Google Fonts API

| API | Purpose |
|-----|---------|
| `next/font/google` (Inter) | Loads the Inter font family with weights 300–800 for the premium UI typography |

---

## Application Flow

### Primary User Journey

```
1. USER LANDS ON DASHBOARD
   └─→ SplitScreen layout renders: LeftPanel (form) + RightPanel (empty map)

2. USER FILLS TRIP FORM
   ├─→ Natural Language Prompt (NLP Parser auto-extracts budget, interests, group size)
   ├─→ Destination (required)
   ├─→ Start/End Dates (required)
   └─→ Optional: Budget, Interests, Group Size, Accessibility Needs, Special Requirements

3. USER CLICKS "Generate Itinerary"
   ├─→ Client: useItinerary hook fires POST /api/plan
   ├─→ Server: Validates request → Checks cache → Builds prompt → Calls Gemini AI
   ├─→ Server: Validates AI response shape → Caches result → Returns JSON
   ├─→ Client: Receives Itinerary → fires confetti → renders timeline
   └─→ Map: Markers placed at all activity GPS locations, polylines connect them

4. USER INTERACTS WITH ITINERARY
   ├─→ Click Activity → Map flies to location + PocketGuide drawer opens
   ├─→ Click Transit → TerrainRiskProfiler fetches elevation data
   └─→ Type in Tweak Bar → "Swap Colosseum for a museum" → AI regenerates itinerary

5. USER SIMULATES DISRUPTION (requires auth)
   ├─→ Click "Disrupt" FAB → DisruptionDrawer opens
   ├─→ Select disruption type, affected day, severity
   ├─→ Click "Simulate" → POST /api/disrupt → AI re-plans
   └─→ DiffVisualizer shows before/after changes with reasoning

6. USER VIEWS POCKET GUIDE
   ├─→ Click any activity → PocketGuideDrawer slides up
   ├─→ Shows: Cultural context, etiquette tips, pronunciation with TTS
   └─→ Optional: Photography tips, dress code, fun facts
```

### Authentication Flow

```
1. User is unauthenticated → sees "Disrupt (PRO)" button locked
2. Clicks locked button → SignInModal opens
3. Enters email + name → Mock auth creates session in localStorage
4. Session persists across reloads (rehydrated from localStorage)
5. Authenticated users get: Disruption Simulator, Save Trip
```

---

## API Route Details

### `POST /api/plan` — Itinerary Generation

**Request Body:**
```typescript
{
  destination: string;       // "Rome", "Tokyo", etc.
  startDate: string;         // ISO 8601: "2026-05-10"
  endDate: string;           // ISO 8601: "2026-05-15"
  budget: "budget" | "moderate" | "luxury";
  interests: string[];       // ["history", "food", "art"]
  groupSize: number;         // 1-12
  accessibilityNeeds: {
    wheelchairRequired: boolean;
    limitedMobility: boolean;
    visualImpairment: boolean;
    hearingImpairment: boolean;
    elderlyTraveler: boolean;
    notes?: string;
  };
  specialRequirements?: string;
}
```

**Response:** Full `Itinerary` object with days, activities, GPS coordinates, costs, transit info.

**Edge Cases Handled:**
- Invalid input → 400 with detailed validation errors
- Cache hit → Instant response from in-memory SHA-256 keyed cache
- Gemini timeout (45s) → Falls back to procedural fallback itinerary
- Gemini returns invalid JSON → 502 error
- Gemini returns wrong shape → 502 with "unexpected response format"
- Network failure → Procedural fallback (offline-mode itinerary)
- `simulate_503` flag → Testing backdoor for E2E fallback verification

---

### `POST /api/disrupt` — Disruption Re-Planning

**Request Body:**
```typescript
{
  itinerary: Itinerary;      // The current full itinerary
  disruption: {
    id: string;
    type: "weather_severe" | "flight_delayed" | "venue_closed" | "transit_strike" | "road_closure" | "medical_emergency" | "custom";
    label: string;
    severity: "low" | "medium" | "high" | "critical";
    affectedDayNumber: number;
    affectedTimeRange?: { start: string; end: string };
    description: string;
  }
}
```

**Response:** `DisruptionResponse` with original itinerary, adjusted itinerary, changes applied, and AI reasoning.

**Edge Cases Handled:**
- Missing itinerary → 400
- Invalid disruption type/severity → 400
- AI returns invalid shape → 502
- Network failure → 500 with error message

---

### `POST /api/terrain` — Terrain Risk Assessment

**Request Body:**
```typescript
{
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  accessibilityNeeds?: AccessibilityNeeds;
}
```

**Response:** `TerrainAssessment` with elevation profile, max/average slope %, risk level, warnings, alternative route suggestion.

**Processing Pipeline:**
1. Validate coordinates (lat: -90 to 90, lng: -180 to 180)
2. Get walking route from Google Directions API
3. Sample 50 points along the polyline
4. Get elevation for all 50 points (single batch request)
5. Compute slope between consecutive points using haversine distance
6. Assess risk with accessibility-adjusted thresholds (0.6x multiplier for wheelchair/elderly)
7. Generate contextual warnings
8. If challenging/inaccessible → suggest alternative route (taxi/transit)

**Edge Cases Handled:**
- No API key → 500
- Directions API returns no routes → Falls back to straight-line path
- Elevation API returns no results → throws error
- Less than 2 points → returns 0% slopes
- Accessibility multiplier reduces thresholds for vulnerable travelers

---

### `POST /api/pocket-guide` — Cultural Pocket Guide

**Request Body:**
```typescript
{
  venueName: string;   // "Colosseum"
  destination: string; // "Rome"
  country: string;     // "Italy"
}
```

**Response:** `PocketGuideContent` with cultural context, etiquette tips, pronunciation tips with BCP 47 language tags, fun facts, photography tips, dress code.

---

### `GET /api/config` — Runtime Configuration

Returns the Google Maps API key for client-side use when the environment variable isn't available at build time.

---

## Frontend Component Architecture

### Layout Structure

```
RootLayout (Server Component)
├── AuthProvider (Context)
├── DashboardHeader (Navigation + User Avatar)
├── SplitScreen (Client Component — orchestrator)
│   ├── LeftPanel (scrollable, 45%)
│   │   ├── TripForm (when no itinerary)
│   │   │   ├── NLP Prompt Textarea
│   │   │   ├── Destination Input
│   │   │   ├── Date Pickers
│   │   │   ├── Budget Radio Group
│   │   │   ├── Group Size Slider
│   │   │   ├── InterestGrid (12 options)
│   │   │   └── AccessibilityForm (5 toggles)
│   │   └── ItineraryTimeline (when itinerary exists)
│   │       ├── DayCard (per day)
│   │       │   ├── ActivityCard (per activity)
│   │       │   └── TransitConnector (between activities)
│   │       └── Tweak Input Bar
│   └── RightPanel (sticky, 55%)
│       ├── GlobalProgressBar
│       ├── AgentStreamConsole (AI reasoning display)
│       ├── MapView (Google Maps)
│       ├── Disrupt FAB
│       └── TerrainRiskProfiler (expandable below map)
├── DisruptionDrawer (slide-in panel)
│   ├── DisruptionCard (6 preset types)
│   ├── Day Selector
│   ├── Severity Selector
│   └── DiffVisualizer (before/after changes)
├── PocketGuideDrawer (bottom sheet)
│   ├── Cultural Context
│   ├── Local Etiquette
│   ├── PronunciationBtn (with TTS)
│   ├── Fun Facts
│   ├── Photography Tips
│   └── Dress Code
└── SignInModal
```

---

## State Management

The app uses a **hooks-based architecture** with no external state libraries. Each domain has its own custom hook:

| Hook | Purpose | Key State |
|------|---------|-----------|
| `useItinerary` | Manages itinerary generation, tweaking, and selection | `itinerary`, `isLoading`, `error`, `selectedActivity` |
| `useDisruption` | Manages disruption drawer UI and simulation | `isDrawerOpen`, `selectedPreset`, `simulationResult` |
| `useTerrain` | Manages terrain risk analysis | `assessment`, `isVisible`, `isLoading` |
| `usePocketGuide` | Manages pocket guide drawer and content | `isOpen`, `content`, `activity` |
| `useMap` | Google Maps lifecycle (markers, polylines, fly-to) | `isLoaded`, `isError`, markers/polylines refs |
| `usePromptParser` | NLP extraction from natural language prompt | Derived (no own state) |
| `useSpeechSynthesis` | Web Speech API wrapper for pronunciation | `isSpeaking`, `isSupported` |
| `useAuth` (context) | Auth state, sign-in modal, session persistence | `user`, `isSignInOpen` |

**Data Flow:**
```
SplitScreen (orchestrator)
├── useItinerary() → owns the primary itinerary state
├── useDisruption() → can override the active itinerary with adjusted version
├── useTerrain() → triggered from activity transit clicks
└── usePocketGuide() → triggered from activity selection
```

The `activeItinerary` is computed as:
```typescript
const activeItinerary = disruption.simulationResult?.adjustedItinerary ?? itinerary;
```

This means disruption changes overlay the original without mutating it.

---

## Edge Case Handling & Resilience

### 1. Offline / AI Failure Fallback

When Gemini AI is unreachable (network failure, timeout, 503):
- The `/api/plan` endpoint catches the error
- If the request body was valid, generates a **procedural fallback itinerary**
- Fallback uses generic activities ("Morning Exploration", "Afternoon Sightseeing")
- UI displays an **"Offline Mode Active"** warning banner
- The fallback ID starts with `fallback-` which the UI checks for the banner

### 2. Request Timeout Protection

```typescript
const timeoutPromise = new Promise<never>((_, reject) => {
  setTimeout(() => reject(new Error("Gemini API Request Timeout (45s)")), 45000);
});
const response = await Promise.race([apiCall, timeoutPromise]);
```

### 3. In-Memory Caching (SHA-256)

- Identical trip requests are hashed using SHA-256 (crypto module)
- Cache key is derived from: destination, dates, budget, sorted interests, groupSize, accessibility, specialRequirements
- Repeat requests return instantly from memory (verified by E2E test < 500ms)

### 4. Input Validation (Defense in Depth)

Every API route validates input before processing:
- Non-empty strings checked
- Date validity (ISO 8601 parsing)
- `endDate > startDate` enforcement
- Budget must be one of: `budget`, `moderate`, `luxury`
- Interests must be a non-empty array
- GroupSize must be a positive integer
- Lat/Lng must be within valid ranges (-90 to 90, -180 to 180)
- Disruption type and severity must match whitelisted enums

### 5. AI Response Shape Validation

After every Gemini API call, the response is validated:
```typescript
if (!isValidItineraryShape(itinerary)) {
  return Response.json({ error: "AI returned an unexpected response format." }, { status: 502 });
}
```

This prevents malformed AI outputs from crashing the frontend.

### 6. Prompt Injection Protection

User inputs are sanitized before being injected into AI prompts:
```typescript
function sanitizeInput(input: string): string {
  return input
    .replace(/[\x00-\x1f\x7f]/g, "")  // remove control characters
    .replace(/```/g, "")                // remove code fences
    .replace(/\\/g, "")                 // remove backslashes
    .slice(0, 500)                      // limit length
    .trim();
}
```

### 7. Directions API Fallback

When Google Directions returns no routes (e.g., for locations across oceans):
```typescript
if (!data.routes || data.routes.length === 0) {
  return [from, to]; // straight line between two points
}
```

### 8. Terrain Accessibility Multiplier

For vulnerable travelers (wheelchair, elderly, limited mobility), slope thresholds are reduced by 40%:
```typescript
const multiplier = (wheelchairRequired || limitedMobility || elderlyTraveler) ? 0.6 : 1.0;
```

This means a 5% slope (normally "safe") becomes "moderate" for wheelchair users.

### 9. Focus Trap & Keyboard Navigation

Both drawers (Disruption, PocketGuide) implement:
- Focus trap (Tab cycles within the drawer)
- Escape key closes the drawer
- Auto-focus on the close button when opened
- Proper `aria-modal="true"` semantics

### 10. Map Graceful Degradation

If Google Maps API key is missing:
- Map area shows a styled placeholder with grid overlay
- Displays activity count: "X locations planned"
- Instruction to add the API key
- No JavaScript errors thrown

### 11. Speech Synthesis Safety

```typescript
const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
```

TTS gracefully degrades on browsers without Web Speech API support.

### 12. SSR Safety

- `canvas-confetti` is dynamically imported (`import()`) to avoid SSR issues
- `useSpeechSynthesis` checks for `typeof window !== 'undefined'`
- Google Maps initialization is client-side only (`'use client'` directive)

---

## Accessibility Features

| Feature | Implementation |
|---------|---------------|
| ARIA Labels | Every interactive element has descriptive `aria-label` |
| ARIA Roles | Radio groups, regions, dialogs, status, alerts properly annotated |
| ARIA Live Regions | Dynamic content uses `aria-live="polite"` / `aria-live="assertive"` |
| Focus Management | Drawers trap focus, auto-focus on open |
| Keyboard Navigation | All actions accessible via Tab/Enter/Escape |
| Screen Reader Support | Loading states, errors, status changes announced |
| Color-blind safe | Risk levels use both color AND text labels |
| Mobility accommodation | Terrain profiler adjusts thresholds for wheelchair/elderly |
| Gesture handling | Map uses `cooperative` gesture handling (prevents accidental scroll) |

---

## Security Measures

| Concern | Mitigation |
|---------|-----------|
| API Key Exposure | `GEMINI_API_KEY` is server-only (never `NEXT_PUBLIC_`). Only Maps key is public. |
| Prompt Injection | User inputs sanitized (control chars, code fences, backslashes removed, 500 char limit) |
| Input Validation | All API routes validate payloads before processing |
| Session Storage | Auth session stored in localStorage (mock auth for demo) |
| CORS | Next.js default same-origin policy for API routes |
| Type Safety | Full TypeScript with strict types across client and server |
| Singleton Pattern | Gemini client instantiated once, preventing key leaks from re-initialization |

---

## Testing Strategy

### E2E Tests (Playwright)

The `e2e/aetheria.spec.ts` file tests 4 critical pillars:

| Test | What It Verifies |
|------|-----------------|
| **NLP Parser** | Natural language prompt ("Budget 3-day trip to Rome with history focus") correctly extracts `budget: 'budget'` and `interests: ['history']` |
| **Tweak Engine** | Typing "Swap activity 2 with a park" dynamically replaces "Colosseum" with "Villa Borghese Park" |
| **Auth Gating** | Save button shows "Login required", Disrupt shows "PRO" lock, both open SignInModal |
| **Fallback Engine** | `simulate_503` flag triggers offline mode, displays "Offline Mode Active" banner and procedural itinerary |
| **Caching** | Identical requests return in < 500ms on second call (in-memory SHA-256 cache verified) |

### Testing Backdoors

- `specialRequirements: "test-cache-key"` → Returns a mock itinerary and populates cache
- `specialRequirements: "simulate_503"` → Forces the AI call to throw, triggering fallback

---

## Key Design Decisions

### 1. Asymmetric Split-Screen Layout (45/55)
- Left panel: scrollable content (form → timeline)
- Right panel: sticky map + tools
- Mobile: single column, map hidden

### 2. Server-Side AI Calls Only
All Gemini AI calls happen in Next.js API routes, never on the client. This:
- Protects the API key
- Enables caching
- Allows response validation before sending to client
- Enables fallback logic

### 3. Structured JSON Output from AI
Using `responseMimeType: "application/json"` forces Gemini to return parseable JSON, eliminating markdown/commentary parsing issues.

### 4. Glassmorphism UI Design
Dark theme with glass-panel effects (`backdrop-blur`, semi-transparent borders) for a premium luxury travel aesthetic.

### 5. No External State Library
React hooks + context are sufficient for this app's complexity. Each domain (itinerary, disruption, terrain, pocket guide) is isolated in its own hook.

### 6. Polyline Decoding In-House
The Google polyline format is decoded server-side using a custom implementation (not a library), reducing dependencies.

### 7. Haversine Distance Calculation
Custom implementation for computing distances between GPS coordinates used in terrain slope calculations.

### 8. NLP Prompt Parser (Client-Side)
The `usePromptParser` hook runs regex-based extraction on the user's natural language input to auto-fill structured form fields (budget, interests, group size) without an API call.

---

## File Structure Summary

```
src/
├── app/
│   ├── api/
│   │   ├── plan/route.ts          # Itinerary generation + cache + fallback
│   │   ├── disrupt/route.ts       # Disruption re-planning
│   │   ├── tweak/route.ts         # Dynamic itinerary modification
│   │   ├── terrain/route.ts       # Elevation + slope risk assessment
│   │   ├── pocket-guide/route.ts  # Cultural context generation
│   │   └── config/route.ts        # Runtime config (Maps API key)
│   ├── layout.tsx                 # Root layout + AuthProvider
│   ├── page.tsx                   # Dashboard entry point
│   └── globals.css                # Tailwind + custom CSS variables
├── components/
│   ├── auth/                      # AuthContext, DashboardHeader, SignInModal
│   ├── dashboard/                 # SplitScreen, LeftPanel, RightPanel
│   ├── disruption/                # DisruptionDrawer, DisruptionCard, DiffVisualizer
│   ├── itinerary/                 # ItineraryTimeline, DayCard, ActivityCard, TransitConnector
│   ├── map/                       # MapView (Google Maps wrapper)
│   ├── pocket-guide/              # PocketGuideDrawer, PronunciationBtn
│   ├── terrain/                   # TerrainRiskProfiler (SVG chart)
│   ├── trip-form/                 # TripForm, InterestGrid, AccessibilityForm
│   └── ui/                        # LoadingShimmer, GlobalProgressBar, AgentStreamConsole, IconButton, GlassPanel
├── hooks/
│   ├── useItinerary.ts            # Plan + tweak + selection state
│   ├── useDisruption.ts           # Disruption simulation state
│   ├── useTerrain.ts              # Terrain assessment state
│   ├── usePocketGuide.ts          # Pocket guide state
│   ├── useMap.ts                  # Google Maps lifecycle
│   ├── usePromptParser.ts         # NLP extraction from prompt
│   └── useSpeechSynthesis.ts      # Web Speech API wrapper
├── lib/
│   ├── gemini.ts                  # Gemini AI client (singleton + structured JSON helper)
│   ├── maps.ts                    # Google Maps loader helpers
│   ├── prompts.ts                 # AI prompt templates + sanitization
│   ├── validators.ts              # Request validation + response shape guards
│   └── constants.ts               # Config (presets, categories, map styles, thresholds)
└── types/
    └── itinerary.ts               # All TypeScript interfaces (295 lines)
e2e/
└── aetheria.spec.ts               # Playwright E2E tests (4 pillars)
```

---

## Performance Optimizations

| Optimization | Impact |
|-------------|--------|
| In-memory SHA-256 cache | Repeat itinerary requests → instant response |
| Singleton Gemini client | No re-initialization overhead |
| `Promise.race` timeout | Prevents indefinite hangs |
| Dynamic imports (confetti) | No SSR overhead for browser-only libs |
| Framer Motion `AnimatePresence` | Smooth mount/unmount without layout shifts |
| Google Maps `cooperative` gesture | Prevents accidental scroll-zoom |
| `useCallback` memoization | Prevents unnecessary re-renders |
| Staggered animations | UI feels responsive without blocking paint |
| Batch elevation requests | Single API call for all 50 sample points |

---

## Summary of Unique Selling Points

1. **AI-Powered Itinerary Generation** — Real venue names, GPS coordinates, costs, transit times
2. **NLP Prompt Parsing** — Users type naturally, system auto-fills structured fields
3. **Real-Time Disruption Simulation** — Weather, strikes, closures with intelligent AI re-planning
4. **Terrain Accessibility Profiler** — Elevation analysis with wheelchair/elderly-adjusted thresholds
5. **Cultural Pocket Guides** — Etiquette, pronunciation with text-to-speech, fun facts
6. **Offline Fallback Engine** — Never crashes, always shows a usable itinerary
7. **Deterministic Caching** — SHA-256 keyed, instant repeat responses
8. **Premium Glass-dark UI** — Night-mode map, glassmorphism panels, confetti celebrations
9. **Full Accessibility** — ARIA, focus traps, keyboard navigation, screen reader support
10. **SaaS-Ready Auth Gating** — Premium features locked behind authentication

---

*Generated for jury presentation — Aetheria Travel Engine*
