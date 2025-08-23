"use server";
import nodemailer from "nodemailer";

interface EmailParams {
  email: string;
  productName: string;
  userName: string;
  orderDate: string;
  orderId: string;
  websiteName?: string;
}

export async function sendConfirmationEmail({
  email,
  productName,
  userName,
  orderDate,
  orderId,
  websiteName = "Your Website",
}: EmailParams) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${websiteName} Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Payment Successful - Your ${productName} Subscription is Confirmed!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
          <h2 style="color: #4CAF50;">Payment Successful!</h2>
          <p>Dear ${userName},</p>
          
          <p>Thank you for subscribing to <strong>${productName}</strong>. Your payment has been successfully processed.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Date:</strong> ${orderDate}</p>
          </div>
          
          <p>You will receive your subscription ID and password within the next 24 hours.</p>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br/>
          <strong>${websiteName} Team</strong></p>
          
          <div style="margin-top: 30px; font-size: 12px; color: #777;">
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Error sending confirmation email:", error);
    throw new Error("Failed to send confirmation email");
  }
}
