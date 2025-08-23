"use client";
import { Suspense } from "react";
import AdminDashboard from "./components/admin-dashboard";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AdminPage() {
  const router = useRouter();
  const { data: session } = useSession();
  if (!session) {
    router.push("/auth/signin");
    return;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg text-gray-600">
              Loading admin dashboard...
            </div>
          </div>
        }
      >
        <AdminDashboard />
      </Suspense>
    </div>
  );
}
