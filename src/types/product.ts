import { Document } from "mongoose";

export type ProductCategory = "Beach" | "Adventure" | "Luxury" | "Family-Friendly";

// Base product data (for creation/input)
export interface ProductData {
  name: string;
  location: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  duration: string;
  category: ProductCategory;
  image: string;
  featured: boolean;
  discount: number;
}

// Mongoose document interface
export interface IProduct extends Document, ProductData {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Serialized product for client-side
export interface SerializedProduct extends Omit<IProduct, "_id" | "createdAt" | "updatedAt"> {
  _id: string;
  createdAt: string;
  updatedAt: string;
}