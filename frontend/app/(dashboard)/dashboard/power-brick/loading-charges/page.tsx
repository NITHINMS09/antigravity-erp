
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BoltIcon, Plus, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/constants';

export default function LoadingChargesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [charges, setCharges] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ materialId: '', rate: 0, unit: 'per_ton', description: '' });

  const fetchData = async () => {
    try {
      const [c, m] = await Promise.all([api.get('/loading-charges'), api.get('/materials')]);
      setCharges(c.charges);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMaterials(m.materials.filter((mm: any) => mm.isActive));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/loading-charges/${editing.id}`, form);
      } else {
        await api.post('/loading-charges', form);
      }
      setShowForm(false); setEditing(null);
      setForm({ materialId: '', rate: 0, unit: 'per_ton', description: '' });
      fetchData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { alert(err.message); }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (charge: any) => {
    setEditing(charge);
    setForm({ materialId: charge.materialId, rate: charge.rate, unit: charge.unit, description: charge.description || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this loading charge?')) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try { await api.delete(`/loading-charges/${id}`); fetchData(); } catch (e: any) { alert(e.message); }
  };

  const unitLabels: Record<string, string> = { per_piece: 'Per Piece', per_ton: 'Per Ton', per_bag: 'Per Bag', per_trip: 'Per Trip' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-zinc-100">Loading Charges</h1><p className="text-sm text-zinc-500">Configure loading charges per material type</p></div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ materialId: '', rate: 0, unit: 'per_ton', description: '' }); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium shadow-lg shadow-orange-500/25"><Plus className="w-4 h-4" /> Add Charge</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f1a] p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">{editing ? 'Edit Loading Charge' : 'Add Loading Charge'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Material *</label>
                <select value={form.materialId} onChange={e => setForm({ ...form, materialId: e.target.value })} required
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                  <option value="">Select Material</option>
                  {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Rate (₹) *</label>
                  <input type="number" step="0.01" value={form.rate || ''} onChange={e => setForm({ ...form, rate: +e.target.value })} required
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Unit</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                    <option value="per_piece">Per Piece</option>
                    <option value="per_ton">Per Ton</option>
                    <option value="per_bag">Per Bag</option>
                    <option value="per_trip">Per Trip</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" placeholder="e.g., Cement bag loading to truck" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium">{editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Charges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {charges.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-amber-500/20 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><BoltIcon className="w-5 h-5 text-amber-400" /></div>
              <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(c)} className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-zinc-500 hover:text-blue-400 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(c.id)} className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-zinc-500 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">{c.material?.name} Loading</h3>
            {c.description && <p className="text-[10px] text-zinc-600 mt-0.5">{c.description}</p>}
            <p className="text-xl font-bold text-orange-400 mt-2">{formatCurrency(c.rate)}</p>
            <p className="text-[10px] text-zinc-600">{unitLabels[c.unit] || c.unit}</p>
          </motion.div>
        ))}
        {charges.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <BoltIcon className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No loading charges configured yet.</p>
            <p className="text-xs text-zinc-600 mt-1">Click &quot;Add Charge&quot; to set rates for material loading.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
