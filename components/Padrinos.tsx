"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Padrino } from "@/types";

export default function Padrinos({ padrinos }: { padrinos: Padrino[] }) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const sel = gsap.utils.selector(sectionRef) as (q: string) => HTMLElement[];

      gsap.from(sel(".pad-header"), {
        opacity: 0, y: 30, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: sel(".pad-header")[0], start: "top 82%", once: true },
      });

      gsap.from(sel(".pad-card"), {
        opacity: 0,
        y: 50,
        rotation: -4,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: sel(".pad-card")[0], start: "top 85%", once: true },
      });
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <section ref={sectionRef} id="padrinos" className="section-padding bg-white">
      <div className="max-w-4xl mx-auto">
        {/* <div className="pad-header text-center mb-10">
          <p className="font-script text-4xl md:text-5xl text-primary mb-1">Padrinos</p>
          <p className="text-muted-foreground text-sm tracking-wider uppercase">
            With gratitude to our sponsors
          </p>
          <div className="w-16 h-0.5 mx-auto mt-4 bg-accent/40" />
        </div> */}

        <div className="flex flex-wrap justify-center gap-4">
          {padrinos.map((p, i) => (
            <div
              key={i}
              className="flex flex-col pad-card w-[calc(50%-0.5rem)] p-5 rounded-2xl border border-border bg-background text-center hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg">💐</span>
              </div>
              <p className="font-script text-4xl md:text-5xl text-primary mb-1 flex-grow">{p.name}</p>
              <p className="text-xs text-accent mt-1 font-medium tracking-wide">{p.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
