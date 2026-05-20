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

export interface EventConfig {
  id: string;
  name: string;
  fullTitle: string;
  date: string;
  endTime: string;
  rsvpBy: string;
  venue: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    mapsQuery: string;
  };
  theme: EventTheme;
  music: string;
  heroPhoto: string | null;
  heroPhotoMobile: string | null;
  padrinos: Padrino[];
  damas: CourtMember[];
  chambelanes: CourtMember[];
  dresscode: string;
  registry: string;
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

// ─── Dashboard stats ─────────────────────────────────────────────────────────
export interface DashboardStats {
  total_responses: number;
  attending: number;
  declined: number;
  total_headcount: number;
  total_adults: number;
  total_kids: number;
}
