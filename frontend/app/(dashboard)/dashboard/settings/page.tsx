'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Building2, Save, KeyRound } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export default function SettingsPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pbForm, setPbForm] = useState({ businessName: '', gstNumber: '', address: '', phone: '', email: '' });
  const [blForm, setBlForm] = useState({ businessName: '', gstNumber: '', address: '', phone: '', email: '' });
  const [saved, setSaved] = useState('');
  
  const { user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({ email: '', newEmail: '', newPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    api.get('/config').then(d => {
      setConfigs(d.configs);
      const pb = d.configs.find((c: any) => c.businessCode === 'POWER_BRICK');
      const bl = d.configs.find((c: any) => c.businessCode === 'BAKE_LAND');
      if (pb) setPbForm({ businessName: pb.businessName, gstNumber: pb.gstNumber || '', address: pb.address || '', phone: pb.phone || '', email: pb.email || '' });
      if (bl) setBlForm({ businessName: bl.businessName, gstNumber: bl.gstNumber || '', address: bl.address || '', phone: bl.phone || '', email: bl.email || '' });
    }).finally(() => setLoading(false));
  }, []);

  const saveBusiness = async (code: string, form: any) => {
    try {
      await api.put(`/config/${code}`, form);
      setSaved(code);
      setTimeout(() => setSaved(''), 2000);
    } catch (e: any) { alert(e.message); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPasswordStatus({ type: 'loading', message: 'Updating account details...' });
      await api.post('/auth/change-password', passwordForm);
      setPasswordStatus({ type: 'success', message: 'Account details updated successfully!' });
      setPasswordForm({ email: '', newEmail: '', newPassword: '' });
      setTimeout(() => setPasswordStatus({ type: '', message: '' }), 3000);
    } catch (err: any) {
      setPasswordStatus({ type: 'error', message: err.message || 'Failed to update account details' });
    }
  };

  const fields = [{l:'Business Name',k:'businessName'},{l:'GST Number',k:'gstNumber'},{l:'Address',k:'address'},{l:'Phone',k:'phone'},{l:'Email',k:'email'}];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1000px] mx-auto">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6 text-zinc-400" />
        <div><h1 className="text-2xl font-bold text-zinc-100">Settings</h1><p className="text-sm text-zinc-500">Configure business details, GST, and preferences</p></div>
      </div>

      {/* Power Brick Config */}
      <div className="rounded-2xl border border-orange-500/10 bg-orange-500/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-zinc-200">🧱 POWER BRICK</h2>
          {saved === 'POWER_BRICK' && <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">✓ Saved</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.k}><label className="block text-xs text-zinc-500 mb-1">{f.l}</label>
            <input type="text" value={(pbForm as any)[f.k]} onChange={e => setPbForm({...pbForm,[f.k]:e.target.value})}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" /></div>
          ))}
        </div>
        <button onClick={() => saveBusiness('POWER_BRICK', pbForm)} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-all"><Save className="w-4 h-4" /> Save</button>
      </div>

      {/* Bake Land Config */}
      <div className="rounded-2xl border border-purple-500/10 bg-purple-500/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-zinc-200">🍞 BAKE LAND</h2>
          {saved === 'BAKE_LAND' && <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">✓ Saved</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.k}><label className="block text-xs text-zinc-500 mb-1">{f.l}</label>
            <input type="text" value={(blForm as any)[f.k]} onChange={e => setBlForm({...blForm,[f.k]:e.target.value})}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" /></div>
          ))}
        </div>
        <button onClick={() => saveBusiness('BAKE_LAND', blForm)} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-all"><Save className="w-4 h-4" /> Save</button>
      </div>

      {/* Security Settings (Admin Only) */}
      {(user?.role === 'super_admin' || user?.role === 'manager') && (
        <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-semibold text-zinc-200">Security / Account Details</h2>
          </div>
          <p className="text-sm text-zinc-400 mb-4">Change your email or password, or reset another user's details (Admin only).</p>
          
          <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Target Account Email (Current)</label>
              <input type="email" value={passwordForm.email} onChange={e => setPasswordForm({...passwordForm, email: e.target.value})}
                placeholder="user@skgroups.com" required
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-red-500/50" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">New Email (Optional)</label>
              <input type="email" value={passwordForm.newEmail} onChange={e => setPasswordForm({...passwordForm, newEmail: e.target.value})}
                placeholder="new.email@skgroups.com"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-red-500/50" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">New Password (min 6 chars)</label>
              <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                placeholder="••••••••" required minLength={6}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-sm outline-none focus:ring-2 focus:ring-red-500/50" />
            </div>
            
            {passwordStatus.message && (
              <p className={`text-sm ${passwordStatus.type === 'success' ? 'text-emerald-400' : passwordStatus.type === 'error' ? 'text-red-400' : 'text-zinc-400'}`}>
                {passwordStatus.message}
              </p>
            )}
            
            <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium hover:bg-red-500/30 transition-all">
              <Save className="w-4 h-4" /> Update Details
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
}
