"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Heart, Brain, Flame, TrendingUp, Sparkles, Shield } from "lucide-react";
import { useAuthStore } from "@/lib/stores";
import { analyticsAPI } from "@/lib/api";
import { RadialBarChart, RadialBar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export default function WellnessPage() {
  const { user } = useAuthStore();
  const [burnout, setBurnout] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      analyticsAPI.getBurnout(user.id).then(r => setBurnout(r.data)).catch(() => setBurnout({ score: 35, riskLevel: "MEDIUM", factors: ["Moderate workload", "Occasional deadline pressure"], recommendations: ["Take regular breaks", "Practice mindfulness", "Communicate workload concerns"], resignationProbability: 22 }));
    }
  }, [user?.id]);

  const b = burnout || { score: 35, riskLevel: "MEDIUM", factors: ["Moderate workload"], recommendations: ["Take breaks", "Practice mindfulness"], resignationProbability: 22 };
  const wellnessScore = 100 - b.score;

  const weeklyMood = [
    { day: "Mon", wellness: 72, stress: 45 }, { day: "Tue", wellness: 68, stress: 52 }, { day: "Wed", wellness: 75, stress: 40 },
    { day: "Thu", wellness: 65, stress: 58 }, { day: "Fri", wellness: 80, stress: 35 }, { day: "Sat", wellness: 85, stress: 25 }, { day: "Sun", wellness: 78, stress: 30 },
  ];

  const gaugeData = [{ name: "Score", value: wellnessScore, fill: wellnessScore > 70 ? "#22c55e" : wellnessScore > 40 ? "#f59e0b" : "#ef4444" }];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Activity className="w-6 h-6 text-emerald-400" /> AI Wellness Report</h1>
        <p className="text-gray-400 text-sm mt-1">Your personalized wellness analysis powered by AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Wellness Score", value: `${wellnessScore}%`, icon: Heart, color: "from-emerald-500 to-teal-500" },
          { label: "Burnout Risk", value: b.riskLevel, icon: Flame, color: "from-orange-500 to-red-500" },
          { label: "Burnout Score", value: `${b.score}%`, icon: Activity, color: "from-purple-500 to-pink-500" },
          { label: "Resignation Risk", value: `${b.resignationProbability}%`, icon: TrendingUp, color: "from-blue-500 to-cyan-500" },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="stat-card group">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-gray-400">{card.label}</p>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2"><Brain className="w-4 h-4 text-purple-400" /> Wellness Gauge</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width={220} height={220}>
              <RadialBarChart innerRadius="65%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0}>
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "rgba(255,255,255,0.05)" }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-12">
            <p className="text-5xl font-bold gradient-text">{wellnessScore}</p>
            <p className="text-sm text-gray-400">out of 100</p>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Weekly Wellness Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyMood}>
              <defs>
                <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="100%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                <linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity={0.3} /><stop offset="100%" stopColor="#f97316" stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#1a1a3e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
              <Area type="monotone" dataKey="wellness" stroke="#22c55e" strokeWidth={2} fill="url(#wGrad)" name="Wellness" />
              <Area type="monotone" dataKey="stress" stroke="#f97316" strokeWidth={2} fill="url(#sGrad)" name="Stress" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2"><AlertTriangleIcon /> Risk Factors</h3>
          <div className="space-y-3">
            {b.factors.map((f: string, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="text-sm text-gray-300">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> AI Recommendations</h3>
          <div className="space-y-3">
            {b.recommendations.map((r: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <span className="text-lg">💡</span>
                <span className="text-sm text-gray-300">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AlertTriangleIcon() {
  return <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
}
