'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Banknote, Plus, Zap, Home, Droplets } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate, EXPENSE_CATEGORIES } from '@/lib/constants';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', amount: 0, category: 'miscellaneous', business: 'HOME', description: '', paymentMethod: 'cash', expenseDate: new Date().toISOString().split('T')[0] });

  useEffect(() => { api.get('/expenses').then(d => setExpenses(d.expenses)).finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/expenses', { ...form, month: form.expenseDate.slice(0, 7) });
    setShowForm(false); setForm({ title: '', amount: 0, category: 'miscellaneous', business: 'HOME', description: '', paymentMethod: 'cash', expenseDate: new Date().toISOString().split('T')[0] });
    const d = await api.get('/expenses'); setExpenses(d.expenses);
  };

  const totalThisMonth = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory: Record<string, number> = {};
  expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-zinc-100">Expenses</h1><p className="text-sm text-zinc-500">Track all business and personal expenses</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium shadow-lg shadow-orange-500/25"><Plus className="w-4 h-4" /> Add Expense</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4"><p className="text-xs text-zinc-500">Total This Month</p><p className="text-xl font-bold text-zinc-100 mt-1">{formatCurrency(totalThisMonth)}</p></div>
        <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4"><p className="text-xs text-zinc-500 flex items-center gap-1"><Zap className="w-3 h-3" /> Electricity</p><p className="text-xl font-bold text-amber-400 mt-1">{formatCurrency(byCategory['electricity'] || 0)}</p></div>
        <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4"><p className="text-xs text-zinc-500 flex items-center gap-1"><Home className="w-3 h-3" /> Home</p><p className="text-xl font-bold text-blue-400 mt-1">{formatCurrency(byCategory['home'] || 0)}</p></div>
        <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4"><p className="text-xs text-zinc-500 flex items-center gap-1"><Droplets className="w-3 h-3" /> Water</p><p className="text-xl font-bold text-cyan-400 mt-1">{formatCurrency(byCategory['water'] || 0)}</p></div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f1a] p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Add Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="block text-xs text-zinc-500 mb-1">Title *</label><input type="text" value={form.title} onChange={e => setForm({...form,title:e.target.value})} required className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              <div><label className="block text-xs text-zinc-500 mb-1">Amount ₹ *</label><input type="number" value={form.amount||''} onChange={e => setForm({...form,amount:+e.target.value})} required className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              <div><label className="block text-xs text-zinc-500 mb-1">Category</label>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                  {EXPENSE_CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div><label className="block text-xs text-zinc-500 mb-1">Business</label>
                <select value={form.business} onChange={e=>setForm({...form,business:e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                  <option value="HOME">Home / Personal</option><option value="POWER_BRICK">Power Brick</option><option value="BAKE_LAND">Bake Land</option>
                </select>
              </div>
              <div><label className="block text-xs text-zinc-500 mb-1">Date</label><input type="date" value={form.expenseDate} onChange={e => setForm({...form,expenseDate:e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              <div><label className="block text-xs text-zinc-500 mb-1">Description</label><input type="text" value={form.description} onChange={e => setForm({...form,description:e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium">Add</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/5">
            <th className="text-left text-[11px] text-zinc-500 font-medium px-5 py-3">Expense</th>
            <th className="text-left text-[11px] text-zinc-500 font-medium px-5 py-3">Category</th>
            <th className="text-left text-[11px] text-zinc-500 font-medium px-5 py-3">Date</th>
            <th className="text-right text-[11px] text-zinc-500 font-medium px-5 py-3">Amount</th>
          </tr></thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-5 py-3"><p className="text-sm text-zinc-200">{e.title}</p>{e.description && <p className="text-[10px] text-zinc-600">{e.description}</p>}</td>
                <td className="px-5 py-3"><span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400">{e.category}</span></td>
                <td className="px-5 py-3 text-sm text-zinc-500">{formatDate(e.createdAt)}</td>
                <td className="px-5 py-3 text-right text-sm font-semibold text-red-400">{formatCurrency(e.amount)}</td>
              </tr>
            ))}
            {expenses.length === 0 && <tr><td colSpan={4} className="px-5 py-12 text-center text-zinc-600 text-sm">No expenses recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
