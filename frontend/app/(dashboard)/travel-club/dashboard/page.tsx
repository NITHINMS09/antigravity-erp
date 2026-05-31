'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SendWhatsAppReceiptButton } from '@/components/SendWhatsAppReceiptButton';

export default function UserDashboardPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:10000/api/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.bookings) {
          // In a real app, filter by userId
          setBookings(data.bookings);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <div className="p-8">Loading your bookings...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 mt-6">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <p className="text-gray-500">You have no bookings yet.</p>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
              <div>
                <Link href={`/travel-club/bookings/${booking.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
                  {booking.tourName}
                </Link>
                <p className="text-gray-600">Travel Date: {new Date(booking.travelDate).toLocaleDateString()}</p>
                <p className="text-gray-600">Booking ID: {booking.bookingId}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className="font-bold text-lg">₹{booking.amountPaid}</span>
                <SendWhatsAppReceiptButton bookingId={booking.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
