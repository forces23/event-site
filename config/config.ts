import type { EventConfig } from "@/types";

// Cloudflare R2 bucket that stores guest + curated photo uploads.
export const R2_BUCKET = "quince-uploads";

// ─────────────────────────────────────────────────────────────────────────────
// EVENT TEMPLATE — fill in from the Client Intake Checklist.
// Every value below is a placeholder. Replace each one, then delete the
// "TODO" comments as you go. See config/alexa.ts for a fully filled-in example.
// ─────────────────────────────────────────────────────────────────────────────
export const EVENT: EventConfig = {
  // Unique slug for this event, e.g. "jane_quince_2027". Used as the DB key.
  id: "client_quince_2027",

  // The Basics
  name: "[Quinceañera's Full Name]",        // e.g. "Jane Doe"
  fullTitle: "[Name]'s Quinceañera",        // e.g. "Jane's Quinceañera"

  // Event date & start time (local time, ISO 8601 — include the timezone offset
  // if it differs from the server). TODO: confirm exact start time.
  date: "2027-01-01T18:00:00",
  // Event end time — drives the schedule/countdown end.
  endTime: "2027-01-02T00:00:00",

  // RSVP deadline — after this date, guests can no longer RSVP online.
  rsvpBy: "2026-12-15T23:59:59",

  // Venue & Directions — the address powers the embedded map + directions button.
  venue: {
    name: "[Venue Name]",
    address: "[Full Street Address, City, ST ZIP]",
    // TODO: derive lat/lng + mapsQuery from the address once confirmed.
    lat: 0,
    lng: 0,
    mapsQuery: "[Venue+Name+Full+Street+Address]",
  },

  // Look & Feel — primary + accent color. Defaults to a neutral pink + gold;
  // update the HSL values to match whenever you change the hex.
  theme: {
    primaryColor: "#e07898",
    primaryColorHsl: "343 65% 68%",
    accentColor: "#c9a84c",
    accentColorHsl: "42 56% 55%",
    font: "Playfair Display",
    scriptFont: "Great Vibes",
  },

  // Music — drop the MP3 in public/music/ and point to it here.
  // Set to "" if the client confirms "no song".
  music: "/music/song.mp3",

  // Main / hero photo.
  //   Option 1: a high-res photo — set heroPhoto + heroPhotoMobile to its path.
  //   Option 2: themed design — leave these null to use the themed background.
  heroPhoto: null,
  heroPhotoMobile: null,

  // ─── Extras (optional sections) ───────────────────────────────────────────
  // Padrinos / sponsors — family name + what they're sponsoring.
  padrinos: [
    { name: "[Family Name] Family", role: "Florals" },
    { name: "[Family Name] Family", role: "Catering" },
    { name: "[Family Name] Family", role: "Photography" },
    { name: "[Family Name] Family", role: "Music & DJ" },
    { name: "[Family Name] Family", role: "Venue" },
    { name: "[Family Name] Family", role: "Cake" },
  ],

  // Court — Damas (names + optional photos). Add/remove entries as needed.
  damas: [
    { name: "Dama 1", photo: "/placeholders/dama.jpg" },
    { name: "Dama 2", photo: "/placeholders/dama.jpg" },
    { name: "Dama 3", photo: "/placeholders/dama.jpg" },
    { name: "Dama 4", photo: "/placeholders/dama.jpg" },
  ],

  // Court — Chambelanes (names + optional photos). Add/remove entries as needed.
  chambelanes: [
    { name: "Chambelán 1", photo: "/placeholders/chambelan.jpg" },
    { name: "Chambelán 2", photo: "/placeholders/chambelan.jpg" },
    { name: "Chambelán 3", photo: "/placeholders/chambelan.jpg" },
    { name: "Chambelán 4", photo: "/placeholders/chambelan.jpg" },
  ],

  // Guest-Facing Details — dress code wording.
  dresscode: "[Dress code, e.g. Formal / Semi-formal]",

  // Gift registry / wishlist URL. Set to "" if the client confirms "no registry".
  registry: "https://www.amazon.com/hz/wishlist/ls/PLACEHOLDER",

  // Quinceañera's curated gallery — replace with real photos as they arrive.
  herGallery: [
    "/placeholders/gallery-1.jpg",
    "/placeholders/gallery-2.jpg",
    "/placeholders/gallery-3.jpg",
    "/placeholders/gallery-4.jpg",
    "/placeholders/gallery-5.jpg",
    "/placeholders/gallery-6.jpg",
  ],
};
