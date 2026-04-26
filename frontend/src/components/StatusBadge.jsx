const CONFIG = {
  active:    { label: "Active",     cls: "bg-blue-50 text-blue-700 border-blue-200" },
  won:       { label: "Won",        cls: "bg-green-50 text-green-700 border-green-200" },
  lost:      { label: "Ended",      cls: "bg-brand-100 text-brand-500 border-brand-200" },
  picked_up: { label: "Picked Up",  cls: "bg-teal-50 text-teal-700 border-teal-100" },
  pending:   { label: "Pending",    cls: "bg-amber-50 text-amber-700 border-amber-200" },
  scheduled: { label: "Scheduled",  cls: "bg-purple-50 text-purple-700 border-purple-200" },
  completed: { label: "Completed",  cls: "bg-green-50 text-green-700 border-green-200" },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || { label: status, cls: "bg-brand-100 text-brand-500 border-brand-200" };
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
