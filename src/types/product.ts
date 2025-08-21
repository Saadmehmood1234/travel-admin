import { Document } from "mongoose";

// Categories
export type ProductCategory = "Beach" | "Adventure" | "Luxury" | "Family-Friendly";
export type DifficultyLevel = "Easy" | "Moderate" | "Hard";

// Base product data
export interface ProductData {
  name: string;
  location: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  duration: string;
  category: ProductCategory;
  images: string[];
  featured: boolean;
  discount: number;

  // New fields
  highlights: string[];
  groupSize: string;
  difficulty: DifficultyLevel;
  availableDates: Date[];
  inclusions: string[];
  exclusions: string[];
  itinerary: string[];
  isCommunityTrip: boolean;
}

// Mongoose document type
export interface IProduct extends Document, ProductData {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Serialized product for frontend usage (strings for dates)
export interface SerializedProduct extends Omit<IProduct, "_id" | "createdAt" | "updatedAt"> {
  _id: string;
  createdAt: string;
  updatedAt: string;
}
