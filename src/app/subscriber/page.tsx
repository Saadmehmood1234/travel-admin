// app/subscribers/page.tsx
'use client';

import { useEffect, useState, useActionState } from 'react';
import { getSubscribers, deleteSubscriber } from '@/actions/subscribe.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addSubscriber } from '@/actions/subscribe.actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Subscriber {
  _id: string;
  email: string;
  createdAt: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
      const router = useRouter();
    const { data: session, status } = useSession();
  if (!session) {
    router.push("/auth/signin");
    return;
  }
  // Use useActionState instead of useFormState
  const [addState, addAction, isPending] = useActionState(
    addSubscriber, 
    { success: false, message: '' }
  );

  useEffect(() => {
    loadSubscribers();
  }, []);

  useEffect(() => {
    if (addState.success) {
      loadSubscribers();
    }
  }, [addState]);

  const loadSubscribers = async () => {
    setIsLoading(true);
    try {
      const data = await getSubscribers();
      setSubscribers(data);
    } catch (error) {
      console.error('Failed to load subscribers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subscriber?')) {
      const result = await deleteSubscriber(id);
      if (result.success) {
        loadSubscribers();
      } else {
        alert('Failed to delete subscriber');
      }
    }
  };

  // Function to format date safely
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? 'Invalid Date' 
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Travel Subscribers</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Subscriber</CardTitle>
            <CardDescription>Subscribe to travel updates and offers</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addAction} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  required
                  className="flex-1"
                  disabled={isPending}
                />
                <Button type="submit" disabled={isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isPending ? 'Adding...' : 'Add'}
                </Button>
              </div>
              {addState.message && (
                <p className={`text-sm ${addState.success ? 'text-green-600' : 'text-red-600'}`}>
                  {addState.message}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscribers Summary</CardTitle>
            <CardDescription>Overview of your mailing list</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{subscribers.length}</p>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {subscribers.length > 0 ? Math.ceil(subscribers.length / 50) * 50 : 0}
                </p>
                <p className="text-sm text-muted-foreground">Estimated Reach</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscriber List</CardTitle>
          <CardDescription>All subscribers to your travel newsletter</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <p>Loading subscribers...</p>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="flex justify-center p-8">
              <p>No subscribers yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscribed On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber._id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      {formatDate(subscriber.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(subscriber._id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}