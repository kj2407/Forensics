import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Spinner ────────────────────────────────────────────────
export const Spinner = ({ size = "md", className = "" }) => {
  const sz = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" }[size];
  return (
    <svg className={`${sz} animate-spin text-primary ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
};

// ─── Status / Priority Badge ─────────────────────────────────
export const Badge = ({ value, type = "status" }) => {
  const statusMap = {
    open:               { cls: "badge-open",               dot: "bg-blue-400",   label: "Open" },
    under_investigation:{ cls: "badge-under_investigation", dot: "bg-yellow-400", label: "Investigating" },
    pending:            { cls: "badge-pending",             dot: "bg-orange-400", label: "Pending" },
    closed:             { cls: "badge-closed",              dot: "bg-green-400",  label: "Closed" },
    critical:           { cls: "badge-critical",            dot: "bg-red-400",    label: "Critical" },
    high:               { cls: "badge-high",                dot: "bg-orange-400", label: "High" },
    medium:             { cls: "badge-medium",              dot: "bg-yellow-400", label: "Medium" },
    low:                { cls: "badge-low",                 dot: "bg-gray-400",   label: "Low" },
  };
  const m = statusMap[value] || { cls: "badge-low", dot: "bg-gray-400", label: value };
  return (
    <span className={m.cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot} inline-block`} />
      {m.label}
    </span>
  );
};

// ─── Modal ───────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = "md" }) => {
  const sizes = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl" };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />
          <motion.div
            className={`relative w-full ${sizes[size]} card p-0 overflow-hidden z-10`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Confirm Dialog ──────────────────────────────────────────
export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, loading }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-gray-400 mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <button className="btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn-danger" onClick={onConfirm} disabled={loading}>
        {loading ? <Spinner size="sm" /> : "Delete"}
      </button>
    </div>
  </Modal>
);

// ─── Empty State ─────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-surface-50 flex items-center justify-center mb-4 text-gray-600">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-300 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 max-w-xs mb-6">{description}</p>
    {action}
  </div>
);

// ─── Page Header ─────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-100">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ─── Form Field ──────────────────────────────────────────────
export const Field = ({ label, error, children }) => (
  <div>
    {label && <label className="label">{label}</label>}
    {children}
    {error && <p className="mt-1 text-xs text-danger">{error}</p>}
  </div>
);

// ─── Loading skeleton ────────────────────────────────────────
export const Skeleton = ({ className = "" }) => (
  <div className={`shimmer ${className}`}>&nbsp;</div>
);