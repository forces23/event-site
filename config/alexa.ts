import type { EventConfig } from "@/types";

export const R2_BUCKET = "quince-uploads";

export const EVENT: EventConfig = {
  id: "alexa_quince_2026",
  name: "Alexa Hernandez",
  fullTitle: "Alexa's Quinceañera",

  // July 24, 2026 at 6:00 PM local time
  date: "2026-07-24T18:00:00",
  endTime: "2026-07-25T00:00:00",

  // Update this once the RSVP deadline is decided
  rsvpBy: "2026-07-14T23:59:59",

  venue: {
    name: "La Roma Banquet Hall",
    address: "32550 Cherry Hill Rd, Garden City, MI 48135",
    lat: 42.31096285967381,
    lng: -83.3617871282617,
    mapsQuery: "La+Roma+Banquet+Hall+32550+Cherry+Hill+Rd+Garden+City+MI+48135",
  },

  theme: {
    // Pink + gold — change these per sister
    primaryColor: "#e07898",
    primaryColorHsl: "343 65% 68%",
    accentColor: "#c9a84c",
    accentColorHsl: "42 56% 55%",
    font: "Playfair Display",
    scriptFont: "Great Vibes",
  },

  // Drop your MP3 in public/music/ and update this path
  music: "/music/song.mp3",

  // Set to a path string once the photo is ready, e.g. "/photos/alexa.jpg"
  // heroPhoto: "/photos/alexa-ai-1.png",
  heroPhoto: "/photos/floral-1.png",
  heroPhotoMobile: "/photos/floral-mobile.png",

  padrinos: [
    { name: "[Family Name] Family", role: "Florals" },
    { name: "[Family Name] Family", role: "Catering" },
    { name: "[Family Name] Family", role: "Photography" },
    { name: "[Family Name] Family", role: "Music & DJ" },
    { name: "[Family Name] Family", role: "Venue" },
    { name: "[Family Name] Family", role: "Cake" },
  ],

  damas: [
    { name: "Dama 1", photo: "/placeholders/dama.jpg" },
    { name: "Dama 2", photo: "/placeholders/dama.jpg" },
    { name: "Dama 3", photo: "/placeholders/dama.jpg" },
    { name: "Dama 4", photo: "/placeholders/dama.jpg" },
    { name: "Dama 5", photo: "/placeholders/dama.jpg" },
    { name: "Dama 6", photo: "/placeholders/dama.jpg" },
    { name: "Dama 7", photo: "/placeholders/dama.jpg" },
  ],

  chambelanes: [
    { name: "Chambelán 1", photo: "/placeholders/chambelan.jpg" },
    { name: "Chambelán 2", photo: "/placeholders/chambelan.jpg" },
    { name: "Chambelán 3", photo: "/placeholders/chambelan.jpg" },
    { name: "Chambelán 4", photo: "/placeholders/chambelan.jpg" },
    { name: "Chambelán 5", photo: "/placeholders/chambelan.jpg" },
    { name: "Chambelán 6", photo: "/placeholders/chambelan.jpg" },
    { name: "Chambelán 7", photo: "/placeholders/chambelan.jpg" },
  ],

  dresscode: "Look your best!",

  // Replace with the real registry URL when ready
  registry: "https://www.amazon.com/hz/wishlist/ls/PLACEHOLDER",

  // Her curated gallery — add real photos here as they become available
  herGallery: [
    "/placeholders/gallery-1.jpg",
    "/placeholders/gallery-2.jpg",
    "/placeholders/gallery-3.jpg",
    "/placeholders/gallery-4.jpg",
    "/placeholders/gallery-5.jpg",
    "/placeholders/gallery-6.jpg",
  ],
};
