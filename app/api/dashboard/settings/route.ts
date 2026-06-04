import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import { EVENT } from "@/config/config";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await connectDB();
    const s = await Settings.findOne({ event: EVENT.id }).lean() as {
      upload_locked?: boolean;
      wishlist_enabled?: boolean;
      her_gallery_enabled?: boolean;
      registry_url?: string;
    } | null;

    return NextResponse.json({
      upload_locked:       s?.upload_locked       ?? false,
      wishlist_enabled:    s?.wishlist_enabled    ?? true,
      her_gallery_enabled: s?.her_gallery_enabled ?? true,
      registry_url:        s?.registry_url        ?? "",
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

  const isAdmin = (session.user as { role?: string })?.role === "admin";
  const body = await req.json() as Partial<{
    upload_locked: boolean;
    wishlist_enabled: boolean;
    her_gallery_enabled: boolean;
    registry_url: string;
  }>;

  // Toggle fields require admin; registry_url can be updated by any logged-in user
  if (
    ("upload_locked" in body || "wishlist_enabled" in body || "her_gallery_enabled" in body) &&
    !isAdmin
  ) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    await connectDB();

    const update: Record<string, unknown> = { updated_at: new Date() };
    if ("upload_locked"       in body) update.upload_locked       = body.upload_locked;
    if ("wishlist_enabled"    in body) update.wishlist_enabled    = body.wishlist_enabled;
    if ("her_gallery_enabled" in body) update.her_gallery_enabled = body.her_gallery_enabled;
    if ("registry_url"        in body) update.registry_url        = body.registry_url;

    // Write via the raw collection to bypass Mongoose strict-mode schema caching.
    await Settings.collection.updateOne(
      { event: EVENT.id },
      { $set: update },
      { upsert: true },
    );

    const s = await Settings.collection.findOne({ event: EVENT.id });

    return NextResponse.json({
      upload_locked:       (s?.upload_locked       as boolean | undefined) ?? false,
      wishlist_enabled:    (s?.wishlist_enabled    as boolean | undefined) ?? true,
      her_gallery_enabled: (s?.her_gallery_enabled as boolean | undefined) ?? true,
      registry_url:        (s?.registry_url        as string  | undefined) ?? "",
    });
  } catch (err) {
    console.error("[PATCH /api/dashboard/settings]", err);
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}
