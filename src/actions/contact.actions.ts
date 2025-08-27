"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TravelContactForm from "@/models/Contact";
import { ContactFormType } from "@/types/contact";
import dbConnect from "@/lib/dbConnect";
import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional().or(z.literal("")),
  destination: z.string().optional(),
  travelDate: z.string().optional(),
  flightRequired: z.enum(["Yes", "No"]).optional(),
  adults: z.number().min(1).max(20).optional(),
  children: z.number().min(0).max(20).optional(),
  tripPlanningStatus: z.string().optional(),
  timeToBook: z.string().optional(),
  additionalDetails: z.string().optional(),
});

export const contactUs = async (data: ContactFormType) => {
  try {
    const processedData = {
      ...data,
      adults: data.adults ? Number(data.adults) : 1,
      children: data.children ? Number(data.children) : 0,
    };
    
    contactFormSchema.parse(processedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0].message,
      };
    }
    return {
      success: false,
      message: "Invalid form data",
    };
  }
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, message: "Signin to continue", status: 401 };
  }

  try {
    await dbConnect();

    const contactForm = new TravelContactForm({
      name: data.name,
      email: data.email,
      phone: data.phone,
      destination: data.destination,
      travelDate: data.travelDate ? new Date(data.travelDate) : undefined,
      flightRequired: data.flightRequired,
      adults: data.adults || 1,
      children: data.children || 0,
      tripPlanningStatus: data.tripPlanningStatus,
      timeToBook: data.timeToBook,
      additionalDetails: data.additionalDetails,
    });

    await contactForm.save();

    return { success: true, message: "Message Sent Successfully" };
  } catch (error) {
    console.error("Error saving contact form:", error);
    return {
      success: false,
      message: "Failed to send message",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  };
};

export const deleteContactSubmission = async (id: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized", status: 401 };
  }

  try {
    await dbConnect();
    const result = await TravelContactForm.findByIdAndDelete(id);
    
    if (!result) {
      return { success: false, message: "Submission not found" };
    }
    
    return { success: true, message: "Submission deleted successfully" };
  } catch (error) {
    console.error("Error deleting contact submission:", error);
    return {
      success: false,
      message: "Failed to delete submission",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const getContactSubmissions = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  try {
    await dbConnect();
    const submissions = await TravelContactForm.find().sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(submissions));
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    throw new Error("Failed to fetch submissions");
  }
};