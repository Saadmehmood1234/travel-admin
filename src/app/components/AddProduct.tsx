"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import { createProduct } from "@/actions/product.actions";

export default function AddProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    price: 0,
    originalPrice: 0,
    rating: 0,
    reviews: 0,
    duration: "",
    category: "Beach" as "Beach" | "Adventure" | "Luxury" | "Family-Friendly",
    image: "",
    featured: false,
    discount: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate discount percentage if original price is provided
      const finalData = {
        ...formData,
        discount: formData.originalPrice > 0
          ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
          : 0,
      };

      const result = await createProduct(finalData);
      
      if (result.success) {
        toast.success("Product added successfully")
        if (onSuccess) onSuccess();
      } else {
        toast.error( result.error || "Failed to add product")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Travel Package</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Package Name*</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location*</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="originalPrice">Original Price ($)*</Label>
            <Input
              id="originalPrice"
              name="originalPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.originalPrice}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Discounted Price ($)*</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category*</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                category: value as typeof formData.category,
              }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beach">Beach</SelectItem>
                <SelectItem value="Adventure">Adventure</SelectItem>
                <SelectItem value="Luxury">Luxury</SelectItem>
                <SelectItem value="Family-Friendly">Family-Friendly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration*</Label>
            <Input
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 7 days"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Rating (0-5)*</Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviews">Number of Reviews</Label>
            <Input
              id="reviews"
              name="reviews"
              type="number"
              min="0"
              value={formData.reviews}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL*</Label>
            <Input
              id="image"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                featured: checked,
              }))}
            />
            <Label htmlFor="featured">Featured Package</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Package"}
          </Button>
        </div>
      </form>
    </div>
  );
}