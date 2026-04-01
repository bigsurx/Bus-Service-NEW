import { NextResponse } from "next/server";
import { searchVehicles } from "@/lib/rentsyst";
import type { VehicleSearchParams, Vehicle, VehicleRaw } from "@/lib/types";

function normalizeVehicle(raw: VehicleRaw): Vehicle {
  return {
    id: String(raw.id),
    name: `${raw.brand} ${raw.mark}`.trim(),
    category: raw.group || raw.body_type || raw.type,
    thumbnail: raw.thumbnail,
    images: raw.photos || raw.thumbnails,
    seats: raw.number_seats,
    doors: raw.number_doors,
    transmission: raw.transmission,
    fuel: raw.fuel,
    price_per_day: raw.price ?? raw.min_price,
    total_price: parseFloat(raw.total_price) || undefined,
    count_days: raw.count_days,
    currency: raw.currency,
    mileage_limit: raw.mileage_limit,
  };
}

export async function POST(request: Request) {
  try {
    const body: VehicleSearchParams = await request.json();
    const data = await searchVehicles(body);
    const vehicles = (data.vehicles || []).map(normalizeVehicle);
    return NextResponse.json({ vehicles, pagination: data.pagination });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}
