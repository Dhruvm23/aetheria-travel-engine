// ============================================================================
// Aetheria Travel Engine — Constants & Configuration
// ============================================================================

import type {
  DisruptionType,
  DisruptionSeverity,
  ActivityCategory,
} from "@/types/itinerary";

// ---------------------------------------------------------------------------
// Disruption Presets
// ---------------------------------------------------------------------------

export interface DisruptionPreset {
  type: DisruptionType;
  label: string;
  description: string;
  icon: string;
  defaultSeverity: DisruptionSeverity;
}

export const DISRUPTION_PRESETS: DisruptionPreset[] = [
  {
    type: "weather_severe",
    label: "Severe Weather",
    description: "Heavy rainfall, storms, or extreme heat affecting outdoor plans",
    icon: "cloud-rain",
    defaultSeverity: "high",
  },
  {
    type: "flight_delayed",
    label: "Flight Delayed",
    description: "Flight arrival or departure delayed, compressing the schedule",
    icon: "plane",
    defaultSeverity: "medium",
  },
  {
    type: "venue_closed",
    label: "Venue Closed",
    description: "A planned venue is unexpectedly closed or fully booked",
    icon: "door-closed",
    defaultSeverity: "medium",
  },
  {
    type: "transit_strike",
    label: "Transit Strike",
    description: "Public transportation strike or service disruption",
    icon: "train-front",
    defaultSeverity: "high",
  },
  {
    type: "road_closure",
    label: "Road Closure",
    description: "Major road or pathway blocked due to construction or event",
    icon: "construction",
    defaultSeverity: "medium",
  },
  {
    type: "medical_emergency",
    label: "Medical Emergency",
    description: "Need to adjust plans for medical attention or recovery time",
    icon: "heart-pulse",
    defaultSeverity: "critical",
  },
];

// ---------------------------------------------------------------------------
// Activity Category Config
// ---------------------------------------------------------------------------

export interface CategoryConfig {
  label: string;
  icon: string;
  color: string;
}

export const CATEGORY_CONFIG: Record<ActivityCategory, CategoryConfig> = {
  landmark: { label: "Landmark", icon: "landmark", color: "#d4a853" },
  museum: { label: "Museum", icon: "building-2", color: "#b8a9c9" },
  restaurant: { label: "Restaurant", icon: "utensils", color: "#ff8a65" },
  cafe: { label: "Café", icon: "coffee", color: "#a1887f" },
  nature: { label: "Nature", icon: "trees", color: "#6bcb77" },
  shopping: { label: "Shopping", icon: "shopping-bag", color: "#f48fb1" },
  nightlife: { label: "Nightlife", icon: "music", color: "#ce93d8" },
  cultural: { label: "Cultural", icon: "palette", color: "#4ecdc4" },
  adventure: { label: "Adventure", icon: "mountain", color: "#ff7043" },
  wellness: { label: "Wellness", icon: "heart", color: "#81d4fa" },
  transit: { label: "Transit", icon: "bus", color: "#a39e97" },
};

// ---------------------------------------------------------------------------
// Budget Tier Config
// ---------------------------------------------------------------------------

export const BUDGET_CONFIG: Record<
  string,
  { label: string; icon: string; description: string }
> = {
  budget: {
    label: "Budget",
    icon: "wallet",
    description: "Affordable options, hostels, street food",
  },
  moderate: {
    label: "Moderate",
    icon: "credit-card",
    description: "Mid-range hotels, local restaurants",
  },
  luxury: {
    label: "Luxury",
    icon: "gem",
    description: "Premium hotels, fine dining, VIP experiences",
  },
};

// ---------------------------------------------------------------------------
// Interest Options
// ---------------------------------------------------------------------------

export const INTEREST_OPTIONS: { id: string; label: string; icon: string }[] = [
  { id: "history", label: "History", icon: "scroll" },
  { id: "architecture", label: "Architecture", icon: "building-2" },
  { id: "food", label: "Food & Cuisine", icon: "utensils" },
  { id: "art", label: "Art & Museums", icon: "palette" },
  { id: "nature", label: "Nature & Parks", icon: "trees" },
  { id: "adventure", label: "Adventure", icon: "mountain" },
  { id: "nightlife", label: "Nightlife", icon: "music" },
  { id: "shopping", label: "Shopping", icon: "shopping-bag" },
  { id: "wellness", label: "Wellness & Spa", icon: "heart" },
  { id: "photography", label: "Photography", icon: "camera" },
  { id: "local-culture", label: "Local Culture", icon: "users" },
  { id: "religious-sites", label: "Religious Sites", icon: "church" },
];

// ---------------------------------------------------------------------------
// Google Maps Dark Night-Mode Style
// ---------------------------------------------------------------------------

export const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1c20" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1c20" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b6560" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a39e97" }],
  },
  // ── POI suppression: hide all business/attraction icons for luxury clean look ──
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.attraction",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.medical",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.school",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.sports_complex",
    stylers: [{ visibility: "off" }],
  },
  // ── Keep parks visible but subtle ──
  {
    featureType: "poi.park",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1e2a1e" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4a7c59" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2a2d32" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a1c20" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b6560" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3a3d42" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a1c20" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a39e97" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2a2d32" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a39e97" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1a2b" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d5a80" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0e1a2b" }],
  },
];

// ---------------------------------------------------------------------------
// Map Defaults
// ---------------------------------------------------------------------------

export const MAP_DEFAULT_CENTER = { lat: 41.9028, lng: 12.4964 }; // Rome
export const MAP_DEFAULT_ZOOM = 13;

// ---------------------------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------------------------

export const API_ROUTES = {
  plan: "/api/plan",
  disrupt: "/api/disrupt",
  terrain: "/api/terrain",
  pocketGuide: "/api/pocket-guide",
} as const;

// ---------------------------------------------------------------------------
// Elevation API Config
// ---------------------------------------------------------------------------

/** Number of sample points along a route for elevation queries */
export const ELEVATION_SAMPLE_COUNT = 50;

/** Slope thresholds for terrain risk assessment (percent) */
export const SLOPE_THRESHOLDS = {
  safe: 5,
  moderate: 10,
  challenging: 15,
  // Anything above "challenging" is "inaccessible"
} as const;

// ---------------------------------------------------------------------------
// Rate Limiting (in-memory, per deployment)
// ---------------------------------------------------------------------------

export const RATE_LIMIT = {
  windowMs: 60_000,         // 1 minute window
  maxRequests: 10,           // max requests per window per IP
} as const;
