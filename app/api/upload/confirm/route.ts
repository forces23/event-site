import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Photo from "@/models/Photo";
import { EVENT } from "@/config/config";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
]);

interface ConfirmFile {
  key: string;
  public_url: string;
  name: string;
  type: string;
  size: number;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { files } = (await req.json()) as { files: ConfirmFile[] };

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files provided." }, { status: 400 });
    }

    const docs = files.map((f) => ({
      event: EVENT.id,
      key: f.key,
      url: f.public_url,
      original_name: f.name,
      mime_type: f.type,
      size: f.size,
      type: ALLOWED_IMAGE_TYPES.has(f.type) ? "image" : "video",
      created_at: new Date(),
    }));

    const saved = await Photo.insertMany(docs);

    return NextResponse.json({
      success: true,
      photos: saved.map((p) => ({
        _id: p._id.toString(),
        url: p.url,
        type: p.type,
        original_name: p.original_name,
        created_at: p.created_at,
      })),
    });
  } catch (err) {
    console.error("[POST /api/upload/confirm]", err);
    return NextResponse.json(
      { error: "Failed to save upload records. Please try again." },
      { status: 500 }
    );
  }
}
