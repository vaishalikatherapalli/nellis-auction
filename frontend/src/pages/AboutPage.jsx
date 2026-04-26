import { Link } from "react-router-dom";

const TECH = [
  { label: "Frontend", items: ["React 19", "Vite", "Tailwind CSS", "React Router", "Axios"] },
  { label: "Backend",  items: ["FastAPI", "Python", "Pydantic v2", "RapidFuzz (AI search)", "SQLite-ready"] },
  { label: "DevOps",   items: ["Vercel (frontend)", "Render (backend)", "GitHub CI/CD", "Environment variables"] },
];

const FEATURES = [
  { icon: "🧠", title: "AI-Powered Search",      desc: "Fuzzy search with synonym expansion — 'TV' finds televisions, 'vacuum' finds Roomba." },
  { icon: "🚗", title: "License Plate Check-In", desc: "Camera-based plate recognition for frictionless warehouse pickup. Falls back to QR scan." },
  { icon: "📦", title: "Route Optimizer",         desc: "Sorts pickup items by warehouse row/shelf for the fastest possible walking path." },
  { icon: "↩️", title: "Returns Management",     desc: "Multi-step return request flow with reason selection, refund tracking, and status updates." },
  { icon: "📅", title: "Pickup Scheduler",        desc: "Select available time slots, warehouse location, and items in a single flow." },
  { icon: "💰", title: "Savings Tracker",         desc: "See total savings vs. retail price across all won auctions in real time." },
];

export default function AboutPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">

      {/* Hero */}
      <div className="bg-hero-gradient text-white rounded-card p-10 mb-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-btn bg-white/20 flex items-center justify-center">
            <span className="text-white font-black">B</span>
          </div>
          <span className="text-2xl font-black">BidFlow</span>
        </div>
        <h1 className="text-3xl font-black mb-3">Smart Auction Platform</h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
          A full-stack auction platform built for retail returns and liquidations — featuring AI search, license plate check-in, route optimization, and a complete buyer dashboard.
        </p>
        <div className="mt-6 inline-block bg-white/20 border border-white/30 rounded-full px-4 py-2 text-sm font-semibold">
          🎓 Portfolio Project · Full-Stack Demonstration
        </div>
      </div>

      {/* Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-black text-brand-900 text-center mb-2">Key Features</h2>
        <p className="text-brand-500 text-sm text-center mb-8">Designed to showcase real-world auction platform capabilities</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-card border border-brand-200 shadow-card p-5">
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-bold text-brand-900 mb-2">{title}</h3>
              <p className="text-sm text-brand-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="mb-12">
        <h2 className="text-2xl font-black text-brand-900 text-center mb-8">Tech Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TECH.map(({ label, items }) => (
            <div key={label} className="bg-white rounded-card border border-brand-200 shadow-card p-5">
              <h3 className="font-bold text-brand-900 mb-3 text-sm uppercase tracking-wide">{label}</h3>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-brand-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Contact / disclaimer */}
      <div className="bg-brand-50 rounded-card border border-brand-200 p-8 text-center">
        <p className="font-bold text-brand-900 mb-2">Built as a portfolio project</p>
        <p className="text-sm text-brand-500 max-w-lg mx-auto mb-6">
          BidFlow demonstrates modern full-stack development practices — responsive UI, REST API design, AI-powered search, and operational workflows like pickup routing and returns management.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/auctions" className="px-5 py-2.5 bg-hero-gradient text-white font-bold rounded-btn hover:opacity-90 transition-opacity text-sm">
            Explore the App
          </Link>
          <a href="https://github.com/vaishalikatherapalli/nellis-auction" target="_blank" rel="noopener noreferrer"
            className="px-5 py-2.5 border border-brand-300 text-brand-700 font-semibold rounded-btn hover:bg-brand-100 transition-colors text-sm">
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
