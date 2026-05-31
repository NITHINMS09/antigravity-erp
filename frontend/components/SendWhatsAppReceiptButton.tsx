'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SendWhatsAppReceiptButtonProps {
  bookingId: string;
}

export function SendWhatsAppReceiptButton({ bookingId }: SendWhatsAppReceiptButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendReceipt = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:10000/api/bookings/${bookingId}/receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate receipt');
      }

      const data = await response.json();
      
      // Open WhatsApp Link
      if (data.whatsappLink) {
        window.open(data.whatsappLink, '_blank');
      }

      // Update local status
      setSuccess(true);
      
      // Attempt to mark as sent in the backend
      await fetch(`http://localhost:10000/api/bookings/${bookingId}/whatsapp-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'sent' })
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleSendReceipt} 
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white gap-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        )}
        Send Receipt to WhatsApp
      </Button>
      {success && <p className="text-sm text-green-600 text-center">Successfully opened WhatsApp!</p>}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </div>
  );
}
