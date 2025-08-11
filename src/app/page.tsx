import { Suspense } from "react"
import AdminDashboard from "./components/admin-dashboard"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense fallback={<div>Loading admin dashboard...</div>}>
        <AdminDashboard />
      </Suspense>
    </div>
  )
}
