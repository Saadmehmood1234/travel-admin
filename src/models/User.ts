import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String },
    image: {
      type: String,
    },
    profilePublicId: {
      type: String,
    },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date }, 
    hasClaimedCanva: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    provider: { type: String, default: "credentials" },
  },
  { timestamps: true }
);

const   userModel =
  mongoose.models?.User || model("User", userSchema);
export default userModel;