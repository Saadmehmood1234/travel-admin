'use client';

import { useEffect, useState } from 'react';
import { getContactSubmissions, deleteContactSubmission } from '@/actions/contact.actions';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Eye, MapPin, Plane, Users, Calendar, Clock, Download, Filter, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  destination?: string;
  travelDate?: string;
  flightRequired?: "Yes" | "No";
  adults?: number;
  children?: number;
  tripPlanningStatus?: string;
  timeToBook?: string;
  additionalDetails?: string;
  createdAt: string;
}

interface FilterOptions {
  destination: string;
  flightRequired: string;
  tripPlanningStatus: string;
  timeToBook: string;
  minAdults: string;
  minChildren: string;
  dateRange: {
    start: string;
    end: string;
  };
  search: string;
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    destination: 'all',
    flightRequired: 'all',
    tripPlanningStatus: 'all',
    timeToBook: 'all',
    minAdults: '',
    minChildren: '',
    dateRange: {
      start: '',
      end: ''
    },
    search: ''
  });
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    loadSubmissions();
  }, [session, status, router]);

  useEffect(() => {
    applyFilters();
  }, [submissions, filterOptions]);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await getContactSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load contact submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...submissions];
    if (filterOptions.search) {
      const searchTerm = filterOptions.search.toLowerCase();
      filtered = filtered.filter(submission => 
        submission.name.toLowerCase().includes(searchTerm) ||
        submission.email.toLowerCase().includes(searchTerm) ||
        (submission.phone && submission.phone.toLowerCase().includes(searchTerm)) ||
        (submission.destination && submission.destination.toLowerCase().includes(searchTerm)) ||
        (submission.additionalDetails && submission.additionalDetails.toLowerCase().includes(searchTerm))
      );
    }
    if (filterOptions.destination && filterOptions.destination !== 'all') {
      filtered = filtered.filter(submission => 
        submission.destination === filterOptions.destination
      );
    }
    if (filterOptions.flightRequired && filterOptions.flightRequired !== 'all') {
      filtered = filtered.filter(submission => 
        submission.flightRequired === filterOptions.flightRequired
      );
    }
    if (filterOptions.tripPlanningStatus && filterOptions.tripPlanningStatus !== 'all') {
      filtered = filtered.filter(submission => 
        submission.tripPlanningStatus === filterOptions.tripPlanningStatus
      );
    }

    if (filterOptions.timeToBook && filterOptions.timeToBook !== 'all') {
      filtered = filtered.filter(submission => 
        submission.timeToBook === filterOptions.timeToBook
      );
    }
    if (filterOptions.minAdults) {
      const minAdults = parseInt(filterOptions.minAdults);
      filtered = filtered.filter(submission => 
        (submission.adults || 0) >= minAdults
      );
    }
    if (filterOptions.minChildren) {
      const minChildren = parseInt(filterOptions.minChildren);
      filtered = filtered.filter(submission => 
        (submission.children || 0) >= minChildren
      );
    }
    if (filterOptions.dateRange.start) {
      const startDate = new Date(filterOptions.dateRange.start);
      filtered = filtered.filter(submission => {
        const submissionDate = new Date(submission.createdAt);
        return submissionDate >= startDate;
      });
    }

    if (filterOptions.dateRange.end) {
      const endDate = new Date(filterOptions.dateRange.end);
      endDate.setHours(23, 59, 59, 999); 
      filtered = filtered.filter(submission => {
        const submissionDate = new Date(submission.createdAt);
        return submissionDate <= endDate;
      });
    }

    setFilteredSubmissions(filtered);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilterOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDateRangeChange = (key: 'start' | 'end', value: string) => {
    setFilterOptions(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value
      }
    }));
  };

  const clearFilters = () => {
    setFilterOptions({
      destination: 'all',
      flightRequired: 'all',
      tripPlanningStatus: 'all',
      timeToBook: 'all',
      minAdults: '',
      minChildren: '',
      dateRange: {
        start: '',
        end: ''
      },
      search: ''
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact submission?')) {
      const result = await deleteContactSubmission(id);
      if (result.success) {
        loadSubmissions();
      } else {
        alert('Failed to delete contact submission');
      }
    }
  };

  const handleViewDetails = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? 'Invalid Date' 
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatDateForExport = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? '' 
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
    } catch (error) {
      console.error('Error formatting date for export:', error);
      return '';
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredSubmissions.length > 0 ? filteredSubmissions : submissions;
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Destination',
      'Travel Date',
      'Adults',
      'Children',
      'Flight Required',
      'Planning Status',
      'Time to Book',
      'Submitted Date'
    ];

    const csvContent = [
      headers.join(','),
      ...dataToExport.map(submission => [
        `"${submission.name.replace(/"/g, '""')}"`,
        submission.email,
        submission.phone || '',
        submission.destination || '',
        formatDateForExport(submission.travelDate || ''),
        submission.adults || '',
        submission.children || '',
        submission.flightRequired || '',
        submission.tripPlanningStatus || '',
        submission.timeToBook || '',
        formatDateForExport(submission.createdAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'travel-consultation-requests.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueDestinations = Array.from(new Set(
    submissions.map(s => s.destination).filter(Boolean)
  ));
  
  const uniquePlanningStatuses = Array.from(new Set(
    submissions.map(s => s.tripPlanningStatus).filter(Boolean)
  ));
  
  const uniqueTimeToBook = Array.from(new Set(
    submissions.map(s => s.timeToBook).filter(Boolean)
  ));

  const activeFiltersCount = Object.values(filterOptions).filter(value => {
    if (typeof value === 'object') {
      return Object.values(value).some(v => v !== '');
    }
    return value !== '' && value !== 'all';
  }).length;

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Travel Consultation Requests</h1>
        <div className="flex gap-2">
          {submissions.length > 0 && (
            <Button onClick={exportToExcel} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          )}
          <Button 
            onClick={() => setShowFilters(!showFilters)} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          <Button onClick={loadSubmissions} variant="outline">
            Refresh
          </Button>
        </div>
      </div>
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Filters</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
                <Button size="sm" onClick={applyFilters}>Apply Filters</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search across all fields..."
                value={filterOptions.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <Select
                value={filterOptions.destination}
                onValueChange={(value) => handleFilterChange('destination', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All destinations</SelectItem>
                  {uniqueDestinations.map(destination => (
                    <SelectItem key={destination} value={destination as string}>
                      {destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Flight Required</label>
              <Select
                value={filterOptions.flightRequired}
                onValueChange={(value) => handleFilterChange('flightRequired', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Flight required?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Planning Status</label>
              <Select
                value={filterOptions.tripPlanningStatus}
                onValueChange={(value) => handleFilterChange('tripPlanningStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {uniquePlanningStatuses.map(status => (
                    <SelectItem key={status} value={status as string}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time to Book</label>
              <Select
                value={filterOptions.timeToBook}
                onValueChange={(value) => handleFilterChange('timeToBook', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time frame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time frames</SelectItem>
                  {uniqueTimeToBook.map(time => (
                    <SelectItem key={time} value={time as string}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Adults</label>
              <Input
                type="number"
                min="0"
                placeholder="Min adults"
                value={filterOptions.minAdults}
                onChange={(e) => handleFilterChange('minAdults', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Children</label>
              <Input
                type="number"
                min="0"
                placeholder="Min children"
                value={filterOptions.minChildren}
                onChange={(e) => handleFilterChange('minChildren', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range (Submission Date)</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  placeholder="Start date"
                  value={filterOptions.dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                />
                <Input
                  type="date"
                  placeholder="End date"
                  value={filterOptions.dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Travel Consultation Requests</CardTitle>
          <CardDescription>
            {filteredSubmissions.length > 0 ? `Showing ${filteredSubmissions.length} of ${submissions.length} requests` : 
             submissions.length > 0 ? `${submissions.length} requests found` : 'No requests found'}
            {activeFiltersCount > 0 && ' (filtered)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="flex justify-center p-8">
              <p>No travel consultation requests yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Travel Date</TableHead>
                    <TableHead>Travelers</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredSubmissions.length > 0 ? filteredSubmissions : submissions).map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell className="font-medium">{submission.name}</TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.destination || 'Not specified'}</TableCell>
                      <TableCell>
                        {submission.travelDate 
                          ? formatDate(submission.travelDate).split(',')[0]
                          : 'Not specified'
                        }
                      </TableCell>
                      <TableCell>
                        {submission.adults || 1} adult{submission.adults !== 1 ? 's' : ''}
                        {submission.children ? `, ${submission.children} child${submission.children !== 1 ? 'ren' : ''}` : ''}
                      </TableCell>
                      <TableCell>{formatDate(submission.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(submission)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(submission._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Travel Consultation Request Details</DialogTitle>
            <DialogDescription>
              Complete details of the travel planning request
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {selectedSubmission.name}</p>
                    <p><strong>Email:</strong> {selectedSubmission.email}</p>
                    {selectedSubmission.phone && (
                      <p><strong>Phone:</strong> {selectedSubmission.phone}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Travel Details</h3>
                  <div className="space-y-2">
                    {selectedSubmission.destination && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <strong>Destination:</strong> {selectedSubmission.destination}
                      </p>
                    )}
                    {selectedSubmission.travelDate && (
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <strong>Travel Date:</strong> {formatDate(selectedSubmission.travelDate)}
                      </p>
                    )}
                    {selectedSubmission.flightRequired && (
                      <p className="flex items-center gap-2">
                        <Plane className="h-4 w-4" />
                        <strong>Flight Required:</strong> {selectedSubmission.flightRequired}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Group Information</h3>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <strong>Adults:</strong> {selectedSubmission.adults || 1}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <strong>Children:</strong> {selectedSubmission.children || 0}
                    </p>
                    <p><strong>Total Travelers:</strong> {(selectedSubmission.adults || 1) + (selectedSubmission.children || 0)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Planning Status</h3>
                  <div className="space-y-2">
                    {selectedSubmission.tripPlanningStatus && (
                      <p><strong>Trip Planning Status:</strong> {selectedSubmission.tripPlanningStatus}</p>
                    )}
                    {selectedSubmission.timeToBook && (
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <strong>Time to Book:</strong> {selectedSubmission.timeToBook}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {selectedSubmission.additionalDetails && (
                <div>
                  <h3 className="font-semibold mb-2">Additional Details</h3>
                  <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                    {selectedSubmission.additionalDetails}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Submission Information</h3>
                <p><strong>Submitted On:</strong> {formatDate(selectedSubmission.createdAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}