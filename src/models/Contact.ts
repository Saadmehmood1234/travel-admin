
import mongoose from "mongoose";

const ContactFormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String },
  message: { type: String, required: true },
  travelType: { type: String },
}, { timestamps: true });

const TravelContactForm = mongoose.models.TravelContactForm || mongoose.model("TravelContactForm", ContactFormSchema);

export default TravelContactForm;
