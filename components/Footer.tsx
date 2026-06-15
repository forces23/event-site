"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";

interface FooterProps {
  name: string;
}

export default function Footer({ name }: FooterProps) {
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const sel = gsap.utils.selector(footerRef) as (q: string) => HTMLElement[];

      gsap.from(sel(".footer-inner"), {
        opacity: 0, y: 40, duration: 0.9, ease: "power2.out",
        scrollTrigger: { trigger: footerRef.current!, start: "top 88%", once: true },
      });
    },
    { scope: footerRef, dependencies: [] },
  );

  return (
    <footer
      ref={footerRef}
      id="footer"
      className="section-padding border-t border-border"
      style={{ background: "linear-gradient(180deg, #fdfcf8 0%, hsl(153 35% 96%) 100%)" }}
    >
      <div className="footer-inner max-w-xl mx-auto text-center space-y-8">
        {/* QR code section */}
        <div>
          <p className="font-script text-3xl text-primary mb-2">Share your photos</p>
          <p className="text-sm text-muted-foreground mb-6">
            Scan the QR code to upload your photos and videos
          </p>

          <div className="inline-block p-4 bg-white rounded-2xl shadow-md border border-border">
            <Image
              src="/qr-upload.png"
              alt="QR code to upload photos"
              width={180}
              height={180}
              className="rounded-lg"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            {/* <p className="text-xs text-muted-foreground mt-2">/upload</p> */}
          </div>

          <div className="mt-4">
            <Link href="/upload" className="text-sm text-primary hover:underline">
              Or tap here to upload →
            </Link>
          </div>
        </div>

        <div className="w-16 h-0.5 bg-accent/30 mx-auto" />

        <div>
          <p className="font-script text-2xl text-primary">{name}</p>
          <p className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">
            Quinceañera 2026
          </p>
        </div>

        <div>
          <Link
            href="/dashboard/login"
            className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
