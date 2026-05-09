'use client';

import { motion } from 'framer-motion';
import { Zap, TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from 'lucide-react';

const insights = [
  { type: 'success', icon: TrendingUp, title: 'Revenue Growing', message: 'Your weekly revenue has increased by 12% compared to last week. Brick sales are driving this growth.', color: 'emerald' },
  { type: 'warning', icon: AlertTriangle, title: 'Stock Alert', message: 'Cement stock is below minimum level. Based on current sales velocity, you\'ll run out in 3 days. Order now.', color: 'amber' },
  { type: 'info', icon: Lightbulb, title: 'Price Optimization', message: 'Consider increasing 4-inch brick rate by ₹0.50. Current market rate is ₹12, you\'re selling at ₹11.', color: 'blue' },
  { type: 'success', icon: BarChart3, title: 'Worker Productivity', message: 'Worker productivity up 8% this week. Average punch count increased from 450 to 486 per day.', color: 'purple' },
  { type: 'info', icon: Lightbulb, title: 'Payment Collection', message: '₹1,25,000 pending from 18 customers. Send WhatsApp reminders to customers with dues over 7 days.', color: 'orange' },
  { type: 'warning', icon: AlertTriangle, title: 'Bakery Wastage', message: 'Bakery wastage is 8% this month, above the 5% threshold. Review production quantities.', color: 'red' },
];

export default function AIInsightsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-zinc-100">AI Insights</h1><p className="text-sm text-zinc-500">AI-powered business intelligence & predictions</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`rounded-2xl border bg-white/[0.02] p-5 border-${insight.color}-500/10`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl bg-${insight.color}-500/10 flex items-center justify-center shrink-0`}>
                <insight.icon className={`w-4 h-4 text-${insight.color}-400`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">{insight.title}</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{insight.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-orange-500/10 bg-gradient-to-br from-orange-500/5 to-purple-500/5 p-6 text-center">
        <Zap className="w-8 h-8 text-orange-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-zinc-200">AI Analysis Engine</h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">Powered by Google Gemini AI. Analyzes your sales, expenses, stock, and worker data to provide actionable business insights.</p>
        <button className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-orange-500/25">Generate Full Report</button>
      </div>
    </motion.div>
  );
}
