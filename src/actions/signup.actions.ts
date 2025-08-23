
"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import userModel from "@/models/User";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import { z } from "zod";
import { headers } from "next/headers";
import { sendVerificationEmail } from "@/utils/sendEmailVerification";
import validator from 'validator';
const emailSchema = z
  .string()
  .email("Invalid email format")
  .transform((email) => email.toLowerCase().trim())
  .refine((email) => validator.isEmail(email), {
    message: "Invalid email address",
  });

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Password must contain at least one number",
  })
  .refine((password) => /[^A-Za-z0-9]/.test(password), {
    message: "Password must contain at least one special character",
  });

const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters")
  .refine((name) => validator.isAlpha(name.replace(/\s/g, "")), {
    message: "Name can only contain letters and spaces",
  });
const phoneSchema = z
  .string()
  .regex(
    /^[6-9]\d{9}$/,
    "Phone must be a valid 10-digit number starting with 6-9"
  );

const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
  })
  .strict();

export const signup = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) => {
  try {
    const headersList = await headers();
    const ip = (headersList.get("x-forwarded-for") ?? "127.0.0.1").split(
      ","
    )[0];
    await dbConnect();

    const validationResult = signupSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error.issues.map((i) => i.message).join(", "),
      };
    }

    const { name, email, password, phone } = validationResult.data;

    const existingUser = await userModel.findOne({
      $and: [{ email }, { emailVerified: true }],
    }).lean();
    if (existingUser) {
      return {
        success: false,
        message: "Email is already register please sign in",
      };
    }


    const userButNotVerified = await userModel.findOne({
      $and: [{ email }, { emailVerified: false }],
    }).lean();
 
    const verificationToken = uuidv4();
    if (userButNotVerified) {
      await sendVerificationEmail(email, verificationToken);
      revalidatePath("/auth/signup");
      return {
        success: true,
        message: "Check mail for the verification",
      };
    }
    if (password.toLowerCase().includes("password")) {
      return {
        success: false,
        message: "Password is too weak or contains personal information",
      };
    }
    const profilePicture = `https://avatar.iran.liara.run/public/boy?username=${encodeURIComponent(
      validator.escape(name)
    )}`;

    const hashedPassword = await bcrypt.hash(password, 12);

    await userModel.create({
      name: validator.escape(name),
      email,
      phone,
      image: profilePicture,
      password: hashedPassword,
      profilePublicId: profilePicture,
      emailVerified: false,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      lastLoginAttempt: new Date(),
      failedLoginAttempts: 0,
      accountLocked: false,
    });

    await sendVerificationEmail(email, verificationToken);

    revalidatePath("/auth/signup");
    return {
      success: true,
      message:
        "Account created! Please check your email to verify your account.",
    };
  } catch (error: any) {
    console.log("Signup error:", error);
    return {
      success: false,
      message: "An error occurred during signup. Please try again later.",
    };
  }
};
