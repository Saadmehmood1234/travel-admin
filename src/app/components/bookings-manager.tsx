"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import toast from "react-hot-toast"

interface Booking {
  id: number
  destination_name: string
  location: string
  customer_name: string
  customer_email: string
  customer_phone: string
  travel_date: string
  guests: number
  total_amount: number
  status: string
  created_at: string
}

interface BookingsManagerProps {
  onUpdate: () => void
}

export default function BookingsManager({ onUpdate }: BookingsManagerProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
 

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings")
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      toast.error( "Failed to fetch bookings")
    }
  }

  const updateBookingStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast.success("Booking status updated successfully")
        fetchBookings()
        onUpdate()
      } else {
        throw new Error("Failed to update booking status")
      }
    } catch (error) {
      toast.error("Failed to update booking status")
    }
  }

  const deleteBooking = async (id: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Booking deleted successfully")
        fetchBookings()
        onUpdate()
      } else {
        throw new Error("Failed to delete booking")
      }
    } catch (error) {
      toast.error( "Failed to delete booking")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      confirmed: { variant: "default" as const, label: "Confirmed" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
      completed: { variant: "outline" as const, label: "Completed" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Travel Date</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.customer_name}</div>
                    <div className="text-sm text-gray-500">{booking.customer_email}</div>
                    <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.destination_name}</div>
                    <div className="text-sm text-gray-500">{booking.location}</div>
                  </div>
                </TableCell>
                <TableCell>{new Date(booking.travel_date).toLocaleDateString()}</TableCell>
                <TableCell>{booking.guests}</TableCell>
                <TableCell>${booking.total_amount?.toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Select value={booking.status} onValueChange={(value) => updateBookingStatus(booking.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="destructive" onClick={() => deleteBooking(booking.id)}>
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
