// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Plus, Zap, Home, Droplets, Trash2, Pencil, X, Search, Loader2, Calendar, Tag, CreditCard, Building2, Wallet } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate, EXPENSE_CATEGORIES } from '@/lib/constants';
import { useToast } from '@/components/Toast';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const [form, setForm] = useState({ 
    title: '', amount: 0, category: 'miscellaneous', 
    business: 'HOME', description: '', paymentMethod: 'cash', 
    expenseDate: new Date().toISOString().split('T')[0] 
  });

  const fetchExpenses = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await api.get('/expenses');
      setExpenses(data.expenses);
    } catch (e) {
      showToast('Failed to load expenses', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, month: form.expenseDate.slice(0, 7) };
      if (editing) {
        await api.put(`/expenses/${editing.id}`, payload);
        showToast('Expense updated successfully');
      } else {
        await api.post('/expenses', payload);
        showToast('Expense recorded successfully');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ title: '', amount: 0, category: 'miscellaneous', business: 'HOME', description: '', paymentMethod: 'cash', expenseDate: new Date().toISOString().split('T')[0] });
      fetchExpenses(true);
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense: any) => {
    setEditing(expense);
    setForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      business: expense.business,
      description: expense.description || '',
      paymentMethod: expense.paymentMethod || 'cash',
      expenseDate: expense.expenseDate ? expense.expenseDate.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDeleteExpense = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete expense "${title}"?`)) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e.id !== id));
      showToast('Expense deleted successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete expense', 'error');
    }
  };

  const filtered = expenses.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    e.category.toLowerCase().includes(search.toLowerCase()) ||
    e.business.toLowerCase().includes(search.toLowerCase())
  );

  const totalThisMonth = filtered.reduce((s, e) => s + e.amount, 0);
  const byCategory: Record<string, number> = {};
  filtered.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500/50" />
      <p className="text-sm text-zinc-500">Loading expenses...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Expenses</h1>
          <p className="text-sm text-zinc-500">Track business operations and personal spending</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ title: '', amount: 0, category: 'miscellaneous', business: 'HOME', description: '', paymentMethod: 'cash', expenseDate: new Date().toISOString().split('T')[0] }); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-orange-700 transition-all">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 group hover:border-orange-500/30 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4"><Banknote className="w-5 h-5 text-orange-400" /></div>
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Total Active</p>
          <p className="text-2xl font-black text-white mt-1 tracking-tighter">{formatCurrency(totalThisMonth)}</p>
        </div>
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 group hover:border-amber-500/30 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4"><Zap className="w-5 h-5 text-amber-400" /></div>
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Electricity</p>
          <p className="text-2xl font-black text-white mt-1 tracking-tighter">{formatCurrency(byCategory['electricity'] || 0)}</p>
        </div>
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 group hover:border-blue-500/30 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4"><Home className="w-5 h-5 text-blue-400" /></div>
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Home</p>
          <p className="text-2xl font-black text-white mt-1 tracking-tighter">{formatCurrency(byCategory['home'] || 0)}</p>
        </div>
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 group hover:border-cyan-500/30 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4"><Droplets className="w-5 h-5 text-cyan-400" /></div>
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Water / Other</p>
          <p className="text-2xl font-black text-white mt-1 tracking-tighter">{formatCurrency(byCategory['water'] || 0)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 max-w-md focus-within:border-orange-500/50 transition-colors">
        <Search className="w-4 h-4 text-zinc-600" />
        <input type="text" placeholder="Search by title, category or business..." value={search} onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none w-full" />
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-100">{editing ? 'Edit Expense' : 'Record Expense'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Expense Title *</label>
                    <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Amount ₹ *</label>
                    <input type="number" step="0.01" value={form.amount || ''} onChange={e => setForm({ ...form, amount: +e.target.value })} required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none appearance-none">
                      {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-[#1a1a2e]">{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Date</label>
                    <input type="date" value={form.expenseDate} onChange={e => setForm({ ...form, expenseDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Business / Entity</label>
                    <select value={form.business} onChange={e => setForm({ ...form, business: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none appearance-none">
                      <option value="HOME" className="bg-[#1a1a2e]">🏠 Home / Personal</option>
                      <option value="POWER_BRICK" className="bg-[#1a1a2e]">🧱 Power Brick</option>
                      <option value="BAKE_LAND" className="bg-[#1a1a2e]">🍞 Bake Land</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Description / Notes</label>
                    <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-sm font-medium hover:bg-white/5">Cancel</button>
                  <button type="submit" disabled={submitting} 
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-black shadow-lg shadow-orange-500/25">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editing ? 'Update' : 'Add')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Expense</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center">Business</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filtered.map((e, i) => (
                <tr key={e.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-200 group-hover:text-orange-400 transition-colors">{e.title}</span>
                      <span className="text-[10px] text-zinc-600 font-medium flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3" /> {formatDate(e.expenseDate || e.createdAt)}</span>
                      {e.description && <span className="text-[10px] text-zinc-500 italic mt-1">{e.description}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter bg-white/5 text-zinc-500 border border-white/5 flex items-center gap-1.5 justify-center w-fit mx-auto">
                      <Tag className="w-3 h-3" /> {e.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                       e.business === 'POWER_BRICK' ? 'bg-orange-500/10 text-orange-400 border-orange-500/10' : 
                       e.business === 'BAKE_LAND' ? 'bg-purple-500/10 text-purple-400 border-purple-500/10' :
                       'bg-blue-500/10 text-blue-400 border-blue-500/10'
                     } flex items-center gap-1.5 justify-center w-fit mx-auto`}>
                      <Building2 className="w-3 h-3" /> {e.business}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-white tracking-tight">{formatCurrency(e.amount)}</span>
                      <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5"><Wallet className="w-3 h-3" /> {e.paymentMethod || 'cash'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(e)} 
                        className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/10 text-zinc-500 hover:text-blue-400 border border-transparent hover:border-blue-500/20 transition-all"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteExpense(e.id, e.title)} 
                        className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-zinc-600 text-sm font-medium italic">No expenses found matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
