"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, Search } from "lucide-react";
import { adminAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/20 text-red-400 border-red-500/30",
  HR_ADMIN: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  TEAM_MEMBER: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  EMPLOYEE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  AI_AGENT: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminAPI.getUsers().then(r => setUsers(Array.isArray(r.data) ? r.data : [])).catch(() => setUsers([
      { id: "1", firstName: "Super", lastName: "Admin", email: "admin@pulsemind.ai", role: "SUPER_ADMIN", jobTitle: "Administrator", department: { name: "HR" }, isActive: true, _count: { feedbacks: 0, complaints: 0 } },
      { id: "2", firstName: "Priya", lastName: "Sharma", email: "hr@pulsemind.ai", role: "HR_ADMIN", jobTitle: "HR Director", department: { name: "HR" }, isActive: true, _count: { feedbacks: 5, complaints: 2 } },
      { id: "3", firstName: "Arjun", lastName: "Patel", email: "dev1@pulsemind.ai", role: "EMPLOYEE", jobTitle: "Senior Developer", department: { name: "Engineering" }, isActive: true, _count: { feedbacks: 12, complaints: 3 } },
      { id: "4", firstName: "Sneha", lastName: "Gupta", email: "dev2@pulsemind.ai", role: "EMPLOYEE", jobTitle: "Frontend Developer", department: { name: "Engineering" }, isActive: true, _count: { feedbacks: 8, complaints: 1 } },
      { id: "5", firstName: "Vikram", lastName: "Singh", email: "sales1@pulsemind.ai", role: "EMPLOYEE", jobTitle: "Sales Executive", department: { name: "Sales" }, isActive: true, _count: { feedbacks: 6, complaints: 4 } },
    ]));
  }, []);

  const filtered = users.filter(u => !search || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Users className="w-6 h-6 text-purple-400" /> User Management</h1>
        <span className="text-sm text-gray-400">{users.length} users</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input-glass pl-11" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-4">User</th>
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-4">Role</th>
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-4">Department</th>
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-4">Feedbacks</th>
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className={`badge-pill ${roleColors[u.role] || roleColors.EMPLOYEE}`}>{u.role}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-400">{u.department?.name || "N/A"}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{u._count?.feedbacks || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                    <span className="text-sm text-gray-400">{u.isActive ? "Active" : "Inactive"}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
