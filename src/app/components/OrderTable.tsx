"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Mail, Eye, Download, CreditCard, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IOrder } from "@/models/order.model";
import { updateOrderStatus, sendOrderConfirmation, updatePaymentStatus } from "@/actions/order.actions";
import { deleteOrder } from "@/actions/order.actions"; // Import the delete function

interface OrderTableProps {
  orders: IOrder[];
  isAdmin?: boolean;
}

// Define the valid badge variants based on shadcn/ui's Badge component
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export default function OrderTable({ orders, isAdmin = false }: OrderTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: string) => {
    try {
      setUpdatingPayment(orderId);
      await updatePaymentStatus(orderId, newPaymentStatus);
    } catch (error) {
      console.error("Failed to update payment status:", error);
    } finally {
      setUpdatingPayment(null);
    }
  };

  const handleSendConfirmation = async (orderId: string) => {
    try {
      await sendOrderConfirmation(orderId);
    } catch (error) {
      console.error("Failed to send confirmation:", error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      setDeletingOrder(orderId);
      const result = await deleteOrder(orderId);
      
      if (result.error) {
        console.error("Failed to delete order:", result.error);
      } else {
        setDeleteConfirmOpen(false);
        setOrderToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete order:", error);
    } finally {
      setDeletingOrder(null);
    }
  };

  const confirmDelete = (orderId: string) => {
    setOrderToDelete(orderId);
    setDeleteConfirmOpen(true);
  };

  const getStatusBadgeVariant = (status: string): BadgeVariant => {
    switch (status) {
      case "confirmed":
        return "default";
      case "completed":
        return "secondary";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPaymentStatusBadgeVariant = (status: string): BadgeVariant => {
    switch (status) {
      case "paid":
        return "default";
      case "refunded":
        return "secondary";
      case "unpaid":
        return "destructive";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getOrderId = (order: IOrder | null): string => {
    if (!order || !order._id) return "";
    return typeof order._id === "string" ? order._id : order._id.toString();
  };

  const getShortOrderId = (order: IOrder | null): string => {
    const id = getOrderId(order);
    return id ? `#${id.slice(-6)}` : "";
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Trips</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              {isAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={getOrderId(order)}>
                <TableCell className="font-medium">
                  {getShortOrderId(order)}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.contactInfo.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.contactInfo.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{formatDate(order.bookingDate)}</TableCell>
                <TableCell>
                  {order.trips.length} item{order.trips.length !== 1 ? "s" : ""}
                </TableCell>
                <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                <TableCell>
                  {isAdmin ? (
                    <Select
                      defaultValue={order.status}
                      onValueChange={(value) =>
                        handleStatusChange(getOrderId(order), value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {isAdmin ? (
                    <Select
                      defaultValue={order.paymentStatus}
                      onValueChange={(value) =>
                        handlePaymentStatusChange(getOrderId(order), value)
                      }
                      disabled={updatingPayment === getOrderId(order)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                      {order.paymentStatus}
                    </Badge>
                  )}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrder(order);
                            setDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleSendConfirmation(getOrderId(order))}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Send confirmation
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => confirmDelete(getOrderId(order))}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order {getShortOrderId(selectedOrder)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <p>{selectedOrder.contactInfo.name}</p>
                  <p className="text-muted-foreground">
                    {selectedOrder.contactInfo.email}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedOrder.contactInfo.phone}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <p>
                    Date: {formatDate(selectedOrder.bookingDate)}
                  </p>
                  <p>Status: 
                    <Badge 
                      variant={getStatusBadgeVariant(selectedOrder.status)} 
                      className="ml-2"
                    >
                      {selectedOrder.status}
                    </Badge>
                  </p>
                  <p>Payment: 
                    {isAdmin ? (
                      <Select
                        defaultValue={selectedOrder.paymentStatus}
                        onValueChange={(value) =>
                          handlePaymentStatusChange(getOrderId(selectedOrder), value)
                        }
                        disabled={updatingPayment === getOrderId(selectedOrder)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge 
                        variant={getPaymentStatusBadgeVariant(selectedOrder.paymentStatus)} 
                        className="ml-2"
                      >
                        {selectedOrder.paymentStatus}
                      </Badge>
                    )}
                  </p>
                  <p>Payment Method: {selectedOrder.paymentMethod}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Trips</h3>
                <div className="space-y-4">
                  {selectedOrder.trips.map((trip, index) => (
                    <div key={index} className="flex justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">{trip.name}</p>
                        <p className="text-muted-foreground">{trip.location}</p>
                        <p className="text-sm">
                          Date: {formatDate(trip.selectedDate)}
                        </p>
                        <p className="text-sm">Travelers: {trip.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p>{formatCurrency(trip.price)}</p>
                        <p className="text-sm">x{trip.quantity}</p>
                        <p className="font-medium">
                          {formatCurrency(trip.price * trip.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between border-t pt-4">
                <div>
                  {selectedOrder.specialRequests && (
                    <div>
                      <h3 className="font-semibold mb-2">Special Requests</h3>
                      <p className="text-muted-foreground">
                        {selectedOrder.specialRequests}
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    Total: {formatCurrency(selectedOrder.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDetailDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleSendConfirmation(getOrderId(selectedOrder))}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Confirmation
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => confirmDelete(getOrderId(selectedOrder))}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deletingOrder !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => orderToDelete && handleDeleteOrder(orderToDelete)}
              disabled={deletingOrder !== null}
            >
              {deletingOrder ? "Deleting..." : "Delete Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}