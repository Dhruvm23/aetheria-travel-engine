// ============================================================================
// Aetheria Travel Engine — Core Type Definitions
// ============================================================================

// ---------------------------------------------------------------------------
// 1. Primitives & Shared Types
// ---------------------------------------------------------------------------

/** Geographic coordinate pair */
export interface LatLng {
  lat: number;
  lng: number;
}

/** ISO 4217 currency-aware cost estimate */
export interface CostEstimate {
  amount: number;
  currency: string;
  tier: "free" | "budget" | "moderate" | "premium";
}

// ---------------------------------------------------------------------------
// 2. Activity & Transit
// ---------------------------------------------------------------------------

export type ActivityCategory =
  | "landmark"
  | "museum"
  | "restaurant"
  | "cafe"
  | "nature"
  | "shopping"
  | "nightlife"
  | "cultural"
  | "adventure"
  | "wellness"
  | "transit";

export interface TransitSegment {
  mode: "walk" | "drive" | "transit" | "cycle" | "taxi";
  durationMinutes: number;
  distanceKm: number;
  /** Encoded polyline from Directions API */
  routePolyline?: string;
}

export interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  /** 1 = easy flat terrain, 5 = very challenging */
  mobilityRating: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

/** A single activity / venue within the itinerary */
export interface Activity {
  id: string;
  name: string;
  category: ActivityCategory;
  location: LatLng;
  address: string;
  /** ISO 8601 time, e.g. "09:00" */
  startTime: string;
  /** ISO 8601 time, e.g. "10:30" */
  endTime: string;
  durationMinutes: number;
  description: string;
  estimatedCost: CostEstimate;
  transitFromPrevious: TransitSegment | null;
  accessibilityInfo: AccessibilityInfo;
  culturalNotes: string[];
  /** Search term for generating/finding venue imagery */
  imageQuery: string;
  tags: string[];
}

// ---------------------------------------------------------------------------
// 3. Day & Itinerary
// ---------------------------------------------------------------------------

export interface WeatherSnapshot {
  condition: string;
  tempCelsius: number;
  humidity: number;
  /** Weather icon identifier */
  icon: string;
}

export interface ItineraryDay {
  dayNumber: number;
  /** ISO 8601 date, e.g. "2026-05-15" */
  date: string;
  /** Thematic label, e.g. "Historic Heart of Rome" */
  theme: string;
  activities: Activity[];
  totalCost: CostEstimate;
  weatherForecast?: WeatherSnapshot;
}

export interface EmergencyContact {
  name: string;
  number: string;
  type: "police" | "ambulance" | "embassy" | "tourist_helpline";
}

export interface LocalPhrase {
  phrase: string;
  meaning: string;
  phoneticGuide: string;
  context: string;
}

/** Root itinerary payload returned by the AI */
export interface Itinerary {
  id: string;
  destination: string;
  country: string;
  tripTitle: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  travelerProfile: TravelerProfile;
  days: ItineraryDay[];
  totalEstimatedCost: CostEstimate;
  emergencyContacts: EmergencyContact[];
  packingSuggestions: string[];
  localPhrases: LocalPhrase[];
}

// ---------------------------------------------------------------------------
// 4. User Input & Profile
// ---------------------------------------------------------------------------

export type BudgetLevel = "budget" | "moderate" | "luxury";

export interface AccessibilityNeeds {
  wheelchairRequired: boolean;
  limitedMobility: boolean;
  visualImpairment: boolean;
  hearingImpairment: boolean;
  elderlyTraveler: boolean;
  notes?: string;
}

export interface TravelerProfile {
  groupSize: number;
  budget: BudgetLevel;
  interests: string[];
  accessibilityNeeds: AccessibilityNeeds;
}

export interface TripRequest {
  destination: string;
  startDate: string;
  endDate: string;
  budget: BudgetLevel;
  interests: string[];
  accessibilityNeeds: AccessibilityNeeds;
  groupSize: number;
  specialRequirements?: string;
}

// ---------------------------------------------------------------------------
// 5. Disruption Engine
// ---------------------------------------------------------------------------

export type DisruptionType =
  | "weather_severe"
  | "flight_delayed"
  | "venue_closed"
  | "transit_strike"
  | "road_closure"
  | "medical_emergency"
  | "custom";

export type DisruptionSeverity = "low" | "medium" | "high" | "critical";

export interface DisruptionEvent {
  id: string;
  type: DisruptionType;
  /** Human-readable label, e.g. "Heavy Rainfall" */
  label: string;
  severity: DisruptionSeverity;
  affectedDayNumber: number;
  affectedTimeRange?: { start: string; end: string };
  description: string;
}

export type ChangeType = "rescheduled" | "replaced" | "removed" | "added";

export interface ChangeRecord {
  dayNumber: number;
  activityId: string;
  changeType: ChangeType;
  before: Partial<Activity> | null;
  after: Partial<Activity> | null;
  reason: string;
}

export interface DisruptionResponse {
  originalItinerary: Itinerary;
  adjustedItinerary: Itinerary;
  changesApplied: ChangeRecord[];
  reasoning: string;
}

// ---------------------------------------------------------------------------
// 6. Terrain Risk Profiler
// ---------------------------------------------------------------------------

export interface ElevationPoint {
  location: LatLng;
  /** Meters above sea level */
  elevation: number;
  /** Meters from route start */
  distanceFromStart: number;
}

export type TerrainRiskLevel =
  | "safe"
  | "moderate"
  | "challenging"
  | "inaccessible";

export type SurfaceType =
  | "paved"
  | "cobblestone"
  | "gravel"
  | "mixed"
  | "unknown";

export interface TerrainAssessment {
  fromActivity: string;
  toActivity: string;
  elevationProfile: ElevationPoint[];
  maxSlopePercent: number;
  averageSlopePercent: number;
  surfaceType: SurfaceType;
  riskLevel: TerrainRiskLevel;
  warnings: string[];
  alternativeRoute?: {
    description: string;
    maxSlopePercent: number;
    riskLevel: string;
    additionalMinutes: number;
  };
}

// ---------------------------------------------------------------------------
// 7. Pocket Guide
// ---------------------------------------------------------------------------

export interface PronunciationTip {
  phrase: string;
  meaning: string;
  phoneticGuide: string;
  /** BCP 47 language tag, e.g. "it-IT" */
  language: string;
}

export interface PocketGuideContent {
  venueName: string;
  culturalContext: string;
  localEtiquette: string[];
  pronunciationTips: PronunciationTip[];
  funFacts: string[];
  photographyTips?: string;
  dressCode?: string;
}

// ---------------------------------------------------------------------------
// 8. API Request / Response Wrappers
// ---------------------------------------------------------------------------

export interface DisruptionRequestBody {
  itinerary: Itinerary;
  disruption: DisruptionEvent;
}

export interface TerrainRequestBody {
  from: LatLng;
  to: LatLng;
  accessibilityNeeds: AccessibilityNeeds;
}

export interface PocketGuideRequestBody {
  venueName: string;
  destination: string;
  country: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}
