'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';

interface SendWhatsAppInvoiceButtonProps {
  invoiceId: string;
  customerPhone?: string | null;
  customerName?: string | null;
  variant?: 'button' | 'icon';
  onStatusChange?: () => void;
}

export function SendWhatsAppInvoiceButton({
  invoiceId,
  customerPhone,
  customerName,
  variant = 'button',
  onStatusChange,
}: SendWhatsAppInvoiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!customerPhone) {
      showToast('Cannot send: Customer has no phone number recorded.', 'error');
      return;
    }

    // Basic phone validation
    const digitsOnly = customerPhone.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 10) {
      showToast('Cannot send: Customer has an invalid phone number.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const data = await api.post<{ whatsappLink?: string }>(`/billing/${invoiceId}/receipt`);
      
      if (data.whatsappLink) {
        window.open(data.whatsappLink, '_blank');
        showToast('Opening WhatsApp...');
        
        // Update WhatsApp status to 'sent'
        await api.post(`/billing/${invoiceId}/whatsapp-status`, { status: 'sent' });
        if (onStatusChange) {
          onStatusChange();
        }
      } else {
        showToast('Failed to generate WhatsApp link.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to send WhatsApp invoice.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const whatsappIcon = (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <button
        onClick={handleSend}
        disabled={isLoading}
        title={customerPhone ? `Send to ${customerPhone}` : 'No phone number'}
        className={`h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-xl transition-all border border-transparent shadow-xl ${
          customerPhone 
            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:border-emerald-500/30' 
            : 'bg-white/5 text-zinc-600 cursor-not-allowed opacity-50'
        }`}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : whatsappIcon}
      </button>
    );
  }

  return (
    <button
      onClick={handleSend}
      disabled={isLoading || !customerPhone}
      className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all shadow-lg ${
        isLoading || !customerPhone
          ? 'bg-zinc-700/50 text-zinc-500 cursor-not-allowed'
          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
      }`}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : whatsappIcon}
      Send Invoice via WhatsApp
    </button>
  );
}
