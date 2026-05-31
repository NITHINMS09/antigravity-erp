"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Filter, ArrowRight } from "lucide-react";
import { adminAPI } from "@/lib/api";
import { formatDate, getStatusColor, getRiskColor, getRiskBg } from "@/lib/utils";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    adminAPI.getComplaints(statusFilter || undefined).then(r => setComplaints(Array.isArray(r.data) ? r.data : [])).catch(() => setComplaints([
      { id: "1", status: "SUBMITTED", priority: "HIGH", feedback: { title: "Excessive workload affecting health", category: "COMPLAINT", department: { name: "Engineering" } }, author: { firstName: "Arjun", lastName: "Patel" }, createdAt: new Date().toISOString() },
      { id: "2", status: "AI_PROCESSING", priority: "CRITICAL", feedback: { title: "Hostile behavior from team lead", category: "TOXICITY_REPORT", department: { name: "Sales" } }, author: { firstName: "Anonymous", lastName: "" }, createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: "3", status: "IN_PROGRESS", priority: "MEDIUM", feedback: { title: "Inadequate sales training", category: "COMPLAINT", department: { name: "Sales" } }, author: { firstName: "Vikram", lastName: "Singh" }, createdAt: new Date(Date.now() - 172800000).toISOString() },
      { id: "4", status: "RESOLVED", priority: "LOW", feedback: { title: "Office temperature too cold", category: "WORKPLACE_ISSUE", department: { name: "Operations" } }, author: { firstName: "Meera", lastName: "Nair" }, createdAt: new Date(Date.now() - 259200000).toISOString() },
    ]));
  }, [statusFilter]);

  const statuses = ["", "SUBMITTED", "AI_PROCESSING", "IN_REVIEW", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="w-6 h-6 text-purple-400" /> Complaint Management</h1>

      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs transition-all ${statusFilter === s ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10"}`}>
            {s ? s.replace(/_/g, " ") : "All"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {complaints.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card-hover p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-white font-medium">{c.feedback?.title}</h3>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                  <span>{c.feedback?.category?.replace(/_/g, " ")}</span>
                  <span>•</span>
                  <span>🏢 {c.feedback?.department?.name || "N/A"}</span>
                  <span>•</span>
                  <span>👤 {c.author?.firstName} {c.author?.lastName}</span>
                  <span>•</span>
                  <span>{formatDate(c.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge-pill ${getRiskBg(c.priority)} ${getRiskColor(c.priority)}`}>{c.priority}</span>
                <span className={`badge-pill ${getStatusColor(c.status)}`}>{c.status?.replace(/_/g, " ")}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
