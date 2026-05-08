import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import UploadForm from "@/components/upload/UploadForm";
import { EVENT } from "@/config/alexa";

export const metadata: Metadata = {
  title: `Upload Photos — ${EVENT.fullTitle}`,
  description: `Share your photos and videos from ${EVENT.fullTitle}`,
};

export default function UploadPage() {
  return (
    <main
      className="min-h-screen"
      style={{
        background: `linear-gradient(160deg, hsl(${EVENT.theme.primaryColorHsl} / 0.1) 0%, #fdfcf8 50%, hsl(${EVENT.theme.accentColorHsl} / 0.06) 100%)`,
      }}
    >
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to invitation
        </Link>

        {/* Header */}
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

        {/* Upload form */}
        <div className="bg-white rounded-3xl shadow-sm border border-border p-6 md:p-8">
          <UploadForm />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Photos appear in the guest gallery on the main page
        </p>
      </div>
    </main>
  );
}
