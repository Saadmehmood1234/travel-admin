import { Suspense } from "react"
import AdminDashboard from "./components/admin-dashboard"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-gray-600">Loading admin dashboard...</div>
        </div>
      }>
        
        <AdminDashboard />
      </Suspense>
    </div>
  )
}