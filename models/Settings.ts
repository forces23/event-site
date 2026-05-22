import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  event:               string;
  upload_locked:       boolean;
  wishlist_enabled:    boolean;
  her_gallery_enabled: boolean;
  registry_url:        string;
  updated_at:          Date;
}

const SettingsSchema = new Schema<ISettings>({
  event:               { type: String,  required: true, unique: true },
  upload_locked:       { type: Boolean, default: false },
  wishlist_enabled:    { type: Boolean, default: true  },
  her_gallery_enabled: { type: Boolean, default: true  },
  registry_url:        { type: String,  default: ""    },
  updated_at:          { type: Date,    default: Date.now },
});

// In dev, hot-reload rebinds SettingsSchema but mongoose.models caches the old
// compiled model (without newly-added fields). Delete the stale model so it
// recompiles from the current schema on the next import.
if (process.env.NODE_ENV !== "production" && mongoose.models["Settings"]) {
  mongoose.deleteModel("Settings");
}

export default (mongoose.models["Settings"] as mongoose.Model<ISettings>) ??
  mongoose.model<ISettings>("Settings", SettingsSchema);
