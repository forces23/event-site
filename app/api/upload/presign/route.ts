import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getPresignedPutUrl, getPublicUrl } from "@/lib/r2";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import { EVENT } from "@/config/config";
import type { PresignRequest, PresignResponse } from "@/types";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/quicktime"]);

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;   // 20 MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;  // 500 MB
const MAX_IMAGES = 20;
const MAX_VIDEOS = 5;

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const settings = await Settings.findOne({ event: EVENT.id }).lean();
    if ((settings as { upload_locked?: boolean } | null)?.upload_locked) {
      return NextResponse.json(
        { error: "Uploads are currently closed. Check back soon!" },
        { status: 423 }
      );
    }

    const { files } = (await req.json()) as { files: PresignRequest[] };

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided." },
        { status: 400 }
      );
    }

    const images = files.filter((f) => ALLOWED_IMAGE_TYPES.has(f.type));
    const videos = files.filter((f) => ALLOWED_VIDEO_TYPES.has(f.type));
    const invalid = files.filter(
      (f) => !ALLOWED_IMAGE_TYPES.has(f.type) && !ALLOWED_VIDEO_TYPES.has(f.type)
    );

    if (invalid.length > 0) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${invalid[0].type}. Only JPG, PNG, HEIC, MP4, and MOV files are accepted.`,
        },
        { status: 400 }
      );
    }

    if (images.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_IMAGES} images at a time.` },
        { status: 400 }
      );
    }

    if (videos.length > MAX_VIDEOS) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_VIDEOS} videos at a time.` },
        { status: 400 }
      );
    }

    for (const img of images) {
      if (img.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `"${img.name}" exceeds the 20 MB image size limit.` },
          { status: 400 }
        );
      }
    }

    for (const vid of videos) {
      if (vid.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          { error: `"${vid.name}" exceeds the 500 MB video size limit.` },
          { status: 400 }
        );
      }
    }

    const results: (PresignResponse & { name: string; type: string; size: number })[] =
      await Promise.all(
        files.map(async (f) => {
          const ext = f.name.split(".").pop() ?? "bin";
          const key = `guest/${EVENT.id}/${Date.now()}_${uuidv4()}.${ext}`;
          const presigned_url = await getPresignedPutUrl(key, f.type);
          return {
            presigned_url,
            key,
            public_url: getPublicUrl(key),
            name: f.name,
            type: f.type,
            size: f.size,
          };
        })
      );

    return NextResponse.json({ files: results });
  } catch (err) {
    console.error("[POST /api/upload/presign]", err);
    return NextResponse.json(
      { error: "Failed to prepare upload. Please try again." },
      { status: 500 }
    );
  }
}
