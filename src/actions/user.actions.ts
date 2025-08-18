"use server";
import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User";
import { UserDocument, SerializedUser } from "@/types/user";

export const getUser = async (): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  data?: SerializedUser[];
}> => {
  try {
    await dbConnect();
    const data = await userModel.find({})
      .select("-password -verificationToken -verificationTokenExpires -profilePublicId")
      .lean() as UserDocument[];

    if (!data || data.length === 0) {
      return {
        success: false,
        message: "No User Found!",
      };
    }

    const serializedData: SerializedUser[] = data.map(user => ({
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      verificationTokenExpires: user.verificationTokenExpires?.toISOString(),
    }));

    return {
      success: true,
      data: serializedData,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Internal Server Error in getting user detail",
      error: error.message,
    };
  }
};