import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Rsvp from "@/models/RSVP";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, phone, relationship, status, total_adults, total_kids, msg, is_public } =
      body as {
        name: string;
        email?: string;
        phone?: string;
        relationship: string;
        status: "attending" | "declined";
        total_adults?: number;
        total_kids?: number;
        msg?: string;
        is_public?: boolean;
      };

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email?.trim() && !phone?.trim()) {
      return NextResponse.json(
        { error: "At least one of email or phone is required." },
        { status: 400 }
      );
    }

    const adults = status === "attending" ? Math.max(1, total_adults ?? 1) : 0;
    const kids = status === "attending" ? Math.max(0, total_kids ?? 0) : 0;

    const updated = await Rsvp.findByIdAndUpdate(
      params.id,
      {
        $set: {
          "guest.name": name.trim(),
          "guest.email": email?.trim() || undefined,
          "guest.phone": phone?.trim() || undefined,
          "guest.relationship": relationship,
          "rsvp.status": status,
          "rsvp.updated_at": new Date(),
          "party.total_adults": adults,
          "party.total_kids": kids,
          "party.total_headcount": adults + kids,
          "message.msg": (msg ?? "").trim(),
          "message.is_public": is_public ?? true,
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "RSVP not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/rsvp/:id]", err);
    return NextResponse.json(
      { error: "Failed to update RSVP. Please try again." },
      { status: 500 }
    );
  }
}
