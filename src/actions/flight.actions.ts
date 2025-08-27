'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Flight from '@/models/Flight';
import dbConnect from '@/lib/dbConnect';

export async function createBooking(formData: FormData) {
  await dbConnect();
  
  try {
    const bookingData = {
      flightId: formData.get('flightId'),
      airline: formData.get('airline'),
      flightNumber: formData.get('flightNumber'),
      departure: {
        airport: formData.get('departureAirport'),
        city: formData.get('departureCity'),
        date: formData.get('departureDate'),
        time: formData.get('departureTime')
      },
      arrival: {
        airport: formData.get('arrivalAirport'),
        city: formData.get('arrivalCity'),
        date: formData.get('arrivalDate'),
        time: formData.get('arrivalTime')
      },
      passengers: JSON.parse(formData.get('passengers') as string),
      totalAmount: parseFloat(formData.get('totalAmount') as string),
      status: 'pending'
    };

    const booking = new Flight(bookingData);
    await booking.save();

    return { success: true, bookingId: booking._id };
  } catch (error) {
    console.error('Booking creation failed:', error);
    return { success: false, error: 'Booking creation failed' };
  }
}

export async function confirmBooking(bookingId: string, paymentId: string) {
  await dbConnect();
  
  try {
    const booking = await Flight.findByIdAndUpdate(
      bookingId,
      { status: 'confirmed', paymentId },
      { new: true }
    );

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    revalidatePath('/bookings');
    return { success: true, booking };
  } catch (error) {
    console.error('Booking confirmation failed:', error);
    return { success: false, error: 'Booking confirmation failed' };
  }
}

export async function getBookings() {
  await dbConnect();
  
  try {
    const bookings = await Flight.find().sort({ createdAt: -1 });
    return { success: true, bookings: JSON.parse(JSON.stringify(bookings)) };
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return { success: false, error: 'Failed to fetch bookings' };
  }
}

export async function updateBookingStatusAction(formData: FormData) {
  await updateBookingStatus(formData);

}

export async function updateBookingStatus(formData: FormData) {
  await dbConnect();
  
  try {
    const bookingId = formData.get('bookingId') as string;
    const status = formData.get('status') as 'confirmed' | 'pending' | 'cancelled';
    const paymentId = formData.get('paymentId') as string;
    
    const updateData: any = { status };
    if (paymentId) {
      updateData.paymentId = paymentId;
    }

    const booking = await Flight.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    );

    if (!booking) {
      throw new Error('Booking not found');
    }

    revalidatePath('/bookings');
    return { success: true, booking };
  } catch (error) {
    console.error('Booking status update failed:', error);
    return { success: false, error: 'Booking status update failed' };
  }
}