'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Eye, Search, IndianRupee, Filter, Printer, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate, PAYMENT_METHODS } from '@/lib/constants';
import Link from 'next/link';

interface Material { id: string; name: string; code: string; unit: string; defaultRate: number; gstRate: number; }
interface Customer { id: string; name: string; phone?: string; gstNumber?: string; }
interface InvoiceItem { materialId: string; quantity: number; rate: number; gstRate: number; description?: string; }

export default function BillingPage() {
  const [tab, setTab] = useState<'create' | 'list'>('create');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [isGst, setIsGst] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ materialId: '', quantity: 0, rate: 0, gstRate: 0 }]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loadingCharge, setLoadingCharge] = useState(0);
  const [transportCharge, setTransportCharge] = useState(0);
  const [tractorCharge, setTractorCharge] = useState(0);
  const [labourCharge, setLabourCharge] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      api.get('/materials').then(d => setMaterials(d.materials.filter((m: any) => m.isActive))),
      api.get('/customers?business=POWER_BRICK').then(d => setCustomers(d.customers)),
      api.get('/billing?business=POWER_BRICK&limit=20').then(d => setInvoices(d.invoices)),
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  const addItem = () => setItems([...items, { materialId: '', quantity: 0, rate: 0, gstRate: 0 }]);
  const removeItem = (i: number) => items.length > 1 && setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'materialId') {
      const mat = materials.find(m => m.id === value);
      if (mat) { updated[index].rate = mat.defaultRate; updated[index].gstRate = mat.gstRate; }
    }
    setItems(updated);
  };

  // Calculations
  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.rate, 0);
  const gstTotal = isGst ? items.reduce((sum, it) => sum + (it.quantity * it.rate * it.gstRate / 100), 0) : 0;
  const discount = subtotal * discountPercent / 100;
  const grandTotal = subtotal + gstTotal - discount + loadingCharge + transportCharge + tractorCharge + labourCharge;
  const dueAmount = grandTotal - paidAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let custId = customerId;
      if (!custId && newCustomerName) {
        const res = await api.post('/customers', { name: newCustomerName, phone: newCustomerPhone, business: 'POWER_BRICK' });
        custId = res.customer.id;
        setCustomers([...customers, res.customer]);
      }
      if (!custId) { alert('Select or add a customer'); setSubmitting(false); return; }

      const validItems = items.filter(it => it.materialId && it.quantity > 0);
      if (validItems.length === 0) { alert('Add at least one item'); setSubmitting(false); return; }

      const invoice = await api.post('/billing', {
        customerId: custId, business: 'POWER_BRICK', isGst, items: validItems,
        vehicleNumber, discountPercent, loadingCharge, transportCharge, tractorCharge,
        labourCharge, paidAmount, paymentMethod, invoiceDate,
      });

      alert(`Invoice ${invoice.invoice.invoiceNumber} created! Total: ${formatCurrency(invoice.invoice.grandTotal)}`);
      setItems([{ materialId: '', quantity: 0, rate: 0, gstRate: 0 }]);
      setCustomerId(''); setVehicleNumber(''); setDiscountPercent(0);
      setLoadingCharge(0); setTransportCharge(0); setTractorCharge(0);
      setLabourCharge(0); setPaidAmount(0);
      const d = await api.get('/billing?business=POWER_BRICK&limit=20');
      setInvoices(d.invoices);
      setSuccessInvoice(invoice.invoice);
    } catch (err: any) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Billing</h1>
          <p className="text-sm text-zinc-500">Power Brick — Create and manage invoices</p>
        </div>
        <div className="flex rounded-xl overflow-hidden border border-white/10">
          {(['create', 'list'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium transition-all ${tab === t ? 'bg-orange-500 text-white' : 'bg-white/5 text-zinc-400 hover:text-zinc-200'}`}>
              {t === 'create' ? '+ New Invoice' : 'All Invoices'}
            </button>
          ))}
        </div>
      </div>

      {/* Success Modal */}
      {successInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setSuccessInvoice(null); setTab('list'); }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f1a] p-8 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100 mb-2">Invoice Created!</h2>
            <p className="text-sm text-zinc-400 mb-6">Invoice {successInvoice.invoiceNumber} has been generated successfully.</p>
            <div className="space-y-3">
              <Link href={`/print/invoice/${successInvoice.id}`} target="_blank" className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium flex items-center justify-center gap-2 transition-all">
                <Printer className="w-4 h-4" /> Print Invoice
              </Link>
              <button onClick={() => { setSuccessInvoice(null); setTab('list'); }} className="w-full py-3 rounded-xl border border-white/10 text-zinc-300 font-medium hover:bg-white/5 transition-all">
                Close & View All
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {tab === 'create' ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer + Vehicle */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Select Customer</label>
                <select value={customerId} onChange={e => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                  <option value="">-- New Customer --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
                </select>
              </div>
              {!customerId && (
                <>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">New Customer Name</label>
                    <input type="text" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Phone</label>
                    <input type="text" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Invoice Date</label>
                <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Vehicle Number</label>
                <input type="text" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value.toUpperCase())} placeholder="KA-12-AB-1234"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isGst} onChange={e => setIsGst(e.target.checked)}
                    className="w-4 h-4 rounded accent-orange-500" />
                  <span className="text-sm text-zinc-300">GST Invoice</span>
                </label>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-200">Items</h3>
              <button type="button" onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-medium hover:bg-orange-500/20 transition-all">
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-[10px] text-zinc-600 mb-1">Material</label>
                    <select value={item.materialId} onChange={e => updateItem(i, 'materialId', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                      <option value="">Select Material</option>
                      {materials.map(m => <option key={m.id} value={m.id}>{m.name} — ₹{m.defaultRate}/{m.unit}</option>)}
                    </select>
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-[10px] text-zinc-600 mb-1">Qty</label>
                    <input type="number" value={item.quantity || ''} onChange={e => updateItem(i, 'quantity', +e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-[10px] text-zinc-600 mb-1">Rate (₹)</label>
                    <input type="number" value={item.rate || ''} onChange={e => updateItem(i, 'rate', +e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <label className="block text-[10px] text-zinc-600 mb-1">Amount</label>
                    <div className="px-3 py-2 rounded-lg bg-white/5 text-sm text-orange-400 font-medium">{formatCurrency(item.quantity * item.rate)}</div>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex gap-1">
                    {isGst && (
                      <div className="flex-1">
                        <label className="block text-[10px] text-zinc-600 mb-1">GST%</label>
                        <input type="number" value={item.gstRate || ''} onChange={e => updateItem(i, 'gstRate', +e.target.value)}
                          className="w-full px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-xs outline-none" />
                      </div>
                    )}
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)} className="mt-4 p-2 text-red-400 hover:bg-red-500/10 rounded-lg">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charges + Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4">Additional Charges</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Loading ₹', value: loadingCharge, set: setLoadingCharge },
                  { label: 'Transport ₹', value: transportCharge, set: setTransportCharge },
                  { label: 'Tractor ₹', value: tractorCharge, set: setTractorCharge },
                  { label: 'Labour ₹', value: labourCharge, set: setLabourCharge },
                  { label: 'Discount %', value: discountPercent, set: setDiscountPercent },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-[10px] text-zinc-600 mb-1">{f.label}</label>
                    <input type="number" value={f.value || ''} onChange={e => f.set(+e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-orange-500/10 bg-orange-500/5 p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Subtotal</span><span className="text-zinc-200">{formatCurrency(subtotal)}</span></div>
                {isGst && <div className="flex justify-between"><span className="text-zinc-500">GST</span><span className="text-emerald-400">+{formatCurrency(gstTotal)}</span></div>}
                {discount > 0 && <div className="flex justify-between"><span className="text-zinc-500">Discount</span><span className="text-red-400">-{formatCurrency(discount)}</span></div>}
                {(loadingCharge + transportCharge + tractorCharge + labourCharge) > 0 && (
                  <div className="flex justify-between"><span className="text-zinc-500">Charges</span><span className="text-zinc-200">+{formatCurrency(loadingCharge + transportCharge + tractorCharge + labourCharge)}</span></div>
                )}
                <div className="border-t border-white/10 pt-2 flex justify-between">
                  <span className="text-zinc-200 font-semibold">Grand Total</span>
                  <span className="text-xl font-bold text-orange-400">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-600 mb-1">Paid Amount</label>
                  <input type="number" value={paidAmount || ''} onChange={e => setPaidAmount(+e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-600 mb-1">Method</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>
              {dueAmount > 0 && <p className="mt-2 text-xs text-amber-400">Due: {formatCurrency(dueAmount)}</p>}
              <button type="submit" disabled={submitting}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25">
                <FileText className="w-4 h-4" /> {submitting ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Invoice List */
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-[11px] text-zinc-500 font-medium px-5 py-3">Invoice</th>
                  <th className="text-left text-[11px] text-zinc-500 font-medium px-5 py-3">Customer</th>
                  <th className="text-left text-[11px] text-zinc-500 font-medium px-5 py-3">Date</th>
                  <th className="text-right text-[11px] text-zinc-500 font-medium px-5 py-3">Total</th>
                  <th className="text-right text-[11px] text-zinc-500 font-medium px-5 py-3">Paid</th>
                  <th className="text-center text-[11px] text-zinc-500 font-medium px-5 py-3">Status</th>
                  <th className="text-right text-[11px] text-zinc-500 font-medium px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-orange-400">{inv.invoiceNumber}</p>
                      {inv.isGst && <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">GST</span>}
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-300">{inv.customer?.name}</td>
                    <td className="px-5 py-3 text-sm text-zinc-500">{formatDate(inv.invoiceDate)}</td>
                    <td className="px-5 py-3 text-right text-sm font-semibold text-zinc-200">{formatCurrency(inv.grandTotal)}</td>
                    <td className="px-5 py-3 text-right text-sm text-zinc-400">{formatCurrency(inv.paidAmount)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        inv.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                        inv.paymentStatus === 'partial' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>{inv.paymentStatus}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/print/invoice/${inv.id}`} target="_blank" className="inline-flex p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-orange-400 transition-colors" onClick={e => e.stopPropagation()}>
                        <Printer className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-zinc-600 text-sm">No invoices yet. Create your first invoice!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
