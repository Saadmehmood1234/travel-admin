'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { updateBookingStatus } from '@/actions/flight.actions';
import { useRouter } from 'next/navigation';

interface BookingStatusUpdaterProps {
  bookingId: string;
  currentStatus: string;
}

export function BookingStatusUpdater({ bookingId, currentStatus }: BookingStatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'confirmed') {
      setIsDialogOpen(true);
    } else {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('status', newStatus);
      
      await updateBookingStatus(formData);
      setIsUpdating(false);
      router.refresh();
    }
  };

  const handleConfirm = async () => {
    setIsUpdating(true);
    const formData = new FormData();
    formData.append('bookingId', bookingId);
    formData.append('status', 'confirmed');
    formData.append('paymentId', paymentId);
    
    await updateBookingStatus(formData);
    setIsUpdating(false);
    setIsDialogOpen(false);
    setPaymentId('');
    router.refresh();
  };

  return (
    <>
      <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="confirmed">Confirm</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="cancelled">Cancel</SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Please enter the payment ID to confirm this booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentId">Payment ID</Label>
              <Input
                id="paymentId"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                placeholder="Enter payment ID"
              />
            </div>
            <Button onClick={handleConfirm} disabled={!paymentId || isUpdating}>
              {isUpdating ? 'Updating...' : 'Confirm Booking'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}