import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAuctions } from "../api";
import AuctionCard from "../components/AuctionCard";

const CATEGORIES = ["Electronics", "Home & Kitchen", "Furniture", "Sports & Outdoors", "Gaming", "Tools", "Fashion"];
const CONDITIONS  = ["Like New", "Good", "Fair", "Poor"];
const STATUSES    = [
  { val: "",          label: "All Auctions" },
  { val: "active",    label: "Active" },
  { val: "won",       label: "Won" },
  { val: "picked_up", label: "Picked Up" },
  { val: "lost",      label: "Ended" },
];
const SORTS = [
  { val: "ending",   label: "Ending Soon" },
  { val: "low",      label: "Lowest Bid" },
  { val: "high",     label: "Highest Bid" },
  { val: "savings",  label: "Most Savings" },
];

export default function AuctionsPage() {
  const [params, setParams] = useSearchParams();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  const [catFilter,  setCatFilter]  = useState(params.get("category") || "");
  const [condFilter, setCondFilter] = useState("");
  const [status,     setStatus]     = useState("");
  const [sort,       setSort]       = useState("ending");
  const [search,     setSearch]     = useState("");

  useEffect(() => {
    setLoading(true);
    getAuctions()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (params.get("category")) setCatFilter(params.get("category"));
  }, [params]);

  const filtered = items
    .filter(i => !catFilter  || i.category === catFilter)
    .filter(i => !condFilter || i.condition === condFilter)
    .filter(i => !status     || i.status === status)
    .filter(i => !search     || i.title.toLowerCase().includes(search.toLowerCase()) || i.lot.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "low")     return a.current_bid - b.current_bid;
      if (sort === "high")    return b.current_bid - a.current_bid;
      if (sort === "savings") return (b.retail_price - b.current_bid) - (a.retail_price - a.current_bid);
      return new Date(a.auction_end) - new Date(b.auction_end);
    });

  const clearFilters = () => {
    setCatFilter(""); setCondFilter(""); setStatus(""); setSearch(""); setSort("ending");
    setParams({});
  };
  const hasFilters = catFilter || condFilter || status || search;

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-brand-900">Browse Auctions</h1>
        <p className="text-brand-500 text-sm mt-1">{items.length} lots available</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar filters */}
        <aside className="w-full lg:w-60 shrink-0 space-y-6">
          <div className="bg-white rounded-card border border-brand-200 p-5 shadow-card">

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-brand-900 text-sm">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear all</button>
              )}
            </div>

            {/* Search */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">Search</p>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Title or lot number..."
                className="w-full border border-brand-300 rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Status */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">Status</p>
              <div className="space-y-1">
                {STATUSES.map(({ val, label }) => (
                  <button
                    key={label}
                    onClick={() => setStatus(val)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-btn transition-colors ${
                      status === val ? "bg-blue-50 text-primary font-semibold" : "text-brand-600 hover:bg-brand-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">Category</p>
              <div className="space-y-1">
                <button
                  onClick={() => setCatFilter("")}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-btn transition-colors ${!catFilter ? "bg-blue-50 text-primary font-semibold" : "text-brand-600 hover:bg-brand-100"}`}
                >
                  All Categories
                </button>
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCatFilter(c)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-btn transition-colors ${catFilter === c ? "bg-blue-50 text-primary font-semibold" : "text-brand-600 hover:bg-brand-100"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">Condition</p>
              <div className="space-y-1">
                <button
                  onClick={() => setCondFilter("")}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-btn transition-colors ${!condFilter ? "bg-blue-50 text-primary font-semibold" : "text-brand-600 hover:bg-brand-100"}`}
                >
                  Any Condition
                </button>
                {CONDITIONS.map(c => (
                  <button
                    key={c}
                    onClick={() => setCondFilter(c)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-btn transition-colors ${condFilter === c ? "bg-blue-50 text-primary font-semibold" : "text-brand-600 hover:bg-brand-100"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <p className="text-sm text-brand-500">
              <span className="font-semibold text-brand-900">{filtered.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-500">Sort:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-sm border border-brand-300 rounded-btn px-3 py-1.5 bg-white text-brand-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {SORTS.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <div key={i} className="h-72 bg-brand-100 rounded-card animate-pulse" />)}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20 bg-white rounded-card border border-brand-200">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-bold text-brand-900 mb-1">No results found</p>
              <p className="text-sm text-brand-500 mb-4">Try adjusting your filters</p>
              <button onClick={clearFilters} className="text-sm text-primary hover:underline font-semibold">Clear all filters</button>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(item => <AuctionCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
