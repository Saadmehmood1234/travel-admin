import { getAllPayments } from '@/actions/payment.actions';
import PaymentsTable from '../components/PaymentsTable';

export default async function PaymentsPage() {
  const result = await getAllPayments();

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    );
  }

  const paymentsData = result.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Records</h1>
            <p className="text-gray-600">
              View all payment transactions processed through the system
            </p>
          </div>

          <PaymentsTable payments={paymentsData} />
        </div>
      </div>
    </div>
  );
}