'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, FileText, Users, Truck, HardHat, ShoppingCart,
  BarChart3, Settings, Zap, ChevronLeft, CakeSlice, Warehouse, Receipt,
  Home, BoltIcon, Banknote, ChevronDown
} from 'lucide-react';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'POWER BRICK 🧱',
    items: [
      { href: '/dashboard/power-brick/billing', label: 'Billing', icon: FileText },
      { href: '/dashboard/power-brick/materials', label: 'Materials', icon: Package },
      { href: '/dashboard/power-brick/stock', label: 'Stock', icon: Warehouse },
      { href: '/dashboard/power-brick/purchases', label: 'Purchases', icon: ShoppingCart },
      { href: '/dashboard/power-brick/workers', label: 'Workers', icon: HardHat },
      { href: '/dashboard/power-brick/transport', label: 'Transport', icon: Truck },
      { href: '/dashboard/power-brick/loading-charges', label: 'Loading Charges', icon: BoltIcon },
    ],
  },
  {
    label: 'BAKE LAND 🍞',
    items: [
      { href: '/dashboard/bake-land/sales', label: 'Daily Sales', icon: Receipt },
      { href: '/dashboard/bake-land/products', label: 'Products', icon: CakeSlice },
      { href: '/dashboard/bake-land/inventory', label: 'Inventory', icon: Warehouse },
      { href: '/dashboard/bake-land/workers', label: 'Workers', icon: HardHat },
      { href: '/dashboard/bake-land/expenses', label: 'Expenses', icon: Banknote },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/dashboard/customers', label: 'Customers', icon: Users },
      { href: '/dashboard/expenses', label: 'Expenses', icon: Banknote },
      { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
      { href: '/dashboard/ai-insights', label: 'AI Insights', icon: Zap },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Overview': true, 'POWER BRICK 🧱': true, 'BAKE LAND 🍞': true, 'Management': true,
  });
  const pathname = usePathname();

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className={`hidden md:flex flex-col border-r border-white/5 bg-[#0a0a0f] transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <p className="text-sm font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">SK GROUPS</p>
            <p className="text-[10px] text-zinc-600 whitespace-nowrap">ERP System</p>
          </motion.div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-zinc-600 hover:text-zinc-300 transition-colors p-1">
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-2">
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <span>{group.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openGroups[group.label] ? '' : '-rotate-90'}`} />
              </button>
            )}
            <AnimatePresence>
              {(collapsed || openGroups[group.label]) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-0.5 overflow-hidden"
                >
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative group ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-500/10 to-purple-500/10 text-orange-400'
                            : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                        }`}
                        title={collapsed ? item.label : undefined}
                      >
                        {isActive && (
                          <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-orange-500 to-purple-500 rounded-r" />
                        )}
                        <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-orange-400' : ''}`} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] text-zinc-700">
            <Home className="w-3 h-3" />
            <span>v1.0.0 • Production</span>
          </div>
        </div>
      )}
    </aside>
  );
}
