// app/admin/blogs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { getBlogs, deleteBlog, createBlog, updateBlog, getBlogById } from '@/actions/blog.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, Plus, Calendar, User, ArrowLeft, Save, X } from 'lucide-react';
import { IBlog } from '@/models/Blog';

type ViewMode = 'list' | 'create' | 'edit';

export default function AdminBlogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingBlog, setEditingBlog] = useState<IBlog | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);

  // For create form
  const [createState, createAction, isCreatePending] = useActionState(createBlog, {
    success: false,
    message: '',
  });

  // For edit form
  const [editState, editAction, isEditPending] = useActionState(
    (prevState: any, formData: FormData) => {
      if (!editingBlog) return { success: false, message: 'No blog selected for editing' };
      return updateBlog(editingBlog._id.toString(), prevState, formData);
    },
    {
      success: false,
      message: '',
    }
  );

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const blogData = await getBlogs();
        setBlogs(blogData);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (status === 'authenticated' && viewMode === 'list') {
      fetchBlogs();
    }
  }, [status, viewMode]);

  useEffect(() => {
    if (createState.success) {
      setViewMode('list');
    }
  }, [createState.success]);

  useEffect(() => {
    if (editState.success) {
      setViewMode('list');
      setEditingBlog(null);
    }
  }, [editState.success]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      const result = await deleteBlog(id);
      if (result.success) {
        setBlogs(blogs.filter(blog => blog._id.toString() !== id));
      } else {
        alert('Failed to delete blog: ' + result.message);
      }
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const blog = await getBlogById(id);
      if (blog) {
        setEditingBlog(blog);
        setIsFeatured(blog.featured || false);
        setViewMode('edit');
      }
    } catch (error) {
      console.error('Error fetching blog for editing:', error);
      alert('Failed to load blog for editing');
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingBlog(null);
    setIsFeatured(false);
  };

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  // Create/Edit Form View
  if (viewMode === 'create' || viewMode === 'edit') {
    const isEditing = viewMode === 'edit';
    const formAction = isEditing ? editAction : createAction;
    const isPending = isEditing ? isEditPending : isCreatePending;
    const formState = isEditing ? editState : createState;
    
    return (
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            onClick={handleCancel}
            variant="ghost" 
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blogs
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {isEditing ? 'Edit Blog' : 'Create New Blog'}
          </h1>

          <form action={formAction} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter blog title"
                required
                defaultValue={isEditing ? editingBlog?.title : ''}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                placeholder="Enter brief excerpt"
                required
                rows={3}
                defaultValue={isEditing ? editingBlog?.excerpt : ''}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Enter blog content"
                required
                rows={10}
                defaultValue={isEditing ? editingBlog?.content : ''}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                placeholder="Enter image URL"
                required
                defaultValue={isEditing ? editingBlog?.image : ''}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                name="author"
                placeholder="Enter author name"
                required
                defaultValue={isEditing ? editingBlog?.author : ''}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="readTime">Read Time</Label>
              <Input
                id="readTime"
                name="readTime"
                placeholder="e.g., 5 min read"
                required
                defaultValue={isEditing ? editingBlog?.readTime : ''}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                placeholder="Enter category"
                required
                defaultValue={isEditing ? editingBlog?.category : ''}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                name="featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
              <Label htmlFor="featured">Featured Blog</Label>
            </div>

            {formState.message && (
              <p className={`text-sm ${formState.success ? 'text-green-600' : 'text-red-600'}`}>
                {formState.message}
              </p>
            )}

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={isPending} 
                className="flex-1"
              >
                {isPending ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Blog' : 'Create Blog'}
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <Button onClick={() => setViewMode('create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Blog
          </Button>
        </div>

        <div className="grid gap-6">
          {blogs.map((blog) => (
            <Card key={blog._id.toString()} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={blog.featured ? 'default' : 'secondary'}>
                        {blog.featured ? 'Featured' : blog.category}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{blog.author}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(blog.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(blog._id.toString())}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(blog._id.toString())}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {blogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blogs found.</p>
            <Button onClick={() => setViewMode('create')} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Blog
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}