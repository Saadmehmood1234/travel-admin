import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment extends Document {
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
}

export interface IPaymentLean {
  _id: Types.ObjectId;
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

const PaymentSchema: Schema = new Schema({
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String,
    required: true,
    unique: true
  },
  razorpaySignature: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'attempted', 'paid', 'failed'],
    default: 'created'
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);