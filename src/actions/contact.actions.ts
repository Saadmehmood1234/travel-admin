'use server';

import mongoose from 'mongoose';
import TravelContactForm from '@/models/Contact';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/dbConnect';

export async function submitContactForm(prevState: any, formData: FormData) {
  try {
    await dbConnect();
    
    const formDataObject = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      travelType: formData.get('travelType') as string,
    };
    

    if (!formDataObject.name || !formDataObject.email || !formDataObject.message) {
      return { 
        success: false, 
        message: 'Name, email, and message are required' 
      };
    }

    await TravelContactForm.create(formDataObject);
    
    return { 
      success: true, 
      message: 'Thank you for your message! We will get back to you soon.' 
    };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { 
      success: false, 
      message: 'An error occurred while submitting your message' 
    };
  }
}

export async function getContactSubmissions() {
  try {
    await dbConnect();
    
    const submissions = await TravelContactForm.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    return JSON.parse(JSON.stringify(submissions));
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return [];
  }
}


export async function deleteContactSubmission(id: string) {
  try {
    await dbConnect();
    
    await TravelContactForm.findByIdAndDelete(id);
    
    revalidatePath('/admin/contacts');
    
    return { 
      success: true, 
      message: 'Contact submission deleted successfully' 
    };
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    return { 
      success: false, 
      message: 'Error deleting contact submission' 
    };
  }
}

export async function getContactSubmissionById(id: string) {
  try {
    await dbConnect();
    
    const submission = await TravelContactForm.findById(id).lean();
    
    return JSON.parse(JSON.stringify(submission));
  } catch (error) {
    console.error('Error fetching contact submission:', error);
    return null;
  }
}