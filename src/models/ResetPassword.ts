import mongoose, { Schema, model } from "mongoose";

const passwordResetTokenSchema = new Schema(
  {
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const PasswordResetToken =
  mongoose.models?.PasswordResetToken || model("PasswordResetToken", passwordResetTokenSchema);