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


import nodemailer from 'nodemailer';

export async function sendOrderConfirmation(orderId: string) {
  await dbConnect();
  
  try {
    const order = await Order.findById(orderId);
    
    if (!order) {
      return { error: "Order not found" };
    }
    
    // Create transporter - FIXED: createTransport instead of createTransporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Format trips for email
    const tripsList = order.trips.map((trip:any) => 
      `- ${trip.name} (${trip.location}): ${trip.quantity} traveler(s) at ₹${trip.price} each`
    ).join('\n');

    // Email content
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: order.contactInfo.email,
      subject: `Order Confirmation - #${order._id.toString().slice(-6)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0070f3; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .footer { background: #eee; padding: 10px; text-align: center; font-size: 12px; }
            .order-details { margin: 20px 0; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Cloudship Holidays</h1>
              <h2>Order Confirmation</h2>
            </div>
            
            <div class="content">
              <p>Dear ${order.contactInfo.name},</p>
              <p>Thank you for your order! Here are your order details:</p>
              
              <div class="order-details">
                <h3>Order #${order._id.toString().slice(-6)}</h3>
                <p><strong>Order Date:</strong> ${new Date(order.bookingDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
                
                <h4>Trips:</h4>
                <ul>
                  ${order.trips.map((trip:any) => `
                    <li>
                      <strong>${trip.name}</strong> (${trip.location})<br>
                      Date: ₹{new Date(trip.selectedDate).toLocaleDateString()}<br>
                      Travelers: ${trip.quantity}<br>
                      Price: ₹${trip.price} each
                    </li>
                  `).join('')}
                </ul>
                
                <p class="total">Total Amount: ₹${order.totalAmount}</p>
              </div>
              
              <p>If you have any questions, please contact our support team.</p>
              <p>Best regards,<br>Cloudship Holidays Team</p>
            </div>
            
            <div class="footer">
              <p>© 2024 Cloudship Holidays. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Order Confirmation - #${order._id.toString().slice(-6)}
        
        Dear ${order.contactInfo.name},
        
        Thank you for your order! Here are your order details:
        
        Order #${order._id.toString().slice(-6)}
        Order Date: ${new Date(order.bookingDate).toLocaleDateString()}
        Status: ${order.status}
        Payment Status: ${order.paymentStatus}
        
        Trips:
        ${order.trips.map((trip:any) => 
          `- ${trip.name} (${trip.location})
           Date: ${new Date(trip.selectedDate).toLocaleDateString()}
           Travelers: ${trip.quantity}
           Price: ₹${trip.price} each\n`
        ).join('')}
        
        Total Amount: ₹${order.totalAmount}
        
        If you have any questions, please contact our support team.
        
        Best regards,
        Cloudship Holidays Team
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    return { 
      success: true, 
      message: "Confirmation email sent successfully",
      messageId: info.messageId
    };
    
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
      { $group: { _id: null, total: { $sum: "₹totalAmount" } } }
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


