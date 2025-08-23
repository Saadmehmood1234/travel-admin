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

export const deleteUser = async (userId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  try {
    await dbConnect();
    const result = await userModel.findByIdAndDelete(userId);
    
    if (!result) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to delete user",
      error: error.message,
    };
  }
};

export const updateUserRole = async (userId: string, newRole: "user" | "admin"): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  try {
    await dbConnect();
    const result = await userModel.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    );
    
    if (!result) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      message: "User role updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to update user role",
      error: error.message,
    };
  }
};