"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check, CheckCheck } from "lucide-react";
import { adminAPI } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

const typeStyles: Record<string, string> = {
  ALERT: "border-red-500/20 bg-red-500/5", WARNING: "border-amber-500/20 bg-amber-500/5",
  SUCCESS: "border-emerald-500/20 bg-emerald-500/5", INFO: "border-blue-500/20 bg-blue-500/5",
  AI_INSIGHT: "border-purple-500/20 bg-purple-500/5", ESCALATION: "border-orange-500/20 bg-orange-500/5",
  RESOLUTION: "border-teal-500/20 bg-teal-500/5", SYSTEM: "border-gray-500/20 bg-gray-500/5",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    adminAPI.getNotifications().then(r => setNotifications(Array.isArray(r.data) ? r.data : [])).catch(() => {
      setNotifications([
        { id: "1", type: "AI_INSIGHT", title: "Burnout Risk Analysis", message: "Your burnout risk score has decreased by 5% this week. Keep up the good work!", isRead: false, createdAt: new Date().toISOString() },
        { id: "2", type: "SUCCESS", title: "Badge Earned!", message: "You earned the 'Helpful Voice' badge for providing consistent feedback.", isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: "3", type: "INFO", title: "Feedback Processed", message: "AI has analyzed your latest complaint and generated resolution suggestions.", isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: "4", type: "ALERT", title: "Action Required", message: "Your complaint regarding workload has been escalated to the HR department.", isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
      ]);
    });
  }, []);

  const markAllRead = async () => {
    try { await adminAPI.markAllRead(); } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Bell className="w-6 h-6 text-purple-400" /> Notifications</h1>
          <p className="text-gray-400 text-sm mt-1">{notifications.filter(n => !n.isRead).length} unread</p>
        </div>
        <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 text-sm">
          <CheckCheck className="w-4 h-4" /> Mark all read
        </button>
      </div>
      <div className="space-y-3">
        {notifications.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className={`glass-card p-5 border ${typeStyles[n.type] || typeStyles.SYSTEM} ${!n.isRead ? "ring-1 ring-purple-500/20" : ""}`}>
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.isRead ? "bg-gray-600" : "bg-purple-400"}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-white">{n.title}</h3>
                  <span className="text-xs text-gray-600">{n.type?.replace(/_/g, " ")}</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{n.message}</p>
                <p className="text-xs text-gray-600 mt-2">{formatDateTime(n.createdAt)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
