'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SendWhatsAppReceiptButton } from '@/components/SendWhatsAppReceiptButton';
import api from '@/lib/api';

interface TravelBooking {
  id: string;
  bookingId: string;
  customerName: string;
  tourName: string;
  travelDate: string;
  seats: number;
  amountPaid: number;
}

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const bookingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [booking, setBooking] = useState<TravelBooking | null>(null);
  const [loading, setLoading] = useState(!!bookingId);

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        const data = await api.get<{ booking?: TravelBooking }>(`/bookings/${bookingId}`);
        if (data.booking) setBooking(data.booking);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) return <div className="p-8">Loading booking details...</div>;
  if (!booking) return <div className="p-8 text-red-500">Booking not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow mt-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Details</h1>
        <SendWhatsAppReceiptButton bookingId={booking.id} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Booking ID</p>
          <p className="font-semibold">{booking.bookingId}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Customer Name</p>
          <p className="font-semibold">{booking.customerName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Tour Name</p>
          <p className="font-semibold">{booking.tourName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Travel Date</p>
          <p className="font-semibold">{new Date(booking.travelDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Seats</p>
          <p className="font-semibold">{booking.seats}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Amount Paid</p>
          <p className="font-semibold">₹{booking.amountPaid}</p>
        </div>
      </div>
    </div>
  );
}
