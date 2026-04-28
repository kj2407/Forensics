import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { casesAPI, usersAPI } from "../services/api";
import { Badge, Modal, EmptyState, PageHeader, Field, Spinner, ConfirmDialog } from "../components/ui";
import { fmtDate, timeAgo } from "../utils/helpers";

const STATUSES  = ["open","under_investigation","pending","closed"];
const PRIORITIES = ["low","medium","high","critical"];
const TYPES = ["Homicide","Theft","Cybercrime","Fraud","Assault","Kidnapping","Drug Trafficking","Arson","Other"];

const initForm = { title:"", description:"", status:"open", priority:"medium", case_type:"", location:"", incident_date:"", assigned_to:"" };

export default function CasesPage() {
  const navigate = useNavigate();
  const [cases,   setCases]   = useState([]);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);

  const [search,   setSearch]   = useState("");
  const [statusF,  setStatusF]  = useState("");
  const [priorityF,setPriorityF] = useState("");

  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(initForm);
  const [saving,  setSaving]  = useState(false);
  const [delId,   setDelId]   = useState(null);
  const [deleting,setDeleting]= useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await casesAPI.getAll({ search, status: statusF, priority: priorityF, page, limit: 15 });
      setCases(data.cases);
      setTotal(data.total);
    } catch { toast.error("Failed to load cases"); }
    finally { setLoading(false); }
  }, [search, statusF, priorityF, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { usersAPI.getAll().then(r => setUsers(r.data)).catch(() => {}); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      await casesAPI.create(form);
      toast.success("Case created!");
      setModal(false);
      setForm(initForm);
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Failed to create case"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await casesAPI.delete(delId);
      toast.success("Case deleted");
      setDelId(null);
      load();
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Cases"
        subtitle={`${total} total cases`}
        action={<button className="btn-primary" onClick={() => setModal(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          New Case
        </button>}
      />

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
          <input className="input pl-9" placeholder="Search cases..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="select sm:w-44" value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
        </select>
        <select className="select sm:w-36" value={priorityF} onChange={e => { setPriorityF(e.target.value); setPage(1); }}>
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Case #","Title","Status","Priority","Assigned","Created",""].map(h => (
                  <th key={h} className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="table-row">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : cases.map(c => (
                <motion.tr key={c.id} className="table-row cursor-pointer"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => navigate(`/cases/${c.id}`)}>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-primary">{c.case_number}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-200 max-w-xs truncate">{c.title}</p>
                    {c.case_type && <p className="text-xs text-gray-500">{c.case_type}</p>}
                  </td>
                  <td className="px-5 py-4"><Badge value={c.status} /></td>
                  <td className="px-5 py-4"><Badge value={c.priority} /></td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-400">{c.assigned_to_name || <span className="text-gray-600">Unassigned</span>}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-gray-500">{timeAgo(c.created_at)}</span>
                  </td>
                  <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                    <button className="p-1.5 rounded-lg hover:bg-danger/10 text-gray-500 hover:text-danger transition-colors"
                      onClick={() => setDelId(c.id)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && !cases.length && (
          <EmptyState
            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>}
            title="No cases found"
            description="Try adjusting your search or create a new case."
            action={<button className="btn-primary" onClick={() => setModal(true)}>Create Case</button>}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button className="btn-ghost py-1 px-3 text-sm" disabled={page <= 1} onClick={() => setPage(p => p-1)}>← Prev</button>
              <button className="btn-ghost py-1 px-3 text-sm" disabled={page >= totalPages} onClick={() => setPage(p => p+1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal open={modal} onClose={() => { setModal(false); setForm(initForm); }} title="Create New Case" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Case Title *">
            <input className="input" placeholder="Brief descriptive title" value={form.title} onChange={e => set("title", e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea className="input min-h-[80px] resize-none" placeholder="Case summary..." value={form.description} onChange={e => set("description", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <select className="select" value={form.status} onChange={e => set("status", e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className="select" value={form.priority} onChange={e => set("priority", e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Case Type">
              <select className="select" value={form.case_type} onChange={e => set("case_type", e.target.value)}>
                <option value="">Select type</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Incident Date">
              <input type="date" className="input" value={form.incident_date} onChange={e => set("incident_date", e.target.value)} />
            </Field>
          </div>
          <Field label="Location">
            <input className="input" placeholder="Crime scene location" value={form.location} onChange={e => set("location", e.target.value)} />
          </Field>
          <Field label="Assign To">
            <select className="select" value={form.assigned_to} onChange={e => set("assigned_to", e.target.value)}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </Field>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <><Spinner size="sm"/>Saving...</> : "Create Case"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Case" message="This will permanently delete the case and all associated evidence and reports. This action cannot be undone."
      />
    </div>
  );
}