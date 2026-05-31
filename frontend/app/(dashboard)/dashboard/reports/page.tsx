
'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div><h1 className="text-2xl font-bold text-zinc-100">Reports</h1><p className="text-sm text-zinc-500">Weekly and monthly business reports</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[{title:'Weekly Report',desc:'Sales, expenses, profit for this week',period:'This Week'},{title:'Monthly Report',desc:'Complete monthly business analysis',period:'This Month'},{title:'Profit & Loss',desc:'Detailed P&L statement',period:'Custom Range'},{title:'Tax Report',desc:'GST and tax-related summary',period:'Quarterly'}].map((r,i)=>(
          <motion.div key={r.title} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-orange-500/20 transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-all"><BarChart3 className="w-5 h-5 text-blue-400" /></div>
            <h3 className="text-sm font-semibold text-zinc-200">{r.title}</h3>
            <p className="text-xs text-zinc-500 mt-1">{r.desc}</p>
            <span className="inline-block mt-3 text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-600">{r.period}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
