import { NextResponse } from "next/server";
import { confirmOrder } from "@/lib/rentsyst";
import { getAccessToken } from "@/lib/auth";
import type { OrderConfirmParams } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: OrderConfirmParams = await request.json();
    const data = await confirmOrder(Number(id), body);

    // Build the full Stripe payment URL from the V2 response
    // WordPress does: payment_link + ?accessToken=xxx&payment_id=yyy
    let paymentUrl: string | undefined;
    if (data.payment_link && data.payment_id) {
      const token = await getAccessToken();
      paymentUrl = `${data.payment_link}?accessToken=${token}&payment_id=${data.payment_id}`;
    }

    return NextResponse.json({
      ...data,
      payment_url: paymentUrl, // Full URL ready for redirect
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Order confirmation failed" },
      { status: 500 }
    );
  }
}
