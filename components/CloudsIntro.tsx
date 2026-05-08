"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// Each blob is a large blurred ellipse with a radial gradient — dense in the
// center, feathering to transparent at the edges — giving a cloud/smoke look.
function Blob({
  cls,
  w,
  h,
  blur,
  opacity = 1,
  style,
}: {
  cls: string;
  w: number;
  h: number;
  blur: number;
  opacity?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cls}
      style={{
        position: "absolute",
        width: w,
        height: h,
        borderRadius: "50%",
        // Pure white radial — dense core, soft transparent edge
        background:
          "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.80) 35%, rgba(255,255,255,0.30) 65%, transparent 100%)",
        filter: `blur(${blur}px)`,
        opacity,
        ...style,
      }}
    />
  );
}

export default function CloudsIntro() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        delay: 0.3,
        onComplete: () => setDone(true),
      });
      return;
    }

    const sel = gsap.utils.selector(containerRef) as (q: string) => HTMLElement[];
    const vw  = window.innerWidth;
    const vh  = window.innerHeight;

    gsap.timeline()
      // Brief pause so the user registers the clouds before they move
      .addLabel("part", 0.7)

      // Left blobs drift left — each at a slightly different speed + angle
      .to(sel(".cl-1"), { x: -vw * 1.5, y: -vh * 0.05, duration: 1.8, ease: "power2.inOut" }, "part")
      .to(sel(".cl-2"), { x: -vw * 1.6, y:  vh * 0.06, duration: 1.65, ease: "power2.inOut" }, "part+=0.06")
      .to(sel(".cl-3"), { x: -vw * 1.4, y: -vh * 0.10, duration: 1.9,  ease: "power1.inOut" }, "part+=0.03")
      .to(sel(".cl-4"), { x: -vw * 1.7, y:  vh * 0.09, duration: 1.55, ease: "power2.inOut" }, "part+=0.10")

      // Right blobs drift right — mirrored
      .to(sel(".cr-1"), { x:  vw * 1.5, y: -vh * 0.05, duration: 1.8,  ease: "power2.inOut" }, "part")
      .to(sel(".cr-2"), { x:  vw * 1.6, y:  vh * 0.06, duration: 1.65, ease: "power2.inOut" }, "part+=0.06")
      .to(sel(".cr-3"), { x:  vw * 1.4, y: -vh * 0.10, duration: 1.9,  ease: "power1.inOut" }, "part+=0.03")
      .to(sel(".cr-4"), { x:  vw * 1.7, y:  vh * 0.09, duration: 1.55, ease: "power2.inOut" }, "part+=0.10")

      // Center blobs dissolve as the gap opens
      .to(sel(".cc"), {
        opacity: 0,
        scale: 0.85,
        duration: 0.9,
        ease: "power2.in",
        stagger: 0.10,
      }, "part+=0.20")

      // Fade the sky backdrop last, then remove component
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => setDone(true),
      }, "part+=1.4");

  }, { scope: containerRef });

  if (done) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 300, overflow: "hidden" }}
      aria-hidden
    >
      {/* Sky backdrop — clearly visible color so white clouds read against it */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #a4cfe0 0%, #c2dff0 30%, #d8edf7 60%, #eef7fb 100%)",
        }}
      />

      {/* ── Left cloud mass ─────────────────────────────────────────────── */}
      {/* Back layer — large, very blurry */}
      <Blob cls="cl-1" w={900} h={700} blur={70} opacity={0.95}
        style={{ top: "5%", left: "-5%" }} />
      {/* Mid layer */}
      <Blob cls="cl-2" w={640} h={500} blur={50} opacity={0.90}
        style={{ top: "35%", left: "5%" }} />
      {/* Lower layer */}
      <Blob cls="cl-3" w={780} h={600} blur={80} opacity={0.88}
        style={{ top: "58%", left: "-8%" }} />
      {/* Front layer — sharper, gives depth */}
      <Blob cls="cl-4" w={460} h={360} blur={30} opacity={0.96}
        style={{ top: "22%", left: "18%" }} />

      {/* ── Right cloud mass ─────────────────────────────────────────────── */}
      <Blob cls="cr-1" w={900} h={700} blur={70} opacity={0.95}
        style={{ top: "5%", right: "-5%" }} />
      <Blob cls="cr-2" w={640} h={500} blur={50} opacity={0.90}
        style={{ top: "35%", right: "5%" }} />
      <Blob cls="cr-3" w={780} h={600} blur={80} opacity={0.88}
        style={{ top: "58%", right: "-8%" }} />
      <Blob cls="cr-4" w={460} h={360} blur={30} opacity={0.96}
        style={{ top: "22%", right: "18%" }} />

      {/* ── Center fill — covers the seam, dissolves as clouds part ──────── */}
      <Blob cls="cc" w={800} h={1000} blur={100} opacity={0.85}
        style={{ top: "-10%", left: "calc(50% - 400px)" }} />
      <Blob cls="cc" w={560}  h={560}  blur={65}  opacity={0.80}
        style={{ top: "25%",  left: "calc(50% - 280px)" }} />
      <Blob cls="cc" w={440}  h={380}  blur={45}  opacity={0.75}
        style={{ bottom: "0%", left: "calc(50% - 220px)" }} />
    </div>
  );
}
