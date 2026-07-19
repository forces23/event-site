import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/Announcement";
import { EVENT } from "@/config/config";
import type { AnnouncementColor } from "@/types";

const ANNOUNCEMENT_COLORS: AnnouncementColor[] = ["theme", "red", "blue", "green", "yellow"];
const MAX_TITLE_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 500;

export const dynamic = "force-dynamic";

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  return (session?.user as { role?: string } | undefined)?.role === "admin" ? session : null;
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    await connectDB();
    const a = await Announcement.findOne({ event: EVENT.id }).lean() as {
      title?: string;
      message?: string;
      color?: AnnouncementColor;
      active?: boolean;
    } | null;

    return NextResponse.json({
      title:   a?.title   ?? "",
      message: a?.message ?? "",
      color:   a?.color   ?? "theme",
      active:  a?.active  ?? false,
    });
  } catch (err) {
    console.error("[GET /api/dashboard/announcements]", err);
    return NextResponse.json({ error: "Failed to fetch announcement." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let body: Partial<{
    title: string;
    message: string;
    color: AnnouncementColor;
    active: boolean;
  }>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.title !== undefined && typeof body.title !== "string") {
    return NextResponse.json({ error: "Title must be text." }, { status: 400 });
  }

  if (body.message !== undefined && typeof body.message !== "string") {
    return NextResponse.json({ error: "Message must be text." }, { status: 400 });
  }

  if (body.active !== undefined && typeof body.active !== "boolean") {
    return NextResponse.json({ error: "Active must be true or false." }, { status: 400 });
  }

  if (body.color !== undefined && !ANNOUNCEMENT_COLORS.includes(body.color)) {
    return NextResponse.json({ error: "Invalid color." }, { status: 400 });
  }

  const title = body.title?.trim();
  const message = body.message?.trim();

  if (title !== undefined && title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.` }, { status: 400 });
  }

  if (message !== undefined && message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` }, { status: 400 });
  }

  try {
    await connectDB();

    const current = await Announcement.collection.findOne({ event: EVENT.id });
    const nextTitle = title ?? (current?.title as string | undefined) ?? "";
    const nextMessage = message ?? (current?.message as string | undefined) ?? "";
    const nextActive = body.active ?? (current?.active as boolean | undefined) ?? false;

    if (nextActive && (!nextTitle || !nextMessage)) {
      return NextResponse.json(
        { error: "Add both a title and message before publishing." },
        { status: 400 },
      );
    }

    const update: Record<string, unknown> = { updated_at: new Date() };
    if (title !== undefined) update.title = title;
    if (message !== undefined) update.message = message;
    if ("color"   in body) update.color   = body.color;
    if ("active"  in body) update.active  = body.active;

    // Write via the raw collection to bypass Mongoose strict-mode schema caching.
    await Announcement.collection.updateOne(
      { event: EVENT.id },
      { $set: update },
      { upsert: true },
    );

    const a = await Announcement.collection.findOne({ event: EVENT.id });

    return NextResponse.json({
      title:   (a?.title   as string  | undefined) ?? "",
      message: (a?.message as string  | undefined) ?? "",
      color:   (a?.color   as AnnouncementColor | undefined) ?? "theme",
      active:  (a?.active  as boolean | undefined) ?? false,
    });
  } catch (err) {
    console.error("[PATCH /api/dashboard/announcements]", err);
    return NextResponse.json({ error: "Failed to update announcement." }, { status: 500 });
  }
}
