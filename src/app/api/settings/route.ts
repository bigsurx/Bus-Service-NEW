import { NextResponse } from "next/server";
import { getSettings } from "@/lib/rentsyst";

// Cache settings for 24 hours — locations and payment methods change
// at most a few times a year, no need to refetch hourly
export const revalidate = 86400;

export async function GET() {
  try {
    const data = await getSettings();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch settings";
    console.error("[/api/settings]", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
