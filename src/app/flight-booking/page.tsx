import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Plane, Calendar, User, RefreshCw, Search } from 'lucide-react';
import { getBookings } from '@/actions/flight.actions';
import { BookingStatusUpdater } from '@/app/components/BookingStatusUpdater';

interface IPassenger {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
}

interface IFlight {
  _id: string;
  flightId: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    date: string;
    time: string;
  };
  arrival: {
    airport: string;
    city: string;
    date: string;
    time: string;
  };
  passengers: IPassenger[];
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

async function refreshAction() {
  'use server';
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const result = await getBookings();
  const bookings: IFlight[] = result.success ? result.bookings : [];
  
  const searchTerm = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : '';
  const statusFilter = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : 'all';

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.departure.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.arrival.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Flight Bookings</h1>
        <form action={refreshAction}>
          <Button type="submit" variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </form>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search by flight, airline, or city..."
                className="pl-8"
                defaultValue={searchTerm}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select name="status" defaultValue={statusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Apply Filters</Button>
          </form>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bookings found matching your criteria.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flight Details</TableHead>
                    <TableHead>Passengers</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Plane className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {booking.airline} {booking.flightNumber}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.departure.airport} → {booking.arrival.airport}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(booking.departure.date)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {booking.passengers.slice(0, 2).map((passenger, index) => (
                            <div key={index} className="flex items-center gap-1 text-sm">
                              <User className="h-3 w-3" />
                              {passenger.firstName} {passenger.lastName}
                            </div>
                          ))}
                          {booking.passengers.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{booking.passengers.length - 2} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{booking.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(booking.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <BookingStatusUpdater 
                          bookingId={booking._id} 
                          currentStatus={booking.status} 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}