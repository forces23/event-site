import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Rsvp from "@/models/RSVP";

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

    await Rsvp.findByIdAndUpdate(params.id, {
      $set: { "message.msg": "", "message.is_public": false },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/dashboard/messages/:id]", err);
    return NextResponse.json({ error: "Failed to delete message." }, { status: 500 });
  }
}
