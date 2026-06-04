import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Rsvp from "@/models/RSVP";
import { EVENT } from "@/config/config";
import type { DashboardStats } from "@/types";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const rsvps = await Rsvp.find({ event: EVENT.id })
      .sort({ "rsvp.submitted_at": -1 })
      .lean();

    const attending = rsvps.filter((r) => r.rsvp.status === "attending");
    const declined = rsvps.filter((r) => r.rsvp.status === "declined");

    const stats: DashboardStats = {
      total_responses: rsvps.length,
      attending: attending.length,
      declined: declined.length,
      total_headcount: attending.reduce((sum, r) => sum + r.party.total_headcount, 0),
      total_adults: attending.reduce((sum, r) => sum + r.party.total_adults, 0),
      total_kids: attending.reduce((sum, r) => sum + r.party.total_kids, 0),
    };

    return NextResponse.json({ stats, rsvps });
  } catch (err) {
    console.error("[GET /api/dashboard/rsvps]", err);
    return NextResponse.json({ error: "Failed to load RSVPs." }, { status: 500 });
  }
}
