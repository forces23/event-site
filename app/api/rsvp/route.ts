import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectDB } from "@/lib/db";
import Rsvp from "@/models/RSVP";
import { EVENT } from "@/config/config";

export async function POST(req: NextRequest) {
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
    if (!["attending", "declined"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const adults = status === "attending" ? Math.max(1, total_adults ?? 1) : 0;
    const kids = status === "attending" ? Math.max(0, total_kids ?? 0) : 0;

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
    const userAgent = req.headers.get("user-agent") ?? "";
    const source =
      req.nextUrl.searchParams.get("src") === "qr" ? "qr_code" : "direct";
    const language =
      req.headers.get("accept-language")?.split(",")[0]?.trim() ?? "en";

    const rsvp = await Rsvp.create({
      event: EVENT.id,
      guest: {
        name: name.trim(),
        email: email?.trim() || undefined,
        phone: phone?.trim() || undefined,
        relationship: relationship || "other",
      },
      rsvp: {
        status,
        submitted_at: new Date(),
        updated_at: new Date(),
        token: uuidv4(),
      },
      party: {
        total_adults: adults,
        total_kids: kids,
        total_headcount: adults + kids,
      },
      message: {
        msg: (msg ?? "").trim(),
        is_public: is_public ?? true,
      },
      meta: { ip_address: ipAddress, user_agent: userAgent, source, language },
    });

    return NextResponse.json({ success: true, id: rsvp._id.toString() });
  } catch (err) {
    console.error("[POST /api/rsvp]", err);
    return NextResponse.json(
      { error: "Failed to save RSVP. Please try again." },
      { status: 500 }
    );
  }
}
