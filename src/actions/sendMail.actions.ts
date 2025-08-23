"use server";

import userModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import { v4 as uuidv4 } from "uuid";
import { createTransport } from "nodemailer";

export async function resendVerificationEmail(email: string) {
  await dbConnect();

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.emailVerified) {
      return { success: false, message: "Email already verified" };
    }

    const verificationToken = uuidv4();
    await userModel.updateOne(
      { _id: user._id },
      {
        verificationToken,
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    );

    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;

    const transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    await transporter.sendMail({
      from: `"WanderLust" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #A92EDF, #6C63FF); padding: 24px; border-radius: 16px; color: white; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
          <div style="background: rgba(255,255,255,0.1); padding: 24px; border-radius: 12px; backdrop-filter: blur(8px);">
            <h2 style="color: #fff; text-align: center; font-size: 28px; margin-bottom: 16px;">
              Verify Your Email
            </h2>
            <p style="font-size: 16px; line-height: 1.6; text-align: center;">
              Welcome to <strong>WanderLust</strong>! Please verify your email address to complete your registration.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${verificationUrl}" 
                style="display: inline-block; padding: 12px 28px; background: linear-gradient(to right, #A92EDF, #6C63FF); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                Verify Email
              </a>
            </div>
            <p style="font-size: 14px; color: rgba(255,255,255,0.8); text-align: center;">
              This link will expire in 24 hours. If you didn’t create an account, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 24px 0;">
            <p style="font-size: 12px; color: rgba(255,255,255,0.7); word-break: break-all; text-align: center;">
              If the button doesn’t work, copy and paste this link into your browser:<br>
              ${verificationUrl}
            </p>
          </div>
        </div>
      `,
    });

    return { success: true, message: "Verification email resent successfully" };
  } catch (error) {
    console.log("Resend verification error:", error);
    return { success: false, message: "Failed to resend verification email" };
  }
}
