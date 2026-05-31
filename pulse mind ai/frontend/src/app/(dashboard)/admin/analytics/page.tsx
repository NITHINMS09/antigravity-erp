"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Brain, TrendingUp, Zap } from "lucide-react";
import { analyticsAPI } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"];

export default function AdminAnalytics() {
  const [emotions, setEmotions] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getEmotions().catch(() => ({ data: [] })),
      analyticsAPI.getTrends(30).catch(() => ({ data: [] })),
      analyticsAPI.getDepartments().catch(() => ({ data: [] })),
    ]).then(([e, t, d]) => {
      setEmotions(e.data?.length ? e.data : [
        { emotion: "SATISFACTION", count: 35 }, { emotion: "STRESS", count: 28 }, { emotion: "FRUSTRATION", count: 22 },
        { emotion: "NEUTRAL", count: 18 }, { emotion: "MOTIVATION", count: 15 }, { emotion: "ANGER", count: 8 }, { emotion: "ANXIETY", count: 12 },
      ]);
      setTrends(t.data?.length ? t.data : Array.from({ length: 14 }, (_, i) => ({
        date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split("T")[0],
        count: Math.floor(Math.random() * 12) + 3,
        avgSentiment: parseFloat((Math.random() * 1.2 - 0.4).toFixed(2)),
        avgStress: parseFloat((Math.random() * 3 + 4).toFixed(1)),
      })));
      setDepts(d.data?.length ? d.data : [
        { name: "Engineering", satisfactionScore: 62, stressScore: 72, feedbackCount: 45 },
        { name: "Sales", satisfactionScore: 48, stressScore: 85, feedbackCount: 32 },
        { name: "HR", satisfactionScore: 78, stressScore: 35, feedbackCount: 18 },
        { name: "Marketing", satisfactionScore: 55, stressScore: 65, feedbackCount: 28 },
        { name: "Operations", satisfactionScore: 82, stressScore: 40, feedbackCount: 22 },
      ]);
    });
  }, []);

  const radarData = depts.map(d => ({ dept: d.name, satisfaction: d.satisfactionScore, stress: d.stressScore }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart3 className="w-6 h-6 text-cyan-400" /> AI Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Emotion Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={emotions} cx="50%" cy="50%" outerRadius={90} dataKey="count" label={({ emotion, count }: any) => `${emotion} (${count})`} labelLine={false}>
                {emotions.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Sentiment Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trends}>
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v.split("-")[2]} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
              <Legend />
              <Line type="monotone" dataKey="avgSentiment" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Sentiment" />
              <Line type="monotone" dataKey="avgStress" stroke="#f97316" strokeWidth={2} dot={false} name="Stress" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Department Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="dept" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <Radar name="Satisfaction" dataKey="satisfaction" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
              <Radar name="Stress" dataKey="stress" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
              <Legend />
              <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Feedback Volume</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={depts}>
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
              <Bar dataKey="feedbackCount" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Feedbacks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
