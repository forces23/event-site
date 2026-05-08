"use client";

import { useRef } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { CourtMember } from "@/types";

function MemberCard({ member, className }: { member: CourtMember; className?: string }) {
  const isPlaceholder = member.photo.includes("placeholder");

  return (
    <div className={`flex flex-col items-center gap-2 ${className ?? ""}`}>
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-primary/5">
        {isPlaceholder ? (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-12 h-12 text-primary/20" />
          </div>
        ) : (
          <Image
            src={member.photo}
            alt={member.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}
      </div>
      <p className="font-display text-sm font-medium text-center leading-snug">{member.name}</p>
    </div>
  );
}

interface CourtProps {
  damas: CourtMember[];
  chambelanes: CourtMember[];
}

export default function Court({ damas, chambelanes }: CourtProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const sel       = gsap.utils.selector(sectionRef) as (q: string) => HTMLElement[];
      const damaCards = sel(".court-dama");
      const chamCards = sel(".court-chamba");
      const cols      = 3;

      gsap.from(sel(".court-header"), {
        opacity: 0, y: 30, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: sel(".court-header")[0], start: "top 82%", once: true },
      });

      // Damas — stagger row by row
      gsap.from(damaCards, {
        opacity: 0, y: 50, duration: 0.55, ease: "power2.out",
        stagger: { amount: 0.9, grid: [Math.ceil(damas.length / cols), cols], axis: "y", from: "start" },
        scrollTrigger: { trigger: damaCards[0], start: "top 85%", once: true },
      });

      // Chambelanes — stagger row by row
      gsap.from(chamCards, {
        opacity: 0, y: 50, duration: 0.55, ease: "power2.out",
        stagger: { amount: 0.9, grid: [Math.ceil(chambelanes.length / cols), cols], axis: "y", from: "start" },
        scrollTrigger: { trigger: chamCards[0], start: "top 85%", once: true },
      });
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <section
      ref={sectionRef}
      id="court"
      className="section-padding"
      style={{ background: "linear-gradient(180deg, #fdfcf8 0%, hsl(153 35% 97%) 100%)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="court-header text-center mb-10">
          <p className="font-script text-4xl md:text-5xl text-primary mb-1">Quince Court</p>
          <p className="text-muted-foreground text-sm tracking-wider uppercase">
            The ones by her side
          </p>
          <div className="w-16 h-0.5 mx-auto mt-4 bg-accent/40" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Damas */}
          <div>
            <h3 className="font-script text-3xl text-primary text-center mb-6">Damas</h3>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {damas.map((d, i) => (
                <MemberCard key={i} member={d} className="court-dama" />
              ))}
            </div>
          </div>

          {/* Chambelanes */}
          <div>
            <h3 className="font-script text-3xl text-primary text-center mb-6">Chambelanes</h3>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {chambelanes.map((c, i) => (
                <MemberCard key={i} member={c} className="court-chamba" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
