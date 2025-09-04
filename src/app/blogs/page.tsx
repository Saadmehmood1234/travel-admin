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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Plus, Calendar, User, ArrowLeft, Save, X, PlusCircle, MinusCircle } from 'lucide-react';
import { IBlog, IContentBlock } from '@/models/Blog';

type ViewMode = 'list' | 'create' | 'edit';

export default function AdminBlogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingBlog, setEditingBlog] = useState<IBlog | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [contentBlocks, setContentBlocks] = useState<IContentBlock[]>([]);

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
      setContentBlocks([]);
    }
  }, [createState.success]);

  useEffect(() => {
    if (editState.success) {
      setViewMode('list');
      setEditingBlog(null);
      setContentBlocks([]);
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
        setContentBlocks(blog.content || []);
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
    setContentBlocks([]);
  };

  const addContentBlock = () => {
    setContentBlocks([...contentBlocks, { type: 'paragraph', content: '' }]);
  };

  const removeContentBlock = (index: number) => {
    const newBlocks = [...contentBlocks];
    newBlocks.splice(index, 1);
    setContentBlocks(newBlocks);
  };

  const updateContentBlock = (index: number, field: keyof IContentBlock, value: string | number) => {
    const newBlocks = [...contentBlocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    setContentBlocks(newBlocks);
  };

  const handleFormSubmit = (formData: FormData) => {
    // Add all content blocks to form data
    contentBlocks.forEach((block, index) => {
      formData.append('contentBlocks', JSON.stringify(block));
    });
    
    return viewMode === 'edit' 
      ? editAction(formData)
      : createAction(formData);
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

          <form action={handleFormSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
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
              <div className="flex justify-between items-center">
                <Label>Content Blocks</Label>
                <Button type="button" onClick={addContentBlock} variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Block
                </Button>
              </div>
              
              <div className="space-y-4">
                {contentBlocks.map((block, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-3">
                      <Label>Block {index + 1}</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeContentBlock(index)}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <Label htmlFor={`block-type-${index}`}>Type</Label>
                        <Select
                          value={block.type}
                          onValueChange={(value) => updateContentBlock(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paragraph">Paragraph</SelectItem>
                            <SelectItem value="subheading">Subheading</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="code">Code</SelectItem>
                            <SelectItem value="quote">Quote</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {block.type === 'subheading' && (
                        <div>
                          <Label htmlFor={`block-level-${index}`}>Heading Level</Label>
                          <Select
                            value={block.level?.toString() || '2'}
                            onValueChange={(value) => updateContentBlock(index, 'level', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">H1</SelectItem>
                              <SelectItem value="2">H2</SelectItem>
                              <SelectItem value="3">H3</SelectItem>
                              <SelectItem value="4">H4</SelectItem>
                              <SelectItem value="5">H5</SelectItem>
                              <SelectItem value="6">H6</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {block.type === 'code' && (
                        <div>
                          <Label htmlFor={`block-language-${index}`}>Language</Label>
                          <Input
                            id={`block-language-${index}`}
                            placeholder="e.g., javascript"
                            value={block.language || ''}
                            onChange={(e) => updateContentBlock(index, 'language', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <Label htmlFor={`block-content-${index}`}>
                        {block.type === 'image' ? 'Image URL' : 'Content'}
                      </Label>
                      <Textarea
                        id={`block-content-${index}`}
                        placeholder={
                          block.type === 'image' 
                            ? 'Enter image URL' 
                            : `Enter ${block.type} content`
                        }
                        value={block.content}
                        onChange={(e) => updateContentBlock(index, 'content', e.target.value)}
                        rows={block.type === 'paragraph' ? 4 : 2}
                      />
                    </div>
                    
                    {block.type === 'image' && (
                      <div>
                        <Label htmlFor={`block-caption-${index}`}>Caption (Optional)</Label>
                        <Input
                          id={`block-caption-${index}`}
                          placeholder="Enter image caption"
                          value={block.caption || ''}
                          onChange={(e) => updateContentBlock(index, 'caption', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {contentBlocks.length === 0 && (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <p className="text-gray-500">No content blocks added yet.</p>
                  <Button type="button" onClick={addContentBlock} variant="outline" className="mt-2">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add First Block
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Featured Image URL</Label>
              <Input
                id="image"
                name="image"
                placeholder="Enter featured image URL"
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
                disabled={isPending || contentBlocks.length === 0} 
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

  // List View (unchanged)
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