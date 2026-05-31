"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, LayoutDashboard, MessageSquarePlus, FileText, Activity, Bell, User, Settings, LogOut, Shield, BarChart3, Users, AlertTriangle, Flame, ChevronLeft, ChevronRight, Moon, Sun, Menu, X } from "lucide-react";
import { useAuthStore, useThemeStore, useNotificationStore } from "@/lib/stores";

const employeeNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/feedback", label: "Submit Feedback", icon: MessageSquarePlus },
  { href: "/dashboard/history", label: "My Feedbacks", icon: FileText },
  { href: "/dashboard/wellness", label: "Wellness Report", icon: Activity },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "AI Analytics", icon: BarChart3 },
  { href: "/admin/departments", label: "Departments", icon: Shield },
  { href: "/admin/burnout", label: "Burnout Monitor", icon: Flame },
  { href: "/admin/toxicity", label: "Toxicity Reports", icon: AlertTriangle },
  { href: "/admin/complaints", label: "Complaints", icon: FileText },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, initialize, logout } = useAuthStore();
  const { isDark, toggle: toggleTheme } = useThemeStore();
  const { unreadCount } = useNotificationStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initialize();
    // Give store time to hydrate from localStorage
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, [initialize]);

  useEffect(() => {
    if (!ready) return;
    const state = useAuthStore.getState();
    if (!state.isLoading && !state.isAuthenticated) {
      router.push("/login");
    }
  }, [ready, isAuthenticated, isLoading, router]);

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "HR_ADMIN";
  const navItems = pathname.startsWith("/admin") ? adminNav : employeeNav;

  const handleLogout = () => { logout(); router.push("/login"); };

  if (!ready || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <p className="text-gray-400 text-sm">Loading PulseMind AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 ${collapsed ? "w-20" : "w-64"} bg-[#0d0d24]/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300`}>
        <div className="p-4 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          {!collapsed && <span className="text-lg font-bold gradient-text">PulseMind</span>}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`sidebar-item ${pathname === item.href ? "active" : ""} ${collapsed ? "justify-center px-2" : ""}`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
              {item.label === "Notifications" && unreadCount > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">{unreadCount}</span>
              )}
            </Link>
          ))}

          {isAdmin && pathname.startsWith("/dashboard") && (
            <Link href="/admin" className={`sidebar-item mt-4 text-purple-400 hover:text-purple-300 ${collapsed ? "justify-center px-2" : ""}`}>
              <Shield className="w-5 h-5" />
              {!collapsed && <span className="text-sm">Admin Panel</span>}
            </Link>
          )}
          {isAdmin && pathname.startsWith("/admin") && (
            <Link href="/dashboard" className={`sidebar-item mt-4 text-cyan-400 hover:text-cyan-300 ${collapsed ? "justify-center px-2" : ""}`}>
              <LayoutDashboard className="w-5 h-5" />
              {!collapsed && <span className="text-sm">Employee View</span>}
            </Link>
          )}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <button onClick={toggleTheme} className={`sidebar-item w-full ${collapsed ? "justify-center px-2" : ""}`}>
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!collapsed && <span className="text-sm">{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          <button onClick={handleLogout} className={`sidebar-item w-full text-red-400 hover:text-red-300 ${collapsed ? "justify-center px-2" : ""}`}>
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="sidebar-item w-full justify-center">
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0d0d24]/95 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-6 h-6 text-white" />
          </button>
          <Brain className="w-7 h-7 text-purple-400" />
          <span className="font-bold gradient-text">PulseMind</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/notifications" className="relative">
            <Bell className="w-5 h-5 text-gray-400" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{unreadCount}</span>}
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 bg-black/60 z-50" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="lg:hidden fixed inset-y-0 left-0 w-72 bg-[#0d0d24] z-50 p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg font-bold gradient-text">PulseMind</span>
                </div>
                <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className={`sidebar-item ${pathname === item.href ? "active" : ""}`}>
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="mt-8 space-y-1">
                <button onClick={handleLogout} className="sidebar-item w-full text-red-400">
                  <LogOut className="w-5 h-5" /><span className="text-sm">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 ${collapsed ? "lg:ml-20" : "lg:ml-64"} transition-all duration-300 pt-16 lg:pt-0`}>
        <div className="p-4 md:p-6 lg:p-8 min-h-screen">
          <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
