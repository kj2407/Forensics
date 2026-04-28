import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { usersAPI } from "../services/api";
import { EmptyState, PageHeader, Spinner, ConfirmDialog } from "../components/ui";
import { fmtDate, roleLabel } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

const roleColor = {
  admin:        "bg-red-500/10 text-red-400 border-red-500/20",
  investigator: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  analyst:      "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function UsersPage() {
  const { user: me, isAdmin } = useAuth();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [delId,   setDelId]   = useState(null);
  const [deleting,setDeleting]= useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await usersAPI.getAll(); setUsers(data); }
    catch { toast.error("Failed to load team"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await usersAPI.delete(delId);
      toast.success("User removed");
      setDelId(null);
      load();
    } catch { toast.error("Failed to delete user"); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Team" subtitle={`${users.length} members`} />

      <div className="card p-4">
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
          <input className="input pl-9" placeholder="Search by name, email or department..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i) => <div key={i} className="card h-36 animate-pulse bg-surface-50"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4a4 4 0 110-8 4 4 0 010 8z"/></svg>}
          title="No team members found"
          description="Team members appear here once they register an account."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(u => (
            <motion.div key={u.id} className="card p-5 hover:border-white/10 transition-all relative"
              initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}>
              {/* Avatar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center text-base font-bold text-primary flex-shrink-0">
                  {u.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-200 truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border ${roleColor[u.role]||roleColor.analyst}`}>{roleLabel(u.role)}</span>
                  <span className={`w-2 h-2 rounded-full ${u.is_active ? "bg-green-400" : "bg-gray-600"}`} title={u.is_active ? "Active" : "Inactive"} />
                </div>
                <div className="text-[11px] text-gray-600 space-y-1 pt-2 border-t border-white/5">
                  {u.badge_number && <p>🪪 Badge: <span className="text-gray-400 font-mono">{u.badge_number}</span></p>}
                  {u.department   && <p>🏢 {u.department}</p>}
                  <p>📅 Joined {fmtDate(u.created_at)}</p>
                </div>
              </div>

              {/* Delete button (admin only, not self) */}
              {isAdmin && u.id !== me?.id && (
                <button
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-danger/10 text-gray-600 hover:text-danger transition-colors"
                  onClick={() => setDelId(u.id)}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete} loading={deleting}
        title="Remove Team Member" message="This will permanently remove the user from the system."
      />
    </div>
  );
}