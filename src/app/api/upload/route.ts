import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";

const UPLOAD_URL = "https://api.rentsyst.com/v2/file/upload";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const token = await getAccessToken();

    // Forward the file to RentSyst V2
    const upstream = new FormData();
    upstream.append("file", file);

    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: upstream,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Upload failed: ${text}` },
        { status: res.status }
      );
    }

    const data: { status: string; id: number; url: string } = await res.json();
    return NextResponse.json({ id: data.id, url: data.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
