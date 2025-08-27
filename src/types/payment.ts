export interface PaymentLean {
  _id: unknown;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  amount: number;
  currency: string;
  status: 'created' | 'attempted' | 'paid' | 'failed';
  userName: string;
  userEmail: string;
  userPhone: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}