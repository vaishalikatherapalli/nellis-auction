import { useState } from "react";
import StatusBadge from "./StatusBadge";

const FILTERS = ["all", "active", "won", "lost", "picked_up"];

export default function BidTracker({ items }) {
  const [filter, setFilter] = useState("all");
  const [sort,   setSort]   = useState("status");

  const filtered = items
    .filter(i => filter === "all" || i.status === filter)
    .sort((a, b) => {
      if (sort === "savings") return (b.retail_price - b.my_bid) - (a.retail_price - a.my_bid);
      if (sort === "bid")     return b.my_bid - a.my_bid;
      return a.status.localeCompare(b.status);
    });

  const totalSaved = filtered
    .filter(i => ["won","picked_up"].includes(i.status))
    .reduce((s, i) => s + (i.retail_price - i.my_bid), 0);

  return (
    <div className="space-y-4">

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-4 py-1.5 rounded-[6.25rem] border font-semibold capitalize transition-colors ${
                filter === f
                  ? "bg-cta-gradient text-white border-transparent"
                  : "bg-white text-brand-700 border-brand-300 hover:border-primary hover:text-primary"
              }`}
            >
              {f === "picked_up" ? "Picked Up" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="text-xs border border-brand-300 rounded-cta px-3 py-1.5 bg-white text-brand-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="status">Sort by Status</option>
          <option value="savings">Sort by Savings</option>
          <option value="bid">Sort by Bid</option>
        </select>
      </div>

      {/* Savings bar */}
      {totalSaved > 0 && (
        <div className="bg-burgundy-50 border border-burgundy-100 rounded-cta px-4 py-3 flex items-center justify-between shadow-itemCard">
          <span className="text-sm text-burgundy-900 font-semibold">Total saved on filtered items</span>
          <span className="text-lg font-black text-primary">${totalSaved.toLocaleString("en",{maximumFractionDigits:0})}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-cta shadow-itemCard border border-brand-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-100 border-b border-brand-300">
                {["Lot","Item","Retail","My Bid","Savings","Status","Pickup"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-brand-700 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const savings = item.retail_price - item.my_bid;
                const pct     = Math.round((savings / item.retail_price) * 100);
                return (
                  <tr key={item.id} className={`border-b border-brand-200 hover:bg-brand-100 transition-colors ${i%2===0?"":"bg-brand-100/40"}`}>
                    <td className="px-4 py-3 font-mono text-xs text-brand-500">{item.lot}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-900 text-xs max-w-xs truncate">{item.title}</p>
                      <p className="text-xs text-brand-500">{item.category}</p>
                    </td>
                    <td className="px-4 py-3 text-brand-500 text-xs">${item.retail_price.toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold text-brand-900">${item.my_bid.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {["won","picked_up"].includes(item.status)
                        ? <span className="text-primary font-bold text-xs">${savings.toFixed(0)} ({pct}%)</span>
                        : item.status === "active"
                          ? <span className="text-blue-600 text-xs">Current: ${item.current_bid}</span>
                          : <span className="text-brand-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={item.pickup_status || item.status} /></td>
                    <td className="px-4 py-3 text-xs text-brand-500">{item.pickup_date || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-brand-500 font-medium">No items match this filter.</div>
        )}
      </div>
    </div>
  );
}
