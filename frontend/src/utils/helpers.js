import { format, formatDistanceToNow, parseISO } from "date-fns";

export const fmtDate = (d) => {
  if (!d) return "—";
  try { return format(typeof d === "string" ? parseISO(d) : d, "MMM d, yyyy"); }
  catch { return d; }
};

export const fmtDatetime = (d) => {
  if (!d) return "—";
  try { return format(typeof d === "string" ? parseISO(d) : d, "MMM d, yyyy HH:mm"); }
  catch { return d; }
};

export const timeAgo = (d) => {
  if (!d) return "—";
  try { return formatDistanceToNow(typeof d === "string" ? parseISO(d) : d, { addSuffix: true }); }
  catch { return d; }
};

export const statusLabel = (s) => ({
  open: "Open", under_investigation: "Under Investigation", pending: "Pending", closed: "Closed"
}[s] || s);

export const priorityLabel = (p) => ({
  low: "Low", medium: "Medium", high: "High", critical: "Critical"
}[p] || p);

export const evidenceTypeLabel = (t) => ({
  physical: "Physical", digital: "Digital", documentary: "Documentary",
  biological: "Biological", testimonial: "Testimonial"
}[t] || t);

export const reportTypeLabel = (t) => ({
  initial: "Initial", progress: "Progress", final: "Final", forensic: "Forensic"
}[t] || t);

export const roleLabel = (r) => ({
  admin: "Admin", investigator: "Investigator", analyst: "Analyst"
}[r] || r);

export const classNames = (...classes) => classes.filter(Boolean).join(" ");