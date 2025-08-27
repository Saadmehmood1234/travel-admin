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
import { Trash2, Eye, MapPin, Plane, Users, Calendar, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

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

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        <Button onClick={loadSubmissions} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Travel Consultation Requests</CardTitle>
          <CardDescription>Travel planning requests received through the contact form</CardDescription>
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
                  {submissions.map((submission) => (
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