'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, MATERIAL_CATEGORIES, MATERIAL_UNITS } from '@/lib/constants';

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
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', code: '', unit: 'pieces', category: 'brick', defaultRate: 0, gstRate: 0, hsnCode: '' });

  const fetchMaterials = async () => {
    try {
      const data = await api.get('/materials');
      setMaterials(data.materials);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/materials/${editing.id}`, form);
      } else {
        await api.post('/materials', form);
      }
      setShowForm(false); setEditing(null);
      setForm({ name: '', code: '', unit: 'pieces', category: 'brick', defaultRate: 0, gstRate: 0, hsnCode: '' });
      fetchMaterials();
    } catch (e: any) { alert(e.message); }
  };

  const handleEdit = (mat: Material) => {
    setEditing(mat);
    setForm({ name: mat.name, code: mat.code, unit: mat.unit, category: mat.category, defaultRate: mat.defaultRate, gstRate: mat.gstRate, hsnCode: mat.hsnCode || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this material?')) return;
    try { await api.delete(`/materials/${id}`); fetchMaterials(); } catch (e: any) { alert(e.message); }
  };

  const filtered = materials.filter(m => m.isActive && m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Materials</h1>
          <p className="text-sm text-zinc-500">Manage Power Brick materials and rates</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', code: '', unit: 'pieces', category: 'brick', defaultRate: 0, gstRate: 0, hsnCode: '' }); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25">
          <Plus className="w-4 h-4" /> Add Material
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 max-w-md">
        <Search className="w-4 h-4 text-zinc-600" />
        <input type="text" placeholder="Search materials..." value={search} onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none w-full" />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f0f1a] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">{editing ? 'Edit Material' : 'Add Material'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Code *</label>
                  <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                    {MATERIAL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Unit</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                    {MATERIAL_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Default Rate (₹)</label>
                  <input type="number" value={form.defaultRate} onChange={e => setForm({ ...form, defaultRate: +e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">GST Rate (%)</label>
                  <input type="number" value={form.gstRate} onChange={e => setForm({ ...form, gstRate: +e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all">{editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Materials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((mat, i) => (
          <motion.div key={mat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 group hover:border-orange-500/20 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(mat)} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-blue-400"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(mat.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">{mat.name}</h3>
            <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{mat.code}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-bold text-orange-400">{formatCurrency(mat.defaultRate)}</span>
              <span className="text-[10px] text-zinc-600">per {mat.unit}</span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-zinc-500">
              <span className="px-2 py-0.5 rounded-md bg-white/5">{MATERIAL_CATEGORIES.find(c => c.value === mat.category)?.label}</span>
              {mat.gstRate > 0 && <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">GST {mat.gstRate}%</span>}
            </div>
            {mat.stock && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-500">Stock</span>
                  <span className={mat.stock.quantity <= mat.stock.minLevel ? 'text-red-400 font-medium' : 'text-zinc-300'}>{mat.stock.quantity.toLocaleString()} {mat.unit}</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
