'use client';

import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useRouter } from 'next/navigation';
import { Bell, Moon, Sun, Search, LogOut, User, Menu } from 'lucide-react';
import { useState } from 'react';
import { ROLES } from '@/lib/constants';

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const roleInfo = user?.role ? ROLES[user.role as keyof typeof ROLES] : null;

  return (
    <header className="h-16 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0 z-40">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-3 flex-1">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-zinc-400 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-600" />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none w-full"
          />
          <kbd className="hidden md:inline text-[10px] text-zinc-700 bg-white/5 px-1.5 py-0.5 rounded">⌘K</kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="p-2 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all">
          {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        <button className="p-2 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-zinc-200">{user?.name}</p>
              <p className="text-[10px]" style={{ color: roleInfo?.color || '#888' }}>{roleInfo?.label || user?.role}</p>
            </div>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-[#0f0f1a] shadow-2xl z-50 p-2">
                <div className="px-3 py-2 border-b border-white/5 mb-2">
                  <p className="text-sm font-medium text-zinc-200">{user?.name}</p>
                  <p className="text-xs text-zinc-500">{user?.email}</p>
                </div>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-all">
                  <User className="w-4 h-4" /> Profile
                </button>
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition-all">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
