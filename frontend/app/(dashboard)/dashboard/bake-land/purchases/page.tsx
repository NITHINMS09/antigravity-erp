'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, X, Trash2, IndianRupee, Search, Loader2, Calendar, User, Package, CreditCard } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate, PAYMENT_METHODS } from '@/lib/constants';
import { useToast } from '@/components/Toast';

export default function BakeryPurchasesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [purchases, setPurchases] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [showPayment, setShowPayment] = useState<any>(null);
  const [payForm, setPayForm] = useState({ amount: 0, method: 'cash', notes: '' });
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const [form, setForm] = useState({
    supplierId: '',
    supplierName: '',
    supplierPhone: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    items: [{ productId: '', quantity: 0, rate: 0 }],
    transportCost: 0,
    loadingCost: 0,
    otherCharges: 0,
    paidAmount: 0,
    paymentMethod: 'cash',
    notes: '',
    business: 'BAKE_LAND'
  });

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [p, prod, s] = await Promise.all([
        api.get('/purchases?business=BAKE_LAND'),
        api.get('/bakery/products'),
        api.get('/purchases/suppliers?business=BAKE_LAND'),
      ]);
      setPurchases(p.purchases);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setProducts(prod.products.filter((pp: any) => pp.isActive));
      setSuppliers(s.suppliers);
    } catch (e) { 
      console.error(e);
      showToast('Failed to load bakery data', 'error');
    } finally { 
      if (!isSilent) setLoading(false); 
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payForm.amount <= 0) return showToast('Enter a valid amount', 'error');
    setSubmitting(true);
    try {
      await api.post(`/purchases/${showPayment.id}/payment`, payForm);
      setShowPayment(null);
      setPayForm({ amount: 0, method: 'cash', notes: '' });
      showToast('Payment recorded successfully');
      fetchData(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.message || 'Failed to record payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePurchase = async (id: string, purchaseNumber: string) => {
    if (!confirm(`Are you sure you want to delete purchase ${purchaseNumber}? This will also reverse the stock levels.`)) return;
    try {
      await api.delete(`/purchases/${id}`);
      setPurchases(purchases.filter(p => p.id !== id));
      showToast('Purchase deleted successfully');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.message || 'Failed to delete purchase', 'error');
    }
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: 0, rate: 0 }] });
  const removeItem = (i: number) => form.items.length > 1 && setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...form.items];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, items: updated });
  };

  const itemsTotal = form.items.reduce((s, it) => s + (it.quantity * it.rate), 0);
  const grandTotal = itemsTotal + form.transportCost + form.loadingCost + form.otherCharges;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = form.items.filter(it => it.productId && it.quantity > 0);
    if (validItems.length === 0) return showToast('Add at least one product with quantity', 'error');
    if (!form.supplierId && !form.supplierName) return showToast('Select or enter a supplier name', 'error');

    setSubmitting(true);
    try {
      await api.post('/purchases', {
        ...form,
        supplierId: form.supplierId || undefined,
        supplierName: !form.supplierId ? form.supplierName : undefined,
        supplierPhone: !form.supplierId ? form.supplierPhone : undefined,
        items: validItems,
      });
      setShowForm(false);
      setForm({
        supplierId: '', supplierName: '', supplierPhone: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        items: [{ productId: '', quantity: 0, rate: 0 }],
        transportCost: 0, loadingCost: 0, otherCharges: 0,
        paidAmount: 0, paymentMethod: 'cash', notes: '',
        business: 'BAKE_LAND'
      });
      showToast('Bakery purchase recorded successfully');
      fetchData(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { 
      showToast(err.message, 'error'); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const filtered = purchases.filter(p => 
    p.purchaseNumber.toLowerCase().includes(search.toLowerCase()) || 
    p.supplier?.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-pink-500/50" />
      <p className="text-sm text-zinc-500">Loading bakery purchases...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Bakery Purchases</h1>
          <p className="text-sm text-zinc-500">Manage ingredients and supplies for Bake Land</p>
        </div>
        <button onClick={() => setShowForm(true)} 
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white text-sm font-medium shadow-lg shadow-pink-500/25 hover:from-pink-600 hover:to-rose-700 transition-all">
          <Plus className="w-4 h-4" /> New Purchase
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 max-w-md focus-within:border-pink-500/50 transition-colors">
        <Search className="w-4 h-4 text-zinc-600" />
        <input type="text" placeholder="Search by number or supplier..." value={search} onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none w-full" />
      </div>

      {/* Purchase Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl my-8 rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-zinc-100">Record Bakery Purchase</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Supplier + Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Select Supplier</label>
                      <select value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-pink-500/50 transition-all appearance-none">
                        <option value="" className="bg-[#1a1a2e]">-- New Supplier --</option>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {suppliers.map((s: any) => <option key={s.id} value={s.id} className="bg-[#1a1a2e]">{s.name}</option>)}
                      </select>
                    </div>
                    {!form.supplierId && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Supplier Name *</label>
                          <input type="text" value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })} 
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-pink-500/50" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Phone</label>
                          <input type="text" value={form.supplierPhone} onChange={e => setForm({ ...form, supplierPhone: e.target.value })} 
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-pink-500/50" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Purchase Date</label>
                    <input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-pink-500/50" />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Package className="w-4 h-4" /> Products & Ingredients
                    </h3>
                    <button type="button" onClick={addItem} 
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-500/10 text-pink-400 text-xs font-bold hover:bg-pink-500/20 transition-all border border-pink-500/20">
                      <Plus className="w-3.5 h-3.5" /> Add Row
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.items.map((item, i) => (
                      <div key={i} className="grid grid-cols-12 gap-3 items-end group">
                        <div className="col-span-5">
                          <label className="block text-[10px] font-bold text-zinc-600 mb-1 uppercase tracking-tighter">Product</label>
                          <select value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-pink-500/50 appearance-none">
                            <option value="" className="bg-[#1a1a2e]">Select Product</option>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {products.map((p: any) => <option key={p.id} value={p.id} className="bg-[#1a1a2e]">{p.name} ({p.unit})</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-zinc-600 mb-1 uppercase tracking-tighter">Qty</label>
                          <input type="number" value={item.quantity || ''} onChange={e => updateItem(i, 'quantity', +e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-pink-500/50" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-zinc-600 mb-1 uppercase tracking-tighter">Rate ₹</label>
                          <input type="number" value={item.rate || ''} onChange={e => updateItem(i, 'rate', +e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-pink-500/50" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-zinc-600 mb-1 uppercase tracking-tighter">Total</label>
                          <div className="px-4 py-3 rounded-xl bg-white/5 border border-transparent text-sm text-pink-400 font-black">
                            {formatCurrency(item.quantity * item.rate)}
                          </div>
                        </div>
                        <div className="col-span-1 pb-1 text-right">
                          {form.items.length > 1 && (
                            <button type="button" onClick={() => removeItem(i)} 
                              className="p-2.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals & Payments */}
                <div className="pt-6 border-t border-white/5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-600 mb-1.5 uppercase tracking-widest">Transport ₹</label>
                      <input type="number" value={form.transportCost || ''} onChange={e => setForm({ ...form, transportCost: +e.target.value })} 
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-pink-500/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-600 mb-1.5 uppercase tracking-widest">Loading ₹</label>
                      <input type="number" value={form.loadingCost || ''} onChange={e => setForm({ ...form, loadingCost: +e.target.value })} 
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-pink-500/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-600 mb-1.5 uppercase tracking-widest">Other ₹</label>
                      <input type="number" value={form.otherCharges || ''} onChange={e => setForm({ ...form, otherCharges: +e.target.value })} 
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-pink-500/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-600 mb-1.5 uppercase tracking-widest">Paid ₹</label>
                      <input type="number" value={form.paidAmount || ''} onChange={e => setForm({ ...form, paidAmount: +e.target.value })} 
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-pink-500/[0.03] p-6 rounded-3xl border border-pink-500/10">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em]">Summary</p>
                      <div className="flex items-baseline gap-2 text-3xl font-black text-white tracking-tighter">
                        {formatCurrency(grandTotal)}
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest ml-1">Grand Total</span>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium">Balance Due: {formatCurrency(grandTotal - form.paidAmount)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setShowForm(false)} className="py-3.5 rounded-2xl border border-white/10 text-zinc-400 text-sm font-bold hover:bg-white/5 transition-all">Cancel</button>
                      <button type="submit" disabled={submitting} 
                        className="py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white text-sm font-black shadow-lg shadow-pink-500/25 hover:from-pink-600 hover:to-rose-700 transition-all">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Record Purchase'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Purchase List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
            className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 group hover:border-pink-500/20 transition-all flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-pink-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center gap-4 min-w-[250px]">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-zinc-100 tracking-tight">{p.purchaseNumber}</h3>
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    p.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {p.paymentStatus}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1 font-medium"><User className="w-3 h-3 opacity-50" /> {p.supplier?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-12 flex-grow">
              <div className="hidden md:block">
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Date</p>
                <p className="text-xs text-zinc-300 font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-zinc-600" /> {formatDate(p.purchaseDate)}</p>
              </div>
              <div className="max-w-[200px] hidden lg:block">
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Items</p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <p className="text-xs text-zinc-500 line-clamp-1 italic font-medium">{p.items?.map((it: any) => `${it.bakeryProduct?.name} (x${it.quantity})`).join(', ')}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 min-w-[150px] justify-end">
              <div className="text-right">
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-base font-black text-white tracking-tighter">{formatCurrency(p.grandTotal)}</p>
              </div>
              <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                {p.paymentStatus !== 'paid' && (
                  <button onClick={() => { setShowPayment(p); setPayForm({ amount: p.dueAmount, method: 'cash', notes: '' }); }}
                    className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 shadow-xl"><IndianRupee className="w-4 h-4" /></button>
                )}
                <button onClick={() => handleDeletePurchase(p.id, p.purchaseNumber)}
                  className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-transparent hover:border-red-500/20 shadow-xl"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        ))}
        {purchases.length === 0 && (
          <div className="py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
            <ShoppingCart className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No bakery purchases recorded yet.</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPayment(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-zinc-100 mb-1 flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-400" /> Record Payment</h2>
              <p className="text-sm text-zinc-500 mb-6">{showPayment.purchaseNumber} — Pending: <span className="text-emerald-400 font-bold">{formatCurrency(showPayment.dueAmount)}</span></p>
              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Payment Amount ₹ *</label>
                  <input type="number" step="0.01" value={payForm.amount || ''} onChange={e => setPayForm({ ...payForm, amount: +e.target.value })} required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Payment Method</label>
                  <select value={payForm.method} onChange={e => setPayForm({ ...payForm, method: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none appearance-none">
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value} className="bg-[#1a1a2e]">{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Notes</label>
                  <input type="text" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} placeholder="Any remarks"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowPayment(null)} className="flex-1 py-3.5 rounded-2xl border border-white/10 text-zinc-400 text-sm font-bold">Cancel</button>
                  <button type="submit" disabled={submitting} 
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-black shadow-lg shadow-emerald-500/25">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Payment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
