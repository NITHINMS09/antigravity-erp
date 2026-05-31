"use client";
import { motion } from "framer-motion";
import { User, Mail, Phone, Briefcase, Shield, Award, Building } from "lucide-react";
import { useAuthStore } from "@/lib/stores";
import { getInitials } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const u = user || { firstName: "User", lastName: "", email: "", role: "EMPLOYEE", jobTitle: "", phone: "", department: { name: "General" }, organization: { name: "TechCorp" }, badges: [] };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      <div className="glass-card p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-white">
          {getInitials(u.firstName, u.lastName)}
        </div>
        <h2 className="text-xl font-bold text-white">{u.firstName} {u.lastName}</h2>
        <p className="text-gray-400">{u.jobTitle || u.role}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="badge-pill bg-purple-500/20 text-purple-400 border-purple-500/30">{u.role}</span>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Personal Information</h3>
        {[
          { icon: Mail, label: "Email", value: u.email },
          { icon: Phone, label: "Phone", value: u.phone || "Not provided" },
          { icon: Briefcase, label: "Job Title", value: u.jobTitle || "Not set" },
          { icon: Building, label: "Department", value: u.department?.name || "Not assigned" },
          { icon: Shield, label: "Role", value: u.role },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02]">
            <item.icon className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-sm text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-yellow-400" /> Badges</h3>
        <div className="flex gap-3 flex-wrap">
          {(u.badges && u.badges.length > 0 ? u.badges : [{ badge: "FIRST_FEEDBACK" }, { badge: "HELPFUL_VOICE" }]).map((b: any, i: number) => (
            <div key={i} className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium">
              🏆 {b.badge?.replace(/_/g, " ")}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
