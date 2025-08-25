import mongoose, { Document, Schema } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  subtitle: string;
  discount: number;
  description: string;
  image: string;
  validUntil: Date;
  code: string;
  type: 'percentage' | 'fixed';
  icon: string; // Store icon name as string
  color: string; // Gradient color classes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    icon: {
      type: String,
      required: true,
      enum: ['Clock', 'Percent', 'Gift', 'Zap', 'Star', 'Heart', 'Tag'],
    },
    color: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for active offers and validity
OfferSchema.index({ isActive: 1, validUntil: 1 });

export default mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);