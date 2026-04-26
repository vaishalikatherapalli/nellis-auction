import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuctions, getStats } from "../api";
import AuctionCard from "../components/AuctionCard";

const CATEGORIES = [
  { name: "Electronics",       emoji: "💻", q: "Electronics" },
  { name: "Home & Kitchen",    emoji: "🏠", q: "Home & Kitchen" },
  { name: "Furniture",         emoji: "🪑", q: "Furniture" },
  { name: "Sports & Outdoors", emoji: "🏃", q: "Sports & Outdoors" },
  { name: "Gaming",            emoji: "🎮", q: "Gaming" },
  { name: "Tools",             emoji: "🔧", q: "Tools" },
];

const STEPS = [
  { icon: "🔍", title: "Browse & Search", desc: "Explore thousands of retail return lots across every category. Use AI-powered search to find exactly what you need." },
  { icon: "⚡", title: "Place Your Bid",  desc: "Bid on items you love. Get outbid? You'll see live updates. Win at a fraction of the retail price." },
  { icon: "📦", title: "Pickup or Ship", desc: "Won something? Schedule a warehouse pickup at your convenience, or arrange shipping directly to your door." },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch]     = useState("");
  const [featured, setFeatured] = useState([]);
  const [stats, setStats]       = useState(null);

  useEffect(() => {
    getAuctions({ status: "active" }).then(items => setFeatured(items.slice(0, 4))).catch(() => {});
    getStats().then(setStats).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    else navigate("/auctions");
  };

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-hero-gradient text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            🎉 New lots added daily
          </span>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
            Bid Smarter.<br className="hidden sm:block" /> Save More.
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
            Shop retail return lots — laptops, appliances, furniture, and more — at up to 80% off retail price.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-8">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search "MacBook", "sofa", "vacuum"...'
              className="flex-1 px-5 py-3.5 rounded-btn text-brand-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button type="submit" className="px-6 py-3.5 bg-cta-gradient text-white font-bold rounded-btn hover:opacity-90 transition-opacity shrink-0">
              Search
            </button>
          </form>

          <div className="flex items-center justify-center gap-8 flex-wrap text-sm">
            {[
              ["📦", stats ? `${stats.total_items}+ active lots` : "18+ active lots"],
              ["💰", stats ? `$${(stats.total_saved || 4200).toLocaleString()} saved by buyers` : "$4,200+ saved"],
              ["⭐", "4.8 buyer rating"],
            ].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-blue-100">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Auctions ── */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-brand-900">Ending Soon</h2>
            <p className="text-brand-500 text-sm mt-1">Don't miss these — auctions closing in the next 48 hours</p>
          </div>
          <Link to="/auctions" className="text-sm font-semibold text-primary hover:underline">
            View all →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map(item => <AuctionCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 bg-brand-100 rounded-card animate-pulse" />
            ))}
          </div>
        )}
      </section>

      {/* ── Categories ── */}
      <section className="bg-brand-50 border-y border-brand-200 py-14 px-4">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-2xl font-black text-brand-900 text-center mb-2">Browse by Category</h2>
          <p className="text-brand-500 text-sm text-center mb-8">Find exactly what you're looking for</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(({ name, emoji, q }) => (
              <Link
                key={name}
                to={`/auctions?category=${encodeURIComponent(q)}`}
                className="flex flex-col items-center gap-3 bg-white rounded-card p-5 border border-brand-200 hover:border-primary hover:shadow-elevated transition-all group"
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-semibold text-brand-700 group-hover:text-primary transition-colors text-center">{name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl font-black text-brand-900 text-center mb-2">How BidFlow Works</h2>
        <p className="text-brand-500 text-sm text-center mb-10">Three steps to your next great deal</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STEPS.map(({ icon, title, desc }, i) => (
            <div key={title} className="text-center">
              <div className="w-14 h-14 rounded-card bg-blue-50 flex items-center justify-center text-2xl mx-auto mb-4 border border-blue-100">
                {icon}
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs font-bold text-primary bg-blue-50 w-5 h-5 rounded-full flex items-center justify-center">{i + 1}</span>
                <h3 className="font-bold text-brand-900">{title}</h3>
              </div>
              <p className="text-sm text-brand-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-hero-gradient py-14 px-4 text-center text-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-3">Ready to start saving?</h2>
          <p className="text-blue-100 mb-7">Join thousands of buyers finding incredible deals every day.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/auctions"
              className="px-7 py-3.5 bg-cta-gradient text-white font-bold rounded-btn hover:opacity-90 transition-opacity shadow-elevated"
            >
              Browse Auctions
            </Link>
            <Link
              to="/about"
              className="px-7 py-3.5 bg-white/10 border border-white/30 text-white font-semibold rounded-btn hover:bg-white/20 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
