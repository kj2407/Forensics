import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { reportsAPI, casesAPI } from "../services/api";
import { EmptyState, PageHeader, Modal, Field, Spinner } from "../components/ui";
import { fmtDatetime, timeAgo, reportTypeLabel } from "../utils/helpers";

const RPT_TYPES = ["initial","progress","final","forensic"];

const typeColor = {
  initial:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  progress: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  final:    "bg-green-500/10 text-green-400 border-green-500/20",
  forensic: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function ReportsPage() {
  const [reports,  setReports]  = useState([]);
  const [cases,    setCases]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [typeF,    setTypeF]    = useState("");
  const [caseF,    setCaseF]    = useState("");
  const [modal,    setModal]    = useState(false);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState({ case_id:"", title:"", content:"", report_type:"progress" });
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (caseF) params.case_id = caseF;
      const { data } = await reportsAPI.getAll(params);
      const filtered = typeF ? data.filter(r => r.report_type === typeF) : data;
      setReports(filtered);
    } catch { toast.error("Failed to load reports"); }
    finally { setLoading(false); }
  }, [typeF, caseF]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { casesAPI.getAll({ limit: 100 }).then(r => setCases(r.data.cases)).catch(() => {}); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.case_id || !form.title) { toast.error("Case and title required"); return; }
    setSaving(true);
    try {
      await reportsAPI.create(form);
      toast.success("Report created!");
      setModal(false);
      setForm({ case_id:"", title:"", content:"", report_type:"progress" });
      load();
    } catch { toast.error("Failed to create report"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        subtitle={`${reports.length} reports`}
        action={<button className="btn-primary" onClick={() => setModal(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          New Report
        </button>}
      />

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <select className="select sm:w-44" value={typeF} onChange={e => setTypeF(e.target.value)}>
          <option value="">All Types</option>
          {RPT_TYPES.map(t => <option key={t} value={t}>{reportTypeLabel(t)}</option>)}
        </select>
        <select className="select flex-1" value={caseF} onChange={e => setCaseF(e.target.value)}>
          <option value="">All Cases</option>
          {cases.map(c => <option key={c.id} value={c.id}>{c.case_number} — {c.title}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="card h-28 animate-pulse bg-surface-50"/>)}</div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
          title="No reports found"
          description="Reports are generated for individual cases."
          action={<button className="btn-primary" onClick={() => setModal(true)}>Create Report</button>}
        />
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <motion.div key={r.id} className="card p-5 hover:border-white/10 cursor-pointer transition-all"
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              onClick={() => setSelected(r)}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColor[r.report_type]||typeColor.progress}`}>
                      {reportTypeLabel(r.report_type)}
                    </span>
                    {r.case_number && (
                      <span className="font-mono text-xs text-gray-500">{r.case_number}</span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-200">{r.title}</h3>
                  {r.content && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.content}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">{timeAgo(r.created_at)}</p>
                  <p className="text-xs text-gray-600 mt-1">{r.created_by_name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create report modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create Report" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Case *">
            <select className="select" value={form.case_id} onChange={e => setForm(f=>({...f,case_id:e.target.value}))}>
              <option value="">Select case</option>
              {cases.map(c => <option key={c.id} value={c.id}>{c.case_number} — {c.title}</option>)}
            </select>
          </Field>
          <Field label="Report Title *">
            <input className="input" placeholder="e.g. Initial Forensic Assessment" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}/>
          </Field>
          <Field label="Report Type">
            <select className="select" value={form.report_type} onChange={e => setForm(f=>({...f,report_type:e.target.value}))}>
              {RPT_TYPES.map(t => <option key={t} value={t}>{reportTypeLabel(t)}</option>)}
            </select>
          </Field>
          <Field label="Content">
            <textarea className="input min-h-[120px] resize-none" placeholder="Detailed findings, observations, conclusions..." value={form.content} onChange={e => setForm(f=>({...f,content:e.target.value}))}/>
          </Field>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? <><Spinner size="sm"/>Saving...</> : "Create Report"}</button>
          </div>
        </form>
      </Modal>

      {/* Report detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title || ""} size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full border ${typeColor[selected.report_type]}`}>{reportTypeLabel(selected.report_type)}</span>
              {selected.case_number && <span className="font-mono text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-full">{selected.case_number} — {selected.case_title}</span>}
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{selected.content || "No content provided."}</p>
            </div>
            <div className="border-t border-white/5 pt-4 flex items-center justify-between text-xs text-gray-500">
              <span>By {selected.created_by_name || "Unknown"}</span>
              <span>{fmtDatetime(selected.created_at)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}