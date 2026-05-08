# Aetheria — Implementation Plan

> **Version:** 1.0  
> **Last Updated:** 2026-05-08  
> **Status:** Awaiting Approval

---

## Goal

Build the complete Aetheria Travel Planning Engine across three phases, delivering a production-quality, premium dark-mode split-screen dashboard with AI-powered itinerary generation, real-time disruption simulation, terrain risk profiling, and an agentic pocket guide.

---

## User Review Required

> [!IMPORTANT]
> **API Keys:** Before Phase 2 can be tested, you need to provide:
> - `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/apikey)
> - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) with Maps JavaScript API, Elevation API, and Directions API enabled
> 
> These will be placed in `.env.local`.

> [!WARNING]
> **Google Maps API Billing:** The Terrain Risk Profiler uses the Elevation API and Directions API, which incur per-request charges. The Elevation API is sampled at 50 points per route to minimize cost. Ensure billing is enabled and budget alerts are set.

> [!IMPORTANT]
> **Tailwind CSS v4:** The project uses Tailwind v4 (installed by `create-next-app`). Tailwind v4 uses a CSS-first configuration model — no `tailwind.config.js`. All custom theme tokens will be defined in `globals.css` using `@theme`.

---

## Resolved Decisions

1. **Map Style:** ✅ Dark night-mode styled Google Maps to seamlessly match the premium `#0d0f12` background.

2. **Disruption Presets:** ✅ Support both the 6 preset scenarios AND a custom free-text input box for dynamic disruption scenarios.

3. **Confetti:** ✅ Trigger `canvas-confetti` on both successful itinerary generation AND successful disruption resolution.

---

## Proposed Changes

### Phase 1 — TypeScript Schema + Foundation

> Core types, design system, and project structure.

#### [NEW] [itinerary.ts](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/types/itinerary.ts)
- All TypeScript interfaces and types as defined in SPEC.md Section 4
- Exported types: `Itinerary`, `Activity`, `TripRequest`, `DisruptionEvent`, `DisruptionResponse`, `TerrainAssessment`, `PocketGuideContent`, etc.

#### [MODIFY] [globals.css](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/app/globals.css)
- Replace default styles with Aetheria design system
- Define CSS custom properties for all color tokens from SPEC Section 7.1
- Configure Tailwind v4 `@theme` block with custom colors, fonts, and breakpoints
- Import Inter font from Google Fonts
- Add glassmorphism utility classes
- Add shimmer/loading animation keyframes
- Add `prefers-reduced-motion` overrides

#### [NEW] [constants.ts](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/lib/constants.ts)
- Disruption type presets with labels, icons, and severity defaults
- Activity category icon mappings
- Budget tier configurations
- Map default center and zoom level

---

### Phase 2 — Backend API Routes

> All four server-side API routes powered by Gemini.

#### [NEW] [gemini.ts](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/lib/gemini.ts)
- Server-only Gemini client singleton using `@google/genai`
- `GoogleGenAI` initialization with `process.env.GEMINI_API_KEY`
- Utility: `generateStructuredContent<T>(prompt, schema)` wrapper

#### [NEW] [prompts.ts](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/lib/prompts.ts)
- System prompt for itinerary generation (travel expert persona)
- System prompt for disruption re-planning
- System prompt for pocket guide cultural context
- All prompts parameterized — user input injected via template literals with sanitization

#### [NEW] [validators.ts](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/lib/validators.ts)
- Runtime validation functions for all request/response types
- `validateTripRequest()`, `validateDisruptionEvent()`
- Type guards for AI response shape validation

#### [NEW] [route.ts (plan)](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/app/api/plan/route.ts)
- `POST` handler accepting `TripRequest`
- Validates input → builds prompt → calls Gemini with `responseMimeType: 'application/json'`
- Parses and validates response → returns `Itinerary`
- Error handling with meaningful HTTP status codes

#### [NEW] [route.ts (disrupt)](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/app/api/disrupt/route.ts)
- `POST` handler accepting current `Itinerary` + `DisruptionEvent`
- Re-prompts Gemini with disruption context
- Returns `DisruptionResponse` with change diff

#### [NEW] [route.ts (terrain)](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/app/api/terrain/route.ts)
- `POST` handler accepting `from`/`to` coordinates + `AccessibilityNeeds`
- Calls Google Directions API for route geometry
- Samples 50 points along route → calls Google Elevation API
- Computes max/avg slope percentages
- Evaluates risk level based on accessibility needs
- Returns `TerrainAssessment`

