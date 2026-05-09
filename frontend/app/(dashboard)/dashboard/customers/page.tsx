'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Phone, Search, IndianRupee } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/constants';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', gstNumber: '', business: 'POWER_BRICK' });

  useEffect(() => { api.get('/customers').then(d => setCustomers(d.customers)).finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/customers', form);
    setShowForm(false);
    setForm({ name: '', phone: '', email: '', address: '', gstNumber: '', business: 'POWER_BRICK' });
    const d = await api.get('/customers');
    setCustomers(d.customers);
  };

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-zinc-100">Customers</h1><p className="text-sm text-zinc-500">Manage all customers and dues</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium shadow-lg shadow-orange-500/25"><Plus className="w-4 h-4" /> Add Customer</button>
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 max-w-md">
        <Search className="w-4 h-4 text-zinc-600" />
        <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none w-full" />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f0f1a] p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Add Customer</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[{l:'Name *',k:'name',r:true},{l:'Phone',k:'phone'},{l:'Email',k:'email'},{l:'Address',k:'address'},{l:'GST Number',k:'gstNumber'}].map(f=>(
                <div key={f.k}><label className="block text-xs text-zinc-500 mb-1">{f.l}</label>
                <input type="text" value={(form as any)[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} required={f.r}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" /></div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium">Add</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-orange-500/20 transition-all">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Users className="w-5 h-5 text-blue-400" /></div>
              {c.totalDue > 0 && <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">Due: {formatCurrency(c.totalDue)}</span>}
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mt-3">{c.name}</h3>
            {c.phone && <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{c.phone}</p>}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-zinc-500">{c.business === 'POWER_BRICK' ? '🧱 Power Brick' : '🍞 Bake Land'}</span>
              {c.gstNumber && <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">GST</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
