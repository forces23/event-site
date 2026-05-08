import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Photo from "@/models/Photo";
import { deleteObject } from "@/lib/r2";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    const photo = await Photo.findById(params.id);
    if (!photo) {
      return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    }

    await deleteObject(photo.key);
    await photo.deleteOne();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/dashboard/photos/:id]", err);
    return NextResponse.json({ error: "Failed to delete photo." }, { status: 500 });
  }
}
