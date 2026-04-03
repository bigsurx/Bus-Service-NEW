import { NextResponse } from "next/server";
import { createOrder } from "@/lib/rentsyst";
import type { OrderCreateParams } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body: OrderCreateParams = await request.json();
    const data = await createOrder(body);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Order creation failed" },
      { status: 500 }
    );
  }
}
