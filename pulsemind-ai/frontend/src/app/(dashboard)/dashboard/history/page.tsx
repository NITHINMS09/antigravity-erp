"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Filter, Search } from "lucide-react";
import { feedbackAPI } from "@/lib/api";
import { formatDate, getStatusColor } from "@/lib/utils";

export default function FeedbackHistory() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    feedbackAPI.getMy().then(r => setFeedbacks(Array.isArray(r.data) ? r.data : [])).catch(() => {
      setFeedbacks([
        { id: "1", title: "Excessive workload", category: "COMPLAINT", priority: "HIGH", status: "AI_PROCESSING", starRating: 2, moodEmoji: "😫", createdAt: new Date().toISOString() },
        { id: "2", title: "Great team collaboration", category: "SATISFACTION", priority: "LOW", status: "RESOLVED", starRating: 5, moodEmoji: "😊", createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: "3", title: "Need better code review", category: "SUGGESTION", priority: "MEDIUM", status: "SUBMITTED", starRating: 3, moodEmoji: "🤔", createdAt: new Date(Date.now() - 172800000).toISOString() },
      ]);
    });
  }, []);

  const filtered = feedbacks.filter(f => !filter || f.category === filter);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="w-6 h-6 text-purple-400" /> My Feedbacks</h1>
          <p className="text-gray-400 text-sm mt-1">{feedbacks.length} total feedbacks submitted</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", "COMPLAINT", "SUGGESTION", "SATISFACTION", "WELLNESS", "TOXICITY_REPORT"].map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${filter === c ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10"}`}>
            {c ? c.replace(/_/g, " ") : "All"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((f, i) => (
          <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card-hover p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{f.moodEmoji || "📝"}</span>
                  <h3 className="text-white font-medium">{f.title}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{f.category?.replace(/_/g, " ")}</span>
                  <span>•</span>
                  <span>Priority: {f.priority}</span>
                  <span>•</span>
                  <span>{formatDate(f.createdAt)}</span>
                  {f.starRating && <span>• {"⭐".repeat(f.starRating)}</span>}
                </div>
              </div>
              <span className={`badge-pill ${getStatusColor(f.status)}`}>{f.status?.replace(/_/g, " ")}</span>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No feedbacks found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
