import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITestimonial extends Document {
  _id: Types.ObjectId | string; // Add this line
  name: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  image: string;
  destination: string;
  date: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}


const TestimonialSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);