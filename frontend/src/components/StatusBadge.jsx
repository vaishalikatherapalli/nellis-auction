const CONFIG = {
  active:    { label: "Active Bid",     cls: "bg-blue-50 text-blue-700 border-blue-200" },
  won:       { label: "Won",            cls: "bg-burgundy-50 text-burgundy-900 border-burgundy-100" },
  lost:      { label: "Outbid",         cls: "bg-brand-100 text-brand-600 border-brand-300" },
  picked_up: { label: "Picked Up",      cls: "bg-brand-100 text-brand-500 border-brand-300" },
  pending:   { label: "Pickup Pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  scheduled: { label: "Scheduled",      cls: "bg-burgundy-50 text-burgundy-800 border-burgundy-100" },
  completed: { label: "Completed",      cls: "bg-brand-100 text-brand-500 border-brand-300" },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || { label: status, cls: "bg-brand-100 text-brand-600 border-brand-300" };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-[6.25rem] border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
