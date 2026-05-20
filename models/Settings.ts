import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  event:            string;
  upload_locked:    boolean;
  wishlist_enabled: boolean;
  registry_url:     string;
  updated_at:       Date;
}

const SettingsSchema = new Schema<ISettings>({
  event:            { type: String,  required: true, unique: true },
  upload_locked:    { type: Boolean, default: false },
  wishlist_enabled: { type: Boolean, default: true  },
  registry_url:     { type: String,  default: ""    },
  updated_at:       { type: Date,    default: Date.now },
});

export default mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);
