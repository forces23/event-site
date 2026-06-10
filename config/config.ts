import type { EventConfig } from "@/types";

// Cloudflare R2 bucket that stores guest + curated photo uploads.
export const R2_BUCKET = "quince-uploads";

// ─────────────────────────────────────────────────────────────────────────────
// EVENT — Ciarah Hernandez · Mis 15 Años · 8 de agosto, 2026
// ─────────────────────────────────────────────────────────────────────────────
export const EVENT: EventConfig = {
  id: "ciarah_quince_2026",
  storagePrefix: "ciarah-hernandez-quince-26",
  name: "Ciarah Hernandez",
  fullTitle: "Mis 15 Años",
  
  date: "2026-08-08T16:00:00", // Saturday, August 8, 2026 — Misa at 4:00 PM (the day starts here).
  endTime: "2026-08-09T00:00:00", // "Media Noche" — the celebration runs until midnight.
  rsvpBy: "2026-07-18T23:59:59", // "Confirmar asistencia antes del 18 de Julio, 2026"

  locations: {
    // Misa — 4:00 PM
    ceremony: {
      label: "Misa",
      icon: "church",
      time: "2026-08-08T16:00:00",
      venue: {
        name: "Most Holy Trinity Church",
        address: "1050 Porter St, Detroit, MI 48226",
        // Approximate — the map embeds + directions are driven by the address.
        lat: 42.330080635541336,
        lng: -83.05981264630799,
        mapsQuery: "Most Holy Trinity Church, 1050 Porter St, Detroit, MI 48226",
        embedMap: false,
      },
    },
    // Recepción — 5:00 PM
    reception: {
      label: "Recepción",
      icon: "pin",
      time: "2026-08-08T17:00:00",
      venue: {
        name: "The Lincoln Manor",
        address: "25160 Outer Dr, Lincoln Park, MI 48146",
        // Approximate — the map embeds + directions are driven by the address.
        lat: 42.268294316491335,
        lng: -83.17900513039932,
        mapsQuery: "The Lincoln Manor, 25160 Outer Dr, Lincoln Park, MI 48146",
        embedMap: true,
      },
    },
  },

  // Look & Feel — pink + gold.
  theme: {
    primaryColor: "#e07898",
    primaryColorHsl: "343 65% 68%",
    accentColor: "#c9a84c",
    accentColorHsl: "42 56% 55%",
    font: "Playfair Display",
    scriptFont: "Great Vibes",
  },

  music: "", // No song.
  heroPhoto: "/photos/background-pink-gold-floral.png",
  heroPhotoMobile: "/photos/background-pink-gold-floral-mobile.png",

  // Padrinos / Sponsors.
  padrinos: [
    { name: "Aracely & Oscar Hernandez", role: "Mis Padres" },
    { name: "Faviola & Jorge\u2002Lopez", role: "Mis Padrinos" },
  ],

  damas: [],
  chambelanes: [],

  dresscode: "Formal",

  registry: "",
  giftNote: "Lluvia de sobres",
  giftNoteEn: "Cash in an envelope",

  herGallery: [],
};
