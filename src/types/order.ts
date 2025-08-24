import { Types } from "mongoose";

export interface IOrder {
  _id: string;
  userId: Types.ObjectId | string;
  trips: {
    product: Types.ObjectId | string;
    name: string;
    location: string;
    quantity: number;
    price: number;
    selectedDate: Date;
  }[];
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  bookingDate: Date;
  paymentMethod: "credit-card" | "upi" | "paypal" | "cash";
  paymentStatus: "unpaid" | "paid" | "refunded";
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrdersResponse {
  orders: IOrder[];
  total: number;
  error?: string;
}