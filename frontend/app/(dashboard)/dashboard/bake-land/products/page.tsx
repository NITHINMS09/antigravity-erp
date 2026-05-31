'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CakeSlice, Plus, Pencil, Trash2, X, Search, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/constants';
import { useToast } from '@/components/Toast';

export default function BakeryProductsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const [form, setForm] = useState({ name: '', category: 'bread', unit: 'pieces', costPrice: 0, sellPrice: 0, stock: 0 });

  const fetchProducts = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await api.get('/bakery/products');
      setProducts(data.products);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      showToast('Failed to load products', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/bakery/products/${editing.id}`, form);
        showToast('Product updated successfully');
      } else {
        await api.post('/bakery/products', form);
        showToast('Product added successfully');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', category: 'bread', unit: 'pieces', costPrice: 0, sellPrice: 0, stock: 0 });
      fetchProducts(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category || 'bread',
      unit: p.unit || 'pieces',
      costPrice: p.costPrice || 0,
      sellPrice: p.sellPrice || 0,
      stock: p.stock || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/bakery/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Product deleted successfully');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const filtered = products.filter(p => 
    (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500/50" />
      <p className="text-sm text-zinc-500">Loading bakery products...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Bakery Products</h1>
          <p className="text-sm text-zinc-500">Manage BAKE LAND product catalog and stock levels</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', category: 'bread', unit: 'pieces', costPrice: 0, sellPrice: 0, stock: 0 }); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-purple-500/25 hover:from-purple-600 hover:to-purple-700 transition-all">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 max-w-md focus-within:border-purple-500/50 transition-colors">
        <Search className="w-4 h-4 text-zinc-600" />
        <input type="text" placeholder="Search by name or category..." value={search} onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none w-full" />
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-100">{editing ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Product Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none appearance-none">
                      {['bread', 'cake', 'pastry', 'snack', 'other'].map(c => <option key={c} value={c} className="bg-[#1a1a2e]">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Unit</label>
                    <input type="text" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none placeholder:text-zinc-700" placeholder="e.g. pieces, kg" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Cost Price ₹</label>
                    <input type="number" step="0.01" value={form.costPrice || ''} onChange={e => setForm({ ...form, costPrice: +e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Sell Price ₹</label>
                    <input type="number" step="0.01" value={form.sellPrice || ''} onChange={e => setForm({ ...form, sellPrice: +e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Current Stock</label>
                    <input type="number" value={form.stock || ''} onChange={e => setForm({ ...form, stock: +e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-sm font-medium hover:bg-white/5 transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} 
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-black shadow-lg shadow-purple-500/25">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editing ? 'Update' : 'Add')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 group hover:border-purple-500/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors" />
            
            <div className="flex items-start justify-between relative">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <CakeSlice className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(p)} className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/10 text-zinc-500 hover:text-blue-400 border border-transparent hover:border-blue-500/20 transition-all"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p.id, p.name)} className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="mt-4 relative">
              <h3 className="text-base font-bold text-zinc-100 group-hover:text-purple-400 transition-colors">{p.name}</h3>
              <span className="text-[10px] font-black bg-white/5 text-zinc-500 px-2 py-0.5 rounded-lg border border-white/5 uppercase tracking-widest mt-2 inline-block">
                {p.category}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 relative">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Cost</p>
                <p className="text-xs font-bold text-zinc-400 tracking-tighter">{formatCurrency(p.costPrice)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-purple-500/[0.03] transition-colors">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Sell</p>
                <p className="text-xs font-black text-purple-400 tracking-tighter">{formatCurrency(p.sellPrice)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Stock</p>
                <p className={`text-xs font-black tracking-tighter ${p.stock <= 5 ? 'text-red-400' : 'text-zinc-300'}`}>{p.stock} <span className="text-[9px] opacity-50 font-medium lowercase">{p.unit}</span></p>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
            <CakeSlice className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No bakery products found.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
