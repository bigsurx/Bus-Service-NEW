import { NextResponse } from "next/server";
import { getCountries } from "@/lib/rentsyst";

// Countries/cities data changes extremely rarely — cache for 24 hours
export const revalidate = 86400;

export async function GET() {
  try {
    const data = await getCountries();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
