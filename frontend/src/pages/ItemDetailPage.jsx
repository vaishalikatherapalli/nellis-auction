import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAuction, placeBid, getAuctions } from "../api";
import AuctionCard from "../components/AuctionCard";
import StatusBadge from "../components/StatusBadge";

export default function ItemDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [item,    setItem]    = useState(null);
  const [related, setRelated] = useState([]);
  const [bidAmt,  setBidAmt]  = useState("");
  const [placing, setPlacing] = useState(false);
  const [msg,     setMsg]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAuction(Number(id))
      .then(data => {
        setItem(data);
        setBidAmt((data.current_bid + 10).toString());
        return getAuctions({ category: data.category });
      })
      .then(all => setRelated(all.filter(i => i.id !== Number(id)).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleBid = async () => {
    const amount = parseFloat(bidAmt);
    if (!amount || amount <= item.current_bid) {
      setMsg({ type: "error", text: `Bid must be higher than $${item.current_bid}` });
      return;
    }
    setPlacing(true);
    setMsg(null);
    try {
      const updated = await placeBid(item.id, amount);
      setItem(updated);
      setMsg({ type: "success", text: `🎉 Bid of $${amount} placed successfully!` });
      setBidAmt((amount + 10).toString());
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.detail || "Failed to place bid." });
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="h-8 w-48 bg-brand-100 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80 bg-brand-100 rounded-card animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-6 bg-brand-100 rounded animate-pulse" />)}
        </div>
      </div>
    </div>
  );

  if (!item) return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-20 text-center">
      <p className="text-brand-500 text-lg">Item not found.</p>
      <Link to="/auctions" className="text-primary hover:underline mt-3 block">← Back to auctions</Link>
    </div>
  );

  const savings    = item.retail_price - item.current_bid;
  const savingsPct = Math.round((savings / item.retail_price) * 100);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-brand-500 mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>›</span>
        <Link to="/auctions" className="hover:text-primary">Auctions</Link>
        <span>›</span>
        <Link to={`/auctions?category=${encodeURIComponent(item.category)}`} className="hover:text-primary">{item.category}</Link>
        <span>›</span>
        <span className="text-brand-700 truncate max-w-xs">{item.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

        {/* Left: Image */}
        <div>
          <div className="aspect-video bg-brand-100 rounded-card overflow-hidden border border-brand-200">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = "none"; }}
            />
          </div>
          <div className="flex gap-2 mt-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-20 h-14 bg-brand-100 rounded-btn border border-brand-200 overflow-hidden">
                <img src={`${item.image_url?.replace(/\/400\/280/, "/80/56")}?v=${i}`} alt="" className="w-full h-full object-cover" onError={() => {}} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Detail + Bid */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-mono text-brand-500">{item.lot}</span>
              <StatusBadge status={item.pickup_status || item.status} />
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{item.condition}</span>
            </div>
            <h1 className="text-2xl font-black text-brand-900 leading-tight">{item.title}</h1>
            <p className="text-brand-500 text-sm mt-1">{item.category}</p>
          </div>

          {/* Pricing */}
          <div className="bg-brand-50 rounded-card border border-brand-200 p-5">
            <div className="flex items-end gap-4 mb-2">
              <div>
                <p className="text-xs text-brand-400 mb-0.5">Current Bid</p>
                <p className="text-3xl font-black text-brand-900">${item.current_bid.toLocaleString()}</p>
              </div>
              <div className="pb-1">
                <p className="text-xs text-brand-400 line-through">${item.retail_price.toLocaleString()} retail</p>
                {savingsPct > 0 && (
                  <span className="text-xs font-bold text-white bg-cta-gradient px-2 py-0.5 rounded-btn">Save {savingsPct}%</span>
                )}
              </div>
            </div>
            {item.bid_count != null && (
              <p className="text-xs text-brand-500">{item.bid_count} bids · Lot {item.lot}</p>
            )}
          </div>

          {/* Bid form */}
          {item.status === "active" && (
            <div className="bg-white rounded-card border border-brand-200 p-5 shadow-card">
              <p className="text-sm font-bold text-brand-900 mb-3">Place Your Bid</p>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400 font-bold">$</span>
                  <input
                    type="number"
                    value={bidAmt}
                    onChange={e => setBidAmt(e.target.value)}
                    min={item.current_bid + 1}
                    step={5}
                    className="w-full pl-7 pr-4 py-3 border border-brand-300 rounded-btn text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleBid}
                  disabled={placing}
                  className="px-5 py-3 bg-cta-gradient text-white font-bold rounded-btn hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
                >
                  {placing ? "Placing..." : "Bid Now"}
                </button>
              </div>
              {msg && (
                <div className={`text-sm rounded-btn px-4 py-2.5 font-medium ${
                  msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {msg.text}
                </div>
              )}
              <p className="text-xs text-brand-400 mt-2">Minimum bid: ${(item.current_bid + 1).toLocaleString()}</p>
            </div>
          )}

          {item.status === "won" && (
            <div className="bg-green-50 border border-green-200 rounded-card p-4 text-green-800 text-sm font-semibold">
              🎉 You won this auction! <Link to="/pickup" className="underline ml-1">Schedule pickup →</Link>
            </div>
          )}

          {/* Item info */}
          <div className="bg-white rounded-card border border-brand-200 p-5 shadow-card space-y-3">
            <div>
              <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-brand-700 leading-relaxed">{item.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-brand-100">
              {[
                ["Condition",  item.condition],
                ["Location",   item.location],
                ["Lot Number", item.lot],
                ["Category",   item.category],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-brand-400 font-medium">{label}</p>
                  <p className="text-sm font-semibold text-brand-800">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bid History */}
      {item.bid_history?.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-bold text-brand-900 mb-4">Bid History</h2>
          <div className="bg-white rounded-card border border-brand-200 shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-50 border-b border-brand-200">
                  <th className="text-left px-5 py-3 text-xs font-bold text-brand-600 uppercase tracking-wide">Bidder</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-brand-600 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-brand-600 uppercase tracking-wide">Time</th>
                </tr>
              </thead>
              <tbody>
                {item.bid_history.map((b, i) => (
                  <tr key={i} className={`border-b border-brand-100 ${i === 0 ? "bg-blue-50" : ""}`}>
                    <td className="px-5 py-3 font-mono text-brand-700">
                      {i === 0 && <span className="text-primary font-bold mr-1">▲</span>}{b.bidder}
                    </td>
                    <td className="px-5 py-3 font-bold text-brand-900">${b.amount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-brand-400">{b.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-brand-900 mb-4">More in {item.category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map(r => <AuctionCard key={r.id} item={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}
