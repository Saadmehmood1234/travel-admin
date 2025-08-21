import mongoose, { Schema, Document } from "mongoose";

export interface ProductInput extends Document {
  name: string;
  location: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  duration: string;
  category: "Beach" | "Adventure" | "Luxury" | "Family-Friendly";
  image: string;
  featured: boolean;
  discount: number;
  highlights: string[];          
  groupSize: string;          
  difficulty: "Easy" | "Moderate" | "Hard"; 
  availableDates: Date[];      
  inclusions: string[];           
  exclusions: string[];           
  itinerary: string[];           
  isCommunityTrip: boolean;      
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    reviews: { type: Number, required: true, default: 0 },
    duration: { type: String, required: true },
    category: {
      type: String,
      enum: ["Beach", "Adventure", "Luxury", "Family-Friendly"],
      required: true,
    },
    image: { type: String, required: true },
    featured: { type: Boolean, default: false },
    discount: { type: Number, min: 0, max: 100, default: 0 },

    highlights: { type: [String], default: [] },
    groupSize: { type: String, default: "12-15" },
    difficulty: { type: String, enum: ["Easy", "Moderate", "Hard"], default: "Moderate" },
    availableDates: { type: [Date], default: [] },
    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },
    itinerary: { type: [String], default: [] },
    isCommunityTrip: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model<ProductInput>("Product", ProductSchema);
