import { NextResponse } from "next/server";
import userModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  await dbConnect();

  const user = await userModel.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  user.emailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  return NextResponse.json({ message: "Email verified successfully" });
}
