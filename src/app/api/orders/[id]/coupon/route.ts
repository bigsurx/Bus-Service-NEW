import { NextResponse } from "next/server";
import { applyCoupon } from "@/lib/rentsyst";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { coupon } = await request.json();
    const data = await applyCoupon(Number(id), coupon);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Coupon failed" },
      { status: 500 }
    );
  }
}
