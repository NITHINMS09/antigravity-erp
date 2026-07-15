'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Plus, FileText, Search, Filter, Printer, CheckCircle, Trash2, X, Loader2, User, Calendar, Truck, CreditCard, Package } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate, PAYMENT_METHODS } from '@/lib/constants';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface Material { id: string; name: string; code: string; unit: string; defaultRate: number; gstRate: number; stock?: { quantity: number }; }
interface Customer { id: string; name: string; phone?: string; gstNumber?: string; }
interface InvoiceItem { materialId: string; quantity: number; rate: number; gstRate: number; description?: string; }

export default function BillingPage() {
  const [tab, setTab] = useState<'create' | 'list'>('create');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [invoices, setInvoices] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [isGst, setIsGst] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ materialId: '', quantity: 0, rate: 0, gstRate: 0 }]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loadingCharge, setLoadingCharge] = useState(0);
  const [loadingWorkerIds, setLoadingWorkerIds] = useState<string[]>([]);
  const [transportCharge, setTransportCharge] = useState(0);
  const [tractorCharge, setTractorCharge] = useState(0);
  const [labourCharge, setLabourCharge] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [successInvoice, setSuccessInvoice] = useState<any>(null);

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [mats, custs, invs, wrks] = await Promise.all([
        api.get('/materials').catch(() => ({ materials: [] })),
        api.get('/customers?business=POWER_BRICK').catch(() => ({ customers: [] })),
        api.get('/billing?business=POWER_BRICK&limit=100').catch(() => ({ invoices: [] })),
        api.get('/workers?business=POWER_BRICK').catch(() => ({ workers: [] })),
      ]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMaterials((mats?.materials || []).filter((m: any) => m.isActive));
      setCustomers(custs?.customers || []);
      setInvoices(invs?.invoices || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setWorkers((wrks?.workers || []).filter((w: any) => w.isActive));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showToast('Failed to load billing data', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(); 
    setInvoiceDate(new Date().toISOString().split('T')[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteInvoice = async (id: string, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}? This will also reverse stock and customer balance.`)) return;
    try {
      await api.delete(`/billing/${id}`);
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      showToast('Invoice deleted successfully');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.message || 'Failed to delete invoice', 'error');
    }
  };

  const addItem = () => setItems([...items, { materialId: '', quantity: 0, rate: 0, gstRate: 0 }]);
  const removeItem = (i: number) => items.length > 1 && setItems(items.filter((_, idx) => idx !== i));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'materialId') {
      const mat = materials.find(m => m.id === value);
      if (mat) { updated[index].rate = mat.defaultRate; updated[index].gstRate = mat.gstRate; }
    }
    setItems(updated);
  };

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
      if (!custId) { showToast('Select or add a customer', 'error'); setSubmitting(false); return; }

      const validItems = items.filter(it => it.materialId && it.quantity > 0);
      if (validItems.length === 0) { showToast('Add at least one item', 'error'); setSubmitting(false); return; }

      const invoice = await api.post('/billing', {
        customerId: custId, business: 'POWER_BRICK', isGst, items: validItems,
        vehicleNumber, discountPercent, loadingCharge, loadingWorkerIds, transportCharge, tractorCharge,
        labourCharge, paidAmount, paymentMethod, invoiceDate,
      });

      showToast(`Invoice ${invoice.invoice.invoiceNumber} created!`);
      setItems([{ materialId: '', quantity: 0, rate: 0, gstRate: 0 }]);
      setCustomerId(''); setVehicleNumber(''); setDiscountPercent(0);
      setLoadingCharge(0); setLoadingWorkerIds([]); setTransportCharge(0); setTractorCharge(0);
      setLabourCharge(0); setPaidAmount(0);
      fetchData(true);
      setSuccessInvoice(invoice.invoice);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { 
      showToast(err.message || 'Failed to create invoice', 'error'); 
    }
    finally { setSubmitting(false); }
  };

  const filtered = invoices.filter(inv => 
    (inv.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) || 
    (inv.customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (inv.vehicleNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500/50" />
      <p className="text-sm text-zinc-500">Loading billing data...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Billing</h1>
          <p className="text-sm text-zinc-500">Power Brick — Production Invoicing</p>
        </div>
        <div className="flex p-1 rounded-2xl bg-white/5 border border-white/5">
          {(['create', 'list'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-xl ${tab === t ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {t === 'create' ? 'New Invoice' : 'History'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {successInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => { setSuccessInvoice(null); setTab('list'); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0f0f1a] p-10 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Success!</h2>
              <p className="text-sm text-zinc-500 mb-8 font-medium">Invoice <span className="text-orange-400">#{successInvoice.invoiceNumber}</span> is ready for printing.</p>
              <div className="space-y-3">
                <Link href={`/print/invoice/${successInvoice.id}`} target="_blank" 
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25">
                  <Printer className="w-4 h-4" /> Print Invoice
                </Link>
                <button onClick={() => { setSuccessInvoice(null); setTab('list'); }} 
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all">
                  Return to History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {tab === 'create' ? (
        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              {/* Customer Info */}
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-orange-400" />
                  </div>
                  <h3 className="text-sm font-black text-zinc-100 uppercase tracking-widest">Customer Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-600 mb-2 uppercase tracking-widest">Client Selection</label>
                    <select value={customerId} onChange={e => setCustomerId(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none">
                      <option value="" className="bg-[#1a1a2e]">-- New Customer --</option>
                      {customers.map(c => <option key={c.id} value={c.id} className="bg-[#1a1a2e]">{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
                    </select>
                  </div>
                  {!customerId && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-600 mb-2 uppercase tracking-widest">Full Name</label>
                        <input type="text" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-600 mb-2 uppercase tracking-widest">Phone</label>
                        <input type="text" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-600 mb-2 uppercase tracking-widest">Vehicle Number</label>
                    <div className="relative">
                      <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input type="text" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value.toUpperCase())} placeholder="KA-12-AB-1234"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 font-mono tracking-widest" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-600 mb-2 uppercase tracking-widest">Billing Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-10 h-6 rounded-full transition-all relative p-1 ${isGst ? 'bg-orange-500' : 'bg-white/10'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${isGst ? 'translate-x-4' : 'translate-x-0'}`} />
                      <input type="checkbox" className="hidden" checked={isGst} onChange={e => setIsGst(e.target.checked)} />
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${isGst ? 'text-orange-400' : 'text-zinc-600'}`}>GST TAX INVOICE</span>
                  </label>
                </div>
              </div>

              {/* Items Section */}
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <Package className="w-4 h-4 text-purple-400" />
                    </div>
                    <h3 className="text-sm font-black text-zinc-100 uppercase tracking-widest">Invoice Items</h3>
                  </div>
                  <button type="button" onClick={addItem} 
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20 hover:bg-orange-500/20 transition-all">
                    <Plus className="w-3.5 h-3.5" /> Add Material
                  </button>
                </div>
                
                <div className="space-y-4">
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 items-end group p-4 rounded-3xl bg-white/[0.01] border border-transparent hover:border-white/5 transition-all">
                      <div className="col-span-12 md:col-span-4">
                        <label className="block text-[9px] font-black text-zinc-600 mb-1.5 uppercase tracking-widest">Select Product</label>
                        <select value={item.materialId} onChange={e => updateItem(i, 'materialId', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none">
                          <option value="" className="bg-[#1a1a2e]">Select Material</option>
                          {materials.map(m => <option key={m.id} value={m.id} className="bg-[#1a1a2e]">{m.name} (Stock: {m.stock?.quantity || 0})</option>)}
                        </select>
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="block text-[9px] font-black text-zinc-600 mb-1.5 uppercase tracking-widest">Quantity</label>
                        <input type="number" value={item.quantity || ''} onChange={e => updateItem(i, 'quantity', +e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="block text-[9px] font-black text-zinc-600 mb-1.5 uppercase tracking-widest">Unit Rate ₹</label>
                        <input type="number" value={item.rate || ''} onChange={e => updateItem(i, 'rate', +e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                      </div>
                      <div className="col-span-3 md:col-span-2">
                        <label className="block text-[9px] font-black text-zinc-600 mb-1.5 uppercase tracking-widest">Item Total</label>
                        <div className="px-4 py-3 rounded-xl bg-white/5 text-sm text-orange-400 font-black tracking-tighter">
                          {formatCurrency(item.quantity * item.rate)}
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-2 flex items-center justify-end">
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(i)} 
                            className="p-3 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {isGst && (
                          <div className="ml-2 w-16">
                            <label className="block text-[8px] font-black text-zinc-600 mb-1 uppercase tracking-widest text-center">GST%</label>
                            <input type="number" value={item.gstRate || ''} onChange={e => updateItem(i, 'gstRate', +e.target.value)}
                              className="w-full px-2 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[10px] font-bold text-center outline-none" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              {/* Additional Charges */}
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8">
                <h3 className="text-sm font-black text-zinc-100 uppercase tracking-widest mb-6">Service Charges</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Loading Cost', value: loadingCharge, set: setLoadingCharge, icon: Truck },
                    { label: 'Transport Fee', value: transportCharge, set: setTransportCharge, icon: Truck },
                    { label: 'Tractor Fee', value: tractorCharge, set: setTractorCharge, icon: Truck },
                    { label: 'Labour Cost', value: labourCharge, set: setLabourCharge, icon: User },
                    { label: 'Discount %', value: discountPercent, set: setDiscountPercent, icon: Filter },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-[9px] font-black text-zinc-600 mb-1.5 uppercase tracking-widest">{f.label}</label>
                      <div className="relative">
                        <f.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-700" />
                        <input type="number" value={f.value || ''} onChange={e => f.set(+e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                      </div>
                    </div>
                  ))}
                  {loadingCharge > 0 && (
                    <div className="pt-2 space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-black text-orange-500/70 uppercase tracking-widest">Select Loading Workers</label>
                        <button type="button" onClick={() => setLoadingWorkerIds(loadingWorkerIds.length === workers.length ? [] : workers.map(w => w.id))}
                          className="text-[9px] font-black text-orange-400/60 uppercase hover:text-orange-400 transition-colors">
                          {loadingWorkerIds.length === workers.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {workers.map(w => (
                          <button key={w.id} type="button" 
                            onClick={() => setLoadingWorkerIds(prev => prev.includes(w.id) ? prev.filter(id => id !== w.id) : [...prev, w.id])}
                            className={`px-3 py-2.5 rounded-xl border text-[10px] font-bold transition-all text-left flex items-center justify-between ${
                              loadingWorkerIds.includes(w.id) 
                              ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' 
                              : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/10'
                            }`}>
                            <span className="truncate">{w.name}</span>
                            {loadingWorkerIds.includes(w.id) && <CheckCircle className="w-3 h-3 flex-shrink-0" />}
                          </button>
                        ))}
                      </div>

                      {loadingWorkerIds.length > 0 && (
                        <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                          <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest text-center">
                            Split: {formatCurrency(loadingCharge / loadingWorkerIds.length)} each
                          </p>
                        </div>
                      )}
                      
                      <p className="text-[9px] text-zinc-600 italic px-1 leading-tight">Amount will be divided equally among {loadingWorkerIds.length} worker(s).</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Summary Box */}
              <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.05] to-transparent p-8 shadow-2xl shadow-orange-500/5">
                <h3 className="text-sm font-black text-zinc-100 uppercase tracking-widest mb-6">Final Total</h3>
                <div className="space-y-3 pb-6 border-b border-white/5">
                  <div className="flex justify-between text-xs font-medium"><span className="text-zinc-500 uppercase tracking-tighter">Net Subtotal</span><span className="text-zinc-200 tracking-tight">{formatCurrency(subtotal)}</span></div>
                  {isGst && <div className="flex justify-between text-xs font-medium"><span className="text-zinc-500 uppercase tracking-tighter">Tax (GST)</span><span className="text-emerald-400 tracking-tight">+{formatCurrency(gstTotal)}</span></div>}
                  {discount > 0 && <div className="flex justify-between text-xs font-medium"><span className="text-zinc-500 uppercase tracking-tighter">Discount Applied</span><span className="text-red-400 tracking-tight">-{formatCurrency(discount)}</span></div>}
                  {(loadingCharge + transportCharge + tractorCharge + labourCharge) > 0 && (
                    <div className="flex justify-between text-xs font-medium"><span className="text-zinc-500 uppercase tracking-tighter">Other Services</span><span className="text-zinc-200 tracking-tight">+{formatCurrency(loadingCharge + transportCharge + tractorCharge + labourCharge)}</span></div>
                  )}
                  <div className="pt-2 flex justify-between items-end">
                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Payable</span>
                    <span className="text-3xl font-black text-white tracking-tighter">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-zinc-600 mb-1.5 uppercase tracking-widest">Amount Received ₹</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
                      <input type="number" value={paidAmount || ''} onChange={e => setPaidAmount(+e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-lg font-black outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-zinc-600 mb-1.5 uppercase tracking-widest">Payment Mode</label>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-zinc-200 text-xs font-bold uppercase tracking-widest outline-none appearance-none">
                      {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value} className="bg-[#1a1a2e]">{m.label}</option>)}
                    </select>
                  </div>
                </div>

                {dueAmount > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-center">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Outstanding Balance</p>
                    <p className="text-sm font-black text-red-400 tracking-tighter">{formatCurrency(dueAmount)}</p>
                  </div>
                )}

                <button type="submit" disabled={submitting}
                  className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-500/25 hover:from-orange-600 hover:to-orange-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-3">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <FileText className="w-4 h-4" />
                      Generate Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Invoice List */
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 max-w-md focus-within:border-orange-500/50 transition-colors">
            <Search className="w-4 h-4 text-zinc-600" />
            <input type="text" placeholder="Search by invoice # or customer..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none w-full" />
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Invoice</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Client</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Details</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                  {filtered.map((inv, i) => (
                    <tr key={inv.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-orange-400 group-hover:scale-105 transition-transform origin-left tracking-tight">#{inv.invoiceNumber}</span>
                          <span className="text-[10px] text-zinc-600 font-bold flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" /> {formatDate(inv.invoiceDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-zinc-600 text-xs">{inv.customer?.name?.[0]}</div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-200">{inv.customer?.name}</span>
                            {inv.customer?.phone && <span className="text-[10px] text-zinc-600 font-medium">{inv.customer?.phone}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter flex items-center gap-1"><Truck className="w-3 h-3" /> {inv.vehicleNumber || 'No Vehicle'}</span>
                          <div className="flex gap-1 mt-1">
                            {inv.isGst && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-lg border border-emerald-500/10 font-black">GST</span>}
                            <span className="text-[8px] bg-white/5 text-zinc-600 px-1.5 py-0.5 rounded-lg font-black uppercase">{inv.paymentMethod}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-white tracking-tighter">{formatCurrency(inv.grandTotal)}</span>
                          <span className="text-[9px] text-zinc-600 font-bold tracking-tight">Paid: {formatCurrency(inv.paidAmount)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                          inv.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' :
                          inv.paymentStatus === 'partial' ? 'bg-blue-500/10 text-blue-400 border-blue-500/10' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/10'
                        }`}>{inv.paymentStatus}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <Link href={`/print/invoice/${inv.id}`} target="_blank" 
                            className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-orange-500/10 text-zinc-500 hover:text-orange-400 border border-transparent hover:border-orange-500/20 transition-all shadow-xl">
                            <Printer className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                            className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all shadow-xl">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-20 text-center text-zinc-600 text-sm font-medium italic">No invoices found matching your criteria.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
