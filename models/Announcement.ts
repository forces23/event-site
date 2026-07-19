import mongoose, { Schema, Document } from "mongoose";
import type { AnnouncementColor } from "@/types";

export interface IAnnouncement extends Document {
  event:      string;
  title:      string;
  message:    string;
  color:      AnnouncementColor;
  active:     boolean;
  updated_at: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  event:      { type: String,  required: true, unique: true },
  title:      { type: String,  default: "" },
  message:    { type: String,  default: "" },
  color:      { type: String,  enum: ["theme", "red", "blue", "green", "yellow"], default: "theme" },
  active:     { type: Boolean, default: false },
  updated_at: { type: Date,    default: Date.now },
});

// In dev, hot-reload rebinds AnnouncementSchema but mongoose.models caches the old
// compiled model (without newly-added fields). Delete the stale model so it
// recompiles from the current schema on the next import.
if (process.env.NODE_ENV !== "production" && mongoose.models["Announcement"]) {
  mongoose.deleteModel("Announcement");
}

export default (mongoose.models["Announcement"] as mongoose.Model<IAnnouncement>) ??
  mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);
