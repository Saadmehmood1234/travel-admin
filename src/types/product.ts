import { Document } from "mongoose";

export type ProductCategory = "Beach" | "Adventure" | "Luxury" | "Family-Friendly";
export type DifficultyLevel = "Easy" | "Moderate" | "Hard";
export type TripType = "International" | "Domestic"; // Add TripType

export interface ProductData {
  name: string;
  location: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  duration: string;
  category: ProductCategory;
  tripType: TripType; // Add tripType field
  image: string;
  featured: boolean;
  discount: number;
  highlights: string[];
  groupSize: string;
  difficulty: DifficultyLevel;
  availableDates: Date[];
  inclusions: string[];
  exclusions: string[];
  itinerary: string[];
  isCommunityTrip: boolean;
}

export interface IProduct extends Document, ProductData {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedProduct extends Omit<IProduct, "_id" | "createdAt" | "updatedAt"> {
  _id: string;
  createdAt: string;
  updatedAt: string;
}