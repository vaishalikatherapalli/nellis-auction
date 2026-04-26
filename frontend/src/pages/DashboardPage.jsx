import { useState, useEffect } from "react";
import { getItems, getStats, getReturns } from "../api";
import StatusBadge from "../components/StatusBadge";
import { Link } from "react-router-dom";

const FILTERS = ["all", "active", "won", "picked_up", "lost"];

export default function DashboardPage() {
  const [items,   setItems]   = useState([]);
  const [stats,   setStats]   = useState(null);
  const [returns, setReturns] = useState([]);
  const [filter,  setFilter]  = useState("all");
  const [sort,    setSort]    = useState("status");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getItems(), getStats(), getReturns()])
      .then(([i, s, r]) => { setItems(i); setStats(s); setReturns(r); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = items
    .filter(i => filter === "all" || i.status === filter)
    .sort((a, b) => {
      if (sort === "savings") return (b.retail_price - b.my_bid) - (a.retail_price - a.my_bid);
      if (sort === "bid")     return b.my_bid - a.my_bid;
      return a.status.localeCompare(b.status);
    });

  const totalSaved = items
    .filter(i => ["won", "picked_up"].includes(i.status))
    .reduce((s, i) => s + (i.retail_price - i.my_bid), 0);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-900">My Dashboard</h1>
        <p className="text-brand-500 text-sm mt-1">Track your bids, wins, and savings.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Bids",     val: stats.active_bids,     color: "text-primary",       bg: "bg-blue-50 border-blue-100" },
            { label: "Items Won",       val: stats.total_won,        color: "text-green-700",     bg: "bg-green-50 border-green-100" },
            { label: "Pending Pickup",  val: stats.pending_pickup,   color: "text-amber-700",     bg: "bg-amber-50 border-amber-100" },
            { label: "Total Saved",     val: `$${totalSaved.toLocaleString("en", { maximumFractionDigits: 0 })}`, color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
          ].map(({ label, val, color, bg }) => (
            <div key={label} className={`rounded-card border p-5 text-center shadow-card ${bg}`}>
              <p className={`text-2xl font-black ${color}`}>{val}</p>
              <p className="text-xs text-brand-600 font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-brand-100 rounded-card animate-pulse" />)}
        </div>
      )}

      {/* Bid tracker */}
      <div className="bg-white rounded-card border border-brand-200 shadow-card overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-brand-200 flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-bold text-brand-900">My Bids</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1 flex-wrap">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-semibold capitalize transition-colors ${
                    filter === f
                      ? "bg-hero-gradient text-white border-transparent"
                      : "bg-white text-brand-700 border-brand-300 hover:border-primary hover:text-primary"
                  }`}
                >
                  {f === "picked_up" ? "Picked Up" : f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-xs border border-brand-300 rounded-btn px-3 py-1.5 bg-white text-brand-700 focus:outline-none"
            >
              <option value="status">Sort by Status</option>
              <option value="savings">Sort by Savings</option>
              <option value="bid">Sort by Bid</option>
            </select>
          </div>
        </div>

        {totalSaved > 0 && (
          <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
            <span className="text-sm text-orange-800 font-semibold">Total saved on won items</span>
            <span className="text-lg font-black text-orange-600">${totalSaved.toLocaleString("en", { maximumFractionDigits: 0 })}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-50 border-b border-brand-200">
                {["Lot", "Item", "Retail", "My Bid", "Savings", "Status", "Pickup"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-brand-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const savings = item.retail_price - item.my_bid;
                const pct     = Math.round((savings / item.retail_price) * 100);
                return (
                  <tr key={item.id} className={`border-b border-brand-100 hover:bg-brand-50 transition-colors ${i % 2 === 0 ? "" : "bg-brand-50/40"}`}>
                    <td className="px-4 py-3 font-mono text-xs text-brand-500">
                      <Link to={`/auctions/${item.id}`} className="hover:text-primary">{item.lot}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-900 text-xs max-w-xs truncate">{item.title}</p>
                      <p className="text-xs text-brand-400">{item.category}</p>
                    </td>
                    <td className="px-4 py-3 text-brand-400 text-xs">${item.retail_price.toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold text-brand-900">${item.my_bid.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {["won", "picked_up"].includes(item.status)
                        ? <span className="text-orange-600 font-bold text-xs">${savings.toFixed(0)} ({pct}%)</span>
                        : item.status === "active"
                          ? <span className="text-blue-600 text-xs">Current: ${item.current_bid}</span>
                          : <span className="text-brand-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={item.pickup_status || item.status} /></td>
                    <td className="px-4 py-3 text-xs text-brand-400">{item.pickup_date || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-brand-400 text-sm">No items match this filter.</div>
          )}
        </div>
      </div>

      {/* Returns */}
      {returns.length > 0 && (
        <div>
          <h2 className="font-bold text-brand-900 mb-4">Recent Returns</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {returns.slice(0, 3).map(r => (
              <div key={r.id} className="bg-white rounded-card border border-brand-200 shadow-card p-4">
                <p className="text-sm font-semibold text-brand-900 truncate">{r.title}</p>
                <p className="text-xs text-brand-400 font-mono">{r.lot}</p>
                <p className="text-xs text-brand-500 mt-1">{r.reason}</p>
                <p className="text-xs font-bold text-green-700 mt-1">Refund: ${r.refund_amount}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="mt-8 flex gap-3 flex-wrap">
        <Link to="/auctions?status=active" className="px-4 py-2.5 bg-hero-gradient text-white text-sm font-bold rounded-btn hover:opacity-90 transition-opacity">Browse Active Auctions</Link>
        <Link to="/pickup" className="px-4 py-2.5 border border-brand-300 text-brand-700 text-sm font-semibold rounded-btn hover:bg-brand-100 transition-colors">Schedule Pickup</Link>
        <Link to="/returns" className="px-4 py-2.5 border border-brand-300 text-brand-700 text-sm font-semibold rounded-btn hover:bg-brand-100 transition-colors">Start a Return</Link>
      </div>
    </div>
  );
}
