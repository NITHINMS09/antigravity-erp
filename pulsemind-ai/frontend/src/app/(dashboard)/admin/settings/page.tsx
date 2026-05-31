"use client";
import { motion } from "framer-motion";
import { Settings, Brain, Bell, Shield, Database, Globe, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="w-6 h-6 text-gray-400" /> Organization Settings</h1>

      {[
        { icon: Brain, title: "AI Configuration", desc: "Configure AI model settings, analysis thresholds, and automation rules.",
          settings: [
            { label: "Auto-analyze feedbacks", type: "toggle", value: true },
            { label: "Burnout prediction threshold", type: "text", value: "70%" },
            { label: "Toxicity alert threshold", type: "text", value: "0.5" },
            { label: "Auto-escalation after", type: "text", value: "48 hours" },
          ]},
        { icon: Bell, title: "Notification Settings", desc: "Configure how and when notifications are sent.",
          settings: [
            { label: "Email notifications", type: "toggle", value: true },
            { label: "Push notifications", type: "toggle", value: true },
            { label: "Critical alert SMS", type: "toggle", value: false },
            { label: "Daily digest email", type: "toggle", value: true },
          ]},
        { icon: Shield, title: "Security & Privacy", desc: "Manage security settings and data privacy.",
          settings: [
            { label: "Anonymous reporting", type: "toggle", value: true },
            { label: "Two-factor auth", type: "toggle", value: false },
            { label: "Session timeout", type: "text", value: "30 minutes" },
            { label: "Data retention", type: "text", value: "12 months" },
          ]},
        { icon: Globe, title: "Language & Localization", desc: "Configure supported languages and regional settings.",
          settings: [
            { label: "Default language", type: "text", value: "English" },
            { label: "Auto-translation", type: "toggle", value: true },
            { label: "Supported languages", type: "text", value: "EN, HI, KN, TA, TE, ML" },
          ]},
      ].map((section, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <section.icon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">{section.title}</h3>
              <p className="text-xs text-gray-500">{section.desc}</p>
            </div>
          </div>
          <div className="space-y-3">
            {section.settings.map((s, j) => (
              <div key={j} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                <span className="text-sm text-gray-300">{s.label}</span>
                {s.type === "toggle" ? (
                  <div className={`w-11 h-6 rounded-full cursor-pointer transition-all ${s.value ? "bg-purple-500" : "bg-white/10"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white transition-all mt-0.5 ${s.value ? "ml-5" : "ml-0.5"}`} />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 px-3 py-1 rounded-lg bg-white/5">{s.value}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
