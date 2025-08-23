"use client"
import { getAllOrders } from "@/actions/order.actions";
import OrderTable from "../components/OrderTable";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default async function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  if (!session) {
    router.push("/auth/signin");
    return;
  }
  const { orders, total, error } = await getAllOrders();

  if (error) {
    return <div className="container mx-auto p-6">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">Total orders: {total}</p>
      </div>

      <OrderTable orders={orders} isAdmin={true} />
    </div>
  );
}
