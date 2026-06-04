import { NextRequest, NextResponse } from "next/server";
import { R2_PUBLIC_URL } from "@/lib/r2";

export async function GET(req: NextRequest) {
  const url  = req.nextUrl.searchParams.get("url");
  const name = req.nextUrl.searchParams.get("name") ?? "photo";

  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }

  // Only proxy assets from our own R2 bucket
  if (!url.startsWith(R2_PUBLIC_URL)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return new NextResponse("Failed to fetch asset", { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Download failed", { status: 500 });
  }
}
