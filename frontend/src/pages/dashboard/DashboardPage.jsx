import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { dashboardAPI } from "../services/api";
import { Badge, Skeleton } from "../components/ui";
import { fmtDate, timeAgo, statusLabel, priorityLabel } from "../utils/helpers";
import toast from "react-hot-toast";

const COLORS = ["#00d4ff", "#7c3aed", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.4 } });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-50 border border-white/10 rounded-xl px-4 py-3 shadow-card text-sm">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.value} {p.name}</p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setData(r.data))
      .catch(() => toast.error("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ title, value, icon, color, sub }) => (
    <motion.div className="stat-card" {...fadeUp(0.1)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-gray-100 mt-1">{loading ? <Skeleton className="w-16 h-8" /> : value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  const stats = data?.stats || {};
  const charts = data?.charts || {};

  const monthlyData = (charts.monthly || []).map(m => ({
    month: m.month?.slice(5) || m.month,
    cases: m.count
  }));

  const priorityData = (charts.byPriority || []).map(p => ({
    name: priorityLabel(p.priority),
    value: p.count,
  }));

  const evidenceData = (charts.evidenceByType || []).map(e => ({
    name: e.type,
    count: e.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-bold text-gray-100">Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome to the ForensIQ case management platform</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cases"   value={stats.total_cases}        icon={<FolderIco />}  color="bg-primary/10 text-primary"   sub="All time" />
        <StatCard title="Open Cases"    value={stats.open_cases}         icon={<AlertIco />}   color="bg-blue-500/10 text-blue-400" sub="Needs attention" />
        <StatCard title="Investigating" value={stats.under_investigation} icon={<SearchIco />}  color="bg-yellow-500/10 text-yellow-400" />
        <StatCard title="Closed"        value={stats.closed_cases}       icon={<CheckIco />}   color="bg-green-500/10 text-green-400" sub="Resolved" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Evidence Items"  value={stats.total_evidence}     icon={<ArchiveIco />} color="bg-accent/10 text-accent-light" />
        <StatCard title="Reports Filed"   value={stats.total_reports}      icon={<DocIco />}     color="bg-purple-500/10 text-purple-400" />
        <StatCard title="Team Members"    value={stats.total_investigators} icon={<UsersIco />}   color="bg-teal-500/10 text-teal-400" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly trend */}
        <motion.div className="card p-5" {...fadeUp(0.2)}>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Cases — Last 6 Months</h3>
          {loading ? <Skeleton className="h-48" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData}>
                <CartesianGrid stroke="#ffffff08" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="cases" stroke="#00d4ff" strokeWidth={2} dot={{ fill: "#00d4ff", r: 4 }} name="Cases" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Priority pie */}
        <motion.div className="card p-5" {...fadeUp(0.25)}>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Cases by Priority</h3>
          {loading ? <Skeleton className="h-48" /> : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {priorityData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-gray-400">{d.name}</span>
                    <span className="text-xs font-semibold text-gray-200 ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Evidence bar + Recent cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Evidence by type */}
        <motion.div className="card p-5" {...fadeUp(0.3)}>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Evidence by Type</h3>
          {loading ? <Skeleton className="h-48" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={evidenceData} barSize={28}>
                <CartesianGrid stroke="#ffffff08" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Items" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Recent cases */}
        <motion.div className="card p-5" {...fadeUp(0.35)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">Recent Cases</h3>
            <Link to="/cases" className="text-xs text-primary hover:text-primary-300 transition-colors">View all →</Link>
          </div>
          {loading ? <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div> : (
            <div className="space-y-2">
              {(data?.recentCases || []).map(c => (
                <Link to={`/cases/${c.id}`} key={c.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate group-hover:text-primary transition-colors">{c.title}</p>
                    <p className="text-xs text-gray-500 font-mono">{c.case_number}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <Badge value={c.priority} />
                    <Badge value={c.status} />
                  </div>
                </Link>
              ))}
              {!(data?.recentCases?.length) && <p className="text-center text-sm text-gray-600 py-8">No cases yet</p>}
            </div>
          )}
        </motion.div>
      </div>

      {/* Activity feed */}
      <motion.div className="card p-5" {...fadeUp(0.4)}>
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Recent Activity</h3>
        {loading ? <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div> : (
          <div className="space-y-0">
            {(data?.recentActivity || []).map((a, i) => (
              <div key={a.id} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 mt-0.5">
                  {a.user_name?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold">{a.user_name || "Unknown"}</span>{" "}
                    <span className="text-gray-500">{a.details}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{timeAgo(a.created_at)}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-gray-500">{a.action}</span>
              </div>
            ))}
            {!(data?.recentActivity?.length) && <p className="text-center text-sm text-gray-600 py-6">No recent activity</p>}
          </div>
        )}
      </motion.div>
    </div>
  );
}

const FolderIco  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>;
const AlertIco   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>;
const SearchIco  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>;
const CheckIco   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const ArchiveIco = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/></svg>;
const DocIco     = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
const UsersIco   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4a4 4 0 110-8 4 4 0 010 8z"/></svg>;