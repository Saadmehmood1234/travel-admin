// app/actions/subscriber-actions.ts
'use server';

import mongoose from 'mongoose';
import { TravelSubscriber } from '@/models/Subscriber';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/dbConnect';

export async function addSubscriber(prevState: any, formData: FormData) {
  try {
    await dbConnect();
    
    const email = formData.get('email') as string;
    
    if (!email) {
      return { 
        success: false, 
        message: 'Email is required' 
      };
    }
    const existingSubscriber = await TravelSubscriber.findOne({ email });
    
    if (existingSubscriber) {
      return { 
        success: false, 
        message: 'This email is already subscribed' 
      };
    }
    await TravelSubscriber.create({ email });
    
    revalidatePath('/subscribers');
    
    return { 
      success: true, 
      message: 'Successfully subscribed!' 
    };
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return { 
      success: false, 
      message: 'An error occurred while subscribing' 
    };
  }
}
export async function getSubscribers() {
  try {
    await dbConnect();
    
    const subscribers = await TravelSubscriber.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    return JSON.parse(JSON.stringify(subscribers));
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }
}
export async function deleteSubscriber(id: string) {
  try {
    await dbConnect();
    
    await TravelSubscriber.findByIdAndDelete(id);
    
    revalidatePath('/subscribers');
    
    return { 
      success: true, 
      message: 'Subscriber deleted successfully' 
    };
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return { 
      success: false, 
      message: 'Error deleting subscriber' 
    };
  }
}