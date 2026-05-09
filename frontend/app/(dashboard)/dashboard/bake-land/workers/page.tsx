'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HardHat, Plus, Calendar, IndianRupee, Pencil, X, Trash2, Users } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/constants';

export default function BakeLandWorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showAttendance, setShowAttendance] = useState<any>(null);
  const [showEditRate, setShowEditRate] = useState<any>(null);
  const [showPayment, setShowPayment] = useState<any>(null);
  const [showHistory, setShowHistory] = useState<any>(null);
  const [workerDetail, setWorkerDetail] = useState<any>(null);
  const [showTeamWork, setShowTeamWork] = useState(false);

  const [addForm, setAddForm] = useState({ name: '', phone: '', ratePerPunch: 0 });
  const [attForm, setAttForm] = useState({ punchCount: 0, isPresent: true, notes: '', date: new Date().toISOString().split('T')[0] });
  const [rateForm, setRateForm] = useState(0);
  const [payForm, setPayForm] = useState({ amount: 0, type: 'salary', method: 'cash', notes: '' });
  const [teamForm, setTeamForm] = useState({ date: new Date().toISOString().split('T')[0], punches: 0, notes: '', selectedWorkerIds: [] as string[] });

  const fetchWorkers = async () => {
    try { const d = await api.get('/workers?business=BAKE_LAND'); setWorkers(d.workers); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWorkers(); }, []);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/workers', { ...addForm, business: 'BAKE_LAND' });
    setShowAddWorker(false); setAddForm({ name: '', phone: '', ratePerPunch: 0 });
    fetchWorkers();
  };

  const handleAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(`/workers/${showAttendance.id}/attendance`, {
      ...attForm, date: attForm.date,
    });
    setShowAttendance(null);
    fetchWorkers();
  };

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.put(`/workers/${showEditRate.id}`, { ratePerPunch: rateForm });
    setShowEditRate(null);
    fetchWorkers();
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(`/workers/${showPayment.id}/payment`, payForm);
    setShowPayment(null);
    fetchWorkers();
  };

  const viewHistory = async (worker: any) => {
    const d = await api.get(`/workers/${worker.id}`);
    setWorkerDetail(d.worker);
    setShowHistory(worker);
  };

  const handleDeleteWorker = async (id: string) => {
    if (!confirm('Are you sure you want to remove this worker completely?')) return;
    try {
      await api.delete(`/workers/${id}`);
      fetchWorkers();
    } catch (e: any) { alert(e.message); }
  };

  const handleTeamWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teamForm.selectedWorkerIds.length === 0) return alert('Select at least one worker');
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
      fetchWorkers();
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-zinc-100">Bakery Staff</h1><p className="text-sm text-zinc-500">Track daily work, attendance, salary & payments</p></div>
        <div className="flex gap-2">
          <button onClick={() => setShowTeamWork(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm font-medium hover:bg-white/10"><Users className="w-4 h-4" /> Team Work</button>
          <button onClick={() => setShowAddWorker(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-purple-500/25"><Plus className="w-4 h-4" /> Add Staff</button>
        </div>
      </div>

      {/* Add Worker Modal */}
      {showAddWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddWorker(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f1a] p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Add Staff</h2>
            <form onSubmit={handleAddWorker} className="space-y-3">
              <div><label className="block text-xs text-zinc-500 mb-1">Name *</label><input type="text" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              <div><label className="block text-xs text-zinc-500 mb-1">Phone</label><input type="text" value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              <div><label className="block text-xs text-zinc-500 mb-1">Daily Rate / Unit Rate (₹)</label><input type="number" step="0.01" value={addForm.ratePerPunch || ''} onChange={e => setAddForm({ ...addForm, ratePerPunch: +e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddWorker(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium">Add</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Team Work Modal */}
      {showTeamWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowTeamWork(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f1a] p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-100 mb-1">Combined Team Work</h2>
            <p className="text-sm text-zinc-500 mb-4">Record work units for multiple staff at once</p>
            <form onSubmit={handleTeamWork} className="space-y-4">
              <div><label className="block text-xs text-zinc-500 mb-1">Date *</label>
                <input type="date" value={teamForm.date} onChange={e => setTeamForm({ ...teamForm, date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              
              <div>
                <label className="block text-xs text-zinc-500 mb-2">Select Workers ({teamForm.selectedWorkerIds.length} selected)</label>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {workers.map(w => (
                    <label key={w.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-purple-500 rounded" 
                        checked={teamForm.selectedWorkerIds.includes(w.id)}
                        onChange={e => {
                          const ids = e.target.checked 
                            ? [...teamForm.selectedWorkerIds, w.id]
                            : teamForm.selectedWorkerIds.filter(id => id !== w.id);
                          setTeamForm({...teamForm, selectedWorkerIds: ids});
                        }} 
                      />
                      <span className="text-sm text-zinc-200">{w.name} <span className="text-zinc-500 text-xs">(₹{w.ratePerPunch}/unit)</span></span>
                    </label>
                  ))}
                </div>
              </div>

              <div><label className="block text-xs text-zinc-500 mb-1">Total Work Units (Will be applied to EACH selected staff)</label>
                <input type="number" value={teamForm.punches || ''} onChange={e => setTeamForm({ ...teamForm, punches: +e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" placeholder="e.g., 1" /></div>
              
              <div><label className="block text-xs text-zinc-500 mb-1">Notes</label>
                <input type="text" value={teamForm.notes} onChange={e => setTeamForm({ ...teamForm, notes: e.target.value })} placeholder="e.g. Combined Group 1"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowTeamWork(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm">Cancel</button>
                <button type="submit" disabled={teamForm.selectedWorkerIds.length===0} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium disabled:opacity-50">Apply Work Units</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Record Attendance Modal */}
      {showAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAttendance(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f1a] p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-100 mb-1">Record Daily Work</h2>
            <p className="text-sm text-zinc-500 mb-4">{showAttendance.name} — ₹{showAttendance.ratePerPunch}/unit</p>
            <form onSubmit={handleAttendance} className="space-y-3">
              <div><label className="block text-xs text-zinc-500 mb-1">Date *</label>
                <input type="date" value={attForm.date} onChange={e => setAttForm({ ...attForm, date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              <div><label className="block text-xs text-zinc-500 mb-1">Work Units (e.g. 1 for full day)</label>
                <input type="number" step="0.5" value={attForm.punchCount || ''} onChange={e => setAttForm({ ...attForm, punchCount: +e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" placeholder="e.g., 1" /></div>
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <p className="text-sm text-purple-400 font-semibold">Daily Earning: {formatCurrency(attForm.punchCount * showAttendance.ratePerPunch)}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">{attForm.punchCount} units × ₹{showAttendance.ratePerPunch}/unit</p>
              </div>
              <div><label className="block text-xs text-zinc-500 mb-1">Notes</label>
                <input type="text" value={attForm.notes} onChange={e => setAttForm({ ...attForm, notes: e.target.value })} placeholder="Any remarks for the day"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAttendance(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium">Save</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Rate Modal */}
      {showEditRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditRate(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f1a] p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Change Rate — {showEditRate.name}</h2>
            <form onSubmit={handleUpdateRate} className="space-y-3">
              <div><label className="block text-xs text-zinc-500 mb-1">New Rate per Unit (₹)</label>
                <input type="number" step="0.01" value={rateForm || ''} onChange={e => setRateForm(+e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" /></div>
              <p className="text-[11px] text-zinc-600">Current rate: ₹{showEditRate.ratePerPunch}/unit</p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditRate(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium">Update Rate</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Pay Salary Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPayment(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f1a] p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-100 mb-1">Pay Staff — {showPayment.name}</h2>
            <p className="text-sm text-amber-400 mb-4">Pending: {formatCurrency(showPayment.pendingSalary)}</p>
            <form onSubmit={handlePayment} className="space-y-3">
              <div><label className="block text-xs text-zinc-500 mb-1">Amount ₹</label><input type="number" value={payForm.amount || ''} onChange={e => setPayForm({ ...payForm, amount: +e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-zinc-500 mb-1">Type</label>
                  <select value={payForm.type} onChange={e => setPayForm({ ...payForm, type: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                    <option value="salary">Salary</option><option value="advance">Advance</option><option value="bonus">Bonus</option>
                  </select></div>
                <div><label className="block text-xs text-zinc-500 mb-1">Method</label>
                  <select value={payForm.method} onChange={e => setPayForm({ ...payForm, method: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                    <option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option>
                  </select></div>
              </div>
              <div><label className="block text-xs text-zinc-500 mb-1">Notes</label><input type="text" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPayment(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium">Pay</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Attendance History Modal */}
      {showHistory && workerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistory(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f0f1a] p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-100">{showHistory.name} — Daily Work History</h2>
              <button onClick={() => setShowHistory(null)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <table className="w-full">
              <thead><tr className="border-b border-white/5">
                <th className="text-left text-[11px] text-zinc-500 font-medium px-3 py-2">Date</th>
                <th className="text-right text-[11px] text-zinc-500 font-medium px-3 py-2">Units</th>
                <th className="text-right text-[11px] text-zinc-500 font-medium px-3 py-2">Rate</th>
                <th className="text-right text-[11px] text-zinc-500 font-medium px-3 py-2">Earned</th>
                <th className="text-left text-[11px] text-zinc-500 font-medium px-3 py-2">Notes</th>
              </tr></thead>
              <tbody>
                {workerDetail.attendance?.map((a: any) => (
                  <tr key={a.id} className="border-b border-white/5">
                    <td className="px-3 py-2 text-sm text-zinc-300">{formatDate(a.date)}</td>
                    <td className="px-3 py-2 text-right text-sm font-semibold text-purple-400">{a.punchCount}</td>
                    <td className="px-3 py-2 text-right text-sm text-zinc-500">₹{a.rate}</td>
                    <td className="px-3 py-2 text-right text-sm font-medium text-emerald-400">{formatCurrency(a.dailyEarning)}</td>
                    <td className="px-3 py-2 text-xs text-zinc-600">{a.notes || '-'}</td>
                  </tr>
                ))}
                {(!workerDetail.attendance || workerDetail.attendance.length === 0) && (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-zinc-600 text-sm">No attendance records yet.</td></tr>
                )}
              </tbody>
            </table>
          </motion.div>
        </div>
      )}

      {/* Worker Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.map((w, i) => (
          <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-purple-500/20 transition-all">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><HardHat className="w-5 h-5 text-purple-400" /></div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setShowEditRate(w); setRateForm(w.ratePerPunch); }}
                  className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-purple-400 transition-colors p-1">
                  <Pencil className="w-3 h-3" /> ₹{w.ratePerPunch}/unit
                </button>
                <button onClick={() => handleDeleteWorker(w.id)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mt-3">{w.name}</h3>
            {w.phone && <p className="text-[11px] text-zinc-500 mt-0.5">{w.phone}</p>}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white/5"><p className="text-[10px] text-zinc-600">Earned</p><p className="text-xs font-semibold text-emerald-400">{formatCurrency(w.totalEarned)}</p></div>
              <div className="p-2 rounded-lg bg-white/5"><p className="text-[10px] text-zinc-600">Paid</p><p className="text-xs font-semibold text-blue-400">{formatCurrency(w.totalPaid)}</p></div>
              <div className="p-2 rounded-lg bg-white/5"><p className="text-[10px] text-zinc-600">Pending</p><p className="text-xs font-semibold text-amber-400">{formatCurrency(w.pendingSalary)}</p></div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button onClick={() => { setShowAttendance(w); setAttForm({ punchCount: 0, isPresent: true, notes: '', date: new Date().toISOString().split('T')[0] }); }}
                className="py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-medium hover:bg-purple-500/20 transition-all flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3" /> Work
              </button>
              <button onClick={() => { setShowPayment(w); setPayForm({ amount: 0, type: 'salary', method: 'cash', notes: '' }); }}
                className="py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1">
                <IndianRupee className="w-3 h-3" /> Pay
              </button>
              <button onClick={() => viewHistory(w)}
                className="py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium hover:bg-blue-500/20 transition-all text-center">
                History
              </button>
            </div>
          </motion.div>
        ))}
        {workers.length === 0 && <div className="col-span-full text-center py-12 text-zinc-600 text-sm">No workers added yet.</div>}
      </div>
    </motion.div>
  );
}
