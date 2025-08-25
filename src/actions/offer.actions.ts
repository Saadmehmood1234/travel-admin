"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Offer, { IOffer } from "@/models/Offer";

export interface SerializedOffer {
  _id: string;
  title: string;
  subtitle: string;
  discount: number;
  description: string;
  image: string;
  validUntil: string;
  code: string;
  type: 'percentage' | 'fixed';
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const serializeOffer = (offer: IOffer): SerializedOffer => {
  // Convert to plain object first, then manually serialize each field
  const plainOffer = offer.toObject ? offer.toObject() : offer;
  
  return {
    _id: plainOffer._id.toString(),
    title: plainOffer.title,
    subtitle: plainOffer.subtitle,
    discount: plainOffer.discount,
    description: plainOffer.description,
    image: plainOffer.image,
    validUntil: plainOffer.validUntil.toISOString(),
    code: plainOffer.code,
    type: plainOffer.type,
    icon: plainOffer.icon,
    color: plainOffer.color,
    isActive: plainOffer.isActive,
    createdAt: plainOffer.createdAt.toISOString(),
    updatedAt: plainOffer.updatedAt.toISOString(),
  };
};

export const getOffers = async (): Promise<{
  success: boolean;
  data?: SerializedOffer[];
  error?: string;
}> => {
  try {
    await dbConnect();

    const currentDate = new Date();
    const offers = await Offer.find({
      isActive: true,
      validUntil: { $gte: currentDate },
    }).sort({ createdAt: -1 });

    return {
      success: true,
      data: offers.map(serializeOffer),
    };
  } catch (error) {
    console.error("Error fetching offers:", error);
    return {
      success: false,
      error: "Failed to fetch offers",
    };
  }
};
export const createOffer = async (
  formData: FormData
): Promise<{
  success: boolean;
  data?: SerializedOffer;
  error?: string;
}> => {
  try {
    await dbConnect();

    const offerData = {
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      discount: Number(formData.get("discount")),
      description: formData.get("description") as string,
      image: formData.get("image") as string,
      validUntil: new Date(formData.get("validUntil") as string),
      code: formData.get("code") as string,
      type: formData.get("type") as "percentage" | "fixed",
      icon: formData.get("icon") as string,
      color: formData.get("color") as string,
    };

    const offer = new Offer(offerData);
    await offer.save();

    revalidatePath("/offers");

    return {
      success: true,
      data: serializeOffer(offer),
    };
  } catch (error: any) {
    console.error("Error creating offer:", error);
    return {
      success: false,
      error: error.message || "Failed to create offer",
    };
  }
};

export const updateOffer = async (
  id: string,
  formData: FormData
): Promise<{
  success: boolean;
  data?: SerializedOffer;
  error?: string;
}> => {
  try {
    await dbConnect();

    const updateData = {
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      discount: Number(formData.get("discount")),
      description: formData.get("description") as string,
      image: formData.get("image") as string,
      validUntil: new Date(formData.get("validUntil") as string),
      code: formData.get("code") as string,
      type: formData.get("type") as "percentage" | "fixed",
      icon: formData.get("icon") as string,
      color: formData.get("color") as string,
      isActive: formData.get("isActive") === "true",
    };

    const offer = await Offer.findByIdAndUpdate(id, updateData, { new: true });

    if (!offer) {
      return {
        success: false,
        error: "Offer not found",
      };
    }

    revalidatePath("/offers");

    return {
      success: true,
      data: serializeOffer(offer),
    };
  } catch (error: any) {
    console.error("Error updating offer:", error);
    return {
      success: false,
      error: error.message || "Failed to update offer",
    };
  }
};

export const deleteOffer = async (
  id: string
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    await dbConnect();

    await Offer.findByIdAndDelete(id);

    revalidatePath("/offers");

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error deleting offer:", error);
    return {
      success: false,
      error: error.message || "Failed to delete offer",
    };
  }
};
