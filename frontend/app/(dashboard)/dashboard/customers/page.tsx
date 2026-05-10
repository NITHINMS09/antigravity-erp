// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Phone, Search, IndianRupee, Trash2, Pencil, X, Loader2, Mail, MapPin, Building2 } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/constants';
import { useToast } from '@/components/Toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const [form, setForm] = useState({ 
    name: '', phone: '', email: '', address: '', 
    gstNumber: '', business: 'POWER_BRICK' 
  });

  const fetchCustomers = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await api.get('/customers');
      setCustomers(data.customers);
    } catch (e) {
      showToast('Failed to load customers', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer "${name}"?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      setCustomers(prev => prev.filter(c => c.id !== id));
      showToast('Customer deleted successfully');
    } catch (err: any) {
      showToast(err.response?.data?.error || err.message || 'Failed to delete customer', 'error');
    }
  };

  const handleEdit = (customer: any) => {
    setEditing(customer);
    setForm({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      gstNumber: customer.gstNumber || '',
      business: customer.business
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/customers/${editing.id}`, form);
        showToast('Customer updated successfully');
      } else {
        await api.post('/customers', form);
        showToast('Customer added successfully');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', phone: '', email: '', address: '', gstNumber: '', business: 'POWER_BRICK' });
      fetchCustomers(true);
    } catch (err: any) {
      showToast(err.response?.data?.error || err.message || 'Action failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search) ||
    c.business.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500/50" />
      <p className="text-sm text-zinc-500">Loading customers...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Customers</h1>
          <p className="text-sm text-zinc-500">Manage directory and outstanding dues</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', phone: '', email: '', address: '', gstNumber: '', business: 'POWER_BRICK' }); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 max-w-md focus-within:border-orange-500/50 transition-colors">
        <Search className="w-4 h-4 text-zinc-600" />
        <input type="text" placeholder="Search by name, phone or business..." value={search} onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none w-full" />
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-100">{editing ? 'Edit Customer' : 'Add Customer'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Full Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Phone Number</label>
                    <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Business</label>
                    <select value={form.business} onChange={e => setForm({ ...form, business: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none">
                      <option value="POWER_BRICK" className="bg-[#1a1a2e]">🧱 Power Brick</option>
                      <option value="BAKE_LAND" className="bg-[#1a1a2e]">🍞 Bake Land</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Email Address</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Address</label>
                    <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">GST Number</label>
                    <input type="text" value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} 
                    className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-sm font-medium hover:bg-white/5 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editing ? 'Update' : 'Add')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 group hover:border-orange-500/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
            
            <div className="flex items-start justify-between relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(c)} className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/10 text-zinc-500 hover:text-blue-400 border border-transparent hover:border-blue-500/20"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteCustomer(c.id, c.name)} className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-transparent hover:border-red-500/20"><Trash2 className="w-4 h-4" /></button>
                </div>
                {c.totalDue > 0 && (
                  <span className="text-[10px] font-black bg-red-500/10 text-red-400 px-2.5 py-1 rounded-lg border border-red-500/10 shadow-lg shadow-red-500/5">
                    DUE: {formatCurrency(c.totalDue)}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 relative">
              <h3 className="text-base font-bold text-zinc-100 group-hover:text-orange-400 transition-colors">{c.name}</h3>
              <div className="mt-3 space-y-2">
                {c.phone && <p className="text-xs text-zinc-500 flex items-center gap-2 font-medium"><Phone className="w-3.5 h-3.5 opacity-50" />{c.phone}</p>}
                {c.email && <p className="text-xs text-zinc-500 flex items-center gap-2 font-medium"><Mail className="w-3.5 h-3.5 opacity-50" />{c.email}</p>}
                {c.address && <p className="text-xs text-zinc-500 flex items-center gap-2 font-medium"><MapPin className="w-3.5 h-3.5 opacity-50" />{c.address}</p>}
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between relative">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-tighter ${
                  c.business === 'POWER_BRICK' ? 'bg-orange-500/10 text-orange-400 border-orange-500/10' : 'bg-purple-500/10 text-purple-400 border-purple-500/10'
                }`}>
                  {c.business === 'POWER_BRICK' ? '🧱 Power Brick' : '🍞 Bake Land'}
                </span>
                {c.gstNumber && <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/10 uppercase tracking-tighter">GST</span>}
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
            <Users className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No customers found matching your search.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
