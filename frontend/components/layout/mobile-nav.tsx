'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Package, BarChart3, Settings } from 'lucide-react';

const tabs = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/power-brick/billing', label: 'Billing', icon: FileText },
  { href: '/dashboard/power-brick/stock', label: 'Stock', icon: Package },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
      <div className="flex items-center justify-around py-2 px-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-orange-400' : 'text-zinc-600'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-orange-500 mt-0.5" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
