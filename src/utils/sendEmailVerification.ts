import { createTransport } from "nodemailer";
import validator from "validator";

export async function sendVerificationEmail(
  email: string | null | undefined,
  token: string
) {
  if (!email || !validator.isEmail(email)) {
    throw new Error("Invalid email address for verification");
  }

  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

  if (
    !validator.isURL(verificationUrl, {
      protocols: ["http", "https"],
      require_protocol: true,
      host_whitelist: [new URL(process.env.NEXTAUTH_URL!).hostname],
    })
  ) {
    console.log("Invalid verification URL");
  }

  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"WanderLust" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Verify your WanderLust account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #A92EDF, #6C63FF); padding: 24px; border-radius: 16px; color: white; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
        <div style="background: rgba(255,255,255,0.1); padding: 24px; border-radius: 12px; backdrop-filter: blur(8px);">
          <h2 style="color: #fff; text-align: center; font-size: 28px; margin-bottom: 16px;">
            Welcome to WanderLust
          </h2>
          <p style="font-size: 16px; line-height: 1.6; text-align: center;">
            Thanks for signing up! Please verify your email address to start your journey and unlock exclusive travel deals.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${verificationUrl}" 
              style="display: inline-block; padding: 12px 28px; background: linear-gradient(to right, #A92EDF, #6C63FF); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
              Verify Email
            </a>
          </div>
          <p style="font-size: 14px; color: rgba(255,255,255,0.8); text-align: center;">
            If you didn’t sign up for WanderLust, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 24px 0;">
          <p style="font-size: 12px; color: rgba(255,255,255,0.7); word-break: break-all; text-align: center;">
            If the button doesn’t work, copy and paste this link into your browser:<br>
            ${verificationUrl}
          </p>
        </div>
        <p style="text-align: center; font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 16px;">
          © ${new Date().getFullYear()} WanderLust. All rights reserved.
        </p>
      </div>
    `,
    text: `Please verify your email: ${verificationUrl}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }
}
