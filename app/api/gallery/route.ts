import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Photo from "@/models/Photo";
import { EVENT } from "@/config/alexa";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const photos = await Photo.find({ event: EVENT.id })
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({ photos }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/gallery]", err);
    return NextResponse.json(
      { error: "Failed to load gallery." },
      { status: 500 }
    );
  }
}
