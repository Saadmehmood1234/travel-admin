"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    highlights: [] as string[],
    groupSize: "12-15",
    difficulty: "Moderate" as "Easy" | "Moderate" | "Hard",
    availableDates: [] as string[],
    inclusions: [] as string[],
    exclusions: [] as string[],
    itinerary: [] as string[],
    isCommunityTrip: true,
  });

  const [highlightInput, setHighlightInput] = useState("");
  const [inclusionInput, setInclusionInput] = useState("");
  const [exclusionInput, setExclusionInput] = useState("");
  const [itineraryInput, setItineraryInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleArrayInput = (type: "highlights" | "inclusions" | "exclusions" | "itinerary" | "availableDates", value: string) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()]
    }));
    
    // Clear the input field
    if (type === "highlights") setHighlightInput("");
    if (type === "inclusions") setInclusionInput("");
    if (type === "exclusions") setExclusionInput("");
    if (type === "itinerary") setItineraryInput("");
    if (type === "availableDates") setDateInput("");
  };

  const removeArrayItem = (type: "highlights" | "inclusions" | "exclusions" | "itinerary" | "availableDates", index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
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
        // Convert date strings to Date objects
        availableDates: formData.availableDates.map(date => new Date(date))
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
    <div className="max-w-7xl w-full mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Travel Package</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <Label htmlFor="groupSize">Group Size</Label>
            <Input
              id="groupSize"
              name="groupSize"
              value={formData.groupSize}
              onChange={handleChange}
              placeholder="e.g., 12-15"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                difficulty: value as typeof formData.difficulty,
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="isCommunityTrip"
              checked={formData.isCommunityTrip}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                isCommunityTrip: checked,
              }))}
            />
            <Label htmlFor="isCommunityTrip">Community Trip</Label>
          </div>
        </div>

        {/* Array Input Fields */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Highlights</Label>
            <div className="flex gap-2">
              <Input
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                placeholder="Add a highlight"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayInput("highlights", highlightInput);
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={() => handleArrayInput("highlights", highlightInput)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.highlights.map((highlight, index) => (
                <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                  {highlight}
                  <button 
                    type="button" 
                    onClick={() => removeArrayItem("highlights", index)}
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Inclusions</Label>
            <div className="flex gap-2">
              <Input
                value={inclusionInput}
                onChange={(e) => setInclusionInput(e.target.value)}
                placeholder="Add an inclusion"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayInput("inclusions", inclusionInput);
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={() => handleArrayInput("inclusions", inclusionInput)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.inclusions.map((inclusion, index) => (
                <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                  {inclusion}
                  <button 
                    type="button" 
                    onClick={() => removeArrayItem("inclusions", index)}
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Exclusions</Label>
            <div className="flex gap-2">
              <Input
                value={exclusionInput}
                onChange={(e) => setExclusionInput(e.target.value)}
                placeholder="Add an exclusion"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayInput("exclusions", exclusionInput);
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={() => handleArrayInput("exclusions", exclusionInput)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.exclusions.map((exclusion, index) => (
                <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                  {exclusion}
                  <button 
                    type="button" 
                    onClick={() => removeArrayItem("exclusions", index)}
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Itinerary</Label>
            <div className="flex gap-2">
              <Input
                value={itineraryInput}
                onChange={(e) => setItineraryInput(e.target.value)}
                placeholder="Add an itinerary item"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayInput("itinerary", itineraryInput);
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={() => handleArrayInput("itinerary", itineraryInput)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.itinerary.map((item, index) => (
                <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                  {item}
                  <button 
                    type="button" 
                    onClick={() => removeArrayItem("itinerary", index)}
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Available Dates (YYYY-MM-DD format)</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                placeholder="Add an available date"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayInput("availableDates", dateInput);
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={() => handleArrayInput("availableDates", dateInput)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.availableDates.map((date, index) => (
                <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                  {new Date(date).toLocaleDateString()}
                  <button 
                    type="button" 
                    onClick={() => removeArrayItem("availableDates", index)}
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
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