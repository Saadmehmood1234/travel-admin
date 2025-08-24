'use server';
import Payment, { IPaymentLean } from '@/models/Payment';
import dbConnect from '@/lib/dbConnect';

export async function getAllPayments() {
  try {
    await dbConnect();
    
    const payments = await Payment.find({})
      .sort({ createdAt: -1 })
      .lean<IPaymentLean[]>();
    
    return {
      success: true,
      data: payments.map(payment => ({
        id: payment._id.toString(),
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        userName: payment.userName,
        userEmail: payment.userEmail,
        userPhone: payment.userPhone,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }))
    };
  } catch (error) {
    console.error('Error fetching payments:', error);
    return {
      success: false,
      error: 'Failed to fetch payments'
    };
  }
}