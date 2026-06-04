import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import { getPresignedPutUrl, getPublicUrl } from "@/lib/r2";
import { EVENT } from "@/config/config";
import type { PresignRequest, PresignResponse } from "@/types";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
]);

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_IMAGES = 20;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { files } = (await req.json()) as { files: PresignRequest[] };

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files provided." }, { status: 400 });
    }

    const invalid = files.filter((f) => !ALLOWED_IMAGE_TYPES.has(f.type));
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `Unsupported file type: ${invalid[0].type}. Only JPG, PNG, and HEIC images are accepted.` },
        { status: 400 }
      );
    }

    if (files.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_IMAGES} images at a time.` },
        { status: 400 }
      );
    }

    for (const f of files) {
      if (f.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `"${f.name}" exceeds the 20 MB image size limit.` },
          { status: 400 }
        );
      }
    }

    const results: (PresignResponse & { name: string; type: string; size: number })[] =
      await Promise.all(
        files.map(async (f) => {
          const ext = f.name.split(".").pop() ?? "jpg";
          const key = `her/${EVENT.id}/${Date.now()}_${uuidv4()}.${ext}`;
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
    console.error("[POST /api/dashboard/upload/presign]", err);
    return NextResponse.json(
      { error: "Failed to prepare upload. Please try again." },
      { status: 500 }
    );
  }
}
