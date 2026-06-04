"use client";

// Deterministic configs — no Math.random() to avoid SSR hydration mismatch.
// Clouds drift right → left via a pure CSS animation (GPU composited).
const CLOUDS: {
  top: string; scale: number; opacity: number; duration: number; delay: number;
}[] = [
  { top:  "6%", scale: 1.4, opacity: 0.75, duration:  90, delay:   0 },
  { top: "20%", scale: 0.8, opacity: 0.65, duration: 115, delay: -38 },
  { top:  "3%", scale: 1.0, opacity: 0.70, duration:  78, delay: -62 },
  { top: "32%", scale: 1.2, opacity: 0.60, duration: 130, delay: -20 },
  { top: "13%", scale: 0.6, opacity: 0.68, duration:  95, delay: -80 },
  { top: "25%", scale: 1.1, opacity: 0.62, duration: 105, delay: -50 },
];

// Each puff: left%, top%, width%, height% relative to the cloud container
const PUFFS = [
  { l: "2%",  t: "38%", w: "36%", h: "90%"  }, // far left bump
  { l: "18%", t: "8%",  w: "40%", h: "100%" }, // left-centre bump
  { l: "38%", t: "0%",  w: "44%", h: "110%" }, // tallest centre bump
  { l: "58%", t: "14%", w: "38%", h: "92%"  }, // right-centre bump
  { l: "74%", t: "32%", w: "30%", h: "76%"  }, // far right bump
  { l: "8%",  t: "58%", w: "82%", h: "55%"  }, // wide base that connects them
];

function Cloud({
  top, scale, opacity, duration, delay,
}: typeof CLOUDS[0]) {
  const w  = Math.round(340 * scale);
  const h  = Math.round(140 * scale); // taller container so circles aren't clipped
  const blur = `blur(${Math.round(18 * scale)}px)`;

  return (
    <div
      style={{
        position:   "absolute",
        top,
        left:       0,
        width:      w,
        height:     h,
        animation:  `cloud-drift ${duration}s linear ${delay}s infinite`,
        willChange: "transform",
      }}
    >
      {PUFFS.map((p, i) => (
        <div
          key={i}
          style={{
            position:     "absolute",
            left:         p.l,
            top:          p.t,
            width:        p.w,
            height:       p.h,
            background:   "white",
            borderRadius: "50%",
            filter:       blur,
            opacity,
          }}
        />
      ))}
    </div>
  );
}

export default function HeroClouds() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: 6 }}
    >
      {CLOUDS.map((c, i) => (
        <Cloud key={i} {...c} />
      ))}
    </div>
  );
}
