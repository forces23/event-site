import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Rsvp from "@/models/RSVP";
import { EVENT } from "@/config/alexa";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { identifier } = (await req.json()) as { identifier: string };

    if (!identifier?.trim()) {
      return NextResponse.json(
        { error: "Email or phone is required." },
        { status: 400 }
      );
    }

    const normalized = identifier.trim().toLowerCase();

    const rsvp = await Rsvp.findOne({
      event: EVENT.id,
      $or: [
        { "guest.email": normalized },
        { "guest.phone": normalized },
        { "guest.email": identifier.trim() },
        { "guest.phone": identifier.trim() },
      ],
    }).lean();

    if (!rsvp) {
      return NextResponse.json(
        { error: "No RSVP found with that email or phone number." },
        { status: 404 }
      );
    }

    return NextResponse.json({ rsvp });
  } catch (err) {
    console.error("[POST /api/rsvp/lookup]", err);
    return NextResponse.json(
      { error: "Lookup failed. Please try again." },
      { status: 500 }
    );
  }
}
