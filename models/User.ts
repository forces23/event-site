import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], required: true },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
