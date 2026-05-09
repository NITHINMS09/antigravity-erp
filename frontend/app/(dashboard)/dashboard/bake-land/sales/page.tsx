// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Plus, Pencil, Trash2, IndianRupee, Banknote, Smartphone, CreditCard } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/constants';

export default function BakerySalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [cashAmount, setCashAmount] = useState(0);
  const [upiAmount, setUpiAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');

  const totalAmount = cashAmount + upiAmount + cardAmount;

  const fetchSales = async () => {
    try { const d = await api.get('/bakery/sales'); setSales(d.sales); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSales(); }, []);

  const resetForm = () => {
    setSaleDate(new Date().toISOString().split('T')[0]);
    setCashAmount(0); setUpiAmount(0); setCardAmount(0);
    setDiscountAmount(0); setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { totalAmount, cashAmount, upiAmount, cardAmount, discountAmount, notes, saleDate };
      if (editing) {
        await api.put(`/bakery/sales/${editing.id}`, payload);
      } else {
        await api.post('/bakery/sales', payload);
      }
      setShowForm(false); setEditing(null); resetForm();
      fetchSales();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (sale: any) => {
    setEditing(sale);
    setSaleDate(sale.saleDate.split('T')[0]);
    setCashAmount(sale.cashAmount);
    setUpiAmount(sale.upiAmount);
    setCardAmount(sale.cardAmount);
    setDiscountAmount(sale.discountAmount);
    setNotes(sale.notes || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sale entry?')) return;
    try { await api.delete(`/bakery/sales/${id}`); fetchSales(); } catch (e: any) { alert(e.message); }
  };

  // Stats
  const todaySales = sales.filter(s => s.saleDate.split('T')[0] === new Date().toISOString().split('T')[0]);
  const todayTotal = todaySales.reduce((s, e) => s + e.totalAmount, 0);
  const monthTotal = sales.reduce((s, e) => s + e.totalAmount, 0);
  const totalCash = sales.reduce((s, e) => s + e.cashAmount, 0);
  const totalUpi = sales.reduce((s, e) => s + e.upiAmount, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-zinc-100">Bakery Daily Sales</h1><p className="text-sm text-zinc-500">Record overall daily sales for BAKE LAND</p></div>
        <button onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-purple-500/25"><Plus className="w-4 h-4" /> Add Today&apos;s Sales</button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-purple-500/10 bg-purple-500/5 p-4">
          <p className="text-xs text-zinc-500 flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Today</p>
          <p className="text-xl font-bold text-purple-400 mt-1">{formatCurrency(todayTotal)}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-zinc-500">This Month</p>
          <p className="text-xl font-bold text-zinc-100 mt-1">{formatCurrency(monthTotal)}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
          <p className="text-xs text-zinc-500 flex items-center gap-1"><Banknote className="w-3 h-3" /> Total Cash</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(totalCash)}</p>
        </div>
        <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
          <p className="text-xs text-zinc-500 flex items-center gap-1"><Smartphone className="w-3 h-3" /> Total UPI</p>
          <p className="text-xl font-bold text-blue-400 mt-1">{formatCurrency(totalUpi)}</p>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f1a] p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">{editing ? 'Edit Daily Sales' : 'Record Daily Sales'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-xs text-zinc-500 mb-1">Date *</label>
                <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>

              <p className="text-xs text-zinc-500 mt-2">Enter the total amount collected through each payment method:</p>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1 flex items-center gap-1"><Banknote className="w-3 h-3 text-emerald-400" /> Cash ₹</label>
                  <input type="number" value={cashAmount || ''} onChange={e => setCashAmount(+e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" /></div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1 flex items-center gap-1"><Smartphone className="w-3 h-3 text-blue-400" /> UPI ₹</label>
                  <input type="number" value={upiAmount || ''} onChange={e => setUpiAmount(+e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/50" /></div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1 flex items-center gap-1"><CreditCard className="w-3 h-3 text-purple-400" /> Card ₹</label>
                  <input type="number" value={cardAmount || ''} onChange={e => setCardAmount(+e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" /></div>
              </div>

              <div><label className="block text-xs text-zinc-500 mb-1">Discount ₹ (if any)</label>
                <input type="number" value={discountAmount || ''} onChange={e => setDiscountAmount(+e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>

              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <p className="text-lg font-bold text-purple-400">Total: {formatCurrency(totalAmount)}</p>
                {discountAmount > 0 && <p className="text-xs text-zinc-500 mt-0.5">After discount: {formatCurrency(totalAmount - discountAmount)}</p>}
              </div>

              <div><label className="block text-xs text-zinc-500 mb-1">Notes</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., Sunday rush, festival day"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium">{editing ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Sales List */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              <th className="text-left text-[11px] text-zinc-500 font-medium px-5 py-3">Date</th>
              <th className="text-right text-[11px] text-zinc-500 font-medium px-5 py-3">Cash</th>
              <th className="text-right text-[11px] text-zinc-500 font-medium px-5 py-3">UPI</th>
              <th className="text-right text-[11px] text-zinc-500 font-medium px-5 py-3">Card</th>
              <th className="text-right text-[11px] text-zinc-500 font-medium px-5 py-3">Total</th>
              <th className="text-left text-[11px] text-zinc-500 font-medium px-5 py-3">Notes</th>
              <th className="text-right text-[11px] text-zinc-500 font-medium px-5 py-3">Actions</th>
            </tr></thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-sm font-medium text-zinc-200">{formatDate(s.saleDate)}</td>
                  <td className="px-5 py-3 text-right text-sm text-emerald-400">{formatCurrency(s.cashAmount)}</td>
                  <td className="px-5 py-3 text-right text-sm text-blue-400">{formatCurrency(s.upiAmount)}</td>
                  <td className="px-5 py-3 text-right text-sm text-purple-400">{formatCurrency(s.cardAmount)}</td>
                  <td className="px-5 py-3 text-right text-sm font-bold text-zinc-100">{formatCurrency(s.totalAmount)}</td>
                  <td className="px-5 py-3 text-xs text-zinc-600 max-w-[150px] truncate">{s.notes || '-'}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-blue-400"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-zinc-600 text-sm">No sales recorded yet. Click &quot;Add Today&apos;s Sales&quot; to start.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
