"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, CheckCircle, Navigation, CalendarDays, Shirt, Gift, ExternalLink, Utensils } from "lucide-react";
import { PiChurchDuotone } from "react-icons/pi";


import { Button } from "@/components/ui/button";
import Countdown from "./Countdown";
import MapEmbed from "./MapEmbed";
import DirectionsModal from "./DirectionsModal";
import RSVPModal from "./RSVPModal";
import UpdateRSVPModal from "./UpdateRSVPModal";
import { isDeadlinePassed } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSettingsStore } from "@/stores/settingsStore";
import type { EventConfig, EventPart, FullVenueInfo, VenueInfo } from "@/types";

// A part whose venue has enough detail to support "Get Directions" and the map embed.
function hasDirections(part: EventPart): part is EventPart & { venue: FullVenueInfo } {
  return Boolean(part.venue?.address && part.venue?.mapsQuery);
}

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = d.getHours() >= 12 ? "pm" : "am";
  const hour12 = d.getHours() % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Maps an EventPart.icon string from the config to its component.
const PART_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  church: PiChurchDuotone,
  pin: MapPin,
  cutlery: Utensils,
};

export default function EventInfo({ event }: { event: EventConfig }) {
  const { wishlistEnabled, registryUrl, fetchSettings } = useSettingsStore();
  const effectiveRegistryUrl = registryUrl || event.registry;

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sectionRef = useRef<HTMLElement>(null);

  const [directionsVenue, setDirectionsVenue] = useState<VenueInfo | null>(null);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const rsvpDeadline = new Date(event.rsvpBy).toLocaleDateString("en-US", {
    day: "numeric", month: "long", year: "numeric",
  });
  const deadlinePassed = isDeadlinePassed(event.rsvpBy);

  // The ceremony (if any) + the reception + the dinner (if any), rendered in order.
  const parts: EventPart[] = [
    ...(event.locations.ceremony ? [event.locations.ceremony] : []),
    event.locations.reception,
    ...(event.locations.dinner ? [event.locations.dinner] : []),
  ];
  const venueParts = parts.filter(hasDirections);
  const giftCardVisible = wishlistEnabled && Boolean(event.giftNote || effectiveRegistryUrl);

  // Shared "fill the last row" layout: cards sit `perRow`-per-row on a
  // 6-column grid (perRow 3 → 2 cols each, perRow 2 → 3 cols each). When the
  // last row has fewer than `perRow` cards, they grow to split that row's
  // width evenly (or take the whole row when there's only one) instead of
  // leaving a gap.
  const fillLastRowSpan = (totalCount: number, index: number, perRow: 2 | 3) => {
    const lastRowCount = totalCount % perRow || perRow;
    const lastRowStart = totalCount - lastRowCount;
    const inLastRow = index >= lastRowStart;
    if (!inLastRow) return perRow === 3 ? "sm:col-span-2" : "sm:col-span-3";
    switch (lastRowCount) {
      case 1:
        return "sm:col-span-6";
      case 2:
        return "sm:col-span-3";
      default:
        return "sm:col-span-2";
    }
  };

  const scheduleCardCount = parts.length + 2;
  const gridSpan = (index: number) => fillLastRowSpan(scheduleCardCount, index, 3);

  const detailCardCount = giftCardVisible ? 2 : 1;
  const detailGridSpan = (index: number) => fillLastRowSpan(detailCardCount, index, 3);

  const mapGridSpan = (index: number) => fillLastRowSpan(venueParts.length, index, 2);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const sel = gsap.utils.selector(sectionRef) as (q: string) => HTMLElement[];
      const st = (trigger: HTMLElement, start = "top 82%") => ({
        trigger,
        start,
        once: true,
      });

      gsap.from(sel(".ei-header"), {
        opacity: 0, y: 32, duration: 0.8, ease: "power2.out",
        scrollTrigger: st(sel(".ei-header")[0]),
      });

      gsap.from(sel(".ei-countdown"), {
        opacity: 0, y: 24, duration: 0.7, ease: "power2.out",
        scrollTrigger: st(sel(".ei-countdown")[0]),
      });

      gsap.from(sel(".ei-time-card"), {
        opacity: 0, y: 40, duration: 0.65, stagger: 0.15, ease: "power2.out",
        scrollTrigger: st(sel(".ei-time-card")[0]),
      });

      gsap.from(sel(".ei-venue"), {
        opacity: 0, y: 40, duration: 0.7, stagger: 0.15, ease: "power2.out",
        scrollTrigger: st(sel(".ei-venue")[0]),
      });

      gsap.from(sel(".ei-rsvp"), {
        opacity: 0, y: 32, duration: 0.7, ease: "power2.out",
        scrollTrigger: st(sel(".ei-rsvp")[0]),
      });

      gsap.from(sel(".ei-detail-card"), {
        opacity: 0, y: 40, duration: 0.65, stagger: 0.15, ease: "power2.out",
        scrollTrigger: st(sel(".ei-detail-card")[0]),
      });
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <>
      <section
        ref={sectionRef}
        id="event-info"
        className="section-padding"
        style={{
          background: `linear-gradient(180deg, #fdfcf8 0%, hsl(${event.theme.primaryColorHsl} / 0.06) 100%)`,
        }}
      >
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Section header */}
          <div className="ei-header text-center">
            <p className="font-script text-4xl md:text-5xl text-primary mb-2">Join us</p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold">Event Details</h2>
            <div
              className="w-16 h-0.5 mx-auto mt-4"
              style={{ background: `hsl(${event.theme.accentColorHsl})` }}
            />
          </div>

          {/* Countdown */}
          <div className="ei-countdown text-center space-y-3">
            <p className="text-muted-foreground text-sm tracking-widest uppercase">
              Counting down to the big day
            </p>
            <Countdown targetDate={event.date} />
          </div>

          {/* Schedule strip — Date · Ceremony · Reception · RSVP, side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
            {/* Date */}
            <div className={`ei-time-card ${gridSpan(0)} flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm border border-border hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-center mb-4 text-primary h-9">
                <CalendarDays className="w-9 h-9" />
              </div>
              <p className="font-script text-3xl text-primary mt-1">Date</p>
              <p className="font-display text-3xl md:text-4xl font-semibold capitalize mt-1">{formattedDate}</p>
            </div>
            {parts.map((part, i) => {
              const Icon = PART_ICONS[part.icon] ?? MapPin;
              const isReception = part === event.locations.reception;
              const timeLabel =
                part.time && part.endTime
                  ? `${fmtTime(part.time)} – ${fmtTime(part.endTime)}`
                  : part.time
                  ? fmtTime(part.time)
                  : null;

              if (!hasDirections(part)) {
                // No full venue detail (e.g. dinner, which just names the venue
                // it's held at) — show it as an informational card without
                // directions/maps.
                return (
                  <div
                    key={part.label}
                    className={`ei-venue ${gridSpan(i + 1)} flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm border border-border`}
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-4 text-primary h-9">
                      <Icon className="w-9 h-9" />
                    </div>
                    <p className="font-script text-3xl text-primary mt-1">{part.label}</p>
                    <p className="font-display text-3xl md:text-4xl font-semibold">{timeLabel}</p>
                    {part.venue?.name && (
                      <p className="text-xs text-muted-foreground mt-3">at {part.venue.name}</p>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={part.label}
                  onClick={() => setDirectionsVenue(part.venue)}
                  className={`ei-venue group ${gridSpan(i + 1)} flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm border border-border hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-4 text-primary h-9">
                    <Icon className="w-9 h-9" />
                  </div>
                  <p className="font-script text-3xl text-primary mt-1">{part.label}</p>
                  <p className="font-display text-3xl md:text-4xl font-semibold">{timeLabel}</p>
                  {isReception && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">until Midnight</p>
                  )}
                  <p className="font-display text-sm font-medium mt-3">{part.venue.name}</p>
                  <p className="text-xs text-muted-foreground">{part.venue.address}</p>
                  <span className="mt-auto pt-3 inline-flex items-center gap-1 text-xs text-primary group-hover:underline">
                    <Navigation className="w-3 h-3" />
                    Get Directions
                  </span>
                </button>
              );
            })}

            {/* RSVP card */}
            <div className={`ei-venue ${gridSpan(parts.length + 1)} flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm border border-border hover:shadow-md transition-shadow`}>
              <button
                onClick={() => setRsvpOpen(true)}
                disabled={deadlinePassed}
                className="group flex flex-col items-center disabled:cursor-default disabled:opacity-70"
              >
                <div className="mb-4 h-9 flex items-center text-primary">
                  <CheckCircle className="w-9 h-9" strokeWidth={1.25} />
                </div>
                <p className="font-script text-3xl text-primary leading-tight group-enabled:group-hover:underline">
                  {deadlinePassed ? "RSVP Closed" : "Confirm Attendance"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {deadlinePassed
                    ? `The deadline was ${rsvpDeadline}`
                    : `By ${rsvpDeadline}`}
                </p>
              </button>

              {/* Update an existing RSVP — within the card */}
              <div className="mt-auto pt-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {deadlinePassed
                    ? `Updates closed as of ${rsvpDeadline}`
                    : "Already RSVP’d? Need to make a change?"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUpdateOpen(true)}
                  disabled={deadlinePassed}
                >
                  Update RSVP →
                </Button>
              </div>
            </div>
          </div>

          {/* Maps */}
          {event.locations.reception.venue.embedMap && (
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
              {venueParts.map((part, i) => (
                <div key={part.label} className={`ei-venue space-y-2 ${mapGridSpan(i)}`}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider text-center">
                    {part.label} · {part.venue.name}
                  </p>
                  <MapEmbed query={part.venue.mapsQuery} label={part.venue.name} />
                </div>
              ))}
            </div>
          )}

          {/* Dress Code & Gifts */}
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-6">
            <div className={`ei-detail-card ${detailGridSpan(0)} p-6 rounded-2xl border border-border bg-white hover:shadow-md transition-shadow`}>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shirt className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Dress Code</h3>
              <p className="text-muted-foreground">{event.dresscode}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Guests are encouraged to wear elegant and semi-formal attire.
              </p>
            </div>

            {giftCardVisible && (
              <div className={`ei-detail-card ${detailGridSpan(1)} p-6 rounded-2xl border border-border bg-white hover:shadow-md transition-shadow`}>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Gift className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">Gifts</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Your presence is the best gift of all!
                </p>
                {event.giftNote ? (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Gift preference: </span>
                    <strong className="text-accent">{event.giftNote}</strong>
                  </p>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => window.open(effectiveRegistryUrl, "_blank", "noopener,noreferrer")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Wishlist
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <DirectionsModal
        open={directionsVenue !== null}
        onClose={() => setDirectionsVenue(null)}
        query={directionsVenue?.mapsQuery ?? ""}
        address={directionsVenue?.address ?? ""}
      />
      <RSVPModal
        open={rsvpOpen}
        onClose={() => setRsvpOpen(false)}
        eventName={event.name}
      />
      <UpdateRSVPModal
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
        eventName={event.name}
      />
    </>
  );
}
