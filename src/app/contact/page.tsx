// app/admin/contacts/page.tsx
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
import { Trash2, Eye } from 'lucide-react';
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
  subject?: string;
  message: string;
  travelType?: string;
  createdAt: string;
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();
  const { data: session, status } = useSession();

  if (!session) {
    router.push("/auth/signin");
    return;
  }
  useEffect(() => {
    loadSubmissions();
  }, []);

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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contact Form Submissions</h1>
        <Button onClick={loadSubmissions} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contact Submissions</CardTitle>
          <CardDescription>Messages received through the contact form</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="flex justify-center p-8">
              <p>No contact submissions yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Travel Type</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell className="font-medium">{submission.name}</TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.subject || 'No subject'}</TableCell>
                      <TableCell>{submission.travelType || 'N/A'}</TableCell>
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
                            variant="outline"
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

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Submission Details</DialogTitle>
            <DialogDescription>
              Full details of the contact form submission
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Name</h3>
                  <p>{selectedSubmission.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p>{selectedSubmission.email}</p>
                </div>
              </div>
              
              {selectedSubmission.phone && (
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p>{selectedSubmission.phone}</p>
                </div>
              )}
              
              {selectedSubmission.subject && (
                <div>
                  <h3 className="font-semibold">Subject</h3>
                  <p>{selectedSubmission.subject}</p>
                </div>
              )}
              
              {selectedSubmission.travelType && (
                <div>
                  <h3 className="font-semibold">Travel Type</h3>
                  <p>{selectedSubmission.travelType}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold">Message</h3>
                <p className="whitespace-pre-wrap">{selectedSubmission.message}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Submitted On</h3>
                <p>{formatDate(selectedSubmission.createdAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}