// import dynamicModelGenerator from "@/lib/dynamic-model-generator";
// import { ProductType } from "@/types";
// import { Schema } from "mongoose"
// // const ProductFields = {
// //     title: string,
// //     location: string,
// //     price: number,
// //     originalPrice: number,
// //     rating?: number,
// //     category: string,
// //     imgUrl: string,
// //     description: string,
// //     reviews: number,
// //     discount?: {
// //         token: string,
// //         amount: number,
// //     }
// // }
// const ProductSchema: ProductType = new Schema(dynamicModelGenerator(ProductType))


import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
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
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
