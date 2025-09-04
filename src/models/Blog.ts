import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IContentBlock {
  type: 'paragraph' | 'subheading' | 'image' | 'code' | 'quote';
  content: string;
  level?: number;
  language?: string;
  caption?: string;
}

export interface IBlog extends Document {
  _id: Types.ObjectId;
  title: string;
  excerpt: string;
  content: IContentBlock[];
  image: string;
  author: string;
  date: Date;
  readTime: string;
  category: string;
  featured: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContentBlockSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['paragraph', 'subheading', 'image', 'code', 'quote'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    min: 1,
    max: 6,
    default: 2
  },
  language: {
    type: String,
    default: 'javascript'
  },
  caption: {
    type: String
  }
});

const BlogSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    content: [ContentBlockSchema],
    image: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    readTime: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);