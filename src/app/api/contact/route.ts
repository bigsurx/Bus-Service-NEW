import { NextResponse } from "next/server";
import { submitContact } from "@/lib/rentsyst";
import type { ContactFormData } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body: ContactFormData = await request.json();
    const data = await submitContact(body);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Contact submission failed" },
      { status: 500 }
    );
  }
}
