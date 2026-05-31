"use client";
import { motion } from "framer-motion";
import { AlertTriangle, Shield, Flame } from "lucide-react";
import { getRiskColor, getRiskBg, formatDate } from "@/lib/utils";

const toxicityReports = [
  { id: 1, title: "Hostile behavior during meetings", dept: "Sales", severity: "CRITICAL", reporter: "Anonymous", date: new Date().toISOString(), details: "Team lead uses abusive language and creates hostile environment. Multiple witnesses.", status: "INVESTIGATING" },
  { id: 2, title: "Discriminatory comments", dept: "Engineering", severity: "HIGH", reporter: "Anonymous", date: new Date(Date.now() - 86400000).toISOString(), details: "Inappropriate comments about background during team standup.", status: "REPORTED" },
  { id: 3, title: "Bullying behavior", dept: "Marketing", severity: "HIGH", reporter: "Anonymous", date: new Date(Date.now() - 172800000).toISOString(), details: "Consistent belittling of work and public humiliation.", status: "UNDER_REVIEW" },
  { id: 4, title: "Passive aggressive communication", dept: "Finance", severity: "MEDIUM", reporter: "Employee #PM-015", date: new Date(Date.now() - 259200000).toISOString(), details: "Consistent passive-aggressive email tone creating uncomfortable work environment.", status: "RESOLVED" },
];

export default function ToxicityPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-red-400" /> Toxicity Reports</h1>
        <div className="flex items-center gap-2"><div className="pulse-dot"><span className="bg-red-400"></span><span className="bg-red-500"></span></div><span className="text-sm text-red-400">2 Critical</span></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Reports", value: "4", color: "text-white" },
          { label: "Critical", value: "1", color: "text-red-400" },
          { label: "Under Investigation", value: "2", color: "text-amber-400" },
          { label: "Resolved", value: "1", color: "text-emerald-400" },
        ].map((s, i) => <div key={i} className="stat-card text-center"><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500 mt-1">{s.label}</p></div>)}
      </div>

      <div className="space-y-4">
        {toxicityReports.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`glass-card p-6 border-l-4 ${r.severity === "CRITICAL" ? "border-l-red-500" : r.severity === "HIGH" ? "border-l-orange-500" : "border-l-amber-500"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-medium">{r.title}</h3>
                  <span className={`badge-pill ${getRiskBg(r.severity)} ${getRiskColor(r.severity)}`}>{r.severity}</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{r.details}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>🏢 {r.dept}</span><span>👤 {r.reporter}</span><span>📅 {formatDate(r.date)}</span>
                </div>
              </div>
              <span className={`badge-pill text-xs ${r.status === "RESOLVED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : r.status === "INVESTIGATING" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>
                {r.status?.replace(/_/g, " ")}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
