import { useState, useEffect } from "react";
import { getStats, getItems } from "./api";
import ItemCard from "./components/ItemCard";
import BidTracker from "./components/BidTracker";
import SearchPanel from "./components/SearchPanel";
import CheckInPanel from "./components/CheckInPanel";
import "./index.css";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "bids",      label: "Bid Tracker" },
  { id: "checkin",   label: "Check-In & Pickup" },
  { id: "search",    label: "Search" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getItems()])
      .then(([s, i]) => { setStats(s); setItems(i); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter === "all"
    ? items
    : items.filter(i => i.status === statusFilter);

  return (
    <div className="min-h-screen bg-brand-100">

      {/* ── Top bar (white, sticky, Nellis-style) ── */}
      <header className="bg-white shadow-header sticky top-0 z-[100]">
        <div className="max-w-screen-xl mx-auto px-5 py-2 flex items-center justify-between gap-4">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-cta bg-cta-gradient flex items-center justify-center">
                <span className="text-white font-black text-xs leading-none">N</span>
              </div>
              <span className="font-extrabold text-brand-900 text-lg leading-none tracking-tight">
                Nellis<span className="text-primary"> Auction</span>
              </span>
            </div>
          </a>

          {/* Stats pills */}
          {stats && (
            <div className="hidden md:flex items-center gap-3">
              {[
                ["Won",    stats.total_won,     "bg-burgundy-50 text-burgundy-900"],
                ["Active", stats.active_bids,   "bg-blue-50 text-blue-700"],
                ["Pickup", stats.pending_pickup, "bg-amber-50 text-amber-700"],
                [`$${stats.total_saved.toLocaleString("en",{maximumFractionDigits:0})} saved`,
                  null, "bg-cta-gradient text-white"],
              ].map(([label, val, cls]) => (
                <div key={label} className={`${cls} text-xs font-semibold px-3 py-1.5 rounded-[6.25rem] flex items-center gap-1.5`}>
                  {val !== null && <span className="font-black">{val}</span>}
                  <span>{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Mobile stats — just savings */}
          {stats && (
            <div className="md:hidden text-xs font-bold text-primary">
              ${stats.total_saved.toLocaleString("en",{maximumFractionDigits:0})} saved
            </div>
          )}
        </div>

        {/* ── Tab nav ── */}
        <div className="max-w-screen-xl mx-auto px-5 border-t border-brand-300">
          <div className="flex gap-0">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  tab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-brand-700 hover:text-brand-900 hover:border-brand-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Page body ── */}
      <main className="max-w-screen-xl mx-auto px-5 py-6">

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-cta shadow-itemCard h-48 animate-pulse" />
            ))}
          </div>
        )}

        {/* Dashboard */}
        {!loading && tab === "dashboard" && (
          <div className="space-y-5">

            {/* Mobile stats */}
            {stats && (
              <div className="md:hidden grid grid-cols-2 gap-3">
                {[
                  ["Won",    stats.total_won,     "text-burgundy-900", "bg-burgundy-50 border-burgundy-100"],
                  ["Active", stats.active_bids,   "text-blue-700",     "bg-blue-50 border-blue-100"],
                  ["Pickup", stats.pending_pickup, "text-amber-700",    "bg-amber-50 border-amber-100"],
                  ["Saved",  `$${stats.total_saved.toLocaleString("en",{maximumFractionDigits:0})}`, "text-primary", "bg-burgundy-50 border-burgundy-100"],
                ].map(([label, val, cls, bg]) => (
                  <div key={label} className={`${bg} border rounded-cta p-4 text-center shadow-itemCard`}>
                    <div className={`text-xl font-black ${cls}`}>{val}</div>
                    <div className="text-brand-600 text-xs font-medium mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Filter pills */}
            <div className="flex gap-2 flex-wrap">
              {[
                ["all",       "All Items"],
                ["active",    "Active Bids"],
                ["won",       "Won"],
                ["lost",      "Lost"],
                ["picked_up", "Picked Up"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setStatusFilter(val)}
                  className={`text-xs px-4 py-1.5 rounded-[6.25rem] border font-semibold transition-colors ${
                    statusFilter === val
                      ? "bg-cta-gradient text-white border-transparent"
                      : "bg-white text-brand-700 border-brand-300 hover:border-primary hover:text-primary"
                  }`}
                >
                  {label}
                  <span className="ml-1.5 opacity-70">
                    {val === "all" ? items.length : items.filter(i => i.status === val).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Item grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          </div>
        )}

        {!loading && tab === "bids"    && <BidTracker items={items} />}
        {           tab === "checkin"  && <CheckInPanel />}
        {!loading && tab === "search"  && <SearchPanel />}
      </main>
    </div>
  );
}
