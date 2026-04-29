import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { casesAPI, evidenceAPI, reportsAPI, usersAPI } from "../../api/api";
import { Badge, Modal, Spinner, Field, ConfirmDialog } from "../../components/ui";
import { fmtDate, fmtDatetime, timeAgo, evidenceTypeLabel, reportTypeLabel } from "../../utils/helpers";

const STATUSES   = ["open","under_investigation","pending","closed"];
const PRIORITIES = ["low","medium","high","critical"];
const EV_TYPES   = ["physical","digital","documentary","biological","testimonial"];
const EV_STATUS  = ["collected","processing","analyzed","archived"];
const RPT_TYPES  = ["initial","progress","final","forensic"];

export default function CaseDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [c,     setC]     = useState(null);
  const [evs,   setEvs]   = useState([]);
  const [rpts,  setRpts]  = useState([]);
  const [users, setUsers] = useState([]);
  const [tab,   setTab]   = useState("evidence");
  const [loading, setLoading] = useState(true);

  // Edit case
  const [editModal, setEditModal] = useState(false);
  const [editForm,  setEditForm]  = useState({});
  const [saving,    setSaving]    = useState(false);

  // Add evidence
  const [evModal, setEvModal] = useState(false);
  const [evForm,  setEvForm]  = useState({ type:"physical", description:"", location_found:"", status:"collected", notes:"" });
  const [evSaving,setEvSaving]= useState(false);
  const [delEvId, setDelEvId] = useState(null);

  // Add report
  const [rptModal,  setRptModal]  = useState(false);
  const [rptForm,   setRptForm]   = useState({ title:"", content:"", report_type:"progress" });
  const [rptSaving, setRptSaving] = useState(false);
  const [delRptId,  setDelRptId]  = useState(null);

  const loadAll = async () => {
    try {
      const [cRes, evRes, rptRes] = await Promise.all([
        casesAPI.getById(id),
        evidenceAPI.getAll({ case_id: id }),
        reportsAPI.getAll({ case_id: id }),
      ]);
      setC(cRes.data); setEvs(evRes.data); setRpts(rptRes.data);
      setEditForm(cRes.data);
    } catch { toast.error("Failed to load case"); navigate("/cases"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); usersAPI.getAll().then(r => setUsers(r.data)).catch(() => {}); }, [id]); // eslint-disable-line

  const handleSaveCase = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await casesAPI.update(id, editForm);
      setC(data); setEditModal(false); toast.success("Case updated!");
    } catch { toast.error("Failed to update"); }
    finally { setSaving(false); }
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault(); setEvSaving(true);
    try {
      await evidenceAPI.create({ ...evForm, case_id: id });
      toast.success("Evidence added!");
      setEvModal(false); setEvForm({ type:"physical", description:"", location_found:"", status:"collected", notes:"" });
      const r = await evidenceAPI.getAll({ case_id: id }); setEvs(r.data);
    } catch { toast.error("Failed to add evidence"); }
    finally { setEvSaving(false); }
  };

  const handleDelEvidence = async () => {
    try { await evidenceAPI.delete(delEvId); setDelEvId(null); toast.success("Deleted"); const r = await evidenceAPI.getAll({ case_id: id }); setEvs(r.data); }
    catch { toast.error("Failed"); }
  };

  const handleAddReport = async (e) => {
    e.preventDefault(); setRptSaving(true);
    try {
      await reportsAPI.create({ ...rptForm, case_id: id });
      toast.success("Report added!");
      setRptModal(false); setRptForm({ title:"", content:"", report_type:"progress" });
      const r = await reportsAPI.getAll({ case_id: id }); setRpts(r.data);
    } catch { toast.error("Failed to add report"); }
    finally { setRptSaving(false); }
  };

  const handleDelReport = async () => {
    try { await reportsAPI.delete(delRptId); setDelRptId(null); toast.success("Deleted"); const r = await reportsAPI.getAll({ case_id: id }); setRpts(r.data); }
    catch { toast.error("Failed"); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!c)      return null;

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/cases" className="hover:text-primary transition-colors">Cases</Link>
        <span>/</span>
        <span className="text-gray-300 font-mono">{c.case_number}</span>
      </div>

      {/* Header card */}
      <motion.div className="card p-6" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">{c.case_number}</span>
              <Badge value={c.status} />
              <Badge value={c.priority} />
            </div>
            <h1 className="text-2xl font-bold text-gray-100">{c.title}</h1>
            {c.description && <p className="text-gray-400 text-sm max-w-2xl">{c.description}</p>}
          </div>
          <button className="btn-primary flex-shrink-0" onClick={() => setEditModal(true)}>Edit Case</button>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
          {[
            { label:"Case Type",     value: c.case_type || "—" },
            { label:"Location",      value: c.location  || "—" },
            { label:"Incident Date", value: fmtDate(c.incident_date) },
            { label:"Assigned To",   value: c.assigned_to_name || "Unassigned" },
            { label:"Created By",    value: c.created_by_name || "—" },
            { label:"Opened",        value: fmtDatetime(c.created_at) },
            { label:"Last Updated",  value: timeAgo(c.updated_at) },
            { label:"Evidence",      value: `${evs.length} items` },
          ].map(m => (
            <div key={m.label}>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{m.label}</p>
              <p className="text-sm text-gray-300 mt-0.5 font-medium truncate">{m.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5 pb-0">
        {[{ id:"evidence", label:`Evidence (${evs.length})` }, { id:"reports", label:`Reports (${rpts.length})` }].map(t => (
          <button key={t.id}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all ${tab===t.id ? "text-primary bg-primary/10 border-b-2 border-primary" : "text-gray-500 hover:text-gray-300"}`}
            onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* Evidence tab */}
      {tab === "evidence" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-primary" onClick={() => setEvModal(true)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              Add Evidence
            </button>
          </div>
          {evs.length === 0 ? (
            <div className="card p-12 text-center text-gray-600">No evidence items yet</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {evs.map(ev => (
                <motion.div key={ev.id} className="card p-4 hover:border-primary/20 transition-all" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-mono text-xs text-accent-light">{ev.evidence_number}</span>
                      <p className="text-sm font-semibold text-gray-200 mt-0.5">{evidenceTypeLabel(ev.type)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        ev.status==="collected"   ? "bg-blue-500/10 text-blue-400 border-blue-500/20"   :
                        ev.status==="processing"  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                        ev.status==="analyzed"    ? "bg-green-500/10 text-green-400 border-green-500/20"  :
                        "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>{ev.status}</span>
                      <button className="p-1 rounded hover:bg-danger/10 text-gray-500 hover:text-danger transition-colors" onClick={() => setDelEvId(ev.id)}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                  {ev.description && <p className="text-xs text-gray-500 mb-2">{ev.description}</p>}
                  <div className="text-[11px] text-gray-600 space-y-1">
                    {ev.location_found && <p>📍 {ev.location_found}</p>}
                    <p>🕒 {fmtDatetime(ev.collected_at)} · by {ev.collected_by_name || "Unknown"}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports tab */}
      {tab === "reports" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-primary" onClick={() => setRptModal(true)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              Add Report
            </button>
          </div>
          {rpts.length === 0 ? (
            <div className="card p-12 text-center text-gray-600">No reports yet</div>
          ) : (
            <div className="space-y-3">
              {rpts.map(r => (
                <motion.div key={r.id} className="card p-5 hover:border-white/10 transition-all" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">{reportTypeLabel(r.report_type)}</span>
                      <h4 className="text-base font-semibold text-gray-200 mt-1.5">{r.title}</h4>
                    </div>
                    <button className="p-1.5 rounded hover:bg-danger/10 text-gray-500 hover:text-danger transition-colors ml-4" onClick={() => setDelRptId(r.id)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                  {r.content && <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{r.content}</p>}
                  <p className="text-xs text-gray-600 mt-3">By {r.created_by_name || "Unknown"} · {timeAgo(r.created_at)}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Case Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Case" size="md">
        <form onSubmit={handleSaveCase} className="space-y-4">
          <Field label="Title"><input className="input" value={editForm.title||""} onChange={e => setEditForm(f=>({...f,title:e.target.value}))}/></Field>
          <Field label="Description"><textarea className="input min-h-[80px] resize-none" value={editForm.description||""} onChange={e => setEditForm(f=>({...f,description:e.target.value}))}/></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <select className="select" value={editForm.status||""} onChange={e => setEditForm(f=>({...f,status:e.target.value}))}>
                {STATUSES.map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className="select" value={editForm.priority||""} onChange={e => setEditForm(f=>({...f,priority:e.target.value}))}>
                {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Location"><input className="input" value={editForm.location||""} onChange={e => setEditForm(f=>({...f,location:e.target.value}))}/></Field>
            <Field label="Assigned To">
              <select className="select" value={editForm.assigned_to||""} onChange={e => setEditForm(f=>({...f,assigned_to:e.target.value}))}>
                <option value="">Unassigned</option>
                {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-ghost" onClick={() => setEditModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? <><Spinner size="sm"/>Saving...</> : "Save Changes"}</button>
          </div>
        </form>
      </Modal>

      {/* Add Evidence Modal */}
      <Modal open={evModal} onClose={() => setEvModal(false)} title="Add Evidence" size="sm">
        <form onSubmit={handleAddEvidence} className="space-y-4">
          <Field label="Type">
            <select className="select" value={evForm.type} onChange={e=>setEvForm(f=>({...f,type:e.target.value}))}>
              {EV_TYPES.map(t=><option key={t} value={t}>{evidenceTypeLabel(t)}</option>)}
            </select>
          </Field>
          <Field label="Description"><textarea className="input min-h-[70px] resize-none" placeholder="Describe the evidence..." value={evForm.description} onChange={e=>setEvForm(f=>({...f,description:e.target.value}))}/></Field>
          <Field label="Location Found"><input className="input" placeholder="Where was it found?" value={evForm.location_found} onChange={e=>setEvForm(f=>({...f,location_found:e.target.value}))}/></Field>
          <Field label="Status">
            <select className="select" value={evForm.status} onChange={e=>setEvForm(f=>({...f,status:e.target.value}))}>
              {EV_STATUS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Notes"><textarea className="input resize-none" placeholder="Additional notes..." value={evForm.notes} onChange={e=>setEvForm(f=>({...f,notes:e.target.value}))}/></Field>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-ghost" onClick={()=>setEvModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={evSaving}>{evSaving?<><Spinner size="sm"/>Adding...</>:"Add Evidence"}</button>
          </div>
        </form>
      </Modal>

      {/* Add Report Modal */}
      <Modal open={rptModal} onClose={() => setRptModal(false)} title="Add Report" size="sm">
        <form onSubmit={handleAddReport} className="space-y-4">
          <Field label="Title"><input className="input" placeholder="Report title" value={rptForm.title} onChange={e=>setRptForm(f=>({...f,title:e.target.value}))}/></Field>
          <Field label="Report Type">
            <select className="select" value={rptForm.report_type} onChange={e=>setRptForm(f=>({...f,report_type:e.target.value}))}>
              {RPT_TYPES.map(t=><option key={t} value={t}>{reportTypeLabel(t)}</option>)}
            </select>
          </Field>
          <Field label="Content"><textarea className="input min-h-[100px] resize-none" placeholder="Report details..." value={rptForm.content} onChange={e=>setRptForm(f=>({...f,content:e.target.value}))}/></Field>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-ghost" onClick={()=>setRptModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={rptSaving}>{rptSaving?<><Spinner size="sm"/>Saving...</>:"Save Report"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!delEvId}  onClose={()=>setDelEvId(null)}  onConfirm={handleDelEvidence} title="Delete Evidence" message="Permanently delete this evidence item?" />
      <ConfirmDialog open={!!delRptId} onClose={()=>setDelRptId(null)} onConfirm={handleDelReport}   title="Delete Report"   message="Permanently delete this report?" />
    </div>
  );
}