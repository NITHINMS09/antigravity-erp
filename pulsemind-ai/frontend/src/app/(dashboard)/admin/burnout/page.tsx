"use client";
import { motion } from "framer-motion";
import { Flame, AlertTriangle, Users, TrendingUp } from "lucide-react";
import { getRiskColor, getRiskBg } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const burnoutData = [
  { name: "Arjun P.", dept: "Engineering", score: 78, risk: "HIGH", factors: ["Overwork", "Deadline Pressure"], resignProb: 65 },
  { name: "Vikram S.", dept: "Sales", score: 85, risk: "CRITICAL", factors: ["Toxic Environment", "No Support"], resignProb: 82 },
  { name: "Karthik R.", dept: "Marketing", score: 62, risk: "HIGH", factors: ["Workload", "Career Stagnation"], resignProb: 48 },
  { name: "Sneha G.", dept: "Engineering", score: 42, risk: "MEDIUM", factors: ["Moderate Stress"], resignProb: 25 },
  { name: "Meera N.", dept: "Operations", score: 22, risk: "LOW", factors: ["Normal Workload"], resignProb: 10 },
];

const deptBurnout = [
  { dept: "Engineering", avgScore: 58 }, { dept: "Sales", avgScore: 75 }, { dept: "HR", avgScore: 25 },
  { dept: "Marketing", avgScore: 52 }, { dept: "Operations", avgScore: 28 }, { dept: "Finance", avgScore: 40 },
];

export default function BurnoutPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Flame className="w-6 h-6 text-orange-400" /> Burnout Monitoring</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "High Risk Employees", value: "3", color: "from-red-500 to-orange-500" },
          { label: "Avg Burnout Score", value: "48%", color: "from-orange-500 to-amber-500" },
          { label: "Resignation Risk", value: "15%", color: "from-purple-500 to-pink-500" },
          { label: "Improving", value: "62%", color: "from-emerald-500 to-teal-500" },
        ].map((s, i) => (
          <div key={i} className="stat-card text-center">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Department Burnout Scores</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={deptBurnout}>
            <XAxis dataKey="dept" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
            <Bar dataKey="avgScore" radius={[6, 6, 0, 0]} name="Burnout Score">
              {deptBurnout.map((d, i) => (
                <rect key={i} fill={d.avgScore > 60 ? "#ef4444" : d.avgScore > 40 ? "#f59e0b" : "#22c55e"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Employee Burnout Risk</h3>
        <div className="space-y-3">
          {burnoutData.map((emp, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                  {emp.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{emp.name}</p>
                  <p className="text-xs text-gray-500">{emp.dept} • Factors: {emp.factors.join(", ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{emp.score}%</p>
                  <p className="text-xs text-gray-500">Resign: {emp.resignProb}%</p>
                </div>
                <span className={`badge-pill ${getRiskBg(emp.risk)} ${getRiskColor(emp.risk)}`}>{emp.risk}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
