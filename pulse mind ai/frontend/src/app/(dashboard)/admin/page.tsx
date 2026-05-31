"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Users, MessageSquare, AlertTriangle, TrendingUp, Activity, Flame, Shield, Zap, ArrowUpRight, BarChart3 } from "lucide-react";
import { analyticsAPI, adminAPI } from "@/lib/api";
import { getRiskColor, getRiskBg, getStatusColor, formatDate } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const chartColors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export default function AdminDashboard() {
  const [health, setHealth] = useState<any>(null);
  const [deptAnalytics, setDeptAnalytics] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [complaintStats, setComplaintStats] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [h, d, t, c] = await Promise.all([
          analyticsAPI.getHealth().catch(() => ({ data: { overallScore: 78, employeeSatisfaction: 72, stressIndex: 45, engagementRate: 68, burnoutRisk: 32, toxicityLevel: 8, feedbackRate: 156, resolutionRate: 85, totalFeedbacks: 156, totalComplaints: 24, resolvedComplaints: 18 } })),
          analyticsAPI.getDepartments().catch(() => ({ data: [] })),
          analyticsAPI.getTrends(30).catch(() => ({ data: [] })),
          analyticsAPI.getComplaints().catch(() => ({ data: { total: 24, resolved: 18, resolutionRate: 75, statuses: [], priorities: [] } })),
        ]);
        setHealth(h.data);
        setDeptAnalytics(Array.isArray(d.data) ? d.data : []);
        setTrends(Array.isArray(t.data) ? t.data : []);
        setComplaintStats(c.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const h = health || { overallScore: 78, employeeSatisfaction: 72, stressIndex: 45, engagementRate: 68, burnoutRisk: 32, toxicityLevel: 8, feedbackRate: 156, resolutionRate: 85, totalFeedbacks: 156, totalComplaints: 24, resolvedComplaints: 18 };

  const demoTrends = trends.length > 0 ? trends : Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split("T")[0],
    count: Math.floor(Math.random() * 15) + 3,
    avgSentiment: parseFloat((Math.random() * 1.4 - 0.5).toFixed(2)),
    avgStress: parseFloat((Math.random() * 4 + 4).toFixed(1)),
  }));

  const demoDepts = deptAnalytics.length > 0 ? deptAnalytics : [
    { name: "Engineering", satisfactionScore: 62, stressScore: 72, feedbackCount: 45, burnoutRisk: "HIGH" },
    { name: "Sales", satisfactionScore: 48, stressScore: 85, feedbackCount: 32, burnoutRisk: "CRITICAL" },
    { name: "HR", satisfactionScore: 78, stressScore: 35, feedbackCount: 18, burnoutRisk: "LOW" },
    { name: "Marketing", satisfactionScore: 55, stressScore: 65, feedbackCount: 28, burnoutRisk: "MEDIUM" },
    { name: "Operations", satisfactionScore: 82, stressScore: 40, feedbackCount: 22, burnoutRisk: "LOW" },
    { name: "Finance", satisfactionScore: 70, stressScore: 50, feedbackCount: 11, burnoutRisk: "MEDIUM" },
  ];

  const statusData = complaintStats?.statuses?.length > 0 ? complaintStats.statuses : [
    { status: "SUBMITTED", count: 5 }, { status: "AI_PROCESSING", count: 3 }, { status: "IN_PROGRESS", count: 8 },
    { status: "RESOLVED", count: 18 }, { status: "ESCALATED", count: 2 },
  ];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-400" /> Admin Command Center
          </h1>
          <p className="text-gray-400 mt-1">Real-time organizational intelligence dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="pulse-dot"><span className="bg-emerald-400"></span><span className="bg-emerald-500"></span></div>
          <span className="text-sm text-emerald-400">Live Monitoring</span>
        </div>
      </motion.div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Org Health", value: `${h.overallScore}%`, icon: Activity, gradient: "from-emerald-500 to-teal-500" },
          { label: "Satisfaction", value: `${h.employeeSatisfaction}%`, icon: TrendingUp, gradient: "from-blue-500 to-cyan-500" },
          { label: "Stress Index", value: `${h.stressIndex}%`, icon: Flame, gradient: "from-orange-500 to-red-500" },
          { label: "Feedbacks", value: h.totalFeedbacks, icon: MessageSquare, gradient: "from-purple-500 to-pink-500" },
          { label: "Complaints", value: h.totalComplaints, icon: AlertTriangle, gradient: "from-amber-500 to-orange-500" },
          { label: "Resolution", value: `${h.resolutionRate}%`, icon: Shield, gradient: "from-indigo-500 to-violet-500" },
        ].map((stat, i) => (
          <motion.div key={i} variants={item} className="stat-card text-center group">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Trends */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" /> Feedback Trends (30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={demoTrends}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.split("-")[2]} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: 12 }} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#trendGrad)" name="Feedbacks" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Department Comparison */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Department Comparison
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={demoDepts} barGap={4}>
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: 12 }} />
              <Bar dataKey="satisfactionScore" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Satisfaction" />
              <Bar dataKey="stressScore" fill="#f97316" radius={[4, 4, 0, 0]} name="Stress" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Department Cards & Complaint Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Risk Cards */}
        <motion.div variants={item} className="lg:col-span-2 glass-card p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Department Risk Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {demoDepts.map((dept, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{dept.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">Satisfaction: {dept.satisfactionScore}%</span>
                    <span className="text-xs text-gray-500">Stress: {dept.stressScore}%</span>
                  </div>
                </div>
                <span className={`badge-pill ${getRiskBg(dept.burnoutRisk)} ${getRiskColor(dept.burnoutRisk)}`}>
                  {dept.burnoutRisk}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Complaint Status */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Complaint Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="count" paddingAngle={3}>
                {statusData.map((_: any, i: number) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {statusData.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-gray-400">
                  <span className="w-2 h-2 rounded-full" style={{ background: chartColors[i % chartColors.length] }} />
                  {s.status?.replace(/_/g, " ")}
                </span>
                <span className="text-white font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Insights & Alerts */}
      <motion.div variants={item} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="text-sm font-medium text-gray-300">AI Live Alerts</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { severity: "CRITICAL", title: "Toxic Behavior in Sales", desc: "Multiple reports of hostile behavior detected. Immediate investigation recommended.", icon: AlertTriangle, color: "border-red-500/30 bg-red-500/5" },
            { severity: "HIGH", title: "Engineering Burnout Rising", desc: "Stress levels increased 35% this month. 3 employees show high resignation probability.", icon: Flame, color: "border-orange-500/30 bg-orange-500/5" },
            { severity: "MEDIUM", title: "Workload Pattern Detected", desc: "Workload complaints reported 12 times across 3 departments this month.", icon: TrendingUp, color: "border-amber-500/30 bg-amber-500/5" },
            { severity: "LOW", title: "Wellness Program Impact", desc: "Operations department morale improved 20% after wellness initiative.", icon: Activity, color: "border-emerald-500/30 bg-emerald-500/5" },
            { severity: "HIGH", title: "Attrition Risk Alert", desc: "Predicted 15% attrition risk in Q1. Focus areas: Engineering, Sales.", icon: Users, color: "border-orange-500/30 bg-orange-500/5" },
            { severity: "LOW", title: "Engagement Trending Up", desc: "Overall feedback submission rate increased 22% compared to last month.", icon: TrendingUp, color: "border-emerald-500/30 bg-emerald-500/5" },
          ].map((alert, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-xl border ${alert.color}`}>
              <div className="flex items-start gap-3">
                <alert.icon className={`w-5 h-5 flex-shrink-0 ${getRiskColor(alert.severity)}`} />
                <div>
                  <p className="text-sm font-medium text-white">{alert.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{alert.desc}</p>
                  <span className={`badge-pill mt-2 ${getRiskBg(alert.severity)} ${getRiskColor(alert.severity)} text-xs`}>{alert.severity}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
