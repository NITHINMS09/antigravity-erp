'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HardHat, Plus, Calendar, IndianRupee, Pencil, X, Trash2, Users, Search, Loader2, Phone, History, CheckCircle2, Wallet } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/constants';
import { useToast } from '@/components/Toast';

export default function BakeLandWorkersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddWorker, setShowAddWorker] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingWorker, setEditingWorker] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [showAttendance, setShowAttendance] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [showPayment, setShowPayment] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [showHistory, setShowHistory] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [workerDetail, setWorkerDetail] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showTeamWork, setShowTeamWork] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const [workerForm, setWorkerForm] = useState({ name: '', phone: '', address: '', ratePerPunch: 0, business: 'BAKE_LAND' });
  const [attForm, setAttForm] = useState({ punchCount: 0, isPresent: true, notes: '', date: new Date().toISOString().split('T')[0] });
  const [payForm, setPayForm] = useState({ amount: 0, type: 'salary', method: 'cash', notes: '' });
  const [teamForm, setTeamForm] = useState({ date: new Date().toISOString().split('T')[0], punches: 0, notes: '', selectedWorkerIds: [] as string[] });

  const fetchWorkers = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const d = await api.get('/workers?business=BAKE_LAND');
      setWorkers(d.workers);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      showToast('Failed to load workers', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchWorkers(); }, []);

  const handleWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingWorker) {
        await api.put(`/workers/${editingWorker.id}`, workerForm);
        showToast('Staff details updated');
      } else {
        await api.post('/workers', workerForm);
        showToast('Staff member added');
      }
      setShowAddWorker(false);
      setEditingWorker(null);
      setWorkerForm({ name: '', phone: '', address: '', ratePerPunch: 0, business: 'BAKE_LAND' });
      fetchWorkers(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      showToast(e.response?.data?.error || e.message || 'Action failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/workers/${showAttendance.id}/attendance`, attForm);
      setShowAttendance(null);
      showToast('Daily work recorded');
      fetchWorkers(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      showToast(e.response?.data?.error || e.message || 'Failed to save', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payForm.amount <= 0) return showToast('Enter valid amount', 'error');
    setSubmitting(true);
    try {
      await api.post(`/workers/${showPayment.id}/payment`, payForm);
      setShowPayment(null);
      showToast('Payment recorded successfully');
      fetchWorkers(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewHistory = async (worker: any) => {
    setShowHistory(worker);
    setWorkerDetail(null);
    try {
      const d = await api.get(`/workers/${worker.id}`);
      setWorkerDetail(d.worker);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      showToast('Failed to load history', 'error');
    }
  };

  const handleDeleteWorker = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from records?`)) return;
    try {
      await api.delete(`/workers/${id}`);
      showToast('Staff removed');
      fetchWorkers(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTeamWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teamForm.selectedWorkerIds.length === 0) return showToast('Select staff members', 'error');
    setSubmitting(true);
    try {
      await Promise.all(teamForm.selectedWorkerIds.map(id => 
        api.post(`/workers/${id}/attendance`, {
          date: teamForm.date,
          punchCount: teamForm.punches,
          isPresent: true,
          notes: teamForm.notes || 'Team Work'
        })
      ));
      setShowTeamWork(false);
      setTeamForm({ date: new Date().toISOString().split('T')[0], punches: 0, notes: '', selectedWorkerIds: [] });
      showToast('Team attendance recorded');
      fetchWorkers(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = workers.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.phone?.includes(search)
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500/50" />
      <p className="text-sm text-zinc-500">Loading staff data...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Bakery Staff</h1>
          <p className="text-sm text-zinc-500">Manage payroll and daily attendance for BAKE LAND</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTeamWork(true)} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm font-medium hover:bg-white/10 transition-all">
            <Users className="w-4 h-4" /> Team Attendance
          </button>
          <button onClick={() => { setShowAddWorker(true); setEditingWorker(null); setWorkerForm({ name: '', phone: '', address: '', ratePerPunch: 0, business: 'BAKE_LAND' }); }} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-purple-500/25">
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 max-w-md focus-within:border-purple-500/50 transition-colors">
        <Search className="w-4 h-4 text-zinc-600" />
        <input type="text" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none w-full" />
      </div>

      {/* Staff Form Modal */}
      <AnimatePresence>
        {showAddWorker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddWorker(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-100">{editingWorker ? 'Edit Staff Details' : 'Add New Staff'}</h2>
                <button onClick={() => setShowAddWorker(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleWorkerSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Staff Name *</label>
                  <input type="text" value={workerForm.name} onChange={e => setWorkerForm({ ...workerForm, name: e.target.value })} required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Phone Number</label>
                  <input type="text" value={workerForm.phone} onChange={e => setWorkerForm({ ...workerForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Daily / Unit Rate (₹)</label>
                  <input type="number" step="0.01" value={workerForm.ratePerPunch || ''} onChange={e => setWorkerForm({ ...workerForm, ratePerPunch: +e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddWorker(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={submitting} 
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-500/25">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingWorker ? 'Update' : 'Add')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((w, i) => (
          <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 group hover:border-purple-500/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors" />
            
            <div className="flex items-start justify-between relative">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <HardHat className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingWorker(w); setWorkerForm({ name: w.name, phone: w.phone || '', address: w.address || '', ratePerPunch: w.ratePerPunch, business: 'BAKE_LAND' }); setShowAddWorker(true); }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/10 text-zinc-500 hover:text-blue-400 border border-transparent hover:border-blue-500/20 transition-all"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteWorker(w.id, w.name)} 
                  className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="mt-4 relative">
              <h3 className="text-base font-bold text-zinc-100 group-hover:text-purple-400 transition-colors">{w.name}</h3>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" /> {w.ratePerPunch}/UNIT
                </span>
                {w.phone && <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1 uppercase tracking-tighter"><Phone className="w-3 h-3 opacity-50" /> {w.phone}</span>}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 relative text-center">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Earned</p>
                <p className="text-xs font-black text-emerald-400 tracking-tighter">{formatCurrency(w.totalEarned)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Paid</p>
                <p className="text-xs font-black text-blue-400 tracking-tighter">{formatCurrency(w.totalPaid)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Due</p>
                <p className="text-xs font-black text-orange-400 tracking-tighter">{formatCurrency(w.pendingSalary)}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 relative">
              <button onClick={() => { setShowAttendance(w); setAttForm({ punchCount: 0, isPresent: true, notes: '', date: new Date().toISOString().split('T')[0] }); }}
                className="py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest hover:bg-purple-500/20 transition-all flex items-center justify-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Work
              </button>
              <button onClick={() => { setShowPayment(w); setPayForm({ amount: 0, type: 'salary', method: 'cash', notes: '' }); }}
                className="py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" /> Pay
              </button>
              <button onClick={() => viewHistory(w)}
                className="py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center justify-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Log
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Attendance Modal */}
      <AnimatePresence>
        {showAttendance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAttendance(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Record Daily Work</h2>
              <p className="text-sm text-zinc-500 mb-6">{showAttendance.name} — ₹{showAttendance.ratePerPunch}/unit</p>
              <form onSubmit={handleAttendance} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Date *</label>
                    <input type="date" value={attForm.date} onChange={e => setAttForm({ ...attForm, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Work Units</label>
                    <input type="number" step="0.5" required value={attForm.punchCount || ''} onChange={e => setAttForm({ ...attForm, punchCount: +e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" placeholder="e.g., 1" />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-center">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Earnings for this entry</p>
                  <p className="text-xl font-black text-purple-400 tracking-tighter">{formatCurrency(attForm.punchCount * showAttendance.ratePerPunch)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Notes</label>
                  <input type="text" value={attForm.notes} onChange={e => setAttForm({ ...attForm, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAttendance(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-500/25">Save Entry</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPayment(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Make Payment</h2>
              <p className="text-sm text-amber-400 font-bold mb-6">Balance Due: {formatCurrency(showPayment.pendingSalary)}</p>
              <form onSubmit={handlePayment} className="space-y-4">
                <input type="number" value={payForm.amount || ''} onChange={e => setPayForm({ ...payForm, amount: +e.target.value })} required placeholder="Amount ₹"
                  className="w-full px-4 py-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-lg font-black outline-none focus:ring-2 focus:ring-emerald-500/50" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={payForm.type} onChange={e => setPayForm({ ...payForm, type: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-xs font-bold uppercase tracking-widest outline-none appearance-none">
                    <option value="salary" className="bg-[#1a1a2e]">Salary</option>
                    <option value="advance" className="bg-[#1a1a2e]">Advance</option>
                    <option value="bonus" className="bg-[#1a1a2e]">Bonus</option>
                  </select>
                  <select value={payForm.method} onChange={e => setPayForm({ ...payForm, method: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-xs font-bold uppercase tracking-widest outline-none appearance-none">
                    <option value="cash" className="bg-[#1a1a2e]">Cash</option>
                    <option value="upi" className="bg-[#1a1a2e]">UPI</option>
                    <option value="bank_transfer" className="bg-[#1a1a2e]">Bank</option>
                  </select>
                </div>
                <input type="text" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} placeholder="Notes"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowPayment(null)} className="flex-1 py-3.5 rounded-2xl border border-white/10 text-zinc-400 text-sm font-bold">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-black shadow-lg shadow-emerald-500/25">Confirm Pay</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistory(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">{showHistory.name}</h2>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Work & Attendance History</p>
                </div>
                <button onClick={() => setShowHistory(null)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X className="w-5 h-5" /></button>
              </div>

              {!workerDetail ? (
                <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-purple-500/50 mx-auto" /></div>
              ) : (
                <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="pb-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Date</th>
                        <th className="pb-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Work Units</th>
                        <th className="pb-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Earning</th>
                        <th className="pb-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {workerDetail.attendance?.map((a: any) => (
                        <tr key={a.id} className="group hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 text-xs font-bold text-zinc-400">{formatDate(a.date)}</td>
                          <td className="py-4 text-right text-xs font-black text-purple-400">{a.punchCount}</td>
                          <td className="py-4 text-right text-xs font-black text-emerald-400">{formatCurrency(a.dailyEarning)}</td>
                          <td className="py-4 text-right">
                            <button onClick={async () => {
                              if(!confirm('Delete this record?')) return;
                              try {
                                await api.delete(`/workers/attendance/${a.id}`);
                                showToast('Record deleted');
                                viewHistory(showHistory);
                                fetchWorkers(true);
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              } catch(e) { showToast('Failed', 'error'); }
                            }} className="p-2 rounded-xl hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {workerDetail.attendance?.length === 0 && <div className="py-20 text-center text-zinc-600 text-sm font-medium italic">No work history found.</div>}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
