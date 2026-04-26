import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: "/auctions", label: "Browse Auctions" },
    { to: "/dashboard", label: "My Bids" },
    { to: "/returns", label: "Returns" },
    { to: "/pickup", label: "Pickup" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="bg-white shadow-header sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 mr-2">
            <div className="w-8 h-8 rounded-btn bg-hero-gradient flex items-center justify-center">
              <span className="text-white font-black text-sm">B</span>
            </div>
            <span className="font-extrabold text-brand-900 text-lg tracking-tight">
              Bid<span className="text-primary">Flow</span>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400 text-sm">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                type="text"
                placeholder="Search auctions..."
                className="w-full pl-9 pr-4 py-2 border border-brand-300 rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-2 text-sm font-medium rounded-btn transition-colors ${
                  pathname.startsWith(to)
                    ? "text-primary bg-blue-50"
                    : "text-brand-600 hover:text-brand-900 hover:bg-brand-100"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link to="/about" className="text-sm text-brand-500 hover:text-brand-700 px-2 py-2">About</Link>
            <Link
              to="/auctions"
              className="px-4 py-2 bg-cta-gradient text-white text-sm font-semibold rounded-btn hover:opacity-90 transition-opacity"
            >
              Browse Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden ml-auto p-2 text-brand-600 hover:text-brand-900"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-brand-200 py-3 space-y-1">
            <form onSubmit={handleSearch} className="px-2 mb-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400 text-sm">🔍</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search auctions..."
                  className="w-full pl-9 pr-4 py-2 border border-brand-300 rounded-btn text-sm focus:outline-none"
                />
              </div>
            </form>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 text-sm font-medium rounded-btn transition-colors ${
                  pathname.startsWith(to) ? "text-primary bg-blue-50" : "text-brand-700 hover:bg-brand-100"
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="px-2 pt-2">
              <Link
                to="/auctions"
                onClick={() => setMenuOpen(false)}
                className="block text-center py-2.5 bg-cta-gradient text-white text-sm font-semibold rounded-btn"
              >
                Browse Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
