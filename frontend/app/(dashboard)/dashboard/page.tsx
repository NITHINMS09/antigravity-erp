'use client';

import { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
   
   
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TrendingUp, TrendingDown, IndianRupee, AlertTriangle, Users, Truck,
   
   
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  HardHat, Zap, ArrowUpRight, Package, ShoppingCart, CakeSlice, Calendar, ChevronRight, Activity, Clock
} from 'lucide-react';
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/constants';
import Link from 'next/link';

interface DashboardData {
  dailySales: { total: number; count: number };
  weeklySales: { total: number; count: number };
  monthlySales: { total: number; count: number };
  monthlyProfit: number;
  pendingPayments: { total: number; count: number };
  lowStockAlerts: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lowStockItems: any[];
  expenses: { labour: number; transport: number; general: number; purchases: number };
  bakeryDailySales: { total: number; cash: number; upi: number; card: number };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentInvoices: any[];
  salesTrend: { date: string; sales: number }[];
}

const COLORS = ['#f97316', '#a855f7', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.get('/dashboard');
        setData(result);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-orange-500/10 border-t-orange-500 rounded-full" />
        <p className="text-sm font-black uppercase tracking-widest text-zinc-600 animate-pulse">Syncing ERP Data...</p>
      </div>
    );
  }

  const kpis = [
    { label: 'Today Revenue', value: data.dailySales.total, sub: `${data.dailySales.count} orders`, icon: IndianRupee, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { label: 'Monthly Profit', value: data.monthlyProfit, sub: 'Net Earnings', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Outstanding', value: data.pendingPayments.total, sub: `${data.pendingPayments.count} customers`, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Labour Cost', value: data.expenses.labour, sub: 'Monthly', icon: HardHat, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Business Overview</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">System Live</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-bold text-zinc-300">{formatDate(new Date())}</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={i} variants={itemVariants} 
            className={`p-6 rounded-3xl border ${kpi.border} ${kpi.bg} relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-12 -mt-12 transition-all group-hover:scale-125" />
            <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center ${kpi.color} mb-4`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">{kpi.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white tracking-tighter">{formatCurrency(kpi.value)}</span>
            </div>
            <p className="text-[10px] font-medium text-zinc-500 mt-1">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-8 p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Revenue Flow</h3>
                <p className="text-[10px] text-zinc-500 font-bold">Last 7 Days Activity</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[10px] font-black text-orange-400 uppercase">
              +12.4% vs Prev
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesTrend}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="#333" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v)=>v.split('-')[2]} />
                <YAxis stroke="#333" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v)=>`₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#f97316' }}
                  cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Expenses Pie */}
        <motion.div variants={itemVariants} className="lg:col-span-4 p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Expense Split</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: 'Stock', value: data.expenses.purchases },
                    { name: 'Labour', value: data.expenses.labour },
                    { name: 'Trans', value: data.expenses.transport },
                    { name: 'Gen', value: data.expenses.general },
                  ]} 
                  cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none"
                >
                  {[0,1,2,3].map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f0f1a', borderRadius: '12px', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {['Purchases', 'Labour', 'Transport', 'General'].map((n, i) => (
              <div key={n} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{n}</span>
                </div>
                <span className="text-[11px] font-black text-zinc-300 tracking-tighter">{formatCurrency(Object.values(data.expenses)[i])}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Bake Land Mini Dashboard */}
        <motion.div variants={itemVariants} className="p-8 rounded-[2rem] border border-purple-500/10 bg-gradient-to-br from-purple-500/5 to-transparent relative group">
           <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <CakeSlice className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Bake Land</h3>
                <p className="text-[10px] text-zinc-500 font-bold">Daily Counter Sales</p>
              </div>
            </div>
            <Link href="/dashboard/bake-land/sales" className="p-2 rounded-xl bg-white/5 hover:bg-purple-500/10 text-zinc-500 hover:text-purple-400 transition-all">
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tighter">{formatCurrency(data.bakeryDailySales.total)}</span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Today</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Cash</p>
                <p className="text-[10px] font-black text-emerald-400">{formatCurrency(data.bakeryDailySales.cash)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">UPI</p>
                <p className="text-[10px] font-black text-blue-400">{formatCurrency(data.bakeryDailySales.upi)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Card</p>
                <p className="text-[10px] font-black text-purple-400">{formatCurrency(data.bakeryDailySales.card)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Low Stock Widget */}
        <motion.div variants={itemVariants} className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
           <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Inventory Alerts</h3>
              <p className="text-[10px] text-zinc-500 font-bold">{data.lowStockAlerts} items below limit</p>
            </div>
          </div>
          <div className="space-y-3">
            {data.lowStockItems?.length > 0 ? (
              data.lowStockItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-red-500/5 border border-red-500/10">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-200">{item.material?.name}</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">{item.material?.unit}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-red-400 tracking-tighter">{item.quantity}</p>
                    <p className="text-[8px] text-zinc-600 font-bold uppercase">Left</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-xs text-zinc-600 italic">Inventory looks healthy ✓</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity List */}
        <motion.div variants={itemVariants} className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
           <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Latest Invoices</h3>
              <p className="text-[10px] text-zinc-500 font-bold">Real-time Activity</p>
            </div>
          </div>
          <div className="space-y-4">
            {data.recentInvoices?.map((inv, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-zinc-500">#{inv.invoiceNumber.slice(-3)}</div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-zinc-200 group-hover:text-orange-400 transition-colors">{inv.customer?.name}</span>
                    <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">{formatDate(inv.createdAt)}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-white tracking-tighter">{formatCurrency(inv.grandTotal)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
