import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import { EVENT } from "@/config/alexa";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await connectDB();
    const settings = await Settings.findOne({ event: EVENT.id }).lean();
    return NextResponse.json({
      upload_locked: (settings as { upload_locked?: boolean } | null)?.upload_locked ?? false,
    });
  } catch (err) {
    console.error("[GET /api/dashboard/settings]", err);
    return NextResponse.json({ error: "Failed to fetch settings." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if ((session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const { upload_locked } = (await req.json()) as { upload_locked: boolean };
    await connectDB();
    const settings = await Settings.findOneAndUpdate(
      { event: EVENT.id },
      { upload_locked, updated_at: new Date() },
      { upsert: true, new: true }
    );
    return NextResponse.json({ upload_locked: settings.upload_locked });
  } catch (err) {
    console.error("[PATCH /api/dashboard/settings]", err);
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}
