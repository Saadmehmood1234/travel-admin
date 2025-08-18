import { ObjectId } from "mongodb";

export interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  phone: string;
  image?: string;
  emailVerified: boolean;
  role: "user" | "admin";
  provider: string;
  hasClaimedCanva: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  verificationTokenExpires?: Date;
}

export interface SerializedUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  image?: string;
  emailVerified: boolean;
  role: "user" | "admin";
  provider: string;
  hasClaimedCanva: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  verificationTokenExpires?: string;
}