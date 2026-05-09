// ============================================================================
// Aetheria Travel Engine — Runtime Validators
// ============================================================================

import type {
  TripRequest,
  DisruptionEvent,
  LatLng,
  AccessibilityNeeds,
  Itinerary,
  PocketGuideContent,
  DisruptionResponse,
  BudgetLevel,
  DisruptionType,
  DisruptionSeverity,
} from "@/types/itinerary";

// ---------------------------------------------------------------------------
// Validation Result
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function ok(): ValidationResult {
  return { valid: true, errors: [] };
}

function fail(...errors: string[]): ValidationResult {
  return { valid: false, errors };
}

// ---------------------------------------------------------------------------
// Primitive Checks
// ---------------------------------------------------------------------------

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

function isPositiveInt(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value) && value > 0;
}

function isValidDate(value: unknown): boolean {
  if (!isNonEmptyString(value)) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

const VALID_BUDGETS: BudgetLevel[] = ["budget", "moderate", "luxury"];

const VALID_DISRUPTION_TYPES: DisruptionType[] = [
  "weather_severe",
  "flight_delayed",
  "venue_closed",
  "transit_strike",
  "road_closure",
  "medical_emergency",
  "custom",
];

const VALID_SEVERITIES: DisruptionSeverity[] = [
  "low",
  "medium",
  "high",
  "critical",
];

// ---------------------------------------------------------------------------
// Request Validators
// ---------------------------------------------------------------------------

/**
 * Validates a TripRequest payload from the client.
 */
export function validateTripRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return fail("Request body must be a JSON object.");
  }

  const req = body as Record<string, unknown>;
  const errors: string[] = [];

  if (!isNonEmptyString(req.destination)) {
    errors.push("destination is required and must be a non-empty string.");
  }
  if (!isValidDate(req.startDate)) {
    errors.push("startDate is required and must be a valid ISO 8601 date.");
  }
  if (!isValidDate(req.endDate)) {
    errors.push("endDate is required and must be a valid ISO 8601 date.");
  }
  if (
    isValidDate(req.startDate) &&
    isValidDate(req.endDate) &&
    new Date(req.startDate as string) >= new Date(req.endDate as string)
  ) {
    errors.push("endDate must be after startDate.");
  }
  if (!isNonEmptyString(req.budget) || !VALID_BUDGETS.includes(req.budget as BudgetLevel)) {
    errors.push(`budget must be one of: ${VALID_BUDGETS.join(", ")}.`);
  }
  if (!Array.isArray(req.interests) || req.interests.length === 0) {
    errors.push("interests must be a non-empty array of strings.");
  }
  if (!isPositiveInt(req.groupSize)) {
    errors.push("groupSize must be a positive integer.");
  }
  if (req.accessibilityNeeds && typeof req.accessibilityNeeds !== "object") {
    errors.push("accessibilityNeeds must be an object if provided.");
  }

  return errors.length > 0 ? fail(...errors) : ok();
}

/**
 * Validates a DisruptionEvent payload from the client.
 */
export function validateDisruptionEvent(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return fail("Request body must be a JSON object.");
  }

  const req = body as Record<string, unknown>;
  const errors: string[] = [];

  if (!req.itinerary || typeof req.itinerary !== "object") {
    errors.push("itinerary is required and must be an object.");
  }

  if (!req.disruption || typeof req.disruption !== "object") {
    errors.push("disruption is required and must be an object.");
  } else {
    const d = req.disruption as Record<string, unknown>;

    if (
      !isNonEmptyString(d.type) ||
      !VALID_DISRUPTION_TYPES.includes(d.type as DisruptionType)
    ) {
      errors.push(
        `disruption.type must be one of: ${VALID_DISRUPTION_TYPES.join(", ")}.`
      );
    }
    if (!isNonEmptyString(d.label)) {
      errors.push("disruption.label is required.");
    }
    if (
      !isNonEmptyString(d.severity) ||
      !VALID_SEVERITIES.includes(d.severity as DisruptionSeverity)
    ) {
      errors.push(
        `disruption.severity must be one of: ${VALID_SEVERITIES.join(", ")}.`
      );
    }
    if (!isPositiveInt(d.affectedDayNumber)) {
      errors.push("disruption.affectedDayNumber must be a positive integer.");
    }
    if (!isNonEmptyString(d.description)) {
      errors.push("disruption.description is required.");
    }
  }

  return errors.length > 0 ? fail(...errors) : ok();
}

/**
 * Validates a terrain assessment request body.
 */
export function validateTerrainRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return fail("Request body must be a JSON object.");
  }

  const req = body as Record<string, unknown>;
  const errors: string[] = [];

  if (!isValidLatLng(req.from)) {
    errors.push("from must be an object with valid lat and lng numbers.");
  }
  if (!isValidLatLng(req.to)) {
    errors.push("to must be an object with valid lat and lng numbers.");
  }

  return errors.length > 0 ? fail(...errors) : ok();
}

/**
 * Validates a pocket guide request body.
 */
export function validatePocketGuideRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return fail("Request body must be a JSON object.");
  }

  const req = body as Record<string, unknown>;
  const errors: string[] = [];

  if (!isNonEmptyString(req.venueName)) {
    errors.push("venueName is required.");
  }
  if (!isNonEmptyString(req.destination)) {
    errors.push("destination is required.");
  }
  if (!isNonEmptyString(req.country)) {
    errors.push("country is required.");
  }

  return errors.length > 0 ? fail(...errors) : ok();
}

// ---------------------------------------------------------------------------
// Response Shape Guards
// ---------------------------------------------------------------------------

/**
 * Basic shape check for an Itinerary response from the AI.
 * Does not validate every nested field — verifies essential structure.
 */
export function isValidItineraryShape(data: unknown): data is Itinerary {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, any>;

  return (
    isNonEmptyString(obj.id) &&
    isNonEmptyString(obj.destination) &&
    isNonEmptyString(obj.country) &&
    isNonEmptyString(obj.tripTitle) &&
    Array.isArray(obj.days) &&
    obj.days.length > 0 &&
    obj.days.every((d: any) => Array.isArray(d.activities))
  );
}

/**
 * Basic shape check for a DisruptionResponse from the AI.
 */
export function isValidDisruptionResponseShape(
  data: unknown
): data is DisruptionResponse {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    obj.adjustedItinerary !== undefined &&
    Array.isArray(obj.changesApplied) &&
    isNonEmptyString(obj.reasoning)
  );
}

/**
 * Basic shape check for PocketGuideContent from the AI.
 */
export function isValidPocketGuideShape(
  data: unknown
): data is PocketGuideContent {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    isNonEmptyString(obj.venueName) &&
    isNonEmptyString(obj.culturalContext) &&
    Array.isArray(obj.localEtiquette)
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidLatLng(value: unknown): value is LatLng {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    isNumber(obj.lat) &&
    isNumber(obj.lng) &&
    obj.lat >= -90 &&
    obj.lat <= 90 &&
    obj.lng >= -180 &&
    obj.lng <= 180
  );
}
