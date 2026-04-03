import { NextResponse } from "next/server";
import { updateOrder } from "@/lib/rentsyst";
import type { OrderUpdateParams } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: OrderUpdateParams = await request.json();
    const data = await updateOrder(Number(id), body);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Order update failed" },
      { status: 500 }
    );
  }
}
