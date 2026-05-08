"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { EventConfig } from "@/types";

const GOLD      = "#C9A84C";
const MINT      = "#6db89a";
const GOLD_GLOW = "rgba(201,168,76,0.55)";
const MINT_GLOW = "rgba(109,184,154,0.50)";

const SPARKLE_SIZE_SCALE = 1.2;  // 20% bigger
const SPARKLE_OP_SCALE   = 1.2;  // 20% brighter (capped at 1)

// Deterministic sparkle positions — no Math.random() to avoid hydration mismatch
const SPARKLES: {
  x: string; y: string; size: number; gold: boolean; op: number; delay: number;
}[] = [
  // Left column
  { x: "3%",  y: "6%",  size: 20, gold: true,  op: 0.82, delay: 0.00 },
  { x: "9%",  y: "18%", size: 11, gold: false, op: 0.58, delay: 0.55 },
  { x: "4%",  y: "33%", size: 16, gold: true,  op: 0.72, delay: 1.10 },
  { x: "14%", y: "10%", size: 9,  gold: false, op: 0.52, delay: 0.35 },
  { x: "19%", y: "26%", size: 13, gold: true,  op: 0.64, delay: 1.40 },
  { x: "6%",  y: "49%", size: 18, gold: false, op: 0.78, delay: 0.80 },
  { x: "22%", y: "43%", size: 10, gold: true,  op: 0.56, delay: 2.00 },
  { x: "11%", y: "63%", size: 14, gold: false, op: 0.68, delay: 0.25 },
  { x: "25%", y: "59%", size: 8,  gold: true,  op: 0.50, delay: 1.65 },
  { x: "5%",  y: "77%", size: 12, gold: false, op: 0.62, delay: 0.90 },
  { x: "20%", y: "83%", size: 16, gold: true,  op: 0.74, delay: 2.30 },
  { x: "8%",  y: "92%", size: 9,  gold: false, op: 0.52, delay: 0.45 },
  // Right column
  { x: "93%", y: "7%",  size: 18, gold: true,  op: 0.80, delay: 0.20 },
  { x: "86%", y: "16%", size: 11, gold: false, op: 0.58, delay: 0.75 },
  { x: "96%", y: "29%", size: 16, gold: true,  op: 0.72, delay: 1.30 },
  { x: "78%", y: "9%",  size: 9,  gold: false, op: 0.52, delay: 0.50 },
  { x: "74%", y: "23%", size: 13, gold: true,  op: 0.64, delay: 1.85 },
  { x: "91%", y: "45%", size: 20, gold: false, op: 0.85, delay: 0.10 },
  { x: "76%", y: "39%", size: 10, gold: true,  op: 0.56, delay: 2.15 },
  { x: "88%", y: "61%", size: 14, gold: false, op: 0.68, delay: 0.65 },
  { x: "73%", y: "56%", size: 8,  gold: true,  op: 0.50, delay: 1.50 },
  { x: "95%", y: "75%", size: 12, gold: false, op: 0.62, delay: 1.00 },
  { x: "80%", y: "85%", size: 16, gold: true,  op: 0.74, delay: 2.45 },
  { x: "92%", y: "93%", size: 9,  gold: false, op: 0.52, delay: 0.35 },
  // Top center (spread across the sky)
  { x: "38%", y: "4%",  size: 12, gold: true,  op: 0.62, delay: 0.60 },
  { x: "51%", y: "10%", size: 18, gold: false, op: 0.78, delay: 1.20 },
  { x: "64%", y: "3%",  size: 10, gold: true,  op: 0.56, delay: 0.40 },
  // Mid scattered — away from the bottom-center text block
  { x: "30%", y: "51%", size: 10, gold: false, op: 0.54, delay: 2.60 },
  { x: "68%", y: "55%", size: 10, gold: true,  op: 0.54, delay: 1.75 },
  { x: "34%", y: "73%", size: 8,  gold: false, op: 0.48, delay: 0.95 },
  { x: "66%", y: "77%", size: 8,  gold: true,  op: 0.48, delay: 2.05 },
];

interface HeroProps {
  event: EventConfig;
}

