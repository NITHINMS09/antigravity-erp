// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, IndianRupee, AlertTriangle, Users, Truck,
  HardHat, Zap, ArrowUpRight, Package, ShoppingCart, CakeSlice
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/constants';

interface DashboardData {
  dailySales: { total: number; count: number };
  weeklySales: { total: number; count: number };
  monthlySales: { total: number; count: number };
  monthlyProfit: number;
  pendingPayments: { total: number; count: number };
  lowStockAlerts: number;
  expenses: { labour: number; transport: number; general: number; purchases: number };
  bakeryDailySales: { total: number; cash: number; upi: number; card: number };
  recentInvoices: any[];
  salesTrend: { date: string; sales: number }[];
}

const COLORS = ['#f97316', '#a855f7', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899'];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const item = {
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
        // Use demo data on error
        setData({
          dailySales: { total: 45200, count: 12 },
          weeklySales: { total: 287500, count: 68 },
          monthlySales: { total: 1245000, count: 286 },
          monthlyProfit: 385000,
          pendingPayments: { total: 125000, count: 18 },
          lowStockAlerts: 3,
          expenses: { labour: 85000, transport: 42000, general: 28000, purchases: 705000 },
          bakeryDailySales: { total: 8500, cash: 5200, upi: 2800, card: 500 },
          recentInvoices: [],
          salesTrend: [
            { date: '2026-05-03', sales: 38000 },
            { date: '2026-05-04', sales: 42000 },
            { date: '2026-05-05', sales: 35000 },
            { date: '2026-05-06', sales: 51000 },
            { date: '2026-05-07', sales: 47000 },
            { date: '2026-05-08', sales: 55000 },
            { date: '2026-05-09', sales: 45200 },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const kpiCards = [
    { title: 'Daily Sales', value: formatCurrency(data.dailySales.total), sub: `${data.dailySales.count} invoices`, icon: IndianRupee, trend: '+12%', trendUp: true, gradient: 'from-orange-500/20 to-orange-500/5', iconColor: 'text-orange-400', borderColor: 'border-orange-500/20' },
    { title: 'Weekly Sales', value: formatCurrency(data.weeklySales.total), sub: `${data.weeklySales.count} invoices`, icon: TrendingUp, trend: '+8%', trendUp: true, gradient: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400', borderColor: 'border-blue-500/20' },
    { title: 'Monthly Profit', value: formatCurrency(data.monthlyProfit), sub: 'After all expenses', icon: TrendingUp, trend: '+15%', trendUp: true, gradient: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400', borderColor: 'border-emerald-500/20' },
    { title: 'Pending Payments', value: formatCurrency(data.pendingPayments.total), sub: `${data.pendingPayments.count} customers`, icon: AlertTriangle, trend: '', trendUp: false, gradient: 'from-amber-500/20 to-amber-500/5', iconColor: 'text-amber-400', borderColor: 'border-amber-500/20' },
    { title: 'Labour Expenses', value: formatCurrency(data.expenses.labour), sub: 'This month', icon: HardHat, trend: '-3%', trendUp: false, gradient: 'from-purple-500/20 to-purple-500/5', iconColor: 'text-purple-400', borderColor: 'border-purple-500/20' },
    { title: 'Transport Expenses', value: formatCurrency(data.expenses.transport), sub: 'This month', icon: Truck, trend: '+5%', trendUp: true, gradient: 'from-pink-500/20 to-pink-500/5', iconColor: 'text-pink-400', borderColor: 'border-pink-500/20' },
  ];

  const expenseData = [
    { name: 'Purchases', value: data.expenses.purchases },
    { name: 'Labour', value: data.expenses.labour },
    { name: 'Transport', value: data.expenses.transport },
    { name: 'General', value: data.expenses.general },
  ];

  const bakeryData = [
    { name: 'Cash', value: data.bakeryDailySales.cash },
    { name: 'UPI', value: data.bakeryDailySales.upi },
    { name: 'Card', value: data.bakeryDailySales.card },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Welcome back! Here&apos;s your business overview.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Live</span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.title}
            variants={item}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className={`rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.gradient} p-4 relative overflow-hidden group`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center ${card.iconColor}`}>
                <card.icon className="w-[18px] h-[18px]" />
              </div>
              {card.trend && (
                <span className={`text-[10px] font-medium flex items-center gap-0.5 ${card.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.trend}
                </span>
              )}
            </div>
            <p className="text-lg md:text-xl font-bold text-zinc-100">{card.value}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{card.title}</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Trend */}
        <motion.div variants={item} className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">Sales Trend</h3>
              <p className="text-xs text-zinc-600">Last 7 days</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
              <ArrowUpRight className="w-3 h-3" /> +12.5%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.salesTrend}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="date" stroke="#333" fontSize={10} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
              <YAxis stroke="#333" fontSize={10} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                formatter={(value: any) => [formatCurrency(value), 'Sales']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={2} fill="url(#salesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div variants={item} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-1">Expense Breakdown</h3>
          <p className="text-xs text-zinc-600 mb-4">This month</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={expenseData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {expenseData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                formatter={(value: any) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {expenseData.map((e, i) => (
              <div key={e.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-[11px] text-zinc-500">{e.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Bakery Sales */}
        <motion.div variants={item} className="rounded-2xl border border-purple-500/10 bg-purple-500/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CakeSlice className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-zinc-200">BAKE LAND Today</h3>
          </div>
          <p className="text-2xl font-bold text-zinc-100 mb-4">{formatCurrency(data.bakeryDailySales.total)}</p>
          <div className="space-y-2">
            {bakeryData.map((b, i) => (
              <div key={b.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs text-zinc-400">{b.name}</span>
                </div>
                <span className="text-xs font-medium text-zinc-300">{formatCurrency(b.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stock Alerts */}
        <motion.div variants={item} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Stock Alerts</h3>
            {data.lowStockAlerts > 0 && (
              <span className="ml-auto text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">{data.lowStockAlerts} low</span>
            )}
          </div>
          {data.lowStockAlerts === 0 ? (
            <p className="text-xs text-zinc-600">All stock levels are healthy ✓</p>
          ) : (
            <div className="space-y-3">
              {['Cement', '4 Inch Brick', 'Dust'].slice(0, data.lowStockAlerts).map((mat) => (
                <div key={mat} className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                  <span className="text-xs text-zinc-300">{mat}</span>
                  <span className="text-[10px] text-red-400 font-medium">Low Stock</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={item} className="rounded-2xl border border-orange-500/10 bg-gradient-to-br from-orange-500/5 to-purple-500/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-semibold text-zinc-200">AI Insights</h3>
            <span className="ml-auto text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full">AI</span>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-emerald-400 font-medium mb-1">📈 Growth Detected</p>
              <p className="text-[11px] text-zinc-500">Weekly sales up by 12%. Brick demand increasing.</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-amber-400 font-medium mb-1">⚡ Action Required</p>
              <p className="text-[11px] text-zinc-500">Restock cement before Friday. Current level critical.</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-blue-400 font-medium mb-1">💡 Suggestion</p>
              <p className="text-[11px] text-zinc-500">Send payment reminders to 8 customers with ₹1.25L dues.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Monthly comparison chart */}
      <motion.div variants={item} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-1">Monthly Comparison</h3>
        <p className="text-xs text-zinc-600 mb-4">Revenue vs Expenses</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={[
            { month: 'Jan', revenue: 980000, expense: 720000 },
            { month: 'Feb', revenue: 1050000, expense: 680000 },
            { month: 'Mar', revenue: 1180000, expense: 750000 },
            { month: 'Apr', revenue: 1120000, expense: 790000 },
            { month: 'May', revenue: 1245000, expense: 860000 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="month" stroke="#333" fontSize={11} />
            <YAxis stroke="#333" fontSize={10} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
              formatter={(value: any) => formatCurrency(value)}
            />
            <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expense" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
