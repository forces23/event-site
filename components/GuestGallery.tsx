"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, ImageIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGalleryStore } from "@/stores/galleryStore";
import { gsap, useGSAP } from "@/lib/gsap";
import type { PhotoDocument } from "@/types";
import Link from "next/link";

const POLL_INTERVAL = 30_000;

function PhotoCard({ photo }: { photo: PhotoDocument }) {
  if (photo.type === "video") {
    return (
      <div className="relative aspect-square rounded-xl overflow-hidden bg-foreground/5 flex items-center justify-center">
        <video
          src={photo.url}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
            <svg className="w-5 h-5 text-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-primary/5">
      <Image
        src={photo.url}
        alt={photo.original_name}
        fill
        className="object-cover hover:scale-105 transition-transform duration-500"
        sizes="(max-width: 768px) 50vw, 33vw"
        unoptimized={photo.url.includes("r2.dev")}
      />
    </div>
  );
}

export default function GuestGallery({ eventId }: { eventId: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { photos, isLoading, lastFetched, fetchPhotos } = useGalleryStore();

  useEffect(() => {
    fetchPhotos();
    const id = setInterval(fetchPhotos, POLL_INTERVAL);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const sel = gsap.utils.selector(sectionRef) as (q: string) => HTMLElement[];

      gsap.from(sel(".gg-header"), {
        opacity: 0, y: 30, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: sel(".gg-header")[0], start: "top 82%", once: true },
      });

      gsap.from(sel(".gg-upload-cta"), {
        opacity: 0, y: 24, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: sel(".gg-upload-cta")[0], start: "top 85%", once: true },
      });

      gsap.from(sel(".gg-grid"), {
        opacity: 0, y: 30, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: sel(".gg-grid")[0], start: "top 85%", once: true },
      });
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <section ref={sectionRef} id="guest-gallery" className="section-padding bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="gg-header text-center mb-10">
          <p className="font-script text-4xl md:text-5xl text-primary mb-1">Guest Gallery</p>
          <p className="text-muted-foreground text-sm tracking-wider uppercase">Captured by you</p>
          <div className="w-16 h-0.5 mx-auto mt-4 bg-accent/40" />
        </div>

        {/* Upload CTA */}
        <div className="gg-upload-cta mb-8 p-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 text-center">
          <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="font-display font-semibold mb-1">Share your moments!</p>
          <p className="text-sm text-muted-foreground mb-4">
            Upload your photos and videos from the celebration
          </p>
          <Link href="/upload">
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Photos &amp; Videos
            </Button>
          </Link>
        </div>

        {/* Gallery grid */}
        {isLoading && photos.length === 0 ? (
          <div className="gg-grid flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <RefreshCw className="w-8 h-8 animate-spin opacity-40" />
            <p className="text-sm">Loading photos...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="gg-grid flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <ImageIcon className="w-12 h-12 opacity-20" />
            <p className="text-sm">No photos yet — be the first to upload!</p>
          </div>
        ) : (
          <div className="gg-grid grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {photos.map((photo) => (
              <PhotoCard key={photo._id} photo={photo} />
            ))}
          </div>
        )}

        {lastFetched && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Auto-refreshes every 30 seconds · Last updated{" "}
            {lastFetched.toLocaleTimeString()}
          </p>
        )}
      </div>
    </section>
  );
}
