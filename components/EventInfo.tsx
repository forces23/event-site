"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Clock, Navigation, CalendarDays, Shirt, Gift, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Countdown from "./Countdown";
import MapEmbed from "./MapEmbed";
import DirectionsModal from "./DirectionsModal";
import RSVPModal from "./RSVPModal";
import UpdateRSVPModal from "./UpdateRSVPModal";
import { isDeadlinePassed } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import type { EventConfig } from "@/types";

export default function EventInfo({ event }: { event: EventConfig }) {
  const [wishlistEnabled, setWishlistEnabled] = useState(true);
  const [registryUrl,     setRegistryUrl]     = useState(event.registry);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d: { wishlist_enabled: boolean; registry_url: string }) => {
        setWishlistEnabled(d.wishlist_enabled);
        setRegistryUrl(d.registry_url);
      })
      .catch(() => { /* fail open — defaults already set */ });
  }, []);
  const sectionRef = useRef<HTMLElement>(null);

  const [directionsOpen, setDirectionsOpen] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });

  const rsvpDeadline  = new Date(event.rsvpBy).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const deadlinePassed = isDeadlinePassed(event.rsvpBy);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const sel = gsap.utils.selector(sectionRef) as (q: string) => HTMLElement[];
      const st  = (trigger: HTMLElement, start = "top 82%") => ({
        trigger,
        start,
        once: true,
      });

      // Section header
      gsap.from(sel(".ei-header"), {
        opacity: 0, y: 32, duration: 0.8, ease: "power2.out",
        scrollTrigger: st(sel(".ei-header")[0]),
      });

      // Countdown
      gsap.from(sel(".ei-countdown"), {
        opacity: 0, y: 24, duration: 0.7, ease: "power2.out",
        scrollTrigger: st(sel(".ei-countdown")[0]),
      });

      // Date / time cards
      gsap.from(sel(".ei-time-card"), {
        opacity: 0, y: 40, duration: 0.65, stagger: 0.15, ease: "power2.out",
        scrollTrigger: st(sel(".ei-time-card")[0]),
      });

      // Venue
      gsap.from(sel(".ei-venue"), {
        opacity: 0, y: 40, duration: 0.7, ease: "power2.out",
        scrollTrigger: st(sel(".ei-venue")[0]),
      });

      // RSVP block
      gsap.from(sel(".ei-rsvp"), {
        opacity: 0, y: 32, duration: 0.7, ease: "power2.out",
        scrollTrigger: st(sel(".ei-rsvp")[0]),
      });

      // Dress code + gifts cards
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

          {/* Date & Time */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="ei-time-card flex items-start gap-3 p-5 rounded-2xl bg-white shadow-sm border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date</p>
                <p className="font-display font-semibold">{formattedDate}</p>
              </div>
            </div>

            <div className="ei-time-card flex items-start gap-3 p-5 rounded-2xl bg-white shadow-sm border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Time</p>
                <p className="font-display font-semibold">{formattedTime} – Midnight</p>
              </div>
            </div>
          </div>

          {/* Venue */}
          <div className="ei-venue space-y-4">
            <div className="flex items-start gap-3 p-5 rounded-2xl bg-white shadow-sm border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Venue</p>
                <p className="font-display font-semibold text-lg">{event.venue.name}</p>
                <p className="text-muted-foreground text-sm mt-0.5">{event.venue.address}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => setDirectionsOpen(true)}
              >
                <Navigation className="w-4 h-4" />
                Directions
              </Button>
            </div>

            <MapEmbed lat={event.venue.lat} lng={event.venue.lng} label={event.venue.name} />
          </div>

          {/* RSVP */}
          <div className="ei-rsvp text-center space-y-4">
            <div
              className="w-16 h-0.5 mx-auto"
              style={{ background: `hsl(${event.theme.accentColorHsl} / 0.4)` }}
            />

            {deadlinePassed ? (
              <div className="p-4 rounded-2xl bg-muted">
                <p className="font-display font-semibold text-muted-foreground">RSVP is now closed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  The RSVP deadline was {rsvpDeadline}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Please RSVP by <strong>{rsvpDeadline}</strong>
                </p>
                <Button
                  size="xl"
                  className="rounded-full px-12 font-display text-lg shadow-lg"
                  onClick={() => setRsvpOpen(true)}
                >
                  RSVP Now 💌
                </Button>
              </>
            )}

            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-2">
                Already RSVP'd? Need to change your RSVP?
              </p>
              <Button variant="ghost" size="sm" onClick={() => setUpdateOpen(true)}>
                Update RSVP →
              </Button>
            </div>
          </div>

          {/* Dress Code & Gifts */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="ei-detail-card p-6 rounded-2xl border border-border bg-white hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shirt className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Dress Code</h3>
              <p className="text-muted-foreground">{event.dresscode}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Guests are encouraged to wear elegant and semi-formal attire.
              </p>
            </div>

            {wishlistEnabled && (
              <div className="ei-detail-card p-6 rounded-2xl border border-border bg-white hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Gift className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">Gifts</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Your presence is the best gift of all! But if you&apos;d like to bring something,
                  feel free to check the wishlist.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open(registryUrl, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="w-4 h-4" />
                  View Wishlist
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <DirectionsModal
        open={directionsOpen}
        onClose={() => setDirectionsOpen(false)}
        query={event.venue.mapsQuery}
        address={event.venue.address}
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
