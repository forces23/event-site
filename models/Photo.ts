import mongoose, { Schema, Document } from "mongoose";

export interface IPhoto extends Document {
  event: string;
  key: string;
  url: string;
  original_name: string;
  mime_type: string;
  size: number;
  type: "image" | "video";
  created_at: Date;
}

const PhotoSchema = new Schema<IPhoto>({
  event: { type: String, required: true, index: true },
  key: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  original_name: { type: String, required: true },
  mime_type: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, enum: ["image", "video"], required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Photo || mongoose.model<IPhoto>("Photo", PhotoSchema);
