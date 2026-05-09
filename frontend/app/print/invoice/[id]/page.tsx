'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/constants';

export default function PrintInvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, confRes] = await Promise.all([
          api.get(`/billing/${id}`),
          api.get('/config')
        ]);
        setInvoice(invRes.invoice);
        const bizConfig = confRes.configs.find((c: any) => c.businessCode === invRes.invoice.business);
        setConfig(bizConfig || { businessName: 'POWER BRICK' });
        
        // Auto print after a short delay to ensure rendering
        setTimeout(() => {
          window.print();
        }, 500);
      } catch (err: any) {
        setError('Failed to load invoice details.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading invoice...</div>;
  if (error || !invoice) return <div className="p-10 text-center text-red-500">{error || 'Invoice not found'}</div>;

  return (
    <div className="bg-white text-black min-h-screen p-8 print:p-0 font-sans max-w-4xl mx-auto">
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4 portrait; margin: 15mm; }
          .no-print { display: none !important; }
        }
      `}} />

      {/* Action buttons (hidden in print) */}
      <div className="mb-6 flex justify-end gap-3 no-print">
        <button onClick={() => window.close()} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium">Close</button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-medium">Print / Save PDF</button>
      </div>

      {/* Invoice Document */}
      <div className="border border-gray-300 p-8 rounded-sm">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-300 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-black text-orange-600 uppercase tracking-wider">{config.businessName}</h1>
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{config.address}</p>
            {config.phone && <p className="text-sm text-gray-600">Phone: {config.phone}</p>}
            {config.email && <p className="text-sm text-gray-600">Email: {config.email}</p>}
            {config.gstNumber && <p className="text-sm font-semibold text-gray-800 mt-1">GSTIN: {config.gstNumber}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-light text-gray-400 uppercase tracking-widest mb-2">Invoice</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700 text-left">
              <span className="font-semibold text-right">Invoice #:</span> <span>{invoice.invoiceNumber}</span>
              <span className="font-semibold text-right">Date:</span> <span>{formatDate(invoice.invoiceDate)}</span>
              {invoice.isGst && <><span className="font-semibold text-right">Type:</span> <span>Tax Invoice</span></>}
            </div>
          </div>
        </div>

        {/* Customer & Delivery */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Billed To</h3>
            <p className="font-bold text-gray-800 text-lg">{invoice.customer.name}</p>
            {invoice.customer.phone && <p className="text-sm text-gray-600">{invoice.customer.phone}</p>}
            {invoice.customer.address && <p className="text-sm text-gray-600 mt-1">{invoice.customer.address}</p>}
            {invoice.customer.gstNumber && <p className="text-sm font-semibold text-gray-800 mt-1">GSTIN: {invoice.customer.gstNumber}</p>}
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Delivery Details</h3>
            {invoice.vehicleNumber && <p className="text-sm text-gray-700"><span className="font-semibold">Vehicle No:</span> {invoice.vehicleNumber}</p>}
            {invoice.driverName && <p className="text-sm text-gray-700"><span className="font-semibold">Driver:</span> {invoice.driverName}</p>}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-800 border-y border-gray-300">
              <th className="py-2 px-3 text-left font-semibold text-sm w-12">#</th>
              <th className="py-2 px-3 text-left font-semibold text-sm">Description</th>
              <th className="py-2 px-3 text-right font-semibold text-sm w-24">Qty</th>
              <th className="py-2 px-3 text-right font-semibold text-sm w-32">Rate</th>
              {invoice.isGst && <th className="py-2 px-3 text-right font-semibold text-sm w-24">GST%</th>}
              <th className="py-2 px-3 text-right font-semibold text-sm w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: any, i: number) => (
              <tr key={item.id} className="border-b border-gray-200 text-gray-700 text-sm">
                <td className="py-3 px-3">{i + 1}</td>
                <td className="py-3 px-3">
                  <span className="font-medium">{item.material?.name || 'Material'}</span>
                  {item.description && <span className="block text-xs text-gray-500 mt-0.5">{item.description}</span>}
                </td>
                <td className="py-3 px-3 text-right">{item.quantity}</td>
                <td className="py-3 px-3 text-right">₹{item.rate.toFixed(2)}</td>
                {invoice.isGst && <td className="py-3 px-3 text-right">{item.gstRate}%</td>}
                <td className="py-3 px-3 text-right font-medium">₹{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-between items-start mb-12">
          <div className="w-1/2 pr-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Payment Status</h3>
            <div className="inline-block px-3 py-1 rounded text-sm font-bold uppercase tracking-wider border border-gray-300">
              {invoice.paymentStatus === 'paid' ? <span className="text-green-600">Paid in Full</span> :
               invoice.paymentStatus === 'partial' ? <span className="text-blue-600">Partially Paid</span> :
               <span className="text-red-600">Payment Pending</span>}
            </div>
            
            {invoice.notes && (
              <div className="mt-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Remarks / Notes</h3>
                <p className="text-sm text-gray-700 italic">{invoice.notes}</p>
              </div>
            )}
          </div>

          <div className="w-1/2">
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{invoice.subtotal.toFixed(2)}</span></div>
              {invoice.isGst && <div className="flex justify-between"><span className="text-gray-500">GST Total</span><span>₹{invoice.gstAmount.toFixed(2)}</span></div>}
              {invoice.discountAmount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-red-600">-₹{invoice.discountAmount.toFixed(2)}</span></div>}
              
              {(invoice.loadingCharge > 0 || invoice.transportCharge > 0 || invoice.tractorCharge > 0 || invoice.labourCharge > 0) && (
                <div className="border-t border-gray-200 pt-2 pb-1 space-y-1">
                  {invoice.loadingCharge > 0 && <div className="flex justify-between text-xs"><span className="text-gray-500">Loading Charge</span><span>₹{invoice.loadingCharge.toFixed(2)}</span></div>}
                  {invoice.transportCharge > 0 && <div className="flex justify-between text-xs"><span className="text-gray-500">Transport Charge</span><span>₹{invoice.transportCharge.toFixed(2)}</span></div>}
                  {invoice.tractorCharge > 0 && <div className="flex justify-between text-xs"><span className="text-gray-500">Tractor Charge</span><span>₹{invoice.tractorCharge.toFixed(2)}</span></div>}
                  {invoice.labourCharge > 0 && <div className="flex justify-between text-xs"><span className="text-gray-500">Labour Charge</span><span>₹{invoice.labourCharge.toFixed(2)}</span></div>}
                </div>
              )}

              <div className="border-t-2 border-gray-800 pt-2 mt-2 flex justify-between font-bold text-lg text-gray-900">
                <span>Grand Total</span>
                <span>₹{invoice.grandTotal.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-gray-300 pt-2 flex justify-between">
                <span className="text-gray-500 font-medium">Amount Paid</span>
                <span className="font-medium text-green-700">₹{invoice.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-gray-500">Balance Due</span>
                <span className={invoice.dueAmount > 0 ? "text-red-600" : "text-gray-900"}>₹{invoice.dueAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end border-t border-gray-300 pt-16">
          <div className="text-center w-48 border-t border-gray-400 pt-2">
            <p className="text-xs font-semibold text-gray-800">Customer Signature</p>
          </div>
          <div className="text-center w-48 border-t border-gray-400 pt-2">
            <p className="text-xs font-semibold text-gray-800">Authorized Signatory</p>
            <p className="text-[10px] text-gray-500 mt-1">For {config.businessName}</p>
          </div>
        </div>

        <div className="text-center mt-8 text-[10px] text-gray-400 border-t border-gray-100 pt-2">
          This is a computer generated invoice and does not require a physical signature if shared digitally.
        </div>
      </div>
    </div>
  );
}
