import mongoose from "mongoose";

const ContactFormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  destination: { type: String },
  travelDate: { type: Date },
  flightRequired: { type: String, enum: ["Yes", "No"] },
  adults: { type: Number, default: 1 },
  children: { type: Number, default: 0 },
  tripPlanningStatus: { type: String },
  timeToBook: { type: String },
  additionalDetails: { type: String },
}, { timestamps: true });

const TravelContactForm = mongoose.models.TravelContactForm || mongoose.model("TravelContactForm", ContactFormSchema);

export default TravelContactForm;