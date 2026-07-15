'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HardHat, Plus, Calendar, IndianRupee, Pencil, X, Trash2, Users, Search, Loader2, Phone, MapPin, History, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/constants';
import { useToast } from '@/components/Toast';

export default function WorkersPage() {
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
  const [showTeamWork, setShowTeamWork] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const [workerForm, setWorkerForm] = useState({ name: '', phone: '', address: '', ratePerPunch: 0, business: 'POWER_BRICK' });
  const [attForm, setAttForm] = useState({ punchType: '4_inch', punchCount: 0, isPresent: true, notes: '', date: new Date().toISOString().split('T')[0] });
  const [payForm, setPayForm] = useState({ amount: 0, type: 'salary', method: 'cash', notes: '' });
  const [teamForm, setTeamForm] = useState({ date: new Date().toISOString().split('T')[0], punches: 0, punchType: '4_inch', notes: '', selectedWorkerIds: [] as string[] });

  const fetchWorkers = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const d = await api.get('/workers');
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
        showToast('Worker updated successfully');
      } else {
        await api.post('/workers', workerForm);
        showToast('Worker added successfully');
      }
      setShowAddWorker(false);
      setEditingWorker(null);
      setWorkerForm({ name: '', phone: '', address: '', ratePerPunch: 0, business: 'POWER_BRICK' });
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
    if (attForm.punchCount < 0) return showToast('Punches cannot be negative', 'error');
    setSubmitting(true);
    try {
      await api.post(`/workers/${showAttendance.id}/attendance`, attForm);
      setShowAttendance(null);
      showToast('Punches recorded and stock updated');
      fetchWorkers(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      showToast(e.response?.data?.error || e.message || 'Failed to save punches', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payForm.amount <= 0) return showToast('Amount must be positive', 'error');
    setSubmitting(true);
    try {
      await api.post(`/workers/${showPayment.id}/payment`, payForm);
      setShowPayment(null);
      showToast('Payment recorded successfully');
      fetchWorkers(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      showToast(e.response?.data?.error || e.message || 'Failed to record payment', 'error');
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
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await api.delete(`/workers/${id}`);
      showToast('Worker removed');
      fetchWorkers(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleTeamWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teamForm.selectedWorkerIds.length === 0) return showToast('Select at least one worker', 'error');
    if (teamForm.punches <= 0) return showToast('Enter valid punches', 'error');
    
    setSubmitting(true);
    try {
      await Promise.all(teamForm.selectedWorkerIds.map(id => 
        api.post(`/workers/${id}/attendance`, {
          date: teamForm.date,
          punchCount: teamForm.punches,
          punchType: teamForm.punchType,
          isPresent: true,
          notes: teamForm.notes || 'Team Work'
        })
      ));
      setShowTeamWork(false);
      setTeamForm({ date: new Date().toISOString().split('T')[0], punches: 0, punchType: '4_inch', notes: '', selectedWorkerIds: [] });
      showToast('Team punches recorded successfully');
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
      <p className="text-sm text-zinc-500">Loading workers...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Workers</h1>
          <p className="text-sm text-zinc-500">Manage daily production and labor accounting</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTeamWork(true)} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm font-medium hover:bg-white/10 transition-all">
            <Users className="w-4 h-4" /> Team Work
          </button>
          <button onClick={() => { setShowAddWorker(true); setEditingWorker(null); setWorkerForm({ name: '', phone: '', address: '', ratePerPunch: 0, business: 'POWER_BRICK' }); }} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-purple-500/25 transition-all">
            <Plus className="w-4 h-4" /> Add Worker
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 max-w-md focus-within:border-purple-500/50 transition-colors">
        <Search className="w-4 h-4 text-zinc-600" />
        <input type="text" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none w-full" />
      </div>

      {/* Add/Edit Worker Modal */}
      <AnimatePresence>
        {showAddWorker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddWorker(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-100">{editingWorker ? 'Edit Worker' : 'Add Worker'}</h2>
                <button onClick={() => setShowAddWorker(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleWorkerSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Full Name *</label>
                  <input type="text" value={workerForm.name} onChange={e => setWorkerForm({ ...workerForm, name: e.target.value })} required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Phone Number</label>
                  <input type="text" value={workerForm.phone} onChange={e => setWorkerForm({ ...workerForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Rate per Punch (₹)</label>
                  <input type="number" step="0.01" value={workerForm.ratePerPunch || ''} onChange={e => setWorkerForm({ ...workerForm, ratePerPunch: +e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Address</label>
                  <input type="text" value={workerForm.address} onChange={e => setWorkerForm({ ...workerForm, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddWorker(false)} 
                    className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-sm font-medium hover:bg-white/5 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-500/25 disabled:opacity-50">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingWorker ? 'Update' : 'Add')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Team Work Modal */}
      <AnimatePresence>
        {showTeamWork && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowTeamWork(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-zinc-100 text-center w-full">Combined Team Work</h2>
                <button onClick={() => setShowTeamWork(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 absolute top-4 right-4"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-zinc-500 mb-6 text-center">Record production for multiple workers at once</p>
              
              <form onSubmit={handleTeamWork} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Date *</label>
                    <input type="date" value={teamForm.date} onChange={e => setTeamForm({ ...teamForm, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Punch Type</label>
                    <select value={teamForm.punchType} onChange={e => setTeamForm({ ...teamForm, punchType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none appearance-none">
                      <option value="4_inch" className="bg-[#1a1a2e]">4 Inch (8 Bricks)</option>
                      <option value="6_inch" className="bg-[#1a1a2e]">6 Inch (5 Bricks)</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-2 ml-1">Select Workers ({teamForm.selectedWorkerIds.length} selected)</label>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    {workers.map(w => (
                      <label key={w.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                        <input type="checkbox" className="w-5 h-5 accent-purple-500 rounded-lg" 
                          checked={teamForm.selectedWorkerIds.includes(w.id)}
                          onChange={e => {
                            const ids = e.target.checked 
                              ? [...teamForm.selectedWorkerIds, w.id]
                              : teamForm.selectedWorkerIds.filter(id => id !== w.id);
                            setTeamForm({...teamForm, selectedWorkerIds: ids});
                          }} 
                        />
                        <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{w.name}</span>
                        <span className="text-zinc-600 text-[10px] ml-auto font-mono">₹{w.ratePerPunch}/P</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Punches (Applied to each worker)</label>
                  <input type="number" value={teamForm.punches || ''} onChange={e => setTeamForm({ ...teamForm, punches: +e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" placeholder="e.g., 500" />
                </div>
                
                <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                   <p className="text-sm text-center font-bold text-purple-400">
                    Total: {teamForm.punches * (teamForm.punchType === '4_inch' ? 8 : 5)} Bricks per worker
                   </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowTeamWork(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={submitting || teamForm.selectedWorkerIds.length === 0} 
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Record Production'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Record Attendance Modal */}
      <AnimatePresence>
        {showAttendance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAttendance(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-zinc-100">Record Production</h2>
                <button onClick={() => setShowAttendance(null)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-zinc-500 mb-6">{showAttendance.name} — ₹{showAttendance.ratePerPunch}/punch</p>
              
              <form onSubmit={handleAttendance} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Date *</label>
                    <input type="date" value={attForm.date} onChange={e => setAttForm({ ...attForm, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Punch Type *</label>
                    <select value={attForm.punchType} onChange={e => setAttForm({ ...attForm, punchType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                      <option value="4_inch" className="bg-[#1a1a2e]">4 Inch (8 bricks)</option>
                      <option value="6_inch" className="bg-[#1a1a2e]">6 Inch (5 bricks)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Punches</label>
                  <input type="number" min="1" required value={attForm.punchCount || ''} onChange={e => setAttForm({ ...attForm, punchCount: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" placeholder="e.g., 500" />
                </div>
                
                <div className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500 font-medium">Bricks Produced</span>
                    <span className="text-sm text-emerald-400 font-black tracking-tight">{attForm.punchCount * (attForm.punchType === '4_inch' ? 8 : 5)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500 font-medium">Daily Earning</span>
                    <span className="text-sm text-orange-400 font-black tracking-tight">{formatCurrency(attForm.punchCount * showAttendance.ratePerPunch)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Notes</label>
                  <input type="text" value={attForm.notes} onChange={e => setAttForm({ ...attForm, notes: e.target.value })} placeholder="Any remarks"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAttendance(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-500/25">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Record Punches'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pay Salary Modal */}
      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPayment(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Make Payment</h2>
              <p className="text-sm text-amber-400 font-bold mb-6 tracking-tight">Balance Due: {formatCurrency(showPayment.pendingSalary)}</p>
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Amount ₹</label>
                  <input type="number" value={payForm.amount || ''} onChange={e => setPayForm({ ...payForm, amount: +e.target.value })} required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Type</label>
                    <select value={payForm.type} onChange={e => setPayForm({ ...payForm, type: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none appearance-none">
                      <option value="salary" className="bg-[#1a1a2e]">Salary</option>
                      <option value="advance" className="bg-[#1a1a2e]">Advance</option>
                      <option value="bonus" className="bg-[#1a1a2e]">Bonus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Method</label>
                    <select value={payForm.method} onChange={e => setPayForm({ ...payForm, method: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none appearance-none">
                      <option value="cash" className="bg-[#1a1a2e]">Cash</option>
                      <option value="upi" className="bg-[#1a1a2e]">UPI</option>
                      <option value="bank_transfer" className="bg-[#1a1a2e]">Bank</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Notes</label>
                  <input type="text" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowPayment(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/25">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Payment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Attendance History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistory(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">{showHistory.name}</h2>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">Production History</p>
                </div>
                <button onClick={() => setShowHistory(null)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X className="w-5 h-5" /></button>
              </div>

              {!workerDetail ? (
                <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-purple-500/50 mx-auto" /></div>
              ) : (
                <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="pb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Date</th>
                        <th className="pb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center">Type</th>
                        <th className="pb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-right">Punches</th>
                        <th className="pb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-right">Bricks</th>
                        <th className="pb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-right">Earned</th>
                        <th className="pb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {workerDetail.attendance?.map((a: any) => (
                        <tr key={a.id} className="group hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 text-xs font-medium text-zinc-400">{formatDate(a.date)}</td>
                          <td className="py-4 text-center">
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-white/5 text-zinc-500 border border-white/5">
                              {a.punchType?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 text-right text-xs font-bold text-zinc-200">{a.punchCount}</td>
                          <td className="py-4 text-right text-xs font-black text-emerald-400">{a.bricksProduced?.toLocaleString()}</td>
                          <td className="py-4 text-right text-xs font-black text-orange-400">{formatCurrency(a.dailyEarning)}</td>
                          <td className="py-4 text-right">
                            <button onClick={async () => {
                              if(!confirm('Delete this record? Stock and earnings will be reversed.')) return;
                              try {
                                await api.delete(`/workers/attendance/${a.id}`);
                                showToast('Record deleted');
                                viewHistory(showHistory);
                                fetchWorkers(true);
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              } catch(e) { showToast('Delete failed', 'error'); }
                            }} className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-xl hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all ml-auto"><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {workerDetail.attendance?.length === 0 && (
                    <div className="py-20 text-center text-zinc-600 text-sm italic font-medium">No production records found.</div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Worker Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((w, i) => (
          <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 group hover:border-purple-500/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors" />
            
            <div className="flex items-start justify-between relative">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <HardHat className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingWorker(w); setWorkerForm({ name: w.name, phone: w.phone || '', address: w.address || '', ratePerPunch: w.ratePerPunch, business: w.business }); setShowAddWorker(true); }}
                  className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-blue-500/10 text-zinc-500 hover:text-blue-400 border border-transparent hover:border-blue-500/20 transition-all"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteWorker(w.id, w.name)} 
                  className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="mt-4 relative">
              <h3 className="text-base font-bold text-zinc-100 group-hover:text-purple-400 transition-colors">{w.name}</h3>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" /> {w.ratePerPunch}/PUNCH
                </span>
                {w.phone && <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1 uppercase tracking-tighter"><Phone className="w-3 h-3 opacity-50" /> {w.phone}</span>}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 relative text-center">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-emerald-500/[0.03] transition-colors">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Earned</p>
                <p className="text-xs font-black text-emerald-400 tracking-tighter">{formatCurrency(w.totalEarned)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-blue-500/[0.03] transition-colors">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Paid</p>
                <p className="text-xs font-black text-blue-400 tracking-tighter">{formatCurrency(w.totalPaid)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-orange-500/[0.03] transition-colors">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Due</p>
                <p className="text-xs font-black text-orange-400 tracking-tighter">{formatCurrency(w.pendingSalary)}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 relative">
              <button onClick={() => { setShowAttendance(w); setAttForm({ punchType: '4_inch', punchCount: 0, isPresent: true, notes: '', date: new Date().toISOString().split('T')[0] }); }}
                className="py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest hover:bg-purple-500/20 transition-all flex items-center justify-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Record
              </button>
              <button onClick={() => { setShowPayment(w); setPayForm({ amount: 0, type: 'salary', method: 'cash', notes: '' }); }}
                className="py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" /> Pay
              </button>
              <button onClick={() => viewHistory(w)}
                className="py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center justify-center gap-1.5">
                <History className="w-3.5 h-3.5" /> History
              </button>
            </div>
          </motion.div>
        ))}
        
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
            <HardHat className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No workers found matching your search.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
