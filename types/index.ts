// ─── Event config ─────────────────────────────────────────────────────────────
export interface Padrino {
  name: string;
  role: string;
}

export interface CourtMember {
  name: string;
  photo: string;
}

export interface EventTheme {
  primaryColor: string;
  primaryColorHsl: string;
  accentColor: string;
  accentColorHsl: string;
  font: string;
  scriptFont: string;
}

export interface VenueInfo {
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  mapsQuery?: string;
  embedMap?: boolean;
}

// A venue with full address/map details — required for parts that support
// "Get Directions" and the map embed (currently just the reception).
export type FullVenueInfo = VenueInfo &
  Required<Pick<VenueInfo, "address" | "lat" | "lng" | "mapsQuery" | "embedMap">>;

// A timed part of the day at a specific venue, e.g. the Misa or the Recepción.
export interface EventPart {
  label: string;   // e.g. "Misa", "Recepción"
  icon: string;    
  time?: string;    // ISO datetime
  endTime?: string;   // ISO datetime
  venue?: VenueInfo;
}

// The places/parts of the celebration, in order.
export interface EventLocations {
  ceremony?: EventPart | null; // Optional ceremony (e.g. the Misa) that precedes the reception.
  reception: EventPart & { venue: FullVenueInfo }; // The reception (always present, always has a full venue).
  dinner?: EventPart; // Optional dinner — its venue (if set) may just be a name, e.g. when it's held at the reception venue.
}

export interface EventConfig {
  id: string;
  // R2 folder (key prefix) for this event's uploads, e.g. "ciarah-hernandez-quince-26".
  // Guest photos go under <storagePrefix>/guest-gallery/, her photos under
  // <storagePrefix>/her-gallery/.
  storagePrefix: string;
  name: string;
  fullTitle: string;
  date: string;
  endTime: string;
  rsvpBy: string;
  locations: EventLocations;
  theme: EventTheme;
  music: string;
  heroPhoto: string | null;
  heroPhotoMobile: string | null;
  padrinos?: Padrino[];
  damas?: CourtMember[];
  chambelanes?: CourtMember[];
  dresscode: string;
  registry: string;
  // Plain-text gift instructions shown instead of a registry link,
  // e.g. "Lluvia de sobres". Takes precedence over `registry` when set.
  giftNote?: string | null;
  // English wording shown in place of `giftNote` when a guest uses the
  // browser's built-in translation (avoids a literal mistranslation).
  giftNoteEn?: string | null;
  herGallery: string[];
}

// ─── RSVP ─────────────────────────────────────────────────────────────────────
export interface RsvpGuest {
  name: string;
  email?: string;
  phone?: string;
  relationship: string;
}

export interface RsvpFormData {
  name: string;
  email: string;
  phone: string;
  relationship: string;
  status: "attending" | "declined";
  total_adults: number;
  total_kids: number;
  msg: string;
  is_public: boolean;
}

export interface RsvpDocument {
  _id: string;
  event: string;
  guest: {
    name: string;
    email?: string;
    phone?: string;
    relationship: string;
  };
  rsvp: {
    status: "attending" | "declined";
    submitted_at: string;
    updated_at: string;
    token: string;
  };
  party: {
    total_adults: number;
    total_kids: number;
    total_headcount: number;
  };
  message: {
    msg: string;
    is_public: boolean;
  };
  meta: {
    ip_address: string;
    user_agent: string;
    source: string;
    language: string;
  };
}

// ─── Photos ───────────────────────────────────────────────────────────────────
export interface PhotoDocument {
  _id: string;
  event: string;
  key: string;
  url: string;
  original_name: string;
  mime_type: string;
  size: number;
  type: "image" | "video";
  category: "guest" | "her";
  created_at: string;
}

export interface PresignRequest {
  name: string;
  type: string;
  size: number;
}

export interface PresignResponse {
  presigned_url: string;
  key: string;
  public_url: string;
}

// ─── Announcements ─────────────────────────────────────────────────────────────
// "theme" pulls the color from EVENT.theme.primaryColor; the rest are fixed swatches.
export type AnnouncementColor = "theme" | "red" | "blue" | "green" | "yellow";

export interface PublicAnnouncement {
  id: string;
  title: string;
  message: string;
  color: AnnouncementColor;
  active: boolean;
  updatedAt: string;
}

// ─── Dashboard stats ─────────────────────────────────────────────────────────
export interface DashboardStats {
  total_responses: number;
  attending: number;
  declined: number;
  total_headcount: number;
  total_adults: number;
  total_kids: number;
}
