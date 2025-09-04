'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Blog, { IBlog, IContentBlock } from '@/models/Blog';
import dbConnect from '@/lib/dbConnect';
import slugify from 'slugify';

// Get all blogs
export async function getBlogs(): Promise<IBlog[]> {
  try {
    await dbConnect();
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(blogs));
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

// Get single blog by slug
export async function getBlogBySlug(slug: string) {
  try {
    await dbConnect();
    const blog = await Blog.findOne({ slug });
    if (!blog) return null;
    return JSON.parse(JSON.stringify(blog));
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

// Get single blog by ID
export async function getBlogById(id: string): Promise<IBlog | null> {
  try {
    await dbConnect();
    const blog = await Blog.findById(id);
    if (!blog) return null;
    return JSON.parse(JSON.stringify(blog));
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

// Helper function to parse content blocks from form data
function parseContentBlocks(formData: FormData): IContentBlock[] {
  const contentBlocks: IContentBlock[] = [];
  const contentEntries = formData.getAll('contentBlocks');
  
  contentEntries.forEach((entry) => {
    if (typeof entry === 'string') {
      try {
        const block = JSON.parse(entry);
        if (block.type && block.content) {
          contentBlocks.push(block);
        }
      } catch (error) {
        console.error('Error parsing content block:', error);
      }
    }
  });
  
  return contentBlocks;
}

// Create blog
export async function createBlog(prevState: any, formData: FormData) {
  await dbConnect();
  
  const contentBlocks = parseContentBlocks(formData);
  
  const rawFormData = {
    title: formData.get('title') as string,
    excerpt: formData.get('excerpt') as string,
    content: contentBlocks,
    image: formData.get('image') as string,
    author: formData.get('author') as string,
    readTime: formData.get('readTime') as string,
    category: formData.get('category') as string,
    featured: formData.get('featured') === 'on',
  };

  try {
    const slug = slugify(rawFormData.title, { lower: true, strict: true });
    
    const blog = new Blog({
      ...rawFormData,
      slug,
      date: new Date(),
    });

    await blog.save();
    revalidatePath('/blog');
    revalidatePath('/admin/blogs');
    return { success: true, message: 'Blog created successfully!' };
  } catch (error: any) {
    console.error('Error creating blog:', error);
    return { success: false, message: error.message || 'Failed to create blog' };
  }
}

// Update blog
export async function updateBlog(id: string, prevState: any, formData: FormData) {
  await dbConnect();
  
  const contentBlocks = parseContentBlocks(formData);
  
  const rawFormData = {
    title: formData.get('title') as string,
    excerpt: formData.get('excerpt') as string,
    content: contentBlocks,
    image: formData.get('image') as string,
    author: formData.get('author') as string,
    readTime: formData.get('readTime') as string,
    category: formData.get('category') as string,
    featured: formData.get('featured') === 'on',
  };

  try {
    const slug = slugify(rawFormData.title, { lower: true, strict: true });
    
    await Blog.findByIdAndUpdate(id, {
      ...rawFormData,
      slug,
    });

    revalidatePath('/blog');
    revalidatePath('/admin/blogs');
    revalidatePath(`/blog/${slug}`);
    return { success: true, message: 'Blog updated successfully!' };
  } catch (error: any) {
    console.error('Error updating blog:', error);
    return { success: false, message: error.message || 'Failed to update blog' };
  }
}

// Delete blog
export async function deleteBlog(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect();
    await Blog.findByIdAndDelete(id);
    revalidatePath('/blog');
    revalidatePath('/admin/blogs');
    return { success: true, message: 'Blog deleted successfully!' };
  } catch (error: any) {
    console.error('Error deleting blog:', error);
    return { success: false, message: error.message || 'Failed to delete blog' };
  }
}