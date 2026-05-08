import mongoose, { Schema, Document } from "mongoose";

export interface IRsvp extends Document {
  event: string;
  guest: {
    name: string;
    email?: string;
    phone?: string;
    relationship: string;
  };
  rsvp: {
    status: "attending" | "declined";
    submitted_at: Date;
    updated_at: Date;
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

const RsvpSchema = new Schema<IRsvp>({
  event: { type: String, required: true, index: true },
  guest: {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    relationship: { type: String, required: true },
  },
  rsvp: {
    status: { type: String, enum: ["attending", "declined"], required: true },
    submitted_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    token: { type: String, required: true, unique: true },
  },
  party: {
    total_adults: { type: Number, default: 0 },
    total_kids: { type: Number, default: 0 },
    total_headcount: { type: Number, default: 0 },
  },
  message: {
    msg: { type: String, default: "" },
    is_public: { type: Boolean, default: true },
  },
  meta: {
    ip_address: { type: String, default: "" },
    user_agent: { type: String, default: "" },
    source: { type: String, default: "direct" },
    language: { type: String, default: "en" },
  },
});

export default mongoose.models.Rsvp || mongoose.model<IRsvp>("Rsvp", RsvpSchema);
