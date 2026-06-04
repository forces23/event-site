import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Rsvp from "@/models/RSVP";
import { EVENT } from "@/config/config";

function escapeCsv(val: string | number | undefined): string {
  const str = String(val ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();

    const rsvps = await Rsvp.find({ event: EVENT.id })
      .sort({ "rsvp.submitted_at": -1 })
      .lean();

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Relationship",
      "Status",
      "Adults",
      "Kids",
      "Total Headcount",
      "Message",
      "Submitted At",
    ];

    const rows = rsvps.map((r) =>
      [
        r.guest.name,
        r.guest.email ?? "",
        r.guest.phone ?? "",
        r.guest.relationship,
        r.rsvp.status,
        r.party.total_adults,
        r.party.total_kids,
        r.party.total_headcount,
        r.message.msg,
        new Date(r.rsvp.submitted_at).toISOString(),
      ]
        .map(escapeCsv)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${EVENT.id}_rsvps.csv"`,
      },
    });
  } catch (err) {
    console.error("[GET /api/dashboard/export]", err);
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
