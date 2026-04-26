import { useSearchParams } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { searchItems } from "../api";
import AuctionCard from "../components/AuctionCard";

function useDebounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery]   = useState(searchParams.get("q") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(
    useDebounce(async (q) => {
      if (!q.trim()) { setResult(null); return; }
      setLoading(true);
      try { setResult(await searchItems(q)); }
      finally { setLoading(false); }
    }, 350), []
  );

  useEffect(() => { if (query) doSearch(query); }, []);

  const handleChange = (e) => { setQuery(e.target.value); doSearch(e.target.value); };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-black text-brand-900 mb-6">AI-Powered Search</h1>

      <div className="relative max-w-2xl mb-8">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400">🔍</span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder='Try "laptop", "sofa", "vacuum", "gaming"...'
          autoFocus
          className="w-full pl-11 pr-4 py-3.5 border border-brand-300 rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-card bg-white"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 text-xs animate-pulse">searching...</span>
        )}
      </div>

      {result && (
        <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
          <p className="text-sm text-brand-600">
            <span className="font-bold text-brand-900">{result.total} result{result.total !== 1 ? "s" : ""}</span>
            {" "}for "{result.query}"
          </p>
          {result.expanded_terms?.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-brand-500">Also searched:</span>
              {result.expanded_terms.slice(1).map(t => (
                <span key={t} className="text-xs bg-blue-50 text-primary border border-blue-200 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {result?.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {result.items.map(item => (
            <div key={item.id} className="relative">
              {item._score && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="text-xs bg-brand-800 text-white px-2 py-0.5 rounded-full opacity-80">
                    {Math.round(item._score)}% match
                  </span>
                </div>
              )}
              <AuctionCard item={item} />
            </div>
          ))}
        </div>
      )}

      {result?.total === 0 && (
        <div className="text-center py-20 bg-white rounded-card border border-brand-200">
          <div className="text-5xl mb-4">🤷</div>
          <p className="font-bold text-brand-900">No matches found</p>
          <p className="text-sm text-brand-500 mt-1">Try a different keyword or check the spelling.</p>
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-20 bg-white rounded-card border border-brand-200">
          <div className="text-5xl mb-4">🧠</div>
          <p className="font-bold text-brand-900">AI-Powered Fuzzy Search</p>
          <p className="text-sm text-brand-500 mt-1 max-w-sm mx-auto">
            Understands synonyms — "TV" finds televisions, "vacuum" finds Roomba, "laptop" finds MacBook.
          </p>
        </div>
      )}
    </div>
  );
}
