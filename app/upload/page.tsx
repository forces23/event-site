import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import UploadForm from "@/components/upload/UploadForm";
import { EVENT } from "@/config/alexa";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Upload Photos — ${EVENT.fullTitle}`,
  description: `Share your photos and videos from ${EVENT.fullTitle}`,
};

export default async function UploadPage() {
  await connectDB();
  const settings = await Settings.findOne({ event: EVENT.id }).lean();
  const isLocked =
    (settings as { upload_locked?: boolean } | null)?.upload_locked ?? false;

  return (
    <main
      className="min-h-screen"
      style={{
        background: `linear-gradient(160deg, hsl(${EVENT.theme.primaryColorHsl} / 0.1) 0%, #fdfcf8 50%, hsl(${EVENT.theme.accentColorHsl} / 0.06) 100%)`,
      }}
    >
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to invitation
        </Link>

        <div className="text-center mb-10">
          <p className="font-script text-5xl text-primary mb-2">Share</p>
          <h1 className="font-display text-2xl font-semibold">Your Moments</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Upload your photos and videos from the celebration
          </p>
          <div
            className="w-16 h-0.5 mx-auto mt-4"
            style={{ background: `hsl(${EVENT.theme.accentColorHsl} / 0.5)` }}
          />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-border p-6 md:p-8">
          {isLocked ? (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: `hsl(${EVENT.theme.primaryColorHsl} / 0.1)` }}
              >
                <Lock
                  className="w-6 h-6"
                  style={{ color: `hsl(${EVENT.theme.primaryColorHsl})` }}
                />
              </div>
              <div>
                <p className="font-display font-semibold text-lg">Uploads are closed</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Photo uploads aren&apos;t open right now. Check back on the day of the event!
                </p>
              </div>
            </div>
          ) : (
            <UploadForm />
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Photos appear in the guest gallery on the main page
        </p>
      </div>
    </main>
  );
}
