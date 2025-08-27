import mongoose, { Document, Schema } from 'mongoose';

export interface IPassenger {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
}

export interface IFlight extends Document {
  flightId: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    date: Date;
    time: string;
  };
  arrival: {
    airport: string;
    city: string;
    date: Date;
    time: string;
  };
  passengers: IPassenger[];
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PassengerSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true }
});

const FlightSchema = new Schema({
  flightId: { type: String, required: true },
  airline: { type: String, required: true },
  flightNumber: { type: String, required: true },
  departure: {
    airport: { type: String, required: true },
    city: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }
  },
  arrival: {
    airport: { type: String, required: true },
    city: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }
  },
  passengers: [PassengerSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'pending', enum: ['confirmed', 'pending', 'cancelled'] },
  paymentId: { type: String }
}, {
  timestamps: true
});

export default mongoose.models.Flight || mongoose.model<IFlight>('Flight', FlightSchema);