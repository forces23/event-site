import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/Announcement";
import { EVENT } from "@/config/config";
import type { PublicAnnouncement, AnnouncementColor } from "@/types";

const ANNOUNCEMENT_COLORS: AnnouncementColor[] = ["theme", "red", "blue", "green", "yellow"];

export const dynamic = "force-dynamic";

// Public endpoint — no auth required.
// Returns the current announcement only when it's turned on.
export async function GET() {
  try {
    await connectDB();
    const a = await Announcement.findOne({ event: EVENT.id, active: true }).lean() as {
      _id: unknown;
      title?: string;
      message?: string;
      color?: AnnouncementColor;
      active?: boolean;
      updated_at?: Date;
    } | null;

    if (!a) {
      return NextResponse.json({ announcement: null as PublicAnnouncement | null });
    }

    const color = a.color && ANNOUNCEMENT_COLORS.includes(a.color) ? a.color : "theme";
    const announcement: PublicAnnouncement = {
      id: String(a._id),
      title: a.title ?? "",
      message: a.message ?? "",
      color,
      active: a.active ?? false,
      updatedAt: (a.updated_at ?? new Date(0)).toISOString(),
    };

    return NextResponse.json(
      { announcement },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[GET /api/announcements]", err);
    return NextResponse.json({ announcement: null as PublicAnnouncement | null });
  }
}
