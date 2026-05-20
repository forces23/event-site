import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Photo from "@/models/Photo";
import { EVENT } from "@/config/alexa";

interface ConfirmFile {
  key: string;
  public_url: string;
  name: string;
  type: string;
  size: number;
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      type: "image",
      category: "her",
      created_at: new Date(),
    }));

    const saved = await Photo.insertMany(docs);

    return NextResponse.json({
      success: true,
      photos: saved.map((p) => ({
        _id: p._id.toString(),
        event: p.event,
        key: p.key,
        url: p.url,
        original_name: p.original_name,
        mime_type: p.mime_type,
        size: p.size,
        type: p.type,
        category: p.category,
        created_at: p.created_at,
      })),
    });
  } catch (err) {
    console.error("[POST /api/dashboard/upload/confirm]", err);
    return NextResponse.json(
      { error: "Failed to save upload records. Please try again." },
      { status: 500 }
    );
  }
}
