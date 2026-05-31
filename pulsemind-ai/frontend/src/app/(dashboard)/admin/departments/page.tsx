"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Users } from "lucide-react";
import { analyticsAPI } from "@/lib/api";
import { getRiskColor, getRiskBg } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DepartmentsPage() {
  const [depts, setDepts] = useState<any[]>([]);

  useEffect(() => {
    analyticsAPI.getDepartments().then(r => setDepts(r.data || [])).catch(() => setDepts([
      { name: "Engineering", satisfactionScore: 62, stressScore: 72, feedbackCount: 45, employeeCount: 80, burnoutRisk: "HIGH", topIssues: ["Workload", "Deadline Pressure"], trend: "declining" },
      { name: "Sales", satisfactionScore: 48, stressScore: 85, feedbackCount: 32, employeeCount: 45, burnoutRisk: "CRITICAL", topIssues: ["Toxicity", "Manager Issue"], trend: "declining" },
      { name: "HR", satisfactionScore: 78, stressScore: 35, feedbackCount: 18, employeeCount: 20, burnoutRisk: "LOW", topIssues: ["Communication"], trend: "improving" },
      { name: "Marketing", satisfactionScore: 55, stressScore: 65, feedbackCount: 28, employeeCount: 35, burnoutRisk: "MEDIUM", topIssues: ["Workload", "Career Growth"], trend: "stable" },
      { name: "Operations", satisfactionScore: 82, stressScore: 40, feedbackCount: 22, employeeCount: 50, burnoutRisk: "LOW", topIssues: ["Infrastructure"], trend: "improving" },
      { name: "Finance", satisfactionScore: 70, stressScore: 50, feedbackCount: 11, employeeCount: 15, burnoutRisk: "MEDIUM", topIssues: ["Payroll"], trend: "stable" },
    ]));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Shield className="w-6 h-6 text-purple-400" /> Department Intelligence</h1>

      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Satisfaction vs Stress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={depts} barGap={4}>
            <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
            <Bar dataKey="satisfactionScore" fill="#22c55e" radius={[4, 4, 0, 0]} name="Satisfaction" />
            <Bar dataKey="stressScore" fill="#f97316" radius={[4, 4, 0, 0]} name="Stress" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {depts.map((d, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
            className="glass-card-hover p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white">{d.name}</h3>
              <span className={`badge-pill ${getRiskBg(d.burnoutRisk)} ${getRiskColor(d.burnoutRisk)}`}>{d.burnoutRisk}</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Satisfaction</span><span className="text-emerald-400 font-medium">{d.satisfactionScore}%</span></div>
              <div className="w-full h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${d.satisfactionScore}%` }} /></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Stress</span><span className="text-orange-400 font-medium">{d.stressScore}%</span></div>
              <div className="w-full h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full bg-orange-500" style={{ width: `${d.stressScore}%` }} /></div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> {d.employeeCount || "N/A"}</span>
                <span className="text-xs text-gray-500">{d.feedbackCount} feedbacks</span>
                <span className={`text-xs font-medium ${d.trend === "improving" ? "text-emerald-400" : d.trend === "declining" ? "text-red-400" : "text-gray-400"}`}>
                  {d.trend === "improving" ? "↑ Improving" : d.trend === "declining" ? "↓ Declining" : "→ Stable"}
                </span>
              </div>
              {d.topIssues && <div className="flex gap-1.5 flex-wrap">{d.topIssues.map((issue: string, j: number) => (
                <span key={j} className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-gray-400 border border-white/5">{issue}</span>
              ))}</div>}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
