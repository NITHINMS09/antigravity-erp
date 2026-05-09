// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CakeSlice, Plus } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/constants';

export default function BakeryProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'bread', unit: 'pieces', costPrice: 0, sellPrice: 0, stock: 0 });

  useEffect(() => { api.get('/bakery/products').then(d => setProducts(d.products)).finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/bakery/products', form);
    setShowForm(false); setForm({ name: '', category: 'bread', unit: 'pieces', costPrice: 0, sellPrice: 0, stock: 0 });
    const d = await api.get('/bakery/products'); setProducts(d.products);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-zinc-100">Bakery Products</h1><p className="text-sm text-zinc-500">Manage BAKE LAND product catalog</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-purple-500/25"><Plus className="w-4 h-4" /> Add Product</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f0f1a] p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Add Bakery Product</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-zinc-500 mb-1">Name *</label><input type="text" value={form.name} onChange={e => setForm({...form,name:e.target.value})} required className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
                <div><label className="block text-xs text-zinc-500 mb-1">Category</label>
                  <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                    {['bread','cake','pastry','snack','other'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs text-zinc-500 mb-1">Cost Price ₹</label><input type="number" value={form.costPrice||''} onChange={e=>setForm({...form,costPrice:+e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
                <div><label className="block text-xs text-zinc-500 mb-1">Sell Price ₹</label><input type="number" value={form.sellPrice||''} onChange={e=>setForm({...form,sellPrice:+e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
                <div><label className="block text-xs text-zinc-500 mb-1">Stock</label><input type="number" value={form.stock||''} onChange={e=>setForm({...form,stock:+e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium">Add</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-purple-500/10 bg-purple-500/5 p-5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3"><CakeSlice className="w-5 h-5 text-purple-400" /></div>
            <h3 className="text-sm font-semibold text-zinc-200">{p.name}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-500">{p.category}</span>
            <div className="mt-3 flex justify-between">
              <div><p className="text-[10px] text-zinc-600">Cost</p><p className="text-sm text-zinc-400">{formatCurrency(p.costPrice)}</p></div>
              <div><p className="text-[10px] text-zinc-600">Sell</p><p className="text-sm font-semibold text-purple-400">{formatCurrency(p.sellPrice)}</p></div>
              <div><p className="text-[10px] text-zinc-600">Stock</p><p className="text-sm text-zinc-300">{p.stock}</p></div>
            </div>
          </motion.div>
        ))}
        {products.length === 0 && <div className="col-span-full text-center py-12 text-zinc-600 text-sm">No products yet. Add your first bakery product!</div>}
      </div>
    </motion.div>
  );
}
