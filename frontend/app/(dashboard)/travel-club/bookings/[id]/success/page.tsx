import React from 'react';
import { SendWhatsAppReceiptButton } from '@/components/SendWhatsAppReceiptButton';

export default function BookingSuccessPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-lg shadow text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Booking Successful!</h1>
      <p className="text-gray-600 mb-8">
        Your booking with Mysuru Travel Club has been confirmed.
      </p>
      
      <div className="p-4 bg-gray-50 rounded-lg mb-8 text-left">
        <h2 className="font-semibold mb-2">Next Steps:</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
          <li>Save your receipt for future reference.</li>
          <li>We will contact you closer to the travel date with more details.</li>
        </ul>
      </div>

      <div className="flex justify-center">
        <SendWhatsAppReceiptButton bookingId={params.id} />
      </div>
    </div>
  );
}
