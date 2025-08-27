"use client";

import { useEffect, useState } from "react";
import { getAllOrders } from "@/actions/order.actions";
import OrderTable from "../components/OrderTable";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { IOrder } from "@/models/order.model"; 

interface OrdersResponse {
  orders: IOrder[];
  total: number;
  error?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [ordersData, setOrdersData] = useState<OrdersResponse>({
    orders: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return; 

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getAllOrders();

        if (data && typeof data === 'object') {
          setOrdersData({
            orders: data.orders || [],
            total: data.total || 0,
            error: data.error
          });
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (error) {
        setOrdersData(prev => ({
          orders: prev.orders,
          total: prev.total,
          error: error instanceof Error ? error.message : "Failed to fetch orders"
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null
  }

  if (ordersData.error) {
    return <div className="container mx-auto p-6">{ordersData.error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">Total orders: {ordersData.total}</p>
      </div>

      <OrderTable orders={ordersData.orders} isAdmin={true} />
    </div>
  );
}