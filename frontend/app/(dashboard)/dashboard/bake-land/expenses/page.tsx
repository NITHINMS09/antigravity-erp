
'use client';
import { motion } from 'framer-motion';
import { Banknote } from 'lucide-react';

export default function BakeryExpensesPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
      <div><h1 className="text-2xl font-bold text-zinc-100">Bakery Expenses</h1><p className="text-sm text-zinc-500">Track BAKE LAND daily expenses</p></div>
      <div className="rounded-2xl border border-purple-500/10 bg-purple-500/5 p-8 text-center">
        <Banknote className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Record bakery labour, raw material, and daily expenses.</p>
      </div>
    </motion.div>
  );
}
