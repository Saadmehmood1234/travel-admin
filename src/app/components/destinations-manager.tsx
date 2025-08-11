"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Star } from "lucide-react"
import toast from "react-hot-toast"

interface Destination {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  location: string
  duration: string
  rating: number
  featured: boolean
}

interface DestinationsManagerProps {
  onUpdate: () => void
}

export default function DestinationsManager({ onUpdate }: DestinationsManagerProps) {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    location: "",
    duration: "",
    rating: "",
    featured: false,
  })


  useEffect(() => {
    fetchDestinations()
  }, [])

  const fetchDestinations = async () => {
    try {
      const response = await fetch("/api/destinations")
      const data = await response.json()
      setDestinations(data)
    } catch (error) {
      toast.error("Failed to fetch destinations")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingDestination ? `/api/destinations/${editingDestination.id}` : "/api/destinations"

      const method = editingDestination ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
          rating: Number.parseFloat(formData.rating),
        }),
      })

      if (response.ok) {
        toast.success(`Destination ${editingDestination ? "updated" : "created"} successfully`)
        fetchDestinations()
        onUpdate()
        resetForm()
        setIsDialogOpen(false)
      } else {
        throw new Error("Failed to save destination")
      }
    } catch (error) {
      toast.error("Failed to save destination")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this destination?")) return

    try {
      const response = await fetch(`/api/destinations/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Destination deleted successfully")
        fetchDestinations()
        onUpdate()
      } else {
        throw new Error("Failed to delete destination")
      }
    } catch (error) {
      toast.error("Failed to delete destination")
    }
  }

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination)
    setFormData({
      name: destination.name,
      description: destination.description,
      price: destination.price.toString(),
      image_url: destination.image_url,
      location: destination.location,
      duration: destination.duration,
      rating: destination.rating.toString(),
      featured: destination.featured,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      location: "",
      duration: "",
      rating: "",
      featured: false,
    })
    setEditingDestination(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Destinations Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Destination
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingDestination ? "Edit Destination" : "Add New Destination"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="/placeholder.svg?height=400&width=600"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured Destination</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingDestination ? "Update" : "Create"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {destinations.map((destination) => (
              <TableRow key={destination.id}>
                <TableCell className="font-medium">{destination.name}</TableCell>
                <TableCell>{destination.location}</TableCell>
                <TableCell>${destination.price}</TableCell>
                <TableCell>{destination.duration}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    {destination.rating}
                  </div>
                </TableCell>
                <TableCell>
                  {destination.featured ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Featured</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Regular</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(destination)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(destination.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
