
import mongoose, { model, models, Schema } from "mongoose";

export const subscriberSchema = new Schema({
  email: {
    type: String,
    required: true, 
    unique: true,   
    trim: true,    
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
}, {
  timestamps: true 
});

export const TravelSubscriber =
  models?.TravelSubscriber || model("TravelSubscriber", subscriberSchema);