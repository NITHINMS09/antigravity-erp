// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Plus, X } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/constants';

export default function TransportPage() {
  const [transports, setTransports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    vehicleNumber: '', vehicleType: 'tractor', driverName: '',
    fromLocation: '', toLocation: '', charge: 0, dieselCost: 0,
    otherExpenses: 0, customerName: '', notes: '',
    tripDate: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    try { const d = await api.get('/transport'); setTransports(d.transports); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/transport', form);
    setShowForm(false);
    setForm({ vehicleNumber: '', vehicleType: 'tractor', driverName: '', fromLocation: '', toLocation: '', charge: 0, dieselCost: 0, otherExpenses: 0, customerName: '', notes: '', tripDate: new Date().toISOString().split('T')[0] });
    fetchData();
  };

  const totalCharges = transports.reduce((s, t) => s + t.totalCost, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-zinc-100">Transport</h1><p className="text-sm text-zinc-500">Track deliveries, vehicles & fuel costs</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium shadow-lg shadow-orange-500/25"><Plus className="w-4 h-4" /> Add Trip</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4"><p className="text-xs text-zinc-500">Total Trips</p><p className="text-xl font-bold text-zinc-100 mt-1">{transports.length}</p></div>
        <div className="rounded-xl border border-pink-500/10 bg-pink-500/5 p-4"><p className="text-xs text-zinc-500">Total Cost</p><p className="text-xl font-bold text-pink-400 mt-1">{formatCurrency(totalCharges)}</p></div>
        <div className="rounded-xl border border-orange-500/10 bg-orange-500/5 p-4"><p className="text-xs text-zinc-500">Total Diesel</p><p className="text-xl font-bold text-orange-400 mt-1">{formatCurrency(transports.reduce((s, t) => s + t.dieselCost, 0))}</p></div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f0f1a] p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-100">Add Transport Trip</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="block text-xs text-zinc-500 mb-1">Trip Date</label>
                <input type="date" value={form.tripDate} onChange={e => setForm({ ...form, tripDate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                {[{ l: 'Vehicle No.', k: 'vehicleNumber' }, { l: 'Driver', k: 'driverName' }, { l: 'From', k: 'fromLocation' }, { l: 'To', k: 'toLocation' }, { l: 'Customer', k: 'customerName' }].map(f => (
                  <div key={f.k}><label className="block text-xs text-zinc-500 mb-1">{f.l}</label><input type="text" value={(form as any)[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
                ))}
                <div><label className="block text-xs text-zinc-500 mb-1">Type</label>
                  <select value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                    {['tractor', 'truck', 'pickup', 'other'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{ l: 'Charge ₹', k: 'charge' }, { l: 'Diesel ₹', k: 'dieselCost' }, { l: 'Other ₹', k: 'otherExpenses' }].map(f => (
                  <div key={f.k}><label className="block text-xs text-zinc-500 mb-1">{f.l}</label><input type="number" value={(form as any)[f.k] || ''} onChange={e => setForm({ ...form, [f.k]: +e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <p className="text-sm font-bold text-orange-400">Total: {formatCurrency(form.charge + form.dieselCost + form.otherExpenses)}</p>
              </div>
              <div><label className="block text-xs text-zinc-500 mb-1">Notes</label><input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium">Add Trip</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Trip cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {transports.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center"><Truck className="w-4 h-4 text-pink-400" /></div>
              <div><p className="text-sm font-semibold text-zinc-200">{t.vehicleNumber || t.vehicleType}</p><p className="text-[10px] text-zinc-600">{formatDate(t.tripDate)}</p></div>
              <span className="ml-auto text-sm font-bold text-orange-400">{formatCurrency(t.totalCost)}</span>
            </div>
            {t.fromLocation && <p className="text-xs text-zinc-500">{t.fromLocation} → {t.toLocation}</p>}
            {t.customerName && <p className="text-xs text-zinc-500 mt-1">Customer: {t.customerName}</p>}
            <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-600">
              <span>Charge: {formatCurrency(t.charge)}</span>
              <span>Diesel: {formatCurrency(t.dieselCost)}</span>
            </div>
          </motion.div>
        ))}
        {transports.length === 0 && <div className="col-span-full text-center py-12 text-zinc-600 text-sm">No transport records yet.</div>}
      </div>
    </motion.div>
  );
}
