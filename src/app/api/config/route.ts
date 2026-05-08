// ============================================================================
// GET /api/config — Securely serve public configuration to the client
// ============================================================================

import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: "Maps API key not configured on server" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    googleMapsApiKey: apiKey
  });
}
