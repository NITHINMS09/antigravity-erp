'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Package, Search, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, MATERIAL_CATEGORIES, MATERIAL_UNITS } from '@/lib/constants';
import { useToast } from '@/components/Toast';

interface Material {
  id: string; name: string; code: string; unit: string; category: string;
  defaultRate: number; gstRate: number; hsnCode: string | null; isActive: boolean;
  sortOrder: number; stock?: { quantity: number; minLevel: number };
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const [form, setForm] = useState({ 
    name: '', code: '', unit: 'pieces', category: 'brick', 
    defaultRate: 0, gstRate: 0, hsnCode: '', currentStock: 0 
  });

  const fetchMaterials = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await api.get('/materials');
      setMaterials(data.materials);
    } catch (e) { 
      console.error(e);
      showToast('Failed to load materials', 'error');
    } finally { 
      if (!isSilent) setLoading(false); 
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchMaterials(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/materials/${editing.id}`, form);
        showToast('Material updated successfully');
      } else {
        await api.post('/materials', { ...form, initialStock: form.currentStock });
        showToast('Material added successfully');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', code: '', unit: 'pieces', category: 'brick', defaultRate: 0, gstRate: 0, hsnCode: '', currentStock: 0 });
      fetchMaterials(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) { 
      showToast(e.response?.data?.error || e.message || 'Action failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (mat: Material) => {
    setEditing(mat);
    setForm({ 
      name: mat.name, 
      code: mat.code, 
      unit: mat.unit, 
      category: mat.category, 
      defaultRate: mat.defaultRate, 
      gstRate: mat.gstRate, 
      hsnCode: mat.hsnCode || '',
      currentStock: mat.stock?.quantity || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"? This action cannot be undone.`)) return;
    try { 
      await api.delete(`/materials/${id}`); 
      setMaterials(prev => prev.filter(m => m.id !== id));
      showToast('Material deleted successfully');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) { 
      showToast(e.response?.data?.error || e.message || 'Failed to delete material', 'error'); 
    }
  };

  const filtered = materials.filter(m => m.isActive && (
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.code.toLowerCase().includes(search.toLowerCase())
  ));

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500/50" />
      <p className="text-sm text-zinc-500">Loading materials...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Materials</h1>
          <p className="text-sm text-zinc-500">Manage catalog and stock rates</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', code: '', unit: 'pieces', category: 'brick', defaultRate: 0, gstRate: 0, hsnCode: '', currentStock: 0 }); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25">
          <Plus className="w-4 h-4" /> Add Material
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 max-w-md focus-within:border-orange-500/50 transition-colors">
        <Search className="w-4 h-4 text-zinc-600" />
        <input type="text" placeholder="Search materials by name or code..." value={search} onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none w-full" />
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-100">{editing ? 'Edit Material' : 'Add Material'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Material Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Code *</label>
                    <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none">
                      {MATERIAL_CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-[#1a1a2e]">{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Unit</label>
                    <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none">
                      {MATERIAL_UNITS.map(u => <option key={u.value} value={u.value} className="bg-[#1a1a2e]">{u.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Current Stock</label>
                    <input type="number" value={form.currentStock} onChange={e => setForm({ ...form, currentStock: +e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Default Rate (₹)</label>
                    <input type="number" value={form.defaultRate} onChange={e => setForm({ ...form, defaultRate: +e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">GST Rate (%)</label>
                    <input type="number" value={form.gstRate} onChange={e => setForm({ ...form, gstRate: +e.target.value })}
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
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editing ? 'Update Material' : 'Add Material')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((mat, i) => (
          <motion.div key={mat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 group hover:border-orange-500/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors" />
            
            <div className="flex items-start justify-between mb-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-400" />
              </div>
              <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(mat)} className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-blue-500/10 text-zinc-500 hover:text-blue-400 transition-all border border-transparent hover:border-blue-500/20"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(mat.id, mat.name)} className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="relative">
              <h3 className="text-base font-bold text-zinc-100 group-hover:text-orange-400 transition-colors">{mat.name}</h3>
              <p className="text-[11px] text-zinc-500 font-mono tracking-wider mt-0.5">{mat.code}</p>
            </div>

            <div className="mt-5 flex items-end justify-between relative">
              <div>
                <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest mb-1">Rate</p>
                <span className="text-xl font-black text-white">{formatCurrency(mat.defaultRate)}</span>
                <span className="text-xs text-zinc-500 ml-1.5">/ {mat.unit}</span>
              </div>
              
              {mat.stock && (
                <div className="text-right">
                  <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest mb-1">Available</p>
                  <p className={`text-sm font-bold ${mat.stock.quantity <= mat.stock.minLevel ? 'text-red-400' : 'text-zinc-300'}`}>
                    {mat.stock.quantity.toLocaleString()} <span className="text-[10px] font-medium opacity-50">{mat.unit}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-5 border-t border-white/5 flex items-center gap-3 relative">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter border border-white/5">
                {MATERIAL_CATEGORIES.find(c => c.value === mat.category)?.label}
              </span>
              {mat.gstRate > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-tighter border border-emerald-500/10">
                  GST {mat.gstRate}%
                </span>
              )}
            </div>
          </motion.div>
        ))}
        
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
            <Package className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No materials found matching your search.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
