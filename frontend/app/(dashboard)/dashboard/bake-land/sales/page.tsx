'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
 
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Receipt, Plus, Pencil, Trash2, IndianRupee, Banknote, Smartphone, CreditCard, X, Search, Loader2, Calendar, Tag, Wallet } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/constants';
import { useToast } from '@/components/Toast';

export default function BakerySalesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const [form, setForm] = useState({
    saleDate: new Date().toISOString().split('T')[0],
    cashAmount: 0,
    upiAmount: 0,
    cardAmount: 0,
    discountAmount: 0,
    notes: ''
  });

  const totalAmount = form.cashAmount + form.upiAmount + form.cardAmount;

  const fetchSales = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const d = await api.get('/bakery/sales');
      setSales(d.sales);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      showToast('Failed to load sales data', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchSales(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, totalAmount };
      if (editing) {
        await api.put(`/bakery/sales/${editing.id}`, payload);
        showToast('Sale entry updated');
      } else {
        await api.post('/bakery/sales', payload);
        showToast('Daily sale recorded successfully');
      }
      setShowForm(false);
      setEditing(null);
      setForm({
        saleDate: new Date().toISOString().split('T')[0],
        cashAmount: 0, upiAmount: 0, cardAmount: 0,
        discountAmount: 0, notes: ''
      });
      fetchSales(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (sale: any) => {
    setEditing(sale);
    setForm({
      saleDate: sale.saleDate.split('T')[0],
      cashAmount: sale.cashAmount,
      upiAmount: sale.upiAmount,
      cardAmount: sale.cardAmount,
      discountAmount: sale.discountAmount,
      notes: sale.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sale entry?')) return;
    try {
      await api.delete(`/bakery/sales/${id}`);
      setSales(prev => prev.filter(s => s.id !== id));
      showToast('Sale entry deleted');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const filtered = sales.filter(s => 
    s.saleDate.includes(search) || 
    s.notes?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTotal = sales.filter(s => s.saleDate.split('T')[0] === todayStr).reduce((s, e) => s + e.totalAmount, 0);
  const monthTotal = sales.reduce((s, e) => s + e.totalAmount, 0);
  const totalCash = sales.reduce((s, e) => s + e.cashAmount, 0);
  const totalUpi = sales.reduce((s, e) => s + e.upiAmount, 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500/50" />
      <p className="text-sm text-zinc-500">Loading daily sales...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Daily Sales</h1>
          <p className="text-sm text-zinc-500">Record and track BAKE LAND counter collections</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ saleDate: new Date().toISOString().split('T')[0], cashAmount: 0, upiAmount: 0, cardAmount: 0, discountAmount: 0, notes: '' }); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-purple-500/25 hover:from-purple-600 hover:to-purple-700 transition-all">
          <Plus className="w-4 h-4" /> Add Today&apos;s Sales
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 group hover:border-purple-500/30 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4"><IndianRupee className="w-5 h-5 text-purple-400" /></div>
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Today</p>
          <p className="text-2xl font-black text-white mt-1 tracking-tighter">{formatCurrency(todayTotal)}</p>
        </div>
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 group hover:border-pink-500/30 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-4"><Receipt className="w-5 h-5 text-pink-400" /></div>
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">This Month</p>
          <p className="text-2xl font-black text-white mt-1 tracking-tighter">{formatCurrency(monthTotal)}</p>
        </div>
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 group hover:border-emerald-500/30 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4"><Banknote className="w-5 h-5 text-emerald-400" /></div>
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Cash Collection</p>
          <p className="text-2xl font-black text-white mt-1 tracking-tighter">{formatCurrency(totalCash)}</p>
        </div>
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 group hover:border-blue-500/30 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4"><Smartphone className="w-5 h-5 text-blue-400" /></div>
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">UPI Collection</p>
          <p className="text-2xl font-black text-white mt-1 tracking-tighter">{formatCurrency(totalUpi)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 max-w-md focus-within:border-purple-500/50 transition-colors">
        <Search className="w-4 h-4 text-zinc-600" />
        <input type="text" placeholder="Search by date or notes..." value={search} onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none w-full" />
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-100">{editing ? 'Edit Daily Sales' : 'Record Daily Sales'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Sale Date *</label>
                  <input type="date" value={form.saleDate} onChange={e => setForm({ ...form, saleDate: e.target.value })} required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-600 mb-1.5 uppercase tracking-widest text-center">Cash ₹</label>
                    <input type="number" step="0.01" value={form.cashAmount || ''} onChange={e => setForm({ ...form, cashAmount: +e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 text-sm font-bold text-center outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-600 mb-1.5 uppercase tracking-widest text-center">UPI ₹</label>
                    <input type="number" step="0.01" value={form.upiAmount || ''} onChange={e => setForm({ ...form, upiAmount: +e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-blue-400 text-sm font-bold text-center outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-600 mb-1.5 uppercase tracking-widest text-center">Card ₹</label>
                    <input type="number" step="0.01" value={form.cardAmount || ''} onChange={e => setForm({ ...form, cardAmount: +e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-purple-400 text-sm font-bold text-center outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Total Discount Allowed ₹</label>
                  <input type="number" step="0.01" value={form.discountAmount || ''} onChange={e => setForm({ ...form, discountAmount: +e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" />
                </div>

                <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Total Collection</span>
                    <span className="text-xl font-black text-purple-400 tracking-tighter">{formatCurrency(totalAmount)}</span>
                  </div>
                  {form.discountAmount > 0 && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-purple-500/10">
                      <span className="text-[10px] text-zinc-600 font-medium">After Discount</span>
                      <span className="text-sm font-bold text-zinc-400">{formatCurrency(totalAmount - form.discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Notes / Remakrs</label>
                  <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Festival, holiday, etc."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-sm font-medium hover:bg-white/5 transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} 
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-black shadow-lg shadow-purple-500/25 transition-all">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editing ? 'Update' : 'Save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Collections</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Total Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Notes</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
              {filtered.map((s, i) => (
                <tr key={s.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-zinc-200 tracking-tight">{formatDate(s.saleDate)}</span>
                      <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Entry Recorded</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded-lg border border-emerald-400/10 flex items-center gap-1.5"><Banknote className="w-3 h-3" /> {formatCurrency(s.cashAmount)}</span>
                      <span className="text-[10px] font-black text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded-lg border border-blue-400/10 flex items-center gap-1.5"><Smartphone className="w-3 h-3" /> {formatCurrency(s.upiAmount)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-base font-black text-white tracking-tighter">{formatCurrency(s.totalAmount)}</span>
                      {s.discountAmount > 0 && <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Disc: {formatCurrency(s.discountAmount)}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-zinc-500 font-medium line-clamp-1 italic">{s.notes || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(s)} 
                        className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-blue-500/10 text-zinc-500 hover:text-blue-400 border border-transparent hover:border-blue-500/20 transition-all shadow-xl"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(s.id)} 
                        className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all shadow-xl"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-zinc-600 text-sm font-medium italic">No sales entries found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