export default function Hero({ event }: HeroProps) {
  const sectionRef  = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  const eventDate = new Date(event.date);
  const month     = eventDate.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const day       = eventDate.getDate();
  const year      = eventDate.getFullYear();

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const sel = gsap.utils.selector(sectionRef) as (q: string) => HTMLElement[];

      // ── Initial states ───────────────────────────────────────────────────
      gsap.set(sel(".hero-subtitle"), { opacity: 0, y: 24 });
      gsap.set(sel(".hero-name"),     { opacity: 0, y: 56 });
      gsap.set(sel(".hero-date"),     { opacity: 0, y: 24 });
      gsap.set(sel(".hero-chevron"),  { opacity: 0 });

      // ── Text entrance — delay 1.0s to sync with intro overlay ────────────
      gsap.timeline({ delay: 1.0 })
        .to(sel(".hero-subtitle"), { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
        .to(sel(".hero-name"),     { opacity: 1, y: 0, duration: 1.0, ease: "power3.out" }, "-=0.4")
        .to(sel(".hero-date"),     { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.3")
        .to(sel(".hero-chevron"),  { opacity: 0.5,     duration: 0.5, ease: "power2.out" }, "-=0.1");

      // ── Sparkle twinkling — each star flashes on/off on its own rhythm ──
      // Start invisible; GSAP controls all opacity so there's no CSS flash.
      gsap.set(sel(".hero-sparkle"), { scale: 0, opacity: 0 });

      sel(".hero-sparkle").forEach((el, i) => {
        const baseOp   = parseFloat(el.dataset.op    ?? "0.6");
        const delay    = parseFloat(el.dataset.delay ?? "0");
        const spawnDur = 0.25 + (i % 5) * 0.10;   // 0.25 → 0.65 s
        const holdDur  = 0.15 + (i % 7) * 0.12;   // 0.15 → 0.87 s
        const fadeDur  = 0.20 + (i % 4) * 0.10;   // 0.20 → 0.50 s
        const pauseDur = 0.70 + (i % 9) * 0.38;   // 0.70 → 3.74 s

        gsap.timeline({ repeat: -1, delay })
          .to(el, { scale: 1,      opacity: baseOp, duration: spawnDur, ease: "power2.out" })
          .to(el, {                                  duration: holdDur  })
          .to(el, { scale: 0,      opacity: 0,      duration: fadeDur,  ease: "power2.in"  })
          .to(el, {                                  duration: pauseDur });
      });

      // ── Scroll chevron bounce ────────────────────────────────────────────
      gsap.to(sel(".hero-chevron"), {
        y:        8,
        duration: 0.85,
        repeat:   -1,
        yoyo:     true,
        ease:     "sine.inOut",
        delay:    3.5,
      });

      // ── Parallax on the photo as user scrolls ────────────────────────────
      if (parallaxRef.current) {
        gsap.to(parallaxRef.current, {
          yPercent: 28,
          ease:     "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start:   "top top",
            end:     "bottom top",
            scrub:   1.5,
          },
        });
      }
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={
        !event.heroPhoto
          ? {
              background: `linear-gradient(160deg, hsl(${event.theme.primaryColorHsl} / 0.12) 0%, #fdfcf8 40%, hsl(${event.theme.accentColorHsl} / 0.08) 100%)`,
            }
          : undefined
      }
    >
      {/* Full-screen photo + parallax wrapper */}
      {event.heroPhoto && (
        <div
          ref={parallaxRef}
          className="absolute inset-0"
          style={{ willChange: "transform" }}
        >
          <Image
            src={event.heroPhoto}
            alt={event.name}
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      )}

      {/* Sparkle field — 31 independently twinkling SVG stars */}
      <div className="absolute inset-0 pointer-events-none select-none z-10">
        {SPARKLES.map((sp, i) => {
          const size     = sp.size * SPARKLE_SIZE_SCALE;
          const baseOp   = Math.min(sp.op * SPARKLE_OP_SCALE, 1);
          const color    = sp.gold ? GOLD      : MINT;
          const glow     = sp.gold ? GOLD_GLOW : MINT_GLOW;
          const glowPx   = size * 0.45;
          const glowPx2  = size * 0.90;
          return (
            <div
              key={i}
              className="hero-sparkle absolute"
              data-op={baseOp}
              data-delay={sp.delay}
              style={{
                left:       sp.x,
                top:        sp.y,
                width:      size,
                height:     size,
                marginLeft: -size / 2,
                marginTop:  -size / 2,
                color,
                opacity:    0,
                filter:     `drop-shadow(0 0 ${glowPx}px ${color}) drop-shadow(0 0 ${glowPx2}px ${glow})`,
              }}
            >
              <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
                {/* Sharp 4-pointed star — long thin arms, concave waist */}
                <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
                {/* Bright white center core */}
                <circle cx="12" cy="12" r="1.5" fill="rgba(255,255,255,0.92)" />
              </svg>
            </div>
          );
        })}
      </div>

      {/* Text block — pinned to the bottom */}
      <div className="relative z-20 mt-auto pb-20 text-center px-6 space-y-2">
        <p
          className="hero-subtitle text-md md:text-lg tracking-[0.35em] uppercase font-display font-light pb-8"
          style={{
            color: event.heroPhoto
              ? "rgba(255,255,255,0.85)"
              : `hsl(${event.theme.accentColorHsl})`,
          }}
        >
          Quinceañera
        </p>

        <h1
          className="hero-name font-script leading-none"
          style={{
            fontSize: "clamp(4.5rem, 16vw, 10rem)",
            color: event.heroPhoto ? "#ffffff" : `hsl(${event.theme.primaryColorHsl})`,
            textShadow: event.heroPhoto ? "0 2px 24px rgba(0,0,0,0.4)" : undefined,
          }}
        >
          {event.name}
        </h1>

        <div className="hero-date">
          <div
            className="w-20 h-px mx-auto mb-3"
            style={{
              background: event.heroPhoto
                ? "rgba(255,255,255,0.5)"
                : `hsl(${event.theme.accentColorHsl} / 0.5)`,
            }}
          />
          <p
            className="font-display text-md md:text-lg tracking-widest"
            style={{
              color: event.heroPhoto
                ? "rgba(255,255,255,0.75)"
                : "hsl(var(--foreground) / 0.6)",
            }}
          >
            {month} {day}, {year}
          </p>
        </div>
      </div>

      {/* Scroll chevron */}
      <div
        className="hero-chevron absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
        aria-hidden
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{
            color: event.heroPhoto ? "#ffffff" : `hsl(${event.theme.primaryColorHsl})`,
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
