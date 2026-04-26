import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-400 mt-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-btn bg-hero-gradient flex items-center justify-center">
                <span className="text-white font-black text-xs">B</span>
              </div>
              <span className="text-white font-bold text-base">BidFlow</span>
            </div>
            <p className="text-sm leading-relaxed">
              Smart auction platform for retail returns & liquidations. Save up to 80% off retail.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-white text-sm font-semibold mb-3">Platform</p>
            <div className="space-y-2">
              {[
                ["/auctions",  "Browse Auctions"],
                ["/dashboard", "My Bids"],
                ["/returns",   "Returns"],
                ["/pickup",    "Pickup Scheduler"],
                ["/search",    "Search"],
              ].map(([to, label]) => (
                <Link key={to} to={to} className="block text-sm hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="text-white text-sm font-semibold mb-3">Company</p>
            <div className="space-y-2">
              {[
                ["/about", "About BidFlow"],
                ["/about", "How It Works"],
                ["/about", "Contact"],
              ].map(([to, label]) => (
                <Link key={label} to={to} className="block text-sm hover:text-white transition-colors">{label}</Link>
              ))}
              <p className="text-xs text-brand-600 pt-1">hello@bidflow.demo</p>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">© 2026 BidFlow. All rights reserved.</p>
          <p className="text-xs text-brand-600 text-center">
            Portfolio project demonstrating modern full-stack auction platform design.
          </p>
        </div>
      </div>
    </footer>
  );
}
