import mongoose from "mongoose";

interface SanitizedProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  discount: number;
  originalPrice: number;
  logoImage: string;
  category: string;
  stock: number;
  features: string[];
  images: string[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface SanitizedCartItem {
  _id: string;
  product: SanitizedProduct;
  quantity: number;
  price: number;
  subscriptionPlan?: "monthly" | "yearly";
}

export interface SanitizedCart {
  _id: string;
  customer: string;
  items: SanitizedCartItem[];
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export const sanitizeCart = (cart: any): SanitizedCart => {
  return {
    _id: cart._id.toString(),
    customer: cart.customer.toString(),
    items: cart.items.map((item: any) => ({
      _id: item._id.toString(),
      product: {
        _id: item.product._id.toString(),
        title: item.product.title,
        description: item.product.description,
        price: item.product.price,
        discount: item.product.discount,
        originalPrice: item.product.originalPrice,
        logoImage: item.product.logoImage,
        category: item.product.category,
        stock: item.product.stock,
        features: item.product.features,
        images: item.product.images,
        createdAt: item.product.createdAt?.toISOString(),
        updatedAt: item.product.updatedAt?.toISOString(),
        __v: item.product.__v
      },
      quantity: item.quantity,
      price: item.price,
      subscriptionPlan: item.subscriptionPlan
    })),
    totalPrice: cart.totalPrice,
    createdAt: cart.createdAt?.toISOString(),
    updatedAt: cart.updatedAt?.toISOString(),
    __v: cart.__v
  };
};