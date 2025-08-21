// app/actions/orderActions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import mongoose, { Types } from "mongoose";
import Order, { IOrder } from "@/models/order.model";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
export interface OrderCreateInput {
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
  paymentMethod: "credit-card" | "upi" | "paypal" | "cash";
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
  status?: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus?: "unpaid" | "paid" | "refunded";
  bookingDate?: Date;
}

// Create a new order
export async function createOrder(formData: FormData) {
  await dbConnect()
  
  try {
    const orderData: OrderCreateInput = {
      userId: new mongoose.Types.ObjectId(formData.get("userId") as string),
      trips: JSON.parse(formData.get("trips") as string),
      totalAmount: parseFloat(formData.get("totalAmount") as string),
      paymentMethod: formData.get("paymentMethod") as "credit-card" | "upi" | "paypal" | "cash",
      contactInfo: JSON.parse(formData.get("contactInfo") as string),
      specialRequests: formData.get("specialRequests") as string || undefined,
    };

    // Validate required fields
    if (!orderData.userId || !orderData.trips || !orderData.totalAmount || 
        !orderData.paymentMethod || !orderData.contactInfo) {
      return { error: "Missing required fields" };
    }

    const order = new Order(orderData);
    await order.save();
    
    revalidatePath("/orders");
    return { success: true, orderId: order._id.toString() };
  } catch (error) {
    console.error("Create order error:", error);
    return { error: "Failed to create order" };
  }
}

export async function getOrder(orderId: string) {
  await dbConnect();
  
  try {
    const order = await Order.findById(orderId)
      .populate("userId", "name email")
      .populate("trips.product", "name images");
    
    if (!order) {
      return { error: "Order not found" };
    }
    
    return { order: JSON.parse(JSON.stringify(order)) };
  } catch (error) {
    console.error("Get order error:", error);
    return { error: "Failed to fetch order" };
  }
}

// Get orders by user ID
export async function getOrdersByUser(userId: string, page = 1, limit = 10) {
  await dbConnect();
  
  try {
    const skip = (page - 1) * limit;
    
    const orders = await Order.find({ userId })
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate("trips.product", "name images");
    
    const total = await Order.countDocuments({ userId });
    
    return { 
      orders: JSON.parse(JSON.stringify(orders)), 
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  } catch (error) {
    console.error("Get user orders error:", error);
    return { error: "Failed to fetch user orders" };
  }
}

// Get all orders (for admin)
// export async function getAllOrders(page = 1, limit = 10, status?: string) {
//   await dbConnect();
//   try {
//     const skip = (page - 1) * limit;
//     const filter = status ? { status } : {};

// const orders = await Order.find(filter)
//   .sort({ bookingDate: -1 })
//   .skip(skip)
//   .limit(limit)
//   .populate("userId", "name email")
//   .populate({
//     path: "trips",
//     populate: {
//       path: "product",
//       select: "name"
//     }
//   });

//     const total = await Order.countDocuments(filter);
    
//     return {
//       orders: JSON.parse(JSON.stringify(orders)),
//       totalPages: Math.ceil(total / limit),
//       currentPage: page
//     };
//   } catch (error) {
//     console.error("Get all orders error:", error);
//     return { error: "Failed to fetch orders" };
//   }
// }
// actions/order.actions.ts
export async function getAllOrders() {
  await dbConnect();
  try {
    const orders = await Order.find()
    
  console.log(orders)
    return { 
      orders: JSON.parse(JSON.stringify(orders)),
      total: orders.length 
    };
  } catch (error) {
    console.error("Get all orders error:", error);
    return { error: "Failed to fetch orders" };
  }
}
// Update order status
export async function updateOrderStatus(orderId: string, status: string) {
  await dbConnect();
  
  try {
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return { error: "Invalid status" };
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    
    if (!order) {
      return { error: "Order not found" };
    }
    
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true, order: JSON.parse(JSON.stringify(order)) };
  } catch (error) {
    console.error("Update order status error:", error);
    return { error: "Failed to update order status" };
  }
}

// Update payment status
export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  await dbConnect();
  
  try {
    const validStatuses = ["unpaid", "paid", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      return { error: "Invalid payment status" };
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true }
    );
    
    if (!order) {
      return { error: "Order not found" };
    }
    
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true, order: JSON.parse(JSON.stringify(order)) };
  } catch (error) {
    console.error("Update payment status error:", error);
    return { error: "Failed to update payment status" };
  }
}

// Delete order
export async function deleteOrder(orderId: string) {
  await dbConnect();
  
  try {
    const order = await Order.findByIdAndDelete(orderId);
    
    if (!order) {
      return { error: "Order not found" };
    }
    
    revalidatePath("/orders");
    return { success: true };
  } catch (error) {
    console.error("Delete order error:", error);
    return { error: "Failed to delete order" };
  }
}

// Send order confirmation email
export async function sendOrderConfirmation(orderId: string) {
  await dbConnect();
  
  try {
    const order = await Order.findById(orderId)
    console.log(order)
    
    if (!order) {
      return { error: "Order not found" };
    }
    
    // In a real application, you would integrate with an email service
    // like Resend, SendGrid, or Nodemailer here
    console.log("Sending confirmation email for order:", orderId);
    console.log("To:", order.contactInfo.email);
    console.log("Order details:", {
      orderId: order._id,
      customer: order.contactInfo.name,
      trips: order.trips,
      totalAmount: order.totalAmount
    });
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: "Confirmation email sent successfully" };
  } catch (error) {
    console.error("Send confirmation error:", error);
    return { error: "Failed to send confirmation email" };
  }
}

// Get order statistics
export async function getOrderStats() {
  await dbConnect();
  
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const completedOrders = await Order.countDocuments({ status: "completed" });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    
    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      revenue
    };
  } catch (error) {
    console.error("Get order stats error:", error);
    return { error: "Failed to fetch order statistics" };
  }
}