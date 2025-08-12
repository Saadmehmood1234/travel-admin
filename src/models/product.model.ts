import dynamicModelGenerator from "@/lib/dynamic-model-generator";
import { ProductType } from "@/types";
import { Schema } from "mongoose"
// const ProductFields = {
//     title: string,
//     location: string,
//     price: number,
//     originalPrice: number,
//     rating?: number,
//     category: string,
//     imgUrl: string,
//     description: string,
//     reviews: number,
//     discount?: {
//         token: string,
//         amount: number,
//     }
// }
const ProductSchema: ProductType = new Schema(dynamicModelGenerator(ProductType))