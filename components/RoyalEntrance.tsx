"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// ── Site theme colors ─────────────────────────────────────────────────────────
const GOLD   = "#c9a84c"; // accent — hsl(42 56% 55%)
const GOLD_L = "#e0c270"; // lighter tint
const GOLD_D = "#9a7a2a"; // darker shade (outlines, depth)
const MINT   = "#6db89a"; // primary — hsl(153 35% 57%)
const MINT_L = "#93ccb4"; // lighter mint for gem highlights
const MINT_D = "#3d8a6a"; // deeper mint for outlines

// ── Deterministic particles — inner/mid/outer rings ──────────────────────────
const PARTICLES = (() => {
  const list: {
    id: number; tx: number; ty: number;
    size: number; gold: boolean; delay: number;
  }[] = [];

  const rings = [
    { count: 10, r: 110, size: 9  },
    { count: 18, r: 210, size: 6  },
    { count: 24, r: 330, size: 4  },
  ];

  let id = 0;
  rings.forEach(({ count, r, size }) => {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (id % 5) * 0.18;
      list.push({
        id:    id++,
        tx:    Math.cos(angle) * r,
        ty:    Math.sin(angle) * r,
        size:  size + (id % 3) * 1.2,
        gold:  id % 3 !== 1, // 2/3 gold, 1/3 mint
        delay: (i % 8) * 0.04,
      });
    }
  });
  return list;
})();

// ── Crown SVG — gold body, mint gems ─────────────────────────────────────────
function CrownSVG() {
  return (
    <svg
      width="200"
      height="148"
      viewBox="0 0 200 148"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gold body gradient */}
        <linearGradient id="cg-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={GOLD_L} />
          <stop offset="45%"  stopColor={GOLD}   />
          <stop offset="100%" stopColor={GOLD_D}  />
        </linearGradient>
        {/* Gold base band */}
        <linearGradient id="cg-base" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={GOLD_D}  />
          <stop offset="50%"  stopColor={GOLD_L}  />
          <stop offset="100%" stopColor={GOLD_D}  />
        </linearGradient>
        {/* Mint gem gradient */}
        <radialGradient id="cg-gem" cx="40%" cy="35%">
          <stop offset="0%"   stopColor={MINT_L} />
          <stop offset="60%"  stopColor={MINT}   />
          <stop offset="100%" stopColor={MINT_D}  />
        </radialGradient>
        <filter id="gem-glow">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Crown body */}
      <path
        d="M 14 138 L 14 76 L 56 106 L 100 14 L 144 106 L 186 76 L 186 138 Z"
        fill="url(#cg-body)"
        stroke={GOLD_D}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Inner highlight lines */}
      <line x1="56" y1="106" x2="100" y2="14" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      <line x1="144" y1="106" x2="100" y2="14" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />

      {/* Base band */}
      <rect
        x="14" y="120" width="172" height="18" rx="5"
        fill="url(#cg-base)"
        stroke={GOLD_D}
        strokeWidth="1"
      />

      {/* Center peak — mint star gem */}
      <polygon
        points="100,6 105,20 120,20 108,29 113,44 100,35 87,44 92,29 80,20 95,20"
        fill="url(#cg-gem)"
        stroke={MINT_D}
        strokeWidth="1"
        filter="url(#gem-glow)"
      />
      <circle cx="100" cy="26" r="4" fill="rgba(255,255,255,0.7)" />

      {/* Left peak gem — mint */}
      <circle cx="56"  cy="106" r="10" fill="url(#cg-gem)" stroke={MINT_D} strokeWidth="1.5" filter="url(#gem-glow)" />
      <circle cx="56"  cy="106" r="4"  fill="rgba(255,255,255,0.6)" />

      {/* Right peak gem — mint */}
      <circle cx="144" cy="106" r="10" fill="url(#cg-gem)" stroke={MINT_D} strokeWidth="1.5" filter="url(#gem-glow)" />
      <circle cx="144" cy="106" r="4"  fill="rgba(255,255,255,0.6)" />

      {/* Base gems — alternating gold and mint */}
      <circle cx="38"  cy="129" r="7"   fill={GOLD}  filter="url(#gem-glow)" />
      <circle cx="38"  cy="129" r="2.8" fill="rgba(255,255,255,0.6)" />

      <circle cx="70"  cy="129" r="5.5" fill="url(#cg-gem)" filter="url(#gem-glow)" />
      <circle cx="70"  cy="129" r="2.2" fill="rgba(255,255,255,0.55)" />

      <circle cx="100" cy="130" r="8"   fill={GOLD}  filter="url(#gem-glow)" />
      <circle cx="100" cy="130" r="3.2" fill="rgba(255,255,255,0.65)" />

      <circle cx="130" cy="129" r="5.5" fill="url(#cg-gem)" filter="url(#gem-glow)" />
      <circle cx="130" cy="129" r="2.2" fill="rgba(255,255,255,0.55)" />

      <circle cx="162" cy="129" r="7"   fill={GOLD}  filter="url(#gem-glow)" />
      <circle cx="162" cy="129" r="2.8" fill="rgba(255,255,255,0.6)" />

      {/* Sparkle cross above center gem */}
      <line x1="100" y1="1"   x2="100" y2="8"   stroke={GOLD_L} strokeWidth="2" />
      <line x1="96.5" y1="4.5" x2="103.5" y2="4.5" stroke={GOLD_L} strokeWidth="2" />
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
interface RoyalEntranceProps {
  name: string;
  date: string;
}

