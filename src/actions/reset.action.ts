"use server";
import { createTransport } from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import userModel from "@/models/User";
import { PasswordResetToken } from "@/models/ResetPassword";
import { hash } from "bcryptjs";
import nodemailer from "nodemailer";
import dbConnect from "@/lib/dbConnect";

export async function sendPasswordResetEmail(formData: FormData) {
  const identifier = formData.get("email") as string;
  try {
    await dbConnect();

    if (!identifier) {
      return {
        success: false,
        error: "Please provide either email or phone number",
      };
    }

    const user = await userModel.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return { success: true };
    }

    const email = user.email;
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000);

    await PasswordResetToken.findOneAndUpdate(
      { userId: user._id },
      { token, expiresAt, userId: user._id },
      { upsert: true, new: true }
    );

    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #A92EDF, #6C63FF); padding: 24px; border-radius: 16px; color: white; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
          <div style="background: rgba(255,255,255,0.1); padding: 24px; border-radius: 12px; backdrop-filter: blur(8px);">
            <h2 style="color: #fff; text-align: center; font-size: 28px; margin-bottom: 16px;">
              Password Reset Request
            </h2>
            <p style="font-size: 16px; line-height: 1.6; text-align: center;">
              You requested a password reset for your account. Click the button below to set a new password:
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetLink}" 
                style="display: inline-block; padding: 12px 28px; background: linear-gradient(to right, #A92EDF, #6C63FF); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: rgba(255,255,255,0.8); text-align: center;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 24px 0;">
            <p style="font-size: 12px; color: rgba(255,255,255,0.7); word-break: break-all; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              ${resetLink}
            </p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.log("Password reset error:", error);
    return {
      success: false,
      error: "Failed to send reset email. Please try again later.",
    };
  }
}

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  try {
    await dbConnect();

    const resetToken = await PasswordResetToken.findOne({ token })
      .populate("userId")
      .exec();

    if (!resetToken || new Date() > resetToken.expiresAt) {
      return {
        success: false,
        error: "Invalid or expired token. Please request a new password reset.",
      };
    }

    const hashedPassword = await hash(password, 12);
    await userModel.findByIdAndUpdate(resetToken.userId._id, {
      password: hashedPassword,
    });

    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    return { success: true };
  } catch (error) {
    console.log("Password reset error:", error);
    return {
      success: false,
      error: "Failed to reset password. Please try again.",
    };
  }
}
