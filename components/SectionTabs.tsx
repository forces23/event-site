"use client";

import { useState, useRef, useEffect } from "react";
import EventInfo   from "@/components/EventInfo";
import Padrinos    from "@/components/Padrinos";
import Court       from "@/components/Court";
import Gallery     from "@/components/Gallery";
import GuestGallery from "@/components/GuestGallery";
import type { EventConfig } from "@/types";

interface SectionTabsProps {
  event: EventConfig;
  initialTab?: "details" | "gallery";
  initialGalleryTab?: "alexa" | "party";
}

type MainTab    = "details" | "gallery";
type GalleryTab = "alexa"   | "party";

export default function SectionTabs({ event, initialTab = "details", initialGalleryTab = "alexa" }: SectionTabsProps) {
  const [mainTab,    setMainTab]    = useState<MainTab>(initialTab);
  const [galleryTab, setGalleryTab] = useState<GalleryTab>(initialGalleryTab);
  const barRef    = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll tabs into view when arriving from the upload page
  useEffect(() => {
    if (initialTab === "gallery") {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchMain = (tab: MainTab) => {
    setMainTab(tab);
    // Scroll the tab bar back to top of viewport so content starts visible
    barRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div id="sections" ref={sectionRef}>
      {/* ── Main tab bar — sticks to top once hero scrolls past ──────────── */}
      <div
        ref={barRef}
        className="sticky top-0 z-40 border-b border-border"
        style={{
          background: "rgba(253,252,248,0.96)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-4xl mx-auto flex">
          {(["details", "gallery"] as MainTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => switchMain(tab)}
              className="relative flex-1 py-4 text-xs font-display tracking-[0.22em] uppercase transition-colors"
              style={{
                color: mainTab === tab
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted-foreground))",
              }}
            >
              {tab === "details" ? "Details" : "Gallery"}

              {/* Active indicator line */}
              {mainTab === tab && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                  style={{
                    width: "40%",
                    background: "hsl(var(--primary))",
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Details tab ───────────────────────────────────────────────────── */}
      {mainTab === "details" && (
        <>
          <EventInfo event={event} />
          <Padrinos  padrinos={event.padrinos} />
          <Court     damas={event.damas} chambelanes={event.chambelanes} />
        </>
      )}

      {/* ── Gallery tab ───────────────────────────────────────────────────── */}
      {mainTab === "gallery" && (
        <div>
          {/* Gallery sub-tab bar */}
          <div className="border-b border-border bg-white">
            <div className="max-w-4xl mx-auto flex">
              {(["alexa", "party"] as GalleryTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setGalleryTab(tab)}
                  className="relative flex-1 py-3 text-xs font-display tracking-[0.18em] uppercase transition-colors"
                  style={{
                    color: galleryTab === tab
                      ? "hsl(var(--accent))"
                      : "hsl(var(--muted-foreground))",
                  }}
                >
                  {tab === "alexa" ? "Alexa's Gallery" : "Party Gallery"}

                  {galleryTab === tab && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                      style={{
                        width: "40%",
                        background: "hsl(var(--accent))",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery sub-tab content */}
          {galleryTab === "alexa" && (
            <Gallery photos={event.herGallery} name={event.name} />
          )}
          {galleryTab === "party" && (
            <GuestGallery eventId={event.id} />
          )}
        </div>
      )}
    </div>
  );
}
