"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const VISITED_KEY = "quince_visited";

interface EnvelopeIntroProps {
  onComplete?: () => void;
  onOpen?: () => void;
  eventDate?: string;
}

function WaxSealSVG() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" fill="#b8933e" />
      <circle cx="30" cy="30" r="25" fill="#C9A84C" />
      <circle cx="30" cy="30" r="21" fill="none" stroke="#9a7a2a" strokeWidth="1" strokeDasharray="3 2.5" />
      <text
        x="30" y="36"
        textAnchor="middle"
        fontSize="16"
        fontFamily="Georgia, 'Times New Roman', serif"
        fill="#fffdf0"
        fontStyle="italic"
        fontWeight="bold"
      >
        Q
      </text>
      <circle cx="30" cy="30" r="27" fill="none" stroke="#9a7a2a" strokeWidth="1.5" />
    </svg>
  );
}

export default function EnvelopeIntro({ onComplete, onOpen, eventDate }: EnvelopeIntroProps) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const sceneRef       = useRef<HTMLDivElement>(null);
  const [done, setDone]                   = useState(false);
  const [waitingToOpen, setWaitingToOpen] = useState(true);

  const [alreadyVisited] = useState(() => {
    if (!!localStorage.getItem(VISITED_KEY)) return true;
    if (eventDate && Date.now() >= new Date(eventDate).setHours(0, 0, 0, 0)) return true;
    return false;
  });

  // For returning visitors the envelope never shows — signal immediately on mount
  useEffect(() => {
    if (alreadyVisited) onOpen?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Responsive scaling
  useEffect(() => {
    if (alreadyVisited) return;
    const update = () => {
      if (!sceneRef.current) return;
      // Keep the fully-opened scene inside the viewport. Measured from the
      // scene's center: the card rises to 258px above center (top 52 − rise 195
      // = −143, vs center 115), the envelope sits 115px below, and it's 170px to
      // each side. Scale so the largest extent (the rising card) fits with a
      // small margin, and cap it so it isn't huge on big screens.
      const MARGIN = 24;
      const byW = (window.innerWidth  / 2 - MARGIN) / 170;
      const byH = (window.innerHeight / 2 - MARGIN) / 258;
      sceneRef.current.style.transform = `scale(${Math.min(byW, byH, 2.4)})`;
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [alreadyVisited]);

  // Scroll lock
  useEffect(() => {
    if (alreadyVisited) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [alreadyVisited]);

  useEffect(() => {
    if (done) document.body.style.overflow = "";
  }, [done]);

  // Animation only starts after the user taps (waitingToOpen === false)
  useGSAP(
    () => {
      if (alreadyVisited || waitingToOpen) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        localStorage.setItem(VISITED_KEY, "1");
        setDone(true);
        onComplete?.();
        return;
      }

      const sel = gsap.utils.selector(containerRef) as (q: string) => HTMLElement[];

      localStorage.setItem(VISITED_KEY, "1");

      gsap.timeline({
        delay: 0.2,
        onComplete: () => {
          setDone(true);
          onComplete?.();
        },
      })
        .to(sel(".seal-l"), { x: -18, opacity: 0, duration: 0.38, ease: "power3.in" }, 0)
        .to(sel(".seal-r"), { x: 18,  opacity: 0, duration: 0.38, ease: "power3.in" }, 0)
        .to(sel(".env-flap"), { rotateX: -180, duration: 1.1, ease: "power2.inOut" }, 0.08)
        .to(sel(".ev-card"), { y: -195, duration: 0.9, ease: "power2.out" }, 0.45)
        .to({}, { duration: 2.0 })
        .to(sceneRef.current, { scale: 0, duration: 0.45, ease: "back.in(1.5)" })
        .to(containerRef.current, {
          backdropFilter: "blur(0px)",
          WebkitBackdropFilter: "blur(0px)",
          duration: 0.75,
          ease: "power2.inOut",
        }, ">")
        .to(containerRef.current, { opacity: 0, duration: 0.4, ease: "power2.in" }, ">0.35");
    },
    { scope: containerRef, dependencies: [alreadyVisited, waitingToOpen] },
  );

  if (alreadyVisited || done) return null;

  const handleTap = () => {
    if (!waitingToOpen) return;
    onOpen?.();          // user gesture — audio can now play
    setWaitingToOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #fde8e0 0%, rgba(201,168,76,0.10) 40%, rgba(109,184,154,0.18) 100%)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        cursor: waitingToOpen ? "pointer" : "default",
      }}
      onClick={waitingToOpen ? handleTap : undefined}
    >
      <div ref={sceneRef} className="relative" style={{ width: 340, height: 230 }}>

        <div
          className="ev-card absolute flex flex-col items-center justify-center gap-2"
          style={{
            zIndex: 1,
            width: 272, height: 178, top: 52, left: 34,
            background: "linear-gradient(160deg, #fffdf6 0%, #faf5e8 100%)",
            border: "1.5px solid #C9A84C",
            borderRadius: 8,
            boxShadow: "0 14px 48px rgba(0,0,0,0.20), 0 2px 10px rgba(201,168,76,0.22)",
          }}
        >
          <div className="absolute pointer-events-none" style={{ inset: 7, border: "0.5px solid rgba(201,168,76,0.38)", borderRadius: 4 }} />
          <p className="font-script text-center" style={{ fontSize: "2rem", color: "#C9A84C", lineHeight: 1.1 }}>
            You&apos;re Invited
          </p>
          <div style={{ width: 60, height: 1, background: "#C9A84C", opacity: 0.45 }} />
          <p className="font-display text-center" style={{ fontSize: "0.7rem", color: "#7a5c2a", letterSpacing: "0.20em" }}>
            QUINCE AÑOS
          </p>
        </div>

        <div
          className="absolute inset-0"
          style={{
            zIndex: 2,
            background: "linear-gradient(170deg, #fffcf0 0%, #f5ead8 100%)",
            border: "1.5px solid #C9A84C",
            borderRadius: 6,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(201,168,76,0.15)",
          }}
        >
          <svg width="340" height="230" className="absolute inset-0 pointer-events-none">
            <line x1="0"   y1="230" x2="170" y2="148" stroke="#C9A84C" strokeOpacity="0.20" strokeWidth="1" />
            <line x1="340" y1="230" x2="170" y2="148" stroke="#C9A84C" strokeOpacity="0.20" strokeWidth="1" />
            <line x1="0"   y1="0"   x2="170" y2="100" stroke="#C9A84C" strokeOpacity="0.12" strokeWidth="1" />
            <line x1="340" y1="0"   x2="170" y2="100" stroke="#C9A84C" strokeOpacity="0.12" strokeWidth="1" />
          </svg>
        </div>

        <div className="absolute top-0 left-0 right-0" style={{ height: 132, zIndex: 3, perspective: "1200px" }}>
          <div
            className="env-flap absolute inset-0"
            style={{
              transformOrigin: "top center",
              clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
              background: "linear-gradient(175deg, #fffcf0 0%, #f0e4ba 100%)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              filter: "drop-shadow(0 3px 8px rgba(201,168,76,0.40))",
            }}
          >
            <div className="absolute" style={{ bottom: 8, left: "50%", width: 60, height: 60, transform: "translateX(-50%)" }}>
              <div className="seal-l absolute inset-0" style={{ clipPath: "inset(0 50% 0 0)" }}><WaxSealSVG /></div>
              <div className="seal-r absolute inset-0" style={{ clipPath: "inset(0 0 0 50%)" }}><WaxSealSVG /></div>
            </div>
          </div>
        </div>

      </div>

      {/* Tap to open prompt — absolutely positioned so it doesn't push the
          centered envelope off-center */}
      {waitingToOpen && (
        <div className="absolute bottom-[12%] left-0 right-0 flex flex-col items-center gap-2 animate-pulse pointer-events-none select-none">
          <p className="font-display text-sm tracking-widest uppercase" style={{ color: "#9a7a2a" }}>
            Tap to open
          </p>
        </div>
      )}
    </div>
  );
}
