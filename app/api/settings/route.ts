import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import { EVENT } from "@/config/alexa";

// Public endpoint — no auth required.
// Returns only what the public event page needs.
export async function GET() {
  try {
    await connectDB();
    const s = await Settings.findOne({ event: EVENT.id }).lean() as {
      wishlist_enabled?: boolean;
      registry_url?: string;
    } | null;

    return NextResponse.json({
      wishlist_enabled: s?.wishlist_enabled ?? true,
      registry_url:     s?.registry_url?.trim() || EVENT.registry,
    });
  } catch (err) {
    console.error("[GET /api/settings]", err);
    // Fail open — show wishlist with config default so the page still works
    return NextResponse.json({
      wishlist_enabled: true,
      registry_url:     EVENT.registry,
    });
  }
}
