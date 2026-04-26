import { Link } from "react-router-dom";

const CONDITION_COLOR = {
  "Like New": "bg-green-100 text-green-700",
  "Good":     "bg-blue-100 text-blue-700",
  "Fair":     "bg-amber-100 text-amber-700",
  "Poor":     "bg-red-100 text-red-700",
};

const CATEGORY_EMOJI = {
  "Electronics":    "💻",
  "Home & Kitchen": "🏠",
  "Furniture":      "🪑",
  "Sports & Outdoors": "🏃",
  "Gaming":         "🎮",
  "Tools":          "🔧",
  "Fashion":        "👕",
  "Default":        "📦",
};

function timeColor(end) {
  if (!end) return "bg-brand-700 text-white";
  const h = (new Date(end) - Date.now()) / 36e5;
  if (h < 24) return "bg-red-600 text-white";
  if (h < 48) return "bg-amber-500 text-white";
  return "bg-brand-700 text-white";
}

function timeLabel(end) {
  if (!end) return "Ended";
  const ms = new Date(end) - Date.now();
  if (ms <= 0) return "Ended";
  const h = Math.floor(ms / 36e5);
  if (h < 1) return `${Math.floor(ms / 60000)}m left`;
  if (h < 24) return `${h}h left`;
  return `${Math.floor(h / 24)}d ${h % 24}h left`;
}

export default function AuctionCard({ item }) {
  const savings    = item.retail_price - item.current_bid;
  const savingsPct = Math.round((savings / item.retail_price) * 100);
  const emoji      = CATEGORY_EMOJI[item.category] || CATEGORY_EMOJI.Default;

  return (
    <Link to={`/auctions/${item.id}`} className="group block bg-white rounded-card shadow-card hover:shadow-elevated transition-shadow border border-brand-200 overflow-hidden">

      {/* Image */}
      <div className="relative h-44 bg-brand-100 overflow-hidden">
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
        />
        <div className="hidden absolute inset-0 items-center justify-center text-4xl bg-brand-100">
          {emoji}
        </div>

        {/* Time badge */}
        {item.status === "active" && (
          <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-btn ${timeColor(item.auction_end)}`}>
            ⏱ {timeLabel(item.auction_end)}
          </span>
        )}

        {/* Condition badge */}
        <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-btn ${CONDITION_COLOR[item.condition] || "bg-brand-200 text-brand-700"}`}>
          {item.condition}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2">
        <p className="text-xs text-brand-500 font-mono">{item.lot} · {item.category}</p>
        <h3 className="text-sm font-bold text-brand-900 line-clamp-2 leading-snug">{item.title}</h3>

        <div className="flex items-end justify-between mt-auto pt-2 border-t border-brand-100">
          <div>
            <p className="text-xs text-brand-400 line-through">${item.retail_price.toLocaleString()}</p>
            <p className="text-lg font-black text-brand-900">${item.current_bid.toLocaleString()}</p>
          </div>
          <div className="text-right">
            {savingsPct > 0 && (
              <span className="inline-block text-xs font-bold text-white bg-cta-gradient px-2 py-1 rounded-btn mb-1">
                Save {savingsPct}%
              </span>
            )}
            {item.bid_count != null && (
              <p className="text-xs text-brand-400">{item.bid_count} bids</p>
            )}
          </div>
        </div>

        {item.status === "active" && (
          <button className="w-full py-2 bg-hero-gradient text-white text-sm font-semibold rounded-btn hover:opacity-90 transition-opacity mt-1">
            Place Bid →
          </button>
        )}
        {item.status !== "active" && (
          <div className={`w-full py-2 text-center text-xs font-semibold rounded-btn mt-1 ${
            item.status === "won" ? "bg-green-50 text-green-700 border border-green-200" :
            item.status === "picked_up" ? "bg-blue-50 text-blue-700 border border-blue-200" :
            "bg-brand-100 text-brand-500 border border-brand-200"
          }`}>
            {item.status === "won" ? "✓ You Won" : item.status === "picked_up" ? "✓ Picked Up" : "Auction Ended"}
          </div>
        )}
      </div>
    </Link>
  );
}
