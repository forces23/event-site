import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Photo from "@/models/Photo";
import { EVENT } from "@/config/config";

export async function GET() {
  try {
    await connectDB();

    const photos = await Photo.find({ event: EVENT.id, category: "her" })
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({ photos }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/her-gallery]", err);
    return NextResponse.json({ photos: [] }, { status: 200 });
  }
}
