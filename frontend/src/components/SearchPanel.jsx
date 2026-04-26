import { useState, useCallback } from "react";
import { searchItems } from "../api";
import ItemCard from "./ItemCard";

function useDebounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function SearchPanel() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(
    useDebounce(async (q) => {
      if (!q.trim()) { setResult(null); return; }
      setLoading(true);
      try {
        const data = await searchItems(q);
        setResult(data);
      } finally {
        setLoading(false);
      }
    }, 350),
    []
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    doSearch(e.target.value);
  };

  return (
    <div className="space-y-5">
      {/* Search input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500 text-lg">🔍</span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder='Try "laptop", "TV", "vacuum", "tools"...'
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-brand-300 rounded-cta text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          autoFocus
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-500 text-xs animate-pulse">
            searching...
          </span>
        )}
      </div>

      {/* Query info */}
      {result && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-brand-600">
            <span className="font-medium text-brand-700">{result.total} result{result.total !== 1 ? "s" : ""}</span>
            {" "}for "{result.query}"
          </p>
          {result.expanded_terms?.length > 1 && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-brand-500">Also searched:</span>
              {result.expanded_terms.slice(1).map(t => (
                <span key={t} className="text-xs bg-orange-50 text-primary border border-orange-100 px-2 py-0.5 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {result?.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.items.map(item => (
            <div key={item.id} className="relative">
              {item._score && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="text-xs bg-slate-800 text-white px-2 py-0.5 rounded-full opacity-70">
                    {Math.round(item._score)}% match
                  </span>
                </div>
              )}
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      )}

      {result?.total === 0 && (
        <div className="text-center py-16 bg-white rounded-cta border border-brand-300 text-brand-500">
          <div className="text-4xl mb-3">🤷</div>
          <p className="font-medium text-brand-700">No matches found</p>
          <p className="text-sm mt-1">Try a different keyword or check the spelling.</p>
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-16 bg-white rounded-cta border border-brand-300 text-brand-500">
          <div className="text-4xl mb-3">🔎</div>
          <p className="font-medium text-brand-700">AI-powered fuzzy search</p>
          <p className="text-sm mt-1">Searches across title, description, category, and lot number.<br/>Understands synonyms — "TV" finds televisions, "vacuum" finds Roomba.</p>
        </div>
      )}
    </div>
  );
}
