"use server";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User";
import { createTransport } from 'nodemailer';

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
      from: `"Cloudship Holidays" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Verify your email address",
      html: `Click <a href="${verificationUrl}">here</a> to verify your email.`,
    });

    return { success: true, message: "Verification email resent successfully" };
  } catch (error) {
    console.log("Resend verification error:", error);
    return { success: false, message: "Failed to resend verification email" };
  }
}
