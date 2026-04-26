import StatusBadge from "./StatusBadge";

const CONDITION_COLOR = {
  "Like New": "text-green-600",
  "Good":     "text-blue-600",
  "Fair":     "text-amber-600",
  "Poor":     "text-primary",
};

const CATEGORY_EMOJI = {
  Electronics: "🖥️", Appliances: "🏠", Gaming: "🎮", Outdoor: "🔥",
  Tools: "🔧", Sports: "🚴", Furniture: "🪑", Default: "📦",
};

export default function ItemCard({ item }) {
  const savings    = item.retail_price - item.my_bid;
  const savingsPct = Math.round((savings / item.retail_price) * 100);
  const emoji      = CATEGORY_EMOJI[item.category] || CATEGORY_EMOJI.Default;

  return (
    <div className="bg-white rounded-cta shadow-itemCard hover:shadow-paper transition-shadow flex flex-col gap-3 p-4 border border-brand-300">

      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <span className="text-xs text-brand-500 font-mono">{item.lot}</span>
        </div>
        <StatusBadge status={item.pickup_status || item.status} />
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-brand-900 leading-snug">{item.title}</h3>

      {/* Description */}
      <p className="text-xs text-brand-600 line-clamp-2">{item.description}</p>

      {/* Pricing */}
      <div className="flex items-end justify-between mt-auto pt-2 border-t border-brand-200">
        <div>
          <p className="text-xs text-brand-400 line-through">${item.retail_price.toLocaleString()}</p>
          <p className="text-lg font-black text-brand-900">${item.my_bid.toLocaleString()}</p>
        </div>
        {item.status !== "active" && item.status !== "lost" && (
          <span className="text-xs font-bold text-white bg-cta-gradient px-2.5 py-1 rounded-cta">
            Save {savingsPct}%
          </span>
        )}
        {item.status === "active" && (
          <div className="text-right">
            <p className="text-xs text-brand-500">Current</p>
            <p className="text-sm font-bold text-blue-600">${item.current_bid.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-brand-500">
        <span className={`font-semibold ${CONDITION_COLOR[item.condition] || ""}`}>{item.condition}</span>
        {item.pickup_date && <span>Pickup: {item.pickup_date}</span>}
        {item.status === "active" && <span>My max: ${item.my_bid.toLocaleString()}</span>}
      </div>
    </div>
  );
}