#### [NEW] [route.ts (pocket-guide)](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/app/api/pocket-guide/route.ts)
- `POST` handler accepting venue name + destination context
- Gemini generates `PocketGuideContent` with cultural tips and pronunciations
- Returns structured JSON

---

### Phase 3 — Premium Dashboard UI

> All client components, hooks, and the main page.

#### Hooks Layer

#### [NEW] [useItinerary.ts](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/hooks/useItinerary.ts)
- State: `itinerary`, `isLoading`, `error`, `selectedActivity`
- Actions: `generateItinerary(request)`, `selectActivity(id)`, `clearItinerary()`
- Manages fetch to `/api/plan`

#### [NEW] [useDisruption.ts](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/hooks/useDisruption.ts)
- State: `isDrawerOpen`, `activeDisruption`, `disruptionResponse`, `isSimulating`
- Actions: `openDrawer()`, `closeDrawer()`, `simulateDisruption(event)`
- Manages fetch to `/api/disrupt` and itinerary diff application

#### [NEW] [useMap.ts](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/hooks/useMap.ts)
- Google Maps lifecycle management via `@googlemaps/js-api-loader`
- Map instance ref, markers management, polyline rendering
- `flyTo(latLng)`, `addMarkers(activities)`, `highlightMarker(id)`

#### [NEW] [useTerrain.ts](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/hooks/useTerrain.ts)
- Fetches terrain assessment for activity pairs
- State: `assessment`, `isLoading`

#### [NEW] [usePocketGuide.ts](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/hooks/usePocketGuide.ts)
- Pocket guide drawer state and content
- Auto-fetches when `selectedActivity` changes

#### [NEW] [useSpeechSynthesis.ts](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/hooks/useSpeechSynthesis.ts)
- Web Speech Synthesis API wrapper
- `speak(text, lang)` with voice selection by BCP 47 tag

---

#### UI Primitives

#### [NEW] [GlassPanel.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/ui/GlassPanel.tsx)
- Reusable glassmorphism container with `backdrop-blur`, translucent bg, border
- Props: `children`, `className`, `as` (HTML element override)

#### [NEW] [LoadingShimmer.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/ui/LoadingShimmer.tsx)
- Animated skeleton placeholder with gradient sweep
- Props: `width`, `height`, `lines` (for text shimmer)

#### [NEW] [IconButton.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/ui/IconButton.tsx)
- Accessible button wrapping a Lucide icon
- Required: `aria-label`, `tabIndex`, focus ring styles

#### [NEW] [AnimatedCounter.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/ui/AnimatedCounter.tsx)
- Smooth number interpolation animation for cost displays

---

#### Dashboard Shell

#### [MODIFY] [layout.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/app/layout.tsx)
- Add Inter font import via `next/font/google`
- Set metadata: title, description, viewport, theme-color
- Apply dark background and font classes to `<html>` and `<body>`

#### [MODIFY] [page.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/app/page.tsx)
- Server Component shell that renders `<SplitScreen />` client component
- Minimal server-side work — all interactivity in client components

#### [NEW] [SplitScreen.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/dashboard/SplitScreen.tsx)
- `'use client'` — main orchestrator component
- Manages the `useItinerary`, `useDisruption`, `useMap` hooks
- Responsive layout: desktop split, tablet stacked, mobile tabbed
- Renders `LeftPanel` + `RightPanel` + drawer overlays

#### [NEW] [LeftPanel.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/dashboard/LeftPanel.tsx)
- Scrollable panel containing `TripForm` (when no itinerary) or `ItineraryTimeline` (when itinerary exists)
- Smooth crossfade transition between states

#### [NEW] [RightPanel.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/dashboard/RightPanel.tsx)
- Sticky map panel with `MapView` component
- Floating action buttons for disruption drawer and terrain toggle

---

#### Trip Form

#### [NEW] [TripForm.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/trip-form/TripForm.tsx)
- Multi-step form: Step 1 (Destination + Dates) → Step 2 (Interests) → Step 3 (Budget + Accessibility) → Submit
- Progress indicator with animated step transitions
- Form validation with inline error states

#### [NEW] [InterestGrid.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/trip-form/InterestGrid.tsx)
- Grid of interest tags (landmarks, food, nature, nightlife, etc.)
- Multi-select with animated selection states (scale + glow)

#### [NEW] [AccessibilityForm.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/trip-form/AccessibilityForm.tsx)
- Toggle switches for each accessibility need
- Optional notes textarea

