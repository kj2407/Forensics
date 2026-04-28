import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { evidenceAPI, casesAPI } from "../services/api";
import { Badge, EmptyState, PageHeader, Spinner } from "../components/ui";
import { fmtDatetime, evidenceTypeLabel } from "../utils/helpers";

const EV_TYPES  = ["physical","digital","documentary","biological","testimonial"];
const EV_STATUS = ["collected","processing","analyzed","archived"];

const typeIcon = { physical:"🔍", digital:"💾", documentary:"📄", biological:"🧬", testimonial:"🎙️" };

export default function EvidencePage() {
  const [items,   setItems]   = useState([]);
  const [cases,   setCases]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeF,   setTypeF]   = useState("");
  const [caseF,   setCaseF]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (caseF) params.case_id = caseF;
      const { data } = await evidenceAPI.getAll(params);
      const filtered = typeF ? data.filter(e => e.type === typeF) : data;
      setItems(filtered);
    } catch { toast.error("Failed to load evidence"); }
    finally { setLoading(false); }
  }, [typeF, caseF]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { casesAPI.getAll({ limit: 100 }).then(r => setCases(r.data.cases)).catch(() => {}); }, []);

  const statusColor = {
    collected:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
    processing: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    analyzed:   "bg-green-500/10 text-green-400 border-green-500/20",
    archived:   "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Evidence" subtitle={`${items.length} evidence items`} />

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <select className="select sm:w-48" value={typeF} onChange={e => setTypeF(e.target.value)}>
          <option value="">All Types</option>
          {EV_TYPES.map(t => <option key={t} value={t}>{evidenceTypeLabel(t)}</option>)}
        </select>
        <select className="select flex-1" value={caseF} onChange={e => setCaseF(e.target.value)}>
          <option value="">All Cases</option>
          {cases.map(c => <option key={c.id} value={c.id}>{c.case_number} — {c.title}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i) => <div key={i} className="card h-44 animate-pulse bg-surface-50" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/></svg>}
          title="No evidence found"
          description="Evidence items are added within individual cases."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(ev => (
            <motion.div key={ev.id} className="card p-5 hover:border-primary/20 transition-all"
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{typeIcon[ev.type] || "📦"}</span>
                  <div>
                    <p className="font-mono text-xs text-accent-light">{ev.evidence_number}</p>
                    <p className="text-sm font-semibold text-gray-200">{evidenceTypeLabel(ev.type)}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[ev.status] || statusColor.archived}`}>
                  {ev.status}
                </span>
              </div>

              {ev.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{ev.description}</p>}

              <div className="space-y-1.5 text-[11px] text-gray-600 border-t border-white/5 pt-3">
                {ev.case_title && (
                  <p className="truncate">
                    <span className="text-gray-500">Case: </span>
                    <span className="text-gray-400">{ev.case_number} — {ev.case_title}</span>
                  </p>
                )}
                {ev.location_found && <p>📍 {ev.location_found}</p>}
                <p>🕒 {fmtDatetime(ev.collected_at)}</p>
                {ev.collected_by_name && <p>👤 {ev.collected_by_name}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}