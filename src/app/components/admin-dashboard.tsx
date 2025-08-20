"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MapPin, Calendar, DollarSign, ArrowLeft } from "lucide-react"
import DestinationsManager from "./destinations-manager"
import BookingsManager from "./bookings-manager"
import Link from "next/link"

interface Stats {
  totalDestinations: number
  totalBookings: number
  totalRevenue: number
  pendingBookings: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalDestinations: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const [destinationsRes, bookingsRes] = await Promise.all([
        fetch("/api/destinations"),
        fetch("/api/bookings")
      ])

      const destinations = await destinationsRes.json()
      const bookings = await bookingsRes.json()

      const totalRevenue = bookings.reduce(
        (sum: number, booking: any) => sum + (Number.parseFloat(booking.total_amount) || 0),
        0,
      )
      const pendingBookings = bookings.filter((booking: any) => booking.status === "pending").length

      setStats({
        totalDestinations: destinations.length,
        totalBookings: bookings.length,
        totalRevenue,
        pendingBookings,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 text-sm md:text-base">Manage your travel agency</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Website
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Destinations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-8 bg-gray-200 rounded animate-pulse"></div> : stats.totalDestinations}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-8 bg-gray-200 rounded animate-pulse"></div> : stats.totalBookings}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                `$${stats.totalRevenue.toLocaleString()}`
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-8 bg-gray-200 rounded animate-pulse"></div> : stats.pendingBookings}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="destinations" className="space-y-4">
        <TabsList className="w-full sm:w-auto grid grid-cols-2">
          <TabsTrigger value="destinations" className="text-sm md:text-base">
            Destinations
          </TabsTrigger>
          <TabsTrigger value="bookings" className="text-sm md:text-base">
            Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="destinations" className="mt-4">
          <DestinationsManager onUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="bookings" className="mt-4">
          <BookingsManager onUpdate={fetchStats} />
        </TabsContent>
      </Tabs>
    </div>
  )
}