export default function RoyalEntrance({ name, date }: RoyalEntranceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  const dateLabel = new Date(date)
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();

  useGSAP(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      gsap.to(containerRef.current, {
        opacity: 0, duration: 0.5, delay: 0.3,
        onComplete: () => setDone(true),
      });
      return;
    }

    const sel = gsap.utils.selector(containerRef) as (q: string) => HTMLElement[];

    // Clip starts full — collapses to a point on exit
    gsap.set(containerRef.current, { clipPath: "circle(150% at 50% 42%)" });

    // ── Particle burst ────────────────────────────────────────────────────────
    sel(".spark").forEach((el) => {
      gsap.fromTo(
        el,
        { x: 0, y: 0, scale: 0, opacity: 0 },
        {
          x:       parseFloat(el.dataset.tx!),
          y:       parseFloat(el.dataset.ty!),
          scale:   1,
          opacity: parseFloat(el.dataset.op!),
          duration: 1.0,
          ease:    "power3.out",
          delay:   parseFloat(el.dataset.delay!),
        },
      );
    });

    // ── Crown + text entrance ─────────────────────────────────────────────────
    const tl = gsap.timeline();

    tl.fromTo(".re-glow",
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.1, ease: "power2.out", delay: 0.4 },
    )
    .fromTo(".re-crown",
      { y: -120, scale: 0.35, opacity: 0 },
      { y: 0,    scale: 1,    opacity: 1, duration: 0.85, ease: "back.out(1.8)" },
      "-=0.45",
    )
    .fromTo(".re-label",
      { opacity: 0, letterSpacing: "0.6em", y: 10 },
      { opacity: 1, letterSpacing: "0.3em", y: 0, duration: 0.75, ease: "power2.out" },
      "-=0.15",
    )
    .fromTo(".re-name",
      { opacity: 0, y: 22, scale: 0.92 },
      { opacity: 1, y: 0,  scale: 1,   duration: 0.9, ease: "power3.out" },
      "-=0.2",
    )
    .fromTo(".re-date",
      { opacity: 0 },
      { opacity: 0.65, duration: 0.6 },
      "-=0.1",
    )

    // ── Particle twinkle ──────────────────────────────────────────────────────
    .to(sel(".spark"), {
      opacity: (_, el) => parseFloat(el.dataset.op!) * 0.45,
      scale:   0.65,
      duration: 1.0,
      stagger:  0.02,
      ease:    "sine.inOut",
      yoyo:    true,
      repeat:  1,
    }, ">0.4")

    // ── Exit ──────────────────────────────────────────────────────────────────
    .to([".re-glow", ".re-crown", ".re-label", ".re-name", ".re-date"], {
      opacity: 0,
      scale:   1.1,
      duration: 0.5,
      ease:    "power2.in",
      stagger:  0.03,
    }, ">0.3")
    .to(sel(".spark"), {
      x: 0, y: 0, scale: 0, opacity: 0,
      duration: 0.55,
      ease:    "power2.in",
      stagger:  0.008,
    }, "<")
    .to(containerRef.current, {
      clipPath: "circle(0% at 50% 42%)",
      duration: 0.75,
      ease:    "power2.in",
      onComplete: () => setDone(true),
    }, "-=0.3");

  }, { scope: containerRef });

  if (done) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 300 }}
      aria-hidden
    >
      {/* Deep dark mint night sky — matches the site's primary palette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(ellipse 70% 55% at 50% 42%, rgba(201,168,76,0.13) 0%, transparent 55%), ` +
            `linear-gradient(160deg, #071a12 0%, #0d2a1c 30%, #122e20 60%, #071510 100%)`,
        }}
      />

      {/* Gold halo behind crown */}
      <div
        className="re-glow absolute"
        style={{
          width:        420,
          height:       420,
          borderRadius: "50%",
          background:
            `radial-gradient(circle, rgba(201,168,76,0.30) 0%, rgba(109,184,154,0.10) 50%, transparent 70%)`,
          filter:  "blur(28px)",
          top:     "50%",
          left:    "50%",
          transform: "translate(-50%, -64%)",
        }}
      />

      {/* Particles — gold + mint */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="spark"
          data-tx={p.tx}
          data-ty={p.ty}
          data-op={p.gold ? 0.92 : 0.78}
          data-delay={p.delay}
          style={{
            position:     "absolute",
            top:          "calc(42% - 4px)",
            left:         "calc(50% - 4px)",
            width:         p.size,
            height:        p.size,
            borderRadius: "50%",
            background:    p.gold
              ? `radial-gradient(circle, ${GOLD_L} 0%, ${GOLD} 55%, transparent 100%)`
              : `radial-gradient(circle, ${MINT_L} 0%, ${MINT} 55%, transparent 100%)`,
            boxShadow:     p.gold
              ? `0 0 ${p.size * 2.5}px ${p.size * 0.8}px rgba(201,168,76,0.65)`
              : `0 0 ${p.size * 2.5}px ${p.size * 0.8}px rgba(109,184,154,0.55)`,
          }}
        />
      ))}

      {/* Crown + text */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
        style={{ marginTop: "-5vh" }}
      >
        <div
          className="re-crown"
          style={{
            filter:
              `drop-shadow(0 0 18px rgba(201,168,76,0.9)) drop-shadow(0 0 40px rgba(109,184,154,0.35))`,
          }}
        >
          <CrownSVG />
        </div>

        <p
          className="re-label font-display font-light uppercase"
          style={{ fontSize: "0.7rem", color: GOLD_L, letterSpacing: "0.3em" }}
        >
          Quinceañera
        </p>

        <h1
          className="re-name font-script"
          style={{
            fontSize:   "clamp(4rem, 16vw, 8.5rem)",
            lineHeight:  1,
            color:       "#ffffff",
            textShadow:
              `0 0 28px rgba(201,168,76,0.95), 0 0 65px rgba(109,184,154,0.40), 0 2px 12px rgba(0,0,0,0.7)`,
          }}
        >
          {name}
        </h1>

        <p
          className="re-date font-display"
          style={{
            fontSize:      "0.7rem",
            letterSpacing: "0.25em",
            color:         MINT_L,
            opacity:       0.8,
          }}
        >
          {dateLabel}
        </p>
      </div>
    </div>
  );
}
