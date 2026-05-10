// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, X, Trash2, IndianRupee } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate, PAYMENT_METHODS } from '@/lib/constants';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState<any>(null);
  const [payForm, setPayForm] = useState({ amount: 0, method: 'cash', notes: '' });

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payForm.amount <= 0) return alert('Enter a valid amount');
    try {
      await api.post(`/purchases/${showPayment.id}/payment`, payForm);
      setShowPayment(null);
      setPayForm({ amount: 0, method: 'cash', notes: '' });
      fetchData();
      alert('Payment recorded successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    }
  };

  const [supplierId, setSupplierId] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([{ materialId: '', quantity: 0, rate: 0 }]);
  const [transportCost, setTransportCost] = useState(0);
  const [loadingCost, setLoadingCost] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      const [p, m, s] = await Promise.all([
        api.get('/purchases'),
        api.get('/materials'),
        api.get('/purchases/suppliers'),
      ]);
      setPurchases(p.purchases);
      setMaterials(m.materials.filter((mm: any) => mm.isActive));
      setSuppliers(s.suppliers);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeletePurchase = async (id: string, purchaseNumber: string) => {
    if (!confirm(`Are you sure you want to delete purchase ${purchaseNumber}? This will also reverse the stock levels.`)) return;
    try {
      await api.delete(`/purchases/${id}`);
      setPurchases(purchases.filter(p => p.id !== id));
      alert('Purchase deleted successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to delete purchase');
    }
  };

  const addItem = () => setItems([...items, { materialId: '', quantity: 0, rate: 0 }]);
  const removeItem = (i: number) => items.length > 1 && setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const itemsTotal = items.reduce((s, it) => s + it.quantity * it.rate, 0);
  const grandTotal = itemsTotal + transportCost + loadingCost + otherCharges;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(it => it.materialId && it.quantity > 0);
    if (validItems.length === 0) { alert('Add at least one item with quantity'); return; }
    if (!supplierId && !newSupplierName) { alert('Select or enter a supplier name'); return; }

    setSubmitting(true);
    try {
      await api.post('/purchases', {
        supplierId: supplierId || undefined,
        supplierName: !supplierId ? newSupplierName : undefined,
        supplierPhone: !supplierId ? newSupplierPhone : undefined,
        items: validItems,
        transportCost, loadingCost, otherCharges, paidAmount, paymentMethod, notes,
        purchaseDate,
      });
      setShowForm(false);
      setItems([{ materialId: '', quantity: 0, rate: 0 }]);
      setSupplierId(''); setNewSupplierName(''); setNewSupplierPhone('');
      setTransportCost(0); setLoadingCost(0); setOtherCharges(0);
      setPaidAmount(0); setNotes('');
      fetchData();
    } catch (err: any) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-zinc-100">Purchases</h1><p className="text-sm text-zinc-500">Track material purchases and supplier costs</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium shadow-lg shadow-orange-500/25"><Plus className="w-4 h-4" /> New Purchase</button>
      </div>

      {/* Purchase Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0f0f1a] p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-100">New Purchase</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Supplier + Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Supplier</label>
                  <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                    <option value="">-- New Supplier --</option>
                    {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                {!supplierId && (
                  <>
                    <div><label className="block text-xs text-zinc-500 mb-1">Supplier Name *</label>
                      <input type="text" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
                    <div><label className="block text-xs text-zinc-500 mb-1">Supplier Phone</label>
                      <input type="text" value={newSupplierPhone} onChange={e => setNewSupplierPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
                  </>
                )}
                <div><label className="block text-xs text-zinc-500 mb-1">Purchase Date</label>
                  <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-zinc-200">Materials</h3>
                  <button type="button" onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-medium hover:bg-orange-500/20"><Plus className="w-3 h-3" /> Add</button>
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <select value={item.materialId} onChange={e => updateItem(i, 'materialId', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                          <option value="">Select Material</option>
                          {materials.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2"><input type="number" placeholder="Qty" value={item.quantity || ''} onChange={e => updateItem(i, 'quantity', +e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
                      <div className="col-span-2"><input type="number" placeholder="Rate ₹" value={item.rate || ''} onChange={e => updateItem(i, 'rate', +e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
                      <div className="col-span-2 px-3 py-2 rounded-lg bg-white/5 text-sm text-orange-400 font-medium">{formatCurrency(item.quantity * item.rate)}</div>
                      <div className="col-span-1">{items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">✕</button>}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Costs + Payment */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><label className="block text-[10px] text-zinc-600 mb-1">Transport ₹</label><input type="number" value={transportCost || ''} onChange={e => setTransportCost(+e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
                <div><label className="block text-[10px] text-zinc-600 mb-1">Loading ₹</label><input type="number" value={loadingCost || ''} onChange={e => setLoadingCost(+e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
                <div><label className="block text-[10px] text-zinc-600 mb-1">Other ₹</label><input type="number" value={otherCharges || ''} onChange={e => setOtherCharges(+e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
                <div><label className="block text-[10px] text-zinc-600 mb-1">Paid ₹</label><input type="number" value={paidAmount || ''} onChange={e => setPaidAmount(+e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" /></div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <span className="text-sm text-zinc-300">Grand Total</span>
                <span className="text-xl font-bold text-orange-400">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium disabled:opacity-50">{submitting ? 'Saving...' : 'Save Purchase'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Purchase List */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              <th className="text-left text-[11px] text-zinc-500 font-medium px-5 py-3">Purchase #</th>
              <th className="text-left text-[11px] text-zinc-500 font-medium px-5 py-3">Supplier</th>
              <th className="text-left text-[11px] text-zinc-500 font-medium px-5 py-3">Date</th>
              <th className="text-left text-[11px] text-zinc-500 font-medium px-5 py-3">Items</th>
              <th className="text-right text-[11px] text-zinc-500 font-medium px-5 py-3">Total</th>
              <th className="text-center text-[11px] text-zinc-500 font-medium px-5 py-3">Status</th>
              <th className="text-right text-[11px] text-zinc-500 font-medium px-5 py-3">Actions</th>
            </tr></thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-sm font-medium text-orange-400">{p.purchaseNumber}</td>
                  <td className="px-5 py-3 text-sm text-zinc-300">{p.supplier?.name}</td>
                  <td className="px-5 py-3 text-sm text-zinc-500">{formatDate(p.purchaseDate)}</td>
                  <td className="px-5 py-3 text-xs text-zinc-500">{p.items?.map((it: any) => `${it.material?.name} (${it.quantity})`).join(', ')}</td>
                  <td className="px-5 py-3 text-right text-sm font-semibold text-zinc-200">{formatCurrency(p.grandTotal)}</td>
                  <td className="px-5 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{p.paymentStatus}</span></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {p.paymentStatus !== 'paid' && (
                        <button 
                          onClick={() => { setShowPayment(p); setPayForm({ amount: p.dueAmount, method: 'cash', notes: '' }); }}
                          className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-500 transition-colors"
                          title="Record Payment"
                        >
                          <IndianRupee className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeletePurchase(p.id, p.purchaseNumber)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-zinc-600 text-sm">No purchases recorded yet. Click &quot;New Purchase&quot; to add one.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPayment(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f1a] p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-100 mb-1">Record Payment</h2>
            <p className="text-sm text-zinc-500 mb-4">{showPayment.purchaseNumber} — Pending: {formatCurrency(showPayment.dueAmount)}</p>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Amount ₹ *</label>
                <input type="number" step="0.01" value={payForm.amount || ''} onChange={e => setPayForm({ ...payForm, amount: +e.target.value })} required
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Method</label>
                <select value={payForm.method} onChange={e => setPayForm({ ...payForm, method: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none">
                  {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Notes</label>
                <input type="text" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} placeholder="Any payment remarks"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPayment(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/20">Save Payment</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
