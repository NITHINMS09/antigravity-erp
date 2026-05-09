'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Warehouse, ArrowUp, ArrowDown, AlertTriangle, History } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';

interface StockItem {
  id: string; materialId: string; quantity: number; minLevel: number; maxLevel: number | null;
  material: { id: string; name: string; code: string; unit: string; category: string };
}

export default function StockPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustModal, setAdjustModal] = useState<StockItem | null>(null);
  const [adjustForm, setAdjustForm] = useState({ quantity: 0, type: 'IN', notes: '' });

  useEffect(() => {
    api.get('/stock').then(d => setStock(d.stock)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModal) return;
    try {
      await api.post('/stock/adjust', { materialId: adjustModal.materialId, ...adjustForm });
      const d = await api.get('/stock');
      setStock(d.stock);
      setAdjustModal(null);
    } catch (e: any) { alert(e.message); }
  };

  const chartData = stock.map(s => ({ name: s.material.name.replace(' ', '\n'), stock: s.quantity, min: s.minLevel }));
  const lowStockCount = stock.filter(s => s.quantity <= s.minLevel).length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Stock Management</h1>
        <p className="text-sm text-zinc-500">Live inventory levels for Power Brick</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-zinc-500">Total Items</p>
          <p className="text-xl font-bold text-zinc-100 mt-1">{stock.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
          <p className="text-xs text-zinc-500">Healthy Stock</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{stock.length - lowStockCount}</p>
        </div>
        <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4">
          <p className="text-xs text-zinc-500">Low Stock</p>
          <p className="text-xl font-bold text-red-400 mt-1">{lowStockCount}</p>
        </div>
        <div className="rounded-xl border border-orange-500/10 bg-orange-500/5 p-4">
          <p className="text-xs text-zinc-500">Total Value</p>
          <p className="text-xl font-bold text-orange-400 mt-1">Live</p>
        </div>
      </div>

      {/* Stock chart */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Stock Levels Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="name" stroke="#333" fontSize={9} interval={0} />
            <YAxis stroke="#333" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
            <Bar dataKey="stock" fill="#f97316" radius={[6, 6, 0, 0]} />
            <Bar dataKey="min" fill="#ef4444" radius={[6, 6, 0, 0]} opacity={0.3} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stock table */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[11px] text-zinc-500 font-medium px-5 py-3">Material</th>
                <th className="text-right text-[11px] text-zinc-500 font-medium px-5 py-3">Current Stock</th>
                <th className="text-right text-[11px] text-zinc-500 font-medium px-5 py-3">Min Level</th>
                <th className="text-center text-[11px] text-zinc-500 font-medium px-5 py-3">Status</th>
                <th className="text-right text-[11px] text-zinc-500 font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((s) => {
                const isLow = s.quantity <= s.minLevel;
                return (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <Warehouse className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{s.material.name}</p>
                          <p className="text-[10px] text-zinc-600 font-mono">{s.material.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right px-5 py-3">
                      <span className={`text-sm font-semibold ${isLow ? 'text-red-400' : 'text-zinc-200'}`}>{s.quantity.toLocaleString()}</span>
                      <span className="text-[10px] text-zinc-600 ml-1">{s.material.unit}</span>
                    </td>
                    <td className="text-right px-5 py-3 text-sm text-zinc-500">{s.minLevel.toLocaleString()}</td>
                    <td className="text-center px-5 py-3">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-medium">
                          <AlertTriangle className="w-3 h-3" /> Low
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">Healthy</span>
                      )}
                    </td>
                    <td className="text-right px-5 py-3">
                      <button onClick={() => { setAdjustModal(s); setAdjustForm({ quantity: 0, type: 'IN', notes: '' }); }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-all">
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setAdjustModal(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f1a] p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-100 mb-1">Adjust Stock</h2>
            <p className="text-sm text-zinc-500 mb-4">{adjustModal.material.name} — Current: {adjustModal.quantity} {adjustModal.material.unit}</p>
            <form onSubmit={handleAdjust} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {['IN', 'OUT', 'WASTAGE', 'ADJUSTMENT'].map(t => (
                  <button key={t} type="button" onClick={() => setAdjustForm({ ...adjustForm, type: t })}
                    className={`py-2 rounded-xl text-sm font-medium transition-all ${adjustForm.type === t ? 'bg-orange-500 text-white' : 'bg-white/5 border border-white/10 text-zinc-400'}`}>
                    {t === 'IN' && <ArrowUp className="w-3 h-3 inline mr-1" />}
                    {t === 'OUT' && <ArrowDown className="w-3 h-3 inline mr-1" />}
                    {t}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Quantity</label>
                <input type="number" value={adjustForm.quantity} onChange={e => setAdjustForm({ ...adjustForm, quantity: +e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" required />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Notes</label>
                <input type="text" value={adjustForm.notes} onChange={e => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setAdjustModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium">Update Stock</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
