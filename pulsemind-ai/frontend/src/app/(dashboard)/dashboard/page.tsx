"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Brain, TrendingUp, AlertTriangle, MessageSquare, Star, Flame, Heart, Sparkles, Zap, BarChart3, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores";
import { analyticsAPI, feedbackAPI, adminAPI } from "@/lib/api";
import { formatDate, getRiskColor, getStatusColor } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar } from "recharts";

const moodData = [
  { day: "Mon", score: 72 }, { day: "Tue", score: 68 }, { day: "Wed", score: 75 }, { day: "Thu", score: 65 }, { day: "Fri", score: 80 }, { day: "Sat", score: 85 }, { day: "Sun", score: 78 },
];

const emotionData = [
  { name: "Satisfied", value: 35, color: "#22c55e" }, { name: "Neutral", value: 25, color: "#8b5cf6" },
  { name: "Stressed", value: 20, color: "#f97316" }, { name: "Frustrated", value: 12, color: "#f59e0b" }, { name: "Motivated", value: 8, color: "#3b82f6" },
];

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const [health, setHealth] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [burnout, setBurnout] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [h, f, n] = await Promise.all([
          analyticsAPI.getHealth().catch(() => ({ data: null })),
          feedbackAPI.getMy().catch(() => ({ data: [] })),
          adminAPI.getNotifications().catch(() => ({ data: [] })),
        ]);
        setHealth(h.data);
        setFeedbacks(Array.isArray(f.data) ? f.data : []);
        setNotifications(Array.isArray(n.data) ? n.data.slice(0, 5) : []);
        if (user?.id) {
          const b = await analyticsAPI.getBurnout(user.id).catch(() => ({ data: null }));
          setBurnout(b.data);
        }
      } catch (e) { console.error(e); }
    };
    load();
  }, [user?.id]);

  const wellnessScore = burnout ? 100 - burnout.score : 78;
  const wellnessData = [{ name: "Wellness", value: wellnessScore, fill: wellnessScore > 70 ? "#22c55e" : wellnessScore > 40 ? "#f59e0b" : "#ef4444" }];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome */}
      <motion.div variants={item} className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Welcome back, <span className="gradient-text">{user?.firstName || "User"}</span> 👋
            </h1>
            <p className="text-gray-400">{user?.jobTitle || "Employee"} • {user?.department?.name || "General"}</p>
          </div>
          <Link href="/dashboard/feedback"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all">
            <MessageSquare className="w-4 h-4" /> Submit Feedback
          </Link>
        </div>
      </motion.div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Wellness Score", value: `${wellnessScore}%`, icon: Heart, color: "from-emerald-500 to-teal-500", change: "+5%" },
          { label: "Burnout Risk", value: burnout?.riskLevel || "LOW", icon: Flame, color: "from-orange-500 to-red-500", change: burnout?.score ? `${burnout.score}%` : "12%" },
          { label: "Feedbacks Given", value: feedbacks.length.toString(), icon: MessageSquare, color: "from-blue-500 to-cyan-500", change: "This month" },
          { label: "Org Health", value: health ? `${health.overallScore}%` : "82%", icon: Activity, color: "from-purple-500 to-pink-500", change: "+3%" },
        ].map((card, i) => (
          <motion.div key={i} variants={item} className="stat-card group">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-gray-400 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-emerald-400 mt-1">{card.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wellness Gauge */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> AI Wellness Score
          </h3>
          <div className="flex justify-center">
            <ResponsiveContainer width={180} height={180}>
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={wellnessData} startAngle={180} endAngle={0}>
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "rgba(255,255,255,0.05)" }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-8">
            <p className="text-4xl font-bold gradient-text">{wellnessScore}</p>
            <p className="text-sm text-gray-400">out of 100</p>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-xs text-gray-400">
              <Zap className="w-3 h-3 inline text-purple-400 mr-1" />
              {wellnessScore > 70 ? "Great! Your wellness is above average." : "Consider taking breaks and managing workload."}
            </p>
          </div>
        </motion.div>

        {/* Mood Trend */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> Mood Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={moodData}>
              <defs>
                <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[50, 100]} />
              <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
              <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fill="url(#moodGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Emotion Distribution */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-pink-400" /> Emotion Distribution
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={emotionData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                {emotionData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {emotionData.map((e, i) => (
              <span key={i} className="flex items-center gap-1 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />{e.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Feedbacks */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-300">Recent Feedbacks</h3>
            <Link href="/dashboard/history" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {(feedbacks.length > 0 ? feedbacks.slice(0, 4) : [
              { id: "1", title: "Workload concerns", category: "COMPLAINT", status: "AI_PROCESSING", createdAt: new Date().toISOString() },
              { id: "2", title: "Great team collaboration", category: "SATISFACTION", status: "RESOLVED", createdAt: new Date().toISOString() },
              { id: "3", title: "Need better tools", category: "SUGGESTION", status: "SUBMITTED", createdAt: new Date().toISOString() },
            ]).map((f: any) => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition">
                <div>
                  <p className="text-sm text-white font-medium">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.category?.replace(/_/g, " ")} • {formatDate(f.createdAt)}</p>
                </div>
                <span className={`badge-pill text-xs ${getStatusColor(f.status)}`}>{f.status?.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-300">Recent Notifications</h3>
            <Link href="/dashboard/notifications" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {(notifications.length > 0 ? notifications : [
              { id: "1", title: "Feedback Analyzed", message: "AI has processed your latest feedback", type: "SUCCESS", isRead: false, createdAt: new Date().toISOString() },
              { id: "2", title: "Badge Earned!", message: "You earned the Helpful Voice badge", type: "INFO", isRead: false, createdAt: new Date().toISOString() },
              { id: "3", title: "Wellness Tip", message: "Consider taking a short break today", type: "AI_INSIGHT", isRead: true, createdAt: new Date().toISOString() },
            ]).map((n: any) => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl transition ${n.isRead ? "bg-transparent" : "bg-white/[0.03]"}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.isRead ? "bg-gray-600" : "bg-purple-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{n.title}</p>
                  <p className="text-xs text-gray-500 truncate">{n.message}</p>
                </div>
                <span className="text-xs text-gray-600 flex-shrink-0">{formatDate(n.createdAt)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Encouragement */}
      <motion.div variants={item} className="glass-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">AI Insight for You</p>
            <p className="text-sm text-gray-400 mt-0.5">
              {wellnessScore > 70
                ? "You&apos;re doing great! Your engagement and wellness scores are above average. Keep up the good work! 🌟"
                : "We noticed your stress levels have been higher than usual. Consider talking to your manager about workload balancing. Your wellbeing matters! 💙"}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