---

#### Itinerary Display

#### [NEW] [ItineraryTimeline.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/itinerary/ItineraryTimeline.tsx)
- Vertical timeline with day sections
- Staggered entry animation on load
- Header with trip title, total cost, packing suggestions

#### [NEW] [DayCard.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/itinerary/DayCard.tsx)
- Collapsible day section with theme title and weather badge
- Contains ordered `ActivityCard` components

#### [NEW] [ActivityCard.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/itinerary/ActivityCard.tsx)
- Glass card with activity details: time, name, cost, tags, accessibility badge
- Click handler → map fly-to + pocket guide
- Disrupted state: red border glow + strikethrough + replacement slide-in

#### [NEW] [TransitConnector.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/itinerary/TransitConnector.tsx)
- Visual connector between activities showing transit mode, duration, distance
- Terrain risk badge integration point

---

#### Map Components

#### [NEW] [MapView.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/map/MapView.tsx)
- `'use client'` Google Maps wrapper using `@googlemaps/js-api-loader`
- Dark-themed map style
- Renders markers and polylines based on itinerary state

---

#### Feature Drawers

#### [NEW] [DisruptionDrawer.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/disruption/DisruptionDrawer.tsx)
- Right-edge slide-out drawer with backdrop blur
- 6 preset disruption cards + severity selector
- Day selector for targeting specific days
- "Simulate" CTA with loading state
- Focus trap and `Escape` key to close

#### [NEW] [DisruptionCard.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/disruption/DisruptionCard.tsx)
- Selectable card for each disruption type
- Icon, label, severity indicator
- Selected state: gold border glow

#### [NEW] [DiffVisualizer.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/disruption/DiffVisualizer.tsx)
- Shows before/after comparison for disrupted activities
- Animations: removed items fade + slide out, new items fade + slide in

#### [NEW] [TerrainOverlay.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/terrain/TerrainOverlay.tsx)
- Bottom sheet overlay on map panel
- Shows elevation profile chart + risk badges
- Alternative route suggestion with "Apply" action

#### [NEW] [ElevationChart.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/terrain/ElevationChart.tsx)
- SVG-based elevation profile visualization
- Color-coded slope segments (green → yellow → red)
- Responsive sizing

#### [NEW] [RiskBadge.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/terrain/RiskBadge.tsx)
- Small badge component: "Safe", "Moderate", "Challenging", "Inaccessible"
- Color-coded with appropriate icons

#### [NEW] [PocketGuideDrawer.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/pocket-guide/PocketGuideDrawer.tsx)
- Bottom/right persistent overlay (depends on viewport)
- Cultural context, etiquette list, fun facts
- Pronunciation section with "Speak" buttons
- Auto-opens when an activity is selected

#### [NEW] [PronunciationBtn.tsx](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/components/pocket-guide/PronunciationBtn.tsx)
- Button that triggers Web Speech Synthesis for a phrase
- Visual feedback: pulsing animation while speaking
- Shows phonetic guide text alongside

---

#### Maps Utility

#### [NEW] [maps.ts](file:///Users/dhruvmehra/Desktop/aetheria-travel-engine/src/lib/maps.ts)
- Maps loader singleton using `@googlemaps/js-api-loader`
- Lazy-loads the Maps JS API with required libraries (marker, geometry)

---

## Verification Plan

### Automated Tests

```bash
# Run all tests
npx vitest run

# Type checking
npx tsc --noEmit
```

- Unit tests for `validators.ts` — validate correct/incorrect shapes
- Unit tests for `prompts.ts` — verify prompt template output
- Unit tests for hooks — mock fetch responses, verify state transitions

### Build Verification

```bash
# Ensure no build errors
npm run build
```

### Manual Verification

1. **Dev Server:** `npm run dev` → verify split-screen renders correctly
2. **Trip Generation:** Submit a trip request → verify itinerary appears with map markers
3. **Disruption Simulation:** Open drawer → select disruption → verify itinerary re-animates
4. **Terrain Check:** Click transit connector → verify elevation chart and risk badges
5. **Pocket Guide:** Click activity card → verify cultural context loads with speech buttons
6. **Responsive:** Test at 1440px, 768px, and 375px breakpoints
7. **Accessibility:** Tab through all interactive elements, verify focus management
8. **Keyboard:** Verify drawers open/close with keyboard, `Escape` key works

### Browser Recording

- Record a full user flow demo using the browser subagent showing: form → generation → map interaction → disruption simulation → pocket guide
